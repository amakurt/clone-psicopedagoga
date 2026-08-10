import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const notificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.string().optional(),
  read: z.boolean().optional(),
});

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { read } = req.query;
  const where: any = {};
  where.userId = (req.query.userId as string) || req.user?.id;
  if (read !== undefined) where.read = read === 'true';
  const notifications = await db.notification.findMany({ where, orderBy: { createdAt: 'desc' }, include: { user: true } });
  res.json({ data: notifications, total: notifications.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const notification = await db.notification.findUnique({ where: { id: req.params.id }, include: { user: true } });
  if (!notification) return res.status(404).json({ error: 'Notificação não encontrada' });
  res.json(notification);
});

router.put('/mark-all-read', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.notification.updateMany({ where: { userId: req.user!.id, read: false }, data: { read: true } });
  res.json({ message: 'Todas as notificações marcadas como lidas' });
});

router.post('/', validate(notificationSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const notification = await db.notification.create({ data: req.body });
  res.status(201).json(notification);
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const notification = await db.notification.update({ where: { id: req.params.id }, data: req.body });
  res.json(notification);
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.notification.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

router.put('/:id/mark-as-read', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const notification = await db.notification.update({ where: { id: req.params.id }, data: { read: true } });
  res.json(notification);
});

export default router;
