import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

// Anti brute-force do código de acesso (6 dígitos) do portal do responsável
const linkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de código de acesso. Aguarde alguns minutos.' },
});

// Staff (equipe) da clínica, via membership
async function getTenantStaff(tenantId: string) {
  const memberships = await prisma.membership.findMany({
    where: { tenantId, active: true },
    include: { user: true },
  });
  return memberships
    .map(m => m.user)
    .filter((u: any) => u.active && ['GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA'].includes(u.role));
}

// Central helper: localiza e auto-vincula o registro Responsible do usuário logado
async function getGuardianResponsible(db: any, user: any) {
  if (!user) return null;
  const userId = user.id;
  const email = user.email;

  // 1. Busca direta por userId
  let responsible = await db.responsible.findFirst({
    where: { userId }
  });
  if (responsible) return responsible;

  // 2. Busca por e-mail e auto-vincula userId
  if (email) {
    responsible = await db.responsible.findFirst({
      where: { email: { equals: email } }
    });
    if (responsible) {
      await db.responsible.update({
        where: { id: responsible.id },
        data: { userId }
      });
      return responsible;
    }
  }

  // 3. Se usuário tem role RESPONSAVEL, cria ou vincula automaticamente
  if (user.role === 'RESPONSAVEL') {
    responsible = await db.responsible.create({
      data: {
        name: user.name || 'Responsável',
        email: user.email || '',
        relationship: 'Responsável',
        userId: user.id
      }
    });
    return responsible;
  }

  return null;
}

// Link responsible to patient by access code
router.post('/link', linkLimiter, async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { accessCode } = req.body;
  const userId = req.user?.id;

  if (!accessCode) {
    return res.status(400).json({ error: 'Código de acesso é obrigatório' });
  }

  const patient = await db.paciente.findFirst({
    where: { accessCode, active: true }
  });

  if (!patient) {
    return res.status(404).json({ error: 'Paciente não encontrado com esse código' });
  }

  // Find or create responsible for this user
  let responsible = await getGuardianResponsible(db, req.user);

  if (!responsible) {
    responsible = await db.responsible.create({
      data: {
        name: req.user?.name || 'Responsável',
        relationship: 'Responsável',
        userId,
        email: req.user?.email
      }
    });
  }

  // Link patient to responsible
  await db.paciente.update({
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
  const db = scoped(prisma, req.user?.tenantId);
  const responsible = await getGuardianResponsible(db, req.user);

  if (!responsible) {
    return res.json({ data: [], total: 0 });
  }

  const patients = await db.paciente.findMany({
    where: { responsibleId: responsible.id, active: true },
    include: { school: true }
  });

  res.json({ data: patients, total: patients.length });
});

// Get shared evolutions for a patient
router.get('/evolutions/:patientId', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { patientId } = req.params;

  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const patient = await db.paciente.findFirst({
    where: { id: patientId, responsibleId: responsible.id }
  });

  if (!patient) {
    return res.status(403).json({ error: 'Acesso negado a este paciente' });
  }

  const records = await db.sessionRecord.findMany({
    where: { pacienteId: patientId, sharedWithGuardian: true },
    orderBy: { date: 'desc' }
  });

  res.json({ data: records, total: records.length });
});

// Cobranças (FinanceiroSessao com PIX) dos pacientes vinculados ao responsável
router.get('/charges', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) {
    return res.json({ data: [], total: 0 });
  }

  const patients = await db.paciente.findMany({
    where: { responsibleId: responsible.id, active: true },
    select: { id: true },
  });
  const patientIds = patients.map((p: any) => p.id);
  if (patientIds.length === 0) {
    return res.json({ data: [], total: 0 });
  }

  const charges = await db.financeiroSessao.findMany({
    where: { pacienteId: { in: patientIds }, paymentMethod: 'PIX' },
    include: { paciente: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    data: charges.map((c: any) => ({
      id: c.id,
      pacienteId: c.pacienteId,
      paciente: c.paciente?.name || '',
      description: c.description,
      value: c.valor,
      status: c.status,
      pixCopiaECola: c.pixCopiaECola,
      payConfirmedByGuardian: c.payConfirmedByGuardian,
      date: c.dataPagamento || c.createdAt,
    })),
    total: charges.length,
  });
});

