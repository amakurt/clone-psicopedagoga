import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { enforcePlanLimits } from '../lib/billing';
import { authenticate, authorize, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const userCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  role: z.enum(['GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA', 'TERAPEUTA']).default('PROFISSIONAL'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres').optional(),
});

const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA', 'TERAPEUTA']).optional(),
  active: z.boolean().optional(),
  phone: z.string().optional(),
  registration: z.string().optional(),
  bio: z.string().optional(),
});

const USER_SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  phone: true,
  registration: true,
  avatarUrl: true,
  bio: true,
  createdAt: true,
} as const;

// Membros da própria clínica (qualquer role autenticado) — usado p/ selects (ex: NFS-e, encaminhamentos)
router.get('/members', async (req, res) => {
  const tenantId = req.user!.tenantId;
  const memberships = await prisma.membership.findMany({
    where: { tenantId, active: true },
    select: { user: { select: USER_SAFE_SELECT } },
    orderBy: { createdAt: 'asc' },
  });
  const users = memberships.map((m: any) => m.user).filter((u: any) => u && u.active);
  res.json({ data: users, total: users.length });
});

// Listar membros do tenant para o GESTOR
router.get('/', authorize('GESTOR'), async (req, res) => {
  const tenantId = req.user!.tenantId;
  const { role, search } = req.query;

  const where: any = {
    memberships: { some: { tenantId } },
  };

  if (role) where.role = String(role);
  if (search) where.name = { contains: String(search) };

  const users = await prisma.user.findMany({
    where,
    orderBy: { name: 'asc' },
    select: USER_SAFE_SELECT,
  });

  res.json({ data: users, total: users.length });
});

// Obter usuário por ID (com verificação de tenant)
router.get('/:id', authorize('GESTOR'), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const tenantId = req.user!.tenantId;

  const user = await prisma.user.findFirst({
    where: {
      id,
      memberships: { some: { tenantId } },
    },
    select: USER_SAFE_SELECT,
  });

  if (!user) return res.status(404).json({ error: 'Usuário não encontrado nesta clínica' });
  res.json(user);
});

// Criar novo membro da equipe com hash de senha e membership associado
router.post('/', authorize('GESTOR'), validate(userCreateSchema), async (req, res) => {
  const tenantId = req.user!.tenantId || '';
  await enforcePlanLimits(tenantId, 'profissional');

  const { name, email, role, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Verificar se o usuário já existe
  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (user) {
    // Verificar se já é membro deste tenant
    const existingMembership = await prisma.membership.findFirst({
      where: { userId: user.id, tenantId },
    });
    if (existingMembership) {
      return res.status(400).json({ error: 'Este usuário já faz parte desta clínica' });
    }
    // Adicionar membership para a clínica
    await prisma.membership.create({
      data: {
        userId: user.id,
        tenantId,
        role: role || 'PROFISSIONAL',
        active: true,
      },
    });
  } else {
    // Hashear a senha
    const rawPassword = password || crypto.randomUUID().slice(0, 10);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: role || 'PROFISSIONAL',
        active: true,
        memberships: {
          create: {
            tenantId,
            role: role || 'PROFISSIONAL',
            active: true,
          },
        },
      },
    });
  }

  const safeUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: USER_SAFE_SELECT,
  });

  res.status(201).json(safeUser);
});

// Atualizar usuário (escopado ao tenant)
router.put('/:id', authorize('GESTOR'), validate(userUpdateSchema), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const tenantId = req.user!.tenantId;

  const membership = await prisma.membership.findFirst({
    where: { userId: id, tenantId },
  });

  if (!membership) {
    return res.status(404).json({ error: 'Usuário não encontrado nesta clínica' });
  }

  const { name, email, role, active, phone, registration, bio } = req.body;
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email.toLowerCase().trim();
  if (role !== undefined) updateData.role = role;
  if (active !== undefined) updateData.active = active;
  if (phone !== undefined) updateData.phone = phone;
  if (registration !== undefined) updateData.registration = registration;
  if (bio !== undefined) updateData.bio = bio;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: USER_SAFE_SELECT,
  });

  if (role !== undefined || active !== undefined) {
    await prisma.membership.updateMany({
      where: { userId: id, tenantId },
      data: {
        ...(role !== undefined ? { role } : {}),
        ...(active !== undefined ? { active } : {}),
      },
    });
  }

  res.json(user);
});

// Remover usuário da clínica (remove o membership)
router.delete('/:id', authorize('GESTOR'), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const tenantId = req.user!.tenantId;

  if (id === req.user!.id) {
    return res.status(400).json({ error: 'Você não pode remover seu próprio usuário' });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: id, tenantId },
  });

  if (!membership) {
    return res.status(404).json({ error: 'Usuário não pertence a esta clínica' });
  }

  await prisma.membership.delete({
    where: { id: membership.id },
  });

  res.status(204).send();
});

export default router;

