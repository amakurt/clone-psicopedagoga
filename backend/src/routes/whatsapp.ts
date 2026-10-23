import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, authorize, validate } from '../middleware';
import { processWhatsAppAIMessage } from '../services/whatsapp-ai.service';

const router = Router();

// =========================================================================
// 1. HELPERS & ENVIO DE MENSAGENS (EVOLUTION API)
// =========================================================================

export { sendWhatsAppMessage } from '../services/whatsapp-client.service';
import {
  sendWhatsAppMessage,
  normalizeApiUrl,
  isPlanWhatsAppEligible,
  getEvolutionInstanceStatus,
  getEvolutionQrCode,
  restartEvolutionInstance,
  syncTenantWhatsAppInstance,
} from '../services/whatsapp-client.service';

/**
 * Extrai texto e dados da mensagem a partir de diferentes formatos de payload (Evolution API v1, v2)
 */
function extractEvolutionMessage(body: any) {
  if (!body) return null;

  // Formato padrão Evolution API (data wrapper)
  const data = body.data || body;
  const key = data.key || {};
  const messageObj = data.message || {};

  const remoteJid = key.remoteJid || data.remoteJid || '';
  const fromMe = Boolean(key.fromMe ?? data.fromMe);
  const messageId = key.id || data.id || '';
  const pushName = data.pushName || body.pushName || '';

  // Extração do texto
  let text = '';
  if (typeof messageObj === 'string') {
    text = messageObj;
  } else if (messageObj.conversation) {
    text = messageObj.conversation;
  } else if (messageObj.extendedTextMessage?.text) {
    text = messageObj.extendedTextMessage.text;
  } else if (data.body) {
    text = data.body;
  } else if (data.text) {
    text = data.text;
  }

  return {
    remoteJid,
    fromMe,
    messageId,
    pushName,
    text: (text || '').trim(),
    instance: body.instance || '',
  };
}

// =========================================================================
// 2. WEBHOOK PÚBLICO (SEM AUTH JWT - RECEBE DA EVOLUTION API)
// =========================================================================

// Set em memória para deduplicação rápida de mensagens simultâneas da Evolution API
const processingMessageIds = new Set<string>();