// Responsável avisa que pagou → notifica a equipe
router.post('/charges/:id/pay', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { id } = req.params;

  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const charge = await db.financeiroSessao.findFirst({
    where: { id, paymentMethod: 'PIX' },
    include: { paciente: true },
  });
  if (!charge) {
    return res.status(404).json({ error: 'Cobrança não encontrada' });
  }

  const patient = await db.paciente.findFirst({
    where: { id: charge.pacienteId, responsibleId: responsible.id },
  });
  if (!patient) {
    return res.status(403).json({ error: 'Acesso negado a esta cobrança' });
  }

  await db.financeiroSessao.update({
    where: { id: charge.id },
    data: { payConfirmedByGuardian: true },
  });

  const staff = await getTenantStaff(req.user?.tenantId as string);
  await Promise.all(
    staff.map((u: any) =>
      db.notification.create({
        data: {
          tenantId: req.user?.tenantId,
          userId: u.id,
          title: 'Pagamento informado',
          type: 'payment',
          message: `Pagamento confirmado pelo responsável: ${patient.name} (R$ ${charge.valor.toFixed(2)})`,
          read: false,
        },
      })
    )
  );

  res.json({ ok: true, message: 'Pagamento comunicado à clínica' });
});

// Get financial info for a patient (only RECEITA/shared)
router.get('/financial/:patientId', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { patientId } = req.params;

  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const patient = await db.paciente.findFirst({
    where: { id: patientId, responsibleId: responsible.id }
  });

  if (!patient) {
    return res.status(403).json({ error: 'Acesso negado a este paciente' });
  }

  const transactions = await db.transaction.findMany({
    where: { patientId, type: 'RECEITA' },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: transactions, total: transactions.length });
});

// Get shared documents for a patient
router.get('/documents/:patientId', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { patientId } = req.params;

  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const patient = await db.paciente.findFirst({
    where: { id: patientId, responsibleId: responsible.id }
  });

  if (!patient) {
    return res.status(403).json({ error: 'Acesso negado a este paciente' });
  }

  const documents = await db.document.findMany({
    where: { pacienteId: patientId, isShared: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: documents, total: documents.length });
});

// Upload document as guardian
router.post('/documents', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const userId = req.user?.id;
  const { pacienteId, name, category, fileUrl, size } = req.body;

  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const document = await db.document.create({
    data: {
      name,
      pacienteId,
      category: category || 'ESCOLA',
      uploadedBy: 'guardian',
      fileUrl,
      size,
      status: 'AGUARDANDO_APROVACAO',
      isShared: true,
      autorId: userId
    }
  });

  // Notify clinic staff that a document was uploaded by the responsible
  const patient = await db.paciente.findUnique({ where: { id: pacienteId } });
  const staff = await getTenantStaff(req.user?.tenantId as string);
  if (staff.length > 0) {
    const patientName = patient?.name || 'Paciente';
    const responsibleName = responsible?.name || 'Responsável';
    await db.notification.createMany({
      data: staff.map(u => ({
        tenantId: req.user?.tenantId,
        userId: u.id,
        title: 'Novo documento enviado pela família',
        message: `${responsibleName} enviou "${name}" para ${patientName}`,
        type: 'document',
        read: false
      }))
    });
  }

  res.status(201).json(document);
});

