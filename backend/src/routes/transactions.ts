import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const transactionSchema = z.object({
  patientName: z.string().min(1),
  patientId: z.string().optional(),
  date: z.string().min(1),
  value: z.string().min(1),
  status: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  avatarUrl: z.string().optional(),
  paymentUrl: z.string().optional(),
  paymentMethod: z.string().optional(),
  professionalId: z.string().optional(),
});

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { search, status, type } = req.query;
  const where: any = {};
  if (search) where.patientName = { contains: search };
  if (status) where.status = status;
  if (type) where.type = type;
  const transactions = await db.transaction.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json({ data: transactions, total: transactions.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const transaction = await db.transaction.findUnique({ where: { id: req.params.id } });
  if (!transaction) return res.status(404).json({ error: 'Transação não encontrada' });
  res.json(transaction);
});

router.post('/', validate(transactionSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const transaction = await db.transaction.create({ data: req.body });
  res.status(201).json(transaction);
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const transaction = await db.transaction.update({ where: { id: req.params.id }, data: req.body });
  res.json(transaction);
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.transaction.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
