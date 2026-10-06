import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';

export interface WhatsAppIncomingMessage {
  tenantId: string;
  phone: string;
  pushName?: string;
  messageText: string;
  messageId?: string;
}

export interface AIProcessResult {
  replyText: string;
  intent: 'INFO' | 'TRIAGE' | 'SCHEDULE_REQUEST' | 'HANDOFF';
  shouldMute?: boolean;
  muteHours?: number;
  appointmentCreated?: any;
}

/**
 * Detecção rápida de palavras-chave para transbordo humano imediato
 */
function isDirectHandoffRequest(text: string): boolean {
  const normalized = text.toLowerCase().trim();
  const triggers = [
    'falar com atendente',
    'falar com humano',
    'falar com a secretaria',
    'falar com a secretária',
    'falar com uma pessoa',
    'atendente humana',
    'atendente humano',
    'quero atendente',
    'passar para atendente',
    'falar com alguem',
    'falar com alguém',
  ];
  return triggers.some(t => normalized.includes(t));
}

/**
 * Realiza chamada à API do Google Gemini com fallback de modelos
 */
async function callGeminiForChat(prompt: string, apiKey: string): Promise<string> {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 600,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        lastError = new Error(`Gemini ${model} Error (${response.status}): ${errText}`);
        continue;
      }

      const data = (await response.json()) as any;
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText && rawText.trim()) {
        return rawText.trim();
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Falha ao comunicar com a API do Gemini');
}

/**
 * Processa a mensagem recebida com contexto de banco de dados e IA
 */
