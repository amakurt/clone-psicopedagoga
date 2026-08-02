import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const interventionPlanSchema = z.object({
  pacienteId: z.string().min(1),
  professionalId: z.string().min(1),
  date: z.string().min(1),
  step1: z.string().optional(),
  step2: z.string().optional(),
  step3: z.string().optional(),
  sessionCount: z.number().optional(),
  sessionValue: z.string().optional(),
  totalValue: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  status: z.string().optional(),
});

router.get('/', async (req, res) => {
  const { pacienteId, status } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = pacienteId;
  if (status) where.status = status;
  const plans = await prisma.interventionPlan.findMany({ where, orderBy: { date: 'desc' }, include: { paciente: true, profissional: true } });
  res.json({ data: plans, total: plans.length });
});

router.get('/:id', async (req, res) => {
  const plan = await prisma.interventionPlan.findUnique({ where: { id: req.params.id }, include: { paciente: true, profissional: true } });
  if (!plan) return res.status(404).json({ error: 'Plano de intervenção não encontrado' });
  res.json(plan);
});

router.post('/', validate(interventionPlanSchema), async (req, res) => {
  const plan = await prisma.interventionPlan.create({ data: req.body });
  res.status(201).json(plan);
});

router.put('/:id', async (req, res) => {
  const plan = await prisma.interventionPlan.update({ where: { id: req.params.id }, data: req.body });
  res.json(plan);
});

router.delete('/:id', async (req, res) => {
  await prisma.interventionPlan.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
