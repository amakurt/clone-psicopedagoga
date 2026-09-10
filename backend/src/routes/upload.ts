import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, authorize } from '../middleware';

const router = Router();
router.use(authenticate);

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitos uploads enviados. Aguarde alguns minutos.' },
});

const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.csv'
]);

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv'
]);

// Configure multer storage
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error('Extensão de arquivo não permitida'), '');
    }
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// File filter (MIME type + Extension cross-validation)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error('Extensão de arquivo não permitida'));
  }
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo MIME de arquivo não permitido'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Upload single file
router.post('/', uploadLimiter, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const fileUrl = `/api/uploads/${req.file.filename}`;
  
  res.json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    url: fileUrl
  });
});

// Upload multiple files (max 5 files per batch)
router.post('/multiple', uploadLimiter, upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const files = (req.files as Express.Multer.File[]).map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    url: `/api/uploads/${file.filename}`
  }));

  res.json({ files });
});

// Serve uploaded files securely (authenticated & verified)
router.get('/:filename', async (req, res) => {
  const filename = path.basename(req.params.filename as string);
  const ext = path.extname(filename).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return res.status(403).json({ error: 'Tipo de arquivo não permitido' });
  }

  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado' });
  }

  const user = req.user;
  const db = scoped(prisma, user?.tenantId);

  // Se o usuário for RESPONSAVEL, garantir que o documento pertença a um de seus filhos
  if (user?.role === 'RESPONSAVEL') {
    let responsible = await db.responsible.findFirst({ where: { userId: user.id } });
    if (!responsible && user.email) {
      responsible = await db.responsible.findFirst({ where: { email: user.email } });
    }
    if (responsible) {
      const doc = await db.document.findFirst({
        where: {
          fileUrl: { contains: filename },
          paciente: { responsibleId: responsible.id }
        }
      });
      // Permite se encontrou o documento associado ao filho ou se o usuário foi o autor do upload
      if (!doc) {
        const uploadedDoc = await db.document.findFirst({
          where: { fileUrl: { contains: filename }, autorId: user.id }
        });
        if (!uploadedDoc) {
          return res.status(403).json({ error: 'Acesso não autorizado a este arquivo' });
        }
      }
    }
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");

  // Envia o arquivo de forma segura
  res.sendFile(filePath);
});

// Delete uploaded file (only clinic staff)
router.delete('/:filename', authorize('GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA'), async (req, res) => {
  const filename = path.basename(req.params.filename as string);
  const filePath = path.join(uploadsDir, filename);
  
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      res.json({ message: 'Arquivo excluído com sucesso' });
    } else {
      res.status(404).json({ error: 'Arquivo não encontrado' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao excluir arquivo' });
  }
});

export default router;

