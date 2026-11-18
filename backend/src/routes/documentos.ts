import { Router } from 'express';
import { z } from 'zod';
import path from 'path';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, authorize, validate } from '../middleware';
import { parseDocumentFile, resolveUploadFilePath } from '../lib/document-parser';

const router = Router();
router.use(authenticate);
router.use(authorize('GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA'));

const documentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  pacienteId: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  status: z.string().optional(),
  category: z.string().optional(),
  uploadedBy: z.string().optional(),
  fileUrl: z.string().optional().nullable(),
  isShared: z.boolean().optional(),
  signedAt: z.string().optional().nullable(),
  guardianSignedAt: z.string().optional().nullable(),
  autorId: z.string().optional().nullable(),
});

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { search, category, status } = req.query;
  const where: any = {};
  if (search) where.name = { contains: search };
  if (category) where.category = category;
  if (status) where.status = status;
  const documentos = await db.document.findMany({ where, orderBy: { createdAt: 'desc' }, include: { paciente: true, autor: true } });
  res.json({ data: documentos, total: documentos.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  let document = await db.document.findUnique({ where: { id: req.params.id }, include: { paciente: true, autor: true } });
  if (!document) return res.status(404).json({ error: 'Documento não encontrado' });

  // Auto-extração para documentos legados ou arquivos .doc/.docx sem content
  if (!document.content && document.fileUrl) {
    const ext = path.extname(document.fileUrl.split('?')[0]).toLowerCase();
    if (['.doc', '.docx', '.txt', '.csv'].includes(ext)) {
      try {
        const filePath = resolveUploadFilePath(document.fileUrl);
        if (filePath) {
          const parsed = await parseDocumentFile(filePath);
          if (parsed.html && parsed.html.trim()) {
            document = await db.document.update({
              where: { id: document.id },
              data: {
                content: parsed.html,
                description: document.description || parsed.rawText.substring(0, 250)
              },
              include: { paciente: true, autor: true }
            });
          }
        }
      } catch (err) {
        console.warn('Erro ao auto-extrair arquivo legados:', err);
      }
    }
  }

  res.json(document);
});

router.post('/', validate(documentSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const data = { ...req.body };

  // Se não foi fornecido content mas tem fileUrl de arquivo doc/docx
  if (!data.content && data.fileUrl) {
    const ext = path.extname(data.fileUrl.split('?')[0]).toLowerCase();
    if (['.doc', '.docx', '.txt', '.csv'].includes(ext)) {
      try {
        const filePath = resolveUploadFilePath(data.fileUrl);
        if (filePath) {
          const parsed = await parseDocumentFile(filePath);
          if (parsed.html) {
            data.content = parsed.html;
            if (!data.description && parsed.rawText) {
              data.description = parsed.rawText.substring(0, 250);
            }
          }
        }
      } catch (err) {
        console.warn('Erro ao auto-extrair arquivo no create:', err);
      }
    }
  }

  const document = await db.document.create({ data });
  res.status(201).json(document);
});

// Endpoint explícito para forçar extração de conteúdo de arquivo anexado
router.post('/:id/extract-content', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  let document = await db.document.findUnique({ where: { id: req.params.id } });
  if (!document) return res.status(404).json({ error: 'Documento não encontrado' });
  if (!document.fileUrl) return res.status(400).json({ error: 'Documento não possui arquivo anexo' });

  const filePath = resolveUploadFilePath(document.fileUrl);
  if (!filePath) return res.status(404).json({ error: 'Arquivo físico não encontrado no servidor' });

  try {
    const parsed = await parseDocumentFile(filePath);
    if (!parsed.html || !parsed.html.trim()) {
      return res.status(400).json({ error: 'Não foi possível extrair o texto do arquivo anexado.' });
    }

    document = await db.document.update({
      where: { id: document.id },
      data: {
        content: parsed.html,
        description: document.description || parsed.rawText.substring(0, 250)
      },
      include: { paciente: true, autor: true }
    });

    res.json({ success: true, document, content: parsed.html });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao processar arquivo: ' + err.message });
  }
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const document = await db.document.update({ where: { id: req.params.id }, data: req.body });
  res.json(document);
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.document.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// Staff aprova ou recusa documento enviado pelo portal da família
router.patch('/:id/aprovar', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { id } = req.params;
  const { aprovar, feedback } = req.body;

  if (typeof aprovar !== 'boolean') {
    return res.status(400).json({ error: 'Campo "aprovar" (boolean) é obrigatório' });
  }

  const document = await db.document.findUnique({ where: { id } });
  if (!document) return res.status(404).json({ error: 'Documento não encontrado' });

  const updated = await db.document.update({
    where: { id },
    data: {
      status: aprovar ? 'APROVADO' : 'RECUSADO',
      approvalFeedback: aprovar ? null : (feedback || null),
    },
  });

  // Notifica o responsável (autor do envio) sobre a decisão
  if (document.autorId) {
    const responsible = await db.responsible.findFirst({ where: { userId: document.autorId } });
    if (responsible) {
      const patient = document.pacienteId
        ? await db.paciente.findUnique({ where: { id: document.pacienteId } })
        : null;
      await db.notification.create({
        data: {
          userId: document.autorId,
          title: aprovar ? 'Documento aprovado' : 'Documento recusado',
          message: aprovar
            ? `Seu documento "${document.name}"${patient ? ` de ${patient.name}` : ''} foi aprovado`
            : `Seu documento "${document.name}"${patient ? ` de ${patient.name}` : ''} foi recusado${feedback ? `: ${feedback}` : ''}`,
          type: 'document',
        },
      });
    }
  }

  res.json(updated);
});

export default router;
