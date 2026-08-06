import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const sessionRecordSchema = z.object({
  pacienteId: z.string().min(1),
  professionalId: z.string().optional(),
  professionalName: z.string().optional(),
  sessionNumber: z.number().optional(),
  date: z.string().min(1),
  objective: z.string().optional(),
  summary: z.string().min(1),
  activities: z.string().optional(),
  instruments: z.string().optional(),
  observations: z.string().optional(),
  clinicalEvolution: z.string().optional(),
  conduct: z.string().optional(),
  sharedWithGuardian: z.boolean().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  focus: z.number().optional(),
  engagement: z.number().optional(),
  skillProgress: z.number().optional(),
  behavior: z.number().optional(),
});

router.get('/', async (req, res) => {
  const { pacienteId, search } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = pacienteId;
  if (search) where.summary = { contains: search };
  const records = await prisma.sessionRecord.findMany({ where, orderBy: { date: 'desc' }, include: { paciente: true } });
  res.json({ data: records, total: records.length });
});

router.get('/:id', async (req, res) => {
  const record = await prisma.sessionRecord.findUnique({ where: { id: req.params.id }, include: { paciente: true } });
  if (!record) return res.status(404).json({ error: 'Registro de sessão não encontrado' });
  res.json(record);
});

router.post('/', validate(sessionRecordSchema), async (req, res) => {
  const record = await prisma.sessionRecord.create({ data: req.body });
  res.status(201).json(record);
});

router.put('/:id', validate(sessionRecordSchema), async (req, res) => {
  const id = String(req.params.id);
  const record = await prisma.sessionRecord.update({ where: { id }, data: req.body });
  res.json(record);
});

router.delete('/:id', async (req, res) => {
  await prisma.sessionRecord.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
