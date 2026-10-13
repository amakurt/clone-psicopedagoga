import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authorizeSuperAdmin } from '../middleware';
import {
  checkEvolutionHealth,
  fetchEvolutionInstances,
  getEvolutionInstanceStatus,
  getEvolutionQrCode,
  createEvolutionInstance,
  restartEvolutionInstance,
  logoutEvolutionInstance,
  syncTenantWhatsAppInstance,
  isPlanWhatsAppEligible,
} from '../services/whatsapp-client.service';

const router = Router();

// Todas as rotas deste router exigem SUPERADMIN
router.use(authorizeSuperAdmin);

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não definido.');
  }
  return secret;
}

// 1. Estatísticas Globais do SaaS
router.get('/stats', async (req, res) => {
  try {
    const [
      tenantsTotal,
      tenantsActive,
      tenantsBlocked,
      tenantsTrial,
      totalPacientes,
      totalProfissionais,
      totalSessoes,
      allTenants,
      allPlans,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ATIVO' } }),
      prisma.tenant.count({ where: { status: 'BLOQUEADO' } }),
      prisma.tenant.count({ where: { plan: 'TRIAL' } }),
      prisma.paciente.count(),
      prisma.user.count({ where: { role: { in: ['GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO'] } } }),
      prisma.sessao.count(),
      prisma.tenant.findMany({
        where: { status: 'ATIVO' },
        select: { plan: true },
      }),
      prisma.plan.findMany(),
    ]);

    const planPriceMap: Record<string, number> = {};
    allPlans.forEach((p) => {
      planPriceMap[p.code] = p.priceCents;
    });

    let mrrCents = 0;
    const planCounts: Record<string, number> = {
      TRIAL: 0,
      BASICO: 0,
      PRO: 0,
      VIP: 0,
      OUTROS: 0,
    };

    allTenants.forEach((t) => {
      const p = (t.plan || 'TRIAL').toUpperCase();
      if (planCounts[p] !== undefined) {
        planCounts[p] += 1;
      } else {
        planCounts.OUTROS += 1;
      }

      if (planPriceMap[p]) {
        mrrCents += planPriceMap[p];
      }
    });

    return res.json({
      tenantsTotal,
      tenantsActive,
      tenantsBlocked,
      tenantsTrial,
      totalPacientes,
      totalProfissionais,
      totalSessoes,
      mrrCents,
      mrrFormatted: (mrrCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      planCounts,
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_STATS_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao carregar métricas globais' });
  }
});

// 2. Listagem de Clínicas (Tenants) com Agregações e Filtros
router.get('/tenants', async (req, res) => {
  try {
    const { search, status, plan, page = '1', limit = '50' } = req.query;
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const skip = (p - 1) * l;

    const where: any = {};

    if (status && status !== 'TODOS') {
      where.status = String(status).toUpperCase();
    }

    if (plan && plan !== 'TODOS') {
      where.plan = String(plan).toUpperCase();
    }

    if (search) {
      const query = String(search).trim();
      where.OR = [
        { name: { contains: query } },
        { slug: { contains: query } },
        {
          memberships: {
            some: {
              role: 'GESTOR',
              user: {
                OR: [
                  { name: { contains: query } },
                  { email: { contains: query } },
                ],
              },
            },
          },
        },
      ];
    }

    const [total, tenants] = await Promise.all([
      prisma.tenant.count({ where }),
      prisma.tenant.findMany({
        where,
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: true,
          _count: {
            select: {
              pacientes: true,
              memberships: true,
              sessoes: true,
            },
          },
          memberships: {
            where: { role: 'GESTOR' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
            take: 1,
          },
        },
      }),
    ]);

    const formatted = tenants.map((t) => {
      const gestor = t.memberships[0]?.user || null;
      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        plan: t.plan,
        status: t.status,
        trialEndsAt: t.trialEndsAt,
        logoUrl: t.logoUrl,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        stats: {
          pacientes: t._count.pacientes,
          profissionais: t._count.memberships,
          sessoes: t._count.sessoes,
        },
        subscription: t.subscription ? {
          id: t.subscription.id,
          planCode: t.subscription.planCode,
          status: t.subscription.status,
          currentPeriodEnd: t.subscription.currentPeriodEnd,
          provider: t.subscription.provider,
        } : null,
        owner: gestor ? {
          id: gestor.id,
          name: gestor.name,
          email: gestor.email,
          phone: gestor.phone,
        } : null,
      };
    });

    return res.json({
      data: formatted,
      pagination: {
        page: p,
        limit: l,
        total,
        totalPages: Math.ceil(total / l),
      },
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_TENANTS_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao listar clínicas' });
  }
});

// 3. Alterar Status da Clínica (Bloquear / Desbloquear)
router.patch('/tenants/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ATIVO', 'BLOQUEADO'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido. Use ATIVO ou BLOQUEADO.' });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return res.status(404).json({ error: 'Clínica não encontrada' });
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: { status },
      include: { subscription: true },
    });

    if (updated.subscription) {
      await prisma.subscription.update({
        where: { id: updated.subscription.id },
        data: { status: status === 'BLOQUEADO' ? 'SUSPENSA' : 'ATIVA' },
      });
    }

    // Regra A: Sincroniza / desconecta WhatsApp se a clínica for bloqueada ou reativada
    syncTenantWhatsAppInstance(id).catch((err) => {
      console.warn(`[SUPERADMIN_STATUS_WHATSAPP_SYNC_WARN] Tenant ${id}:`, err?.message);
    });

    return res.json({
      message: `Clínica ${status === 'BLOQUEADO' ? 'bloqueada' : 'desbloqueada'} com sucesso`,
      tenant: {
        id: updated.id,
        name: updated.name,
        status: updated.status,
        plan: updated.plan,
      },
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_STATUS_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao atualizar status da clínica' });
  }
});

// 4. Prorrogar Trial da Clínica
router.patch('/tenants/:id/trial', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 14 } = req.body;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: { subscription: true },
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Clínica não encontrada' });
    }

    // Calcular nova data de trial a partir de hoje ou a partir do vencimento se ainda for futuro
    const baseDate = tenant.trialEndsAt && new Date(tenant.trialEndsAt) > new Date()
      ? new Date(tenant.trialEndsAt)
      : new Date();

    const newTrialDate = new Date(baseDate.getTime() + Number(days) * 24 * 60 * 60 * 1000);

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        trialEndsAt: newTrialDate,
        status: 'ATIVO', // Reativa caso estivesse bloqueada por trial expirado
        plan: tenant.plan === 'BLOQUEADO' ? 'TRIAL' : tenant.plan,
      },
    });

    if (tenant.subscription) {
      await prisma.subscription.update({
        where: { id: tenant.subscription.id },
        data: {
          currentPeriodEnd: newTrialDate,
          status: 'TRIAL',
        },
      });
    }

    return res.json({
      message: `Trial prorrogado em +${days} dias com sucesso`,
      trialEndsAt: updated.trialEndsAt,
      status: updated.status,
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_TRIAL_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao prorrogar trial' });
  }
});

