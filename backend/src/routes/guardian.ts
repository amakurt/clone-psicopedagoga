import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

// Link responsible to patient by access code
router.post('/link', async (req, res) => {
  const { accessCode } = req.body;
  const userId = req.user?.id;

  if (!accessCode) {
    return res.status(400).json({ error: 'Código de acesso é obrigatório' });
  }

  const patient = await prisma.paciente.findFirst({
    where: { accessCode, active: true }
  });

  if (!patient) {
    return res.status(404).json({ error: 'Paciente não encontrado com esse código' });
  }

  // Find or create responsible for this user
  let responsible = await prisma.responsible.findFirst({
    where: { userId }
  });

  if (!responsible) {
    responsible = await prisma.responsible.create({
      data: {
        name: req.user?.name || 'Responsável',
        relationship: 'Responsável',
        userId,
        email: req.user?.email
      }
    });
  }

  // Link patient to responsible
  await prisma.paciente.update({
    where: { id: patient.id },
    data: { responsibleId: responsible.id }
  });

  res.json({ 
    message: 'Paciente vinculado com sucesso',
    patient: { id: patient.id, name: patient.name }
  });
});

// Get guardian's linked patients
router.get('/patients', async (req, res) => {
  const userId = req.user?.id;

  const responsible = await prisma.responsible.findFirst({
    where: { userId }
  });

  if (!responsible) {
    return res.json({ data: [], total: 0 });
  }

  const patients = await prisma.paciente.findMany({
    where: { responsibleId: responsible.id, active: true },
    include: { school: true }
  });

  res.json({ data: patients, total: patients.length });
});

// Get shared evolutions for a patient
router.get('/evolutions/:patientId', async (req, res) => {
  const { patientId } = req.params;
  const userId = req.user?.id;

  // Verify guardian has access to this patient
  const responsible = await prisma.responsible.findFirst({ where: { userId } });
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const patient = await prisma.paciente.findFirst({
    where: { id: patientId, responsibleId: responsible.id }
  });

  if (!patient) {
    return res.status(403).json({ error: 'Acesso negado a este paciente' });
  }

  const records = await prisma.sessionRecord.findMany({
    where: { pacienteId: patientId, sharedWithGuardian: true },
    orderBy: { date: 'desc' }
  });

  res.json({ data: records, total: records.length });
});

// Get financial info for a patient (only RECEITA/shared)
router.get('/financial/:patientId', async (req, res) => {
  const { patientId } = req.params;
  const userId = req.user?.id;

  const responsible = await prisma.responsible.findFirst({ where: { userId } });
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const patient = await prisma.paciente.findFirst({
    where: { id: patientId, responsibleId: responsible.id }
  });

  if (!patient) {
    return res.status(403).json({ error: 'Acesso negado a este paciente' });
  }

  const transactions = await prisma.transaction.findMany({
    where: { patientId, type: 'RECEITA' },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: transactions, total: transactions.length });
});

