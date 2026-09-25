import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { enforceTenantStatus } from '../lib/billing';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não definido. Configure o backend/.env antes de subir o servidor.');
  }
  return secret;
}


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  let payload: any;
  try {
    payload = jwt.verify(authHeader.split(' ')[1], getJwtSecret());
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Conta não ativada. Verifique seu email ou reenvie o link de ativação.' });
    }

    if (user.role === 'SUPERADMIN') {
      const memberships = await prisma.membership.findMany({
        where: { userId: user.id, active: true },
        orderBy: { createdAt: 'asc' },
        include: { tenant: { include: { subscription: true } } },
      });

      const headerTenantId = String(req.headers['x-tenant-id'] || '');
      const membership = headerTenantId
        ? memberships.find((m) => m.tenantId === headerTenantId)
        : memberships[0];

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'SUPERADMIN',
        tenantId: membership?.tenantId || '',
        tenantRole: 'SUPERADMIN',
        tenant: membership?.tenant ? {
          id: membership.tenant.id,
          name: membership.tenant.name,
          slug: membership.tenant.slug,
          plan: membership.tenant.plan,
          status: membership.tenant.status,
          logoUrl: membership.tenant.logoUrl,
          colors: membership.tenant.colors,
        } : undefined,
      };
      return next();
    }

    const memberships = await prisma.membership.findMany({
      where: { userId: user.id, active: true },
      orderBy: { createdAt: 'asc' },
      include: { tenant: { include: { subscription: true } } },
    });

    if (memberships.length === 0) {
      return res.status(403).json({ error: 'Sem vínculo com nenhuma clínica. Fale com o administrador.' });
    }

    const headerTenantId = String(req.headers['x-tenant-id'] || '');
    let membership = headerTenantId
      ? memberships.find((m) => m.tenantId === headerTenantId)
      : memberships.find((m) => m.tenant.status !== 'BLOQUEADO');

    if (!membership) {
      return res.status(403).json({ error: 'Assinatura da clínica vencida ou bloqueada. Entre em contato com o suporte.' });
    }

    await enforceTenantStatus(membership.tenant);

    if (membership.tenant.status === 'BLOQUEADO') {
      return res.status(403).json({ error: 'Assinatura da clínica vencida ou bloqueada. Entre em contato com o suporte.' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: membership.role,
      tenantId: membership.tenantId,
      tenantRole: membership.role,
      tenant: {
        id: membership.tenant.id,
        name: membership.tenant.name,
        slug: membership.tenant.slug,
        plan: membership.tenant.plan,
        status: membership.tenant.status,
        logoUrl: membership.tenant.logoUrl,
        colors: membership.tenant.colors,
      },
    };
    next();
  } catch {
    return res.status(500).json({ error: 'Erro ao autenticar' });
  }
};

export const authorizeSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  let payload: any;
  try {
    payload = jwt.verify(authHeader.split(' ')[1], getJwtSecret());
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    if (user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Acesso restrito ao Superadmin' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'SUPERADMIN',
      tenantId: '',
      tenantRole: 'SUPERADMIN',
    };
    next();
  } catch {
    return res.status(500).json({ error: 'Erro ao autenticar superadmin' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
};

export const checkPermission = (module: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (req.user.role === 'GESTOR') return next();

    try {
      const prisma = (await import('../lib/prisma')).default;
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const permissions = (user as any)?.permissions || {};
      const modulePerms = permissions[module] || [];

      if (!modulePerms.includes(action)) {
        return res.status(403).json({ error: 'Sem permissão para esta ação' });
      }
      next();
    } catch {
      return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
};