// 5. Alterar Plano da Clínica Manualmente
router.patch('/tenants/:id/plan', async (req, res) => {
  try {
    const { id } = req.params;
    const { planCode } = req.body;

    const validPlans = ['TRIAL', 'BASICO', 'PRO', 'VIP'];
    if (!validPlans.includes(planCode)) {
      return res.status(400).json({ error: 'Plano inválido. Use TRIAL, BASICO, PRO ou VIP.' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: { subscription: true },
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Clínica não encontrada' });
    }

    const isVip = planCode === 'VIP';
    const futurePeriod = isVip
      ? new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 anos
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: {
        plan: planCode,
        status: 'ATIVO',
      },
    });

    if (tenant.subscription) {
      await prisma.subscription.update({
        where: { id: tenant.subscription.id },
        data: {
          planCode,
          status: 'ATIVA',
          currentPeriodEnd: futurePeriod,
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          tenantId: id,
          planCode,
          status: 'ATIVA',
          currentPeriodStart: new Date(),
          currentPeriodEnd: futurePeriod,
          provider: isVip ? 'vip_manual' : 'manual',
        },
      });
    }

    // Regra A: Sincroniza / desconecta WhatsApp se rebaixado para Básico ou provisiona se PRO/VIP
    syncTenantWhatsAppInstance(id).catch((err) => {
      console.warn(`[SUPERADMIN_PLAN_WHATSAPP_SYNC_WARN] Tenant ${id}:`, err?.message);
    });

    return res.json({
      message: `Plano atualizado para ${planCode} com sucesso`,
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        plan: updatedTenant.plan,
        status: updatedTenant.status,
      },
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_PLAN_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao alterar plano da clínica' });
  }
});

// 6. Entrar como a Clínica (Modo Suporte / Impersonação)
router.post('/tenants/:id/impersonate', async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Clínica não encontrada' });
    }

    // Priorizar usuário com papel GESTOR, ou qualquer usuário ativo da clínica
    const targetMembership = tenant.memberships.find((m) => m.role === 'GESTOR') || tenant.memberships[0];

    if (!targetMembership || !targetMembership.user) {
      return res.status(400).json({ error: 'Nenhum usuário gestor encontrado nesta clínica para impersonação' });
    }

    const targetUser = targetMembership.user;

    // Gerar token assinado para a sessão de suporte
    const token = jwt.sign(
      {
        sub: targetUser.id,
        email: targetUser.email,
        role: targetMembership.role,
        isImpersonated: true,
        impersonatedBy: (req as any).user?.id,
        impersonatedTenantId: tenant.id,
      },
      getJwtSecret(),
      { expiresIn: '12h' }
    );

    const userPayload = {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetMembership.role,
      avatarUrl: targetUser.avatarUrl,
      phone: targetUser.phone,
      isImpersonated: true,
    };

    const tenantPayload = {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      status: tenant.status,
      logoUrl: tenant.logoUrl,
      colors: tenant.colors,
      role: targetMembership.role,
    };

    return res.json({
      token,
      user: userPayload,
      tenant: tenantPayload,
      isImpersonated: true,
      message: `Acesso em modo suporte iniciado para a clínica ${tenant.name}`,
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_IMPERSONATE_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao iniciar modo suporte' });
  }
});

