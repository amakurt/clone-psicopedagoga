import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, authorize } from '../middleware';

const router = Router();
router.use(authenticate);
router.use(authorize('GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA'));

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { pacienteId } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = pacienteId;
  const laudos = await db.laudo.findMany({ where, include: { paciente: true, autor: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data: laudos, total: laudos.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const laudo = await db.laudo.findUnique({ where: { id: req.params.id }, include: { paciente: true, autor: true } });
  if (!laudo) return res.status(404).json({ error: 'Laudo não encontrado' });
  res.json(laudo);
});

router.post('/', async (req, res) => {
  try {
    const db = scoped(prisma, req.user?.tenantId);
    const { pacienteId, titulo, content, type, status, signatureImage, signedAt } = req.body;

    if (!pacienteId || !titulo || !content) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes (paciente, título ou conteúdo).' });
    }

    const autorId = req.user?.id;
    if (!autorId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const laudo = await db.laudo.create({
      data: {
        pacienteId,
        autorId,
        titulo,
        content,
        type: type || 'LAUDO',
        status: status || 'RASCUNHO',
        signatureImage: signatureImage || null,
        signedAt: signedAt ? new Date(signedAt) : (status === 'ASSINADO' ? new Date() : null),
      },
      include: { paciente: true, autor: true }
    });
    res.status(201).json(laudo);
  } catch (error: any) {
    console.error('Erro ao criar laudo:', error);
    res.status(500).json({ error: error?.message || 'Erro ao criar documento clínico.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = scoped(prisma, req.user?.tenantId);
    const { pacienteId, titulo, content, type, status, signatureImage, signedAt } = req.body;

    const updateData: any = {};
    if (pacienteId !== undefined) updateData.pacienteId = pacienteId;
    if (titulo !== undefined) updateData.titulo = titulo;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (signatureImage !== undefined) updateData.signatureImage = signatureImage;
    if (signedAt !== undefined) {
      updateData.signedAt = signedAt ? new Date(signedAt) : null;
    } else if (status === 'ASSINADO') {
      updateData.signedAt = new Date();
    }

    const laudo = await db.laudo.update({
      where: { id: req.params.id },
      data: updateData,
      include: { paciente: true, autor: true }
    });
    res.json(laudo);
  } catch (error: any) {
    console.error('Erro ao atualizar laudo:', error);
    res.status(500).json({ error: error?.message || 'Erro ao atualizar documento clínico.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = scoped(prisma, req.user?.tenantId);
    await db.laudo.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao excluir laudo:', error);
    res.status(500).json({ error: error?.message || 'Erro ao excluir laudo.' });
  }
});

export default router;