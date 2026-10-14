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
  sendWhatsAppMessage,
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
// =========================================================================
// 8. GESTÃO FINANCEIRA E FATURAMENTO DE CLÍNICAS (SAAS MASTER)
// =========================================================================

async function ensureSampleInvoices() {
  try {
    const count = await prisma.subscriptionInvoice.count();
    if (count > 0) return;

    const tenants = await prisma.tenant.findMany({
      include: {
        subscription: true,
        memberships: {
          where: { role: 'GESTOR' },
          include: { user: true },
        },
      },
      take: 10,
    });

    const now = new Date();
    for (const t of tenants) {
      const plan = (t.plan || 'PRO').toUpperCase();
      const amountCents = plan === 'PRO' ? 14700 : plan === 'BASICO' ? 7900 : plan === 'VIP' ? 29700 : 0;
      if (amountCents === 0) continue;

      // Fatura anterior PAGA
      await prisma.subscriptionInvoice.create({
        data: {
          tenantId: t.id,
          subscriptionId: t.subscription?.id,
          planCode: plan,
          amountCents,
          status: 'PAGA',
          dueDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
          paidAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
          paymentMethod: 'PIX',
          provider: 'manual',
          pixCopiaECola: '00020126580014br.gov.bcb.pix0136edupsych-fatura-saas-pagamento5204000053039865802BR5920EDUPSYCH PRO SAAS6009SAO PAULO62070503***6304E1F4',
          notes: 'Pagamento inicial confirmado via PIX',
        },
      });

      // Fatura do ciclo atual (PENDENTE)
      await prisma.subscriptionInvoice.create({
        data: {
          tenantId: t.id,
          subscriptionId: t.subscription?.id,
          planCode: plan,
          amountCents,
          status: 'PENDENTE',
          dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
          paymentMethod: 'PIX',
          provider: 'manual',
          pixCopiaECola: '00020126580014br.gov.bcb.pix0136edupsych-fatura-saas-pagamento5204000053039865802BR5920EDUPSYCH PRO SAAS6009SAO PAULO62070503***6304E1F4',
          notes: 'Ciclo mensal vigente',
        },
      });
    }
  } catch (err) {
    console.warn('[ENSURE_SAMPLE_INVOICES_WARN]', err);
  }
}