// =========================================================================
// 7. GESTÃO CENTRALIZADA DA EVOLUTION API (WHATSAPP MULTI-TENANT)
// =========================================================================

// 7.1 Status de Saúde do Servidor Evolution API
router.get('/whatsapp/status', async (req, res) => {
  try {
    const health = await checkEvolutionHealth();
    const rawInstances = await fetchEvolutionInstances();

    const counts = {
      total: rawInstances.length,
      open: rawInstances.filter((i) => i.connectionStatus === 'open' || i.state === 'open').length,
      close: rawInstances.filter((i) => i.connectionStatus === 'close' || i.state === 'close').length,
      connecting: rawInstances.filter((i) => i.connectionStatus === 'connecting' || i.state === 'connecting').length,
    };

    return res.json({
      health,
      counts,
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_WHATSAPP_STATUS_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao obter status da Evolution API' });
  }
});

// 7.2 Listagem de Todas as Clínicas com Status de WhatsApp / Instâncias
router.get('/whatsapp/instances', async (req, res) => {
  try {
    const [tenants, rawInstances] = await Promise.all([
      prisma.tenant.findMany({
        orderBy: { name: 'asc' },
        include: {
          whatsappConfigs: true,
          _count: {
            select: {
              whatsappConversations: true,
              pacientes: true,
            },
          },
        },
      }),
      fetchEvolutionInstances(),
    ]);

    const evoMap = new Map<string, any>();
    for (const inst of rawInstances) {
      const name = (inst.name || inst.instanceName || '').trim().toLowerCase();
      if (name) evoMap.set(name, inst);
    }

    const items = tenants.map((tenant) => {
      const config = tenant.whatsappConfigs[0] || null;
      const eligible = isPlanWhatsAppEligible(tenant.plan) && tenant.status === 'ATIVO';

      // Nome da instância esperado ou configurado
      let expectedInstance = config?.phoneNumberId || '';
      if (!expectedInstance) {
        expectedInstance = tenant.slug
          ? tenant.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '')
          : `clinica-${tenant.id.slice(-6)}`;
      }

      const live = evoMap.get(expectedInstance.toLowerCase());
      let state = 'not_provisioned';
      if (live) {
        state = live.connectionStatus || live.state || 'close';
      } else if (config?.phoneNumberId) {
        state = 'not_found';
      }

      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
        plan: tenant.plan || 'TRIAL',
        status: tenant.status,
        eligible,
        instanceName: expectedInstance,
        isProvisioned: !!live,
        state, // 'open' | 'close' | 'connecting' | 'not_provisioned' | 'not_found'
        ownerJid: live?.ownerJid || null,
        ownerPhone: live?.ownerJid ? live.ownerJid.replace(/@.*$/, '') : null,
        profileName: live?.profileName || null,
        profilePicUrl: live?.profilePicUrl || null,
        conversationsCount: tenant._count?.whatsappConversations || 0,
        pacientesCount: tenant._count?.pacientes || 0,
        aiEnabled: config?.aiEnabled ?? false,
      };
    });

    return res.json({
      instances: items,
      totalTenants: tenants.length,
      eligibleCount: items.filter((i) => i.eligible).length,
      connectedCount: items.filter((i) => i.state === 'open').length,
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_WHATSAPP_INSTANCES_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao listar instâncias de WhatsApp das clínicas' });
  }
});

// 7.3 Provisionar Instância para uma Clínica Específica
router.post('/whatsapp/instances/:tenantId/provision', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const result = await syncTenantWhatsAppInstance(tenantId);
    return res.json({
      message: 'Instância sincronizada com sucesso',
      ...result,
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_WHATSAPP_PROVISION_ERROR]', error);
    return res.status(500).json({ error: error.message || 'Erro ao provisionar instância' });
  }
});

// 7.4 Obter QR Code de Pareamento para a Clínica (Superadmin pode escanear)
router.get('/whatsapp/instances/:tenantId/qrcode', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { whatsappConfigs: true },
    });
    if (!tenant) return res.status(404).json({ error: 'Clínica não encontrada' });

    let instanceName = tenant.whatsappConfigs[0]?.phoneNumberId;
    if (!instanceName) {
      instanceName = tenant.slug
        ? tenant.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '')
        : `clinica-${tenant.id.slice(-6)}`;
      await syncTenantWhatsAppInstance(tenantId);
    }

    const qrResult = await getEvolutionQrCode(instanceName);
    return res.json({
      tenantId,
      tenantName: tenant.name,
      instanceName,
      ...qrResult,
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_WHATSAPP_QR_ERROR]', error);
    return res.status(500).json({ error: error.message || 'Erro ao obter QR Code' });
  }
});

