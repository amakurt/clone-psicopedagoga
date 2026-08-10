import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { enforcePlanLimits } from '../lib/billing';
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

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(user);
});

router.post('/', authorize('GESTOR'), validate(userSchema), async (req, res) => {
  await enforcePlanLimits(req.user!.tenantId || '', 'profissional');
  const user = await prisma.user.create({ data: req.body });
  res.status(201).json(user);
});

router.put('/:id', authorize('GESTOR'), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { name, email, role } = req.body;
  const user = await prisma.user.update({ where: { id }, data: { name, email, role } });
  res.json(user);
});

router.delete('/:id', authorize('GESTOR'), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await prisma.user.delete({ where: { id } });
  res.status(204).send();
});

export default router;