// 8.1 Estatísticas Financeiras SaaS Globais
router.get('/billing/stats', async (req, res) => {
  try {
    await ensureSampleInvoices();

    const now = new Date();
    const invoices = await prisma.subscriptionInvoice.findMany();

    let totalReceivedCents = 0;
    let totalPendingCents = 0;
    let totalOverdueCents = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    for (const inv of invoices) {
      if (inv.status === 'PAGA') {
        totalReceivedCents += inv.amountCents;
        paidCount++;
      } else if (inv.status === 'VENCIDA' || (inv.status === 'PENDENTE' && inv.dueDate < now)) {
        totalOverdueCents += inv.amountCents;
        overdueCount++;
      } else if (inv.status === 'PENDENTE') {
        totalPendingCents += inv.amountCents;
        pendingCount++;
      }
    }

    const totalCount = invoices.length;

    // Calcular MRR a partir das clínicas ativas em planos pagos
    const activeTenants = await prisma.tenant.findMany({
      where: { status: 'ATIVO' },
      select: { plan: true },
    });
    const plans = await prisma.plan.findMany();
    const planPriceMap: Record<string, number> = {};
    plans.forEach((p) => { planPriceMap[p.code] = p.priceCents; });

    let mrrCents = 0;
    activeTenants.forEach((t) => {
      const code = (t.plan || '').toUpperCase();
      if (planPriceMap[code]) mrrCents += planPriceMap[code];
    });

    const formatBRL = (cents: number) =>
      (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return res.json({
      totalReceivedCents,
      totalReceivedFormatted: formatBRL(totalReceivedCents),
      totalPendingCents,
      totalPendingFormatted: formatBRL(totalPendingCents),
      totalOverdueCents,
      totalOverdueFormatted: formatBRL(totalOverdueCents),
      mrrCents,
      mrrFormatted: formatBRL(mrrCents),
      paidCount,
      pendingCount,
      overdueCount,
      totalCount,
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_BILLING_STATS_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao carregar métricas financeiras' });
  }
});

// 8.2 Listagem Paginada de Faturas com Filtros e Busca
router.get('/billing/invoices', async (req, res) => {
  try {
    await ensureSampleInvoices();

    const { search, status, tenantId, page = '1', limit = '50' } = req.query;
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const skip = (p - 1) * l;

    const where: any = {};
    const now = new Date();

    if (tenantId) {
      where.tenantId = String(tenantId);
    }

    if (status && status !== 'TODAS') {
      const st = String(status).toUpperCase();
      if (st === 'VENCIDA') {
        where.OR = [
          { status: 'VENCIDA' },
          { status: 'PENDENTE', dueDate: { lt: now } },
        ];
      } else if (st === 'PENDENTE') {
        where.status = 'PENDENTE';
        where.dueDate = { gte: now };
      } else {
        where.status = st;
      }
    }

    if (search) {
      const query = String(search).trim();
      where.tenant = {
        OR: [
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
        ],
      };
    }

    const [total, invoices] = await Promise.all([
      prisma.subscriptionInvoice.count({ where }),
      prisma.subscriptionInvoice.findMany({
        where,
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: {
            include: {
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
          },
          subscription: true,
        },
      }),
    ]);

    const formatted = invoices.map((inv) => {
      const isOverdue = inv.status === 'PENDENTE' && inv.dueDate < now;
      const effectiveStatus = isOverdue ? 'VENCIDA' : inv.status;
      const gestor = inv.tenant.memberships[0]?.user || null;

      return {
        id: inv.id,
        tenantId: inv.tenantId,
        tenantName: inv.tenant.name,
        tenantSlug: inv.tenant.slug,
        tenantStatus: inv.tenant.status,
        planCode: inv.planCode,
        amountCents: inv.amountCents,
        amountFormatted: (inv.amountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        status: effectiveStatus,
        dueDate: inv.dueDate,
        paidAt: inv.paidAt,
        paymentMethod: inv.paymentMethod || 'PIX',
        provider: inv.provider || 'manual',
        providerPaymentId: inv.providerPaymentId,
        pixCopiaECola: inv.pixCopiaECola,
        pixQrImage: inv.pixQrImage,
        notes: inv.notes,
        createdAt: inv.createdAt,
        owner: gestor ? {
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
    console.error('[SUPERADMIN_BILLING_INVOICES_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao listar faturas' });
  }
});

// 8.3 Dar Baixa Manual / Confirmar Pagamento de Fatura
router.post('/billing/invoices/:id/confirm-payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod = 'PIX', notes } = req.body;

    const invoice = await prisma.subscriptionInvoice.findUnique({
      where: { id },
      include: { tenant: { include: { subscription: true } } },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Fatura não encontrada' });
    }

    const paidAt = new Date();
    const updatedInvoice = await prisma.subscriptionInvoice.update({
      where: { id },
      data: {
        status: 'PAGA',
        paidAt,
        paymentMethod: paymentMethod || invoice.paymentMethod || 'MANUAL',
        notes: notes ? `${invoice.notes ? invoice.notes + ' | ' : ''}${notes}` : invoice.notes,
      },
    });

    // Renovar ou atualizar a assinatura da clínica (+30 dias) e reativar se bloqueada
    const currentSub = invoice.tenant.subscription;
    const baseDate = currentSub?.currentPeriodEnd && currentSub.currentPeriodEnd > new Date()
      ? currentSub.currentPeriodEnd
      : new Date();
    const nextPeriodEnd = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (currentSub) {
      await prisma.subscription.update({
        where: { id: currentSub.id },
        data: {
          status: 'ATIVA',
          currentPeriodEnd: nextPeriodEnd,
          planCode: invoice.planCode || currentSub.planCode,
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          tenantId: invoice.tenantId,
          planCode: invoice.planCode || 'PRO',
          status: 'ATIVA',
          currentPeriodStart: new Date(),
          currentPeriodEnd: nextPeriodEnd,
          provider: 'manual',
        },
      });
    }

    // Garante que o status do tenant esteja ATIVO
    await prisma.tenant.update({
      where: { id: invoice.tenantId },
      data: {
        status: 'ATIVO',
        plan: invoice.planCode || invoice.tenant.plan,
      },
    });

    return res.json({
      message: 'Pagamento confirmado com sucesso! Assinatura renovada e clínica reativada.',
      invoice: updatedInvoice,
      nextPeriodEnd,
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_BILLING_CONFIRM_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao confirmar pagamento' });
  }
});

// 8.4 Criação Manual de Fatura
router.post('/billing/invoices/create-manual', async (req, res) => {
  try {
    const { tenantId, planCode = 'PRO', amountCents, dueDate, notes, paymentMethod = 'PIX' } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Clínica (tenantId) é obrigatória' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { subscription: true },
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Clínica não encontrada' });
    }

    let cents = Number(amountCents);
    if (!cents || cents <= 0) {
      const plan = await prisma.plan.findUnique({ where: { code: planCode } });
      cents = plan?.priceCents || (planCode === 'PRO' ? 14700 : planCode === 'BASICO' ? 7900 : 29700);
    }

    const due = dueDate ? new Date(dueDate) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    // Buscar chave PIX configurada do SaaS
    const saasConfig = await prisma.saaSBillingConfig.findUnique({
      where: { id: 'saas_default_config' },
    });

    const defaultPix = saasConfig?.pixKey
      ? `PIX: ${saasConfig.pixKey} (${saasConfig.beneficiaryName || 'EduPsych Pro'})`
      : '00020126580014br.gov.bcb.pix0136edupsych-fatura-saas-pagamento5204000053039865802BR5920EDUPSYCH PRO SAAS6009SAO PAULO62070503***6304E1F4';

    const invoice = await prisma.subscriptionInvoice.create({
      data: {
        tenantId,
        subscriptionId: tenant.subscription?.id,
        planCode,
        amountCents: cents,
        status: 'PENDENTE',
        dueDate: due,
        paymentMethod,
        provider: 'manual',
        pixCopiaECola: defaultPix,
        notes: notes || 'Fatura gerada manualmente pelo Superadmin',
      },
    });

    return res.json({
      message: 'Fatura gerada com sucesso!',
      invoice,
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_BILLING_CREATE_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao gerar fatura' });
  }
});

// 8.5 Enviar Lembrete / Aviso de Cobrança via WhatsApp
router.post('/billing/invoices/:id/send-reminder', async (req, res) => {
  try {
    const { id } = req.params;

    const [invoice, saasConfig] = await Promise.all([
      prisma.subscriptionInvoice.findUnique({
        where: { id },
        include: {
          tenant: {
            include: {
              memberships: {
                where: { role: 'GESTOR' },
                include: { user: true },
                take: 1,
              },
              whatsappConfigs: true,
            },
          },
        },
      }),
      prisma.saaSBillingConfig.findUnique({
        where: { id: 'saas_default_config' },
      }),
    ]);

    if (!invoice) {
      return res.status(404).json({ error: 'Fatura não encontrada' });
    }

    const gestor = invoice.tenant.memberships[0]?.user;
    if (!gestor || !gestor.phone) {
      return res.status(400).json({
        error: 'Gestor da clínica não possui telefone cadastrado para envio de WhatsApp.',
      });
    }

    const valorFormatado = (invoice.amountCents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    const vencimentoFormatado = new Date(invoice.dueDate).toLocaleDateString('pt-BR');

    // Montar detalhes da conta de recebimento configurada
    const dadosRecebimento: string[] = [];
    if (saasConfig?.pixKey) {
      dadosRecebimento.push(`🔑 *Chave PIX (${saasConfig.pixKeyType || 'PIX'}):* \`${saasConfig.pixKey}\``);
      if (saasConfig.beneficiaryName) {
        dadosRecebimento.push(`👤 *Favorecido:* ${saasConfig.beneficiaryName}${saasConfig.beneficiaryDoc ? ` (${saasConfig.beneficiaryDoc})` : ''}`);
      }
      if (saasConfig.bankName) {
        dadosRecebimento.push(`🏦 *Banco:* ${saasConfig.bankName} | Ag: ${saasConfig.bankAgency || '-'} | Conta: ${saasConfig.bankAccount || '-'}`);
      }
    } else if (invoice.pixCopiaECola) {
      dadosRecebimento.push(`🔑 *PIX Copia e Cola para pagamento:*\n\`${invoice.pixCopiaECola}\``);
    }

    const message = [
      `*EduPsych Pro - Lembrete de Assinatura SaaS* 📋`,
      ``,
      `Olá, *${gestor.name || 'Gestor(a)'}*!`,
      `Esperamos que a gestão da clínica *${invoice.tenant.name}* esteja excelente.`,
      ``,
      `Passando para lembrar sobre a fatura de renovação da plataforma:`,
      `📌 *Plano:* ${invoice.planCode}`,
      `💵 *Valor:* ${valorFormatado}`,
      `🗓️ *Vencimento:* ${vencimentoFormatado}`,
      `⚙️ *Status:* ${invoice.status}`,
      ``,
      dadosRecebimento.length > 0 ? dadosRecebimento.join('\n') + '\n' : '',
      `Após o pagamento, o comprovante pode ser enviado por aqui para confirmação imediata.`,
      `Agradecemos pela parceria! 🚀`,
    ].filter(Boolean).join('\n');

    let sentViaEvolution = false;
    let evolutionError: string | null = null;

    try {
      const instance = invoice.tenant.whatsappConfigs[0]?.phoneNumberId;
      await sendWhatsAppMessage(gestor.phone, message, undefined, {
        apiUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
        token: process.env.EVOLUTION_API_KEY || '',
        phoneNumberId: instance,
      });
      sentViaEvolution = true;
    } catch (evoErr: any) {
      evolutionError = evoErr?.message || 'Falha na conexão com a Evolution API';
      console.warn('[SUPERADMIN_REMINDER_EVOLUTION_WARN]', evoErr?.message);
    }

    // Registra envio no histórico da fatura
    const updatedNotes = `${invoice.notes ? invoice.notes + ' | ' : ''}Lembrete WhatsApp enviado para ${gestor.phone} em ${new Date().toLocaleString('pt-BR')}`;
    await prisma.subscriptionInvoice.update({
      where: { id },
      data: { notes: updatedNotes },
    });

    return res.json({
      success: true,
      sentViaEvolution,
      recipient: {
        name: gestor.name,
        phone: gestor.phone,
      },
      evolutionError: !sentViaEvolution ? evolutionError : undefined,
      message: sentViaEvolution
        ? `Lembrete enviado com sucesso via WhatsApp para ${gestor.phone}!`
        : `Lembrete registrado no log! (Instância WhatsApp da Evolution API não conectada no momento: ${evolutionError})`,
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_BILLING_REMINDER_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao disparar lembrete' });
  }
});

// 8.6 Obter Configurações de Recebimento SaaS
router.get('/billing/config', async (req, res) => {
  try {
    let config = await prisma.saaSBillingConfig.findUnique({
      where: { id: 'saas_default_config' },
    });

    if (!config) {
      config = await prisma.saaSBillingConfig.create({
        data: {
          id: 'saas_default_config',
          pixKeyType: 'CNPJ',
          pixKey: '51.984.732/0001-40',
          beneficiaryName: 'EduPsych Pro Tecnologia & Gestão Clínica LTDA',
          beneficiaryDoc: '51.984.732/0001-40',
          bankName: 'Nubank (260)',
          bankAgency: '0001',
          bankAccount: '1234567-8',
          bankAccountType: 'CORRENTE',
          gatewayProvider: 'none',
          autoReminderMessage: 'Olá, {gestor}! Sua fatura do plano {plano} vence em {vencimento}. Chave PIX: {chave_pix}',
        },
      });
    }

    return res.json({
      success: true,
      config,
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_GET_BILLING_CONFIG_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao buscar configurações de recebimento' });
  }
});

// 8.7 Atualizar Configurações de Recebimento SaaS
router.put('/billing/config', async (req, res) => {
  try {
    const {
      pixKeyType,
      pixKey,
      beneficiaryName,
      beneficiaryDoc,
      bankName,
      bankAgency,
      bankAccount,
      bankAccountType,
      gatewayProvider,
      gatewayApiKey,
      gatewayWebhookSecret,
      autoReminderMessage,
    } = req.body;

    const updated = await prisma.saaSBillingConfig.upsert({
      where: { id: 'saas_default_config' },
      update: {
        pixKeyType: pixKeyType || 'CNPJ',
        pixKey: pixKey || null,
        beneficiaryName: beneficiaryName || null,
        beneficiaryDoc: beneficiaryDoc || null,
        bankName: bankName || null,
        bankAgency: bankAgency || null,
        bankAccount: bankAccount || null,
        bankAccountType: bankAccountType || 'CORRENTE',
        gatewayProvider: gatewayProvider || 'none',
        gatewayApiKey: gatewayApiKey || null,
        gatewayWebhookSecret: gatewayWebhookSecret || null,
        autoReminderMessage: autoReminderMessage || null,
      },
      create: {
        id: 'saas_default_config',
        pixKeyType: pixKeyType || 'CNPJ',
        pixKey: pixKey || null,
        beneficiaryName: beneficiaryName || null,
        beneficiaryDoc: beneficiaryDoc || null,
        bankName: bankName || null,
        bankAgency: bankAgency || null,
        bankAccount: bankAccount || null,
        bankAccountType: bankAccountType || 'CORRENTE',
        gatewayProvider: gatewayProvider || 'none',
        gatewayApiKey: gatewayApiKey || null,
        gatewayWebhookSecret: gatewayWebhookSecret || null,
        autoReminderMessage: autoReminderMessage || null,
      },
    });

    return res.json({
      success: true,
      message: 'Configurações de recebimento salvas com sucesso!',
      config: updated,
    });
  } catch (error: any) {
    console.error('[SUPERADMIN_PUT_BILLING_CONFIG_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao salvar configurações de recebimento' });
  }
});

export default router;
