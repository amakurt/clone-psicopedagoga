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
  const models = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const requestBody: any = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 2500,
          thinkingConfig: { thinkingBudget: 0 },
        },
      };

      let response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      // Se o endpoint retornar erro 400 por não suportar thinkingConfig, retenta sem thinkingConfig
      if (!response.ok && response.status === 400) {
        delete requestBody.generationConfig.thinkingConfig;
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
      }

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
 * Calcula horário final (+50 min)
 */
function calculateEndTime(startTime: string, durationMinutes: number = 50): string {
  const [h, m] = startTime.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return '10:00';
  const total = h * 60 + m + durationMinutes;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

/**
 * Consulta a agenda da clínica e retorna um sumário em texto dos dias e horários livres
 */
async function getClinicAvailabilityContext(db: any, daysAhead: number = 7): Promise<string> {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const futureLimit = new Date();
  futureLimit.setDate(today.getDate() + daysAhead + 4);
  const futureLimitStr = futureLimit.toISOString().split('T')[0];

  const activeAppointments = await db.appointment.findMany({
    where: {
      date: { gte: todayStr, lte: futureLimitStr },
      status: { in: ['CONFIRMADO', 'AGENDADO', 'PENDENTE'] },
    },
    select: { date: true, startTime: true, endTime: true },
  });

  const occupiedSet = new Set(activeAppointments.map((a: any) => `${a.date}_${a.startTime}`));
  const standardSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  const lines: string[] = [];
  let businessDaysCount = 0;

  for (let i = 0; i < 14 && businessDaysCount < daysAhead; i++) {
    const curDate = new Date();
    curDate.setDate(today.getDate() + i);
    const dayOfWeek = curDate.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    businessDaysCount++;
    const dateStr = curDate.toISOString().split('T')[0];
    const [y, m, d] = dateStr.split('-');
    const formattedDate = `${d}/${m}/${y}`;
    const dayLabel = `${dayNames[dayOfWeek]} (${formattedDate} - data ISO: ${dateStr})`;

    const freeSlots: string[] = [];
    const busySlots: string[] = [];

    for (const slot of standardSlots) {
      if (occupiedSet.has(`${dateStr}_${slot}`)) {
        busySlots.push(slot);
      } else {
        freeSlots.push(slot);
      }
    }

    lines.push(
      `- ${dayLabel}: LIVRES: [${freeSlots.join(', ')}]${
        busySlots.length > 0 ? ` | OCUPADOS: [${busySlots.join(', ')}]` : ''
      }`
    );
  }

  return lines.join('\n');
}

/**
 * Extrai o bloco de JSON de pré-agendamento retornado pela IA e limpa o texto visível
 */
function extractPendingAppointmentJson(text: string): {
  cleanText: string;
  appointmentData?: { data: string; horario: string };
} {
  const jsonMatch =
    text.match(/```json\s*(\{[\s\S]*?"agendamento"[\s\S]*?\})\s*```/i) ||
    text.match(/(\{[\s\S]*?"agendamento"[\s\S]*?\})/i);

  if (!jsonMatch) {
    return { cleanText: text.trim() };
  }

  let appointmentData: { data: string; horario: string } | undefined;
  try {
    const parsed = JSON.parse(jsonMatch[1]);
    if (parsed.agendamento?.data && parsed.agendamento?.horario) {
      appointmentData = {
        data: parsed.agendamento.data.trim(),
        horario: parsed.agendamento.horario.trim(),
      };
    }
  } catch (err) {
    // Falha silenciosa de JSON
  }

  const cleanText = text.replace(jsonMatch[0], '').trim();
  return { cleanText, appointmentData };
}

/**
 * Registra o pré-agendamento PENDENTE no banco de dados e notifica a equipe
 */
async function registerPendingAppointment(
  db: any,
  tenantId: string,
  paciente: { id: string; name: string },
  appointmentData: { data: string; horario: string },
  responsibleName: string,
  source: 'Chat Interno' | 'WhatsApp'
) {
  const endTime = calculateEndTime(appointmentData.horario, 50);

  // 1. Verifica se já existe agendamento ativo no mesmo horário
  const conflict = await db.appointment.findFirst({
    where: {
      date: appointmentData.data,
      startTime: appointmentData.horario,
      status: { in: ['CONFIRMADO', 'AGENDADO', 'PENDENTE'] },
    },
  });

  if (conflict) {
    return { created: false, reason: 'Horário já ocupado na agenda' };
  }

  // 2. Cria o registro com status PENDENTE
  const app = await db.appointment.create({
    data: {
      tenantId,
      pacienteId: paciente.id,
      patientName: paciente.name,
      date: appointmentData.data,
      startTime: appointmentData.horario,
      endTime,
      type: 'SESSAO',
      status: 'PENDENTE',
      notes: `Pré-agendado via Assistente Virtual (IA - ${source}). Solicitado por ${responsibleName}. Aguardando validação da recepção.`,
    },
  });

  // 3. Notifica a equipe/secretária
  try {
    const staffMembers = await db.user.findMany({
      where: { role: { in: ['SECRETARIA', 'GESTOR', 'PSICOPEDAGOGO'] } },
      take: 5,
    });
    for (const staff of staffMembers) {
      await db.notification.create({
        data: {
          tenantId,
          userId: staff.id,
          title: 'Novo pré-agendamento via IA',
          message: `${responsibleName} pré-agendou uma consulta para ${paciente.name} no dia ${appointmentData.data} às ${appointmentData.horario}. Confirme na agenda!`,
          type: 'appointment',
          read: false,
        },
      });
    }
  } catch (err: any) {
    console.warn('Aviso: falha ao criar notificação de pré-agendamento:', err?.message);
  }

  return { created: true, appointment: app };
}

/**
 * Processa a mensagem recebida com contexto de banco de dados e IA no WhatsApp
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

  // 5. Consulta disponibilidade real da agenda da clínica
  const availabilityText = await getClinicAvailabilityContext(db, 7);
  const todayStr = new Date().toISOString().split('T')[0];

  // 6. Construção do Prompt para a IA
  const customClinicPrompt =
    config?.aiPrompt ||
    `
Você é a assistente virtual acolhedora, humana e profissional da clínica de Psicopedagogia e Neurodesenvolvimento Infantil.
Seu objetivo é acolher os pais e responsáveis, tirar dúvidas com carinho, explicar como funcionam as sessões/avaliações e apoiar com agendamentos.
`;

  const systemPrompt = `
${customClinicPrompt.trim()}

DIRETRIZES FUNDAMENTAIS:
1. Tom de voz: Empático, seguro, afetuoso, profissional e claro (com emojis pontuais como 🌸, 📚, ✨, 🧠).
2. Nunca faça promessas médicas ou feche diagnósticos pelo WhatsApp.
3. Se o usuário estiver muito ansioso, pedir para falar com um ser humano ou se houver uma emergência, responda dizendo que está avisando a secretária para assumir a conversa.
4. Mensagens para WhatsApp devem ser acolhedoras e bem estruturadas (2 a 3 parágrafos), sem jargões difíceis.
5. SEMPRE conclua o seu raciocínio até o final e encerre com uma saudação atenciosa (ex: "Qualquer dúvida, estamos sempre à disposição! ✨"). NUNCA corte ou interrompa uma frase pela metade.

AGENDA DA CLÍNICA & HORÁRIOS DISPONÍVEIS:
${availabilityText}

REGRAS DE AGENDAMENTO:
- Se o cliente perguntar horários disponíveis, apresente com carinho opções LIVRES da lista acima para os próximos dias úteis.
- Se o cliente escolher ou sugerir uma data e horário:
  * Verifique se está LIVRE na lista de disponibilidade da agenda acima.
  * Se estiver LIVRE: acolha com entusiasmo, diga que já registrou o pré-agendamento no sistema com status "Pendente" para a secretária validar e que ela receberá a confirmação em breve. E OBRIGATORIAMENTE anexe no final da resposta o bloco JSON técnico:
    \`\`\`json
    {"agendamento": {"data": "YYYY-MM-DD", "horario": "HH:mm"}}
    \`\`\`
  * Se estiver OCUPADO: explique carinhosamente que esse horário já está reservado e sugira outros horários livres daquele mesmo dia ou do dia seguinte.
- Se o cliente ainda NÃO tiver definido data e horário específicos, NÃO inclua o bloco JSON.

DADOS DO CONTEXTO:
- Nome informado no WhatsApp: ${incoming.pushName || 'Não especificado'}
- Vínculo no sistema: ${patientInfo}
- Data de hoje: ${todayStr}

${historyContext ? `HISTÓRICO RECENTE DA CONVERSA:\n${historyContext}\n` : ''}

MENSAGEM ATUAL DO CLIENTE:
"${incoming.messageText}"

Responda agora diretamente à mensagem do cliente como a assistente da clínica:
`;

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
      replyText = `Olá, ${contactName}! 🌸 Que bom falar com você! Recebemos sua mensagem na recepção da clínica. Como podemos te ajudar hoje com as sessões? Caso precise de agendamento ou atendimento com a nossa secretária, é só me avisar!`;
    } else {
      replyText = `Olá! 🌸 Seja muito bem-vindo(a) à nossa clínica de Psicopedagogia! Recebemos sua mensagem com muito carinho. Você gostaria de conhecer nossos serviços de avaliação e atendimento ou precisa de alguma informação sobre horários?`;
    }
  }

  // 7. Extração do JSON de pré-agendamento e criação no banco
  const { cleanText, appointmentData } = extractPendingAppointmentJson(replyText);
  replyText = cleanText;

  let appointmentCreated: any = null;
  if (appointmentData && pacienteFound) {
    intent = 'SCHEDULE_REQUEST';
    const regResult = await registerPendingAppointment(
      db,
      incoming.tenantId,
      pacienteFound,
      appointmentData,
      contactName,
      'WhatsApp'
    );
    if (regResult.created) {
      appointmentCreated = regResult.appointment;
    }
  }

  return {
    replyText,
    intent,
    appointmentCreated,
  };
}

export interface InternalChatMessageInput {
  tenantId: string;
  pacienteId: string;
  userMessageText: string;
  senderName: string;
}

/**
 * Processa mensagens recebidas no Chat Interno do Sistema (Portal da Família / Chat com os Pais)
 */
export async function processInternalChatAIMessage(
  input: InternalChatMessageInput
): Promise<{ replyText?: string; shouldMute?: boolean; intent?: string; appointmentCreated?: any }> {
  try {
    const db = scoped(prisma, input.tenantId);

    // 1. Verifica se a IA está habilitada na clínica
    const config = await db.whatsAppConfig.findFirst();
    if (!config || !config.aiEnabled) {
      return {};
    }

    // 2. Transbordo direto se pediu atendimento humano
    if (isDirectHandoffRequest(input.userMessageText)) {
      const replyText =
        'Com certeza! Já notifiquei nossa equipe e um profissional da clínica continuará seu atendimento por aqui em breve. 🌸';
      await db.chatMessage.create({
        data: {
          tenantId: input.tenantId,
          senderId: 'ai-assistant',
          senderName: 'Assistente Virtual (IA)',
          senderRole: 'AI',
          message: replyText,
          pacienteId: input.pacienteId,
          readByStaff: false,
          readByGuardian: true,
        },
      });
      return { replyText, shouldMute: true, intent: 'HANDOFF' };
    }

    // 3. Pausa se houve mensagem recente da equipe (Staff) para não atropelar conversa humana
    const autoMuteMs = (config.autoMuteHours || 4) * 60 * 60 * 1000;
    const recentStaffMsg = await db.chatMessage.findFirst({
      where: {
        pacienteId: input.pacienteId,
        senderRole: 'STAFF',
        createdAt: { gte: new Date(Date.now() - autoMuteMs) },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (recentStaffMsg) {
      return {}; // Atendimento humano ativo, não sobrepõe
    }

    // 4. Contexto do Paciente e do Responsável
    const paciente = await db.paciente.findUnique({
      where: { id: input.pacienteId },
      include: {
        responsible: true,
        appointments: {
          take: 3,
          orderBy: { date: 'desc' },
          where: { status: { in: ['CONFIRMADO', 'PENDENTE', 'AGENDADO'] } },
        },
      },
    });

    const patientName = paciente?.name || 'a criança';
    const responsibleName = input.senderName || paciente?.responsible?.name || 'Família';
    const patientNotes = paciente?.notes || 'Em acompanhamento';

    // 5. Histórico recente de mensagens no chat interno
    const recentMessages = await db.chatMessage.findMany({
      where: { pacienteId: input.pacienteId },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });
    recentMessages.reverse();

    const historyContext = recentMessages
      .map(
        (m: any) =>
          `${
            m.senderRole === 'RESPONSAVEL'
              ? 'Responsável'
              : m.senderRole === 'AI'
              ? 'Assistente IA'
              : 'Equipe'
          }: ${m.message}`
      )
      .join('\n');

    // 6. Consulta disponibilidade real da agenda da clínica
    const availabilityText = await getClinicAvailabilityContext(db, 7);
    const todayStr = new Date().toISOString().split('T')[0];

    // 7. Montagem do Prompt
    const customPrompt =
      config.aiPrompt ||
      `
Você é a Assistente Virtual acolhedora e atenciosa da clínica EduPsych Pro de Psicopedagogia e Neurodesenvolvimento Infantil.
Seu objetivo é dar suporte aos pais e responsáveis pelo chat interno do sistema, com empatia, delicadeza e profissionalismo.
`;

    const systemPrompt = `
${customPrompt.trim()}

CONTEXTO DO ATENDIMENTO INTERNO NO PORTAL:
- Responsável: ${responsibleName}
- Paciente: ${patientName}
- Notas clínicas resumidas: ${patientNotes}
- Data de hoje: ${todayStr}

AGENDA DA CLÍNICA & HORÁRIOS DISPONÍVEIS:
${availabilityText}

REGRAS DE AGENDAMENTO E HORÁRIOS:
1. Se o responsável perguntar sobre dias e horários livres, sugira com carinho algumas opções LIVRES listadas acima nos próximos dias úteis.
2. Se o responsável escolher/confirmar uma data e horário:
   - Verifique se o dia e horário estão LIVRES na lista da agenda acima.
   - Se estiver LIVRE: confirme com carinho e entusiasmo, diga que você já registrou o pré-agendamento no sistema com status "Pendente" para a equipe/secretária validar na agenda e que assim que confirmarem ele receberá a confirmação por aqui. E OBRIGATORIAMENTE anexe no final da resposta o bloco JSON técnico:
     \`\`\`json
     {"agendamento": {"data": "YYYY-MM-DD", "horario": "HH:mm"}}
     \`\`\`
   - Se estiver OCUPADO na lista: explique com delicadeza que esse horário específico já está reservado e sugira outros horários livres daquele mesmo dia ou do dia seguinte.
3. Se o responsável ainda NÃO tiver definido uma data e horário específicos, NÃO inclua o bloco JSON.

DIRETRIZES GERAIS:
1. Responda em Português do Brasil com tom empático, acolhedor e atencioso (use emojis suaves como 🌸, ✨, 🧠, 📚).
2. Não forneça diagnósticos médicos fechados ou alterações de conduta clínica sem parecer da equipe.
3. Se o responsável tiver dúvidas sobre evolução, acolha e esclareça que a equipe técnica também lerá e acompanhará.
4. Seja direta, acolhedora e tranquilizadora (2 a 3 parágrafos).
5. SEMPRE conclua todo o raciocínio até o fim e encerre a mensagem com uma despedida calorosa e atenciosa. NUNCA corte ou interrompa a resposta no meio de uma frase.

HISTÓRICO RECENTE DO CHAT:
${historyContext || 'Início da conversa.'}

NOVA MENSAGEM DO RESPONSÁVEL:
"${input.userMessageText}"
`.trim();

    let replyText = '';
    const geminiKey = config.geminiKey || process.env.GEMINI_API_KEY || '';
    if (geminiKey) {
      try {
        replyText = await callGeminiForChat(systemPrompt, geminiKey);
      } catch (err: any) {
        console.warn('Falha na chamada ao Gemini no chat interno:', err?.message);
      }
    }

    if (!replyText) {
      replyText = `Olá, ${responsibleName}! 🌸 Recebemos sua mensagem sobre ${patientName}. Nossa equipe clínica já está acompanhando seu contato para lhe dar todo o suporte necessário. Se precisar de algo urgente, estamos sempre à disposição! ✨`;
    }

    // 8. Extração do JSON de pré-agendamento e criação real no banco
    const { cleanText, appointmentData } = extractPendingAppointmentJson(replyText);
    replyText = cleanText;

    let appointmentCreated: any = null;
    if (appointmentData && paciente) {
      const regResult = await registerPendingAppointment(
        db,
        input.tenantId,
        paciente,
        appointmentData,
        responsibleName,
        'Chat Interno'
      );
      if (regResult.created) {
        appointmentCreated = regResult.appointment;
      }
    }

    // 9. Persistência da resposta da IA no banco
    await db.chatMessage.create({
      data: {
        tenantId: input.tenantId,
        senderId: 'ai-assistant',
        senderName: 'Assistente Virtual (IA)',
        senderRole: 'AI',
        message: replyText,
        pacienteId: input.pacienteId,
        readByStaff: false,
        readByGuardian: true,
      },
    });

    return { replyText, intent: appointmentCreated ? 'SCHEDULE_REQUEST' : 'INFO', appointmentCreated };
  } catch (err: any) {
    console.error('Erro em processInternalChatAIMessage:', err);
    return {};
  }
}