// Request appointment
router.post('/appointments', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const userId = req.user?.id;
  const { pacienteId, date, startTime, endTime, notes } = req.body;

  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const patient = await db.paciente.findFirst({
    where: { id: pacienteId, responsibleId: responsible.id }
  });

  if (!patient) {
    return res.status(403).json({ error: 'Acesso negado a este paciente' });
  }

  const appointment = await db.appointment.create({
    data: {
      pacienteId,
      patientName: patient.name,
      date,
      startTime: startTime || '09:00',
      endTime: endTime || '09:50',
      notes: `Solicitado pelo responsável: ${notes || ''}`,
      status: 'PENDENTE',
      autorId: userId
    }
  });

  // Create notification for professional - find the professional from patient's sessions
  const patientSessions = await db.sessao.findMany({
    where: { pacienteId },
    select: { psicopedagogoId: true },
    take: 1
  });
  const professionalId = patientSessions[0]?.psicopedagogoId;
  
  if (professionalId) {
    await db.notification.create({
      data: {
        tenantId: req.user?.tenantId,
        userId: professionalId,
        title: 'Nova solicitação de agendamento',
        message: `${responsible.name} solicitou agendamento para ${patient.name}`,
        type: 'appointment',
        read: false
      }
    });
  }

  res.status(201).json(appointment);
});

// Get all appointments for guardian's patients
router.get('/appointments', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) return res.json({ data: [], total: 0 });

  const patients = await db.paciente.findMany({
    where: { responsibleId: responsible.id, active: true }
  });
  const patientIds = patients.map((p: any) => p.id);
  if (patientIds.length === 0) return res.json({ data: [], total: 0 });

  const appointments = await db.appointment.findMany({
    where: {
      pacienteId: { in: patientIds }
    },
    orderBy: { date: 'desc' },
    include: { paciente: true }
  });

  res.json({ data: appointments, total: appointments.length });
});

// Helper: busca um agendamento que pertence aos pacientes do responsável
async function findGuardianAppointment(userId: string, appointmentId: string, tenantId?: string, user?: any) {
  const db = scoped(prisma, tenantId);
  const responsible = await getGuardianResponsible(db, user || { id: userId });
  if (!responsible) return null;

  const patients = await db.paciente.findMany({
    where: { responsibleId: responsible.id, active: true },
    select: { id: true },
  });

  return db.appointment.findFirst({
    where: { id: appointmentId, pacienteId: { in: patients.map((p: any) => p.id) } },
    include: { paciente: true },
  });
}

// Notifica a equipe sobre cancelamento/reagendamento feito pelo responsável
async function notifyStaffOnGuardianAction(tenantId: string, title: string, message: string) {
  const db = scoped(prisma, tenantId);
  const staff = await getTenantStaff(tenantId);

  await db.notification.createMany({
    data: staff.map(u => ({ tenantId, userId: u.id, title, message, type: 'appointment', read: false }))
  });

  const { sendWhatsAppMessage } = await import('./whatsapp');
  for (const u of staff) {
    if (!u.phone || !u.phoneIsWhatsApp) continue;
    try {
      await sendWhatsAppMessage(u.phone, `🗓️ ${title}: ${message}`, tenantId);
      console.log(`[WHATSAPP] ${title} notificado para ${u.name}`);
    } catch (error: any) {
      console.warn(`[WHATSAPP] Falha ao notificar ${u.name}: ${error.message}`);
    }
  }
}

// Responsável cancela um agendamento (PENDENTE ou CONFIRMADO)
router.put('/appointments/:id/cancel', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const userId = req.user?.id;
  const appointment = await findGuardianAppointment(userId!, req.params.id, req.user?.tenantId, req.user);
  if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado' });

  if (!['PENDENTE', 'CONFIRMADO'].includes(appointment.status)) {
    return res.status(400).json({ error: `Não é possível cancelar um agendamento ${appointment.status}` });
  }

  const updated = await db.appointment.update({
    where: { id: appointment.id },
    data: { status: 'CANCELADO', notes: `${appointment.notes || ''} | Cancelado pelo responsável`.trim() },
  });

  await notifyStaffOnGuardianAction(
    req.user!.tenantId!,
    'Agendamento cancelado pelo responsável',
    `${appointment.paciente?.name || appointment.patientName} (${appointment.date} ${appointment.startTime})`
  );

  res.json(updated);
});

