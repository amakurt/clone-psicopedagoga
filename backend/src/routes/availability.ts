import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  active: z.boolean().optional(),
});

// Lista os horários disponíveis do profissional logado
router.get('/', async (req, res) => {
  const availabilities = await prisma.availability.findMany({
    where: { userId: req.user!.id },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });
  res.json({ data: availabilities, total: availabilities.length });
});

// Cria um horário disponível
router.post('/', validate(availabilitySchema), async (req, res) => {
  const { dayOfWeek, startTime, endTime, active } = req.body;

  const existing = await prisma.availability.findFirst({
    where: {
      userId: req.user!.id,
      dayOfWeek,
      startTime,
      endTime,
    },
  });
  if (existing) {
    return res.status(400).json({ error: 'Este horário já está cadastrado para este dia' });
  }

  const availability = await prisma.availability.create({
    data: { userId: req.user!.id, dayOfWeek, startTime, endTime, active: active ?? true },
  });
  res.status(201).json(availability);
});

// Atualiza um horário disponível
router.put('/:id', validate(availabilitySchema), async (req, res) => {
  const existing = await prisma.availability.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
  });
  if (!existing) return res.status(404).json({ error: 'Horário não encontrado' });

  const availability = await prisma.availability.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json(availability);
});

// Remove um horário disponível
router.delete('/:id', async (req, res) => {
  const existing = await prisma.availability.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
  });
  if (!existing) return res.status(404).json({ error: 'Horário não encontrado' });

  await prisma.availability.delete({ where: { id: existing.id } });
  res.status(204).send();
});

export default router;