async function handleEvolutionWebhook(req: any, res: any) {
  try {
    const eventType = req.body?.event || req.body?.type;
    // Processamos eventos de mensagens (messages.upsert, messages-upsert, etc.)
    const isMessageEvent = !eventType || eventType.includes('messages') || eventType.includes('message');
    if (!isMessageEvent) {
      return res.json({ received: true, ignoredEvent: eventType });
    }

    const parsed = extractEvolutionMessage(req.body);
    if (!parsed || !parsed.remoteJid) {
      return res.json({ received: true, ignoredReason: 'no-remoteJid' });
    }

    // Ignora mensagens de grupos (@g.us) ou transmissões de status
    if (parsed.remoteJid.includes('@g.us') || parsed.remoteJid.includes('status@broadcast')) {
      return res.json({ received: true, ignoredReason: 'group-or-status' });
    }

    // Extrai número limpo
    const rawNumber = parsed.remoteJid.replace(/@.*$/, '');
    const cleanPhone = rawNumber.replace(/\D/g, '');

    // Descoberta de Tenant: via query param, via instance name ou primeiro tenant configurado
    let targetTenantId = (req.query?.tenantId as string) || '';
    const instanceName = req.params?.instance || parsed.instance;

    let config = null;
    if (targetTenantId) {
      config = await prisma.whatsAppConfig.findFirst({ where: { tenantId: targetTenantId } });
    } else if (instanceName) {
      config = await prisma.whatsAppConfig.findFirst({ where: { phoneNumberId: instanceName } });
      if (config) targetTenantId = config.tenantId;
    }

    if (!config) {
      config = await prisma.whatsAppConfig.findFirst();
      if (config) targetTenantId = config.tenantId;
    }

    if (!config || !targetTenantId) {
      return res.status(200).json({ received: true, warning: 'Nenhum WhatsAppConfig encontrado' });
    }

    const db = scoped(prisma, targetTenantId);

    // 1. Busca ou cria conversa no banco
    let conversation = await db.whatsAppConversation.findFirst({
      where: { phone: cleanPhone },
    });

    if (!conversation) {
      // Tenta associar paciente existente
      const phoneSuffix = cleanPhone.length >= 8 ? cleanPhone.slice(-8) : cleanPhone;
      const paciente = await db.paciente.findFirst({
        where: {
          phone: { contains: phoneSuffix },
        },
      });

      conversation = await db.whatsAppConversation.create({
        data: {
          tenantId: targetTenantId,
          phone: cleanPhone,
          contactName: parsed.pushName || paciente?.name || null,
          status: 'ACTIVE',
          pacienteId: paciente?.id || null,
          lastMessageAt: new Date(),
        },
      });
    }

    // 2. Se a mensagem foi enviada pela própria clínica/secretária (fromMe === true)
    if (parsed.fromMe) {
      if (parsed.text) {
        await db.whatsAppMessage.create({
          data: {
            tenantId: targetTenantId,
            conversationId: conversation.id,
            sender: 'HUMAN',
            message: parsed.text,
            messageId: parsed.messageId || null,
          },
        });
      }

      // Auto-Mute: se a secretária interveio, pausa a IA para evitar respostas sobrepostas
      const autoMuteHours = config.autoMuteHours || 4;
      const muteUntil = new Date(Date.now() + autoMuteHours * 60 * 60 * 1000);

      await db.whatsAppConversation.update({
        where: { id: conversation.id },
        data: {
          status: 'MUTED_BY_HUMAN',
          mutedUntil: muteUntil,
          lastMessageAt: new Date(),
        },
      });

      return res.json({ received: true, action: 'human-reply-muted-ai', muteUntil });
    }

    // 3. Mensagem recebida do cliente/responsável (fromMe === false)
    if (!parsed.text) {
      return res.json({ received: true, ignoredReason: 'empty-text' });
    }

    // Deduplicação estrita: se este messageId já está em processamento ou já foi registrado, ignora retentativas
    if (parsed.messageId) {
      if (processingMessageIds.has(parsed.messageId)) {
        return res.json({ received: true, ignoredReason: 'already-processing-messageId' });
      }
      const existingMessage = await db.whatsAppMessage.findFirst({
        where: { messageId: parsed.messageId },
      });
      if (existingMessage) {
        return res.json({ received: true, ignoredReason: 'duplicate-messageId-in-db' });
      }
      processingMessageIds.add(parsed.messageId);
    }

    // Responde ao Webhook imediatamente com HTTP 200 para evitar que a Evolution API considere timeout e reenvie a mensagem
    res.json({ received: true, queued: true });

    // Processamento da mensagem e da IA em background
    (async () => {
      try {
        // Salva mensagem do cliente
        await db.whatsAppMessage.create({
          data: {
            tenantId: targetTenantId,
            conversationId: conversation.id,
            sender: 'USER',
            message: parsed.text,
            messageId: parsed.messageId || null,
          },
        });

        await db.whatsAppConversation.update({
          where: { id: conversation.id },
          data: {
            contactName: parsed.pushName || conversation.contactName,
            status: conversation.status === 'CLOSED' ? 'ACTIVE' : conversation.status,
            lastMessageAt: new Date(),
          },
        });

        // 4. Verificação de status e pausa (Mute)
        const now = new Date();
        const isMuted =
          (conversation.status === 'MUTED_BY_HUMAN' || conversation.status === 'MUTED_BY_AGENT') &&
          conversation.mutedUntil &&
          conversation.mutedUntil > now;

        if (!config.aiEnabled || isMuted) {
          return;
        }

        // Se o mute expirou, reativa para ACTIVE
        if (conversation.status !== 'ACTIVE') {
          await db.whatsAppConversation.update({
            where: { id: conversation.id },
            data: { status: 'ACTIVE', mutedUntil: null },
          });
        }

        // 5. Executa processamento de IA
        const aiResult = await processWhatsAppAIMessage({
          tenantId: targetTenantId,
          phone: cleanPhone,
          pushName: parsed.pushName,
          messageText: parsed.text,
          messageId: parsed.messageId,
        });

        if (aiResult.replyText) {
          // 1. Registra mensagem da IA no banco primeiro para garantir o histórico no Live Chat
          await db.whatsAppMessage.create({
            data: {
              tenantId: targetTenantId,
              conversationId: conversation.id,
              sender: 'AI',
              message: aiResult.replyText,
            },
          });

          // 2. Envia resposta de volta pelo WhatsApp
          try {
            await sendWhatsAppMessage(cleanPhone, aiResult.replyText, targetTenantId);
          } catch (sendErr: any) {
            console.warn(`[WhatsApp Webhook] Aviso ao enviar para Evolution API: ${sendErr.message}. Mensagem mantida no histórico.`);
          }

          // Se a IA determinou transbordo (Hand-off)
          if (aiResult.shouldMute) {
            const muteUntil = new Date(Date.now() + (aiResult.muteHours || 4) * 60 * 60 * 1000);
            await db.whatsAppConversation.update({
              where: { id: conversation.id },
              data: {
                status: 'MUTED_BY_AGENT',
                mutedUntil: muteUntil,
                lastMessageAt: new Date(),
              },
            });
          }
        }
      } catch (bgError: any) {
        console.error('[WhatsApp Webhook] Erro no processamento em background:', bgError);
      } finally {
        if (parsed.messageId) {
          // Mantém o ID no set por 60s antes de limpar, garantindo que retentativas atrasadas sejam descartadas
          setTimeout(() => {
            processingMessageIds.delete(parsed.messageId);
          }, 60000);
        }
      }
    })();
  } catch (error: any) {
    console.error('Erro no webhook do WhatsApp:', error);
    return res.status(500).json({ error: error.message });
  }
}

