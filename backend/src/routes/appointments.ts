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

// Transições de status permitidas para a equipe
const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['CONCLUIDO', 'CANCELADO'],
  CANCELADO: ['CONFIRMADO'],
  CONCLUIDO: [],
};

// Atualiza o status de um agendamento e notifica o responsável
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status é obrigatório' });

  const appointment = await prisma.appointment.findUnique({
    where: { id: req.params.id },
    include: { paciente: { include: { responsible: true } } },
  });
  if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado' });

  const allowed = STATUS_TRANSITIONS[appointment.status] || [];
  if (!allowed.includes(status)) {
    return res.status(400).json({
      error: `Transição inválida: ${appointment.status} → ${status}`,
      allowed,
    });
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status },
  });

  // Notifica o responsável (app + WhatsApp best-effort)
  const responsible = appointment.paciente?.responsible;
  if (responsible?.userId) {
    const labels: Record<string, string> = {
      CONFIRMADO: 'Agendamento confirmado',
      CANCELADO: 'Agendamento cancelado',
      CONCLUIDO: 'Agendamento finalizado',
    };
    const title = labels[status] || 'Agendamento atualizado';
    const message = `${title}: ${appointment.patientName} (${appointment.date} ${appointment.startTime})`;

    await prisma.notification.create({
      data: {
        userId: responsible.userId,
        title,
        message,
        type: 'appointment',
      },
    });

    const { sendWhatsAppMessage } = await import('./whatsapp');
    try {
      await sendWhatsAppMessage(responsible.phone || '', `🗓️ ${title}: ${appointment.patientName} (${appointment.date} ${appointment.startTime})`);
      console.log(`[WHATSAPP] Notificação de status enviada para ${responsible.name}`);
    } catch (error: any) {
      console.warn(`[WHATSAPP] Falha ao notificar status para ${responsible.name}: ${error.message}`);
    }
  }

  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  await prisma.appointment.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
