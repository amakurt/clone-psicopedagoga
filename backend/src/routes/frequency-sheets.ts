import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const frequencySheetSchema = z.object({
  pacienteId: z.string().min(1),
  date: z.string().min(1),
  entryTime: z.string().optional(),
  exitTime: z.string().optional(),
  activities: z.string().optional(),
  instruments: z.string().optional(),
  observations: z.string().optional(),
  guardianSignature: z.string().optional(),
});

router.get('/', async (req, res) => {
  const { pacienteId } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = pacienteId as string;
  const sheets = await prisma.frequencySheet.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { paciente: true },
  });
  res.json({ data: sheets, total: sheets.length });
});

router.get('/:id', async (req, res) => {
  const sheet = await prisma.frequencySheet.findUnique({
    where: { id: req.params.id },
    include: { paciente: true },
  });
  if (!sheet) return res.status(404).json({ error: 'Ficha não encontrada' });
  res.json(sheet);
});

router.post('/', validate(frequencySheetSchema), async (req, res) => {
  const sheet = await prisma.frequencySheet.create({
    data: req.body,
    include: { paciente: true },
  });
  res.status(201).json(sheet);
});

router.put('/:id', async (req, res) => {
  const sheet = await prisma.frequencySheet.update({
    where: { id: req.params.id },
    data: req.body,
    include: { paciente: true },
  });
  res.json(sheet);
});

router.delete('/:id', async (req, res) => {
  await prisma.frequencySheet.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
