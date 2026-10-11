import prisma from '../src/lib/prisma';
import { checkAndCloseInactiveConversations } from '../src/services/inactivity-monitor.service';

async function testInactivity() {
  console.log('🧪 Iniciando Teste de Monitor de Inatividade (15 minutos)...');

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error('Nenhum tenant encontrado.');

  // 1. Cria ou obtém um paciente específico para o teste de inatividade
  let testPatient = await prisma.paciente.findFirst({
    where: { name: 'Paciente Inativo Teste' },
  });

  if (!testPatient) {
    testPatient = await prisma.paciente.create({
      data: {
        tenantId: tenant.id,
        name: 'Paciente Inativo Teste',
        birthDate: '2018-05-10',
      },
    });
  }

  const sixteenMinutesAgo = new Date(Date.now() - 16 * 60 * 1000);

  // 2. Limpa mensagens anteriores do paciente de teste
  await prisma.chatMessage.deleteMany({
    where: { pacienteId: testPatient.id },
  });

  // Simula que a IA respondeu há 16 minutos e o responsável não respondeu mais
  console.log('\n--- Cenário 1: Chat Interno do Sistema ---');
  await prisma.chatMessage.create({
    data: {
      tenantId: tenant.id,
      senderId: 'ai-assistant',
      senderName: 'Assistente Virtual (IA)',
      senderRole: 'AI',
      message: 'Aqui estão os horários da próxima semana para o paciente de teste! Qual deles você prefere?',
      pacienteId: testPatient.id,
      readByStaff: false,
      readByGuardian: true,
      createdAt: sixteenMinutesAgo,
    },
  });

  console.log('Mensagem simulada da IA criada com timestamp de 16 minutos atrás.');

  // 3. Cenário WhatsApp: simula conversa ativa que parou há 16 minutos
  console.log('\n--- Cenário 2: WhatsApp ---');
  let testConv = await prisma.whatsAppConversation.findFirst({
    where: { phone: '5511999998888' },
  });

  if (!testConv) {
    testConv = await prisma.whatsAppConversation.create({
      data: {
        tenantId: tenant.id,
        phone: '5511999998888',
        contactName: 'Mãe Teste',
        status: 'ACTIVE',
        pacienteId: testPatient.id,
        lastMessageAt: sixteenMinutesAgo,
      },
    });
  } else {
    testConv = await prisma.whatsAppConversation.update({
      where: { id: testConv.id },
      data: {
        status: 'ACTIVE',
        lastMessageAt: sixteenMinutesAgo,
      },
    });
  }

  // Limpa mensagens anteriores da conversa de teste
  await prisma.whatsAppMessage.deleteMany({
    where: { conversationId: testConv.id },
  });

  await prisma.whatsAppMessage.create({
    data: {
      tenantId: tenant.id,
      conversationId: testConv.id,
      sender: 'AI',
      message: 'Perfeito! Deixei essas opções anotadas.',
      createdAt: sixteenMinutesAgo,
    },
  });

  console.log('Conversa WhatsApp simulada criada com status ACTIVE e inatividade de 16 minutos.');

  // 4. Executa o monitor de inatividade
  console.log('\n⏱️ Executando verificação de inatividade (timeout: 15 minutos)...');
  const result = await checkAndCloseInactiveConversations(15 * 60 * 1000);
  console.log(`Resultado: ${result.closedInternalChat} chats internos encerrados, ${result.closedWhatsApp} conversas WhatsApp encerradas.`);

  // 5. Valida se o Chat Interno recebeu a mensagem de encerramento
  const lastInternalMsg = await prisma.chatMessage.findFirst({
    where: { pacienteId: testPatient.id },
    orderBy: { createdAt: 'desc' },
  });

  console.log('\nÚltima mensagem do Chat Interno:');
  console.log(`Remetente: ${lastInternalMsg?.senderName} (${lastInternalMsg?.senderRole})`);
  console.log(`Texto: "${lastInternalMsg?.message}"`);

  if (!lastInternalMsg?.message.includes('Atendimento finalizado por inatividade')) {
    throw new Error('Falha: Chat Interno não recebeu mensagem de encerramento por inatividade!');
  }
  console.log('✅ Chat Interno validado com sucesso!');

  // 6. Valida se a conversa de WhatsApp foi para CLOSED e recebeu a mensagem
  const updatedConv = await prisma.whatsAppConversation.findUnique({
    where: { id: testConv.id },
    include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  console.log('\nStatus da conversa WhatsApp: ' + updatedConv?.status);
  console.log(`Última mensagem WhatsApp: "${updatedConv?.messages[0]?.message}"`);

  if (updatedConv?.status !== 'CLOSED') {
    throw new Error('Falha: Conversa de WhatsApp não foi alterada para CLOSED!');
  }
  console.log('✅ WhatsApp validado com sucesso!');

  // 7. Teste de Idempotência: rodar novamente não deve duplicar o encerramento
  console.log('\n🔄 Testando idempotência (rodando novamente)...');
  const result2 = await checkAndCloseInactiveConversations(15 * 60 * 1000);
  console.log(`Segunda execução: ${result2.closedInternalChat} chats internos encerrados, ${result2.closedWhatsApp} WhatsApp encerrados.`);

  if (result2.closedInternalChat !== 0 || result2.closedWhatsApp !== 0) {
    throw new Error('Falha de idempotência: encerrou conversas já encerradas!');
  }
  console.log('✅ Idempotência validada com 100% de sucesso (não duplica mensagens)!');

  console.log('\n🧹 Limpando dados do teste do banco...');
  await prisma.chatMessage.deleteMany({ where: { pacienteId: testPatient.id } });
  await prisma.whatsAppMessage.deleteMany({ where: { conversationId: testConv.id } });
  await prisma.whatsAppConversation.deleteMany({ where: { id: testConv.id } });
  await prisma.paciente.deleteMany({ where: { id: testPatient.id } });
  console.log('✅ Dados de teste limpos com sucesso.');

  console.log('\n🎉 TODOS OS TESTES DE INATIVIDADE FORAM CONCLUÍDOS COM SUCESSO!');
}

testInactivity()
  .catch((e) => {
    console.error('❌ Erro no teste:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
