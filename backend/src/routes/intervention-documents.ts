import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const interventionDocumentSchema = z.object({
  pacienteId: z.string().min(1),
  professionalId: z.string().optional(),
  professionalName: z.string().optional(),
  step1: z.string().optional(),
  step2: z.string().optional(),
  step3: z.string().optional(),
  sessionCount: z.number().int().positive().optional(),
  sessionValue: z.string().optional(),
  totalValue: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  status: z.string().optional(),
});

router.get('/', async (req, res) => {
  const { pacienteId } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = pacienteId as string;
  const documents = await prisma.interventionDocument.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { paciente: true },
  });
  res.json({ data: documents, total: documents.length });
});

router.get('/:id', async (req, res) => {
  const document = await prisma.interventionDocument.findUnique({
    where: { id: req.params.id },
    include: { paciente: true },
  });
  if (!document) return res.status(404).json({ error: 'Documento não encontrado' });
  res.json(document);
});

router.post('/', validate(interventionDocumentSchema), async (req, res) => {
  const document = await prisma.interventionDocument.create({
    data: req.body,
    include: { paciente: true },
  });
  res.status(201).json(document);
});

router.put('/:id', async (req, res) => {
  const document = await prisma.interventionDocument.update({
    where: { id: req.params.id },
    data: req.body,
    include: { paciente: true },
  });
  res.json(document);
});

router.delete('/:id', async (req, res) => {
  await prisma.interventionDocument.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
