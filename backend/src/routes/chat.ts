import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const chatMessageSchema = z.object({
  senderId: z.string().min(1),
  senderName: z.string().min(1),
  message: z.string().min(1),
  pacienteId: z.string().min(1),
});

router.get('/', async (req, res) => {
  const { pacienteId } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = pacienteId;
  const messages = await prisma.chatMessage.findMany({ where, orderBy: { createdAt: 'asc' }, include: { paciente: true } });
  res.json({ data: messages, total: messages.length });
});

router.get('/:id', async (req, res) => {
  const message = await prisma.chatMessage.findUnique({ where: { id: req.params.id }, include: { paciente: true } });
  if (!message) return res.status(404).json({ error: 'Mensagem não encontrada' });
  res.json(message);
});

router.post('/', validate(chatMessageSchema), async (req, res) => {
  const message = await prisma.chatMessage.create({ data: req.body });
  res.status(201).json(message);
});

router.put('/:id', async (req, res) => {
  const message = await prisma.chatMessage.update({ where: { id: req.params.id }, data: req.body });
  res.json(message);
});

router.delete('/:id', async (req, res) => {
  await prisma.chatMessage.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
