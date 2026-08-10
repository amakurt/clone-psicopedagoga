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
  const anamneses = await db.anamnese.findMany({ where, include: { paciente: true, autor: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data: anamneses, total: anamneses.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const anamnese = await db.anamnese.findUnique({ where: { id: req.params.id }, include: { paciente: true, autor: true } });
  if (!anamnese) return res.status(404).json({ error: 'Anamnese não encontrada' });
  res.json(anamnese);
});

router.post('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const anamnese = await db.anamnese.create({ data: req.body });
  res.status(201).json(anamnese);
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const anamnese = await db.anamnese.update({ where: { id: req.params.id }, data: req.body });
  res.json(anamnese);
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.anamnese.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;