export async function processWhatsAppAIMessage(
  incoming: WhatsAppIncomingMessage
): Promise<AIProcessResult> {
  const db = scoped(prisma, incoming.tenantId);
  const cleanedPhone = incoming.phone.replace(/\D/g, '');

  // 1. Busca configurações de WhatsApp e IA da clínica
  const config = await db.whatsAppConfig.findFirst();
  const geminiKey = config?.geminiKey || process.env.GEMINI_API_KEY || '';
  const autoMuteHours = config?.autoMuteHours || 4;

  // 2. Transbordo imediato por palavras-chave
  if (isDirectHandoffRequest(incoming.messageText)) {
    return {
      replyText:
        'Com certeza! Já notifiquei nossa equipe da recepção e um atendente continuará seu atendimento por aqui. Só um momento! 🌸',
      intent: 'HANDOFF',
      shouldMute: true,
      muteHours: autoMuteHours,
    };
  }

  // 3. Busca vínculo de paciente e responsável existente
  const phoneSuffix = cleanedPhone.length >= 8 ? cleanedPhone.slice(-8) : cleanedPhone;

  const [pacienteFound, responsibleFound] = await Promise.all([
    db.paciente.findFirst({
      where: {
        phone: { contains: phoneSuffix },
      },
      include: {
        appointments: {
          take: 3,
          orderBy: { date: 'desc' },
          where: { status: { in: ['CONFIRMADO', 'PENDENTE', 'AGENDADO'] } },
        },
      },
    }),
    db.responsible.findFirst({
      where: {
        phones: { contains: phoneSuffix },
      },
      include: {
        patients: {
          select: { id: true, name: true, birthDate: true, notes: true },
        },
      },
    }),
  ]);

  // Contextualização
  const contactName =
    incoming.pushName ||
    responsibleFound?.name ||
    pacienteFound?.name ||
    'Família';

  let patientInfo = '';
  if (pacienteFound) {
    patientInfo = `Paciente identificado: ${pacienteFound.name}. Queixa/Observações: ${pacienteFound.notes || 'Em acompanhamento'}.`;
  } else if (responsibleFound?.patients?.[0]) {
    patientInfo = `Responsável identificado: ${responsibleFound.name} (criança: ${responsibleFound.patients[0].name}).`;
  } else {
    patientInfo = 'Novo contato / Nova família (ainda sem cadastro no sistema). Faça um acolhimento caloroso e pergunte o nome da criança se apropriado.';
  }

  // 4. Carrega histórico recente da conversa (últimas 6 mensagens)
  const conversation = await db.whatsAppConversation.findFirst({
    where: { phone: incoming.phone },
  });

  let historyContext = '';
  if (conversation) {
    const recentMessages = await db.whatsAppMessage.findMany({
      where: { conversationId: conversation.id },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });
    recentMessages.reverse();

    if (recentMessages.length > 0) {
      historyContext = recentMessages
        .map((m: any) => `${m.sender === 'USER' ? 'Cliente' : 'Assistente'}: ${m.message}`)
        .join('\n');
    }
  }

  // 5. Agendamentos e horários próximos para referência
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingAppointments = await db.appointment.findMany({
    where: {
      date: { gte: todayStr },
      status: { in: ['CONFIRMADO', 'AGENDADO', 'PENDENTE'] },
    },
    take: 10,
    select: { date: true, startTime: true, endTime: true },
  });

  const occupiedTimesStr = upcomingAppointments
    .map((a: any) => `${a.date} às ${a.startTime}`)
    .join(', ');

  // 6. Construção do Prompt para a IA
  const customClinicPrompt = config?.aiPrompt || `
Você é a assistente virtual acolhedora, humana e profissional da clínica de Psicopedagogia e Neurodesenvolvimento Infantil.
Seu objetivo é acolher os pais e responsáveis, tirar dúvidas com carinho, explicar como funcionam as sessões/avaliações e apoiar com agendamentos.
`;

  const systemPrompt = `
${customClinicPrompt.trim()}

DIRETRIZES FUNDAMENTAIS:
1. Tom de voz: Empático, seguro, afetuoso, profissional e claro (com emojis pontuais como 🌸, 📚, ✨, 🧠).
2. Nunca faça promessas médicas ou feche diagnósticos pelo WhatsApp.
3. Se o pai/mãe quiser agendar uma consulta ou avaliação:
   - Apresente disponibilidade geral (dias úteis de segunda a sexta, manhãs ou tardes).
   - Horários já ocupados recentemente: [${occupiedTimesStr || 'Agenda flexível sob consulta'}].
   - Colete a preferência de dia/período e o nome da criança.
   - Se o usuário sugerir uma data/hora clara (ex: "quarta-feira às 14h"), responda acolhendo e informando que você já pré-registrou a solicitação na agenda e a secretária confirmará em breve.
4. Se o usuário estiver muito ansioso, pedir para falar com um ser humano ou se houver uma emergência, responda dizendo que está avisando a secretária para assumir a conversa.
5. Mensagens para WhatsApp devem ser concisas (máximo de 2 a 3 parágrafos curtos), sem jargões difíceis.

DADOS DO CONTEXTO:
- Nome informado no WhatsApp: ${incoming.pushName || 'Não especificado'}
- Vínculo no sistema: ${patientInfo}
- Data de hoje: ${todayStr}

${historyContext ? `HISTÓRICO RECENTE DA CONVERSA:\n${historyContext}\n` : ''}

MENSAGEM ATUAL DO CLIENTE:
"${incoming.messageText}"

Responda agora diretamente à mensagem do cliente como a assistente da clínica:
`;

  // 7. Chamada ao Gemini ou Fallback Clínico
  let replyText = '';
  let intent: AIProcessResult['intent'] = 'INFO';

  if (geminiKey) {
    try {
      replyText = await callGeminiForChat(systemPrompt, geminiKey);
    } catch (err: any) {
      console.warn('Falha no Gemini para WhatsApp, usando fallback clínico:', err?.message);
    }
  }

  // Fallback se não houver chave ou falhar
  if (!replyText) {
    if (pacienteFound || responsibleFound) {
      replyText = `Olá, ${contactName}! 🌸 Que bom falar com você! Recebemos sua mensagem na recepção da clínica. Como podemos te ajudar hoje com as sessões? Caso precise de atendimento com a nossa secretária, é só me avisar!`;
    } else {
      replyText = `Olá! 🌸 Seja muito bem-vindo(a) à nossa clínica de Psicopedagogia! Recebemos sua mensagem com muito carinho. Você gostaria de conhecer nossos serviços de avaliação e atendimento ou precisa de alguma informação sobre horários?`;
    }
  }

  // 8. Detecção de intenção de agendamento na resposta
  const lowerMsg = incoming.messageText.toLowerCase();
  const hasScheduleIntent =
    lowerMsg.includes('agendar') ||
    lowerMsg.includes('marcar') ||
    lowerMsg.includes('horário') ||
    lowerMsg.includes('horario') ||
    lowerMsg.includes('consulta');

  if (hasScheduleIntent) {
    intent = 'SCHEDULE_REQUEST';

    // Criação opcional de agendamento PENDENTE se data for mencionada e paciente identificado
    if (pacienteFound) {
      try {
        const nextDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const pendingApp = await db.appointment.create({
          data: {
            pacienteId: pacienteFound.id,
            patientName: pacienteFound.name,
            date: nextDate,
            startTime: '14:00',
            endTime: '15:00',
            type: 'AVALIACAO',
            status: 'PENDENTE',
            notes: `Solicitação via WhatsApp IA: "${incoming.messageText.slice(0, 150)}"`,
          },
        });
        return {
          replyText,
          intent,
          appointmentCreated: pendingApp,
        };
      } catch (err: any) {
        console.warn('Aviso: não foi possível criar pré-agendamento automático:', err?.message);
      }
    }
  }

  return {
    replyText,
    intent,
  };
}