router.post('/webhook', handleEvolutionWebhook);
router.post('/webhook/:instance', handleEvolutionWebhook);

// =========================================================================
// 3. ROTAS AUTENTICADAS (GESTÃO DE CONVERSAS E CONFIGURAÇÃO)
// =========================================================================

router.use(authenticate);
router.use(authorize('GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA'));

const configSchema = z.object({
  apiUrl: z.string().min(1, 'URL da API é obrigatória'),
  token: z.string().optional().nullable(),
  phoneNumberId: z.string().optional().nullable(),
  aiEnabled: z.boolean().optional().nullable(),
  aiPrompt: z.string().optional().nullable(),
  geminiKey: z.string().optional().nullable(),
  autoMuteHours: z.number().int().min(1).max(72).optional().nullable(),
  inactivityTimeoutMinutes: z.number().int().min(1).max(1440).optional().nullable(),
  inactivityMessage: z.string().optional().nullable(),
  webhookSecret: z.string().optional().nullable(),
});

const sendReminderSchema = z.object({
  patientId: z.string().min(1),
  message: z.string().min(1),
  phone: z.string().optional(),
});

const sendBulkSchema = z.object({
  patientIds: z.array(z.string()).min(1),
  message: z.string().min(1),
});

// --- Configuração ---
router.get('/config', async (req, res) => {
  const tenantId = (req.user as any)?.tenantId;
  const isDemo =
    (req.user as any)?.email === 'demo@edupsychpro.tech' ||
    (req.user as any)?.tenant?.slug === 'clinica-demo' ||
    Boolean((req.user as any)?.isDemo);

  const tenant = tenantId ? await prisma.tenant.findUnique({ where: { id: tenantId } }) : null;
  const planEligible = isPlanWhatsAppEligible(tenant?.plan);
  const tenantPlan = tenant?.plan || 'TRIAL';

  if (isDemo) {
    return res.json({
      configured: true,
      planEligible: true,
      tenantPlan: 'PRO',
      isDemo: true,
      config: {
        apiUrl: 'https://evoapi.suaclinica.com.br',
        phoneNumberId: 'clinica-demo',
        hasToken: true,
        aiEnabled: true,
        aiPrompt: 'Você é a assistente virtual da Clínica EduPsych Demo. Responda com cordialidade e acolhimento.',
        hasGeminiKey: false,
        autoMuteHours: 4,
        inactivityTimeoutMinutes: 15,
        inactivityMessage: 'Seu atendimento foi pausado por inatividade. Caso precise de algo mais, basta responder aqui!',
        webhookSecret: null,
      },
    });
  }

  const db = scoped(prisma, tenantId);
  const config = await db.whatsAppConfig.findFirst();
  if (!config) {
    return res.json({ configured: false, planEligible, tenantPlan, isDemo: false });
  }

  // Sanitiza a apiUrl garantindo que credenciais embutidas nunca sejam expostas
  const sanitizedApiUrl = normalizeApiUrl(config.apiUrl);

  res.json({
    configured: true,
    planEligible,
    tenantPlan,
    isDemo: false,
    config: {
      apiUrl: sanitizedApiUrl,
      phoneNumberId: config.phoneNumberId,
      hasToken: !!config.token,
      aiEnabled: config.aiEnabled,
      aiPrompt: config.aiPrompt,
      hasGeminiKey: !!config.geminiKey,
      autoMuteHours: config.autoMuteHours,
      inactivityTimeoutMinutes: config.inactivityTimeoutMinutes ?? 15,
      inactivityMessage: config.inactivityMessage ?? null,
      webhookSecret: config.webhookSecret,
    },
  });
});

