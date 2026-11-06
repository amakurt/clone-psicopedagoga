import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, authorize } from '../middleware';

const router = Router();
router.use(authenticate);
router.use(authorize('GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA'));

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { pacienteId, status } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = pacienteId;
  if (status) where.status = status;
  const sessoes = await db.sessao.findMany({ where, include: { paciente: true, psicopedagogo: true }, orderBy: { date: 'desc' } });
  res.json({ data: sessoes, total: sessoes.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const sessao = await db.sessao.findUnique({ where: { id: req.params.id }, include: { paciente: true, psicopedagogo: true } });
  if (!sessao) return res.status(404).json({ error: 'Sessão não encontrada' });
  res.json(sessao);
});

router.post('/', async (req, res) => {
  try {
    const db = scoped(prisma, req.user?.tenantId);
    const data = { ...req.body };
    if (data.date && typeof data.date === 'string') {
      const parsedDate = new Date(data.date);
      data.date = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    } else if (!data.date) {
      data.date = new Date();
    }
    if (!data.psicopedagogoId || data.psicopedagogoId === 'system') {
      data.psicopedagogoId = req.user?.id;
    }
    const sessao = await db.sessao.create({ data });
    res.status(201).json(sessao);
  } catch (err: any) {
    console.error('[ERRO CRIAR SESSAO]:', err);
    res.status(400).json({ error: err.message || 'Erro ao salvar sessão' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = scoped(prisma, req.user?.tenantId);
    const data = { ...req.body };
    if (data.date && typeof data.date === 'string') {
      const parsedDate = new Date(data.date);
      data.date = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    }
    const sessao = await db.sessao.update({ where: { id: req.params.id }, data });
    res.json(sessao);
  } catch (err: any) {
    console.error('[ERRO ATUALIZAR SESSAO]:', err);
    res.status(400).json({ error: err.message || 'Erro ao atualizar sessão' });
  }
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.sessao.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;