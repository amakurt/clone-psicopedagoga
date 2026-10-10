import prisma from '../src/lib/prisma';
import { processInternalChatAIMessage } from '../src/services/whatsapp-ai.service';

async function runTest() {
  console.log('🧪 Iniciando Teste de Validação: IA no Chat Interno do Sistema...');

  const patient = await prisma.paciente.findFirst({
    include: { responsible: true },
  });

  if (!patient) {
    throw new Error('Nenhum paciente encontrado para teste.');
  }

  console.log(`✅ Paciente identificado: ${patient.name} (ID: ${patient.id})`);
  console.log(`✅ Tenant ID: ${patient.tenantId}`);

  // Garante que o config tem IA habilitada
  await prisma.whatsAppConfig.updateMany({
    where: { tenantId: patient.tenantId },
    data: { aiEnabled: true },
  });

  // 1. Simula envio de mensagem pelo responsável no chat interno
  const userMsg = 'Olá! Gostaria de saber como foi a última sessão e se vocês vão passar exercícios para fazer em casa.';
  console.log(`\n📩 Mensagem enviada pelo Responsável:\n"${userMsg}"`);

  // Salva mensagem do responsável
  const guardianMsg = await prisma.chatMessage.create({
    data: {
      tenantId: patient.tenantId,
      senderId: 'guardian-test-id',
      senderName: patient.responsible?.name || 'Mãe do Gabriel',
      senderRole: 'RESPONSAVEL',
      message: userMsg,
      pacienteId: patient.id,
      readByStaff: false,
      readByGuardian: true,
    },
  });
  console.log(`✅ Mensagem do responsável salva (ID: ${guardianMsg.id})`);

  // 2. Dispara o processador de IA do chat interno
  console.log('\n🤖 Processando resposta da IA no Chat Interno...');
  const aiResult = await processInternalChatAIMessage({
    tenantId: patient.tenantId,
    pacienteId: patient.id,
    userMessageText: userMsg,
    senderName: patient.responsible?.name || 'Mãe do Gabriel',
  });

  console.log('Intenção:', aiResult.intent);
  console.log('Resposta da IA:\n', aiResult.replyText);

  // 3. Verifica se a resposta foi persistida em ChatMessage com senderRole AI
  const lastAiMsg = await prisma.chatMessage.findFirst({
    where: {
      pacienteId: patient.id,
      senderRole: 'AI',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!lastAiMsg) {
    throw new Error('A mensagem da IA não foi encontrada no banco de dados!');
  }

  console.log(`\n✅ Resposta da IA validada no banco! ID: ${lastAiMsg.id}`);
  console.log(`   Remetente: ${lastAiMsg.senderName} (${lastAiMsg.senderRole})`);
  console.log(`   Conteúdo: "${lastAiMsg.message}"`);

  console.log('\n🎉 TESTE CONCLUÍDO COM 100% DE SUCESSO!');
}

runTest()
  .catch((e) => {
    console.error('❌ Falha no teste:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