// Endpoint para a própria clínica buscar seu QR Code de pareamento (se PRO ou VIP)
router.get('/qrcode', async (req, res) => {
  try {
    const tenantId = (req.user as any)?.tenantId;
    const isDemo =
      (req.user as any)?.email === 'demo@edupsychpro.tech' ||
      (req.user as any)?.tenant?.slug === 'clinica-demo' ||
      Boolean((req.user as any)?.isDemo);

    if (isDemo) {
      return res.json({
        state: 'open',
        status: 'connected',
        message: 'Instância conectada no ambiente de demonstração.',
        simulated: true,
      });
    }

    const tenant = tenantId ? await prisma.tenant.findUnique({ where: { id: tenantId } }) : null;
    if (!isPlanWhatsAppEligible(tenant?.plan)) {
      return res.status(403).json({
        error: 'O módulo WhatsApp está disponível exclusivamente nos planos PRO e VIP.',
        plan: tenant?.plan || 'TRIAL',
      });
    }

    const config = await prisma.whatsAppConfig.findFirst({ where: { tenantId } });
    let instanceName = config?.phoneNumberId;
    if (!instanceName) {
      const syncResult = await syncTenantWhatsAppInstance(tenantId);
      instanceName = syncResult.instanceName;
    }

    if (!instanceName) {
      return res.status(400).json({ error: 'Nenhuma instância configurada para esta clínica' });
    }

    const qr = await getEvolutionQrCode(instanceName);
    return res.json(qr);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao carregar QR Code' });
  }
});

// Endpoint para a clínica consultar status de conexão da sua instância
router.get('/instance-status', async (req, res) => {
  try {
    const isDemo =
      (req.user as any)?.email === 'demo@edupsychpro.tech' ||
      (req.user as any)?.tenant?.slug === 'clinica-demo' ||
      Boolean((req.user as any)?.isDemo);

    if (isDemo) {
      return res.json({ state: 'open', status: 'connected', simulated: true });
    }

    const tenantId = (req.user as any)?.tenantId;
    const config = await prisma.whatsAppConfig.findFirst({ where: { tenantId } });
    if (!config?.phoneNumberId) {
      return res.json({ state: 'not_configured' });
    }
    const status = await getEvolutionInstanceStatus(config.phoneNumberId);
    return res.json(status);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao consultar status' });
  }
});

// Endpoint para a clínica reiniciar sua instância
router.post('/restart', async (req, res) => {
  try {
    const isDemo =
      (req.user as any)?.email === 'demo@edupsychpro.tech' ||
      (req.user as any)?.tenant?.slug === 'clinica-demo' ||
      Boolean((req.user as any)?.isDemo);

    if (isDemo) {
      return res.json({ success: true, simulated: true, message: 'Instância reiniciada (Modo Demonstração)' });
    }

    const tenantId = (req.user as any)?.tenantId;
    const tenant = tenantId ? await prisma.tenant.findUnique({ where: { id: tenantId } }) : null;
    if (!isPlanWhatsAppEligible(tenant?.plan)) {
      return res.status(403).json({ error: 'Recurso disponível apenas nos planos PRO e VIP' });
    }

    const config = await prisma.whatsAppConfig.findFirst({ where: { tenantId } });
    if (!config?.phoneNumberId) {
      return res.status(400).json({ error: 'Instância não configurada' });
    }

    const result = await restartEvolutionInstance(config.phoneNumberId);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao reiniciar instância' });
  }
});

