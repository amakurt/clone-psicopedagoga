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

  // 🔔 Notificar o Responsável (App Notification + WhatsApp)
  try {
    const patient = await db.paciente.findUnique({
      where: { id: data.pacienteId },
      include: { responsible: true }
    });

    if (patient?.responsible) {
      let respUserId = patient.responsible.userId;
      if (!respUserId && patient.responsible.email) {
        const u = await prisma.user.findUnique({ where: { email: patient.responsible.email } });
        if (u) {
          respUserId = u.id;
          await db.responsible.update({ where: { id: patient.responsible.id }, data: { userId: u.id } });
        }
      }

      if (respUserId) {
        const title = data.status === 'CONFIRMADO' ? 'Consulta agendada' : 'Novo agendamento pendente';
        const message = `Consulta marcada para ${patient.name} em ${data.date} às ${data.startTime} (${data.type}).`;
        await db.notification.create({
          data: {
            tenantId: req.user?.tenantId,
            userId: respUserId,
            title,
            message,
            type: 'appointment',
            read: false
          }
        });
      }

      if (patient.responsible.phones) {
        const { sendWhatsAppMessage } = await import('./whatsapp');
        await sendWhatsAppMessage(
          patient.responsible.phones,
          `🗓️ *EduPsych Pro - Agendamento*\nOlá, ${patient.responsible.name}!\nUma consulta foi agendada para *${patient.name}* no dia *${data.date}* às *${data.startTime}*.\nTipo: ${data.type}`,
          req.user?.tenantId
        ).catch(() => {});
      }
    }
  } catch (err: any) {
    console.warn('[APPOINTMENTS] Erro ao notificar responsável:', err.message);
  }

  res.status(201).json(appointment);
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const {
    pacienteId,
    patientName,
    date,
    startTime,
    endTime,
    type,
    status,
    notes,
    color,
    autorId
  } = req.body;

  const data: any = {};
  if (pacienteId !== undefined) data.pacienteId = pacienteId;
  if (patientName !== undefined) data.patientName = patientName;
  if (date !== undefined) data.date = date;
  if (startTime !== undefined) data.startTime = startTime;
  if (endTime !== undefined) data.endTime = endTime;
  if (type !== undefined) data.type = type;
  if (status !== undefined) data.status = status;
  if (notes !== undefined) data.notes = notes;
  if (color !== undefined) data.color = color;
  if (autorId !== undefined) data.autorId = autorId;

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
  let respUserId = responsible?.userId;
  if (!respUserId && responsible?.email) {
    const u = await prisma.user.findUnique({ where: { email: responsible.email } });
    if (u) {
      respUserId = u.id;
      await db.responsible.update({ where: { id: responsible.id }, data: { userId: u.id } });
    }
  }

  if (respUserId) {
    const labels: Record<string, string> = {
      CONFIRMADO: 'Agendamento confirmado',
      CANCELADO: 'Agendamento cancelado',
      CONCLUIDO: 'Agendamento finalizado',
    };
    const title = labels[status] || 'Agendamento atualizado';
    const message = `${title}: ${appointment.patientName} (${appointment.date} ${appointment.startTime})`;

    await db.notification.create({
      data: {
        tenantId: req.user?.tenantId,
        userId: respUserId,
        title,
        message,
        type: 'appointment',
        read: false
      },
    });

    const { sendWhatsAppMessage } = await import('./whatsapp');
    try {
      await sendWhatsAppMessage(responsible?.phones || '', `🗓️ ${title}: ${appointment.patientName} (${appointment.date} ${appointment.startTime})`, req.user?.tenantId);
      console.log(`[WHATSAPP] Notificação de status enviada para ${responsible?.name}`);
    } catch (error: any) {
      console.warn(`[WHATSAPP] Falha ao notificar status para ${responsible?.name}: ${error.message}`);
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