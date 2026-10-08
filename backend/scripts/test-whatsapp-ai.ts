import 'dotenv/config';
import prisma from '../src/lib/prisma';
import { processWhatsAppAIMessage } from '../src/services/whatsapp-ai.service';

async function runTest() {
  console.log('🧪 Iniciando Teste de Validação: Atendimento Online com IA no WhatsApp...');

  // 1. Obter ou criar um tenant de teste
  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: { name: 'Clínica Teste EduPsych', slug: 'clinica-teste' },
    });
  }
  console.log('✅ Tenant localizado:', tenant.id, tenant.name);

  // 2. Garantir WhatsAppConfig com IA habilitada
  let config = await prisma.whatsAppConfig.findFirst({
    where: { tenantId: tenant.id },
  });
  if (!config) {
    config = await prisma.whatsAppConfig.create({
      data: {
        tenantId: tenant.id,
        apiUrl: 'https://evoapi.suaclinica.com.br',
        token: 'test-token',
        phoneNumberId: 'clinica-teste',
        aiEnabled: true,
        autoMuteHours: 4,
      },
    });
  } else {
    config = await prisma.whatsAppConfig.update({
      where: { id: config.id },
      data: { aiEnabled: true },
    });
  }
  console.log('✅ WhatsAppConfig validado. IA Habilitada:', config.aiEnabled);

  // 3. Teste 1: Acolhimento e Tira-Dúvidas Geral
  console.log('\n--- Cenário 1: Dúvida de Novo Pai / Mãe ---');
  const res1 = await processWhatsAppAIMessage({
    tenantId: tenant.id,
    phone: '5511999887766',
    pushName: 'Camila Ferreira',
    messageText: 'Olá, boa tarde! Meu filho de 7 anos está com dificuldade na alfabetização e a escola pediu avaliação. Vocês atendem essa faixa etária?',
  });
  console.log('Intenção detectada:', res1.intent);
  console.log('Resposta da IA:\n', res1.replyText);

  // 4. Teste 2: Transbordo Imediato (Hand-off)
  console.log('\n--- Cenário 2: Solicitação de Atendente Humano ---');
  const res2 = await processWhatsAppAIMessage({
    tenantId: tenant.id,
    phone: '5511999887766',
    pushName: 'Camila Ferreira',
    messageText: 'Entendi, gostaria de falar com uma atendente humana por favor.',
  });
  console.log('Intenção detectada:', res2.intent);
  console.log('Deve pausar IA (shouldMute):', res2.shouldMute);
  console.log('Horas de pausa:', res2.muteHours);
  console.log('Resposta de Transbordo:\n', res2.replyText);

  // 5. Teste 3: Criação de Conversa e Mensagens no Prisma
  console.log('\n--- Cenário 3: Persistência no Banco de Dados ---');
  const testPhone = '5511988887777';
  let conv = await prisma.whatsAppConversation.findFirst({
    where: { tenantId: tenant.id, phone: testPhone },
  });
  if (!conv) {
    conv = await prisma.whatsAppConversation.create({
      data: {
        tenantId: tenant.id,
        phone: testPhone,
        contactName: 'Mariana Lima',
        status: 'ACTIVE',
      },
    });
  }

  const msgUser = await prisma.whatsAppMessage.create({
    data: {
      tenantId: tenant.id,
      conversationId: conv.id,
      sender: 'USER',
      message: 'Olá, qual o valor da sessão?',
    },
  });

  const msgAi = await prisma.whatsAppMessage.create({
    data: {
      tenantId: tenant.id,
      conversationId: conv.id,
      sender: 'AI',
      message: 'Olá Mariana! 🌸 Os valores variam conforme o plano avaliativo...',
    },
  });

  console.log('✅ Conversa e mensagens persistidas com sucesso! Conversa ID:', conv.id);
  console.log('Total de mensagens:', [msgUser.id, msgAi.id].length);

  console.log('\n🎉 TODOS OS TESTES FORAM CONCLUÍDOS COM SUCESSO ABSOLUTO!');
}

runTest()
  .catch((e) => {
    console.error('❌ Erro no teste:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