// Responsável modifica (reagenda) um agendamento
router.put('/appointments/:id/reschedule', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const userId = req.user?.id;
  const { date, startTime, notes } = req.body;
  if (!date) return res.status(400).json({ error: 'Nova data é obrigatória' });

  const appointment = await findGuardianAppointment(userId!, req.params.id, req.user?.tenantId, req.user);
  if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado' });

  if (!['PENDENTE', 'CONFIRMADO'].includes(appointment.status)) {
    return res.status(400).json({ error: `Não é possível modificar um agendamento ${appointment.status}` });
  }

  const start = startTime || appointment.startTime;
  const endTime = String(parseInt(start.split(':')[0]) + 1).padStart(2, '0') + ':' + start.split(':')[1];

  const updated = await db.appointment.update({
    where: { id: appointment.id },
    data: {
      date,
      startTime: start,
      endTime,
      status: 'PENDENTE',
      notes: `${appointment.notes || ''} | Reagendado pelo responsável: ${date} ${start}${notes ? ` (${notes})` : ''}`.trim(),
    },
  });

  await notifyStaffOnGuardianAction(
    req.user!.tenantId!,
    'Agendamento modificado pelo responsável',
    `${appointment.paciente?.name || appointment.patientName} — nova data: ${date} ${start}`
  );

  res.json(updated);
});

// Get appointments for patient
router.get('/appointments/:patientId', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { patientId } = req.params;

  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const patient = await db.paciente.findFirst({
    where: { id: patientId, responsibleId: responsible.id }
  });

  if (!patient) {
    return res.status(403).json({ error: 'Acesso negado a este paciente' });
  }

  const appointments = await db.appointment.findMany({
    where: { pacienteId: patientId },
    orderBy: { date: 'desc' }
  });

  res.json({ data: appointments, total: appointments.length });
});

// Guardian profile - update name
router.put('/profile', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { name } = req.body;

  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) {
    return res.status(404).json({ error: 'Perfil não encontrado' });
  }

  const updated = await db.responsible.update({
    where: { id: responsible.id },
    data: { name }
  });

  res.json(updated);
});

// Chat: unread count for the guardian side
router.get('/chat/unread-count', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) {
    return res.json({ count: 0 });
  }

  const patientIds = await db.paciente.findMany({
    where: { responsibleId: responsible.id },
    select: { id: true },
  });

  const count = await db.chatMessage.count({
    where: {
      pacienteId: { in: patientIds.map((p: any) => p.id) },
      senderRole: 'STAFF',
      readByGuardian: false,
    },
  });

  res.json({ count });
});

// Chat: get messages for patient
router.get('/chat/:patientId', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { patientId } = req.params;

  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const patient = await db.paciente.findFirst({
    where: { id: patientId, responsibleId: responsible.id }
  });

  if (!patient) {
    return res.status(403).json({ error: 'Acesso negado a este paciente' });
  }

  // Marca como lidas pelo responsável as mensagens enviadas pela equipe
  await db.chatMessage.updateMany({
    where: { pacienteId: patientId, senderRole: 'STAFF', readByGuardian: false },
    data: { readByGuardian: true },
  });

  const messages = await db.chatMessage.findMany({
    where: { pacienteId: patientId },
    orderBy: { createdAt: 'asc' }
  });

  res.json({ data: messages, total: messages.length });
});

// Chat: send message
router.post('/chat', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const userId = req.user?.id;
  const { pacienteId, message } = req.body;

  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const chatMessage = await db.chatMessage.create({
    data: {
      senderId: userId!,
      senderName: responsible.name,
      senderRole: 'RESPONSAVEL',
      message,
      pacienteId,
      readByGuardian: true,
    }
  });

  await notifyStaffOnGuardianMessage(req.user!.tenantId!, responsible.name, pacienteId, message);

  res.status(201).json(chatMessage);
});

