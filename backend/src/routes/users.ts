import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, authorize, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['GESTOR', 'PSICOPEDAGOGO', 'SECRETARIA']).optional(),
});

router.get('/', async (req, res) => {
  const { role, search } = req.query;
  const where: any = {};
  if (role) where.role = role;
  if (search) where.name = { contains: search };
  const users = await prisma.user.findMany({ where, orderBy: { name: 'asc' } });
  res.json({ data: users, total: users.length });
});

router.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(user);
});

router.post('/', authorize('GESTOR'), validate(userSchema), async (req, res) => {
  const user = await prisma.user.create({ data: req.body });
  res.status(201).json(user);
});

router.put('/:id', authorize('GESTOR'), async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.params.id }, data: req.body });
  res.json(user);
});

router.delete('/:id', authorize('GESTOR'), async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;