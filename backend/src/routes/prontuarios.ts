import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { pacienteId } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = pacienteId;
  const prontuarios = await db.prontuario.findMany({ where, include: { paciente: true, autor: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data: prontuarios, total: prontuarios.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const prontuario = await db.prontuario.findUnique({ where: { id: req.params.id }, include: { paciente: true, autor: true } });
  if (!prontuario) return res.status(404).json({ error: 'Prontuário não encontrado' });
  res.json(prontuario);
});

router.post('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const prontuario = await db.prontuario.create({ data: req.body });
  res.status(201).json(prontuario);
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const prontuario = await db.prontuario.update({ where: { id: req.params.id }, data: req.body });
  res.json(prontuario);
});

export default router;