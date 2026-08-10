import prisma from './prisma';

const TRIAL_DAYS = 14;

export const BILLING_ENABLED = !!process.env.ASAAS_API_KEY || !!process.env.MERCADOPAGO_ACCESS_TOKEN;

function providerName() {
  if (process.env.ASAAS_API_KEY) return 'asaas';
  if (process.env.MERCADOPAGO_ACCESS_TOKEN) return 'mercadopago';
  return 'mock';
}

export async function getPlan(code: string) {
  return prisma.plan.findUnique({ where: { code } });
}

export async function getOrCreateSubscription(tenantId: string) {
  let sub = await prisma.subscription.findUnique({ where: { tenantId } });
  if (sub) return sub;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error('Tenant não encontrado');

  const end = tenant.trialEndsAt && tenant.trialEndsAt > new Date()
    ? tenant.trialEndsAt
    : new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  sub = await prisma.subscription.create({
    data: {
      tenantId,
      planCode: 'TRIAL',
      status: 'TRIAL',
      currentPeriodStart: new Date(),
      currentPeriodEnd: end,
    },
  });

  if (!tenant.trialEndsAt) {
    await prisma.tenant.update({ where: { id: tenantId }, data: { trialEndsAt: end } });
  }
  return sub;
}

export async function enforceTenantStatus(tenant: any) {
  if (tenant.status === 'BLOQUEADO') return;

  const sub = tenant.subscription || await prisma.subscription.findUnique({ where: { tenantId: tenant.id } });
  if (!sub) {
    await getOrCreateSubscription(tenant.id);
    return;
  }

  const expired = sub.currentPeriodEnd && sub.currentPeriodEnd < new Date();
  const blocked =
    sub.status === 'BLOQUEADO' ||
    (sub.status === 'CANCELADA' && expired) ||
    (sub.status !== 'ATIVA' && sub.status !== 'TRIAL' && expired) ||
    (sub.planCode === 'TRIAL' && expired);

  if (blocked) {
    await prisma.tenant.update({ where: { id: tenant.id }, data: { status: 'BLOQUEADO' } });
    tenant.status = 'BLOQUEADO';
  }
}

export async function getUsage(tenantId: string) {
  const [pacientes, profissionais] = await Promise.all([
    prisma.paciente.count({ where: { tenantId } }),
    prisma.membership.count({
      where: { tenantId, role: { not: 'RESPONSAVEL' } },
    }),
  ]);
  return { pacientes, profissionais };
}

export async function enforcePlanLimits(tenantId: string, kind: 'paciente' | 'profissional') {
  const sub = await getOrCreateSubscription(tenantId);
  const plan = await getPlan(sub.planCode);
  if (!plan) return;

  const usage = await getUsage(tenantId);
  const current = kind === 'paciente' ? usage.pacientes : usage.profissionais;
  const max = kind === 'paciente' ? plan.maxPacientes : plan.maxProfissionais;

  if (current >= max) {
    const err: any = new Error(
      `Limite do plano ${plan.name} atingido (${current}/${max} ${kind === 'paciente' ? 'pacientes' : 'profissionais'}). Faça upgrade para continuar.`
    );
    err.status = 402;
    throw err;
  }
}

export async function checkoutPlan(tenantId: string, planCode: string) {
  const plan = await getPlan(planCode);
  if (!plan) {
    const err: any = new Error('Plano não encontrado');
    err.status = 404;
    throw err;
  }

  const provider = providerName();
  const now = new Date();
  let providerId: string | null = null;
  let pixCopiaECola: string | null = null;
  let pixExpiresAt: Date | null = null;

  if (provider === 'mock') {
    providerId = `mock_${Date.now()}`;
    pixCopiaECola = `00020126580014BR.GOV.BCB.PIX0136edupsych-${plan.code.toLowerCase()}-${Date.now()}520400005303986540${plan.priceCents / 100}5802BR5913EduPsych Pro6009SAO PAULO62070503***6304ABCD`;
    pixExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    console.log(`[BILLING][MOCK] Cobrança PIX criada para ${tenantId}: ${plan.code} R$${(plan.priceCents / 100).toFixed(2)}`);
  } else if (provider === 'asaas') {
    const apiKey = process.env.ASAAS_API_KEY!;
    const res = await fetch(
      process.env.ASAAS_ENV === 'sandbox'
        ? 'https://sandbox.asaas.com/api/v3/payments'
        : 'https://api.asaas.com/v3/payments',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', access_token: apiKey },
        body: JSON.stringify({
          customer: tenantId,
          billingType: 'PIX',
          value: plan.priceCents / 100,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: `Assinatura ${plan.name} - EduPsych Pro`,
        }),
      }
    );
    const data: any = await res.json();
    if (!res.ok) {
      const err: any = new Error(`Asaas: ${data.errors?.[0]?.description || 'erro ao criar cobrança'}`);
      err.status = 502;
      throw err;
    }
    providerId = data.id;
  } else {
    const err: any = new Error('Provedor de pagamento não configurado');
    err.status = 503;
    throw err;
  }

  const sub = await prisma.subscription.upsert({
    where: { tenantId },
    update: {
      planCode,
      status: 'PENDENTE',
      provider,
      providerId,
      pixCopiaECola,
      pixExpiresAt,
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
    create: {
      tenantId,
      planCode,
      status: 'PENDENTE',
      provider,
      providerId,
      pixCopiaECola,
      pixExpiresAt,
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return { subscription: sub, plan, provider, pixCopiaECola };
}

export async function activateSubscription(tenantId: string, planCode: string) {
  if (!planCode) {
    const sub = await prisma.subscription.findUnique({ where: { tenantId } });
    planCode = sub?.planCode || 'TRIAL';
  }

  const now = new Date();
  await prisma.subscription.update({
    where: { tenantId },
    data: {
      status: 'ATIVA',
      planCode,
      pixCopiaECola: null,
      pixExpiresAt: null,
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.tenant.update({ where: { id: tenantId }, data: { status: 'ATIVO', plan: planCode } });

  const plan = await prisma.plan.findUnique({ where: { code: planCode } });
  return { plan };
}