router.post('/config', validate(configSchema), async (req, res) => {
  const isDemo =
    (req.user as any)?.email === 'demo@edupsychpro.tech' ||
    (req.user as any)?.tenant?.slug === 'clinica-demo' ||
    Boolean((req.user as any)?.isDemo);

  if (isDemo) {
    return res.json({
      success: true,
      simulated: true,
      message: 'Configuração simulada com sucesso no ambiente de demonstração.',
      config: {
        apiUrl: 'https://evoapi.suaclinica.com.br',
        phoneNumberId: 'clinica-demo',
        hasToken: true,
        aiEnabled: req.body.aiEnabled ?? true,
        aiPrompt: req.body.aiPrompt ?? '',
        autoMuteHours: req.body.autoMuteHours ?? 4,
        inactivityTimeoutMinutes: req.body.inactivityTimeoutMinutes ?? 15,
      },
    });
  }

  const db = scoped(prisma, (req.user as any)?.tenantId);
  const {
    apiUrl,
    token,
    phoneNumberId,
    aiEnabled,
    aiPrompt,
    geminiKey,
    autoMuteHours,
    inactivityTimeoutMinutes,
    inactivityMessage,
    webhookSecret,
  } = req.body;

  const existing = await db.whatsAppConfig.findFirst();
  const normalizedApi = normalizeApiUrl(apiUrl);

  const dataToSave: any = {
    apiUrl: normalizedApi,
    phoneNumberId: phoneNumberId ? phoneNumberId.trim() : null,
    aiEnabled: aiEnabled ?? false,
    aiPrompt: aiPrompt ?? null,
    autoMuteHours: autoMuteHours ?? 4,
    inactivityTimeoutMinutes: inactivityTimeoutMinutes ?? 15,
    inactivityMessage: inactivityMessage ? inactivityMessage.trim() : null,
    webhookSecret: webhookSecret ?? null,
  };

  // Se o token foi enviado (preenchido), atualiza. Caso contrário, mantém o token existente!
  if (token && token.trim()) {
    dataToSave.token = token.trim();
  } else if (existing?.token) {
    dataToSave.token = existing.token;
  } else {
    return res.status(400).json({ error: 'Token de autenticação (apikey) é obrigatório' });
  }

  if (geminiKey !== undefined) {
    dataToSave.geminiKey = geminiKey && geminiKey.trim() ? geminiKey.trim() : null;
  }

  let config;
  if (existing) {
    config = await db.whatsAppConfig.update({
      where: { id: existing.id },
      data: dataToSave,
    });
  } else {
    config = await db.whatsAppConfig.create({
      data: dataToSave,
    });
  }

  res.json({ success: true, config });
});

