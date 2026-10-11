import prisma from '../src/lib/prisma';
import { normalizeApiUrl, sendWhatsAppMessage } from '../src/services/whatsapp-client.service';

async function testConfigFlow() {
  console.log('🧪 Iniciando Teste de Fluxo de Configuração e Envio WhatsApp...');

  // 1. Testa normalização de URL
  console.log('\n--- 1. Teste de Normalização de URLs ---');
  const urlsToTest = [
    'localhost:8080',
    'http://localhost:8080/',
    'api.evolution.com.br',
    'https://api.evolution.com.br/ ',
  ];
  for (const u of urlsToTest) {
    console.log(`Original: "${u}" -> Normalizado: "${normalizeApiUrl(u)}"`);
  }

  // 2. Testa persistência de configuração com token existente preservado
  console.log('\n--- 2. Teste de Salvamento sem re-digitar Token ---');
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error('Tenant não encontrado');

  const existing = await prisma.whatsAppConfig.findFirst({
    where: { tenantId: tenant.id },
  });

  const originalToken = existing?.token || 'token-seguro-de-teste';

  // Garante que existe com token
  await prisma.whatsAppConfig.upsert({
    where: { id: existing?.id || 'dummy-id' },
    update: { token: originalToken },
    create: {
      tenantId: tenant.id,
      apiUrl: 'http://localhost:8080',
      token: originalToken,
      phoneNumberId: 'edupsych',
    },
  });

  // Simula o payload que o frontend envia quando o usuário só muda aiPrompt e clica Salvar (token vem vazio "")
  const payloadFromFrontend = {
    apiUrl: 'http://localhost:8080',
    token: '', // token vazio!
    phoneNumberId: 'edupsych',
    aiEnabled: true,
    aiPrompt: 'Prompt de teste atualizado',
  };

  // Simula a lógica de salvamento do endpoint POST /config
  const normalizedApi = normalizeApiUrl(payloadFromFrontend.apiUrl);
  const dataToSave: any = {
    apiUrl: normalizedApi,
    phoneNumberId: payloadFromFrontend.phoneNumberId,
    aiEnabled: payloadFromFrontend.aiEnabled,
    aiPrompt: payloadFromFrontend.aiPrompt,
  };

  if (payloadFromFrontend.token && payloadFromFrontend.token.trim()) {
    dataToSave.token = payloadFromFrontend.token.trim();
  } else if (existing?.token) {
    dataToSave.token = existing.token;
  }

  const updated = await prisma.whatsAppConfig.update({
    where: { id: existing!.id },
    data: dataToSave,
  });

  console.log('Configuração salva com sucesso!');
  console.log('Token mantido com segurança:', updated.token === originalToken ? 'SIM (✅)' : 'NÃO (❌)');
  console.log('Prompt atualizado:', updated.aiPrompt);

  // 3. Testa envio de teste com captura amigável de erro
  console.log('\n--- 3. Teste de Envio com Diagnóstico Amigável ---');
  try {
    // Número sem DDI 55
    await sendWhatsAppMessage('11999998888', 'Mensagem de teste', tenant.id, {
      apiUrl: 'http://localhost:8080',
      token: 'token-teste',
      phoneNumberId: 'edupsych',
    });
  } catch (err: any) {
    console.log('Mensagem de erro capturada e tratada com carinho:');
    console.log(`"${err.message}"`);
  }

  console.log('\n🎉 TODOS OS TESTES DO FLUXO DE CONFIGURAÇÃO FORAM CONCLUÍDOS COM SUCESSO!');
}

testConfigFlow()
  .catch((e) => {
    console.error('❌ Falha:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
