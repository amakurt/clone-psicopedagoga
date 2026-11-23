import prisma from '../lib/prisma';
import { activateSubscription } from '../lib/billing';
import { sendWhatsAppMessage } from './whatsapp-client.service';

export interface InfinitePayCustomer {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CreateLinkOptions {
  handle?: string;
  apiKey?: string;
  description: string;
  amountCents: number;
  orderNsu: string;
  customer?: InfinitePayCustomer;
  redirectUrl?: string;
}

export interface InfinitePayLinkResult {
  success: boolean;
  paymentUrl: string;
  providerPaymentId?: string;
  error?: string;
}

/**
 * Obtém a configuração ativa da InfinitePay (banco de dados ou .env)
 */
export async function getInfinitePayConfig(): Promise<{
  enabled: boolean;
  handle: string;
  apiKey?: string;
  webhookSecret?: string;
}> {
  try {
    const config = await prisma.saaSBillingConfig.findUnique({
      where: { id: 'saas_default_config' },
    });

    const handle = (config?.infiniteTag || process.env.INFINITEPAY_HANDLE || '').trim().replace(/^[$]/, '');
    const apiKey = (config?.gatewayApiKey || process.env.INFINITEPAY_API_KEY || '').trim();
    const webhookSecret = (config?.gatewayWebhookSecret || process.env.INFINITEPAY_WEBHOOK_SECRET || '').trim();
    const isProvider = config?.gatewayProvider === 'infinitepay' || !!process.env.INFINITEPAY_HANDLE;

    return {
      enabled: isProvider && handle.length > 0,
      handle,
      apiKey: apiKey || undefined,
      webhookSecret: webhookSecret || undefined,
    };
  } catch (err: any) {
    console.warn('[INFINITEPAY_CONFIG_ERROR]', err?.message);
    const envHandle = (process.env.INFINITEPAY_HANDLE || '').trim().replace(/^[$]/, '');
    return {
      enabled: envHandle.length > 0,
      handle: envHandle,
      apiKey: process.env.INFINITEPAY_API_KEY?.trim() || undefined,
    };
  }
}

/**
 * Cria um link de pagamento oficial via InfinitePay Checkout API
 * Aceita Pix (0% taxa) e Cartão de crédito (em até 12x com repasse de taxas)
 */
export async function createInfinitePayCheckoutLink(
  options: CreateLinkOptions
): Promise<InfinitePayLinkResult> {
  const cfg = await getInfinitePayConfig();
  const rawHandle = options.handle || cfg.handle;
  const cleanHandle = (rawHandle || '').trim().replace(/^[$]/, '');
  const apiKey = options.apiKey || cfg.apiKey;

  if (!cleanHandle) {
    return {
      success: false,
      paymentUrl: '',
      error: 'InfiniteTag não configurada. Configure sua InfiniteTag no painel Master.',
    };
  }

  const redirectUrl =
    options.redirectUrl ||
    process.env.APP_URL ||
    'https://edupsychpro.tech/app/billing';

  const webhookUrl =
    process.env.API_URL
      ? `${process.env.API_URL.replace(/\/$/, '')}/api/billing/webhook/infinitepay`
      : 'https://edupsychpro.tech/api/billing/webhook/infinitepay';

  const payload: any = {
    handle: cleanHandle,
    items: [
      {
        description: options.description || 'Assinatura EduPsych Pro SaaS',
        quantity: 1,
        price: Math.max(options.amountCents, 100), // Em centavos (mínimo 100 = R$ 1,00)
      },
    ],
    order_nsu: options.orderNsu,
    redirect_url: redirectUrl,
    webhook: {
      url: webhookUrl,
      events: ['paid', 'settled'],
    },
    payment_methods_enabled: ['pix', 'credit_card'],
    single_payment: true,
  };

  if (options.customer?.name) {
    payload.customer = {
      name: options.customer.name,
      email: options.customer.email || undefined,
      phone_number: options.customer.phone
        ? options.customer.phone.replace(/\D/g, '')
        : undefined,
    };
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }

  const endpoints = [
    'https://api.checkout.infinitepay.io/links',
    'https://api.infinitepay.io/invoices/public/checkout/links',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const url = data.url || data.payment_url || data.link;
        if (url) {
          console.log(`[INFINITEPAY_LINK_CREATED] Order ${options.orderNsu} -> ${url}`);
          return {
            success: true,
            paymentUrl: url,
            providerPaymentId: data.slug || data.id || data.order_nsu,
          };
        }
      } else {
        const errBody = await response.text().catch(() => '');
        console.warn(`[INFINITEPAY_ENDPOINT_WARN] ${endpoint} returned ${response.status}:`, errBody);
      }
    } catch (fetchErr: any) {
      console.warn(`[INFINITEPAY_FETCH_WARN] Endpoint ${endpoint}:`, fetchErr?.message);
    }
  }

  // Fallback seguro: URL pública do perfil de pagamento da InfinitePay
  const fallbackUrl = `https://pay.infinitepay.io/${cleanHandle}`;
  console.log(`[INFINITEPAY_FALLBACK_URL] Usando perfil direto: ${fallbackUrl}`);
  return {
    success: true,
    paymentUrl: fallbackUrl,
  };
}

