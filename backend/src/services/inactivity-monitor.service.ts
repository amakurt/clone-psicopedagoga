import prisma from '../lib/prisma';

export const DEFAULT_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos

let monitorInterval: NodeJS.Timeout | null = null;

/**
 * Verifica e encerra conversas inativas no WhatsApp e no Chat Interno
 */
export async function checkAndCloseInactiveConversations(
  timeoutMs: number = DEFAULT_INACTIVITY_TIMEOUT_MS
): Promise<{ closedWhatsApp: number; closedInternalChat: number }> {
  let closedWhatsApp = 0;
  let closedInternalChat = 0;
  const cutoffTime = new Date(Date.now() - timeoutMs);

  try {
    // =========================================================================
    // 1. VERIFICAÇÃO WHATSAPP
    // =========================================================================
    const activeWhatsAppConversations = await prisma.whatsAppConversation.findMany({
      where: {
        status: 'ACTIVE',
        lastMessageAt: { lte: cutoffTime },
      },
      include: {
        paciente: {
          include: { responsible: true },
        },
      },
    });

    for (const conv of activeWhatsAppConversations) {
      // Busca a última mensagem da conversa
      const lastMsg = await prisma.whatsAppMessage.findFirst({
        where: { conversationId: conv.id },
        orderBy: { createdAt: 'desc' },
      });

      // Só encerra se a última mensagem foi da IA ou da clínica (ou seja, o cliente parou de responder)
      if (lastMsg && (lastMsg.sender === 'AI' || lastMsg.sender === 'HUMAN')) {
        const patientName = conv.paciente?.name || '';
        const contactName = conv.contactName || conv.paciente?.responsible?.name || 'Família';
        const targetName = patientName ? `o ${patientName}` : 'a família';

        const closingMsg = `Olá, ${contactName}! 🌸 Como não tivemos mais retorno por aqui, estamos finalizando este atendimento por enquanto. Se precisar de qualquer orientação, agendamento ou suporte futuro, basta nos enviar uma nova mensagem! Um abraço bem carinhoso para você e para ${targetName}! ✨`;

        // Salva a mensagem no banco
        await prisma.whatsAppMessage.create({
          data: {
            tenantId: conv.tenantId,
            conversationId: conv.id,
            sender: 'AI',
            message: closingMsg,
          },
        });

        // Atualiza a conversa para CLOSED
        await prisma.whatsAppConversation.update({
          where: { id: conv.id },
          data: {
            status: 'CLOSED',
            lastMessageAt: new Date(),
          },
        });

        // Envia mensagem via WhatsApp (best effort)
        try {
          const { sendWhatsAppMessage } = await import('./whatsapp-client.service');
          await sendWhatsAppMessage(conv.phone, closingMsg, conv.tenantId);
          console.log(`[INACTIVITY] Atendimento WhatsApp encerrado por inatividade para ${conv.phone}`);
        } catch (err: any) {
          console.warn(`[INACTIVITY] Falha ao enviar WhatsApp de encerramento para ${conv.phone}:`, err?.message);
        }

        closedWhatsApp++;
      }
    }

    // =========================================================================
    // 2. VERIFICAÇÃO CHAT INTERNO (PORTAL DA FAMÍLIA)
    // =========================================================================
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Busca pacientes com interações nas últimas 24 horas
    const recentMessages = await prisma.chatMessage.findMany({
      where: {
        createdAt: { gte: oneDayAgo },
      },
      select: {
        pacienteId: true,
        tenantId: true,
      },
      distinct: ['pacienteId'],
    });

    for (const item of recentMessages) {
      const lastMsg = await prisma.chatMessage.findFirst({
        where: { pacienteId: item.pacienteId },
        orderBy: { createdAt: 'desc' },
      });

      if (!lastMsg) continue;

      const isOlderThanTimeout = new Date(lastMsg.createdAt).getTime() <= cutoffTime.getTime();
      const isFromClinicOrAI = lastMsg.senderRole === 'AI' || lastMsg.senderRole === 'STAFF';
      const isAlreadyClosed = lastMsg.message.startsWith('🌸 Atendimento finalizado por inatividade');

      // Se a última mensagem foi da IA/Staff há mais de 15 minutos e não foi finalizada ainda
      if (isOlderThanTimeout && isFromClinicOrAI && !isAlreadyClosed) {
        const paciente = await prisma.paciente.findUnique({
          where: { id: item.pacienteId },
          include: { responsible: true },
        });

        const patientName = paciente?.name || 'a criança';
        const targetName = paciente?.name ? `o ${paciente.name}` : 'a família';

        const closingText = `🌸 Atendimento finalizado por inatividade. Como não tivemos mais retorno por aqui, estamos encerrando esta conversa por enquanto. Se precisar de qualquer novidade, agendamento ou suporte, estamos sempre à disposição! Um abraço bem carinhoso para você e para ${targetName}! ✨`;

        await prisma.chatMessage.create({
          data: {
            tenantId: item.tenantId,
            senderId: 'ai-assistant',
            senderName: 'Assistente Virtual (IA)',
            senderRole: 'AI',
            message: closingText,
            pacienteId: item.pacienteId,
            readByStaff: false,
            readByGuardian: true,
          },
        });

        console.log(`[INACTIVITY] Atendimento Chat Interno encerrado por inatividade para paciente ${patientName} (${item.pacienteId})`);
        closedInternalChat++;
      }
    }
  } catch (err: any) {
    console.error('[INACTIVITY] Erro ao verificar conversas inativas:', err?.message);
  }

  return { closedWhatsApp, closedInternalChat };
}

/**
 * Inicia o monitor de inatividade periódico
 */
export function startInactivityMonitor(
  intervalMs: number = 60 * 1000, // a cada 1 minuto
  timeoutMs: number = DEFAULT_INACTIVITY_TIMEOUT_MS
) {
  if (monitorInterval) {
    clearInterval(monitorInterval);
  }

  console.log(`[INACTIVITY] Monitor de inatividade iniciado (intervalo: ${intervalMs / 1000}s, timeout: ${timeoutMs / 60000}min)`);

  monitorInterval = setInterval(async () => {
    await checkAndCloseInactiveConversations(timeoutMs);
  }, intervalMs);

  // Executa uma verificação inicial após 10 segundos
  setTimeout(async () => {
    await checkAndCloseInactiveConversations(timeoutMs);
  }, 10000);
}

/**
 * Para o monitor de inatividade
 */
export function stopInactivityMonitor() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    console.log('[INACTIVITY] Monitor de inatividade finalizado');
  }
}
