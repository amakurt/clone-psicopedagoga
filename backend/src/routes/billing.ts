import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware';
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
    provider: subscription.provider || 'mock',
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
  if (sub.provider && sub.provider !== 'mock') {
    return res.status(400).json({ error: 'mock-pay só disponível no modo simulado' });
  }
  const { plan } = await activateSubscription(req.user.tenantId, sub.planCode);
  res.json({ message: 'Pagamento confirmado (modo simulado)', plan });
});

router.post('/webhook', async (req: any, res) => {
  const devToken = process.env.BILLING_WEBHOOK_TOKEN || 'dev-webhook-token';
  const headerToken = (req.headers['x-billing-webhook-token'] || req.headers['x-webhook-token'] || req.headers['x-billing-token']) as string;

  const tokenOk =
    (process.env.ASAAS_API_KEY && isWebhookAuthorized(req)) ||
    headerToken === devToken;

  if (!tokenOk) {
    return res.status(401).json({ error: 'Assinatura de webhook inválida' });
  }

  const result = await processWebhookEvent(req.body || {});
  return res.json(result);
});

export default router;