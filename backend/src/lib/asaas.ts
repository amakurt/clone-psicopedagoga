export const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
export const ASAAS_ENV = process.env.ASAAS_ENV || 'sandbox';
export const ASAAS_BASE = ASAAS_ENV === 'sandbox'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3';
export const ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN;

export function isAsaasConfigured() {
  return !!ASAAS_API_KEY;
}

async function asaasFetch(path: string, options: RequestInit = {}) {
  if (!ASAAS_API_KEY) {
    const err: any = new Error('Asaas não configurado (ASAAS_API_KEY ausente)');
    err.status = 503;
    throw err;
  }
  const res = await fetch(`${ASAAS_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      access_token: ASAAS_API_KEY,
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const description =
      data?.errors?.[0]?.description ||
      data?.error?.description ||
      `erro Asaas (${res.status})`;
    const err: any = new Error(`Asaas: ${description}`);
    err.status = 502;
    throw err;
  }
  return data;
}

export async function getOrCreateCustomer(tenantId: string, tenantName: string) {
  const list = await asaasFetch(`/customers?externalReference=${encodeURIComponent(tenantId)}&limit=1`);
  if (list?.data?.length) return list.data[0];

  const created = await asaasFetch('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: tenantName || 'Cliente EduPsych',
      externalReference: tenantId,
      notificationDisabled: true,
    }),
  });
  return created;
}

export async function createSubscription(customerId: string, tenantId: string, planName: string, priceCents: number) {
  const created = await asaasFetch('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      customer: customerId,
      billingType: 'PIX',
      value: priceCents / 100,
      nextDueDate: new Date().toISOString().split('T')[0],
      cycle: 'MONTHLY',
      description: `Assinatura ${planName} - EduPsych Pro`,
      externalReference: tenantId,
    }),
  });
  return created;
}

export async function getSubscriptionFirstPayment(subscriptionId: string) {
  const list = await asaasFetch(`/subscriptions/${subscriptionId}/payments?limit=1`);
  return list?.data?.[0] || null;
}

export async function getPixQrCode(paymentId: string) {
  const data = await asaasFetch(`/payments/${paymentId}/pixQrCode`);
  return {
    payload: data?.payload || null,
    encodedImage: data?.encodedImage || null,
    expirationDate: data?.expirationDate || null,
  };
}

export function isWebhookAuthorized(req: any) {
  const headerToken = req.headers['asaas-access-token'] as string | undefined;
  if (!ASAAS_WEBHOOK_TOKEN) return false;
  return headerToken === ASAAS_WEBHOOK_TOKEN;
}