import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const appointmentSchema = z.object({
  pacienteId: z.string().min(1),
  patientName: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  type: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  color: z.string().optional(),
  autorId: z.string().optional(),
});

router.get('/', async (req, res) => {
  const { search, status, date } = req.query;
  const where: any = {};
  if (search) where.patientName = { contains: search };
  if (status) where.status = status;
  if (date) where.date = date;
  const appointments = await prisma.appointment.findMany({ where, orderBy: { date: 'asc' }, include: { paciente: true, autor: true } });
  res.json({ data: appointments, total: appointments.length });
});

router.get('/:id', async (req, res) => {
  const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id }, include: { paciente: true, autor: true } });
  if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado' });
  res.json(appointment);
});

router.post('/', validate(appointmentSchema), async (req, res) => {
  const appointment = await prisma.appointment.create({ data: req.body });
  res.status(201).json(appointment);
});

router.put('/:id', async (req, res) => {
  const appointment = await prisma.appointment.update({ where: { id: req.params.id }, data: req.body });
  res.json(appointment);
});

router.delete('/:id', async (req, res) => {
  await prisma.appointment.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
