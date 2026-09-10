import { Router } from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { authenticate, authorize, validate } from '../middleware';
import {
  getOrCreateSubscription,
  getUsage,
  checkoutPlan,
  activateSubscription,
  processWebhookEvent,
  BILLING_ENABLED,
} from '../lib/billing';
import { isWebhookAuthorized } from '../lib/asaas';
import { z } from 'zod';

const router = Router();

const checkoutSchema = z.object({
  planCode: z.enum(['TRIAL', 'BASICO', 'PRO']),
});

function safeCompareTokens(a: string, b: string): boolean {
  if (!a || !b) return false;
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

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
    provider: subscription.provider || 'mock',
    maxPacientes: plan?.maxPacientes ?? 0,
    maxProfissionais: plan?.maxProfissionais ?? 0,
  });
});

router.post('/checkout', authenticate, authorize('GESTOR'), validate(checkoutSchema), async (req: any, res) => {
  const { planCode } = req.body;
  const result = await checkoutPlan(req.user.tenantId, planCode);
  res.json(result);
});

router.post('/mock-pay', authenticate, authorize('GESTOR'), async (req: any, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Operação não permitida em ambiente de produção' });
  }
  const sub = await getOrCreateSubscription(req.user.tenantId);
  if (sub.provider && sub.provider !== 'mock') {
    return res.status(400).json({ error: 'mock-pay só disponível no modo simulado' });
  }
  const { plan } = await activateSubscription(req.user.tenantId, sub.planCode);
  res.json({ message: 'Pagamento confirmado (modo simulado)', plan });
});

router.post('/webhook', async (req: any, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const configuredWebhookToken = process.env.BILLING_WEBHOOK_TOKEN;
  const headerToken = (req.headers['x-billing-webhook-token'] || req.headers['x-webhook-token'] || req.headers['x-billing-token']) as string;

  let tokenOk = false;

  if (process.env.ASAAS_API_KEY) {
    tokenOk = isWebhookAuthorized(req);
  } else if (configuredWebhookToken) {
    tokenOk = safeCompareTokens(headerToken, configuredWebhookToken);
  } else if (!isProduction) {
    tokenOk = safeCompareTokens(headerToken, 'dev-webhook-token');
  }

  if (!tokenOk) {
    return res.status(401).json({ error: 'Assinatura de webhook inválida' });
  }

  const result = await processWebhookEvent(req.body || {});
  return res.json(result);
});

export default router;