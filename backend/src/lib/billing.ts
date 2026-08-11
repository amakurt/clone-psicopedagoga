import prisma from './prisma';
import {
  getOrCreateCustomer,
  createSubscription,
  getSubscriptionFirstPayment,
  getPixQrCode,
} from './asaas';

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

async function createAsaasCheckout(tenantId: string, plan: any) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

  const customer = await getOrCreateCustomer(tenantId, tenant?.name || '');
  const subscription = await createSubscription(customer.id, tenantId, plan.name, plan.priceCents);
  const payment = await getSubscriptionFirstPayment(subscription.id);

  let payload: string | null = null;
  let encodedImage: string | null = null;
  let expirationDate: string | null = null;
  if (payment?.id) {
    const pix = await getPixQrCode(payment.id);
    payload = pix.payload;
    encodedImage = pix.encodedImage;
    expirationDate = pix.expirationDate;
  }

  console.log(`[BILLING][ASAAS] Assinatura ${subscription.id} criada para ${tenantId}: ${plan.code} R$${(plan.priceCents / 100).toFixed(2)}`);

  return {
    providerId: subscription.id,
    providerCustomerId: customer.id,
    providerPaymentId: payment?.id || null,
    pixCopiaECola: payload,
    pixQrImage: encodedImage,
    pixExpiresAt: expirationDate ? new Date(expirationDate.replace(' ', 'T')) : null,
  };
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
  let providerData: any = { providerId: null, providerCustomerId: null, providerPaymentId: null, pixCopiaECola: null, pixQrImage: null, pixExpiresAt: null };

  if (provider === 'mock') {
    providerData = {
      providerId: `mock_${Date.now()}`,
      pixCopiaECola: `00020126580014BR.GOV.BCB.PIX0136edupsych-${plan.code.toLowerCase()}-${Date.now()}520400005303986540${plan.priceCents / 100}5802BR5913EduPsych Pro6009SAO PAULO62070503***6304ABCD`,
      pixExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
    console.log(`[BILLING][MOCK] Cobrança PIX criada para ${tenantId}: ${plan.code} R$${(plan.priceCents / 100).toFixed(2)}`);
  } else if (provider === 'asaas') {
    providerData = await createAsaasCheckout(tenantId, plan);
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
      ...providerData,
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
    create: {
      tenantId,
      planCode,
      status: 'PENDENTE',
      provider,
      ...providerData,
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return { subscription: sub, plan, provider, pixCopiaECola: providerData.pixCopiaECola, pixQrImage: providerData.pixQrImage };
}

export async function activateSubscription(tenantId: string, planCode?: string) {
  const existing = await prisma.subscription.findUnique({ where: { tenantId } });
  if (!planCode) planCode = existing?.planCode || 'TRIAL';

  const now = new Date();
  const base = existing?.currentPeriodEnd && existing.currentPeriodEnd > now
    ? existing.currentPeriodEnd
    : now;

  await prisma.subscription.update({
    where: { tenantId },
    data: {
      status: 'ATIVA',
      planCode,
      pixCopiaECola: null,
      pixQrImage: null,
      pixExpiresAt: null,
      currentPeriodStart: now,
      currentPeriodEnd: new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.tenant.update({ where: { id: tenantId }, data: { status: 'ATIVO', plan: planCode } });

  const plan = await prisma.plan.findUnique({ where: { code: planCode } });
  return { plan };
}

export interface BillingWebhookResult {
  ok: boolean;
  activated?: boolean;
  ignored?: string;
  error?: string;
}

export async function processWebhookEvent(payload: any): Promise<BillingWebhookResult> {
  const eventName = String(payload?.event || '').toUpperCase();
  const payment = payload?.payment || {};
  const subscriptionInfo = payload?.subscription || {};

  const providerId = subscriptionInfo?.id || payment?.subscription || null;

  const isPaymentConfirmed =
    eventName === 'PAYMENT_CONFIRMED' ||
    eventName === 'PAYMENT_RECEIVED' ||
    eventName === 'PAYMENT_ANTICIPATED';

  if (!providerId) {
    const customerId = payment?.customer || null;
    if (customerId) {
      const byCustomer = await prisma.subscription.findFirst({ where: { providerCustomerId: customerId } });
      if (byCustomer) {
        const confirmedByCustomer =
          isPaymentConfirmed ||
          (payment?.status === 'CONFIRMED' && eventName.includes('PAYMENT'));
        if (confirmedByCustomer) {
          const { plan } = await activateSubscription(byCustomer.tenantId);
          return { ok: true, activated: true, ignored: undefined };
        }
      }
    }
    return { ok: true, ignored: eventName || 'unknown' };
  }

  const sub = await prisma.subscription.findFirst({ where: { providerId } });
  if (!sub) return { ok: true, ignored: `${eventName}: assinatura não encontrada no app` };

  if (isPaymentConfirmed) {
    if (sub.status === 'ATIVA' && payment.id && sub.providerPaymentId === payment.id) {
      return { ok: true, ignored: `${eventName}: evento já processado (mesma cobrança)` };
    }
    await activateSubscription(sub.tenantId, sub.planCode);
    await prisma.subscription.update({
      where: { tenantId: sub.tenantId },
      data: { providerPaymentId: payment.id || sub.providerPaymentId },
    });
    console.log(`[BILLING][ASAAS] Pagamento confirmado (${sub.planCode}) para tenant ${sub.tenantId}`);
    return { ok: true, activated: true };
  }

  if (eventName === 'PAYMENT_OVERDUE') {
    await prisma.subscription.update({
      where: { tenantId: sub.tenantId },
      data: { status: 'PENDENTE' },
    });
    return { ok: true, ignored: 'PAYMENT_OVERDUE' };
  }

  return { ok: true, ignored: eventName || 'unknown' };
}