import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

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
  const db = scoped(prisma, req.user?.tenantId);
  const sessao = await db.sessao.create({ data: req.body });
  res.status(201).json(sessao);
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const sessao = await db.sessao.update({ where: { id: req.params.id }, data: req.body });
  res.json(sessao);
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.sessao.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;