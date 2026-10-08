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

export async function sendWhatsAppMessage(phone: string, message: string, tenantId?: string) {
  const db = scoped(prisma, tenantId);
  const configRecord = await db.whatsAppConfig.findFirst();
  if (!configRecord) {
    throw new Error('WhatsApp não configurado. Configure a API em Configurações > WhatsApp.');
  }

  const cleanedPhone = phone.replace(/\D/g, '');
  const baseUrl = configRecord.apiUrl.replace(/\/+$/, '');
  const instance = configRecord.phoneNumberId || '';
  const endpoint = instance ? `${baseUrl}/message/sendText/${instance}` : `${baseUrl}/message/sendText`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': configRecord.token,
    },
    body: JSON.stringify({
      number: cleanedPhone,
      text: message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

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
        lastMessageAt: new Date(),
      },
    });

    // 4. Verificação de status e pausa (Mute)
    const now = new Date();
    const isMuted =
      (conversation.status === 'MUTED_BY_HUMAN' || conversation.status === 'MUTED_BY_AGENT') &&
      conversation.mutedUntil &&
      conversation.mutedUntil > now;

    if (!config.aiEnabled) {
      return res.json({ received: true, action: 'ai-disabled' });
    }

    if (isMuted) {
      return res.json({ received: true, action: 'conversation-muted-for-human', status: conversation.status });
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
      // Envia resposta de volta pelo WhatsApp (se a Evolution API estiver configurada e acessível)
      try {
        await sendWhatsAppMessage(cleanPhone, aiResult.replyText, targetTenantId);
      } catch (sendErr: any) {
        console.warn(`[WhatsApp Webhook] Aviso ao enviar para Evolution API: ${sendErr.message}. Mensagem mantida no histórico.`);
      }

      // Registra mensagem da IA no banco
      await db.whatsAppMessage.create({
        data: {
          tenantId: targetTenantId,
          conversationId: conversation.id,
          sender: 'AI',
          message: aiResult.replyText,
        },
      });

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

    return res.json({
      received: true,
      success: true,
      intent: aiResult.intent,
      replied: Boolean(aiResult.replyText),
    });
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
  apiUrl: z.string().url(),
  token: z.string().min(1),
  phoneNumberId: z.string().optional(),
  aiEnabled: z.boolean().optional(),
  aiPrompt: z.string().optional(),
  geminiKey: z.string().optional(),
  autoMuteHours: z.number().int().min(1).max(72).optional(),
  webhookSecret: z.string().optional(),
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
  const db = scoped(prisma, req.user?.tenantId);
  const config = await db.whatsAppConfig.findFirst();
  if (!config) {
    return res.json({ configured: false });
  }
  res.json({
    configured: true,
    config: {
      apiUrl: config.apiUrl,
      phoneNumberId: config.phoneNumberId,
      hasToken: !!config.token,
      aiEnabled: config.aiEnabled,
      aiPrompt: config.aiPrompt,
      hasGeminiKey: !!config.geminiKey,
      autoMuteHours: config.autoMuteHours,
      webhookSecret: config.webhookSecret,
    },
  });
});

router.post('/config', validate(configSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { apiUrl, token, phoneNumberId, aiEnabled, aiPrompt, geminiKey, autoMuteHours, webhookSecret } = req.body;

  const existing = await db.whatsAppConfig.findFirst();
  let config;
  const dataToSave: any = {
    apiUrl,
    token,
    phoneNumberId,
    aiEnabled: aiEnabled ?? false,
    aiPrompt: aiPrompt ?? null,
    autoMuteHours: autoMuteHours ?? 4,
    webhookSecret: webhookSecret ?? null,
  };
  if (geminiKey !== undefined) {
    dataToSave.geminiKey = geminiKey || null;
  }

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
  const db = scoped(prisma, req.user?.tenantId);
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
  const db = scoped(prisma, req.user?.tenantId);
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
  const db = scoped(prisma, req.user?.tenantId);
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

router.post('/conversations/:id/send', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
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
    await sendWhatsAppMessage(conversation.phone, message.trim(), req.user?.tenantId);

    const saved = await db.whatsAppMessage.create({
      data: {
        tenantId: req.user!.tenantId,
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
  const db = scoped(prisma, req.user?.tenantId);
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
    await sendWhatsAppMessage(phoneToUse, message, req.user?.tenantId);

    const log = await db.whatsAppLog.create({
      data: {
        patientId,
        phone: phoneToUse,
        message,
        status: 'SENT',
        sentBy: req.user!.id,
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
        sentBy: req.user!.id,
      },
    });

    res.status(500).json({ error: error.message, log });
  }
});

router.post('/send-bulk', validate(sendBulkSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
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
      await sendWhatsAppMessage(patient.phone, message, req.user?.tenantId);

      const log = await db.whatsAppLog.create({
        data: {
          patientId: patient.id,
          phone: patient.phone,
          message,
          status: 'SENT',
          sentBy: req.user!.id,
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
          sentBy: req.user!.id,
        },
      });

      results.push({ patientId: patient.id, status: 'FAILED', error: error.message, log });
    }
  }

  res.json({ results });
});

router.get('/history', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
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
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Telefone é obrigatório' });
  }

  try {
    await sendWhatsAppMessage(phone, '✅ Mensagem de teste do EduPsych Pro - WhatsApp configurado com sucesso!', req.user?.tenantId);
    res.json({ success: true, message: 'Mensagem de teste enviada com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
