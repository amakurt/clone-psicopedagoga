import prisma from '../src/lib/prisma';
import { processInternalChatAIMessage } from '../src/services/whatsapp-ai.service';

async function testScheduling() {
  console.log('🧪 Iniciando Teste de Agendamento com IA...');

  const patient = await prisma.paciente.findFirst({
    include: { responsible: true },
  });

  if (!patient) {
    throw new Error('Nenhum paciente encontrado.');
  }

  // Define uma data de amanhã ou próximo dia útil no formato YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1); // se domingo vai pra segunda
  if (tomorrow.getDay() === 6) tomorrow.setDate(tomorrow.getDate() + 2); // se sábado vai pra segunda
  const targetDateStr = tomorrow.toISOString().split('T')[0];

  const schedulingMsg = `Olá, gostaria de agendar uma consulta para o ${patient.name} no dia ${targetDateStr} às 14:00, tem esse horário disponível?`;
  console.log(`\n📩 Mensagem do Responsável: "${schedulingMsg}"`);

  // Processa IA
  const result = await processInternalChatAIMessage({
    tenantId: patient.tenantId,
    pacienteId: patient.id,
    userMessageText: schedulingMsg,
    senderName: patient.responsible?.name || 'Responsável',
  });

  console.log('\n🤖 Resposta da IA:\n', result.replyText);

  // Verifica se o agendamento PENDENTE foi criado no banco
  const pendingAppointment = await prisma.appointment.findFirst({
    where: {
      pacienteId: patient.id,
      date: targetDateStr,
      startTime: '14:00',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (pendingAppointment) {
    console.log(`\n✅ Pré-agendamento PENDENTE criado com sucesso!`);
    console.log(`   ID: ${pendingAppointment.id}`);
    console.log(`   Data: ${pendingAppointment.date} às ${pendingAppointment.startTime}`);
    console.log(`   Status: ${pendingAppointment.status}`);
    console.log(`   Notas: ${pendingAppointment.notes}`);

    // Simula a confirmação pela clínica (atendente confirmando)
    console.log('\n👩‍💼 Atendente da clínica confirmando o agendamento...');
    const updated = await prisma.appointment.update({
      where: { id: pendingAppointment.id },
      data: { status: 'CONFIRMADO' },
    });

    // Dispara a lógica de envio no ChatMessage que adicionamos em appointments.ts
    const confirmMessage = await prisma.chatMessage.create({
      data: {
        tenantId: patient.tenantId,
        senderId: 'staff-auto',
        senderName: 'Clínica (Atendimento)',
        senderRole: 'STAFF',
        message: `✅ Olá! Sua consulta agendada para o dia ${updated.date} às ${updated.startTime} foi confirmada com sucesso pela nossa equipe. Aguardamos vocês!`,
        pacienteId: patient.id,
        readByStaff: true,
        readByGuardian: false,
      },
    });

    console.log(`✅ Mensagem de confirmação enviada no chat para o responsável:`);
    console.log(`   "${confirmMessage.message}"`);
  } else {
    console.log(`ℹ️ Agendamento não foi criado automaticamente ou já existia ocupação.`);
  }

  console.log('\n🎉 TESTE CONCLUÍDO!');
}

testScheduling()
  .catch((e) => {
    console.error('❌ Erro no teste:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
