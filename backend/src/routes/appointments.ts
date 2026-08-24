import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const appointmentSchema = z.object({
  pacienteId: z.string().min(1, 'Selecione um paciente'),
  patientName: z.string().optional(),
  date: z.string().min(1, 'Data é obrigatória'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  color: z.string().optional(),
  autorId: z.string().optional(),
});

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { search, status, date, pacienteId } = req.query;
  const where: any = {};
  if (search) where.patientName = { contains: search };
  if (status) where.status = status;
  if (date) where.date = date;
  if (pacienteId) where.pacienteId = pacienteId;
  const appointments = await db.appointment.findMany({ where, orderBy: { date: 'asc' }, include: { paciente: true, autor: true } });
  res.json({ data: appointments, total: appointments.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const appointment = await db.appointment.findUnique({ where: { id: req.params.id }, include: { paciente: true, autor: true } });
  if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado' });
  res.json(appointment);
});

router.post('/', validate(appointmentSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const data = { ...req.body };

  if (!data.patientName && data.pacienteId) {
    const p = await db.paciente.findUnique({ where: { id: data.pacienteId } });
    data.patientName = p?.name || 'Paciente';
  }

  if (!data.startTime) data.startTime = '09:00';
  if (!data.endTime) data.endTime = '09:50';
  if (!data.type) data.type = 'Sessão Psicopedagógica';
  if (!data.status) data.status = 'PENDENTE';
  if (!data.autorId && req.user?.id) data.autorId = req.user.id;

  const appointment = await db.appointment.create({ data });
  res.status(201).json(appointment);
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const data = { ...req.body };
  if (!data.patientName && data.pacienteId) {
    const p = await db.paciente.findUnique({ where: { id: data.pacienteId } });
    if (p) data.patientName = p.name;
  }
  const appointment = await db.appointment.update({ where: { id: req.params.id }, data });
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
  const db = scoped(prisma, req.user?.tenantId);
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status é obrigatório' });

  const appointment = await db.appointment.findUnique({
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

  const updated = await db.appointment.update({
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

    await db.notification.create({
      data: {
        userId: responsible.userId,
        title,
        message,
        type: 'appointment',
      },
    });

    const { sendWhatsAppMessage } = await import('./whatsapp');
    try {
      await sendWhatsAppMessage(responsible.phone || '', `🗓️ ${title}: ${appointment.patientName} (${appointment.date} ${appointment.startTime})`, req.user?.tenantId);
      console.log(`[WHATSAPP] Notificação de status enviada para ${responsible.name}`);
    } catch (error: any) {
      console.warn(`[WHATSAPP] Falha ao notificar status para ${responsible.name}: ${error.message}`);
    }
  }

  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.appointment.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;