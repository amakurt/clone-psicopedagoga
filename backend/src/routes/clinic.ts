import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware';

const router = Router();

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage for clinic logo files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req: any, file, cb) => {
    const tenantId = req.user?.tenantId || 'clinic';
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const filename = `logo-${tenantId}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const uploadLogo = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato inválido. Use PNG, JPG, JPEG, WebP ou SVG.'));
    }
  }
});

// GET /api/clinic - Obter dados cadastrais da clínica do usuário atual
router.get('/', authenticate, async (req: any, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant não identificado na sessão.' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        status: true,
        logoUrl: true,
        colors: true,
        phone: true,
        email: true,
        cnpj: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Clínica não encontrada.' });
    }

    let parsedAddress = null;
    if (tenant.address) {
      try {
        parsedAddress = JSON.parse(tenant.address);
      } catch {
        parsedAddress = tenant.address;
      }
    }

    return res.json({
      ...tenant,
      address: parsedAddress
    });
  } catch (err: any) {
    console.error('Erro ao buscar dados da clínica:', err);
    return res.status(500).json({ error: 'Erro ao buscar dados da clínica.' });
  }
});

// PUT /api/clinic - Atualizar dados da clínica (somente GESTOR ou ADMIN)
router.put('/', authenticate, authorize('GESTOR', 'ADMIN'), async (req: any, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant não identificado.' });
    }

    const { name, phone, email, cnpj, address, colors, logoUrl } = req.body;

    let addressStr: string | null = null;
    if (address) {
      addressStr = typeof address === 'object' ? JSON.stringify(address) : String(address);
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (email !== undefined) updateData.email = email ? email.trim() : null;
    if (cnpj !== undefined) updateData.cnpj = cnpj ? cnpj.trim() : null;
    if (address !== undefined) updateData.address = addressStr;
    if (colors !== undefined) updateData.colors = colors;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData
    });

    let parsedAddress = null;
    if (updatedTenant.address) {
      try {
        parsedAddress = JSON.parse(updatedTenant.address);
      } catch {
        parsedAddress = updatedTenant.address;
      }
    }

    return res.json({
      message: 'Dados da clínica atualizados com sucesso!',
      tenant: {
        ...updatedTenant,
        address: parsedAddress
      }
    });
  } catch (err: any) {
    console.error('Erro ao atualizar dados da clínica:', err);
    return res.status(500).json({ error: 'Erro ao atualizar dados da clínica.' });
  }
});

// POST /api/clinic/logo - Upload de Logomarca (Multipart ou Base64)
router.post('/logo', authenticate, authorize('GESTOR', 'ADMIN'), uploadLogo.single('file'), async (req: any, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant não identificado.' });
    }

    let finalLogoUrl: string | null = null;

    // Cenário 1: Arquivo enviado via Multipart (multer)
    if (req.file) {
      finalLogoUrl = `/api/uploads/public/${req.file.filename}`;
    }
    // Cenário 2: Base64 data URL enviada no body JSON (ex: do Cropper)
    else if (req.body?.logoBase64) {
      const { logoBase64 } = req.body;
      const matches = logoBase64.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Formato de imagem Base64 inválido.' });
      }

      const ext = matches[1].replace('+xml', '') === 'svg' ? '.svg' : `.${matches[1]}`;
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `logo-${tenantId}-${Date.now()}${ext.includes('.') ? ext : '.' + ext}`;
      const filePath = path.join(uploadsDir, filename);

      await fs.promises.writeFile(filePath, buffer);
      finalLogoUrl = `/api/uploads/public/${filename}`;
    } else {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    // Atualiza logoUrl no banco
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { logoUrl: finalLogoUrl }
    });

    return res.json({
      message: 'Logomarca atualizada com sucesso!',
      logoUrl: finalLogoUrl,
      tenant: updatedTenant
    });
  } catch (err: any) {
    console.error('Erro ao salvar logomarca:', err);
    return res.status(500).json({ error: 'Erro ao salvar logomarca.' });
  }
});

// DELETE /api/clinic/logo - Remover Logomarca da Clínica
router.delete('/logo', authenticate, authorize('GESTOR', 'ADMIN'), async (req: any, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant não identificado.' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { logoUrl: true }
    });

    if (tenant?.logoUrl && tenant.logoUrl.startsWith('/api/uploads/public/')) {
      const filename = path.basename(tenant.logoUrl);
      const filePath = path.join(uploadsDir, filename);
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (e) {
        console.warn('Aviso ao excluir arquivo de logo antigo:', e);
      }
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { logoUrl: null }
    });

    return res.json({
      message: 'Logomarca removida com sucesso!',
      tenant: updatedTenant
    });
  } catch (err: any) {
    console.error('Erro ao remover logomarca:', err);
    return res.status(500).json({ error: 'Erro ao remover logomarca.' });
  }
});

export default router;