// 7.5 Reiniciar Instância do WhatsApp
router.post('/whatsapp/instances/:tenantId/restart', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const config = await prisma.whatsAppConfig.findFirst({ where: { tenantId } });
    const instanceName = config?.phoneNumberId;
    if (!instanceName) {
      return res.status(400).json({ error: 'Clínica não possui instância configurada' });
    }

    const result = await restartEvolutionInstance(instanceName);
    if (!result.success) {
      return res.status(500).json({ error: result.error || 'Falha ao reiniciar' });
    }
    return res.json({ message: `Instância ${instanceName} reiniciada com sucesso` });
  } catch (error: any) {
    console.error('[SUPERADMIN_WHATSAPP_RESTART_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao reiniciar instância' });
  }
});

// 7.6 Desconectar (Logout) da Instância
router.post('/whatsapp/instances/:tenantId/disconnect', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const config = await prisma.whatsAppConfig.findFirst({ where: { tenantId } });
    const instanceName = config?.phoneNumberId;
    if (!instanceName) {
      return res.status(400).json({ error: 'Clínica não possui instância configurada' });
    }

    const result = await logoutEvolutionInstance(instanceName);
    if (!result.success) {
      return res.status(500).json({ error: result.error || 'Falha ao desconectar' });
    }
    return res.json({ message: `Instância ${instanceName} desconectada com sucesso` });
  } catch (error: any) {
    console.error('[SUPERADMIN_WHATSAPP_DISCONNECT_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao desconectar instância' });
  }
});

export default router;