// Get shared documents for a patient
router.get('/documents/:patientId', async (req, res) => {
  const { patientId } = req.params;
  const userId = req.user?.id;

  const responsible = await prisma.responsible.findFirst({ where: { userId } });
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const patient = await prisma.paciente.findFirst({
    where: { id: patientId, responsibleId: responsible.id }
  });

  if (!patient) {
    return res.status(403).json({ error: 'Acesso negado a este paciente' });
  }

  const documents = await prisma.document.findMany({
    where: { pacienteId: patientId, isShared: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: documents, total: documents.length });
});

// Upload document as guardian
router.post('/documents', async (req, res) => {
  const userId = req.user?.id;
  const { pacienteId, name, category, fileUrl, size } = req.body;

  const responsible = await prisma.responsible.findFirst({ where: { userId } });
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const document = await prisma.document.create({
    data: {
      name,
      pacienteId,
      category: category || 'ESCOLA',
      uploadedBy: 'guardian',
      fileUrl,
      size,
      isShared: false,
      autorId: userId
    }
  });

  res.status(201).json(document);
});

// Request appointment
router.post('/appointments', async (req, res) => {
  const userId = req.user?.id;
  const { pacienteId, date, startTime, endTime, notes } = req.body;

  const responsible = await prisma.responsible.findFirst({ where: { userId } });
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const patient = await prisma.paciente.findFirst({
    where: { id: pacienteId, responsibleId: responsible.id }
  });

  if (!patient) {
    return res.status(403).json({ error: 'Acesso negado a este paciente' });
  }

  const appointment = await prisma.appointment.create({
    data: {
      pacienteId,
      patientName: patient.name,
      date,
      startTime,
      endTime,
      notes: `Solicitado pelo responsável: ${notes || ''}`,
      status: 'PENDENTE',
      autorId: userId
    }
  });

  // Create notification for professional - find the professional from patient's sessions
  const patientSessions = await prisma.sessao.findMany({
    where: { pacienteId },
    select: { psicopedagogoId: true },
    take: 1
  });
  const professionalId = patientSessions[0]?.psicopedagogoId;
  
  if (professionalId) {
    await prisma.notification.create({
      data: {
        userId: professionalId,
        title: 'Nova solicitação de agendamento',
        message: `${responsible.name} solicitou agendamento para ${patient.name}`,
        type: 'appointment'
      }
    });
  }

  res.status(201).json(appointment);
});

// Get all upcoming appointments for guardian's patients
router.get('/appointments', async (req, res) => {
  const userId = req.user?.id;
  const responsible = await prisma.responsible.findFirst({ where: { userId } });
  if (!responsible) return res.json({ data: [], total: 0 });

  const patients = await prisma.paciente.findMany({
    where: { responsibleId: responsible.id, active: true }
  });
  const patientIds = patients.map(p => p.id);

  const today = new Date().toISOString().split('T')[0];
  const appointments = await prisma.appointment.findMany({
    where: {
      pacienteId: { in: patientIds },
      date: { gte: today },
      status: { in: ['CONFIRMADO', 'PENDENTE'] }
    },
    orderBy: { date: 'asc' },
    include: { paciente: true }
  });

  res.json({ data: appointments, total: appointments.length });
});

// Get appointments for patient
router.get('/appointments/:patientId', async (req, res) => {
  const { patientId } = req.params;
  const userId = req.user?.id;

  const responsible = await prisma.responsible.findFirst({ where: { userId } });
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const patient = await prisma.paciente.findFirst({
    where: { id: patientId, responsibleId: responsible.id }
  });

  if (!patient) {
    return res.status(403).json({ error: 'Acesso negado a este paciente' });
  }

  const appointments = await prisma.appointment.findMany({
    where: { pacienteId: patientId },
    orderBy: { date: 'desc' }
  });

  res.json({ data: appointments, total: appointments.length });
});

// Guardian profile - update name
router.put('/profile', async (req, res) => {
  const userId = req.user?.id;
  const { name } = req.body;

  const responsible = await prisma.responsible.findFirst({ where: { userId } });
  if (!responsible) {
    return res.status(404).json({ error: 'Perfil não encontrado' });
  }

  const updated = await prisma.responsible.update({
    where: { id: responsible.id },
    data: { name }
  });

  res.json(updated);
});

// Chat: unread count for the guardian side (messages from staff not yet read)
router.get('/chat/unread-count', async (req, res) => {
  const userId = req.user?.id;

  const responsible = await prisma.responsible.findFirst({ where: { userId } });
  if (!responsible) {
    return res.json({ count: 0 });
  }

  const patientIds = await prisma.paciente.findMany({
    where: { responsibleId: responsible.id },
    select: { id: true },
  });

  const count = await prisma.chatMessage.count({
    where: {
      pacienteId: { in: patientIds.map(p => p.id) },
      senderRole: 'STAFF',
      readByGuardian: false,
    },
  });

  res.json({ count });
});

// Chat: get messages for patient
router.get('/chat/:patientId', async (req, res) => {
  const { patientId } = req.params;
  const userId = req.user?.id;

  const responsible = await prisma.responsible.findFirst({ where: { userId } });
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const patient = await prisma.paciente.findFirst({
    where: { id: patientId, responsibleId: responsible.id }
  });

  if (!patient) {
    return res.status(403).json({ error: 'Acesso negado a este paciente' });
  }

  // Marca como lidas pelo responsável as mensagens enviadas pela equipe
  await prisma.chatMessage.updateMany({
    where: { pacienteId: patientId, senderRole: 'STAFF', readByGuardian: false },
    data: { readByGuardian: true },
  });

  const messages = await prisma.chatMessage.findMany({
    where: { pacienteId: patientId },
    orderBy: { createdAt: 'asc' }
  });

  res.json({ data: messages, total: messages.length });
});

// Chat: send message
router.post('/chat', async (req, res) => {
  const userId = req.user?.id;
  const { pacienteId, message } = req.body;

  const responsible = await prisma.responsible.findFirst({ where: { userId } });
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const chatMessage = await prisma.chatMessage.create({
    data: {
      senderId: userId!,
      senderName: responsible.name,
      senderRole: 'RESPONSAVEL',
      message,
      pacienteId,
      readByGuardian: true,
    }
  });

  await notifyStaffOnGuardianMessage(responsible.name, pacienteId, message);

  res.status(201).json(chatMessage);
});

// Notifica a equipe e tenta enviar WhatsApp (best-effort) sobre uma nova mensagem do responsável
async function notifyStaffOnGuardianMessage(responsibleName: string, pacienteId: string, message: string) {
  const patient = await prisma.paciente.findUnique({ where: { id: pacienteId } });
  const patientName = patient?.name || 'paciente';

  const staff = await prisma.user.findMany({
    where: { active: true, role: { in: ['GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA'] } }
  });

  const title = 'Nova mensagem do responsável';
  const body = `${responsibleName} (${patientName}): ${message}`;

  await prisma.notification.createMany({
    data: staff.map(u => ({ userId: u.id, title, message: body, type: 'message' }))
  });

  const { sendWhatsAppMessage } = await import('./whatsapp');

  for (const u of staff) {
    if (!u.phone || !u.phoneIsWhatsApp) continue;
    try {
      await sendWhatsAppMessage(u.phone, `💬 ${title}: ${body}`);
      console.log(`[WHATSAPP] Chat notificado para ${u.name} (${u.phone})`);
    } catch (error: any) {
      console.warn(`[WHATSAPP] Falha ao notificar chat para ${u.name}: ${error.message}`);
    }
  }
}

// Notifica a equipe e tenta enviar WhatsApp (best-effort) sobre um novo pedido
async function notifyStaffOnAppointmentRequest(responsibleName: string, patientName: string, appointment: any) {
  const staff = await prisma.user.findMany({
    where: { active: true, role: { in: ['GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA'] } }
  });

  const title = 'Nova solicitação de agendamento';
  const message = `${responsibleName} solicitou agendamento para ${patientName} (${appointment.date} ${appointment.startTime})`;

  await prisma.notification.createMany({
    data: staff.map(u => ({ userId: u.id, title, message, type: 'appointment' }))
  });

  const { sendWhatsAppMessage } = await import('./whatsapp');

  for (const u of staff) {
    if (!u.phone || !u.phoneIsWhatsApp) continue;
    try {
      await sendWhatsAppMessage(u.phone, `🗓️ ${title}: ${message}`);
      console.log(`[WHATSAPP] Notificação enviada para ${u.name} (${u.phone})`);
    } catch (error: any) {
      console.warn(`[WHATSAPP] Falha ao notificar ${u.name}: ${error.message}`);
    }
  }
}

// Request new appointment
router.post('/appointments/request', async (req, res) => {
  const userId = req.user?.id;
  const { pacienteId, date, startTime, notes } = req.body;

  const responsible = await prisma.responsible.findFirst({ where: { userId } });
  if (!responsible) return res.status(403).json({ error: 'Acesso negado' });

  const patient = await prisma.paciente.findFirst({
    where: { id: pacienteId, responsibleId: responsible.id }
  });
  if (!patient) return res.status(403).json({ error: 'Acesso negado a este paciente' });

  const appointment = await prisma.appointment.create({
    data: {
      pacienteId,
      patientName: patient.name,
      date,
      startTime: startTime || '09:00',
      endTime: startTime ? String(parseInt(startTime.split(':')[0]) + 1).padStart(2, '0') + ':' + startTime.split(':')[1] : '10:00',
      notes: `Solicitado pelo responsável: ${notes || ''}`,
      status: 'PENDENTE',
      autorId: userId
    }
  });

  await notifyStaffOnAppointmentRequest(responsible.name, patient.name, appointment);

  res.status(201).json(appointment);
});

// Get recent session summaries for a patient
router.get('/sessions/:patientId', async (req, res) => {
  const { patientId } = req.params;
  const userId = req.user?.id;

  const responsible = await prisma.responsible.findFirst({ where: { userId } });
  if (!responsible) return res.status(403).json({ error: 'Acesso negado' });

  const patient = await prisma.paciente.findFirst({
    where: { id: patientId, responsibleId: responsible.id }
  });
  if (!patient) return res.status(403).json({ error: 'Acesso negado a este paciente' });

  const records = await prisma.sessionRecord.findMany({
    where: { pacienteId: patientId, sharedWithGuardian: true },
    orderBy: { date: 'desc' },
    take: 5
  });

  res.json({ data: records, total: records.length });
});

// Guardian dashboard stats
router.get('/dashboard', async (req, res) => {
  const userId = req.user?.id;

  const responsible = await prisma.responsible.findFirst({ where: { userId } });
  if (!responsible) {
    return res.json({ patients: [], pendingAnamnese: 0, upcomingAppointments: 0 });
  }

  const patients = await prisma.paciente.findMany({
    where: { responsibleId: responsible.id, active: true },
    include: { school: true }
  });

  const patientIds = patients.map(p => p.id);

  // Count pending anamneses
  const pendingAnamnese = await prisma.anamnese.count({
    where: {
      pacienteId: { in: patientIds },
      status: 'PENDENTE'
    }
  });

  // Count upcoming appointments
  const today = new Date().toISOString().split('T')[0];
  const upcomingAppointments = await prisma.appointment.count({
    where: {
      pacienteId: { in: patientIds },
      date: { gte: today },
      status: { in: ['CONFIRMADO', 'PENDENTE'] }
    }
  });

  res.json({
    patients,
    pendingAnamnese,
    upcomingAppointments
  });
});

export default router;