// --- Gestão de Conversas ---
router.get('/conversations', async (req, res) => {
  const db = scoped(prisma, (req.user as any)?.tenantId);
  const { status, search, page = '1', limit = '30' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (status && status !== 'ALL') {
    where.status = status;
  }
  if (search) {
    const s = String(search).trim();
    where.OR = [
      { phone: { contains: s } },
      { contactName: { contains: s } },
    ];
  }

  const [conversations, total] = await Promise.all([
    db.whatsAppConversation.findMany({
      where,
      orderBy: { lastMessageAt: 'desc' },
      skip,
      take: limitNum,
      include: {
        paciente: { select: { id: true, name: true, phone: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    db.whatsAppConversation.count({ where }),
  ]);

  res.json({ data: conversations, total, page: pageNum, limit: limitNum });
});

router.get('/conversations/:id/messages', async (req, res) => {
  const db = scoped(prisma, (req.user as any)?.tenantId);
  const { id } = req.params;

  const conversation = await db.whatsAppConversation.findUnique({
    where: { id },
    include: { paciente: true },
  });

  if (!conversation) {
    return res.status(404).json({ error: 'Conversa não encontrada' });
  }

  const messages = await db.whatsAppMessage.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  res.json({ conversation, messages });
});

router.post('/conversations/:id/toggle-mute', async (req, res) => {
  const db = scoped(prisma, (req.user as any)?.tenantId);
  const { id } = req.params;
  const { mute, hours = 4 } = req.body;

  const conversation = await db.whatsAppConversation.findUnique({ where: { id } });
  if (!conversation) {
    return res.status(404).json({ error: 'Conversa não encontrada' });
  }

  const shouldMute = mute ?? (conversation.status === 'ACTIVE');
  const updated = await db.whatsAppConversation.update({
    where: { id },
    data: {
      status: shouldMute ? 'MUTED_BY_HUMAN' : 'ACTIVE',
      mutedUntil: shouldMute ? new Date(Date.now() + hours * 60 * 60 * 1000) : null,
    },
  });

  res.json({ success: true, conversation: updated });
});

router.post('/conversations/:id/close', async (req, res) => {
  const db = scoped(prisma, (req.user as any)?.tenantId);
  const { id } = req.params;
  const { closingMessage, sendWhatsApp = true } = req.body;

  const conversation = await db.whatsAppConversation.findUnique({
    where: { id },
    include: { paciente: true },
  });
  if (!conversation) {
    return res.status(404).json({ error: 'Conversa não encontrada' });
  }

  const config = await db.whatsAppConfig.findFirst();

  const contactName = conversation.contactName || conversation.paciente?.name || 'Família';
  const targetName = conversation.paciente?.name ? `o ${conversation.paciente.name}` : 'a família';

  let textToSend = closingMessage;
  if (!textToSend || !textToSend.trim()) {
    if (config?.inactivityMessage && config.inactivityMessage.trim()) {
      textToSend = config.inactivityMessage
        .replace(/\{nome\}/gi, contactName)
        .replace(/\{contato\}/gi, contactName)
        .replace(/\{paciente\}/gi, targetName)
        .replace(/\{crianca\}/gi, targetName);
    } else {
      textToSend = `Olá, ${contactName}! 🌸 Atendimento finalizado pela nossa equipe. Se precisar de qualquer orientação, agendamento ou suporte futuro, basta nos enviar uma nova mensagem! Um abraço bem carinhoso para você e para ${targetName}! ✨`;
    }
  }

  // 1. Envia a mensagem pelo WhatsApp se selecionado
  if (sendWhatsApp && textToSend && textToSend.trim()) {
    try {
      await sendWhatsAppMessage(conversation.phone, textToSend.trim(), (req.user as any)?.tenantId);
    } catch (sendErr: any) {
      console.warn(`[WhatsApp Close] Aviso ao enviar para Evolution API: ${sendErr.message}`);
    }

    // Registra a mensagem da clínica no histórico
    await db.whatsAppMessage.create({
      data: {
        tenantId: (req.user as any)?.tenantId,
        conversationId: id,
        sender: 'HUMAN',
        message: textToSend.trim(),
      },
    });
  }

  // 2. Atualiza a conversa para CLOSED e limpa mutes
  const updated = await db.whatsAppConversation.update({
    where: { id },
    data: {
      status: 'CLOSED',
      mutedUntil: null,
      lastMessageAt: new Date(),
    },
  });

  res.json({ success: true, conversation: updated, closingMessage: textToSend });
});

router.post('/conversations/:id/reopen', async (req, res) => {
  const db = scoped(prisma, (req.user as any)?.tenantId);
  const { id } = req.params;

  const conversation = await db.whatsAppConversation.findUnique({ where: { id } });
  if (!conversation) {
    return res.status(404).json({ error: 'Conversa não encontrada' });
  }

  const updated = await db.whatsAppConversation.update({
    where: { id },
    data: {
      status: 'ACTIVE',
      mutedUntil: null,
      lastMessageAt: new Date(),
    },
  });

  res.json({ success: true, conversation: updated });
});

router.post('/conversations/:id/send', async (req, res) => {
  const db = scoped(prisma, (req.user as any)?.tenantId);
  const { id } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Mensagem não pode ser vazia' });
  }

  const conversation = await db.whatsAppConversation.findUnique({ where: { id } });
  if (!conversation) {
    return res.status(404).json({ error: 'Conversa não encontrada' });
  }

  try {
    await sendWhatsAppMessage(conversation.phone, message.trim(), (req.user as any)?.tenantId);

    const saved = await db.whatsAppMessage.create({
      data: {
        tenantId: (req.user as any)?.tenantId,
        conversationId: id,
        sender: 'HUMAN',
        message: message.trim(),
      },
    });

    await db.whatsAppConversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    res.json({ success: true, message: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Lembretes e Histórico Original ---
router.post('/send-reminder', validate(sendReminderSchema), async (req, res) => {
  const db = scoped(prisma, (req.user as any)?.tenantId);
  const { patientId, message, phone } = req.body;

  const patient = await db.paciente.findUnique({ where: { id: patientId } });
  if (!patient) {
    return res.status(404).json({ error: 'Paciente não encontrado' });
  }

  const phoneToUse = phone || patient.phone;
  if (!phoneToUse) {
    return res.status(400).json({ error: 'Paciente não possui telefone cadastrado' });
  }

  try {
    await sendWhatsAppMessage(phoneToUse, message, (req.user as any)?.tenantId);

    const log = await db.whatsAppLog.create({
      data: {
        patientId,
        phone: phoneToUse,
        message,
        status: 'SENT',
        sentBy: (req.user as any)?.id,
      },
    });

    res.json({ success: true, log });
  } catch (error: any) {
    const log = await db.whatsAppLog.create({
      data: {
        patientId,
        phone: phoneToUse,
        message,
        status: 'FAILED',
        sentBy: (req.user as any)?.id,
      },
    });

    res.status(500).json({ error: error.message, log });
  }
});

router.post('/send-bulk', validate(sendBulkSchema), async (req, res) => {
  const db = scoped(prisma, (req.user as any)?.tenantId);
  const { patientIds, message } = req.body;

  const patients = await db.paciente.findMany({
    where: { id: { in: patientIds } },
  });

  const results = [];

  for (const patient of patients) {
    if (!patient.phone) {
      results.push({ patientId: patient.id, status: 'SKIPPED', reason: 'Sem telefone' });
      continue;
    }

    try {
      await sendWhatsAppMessage(patient.phone, message, (req.user as any)?.tenantId);

      const log = await db.whatsAppLog.create({
        data: {
          patientId: patient.id,
          phone: patient.phone,
          message,
          status: 'SENT',
          sentBy: (req.user as any)?.id,
        },
      });

      results.push({ patientId: patient.id, status: 'SENT', log });
    } catch (error: any) {
      const log = await db.whatsAppLog.create({
        data: {
          patientId: patient.id,
          phone: patient.phone,
          message,
          status: 'FAILED',
          sentBy: (req.user as any)?.id,
        },
      });

      results.push({ patientId: patient.id, status: 'FAILED', error: error.message, log });
    }
  }

  res.json({ results });
});

router.get('/history', async (req, res) => {
  const db = scoped(prisma, (req.user as any)?.tenantId);
  const { patientId, status, page = '1', limit = '50' } = req.query;
  const where: any = {};
  if (patientId) where.patientId = patientId;
  if (status) where.status = status;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    db.whatsAppLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: { paciente: { select: { id: true, name: true } } },
    }),
    db.whatsAppLog.count({ where }),
  ]);

  res.json({ data: logs, total, page: pageNum, limit: limitNum });
});

router.post('/test', async (req, res) => {
  const isDemo =
    (req.user as any)?.email === 'demo@edupsychpro.tech' ||
    (req.user as any)?.tenant?.slug === 'clinica-demo' ||
    Boolean((req.user as any)?.isDemo);

  if (isDemo) {
    return res.json({
      success: true,
      simulated: true,
      message: 'Simulação de envio concluída com sucesso no ambiente de demonstração!',
    });
  }

  const { phone, apiUrl, token, phoneNumberId } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Telefone é obrigatório' });
  }

  try {
    await sendWhatsAppMessage(
      phone,
      '✅ Mensagem de teste do EduPsych Pro - WhatsApp configurado com sucesso!',
      (req.user as any)?.tenantId,
      { apiUrl, token, phoneNumberId }
    );
    res.json({ success: true, message: 'Mensagem de teste enviada com sucesso' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
