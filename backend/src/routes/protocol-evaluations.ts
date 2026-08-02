import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const protocolEvaluationSchema = z.object({
  pacienteId: z.string().min(1),
  professionalId: z.string().min(1),
  date: z.string().min(1),
  evaluations: z.string().min(1),
  totalEvaluations: z.number().optional(),
  averageScore: z.number().optional(),
  maxScore: z.number().optional(),
  minScore: z.number().optional(),
});

router.get('/', async (req, res) => {
  const { pacienteId } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = pacienteId;
  const evaluations = await prisma.protocolEvaluation.findMany({ where, orderBy: { date: 'desc' }, include: { paciente: true, profissional: true } });
  res.json({ data: evaluations, total: evaluations.length });
});

router.get('/:id', async (req, res) => {
  const evaluation = await prisma.protocolEvaluation.findUnique({ where: { id: req.params.id }, include: { paciente: true, profissional: true } });
  if (!evaluation) return res.status(404).json({ error: 'Avaliação de protocolo não encontrada' });
  res.json(evaluation);
});

router.post('/', validate(protocolEvaluationSchema), async (req, res) => {
  const evaluation = await prisma.protocolEvaluation.create({ data: req.body });
  res.status(201).json(evaluation);
});

router.put('/:id', async (req, res) => {
  const evaluation = await prisma.protocolEvaluation.update({ where: { id: req.params.id }, data: req.body });
  res.json(evaluation);
});

router.delete('/:id', async (req, res) => {
  await prisma.protocolEvaluation.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
