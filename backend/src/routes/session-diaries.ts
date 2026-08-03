import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const sessionDiarySchema = z.object({
  pacienteId: z.string().min(1),
  sessionNumber: z.number().int().positive(),
  date: z.string().min(1),
  professionalId: z.string().optional(),
  professionalName: z.string().optional(),
  objective: z.string().optional(),
  instruments: z.string().optional(),
  studentBehavior: z.string().optional(),
  activities: z.string().optional(),
  observations: z.string().optional(),
});

router.get('/', async (req, res) => {
  const { pacienteId } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = pacienteId as string;
  const diaries = await prisma.sessionDiary.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { paciente: true },
  });
  res.json({ data: diaries, total: diaries.length });
});

router.get('/:id', async (req, res) => {
  const diary = await prisma.sessionDiary.findUnique({
    where: { id: req.params.id },
    include: { paciente: true },
  });
  if (!diary) return res.status(404).json({ error: 'Diário não encontrado' });
  res.json(diary);
});

router.post('/', validate(sessionDiarySchema), async (req, res) => {
  const diary = await prisma.sessionDiary.create({
    data: req.body,
    include: { paciente: true },
  });
  res.status(201).json(diary);
});

router.put('/:id', async (req, res) => {
  const diary = await prisma.sessionDiary.update({
    where: { id: req.params.id },
    data: req.body,
    include: { paciente: true },
  });
  res.json(diary);
});

router.delete('/:id', async (req, res) => {
  await prisma.sessionDiary.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
