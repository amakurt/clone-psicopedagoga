import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, authorize, validate } from '../middleware';

import bcrypt from 'bcrypt';
const router = Router();
router.use(authenticate);
router.use(authorize('GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA'));

const responsibleSchema = z.object({
  name: z.string().min(1),
  birthDate: z.string().optional().or(z.literal('')),
  relationship: z.string().min(1),
  cpf: z.string().optional().or(z.literal('')),
  rg: z.string().optional().or(z.literal('')),
  phones: z.string().optional().or(z.literal('')),
  phoneIsWhatsApp: z.boolean().optional(),
  email: z.string().optional().or(z.literal('')),
  avatarUrl: z.string().optional().or(z.literal('')).nullable(),
  cep: z.string().optional().or(z.literal('')),
  street: z.string().optional().or(z.literal('')),
  neighborhood: z.string().optional().or(z.literal('')),
  number: z.string().optional().or(z.literal('')),
  complement: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  userId: z.string().optional().nullable(),
  active: z.boolean().optional(),
  status: z.string().optional(),
  pacienteIds: z.array(z.string()).optional(),
  portalAccess: z.boolean().optional(),
  portalPassword: z.string().min(6).optional().or(z.literal('')),
});

async function handlePortalAccess(tenantId: string, name: string, email?: string, phone?: string, portalPassword?: string) {
  if (!email || !email.trim()) return null;
  const normalizedEmail = email.toLowerCase().trim();
  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  
  if (user) {
    if (portalPassword && portalPassword.trim().length >= 6) {
      const hashedPassword = await bcrypt.hash(portalPassword.trim(), 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, active: true }
      });
    }
    const membership = await prisma.membership.findFirst({
      where: { userId: user.id, tenantId }
    });
    if (!membership) {
      await prisma.membership.create({
        data: { userId: user.id, tenantId, role: 'RESPONSAVEL', active: true }
      });
    }
    return user.id;
  } else {
    const rawPass = portalPassword && portalPassword.trim().length >= 6 ? portalPassword.trim() : '123456';
    const hashedPassword = await bcrypt.hash(rawPass, 10);
    user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'RESPONSAVEL',
        phone: phone || null,
        active: true,
        memberships: {
          create: {
            tenantId,
            role: 'RESPONSAVEL',
            active: true
          }
        }
      }
    });
    return user.id;
  }
}

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { search, active, status } = req.query;
  const where: any = {};
  if (search) where.name = { contains: String(search) };
  if (active !== undefined && active !== '') {
    where.active = active === 'true';
  } else if (status === 'active' || status === 'ATIVO') {
    where.active = true;
  } else if (status === 'inactive' || status === 'INATIVO') {
    where.active = false;
  }
  const responsaveis = await db.responsible.findMany({ where, orderBy: { name: 'asc' }, include: { patients: true } });
  res.json({ data: responsaveis, total: responsaveis.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const responsible = await db.responsible.findUnique({ where: { id: req.params.id }, include: { patients: true } });
  if (!responsible) return res.status(404).json({ error: 'Responsável não encontrado' });
  res.json(responsible);
});

router.post('/', validate(responsibleSchema), async (req, res) => {
  const tenantId = req.user?.tenantId || '';
  const db = scoped(prisma, tenantId);
  const { pacienteIds, patients, portalAccess, portalPassword, ...data } = req.body;
  
  let linkedUserId = data.userId || null;
  if (portalAccess && data.email) {
    const createdUserId = await handlePortalAccess(tenantId, data.name, data.email, data.phones, portalPassword);
    if (createdUserId) linkedUserId = createdUserId;
  }

  const responsible = await db.responsible.create({
    data: {
      ...data,
      userId: linkedUserId,
      ...(pacienteIds?.length ? {
        patients: { connect: pacienteIds.map((id: string) => ({ id })) }
      } : {})
    },
    include: { patients: true }
  });
  res.status(201).json(responsible);
});

router.put('/:id', async (req, res) => {
  const tenantId = req.user?.tenantId || '';
  const db = scoped(prisma, tenantId);
  const { pacienteIds, patients, portalAccess, portalPassword, ...data } = req.body;

  let linkedUserId = data.userId;
  if (portalAccess && data.email) {
    const uid = await handlePortalAccess(tenantId, data.name, data.email, data.phones, portalPassword);
    if (uid) linkedUserId = uid;
  }

  const responsible = await db.responsible.update({
    where: { id: req.params.id },
    data: {
      ...data,
      ...(linkedUserId !== undefined ? { userId: linkedUserId } : {}),
      ...(pacienteIds !== undefined ? {
        patients: { set: pacienteIds.map((id: string) => ({ id })) }
      } : {})
    },
    include: { patients: true }
  });
  res.json(responsible);
});

router.patch('/:id/toggle-status', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const existing = await db.responsible.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Responsável não encontrado' });
  const newActive = typeof req.body.active === 'boolean' ? req.body.active : !existing.active;
  const responsible = await db.responsible.update({
    where: { id: req.params.id },
    data: {
      active: newActive,
      status: newActive ? 'ATIVO' : 'INATIVO'
    },
    include: { patients: true }
  });
  res.json(responsible);
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  try {
    const existing = await db.responsible.findUnique({
      where: { id: req.params.id },
      include: { patients: true }
    });
    if (existing && existing.patients && existing.patients.length > 0) {
      return res.status(400).json({
        error: `Este responsável está vinculado a ${existing.patients.length} paciente(s). Para manter o histórico sem perda de dados, recomendamos desativar o cadastro em vez de excluir.`,
        hasRelations: true
      });
    }
    await db.responsible.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2003') {
      return res.status(400).json({
        error: 'Este responsável possui vínculos clínicos ou financeiros. Recomendamos utilizar a opção "Desativar" para manter o histórico.',
        hasRelations: true
      });
    }
    res.status(500).json({ error: 'Erro ao excluir responsável: ' + (err.message || 'Erro desconhecido') });
  }
});

export default router;
