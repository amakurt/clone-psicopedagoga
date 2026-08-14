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

const USER_SAFE_SELECT = {
  id: true, name: true, email: true, role: true, active: true,
  phone: true, registration: true, avatarUrl: true, bio: true, createdAt: true,
} as const;

// Membros da própria clínica (qualquer role autenticado) — usado p/ selects (ex: NFS-e)
router.get('/members', async (req, res) => {
  const memberships = await prisma.membership.findMany({
    where: { tenantId: req.user!.tenantId, active: true },
    select: { user: { select: USER_SAFE_SELECT } },
    orderBy: { createdAt: 'asc' },
  });
  const users = memberships.map((m: any) => m.user).filter((u: any) => u.active);
  res.json({ data: users, total: users.length });
});

router.get('/', authorize('GESTOR'), async (req, res) => {
  const { role, search } = req.query;
  const where: any = {};
  if (role) where.role = role;
  if (search) where.name = { contains: search };
  const users = await prisma.user.findMany({ where, orderBy: { name: 'asc' }, select: USER_SAFE_SELECT });
  res.json({ data: users, total: users.length });
});

router.get('/:id', authorize('GESTOR'), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await prisma.user.findUnique({ where: { id }, select: USER_SAFE_SELECT });
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
