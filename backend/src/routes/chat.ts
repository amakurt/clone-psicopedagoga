import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const chatMessageSchema = z.object({
  senderId: z.string().min(1),
  senderName: z.string().min(1),
  message: z.string().min(1),
  pacienteId: z.string().min(1),
  senderRole: z.enum(['RESPONSAVEL', 'STAFF']).optional(),
});

// Conversation list for the staff side: one thread per patient, with unread badge and responsible info
router.get('/conversations', async (req, res) => {
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
router.post('/conversations/:pacienteId/read', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.chatMessage.updateMany({
    where: { pacienteId: req.params.pacienteId, senderRole: 'RESPONSAVEL', readByStaff: false },
    data: { readByStaff: true },
  });
  res.json({ message: 'Conversa marcada como lida' });
});

// Send message as staff
router.post('/send', async (req: any, res) => {
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
      message,
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

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { pacienteId } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = pacienteId;
  const messages = await db.chatMessage.findMany({ where, orderBy: { createdAt: 'asc' }, include: { paciente: true } });
  res.json({ data: messages, total: messages.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const message = await db.chatMessage.findUnique({ where: { id: req.params.id }, include: { paciente: true } });
  if (!message) return res.status(404).json({ error: 'Mensagem não encontrada' });
  res.json(message);
});

router.post('/', validate(chatMessageSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const message = await db.chatMessage.create({ data: req.body });
  res.status(201).json(message);
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const message = await db.chatMessage.update({ where: { id: req.params.id }, data: req.body });
  res.json(message);
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.chatMessage.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;