// Notifica a equipe e tenta enviar WhatsApp (best-effort) sobre uma nova mensagem do responsável
async function notifyStaffOnGuardianMessage(tenantId: string, responsibleName: string, pacienteId: string, message: string) {
  const db = scoped(prisma, tenantId);
  const patient = await db.paciente.findUnique({ where: { id: pacienteId } });
  const patientName = patient?.name || 'paciente';

  const staff = await getTenantStaff(tenantId);

  const title = 'Nova mensagem do responsável';
  const body = `${responsibleName} (${patientName}): ${message}`;

  await db.notification.createMany({
    data: staff.map(u => ({ tenantId, userId: u.id, title, message: body, type: 'message', read: false }))
  });

  const { sendWhatsAppMessage } = await import('./whatsapp');

  for (const u of staff) {
    if (!u.phone || !u.phoneIsWhatsApp) continue;
    try {
      await sendWhatsAppMessage(u.phone, `💬 ${title}: ${body}`, tenantId);
      console.log(`[WHATSAPP] Chat notificado para ${u.name} (${u.phone})`);
    } catch (error: any) {
      console.warn(`[WHATSAPP] Falha ao notificar chat para ${u.name}: ${error.message}`);
    }
  }
}

// Notifica a equipe e tenta enviar WhatsApp (best-effort) sobre um novo pedido
async function notifyStaffOnAppointmentRequest(tenantId: string, responsibleName: string, patientName: string, appointment: any) {
  const db = scoped(prisma, tenantId);
  const staff = await getTenantStaff(tenantId);

  const title = 'Nova solicitação de agendamento';
  const message = `${responsibleName} solicitou agendamento para ${patientName} (${appointment.date} ${appointment.startTime})`;

  await db.notification.createMany({
    data: staff.map(u => ({ tenantId, userId: u.id, title, message, type: 'appointment', read: false }))
  });

  const { sendWhatsAppMessage } = await import('./whatsapp');

  for (const u of staff) {
    if (!u.phone || !u.phoneIsWhatsApp) continue;
    try {
      await sendWhatsAppMessage(u.phone, `🗓️ ${title}: ${message}`, tenantId);
      console.log(`[WHATSAPP] Notificação enviada para ${u.name} (${u.phone})`);
    } catch (error: any) {
      console.warn(`[WHATSAPP] Falha ao notificar ${u.name}: ${error.message}`);
    }
  }
}

// Request new appointment
router.post('/appointments/request', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const userId = req.user?.id;
  const { pacienteId, date, startTime, notes } = req.body;

  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) return res.status(403).json({ error: 'Acesso negado' });

  const patient = await db.paciente.findFirst({
    where: { id: pacienteId, responsibleId: responsible.id }
  });
  if (!patient) return res.status(403).json({ error: 'Acesso negado a este paciente' });

  const appointment = await db.appointment.create({
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

  await notifyStaffOnAppointmentRequest(req.user!.tenantId!, responsible.name, patient.name, appointment);

  res.status(201).json(appointment);
});

// Get recent session summaries for a patient
router.get('/sessions/:patientId', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { patientId } = req.params;

  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) return res.status(403).json({ error: 'Acesso negado' });

  const patient = await db.paciente.findFirst({
    where: { id: patientId, responsibleId: responsible.id }
  });
  if (!patient) return res.status(403).json({ error: 'Acesso negado a este paciente' });

  const records = await db.sessionRecord.findMany({
    where: { pacienteId: patientId, sharedWithGuardian: true },
    orderBy: { date: 'desc' },
    take: 5
  });

  res.json({ data: records, total: records.length });
});

// Guardian dashboard stats
router.get('/dashboard', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const responsible = await getGuardianResponsible(db, req.user);
  if (!responsible) {
    return res.json({ patients: [], pendingAnamnese: 0, upcomingAppointments: 0 });
  }

  const patients = await db.paciente.findMany({
    where: { responsibleId: responsible.id, active: true },
    include: { school: true }
  });

  const patientIds = patients.map((p: any) => p.id);

  // Count pending anamneses
  const pendingAnamnese = await db.anamnese.count({
    where: {
      pacienteId: { in: patientIds },
      status: 'PENDENTE'
    }
  });

  // Count upcoming appointments
  const upcomingAppointments = await db.appointment.count({
    where: {
      pacienteId: { in: patientIds },
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