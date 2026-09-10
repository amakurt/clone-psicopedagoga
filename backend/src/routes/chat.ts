import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, authorize, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const staffRoles = ['GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA'];

const chatMessageInputSchema = z.object({
  message: z.string().min(1, 'Mensagem não pode ser vazia'),
  pacienteId: z.string().min(1, 'Paciente é obrigatório'),
});

// Helper para obter o registro de responsável vinculado ao usuário
async function getGuardianResponsible(db: any, user: any) {
  if (!user) return null;
  let responsible = await db.responsible.findFirst({
    where: { userId: user.id },
  });
  if (!responsible && user.email) {
    responsible = await db.responsible.findFirst({
      where: { email: user.email },
    });
  }
  return responsible;
}

// Conversation list for the staff side: one thread per patient, with unread badge and responsible info
router.get('/conversations', authorize(...staffRoles), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const messages = await db.chatMessage.findMany({
    orderBy: { createdAt: 'asc' },
    include: { paciente: { include: { responsible: true } } },
  });

  const grouped = new Map<string, any>();
  for (const m of messages) {
    const p = m.paciente;
    if (!p) continue;
    const key = p.id;
    const resp = p.responsible;
    const respName = resp?.name || m.senderName || 'Responsável';
    const respRelation = resp?.relationship || 'Responsável';

    if (!grouped.has(key)) {
      grouped.set(key, {
        pacienteId: p.id,
        patientName: p.name,
        responsibleName: respName,
        responsibleRelationship: respRelation,
        patientInitials: respName.slice(0, 2).toUpperCase(),
        patientColor: p.color || '#007F80',
        unreadCount: 0,
        lastMessage: m.message,
        lastSenderName: m.senderName,
        lastAt: m.createdAt,
      });
    }
    const entry = grouped.get(key);
    entry.lastMessage = m.message;
    entry.lastSenderName = m.senderName;
    entry.lastAt = m.createdAt;
  }

  // Unread = messages sent by the RESPONSAVEL that staff hasn't read yet
  const unread = await db.chatMessage.findMany({
    where: { senderRole: 'RESPONSAVEL', readByStaff: false },
    select: { pacienteId: true },
  });
  for (const u of unread) {
    const entry = grouped.get(u.pacienteId);
    if (entry) entry.unreadCount += 1;
  }

  const conversations = Array.from(grouped.values()).sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
  );

  res.json({ data: conversations, total: conversations.length });
});

// Mark a conversation as read by staff (called when the staff opens a thread)
router.post('/conversations/:pacienteId/read', authorize(...staffRoles), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.chatMessage.updateMany({
    where: { pacienteId: req.params.pacienteId, senderRole: 'RESPONSAVEL', readByStaff: false },
    data: { readByStaff: true },
  });
  res.json({ message: 'Conversa marcada como lida' });
});

// Send message as staff
router.post('/send', authorize(...staffRoles), async (req: any, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { pacienteId, message } = req.body;
  if (!pacienteId || !message || !message.trim()) {
    return res.status(400).json({ error: 'Paciente e mensagem são obrigatórios' });
  }

  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Não autenticado' });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const senderName = dbUser?.name || user.name || 'Equipe';

  const chatMessage = await db.chatMessage.create({
    data: {
      senderId: user.id,
      senderName,
      senderRole: 'STAFF',
      message: message.trim(),
      pacienteId,
      readByStaff: true,
    },
  });

  // Notify the responsible (guardian) that there's a new message
  const patient = await db.paciente.findUnique({
    where: { id: pacienteId },
    include: { responsible: true },
  });
  if (patient?.responsible?.userId) {
    await db.notification.create({
      data: {
        userId: patient.responsible.userId,
        title: 'Nova mensagem da equipe',
        message: `${senderName} respondeu no chat de ${patient.name}`,
        type: 'message',
      },
    });
  }

  res.status(201).json(chatMessage);
});

// List messages: staff can filter by any patient in tenant; responsible can only see their children's messages
router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const user = req.user;
  const { pacienteId } = req.query;
  const where: any = {};

  if (user?.role === 'RESPONSAVEL') {
    const responsible = await getGuardianResponsible(db, user);
    if (!responsible) {
      return res.status(403).json({ error: 'Responsável não encontrado' });
    }
    const children = await db.paciente.findMany({
      where: { responsibleId: responsible.id, active: true },
      select: { id: true },
    });
    const childrenIds = children.map((c: any) => c.id);

    if (pacienteId) {
      if (!childrenIds.includes(String(pacienteId))) {
        return res.status(403).json({ error: 'Acesso negado às mensagens deste paciente' });
      }
      where.pacienteId = String(pacienteId);
    } else {
      where.pacienteId = { in: childrenIds };
    }
  } else {
    if (pacienteId) where.pacienteId = String(pacienteId);
  }

  const messages = await db.chatMessage.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    include: { paciente: true },
  });
  res.json({ data: messages, total: messages.length });
});

// Get single message with ownership check
router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const user = req.user;
  const message = await db.chatMessage.findUnique({
    where: { id: req.params.id },
    include: { paciente: true },
  });

  if (!message) return res.status(404).json({ error: 'Mensagem não encontrada' });

  if (user?.role === 'RESPONSAVEL') {
    const responsible = await getGuardianResponsible(db, user);
    if (!responsible || message.paciente?.responsibleId !== responsible.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
  }

  res.json(message);
});

// Create message via standard endpoint: derive sender identity securely from token and DB
router.post('/', validate(chatMessageInputSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const user = req.user;
  const { message, pacienteId } = req.body;

  let senderRole: 'STAFF' | 'RESPONSAVEL' = 'STAFF';
  let senderName = 'Equipe';

  if (user?.role === 'RESPONSAVEL') {
    const responsible = await getGuardianResponsible(db, user);
    if (!responsible) {
      return res.status(403).json({ error: 'Responsável não encontrado' });
    }
    const patient = await db.paciente.findFirst({
      where: { id: pacienteId, responsibleId: responsible.id, active: true },
    });
    if (!patient) {
      return res.status(403).json({ error: 'Paciente não vinculado a este responsável' });
    }
    senderRole = 'RESPONSAVEL';
    senderName = responsible.name;
  } else {
    const dbUser = await prisma.user.findUnique({ where: { id: user?.id } });
    senderName = dbUser?.name || user?.name || 'Equipe';
    senderRole = 'STAFF';
  }

  const chatMessage = await db.chatMessage.create({
    data: {
      senderId: user?.id || '',
      senderName,
      senderRole,
      message: message.trim(),
      pacienteId,
      readByStaff: senderRole === 'STAFF',
      readByGuardian: senderRole === 'RESPONSAVEL',
    },
  });

  res.status(201).json(chatMessage);
});

router.put('/:id', authorize(...staffRoles), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Mensagem não pode ser vazia' });
  }
  const chatMessage = await db.chatMessage.update({
    where: { id: req.params.id },
    data: { message: message.trim() },
  });
  res.json(chatMessage);
});

router.delete('/:id', authorize(...staffRoles), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.chatMessage.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;