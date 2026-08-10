import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware';
import {
  getOrCreateSubscription,
  enforceTenantStatus,
  getUsage,
  checkoutPlan,
  activateSubscription,
  BILLING_ENABLED,
} from '../lib/billing';
import { z } from 'zod';
import { validate } from '../middleware';

const router = Router();

const checkoutSchema = z.object({
  planCode: z.enum(['TRIAL', 'BASICO', 'PRO']),
});

router.get('/plans', async (req, res) => {
  const plans = await prisma.plan.findMany({ where: { active: true }, orderBy: { priceCents: 'asc' } });
  res.json({ data: plans });
});

router.get('/health', async (req, res) => {
  res.json({ enabled: BILLING_ENABLED, provider: process.env.ASAAS_API_KEY ? 'asaas' : process.env.MERCADOPAGO_ACCESS_TOKEN ? 'mercadopago' : 'mock' });
});

router.get('/', authenticate, async (req: any, res) => {
  const subscription = await getOrCreateSubscription(req.user.tenantId);
  const usage = await getUsage(req.user.tenantId);
  const plan = await prisma.plan.findUnique({ where: { code: subscription.planCode } });
  const tenants = await prisma.tenant.findUnique({
    where: { id: req.user.tenantId },
    select: { id: true, status: true, plan: true, trialEndsAt: true },
  });
  res.json({
    subscription,
    plan,
    usage,
    tenant: tenants,
    maxPacientes: plan?.maxPacientes ?? 0,
    maxProfissionais: plan?.maxProfissionais ?? 0,
  });
});

router.post('/checkout', authenticate, validate(checkoutSchema), async (req: any, res) => {
  const { planCode } = req.body;
  const result = await checkoutPlan(req.user.tenantId, planCode);
  res.json(result);
});

router.post('/mock-pay', authenticate, async (req: any, res) => {
  const sub = await getOrCreateSubscription(req.user.tenantId);
  if (sub.provider && sub.provider !== 'mock' && sub.status !== 'PENDENTE') {
    return res.status(400).json({ error: 'mock-pay só disponível no modo simulado' });
  }
  const { plan } = await activateSubscription(req.user.tenantId, sub.planCode);
  res.json({ message: 'Pagamento confirmado (modo simulado)', plan });
});

router.post('/webhook', async (req: any, res) => {
  const expected = process.env.BILLING_WEBHOOK_TOKEN || 'dev-webhook-token';
  const token = (req.headers['x-webhook-token'] || req.headers['x-billing-token']) as string;
  if (token !== expected) {
    return res.status(401).json({ error: 'Assinatura de webhook inválida' });
  }

  const { event, payment, subscription: subInfo } = req.body || {};
  const eventName = String(event?.event || payment?.event || event || '').toUpperCase();

  const tenantId = subInfo?.tenantId || payment?.customer || payment?.subscriptionId || req.body?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: 'tenantId não informado no webhook' });
  }

  const isPaymentConfirmed =
    eventName === 'PAYMENT_CONFIRMED' ||
    eventName === 'PAYMENT_RECEIVED' ||
    eventName.includes('PAYMENT_CONFIRMED') ||
    eventName.includes('PAYMENT_RECEIVED');

  if (isPaymentConfirmed) {
    const sub = await prisma.subscription.findUnique({ where: { tenantId } });
    if (!sub) return res.status(404).json({ error: 'Assinatura não encontrada' });
    const { plan } = await activateSubscription(tenantId, sub.planCode);
    console.log(`[BILLING] Pagamento confirmado (${sub.planCode}) para tenant ${tenantId}`);
    return res.json({ ok: true, plan });
  }

  res.json({ ok: true, ignored: eventName || 'unknown' });
});

export default router;