/**
 * Processa a notificação de pagamento recebida via Webhook da InfinitePay
 */
export async function processInfinitePayWebhook(body: any): Promise<{
  success: boolean;
  message: string;
  invoiceId?: string;
  tenantId?: string;
}> {
  console.log('[INFINITEPAY_WEBHOOK_RECEIVED]', JSON.stringify(body));

  const isPaid =
    body.paid === true ||
    body.status === 'paid' ||
    body.status === 'settled' ||
    body.event === 'paid' ||
    body.event === 'settled' ||
    body.state === 'PAID';

  if (!isPaid) {
    return {
      success: true,
      message: `Evento ignorado (status: ${body.event || body.status || 'não-pago'})`,
    };
  }

  const orderNsu = body.order_nsu || body.orderId || body.referenceId || body.nsu;
  const transactionNsu = body.transaction_nsu || body.transactionId || body.id;
  const captureMethod = (body.capture_method || body.payment_method || '').toLowerCase();
  const paymentMethod = captureMethod.includes('card') || captureMethod.includes('credit')
    ? 'CARTAO'
    : 'PIX';

  if (!orderNsu) {
    return {
      success: false,
      message: 'order_nsu não informado no payload da InfinitePay',
    };
  }

  // 1. Tenta localizar por Fatura de Assinatura (SubscriptionInvoice)
  let invoice = await prisma.subscriptionInvoice.findUnique({
    where: { id: orderNsu },
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
  });

  // Se não achar por ID direto, tenta por providerPaymentId
  if (!invoice && transactionNsu) {
    invoice = await prisma.subscriptionInvoice.findFirst({
      where: { providerPaymentId: transactionNsu },
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
    });
  }

  if (invoice) {
    // Atualiza status da fatura para PAGA
    await prisma.subscriptionInvoice.update({
      where: { id: invoice.id },
      data: {
        status: 'PAGA',
        paidAt: new Date(),
        paymentMethod,
        provider: 'infinitepay',
        providerPaymentId: transactionNsu || invoice.providerPaymentId,
        notes: `${invoice.notes ? invoice.notes + ' | ' : ''}Pago via InfinitePay (${paymentMethod}) em ${new Date().toLocaleString('pt-BR')}`,
      },
    });

    // Ativa / Renova a assinatura da clínica
    await activateSubscription(invoice.tenantId, invoice.planCode);

    // Garante que o status do Tenant seja ATIVO
    await prisma.tenant.update({
      where: { id: invoice.tenantId },
      data: { status: 'ATIVO', plan: invoice.planCode },
    });

    // Envia mensagem de confirmação no WhatsApp do gestor
    const gestor = invoice.tenant.memberships[0]?.user;
    if (gestor?.phone) {
      const valorFormatado = (invoice.amountCents / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      const confirmMsg = [
        `*EduPsych Pro - Pagamento Confirmado!* ✅`,
        ``,
        `Olá, *${gestor.name || 'Gestor(a)'}*!`,
        `Seu pagamento de *${valorFormatado}* referente ao plano *${invoice.planCode}* da clínica *${invoice.tenant.name}* foi processado e confirmado com sucesso via InfinitePay.`,
        ``,
        `🎉 *Sua assinatura está ativa e renovada!*`,
        `Todos os módulos clínicos, relatórios com IA e prontuários estão liberados.`,
        ``,
        `Agradecemos pela confiança na nossa parceria! 🚀`,
      ].join('\n');

      try {
        const instance = invoice.tenant.whatsappConfigs[0]?.phoneNumberId;
        await sendWhatsAppMessage(gestor.phone, confirmMsg, undefined, {
          apiUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
          token: process.env.EVOLUTION_API_KEY || '',
          phoneNumberId: instance || undefined,
        });
        console.log(`[INFINITEPAY_WHATSAPP_CONFIRMED] Notificação enviada para ${gestor.phone}`);
      } catch (evoErr: any) {
        console.warn('[INFINITEPAY_WHATSAPP_NOTIFY_WARN]', evoErr?.message);
      }
    }

    return {
      success: true,
      message: `Fatura ${invoice.id} liquidada e clínica ${invoice.tenant.name} renovada com sucesso!`,
      invoiceId: invoice.id,
      tenantId: invoice.tenantId,
    };
  }

  // 2. Se order_nsu for o ID do Tenant diretamente
  const tenant = await prisma.tenant.findUnique({
    where: { id: orderNsu },
    include: { subscription: true },
  });

  if (tenant) {
    const plan = tenant.plan || 'MENSAL';
    await activateSubscription(tenant.id, plan);
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { status: 'ATIVO' },
    });

    return {
      success: true,
      message: `Assinatura da clínica ${tenant.name} ativada via InfinitePay!`,
      tenantId: tenant.id,
    };
  }

  return {
    success: false,
    message: `Fatura ou clínica não encontrada para order_nsu: ${orderNsu}`,
  };
}
