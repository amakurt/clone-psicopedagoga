import prisma from '../src/lib/prisma';

async function main() {
  console.log('[PLANS] Iniciando migração para novos planos de assinatura...');

  // 1. Desativa planos antigos da vitrine pública
  await prisma.plan.updateMany({
    where: { code: { in: ['TRIAL', 'BASICO', 'PRO'] } },
    data: { active: false },
  });

  // 2. Cadastra/atualiza os 3 novos planos oficiais
  const newPlans = [
    {
      code: 'MENSAL',
      name: 'Plano Mensal',
      priceCents: 12700, // R$ 127,00
      maxPacientes: 100000,
      maxProfissionais: 1000,
      features: JSON.stringify([
        'R$ 127,00 por mês',
        'Pacientes ilimitados',
        'Profissionais ilimitados',
        'Agenda inteligente & TV Sala de Espera',
        'Prontuários, Anamneses e Evoluções',
        'Emissão de Laudos com IA clínica',
        'Disparos automáticos via WhatsApp',
        'Sem fidelidade ou carência',
      ]),
      active: true,
    },
    {
      code: 'SEMESTRAL',
      name: 'Plano Semestral',
      priceCents: 59400, // R$ 594,00 = R$ 99/mês
      maxPacientes: 100000,
      maxProfissionais: 1000,
      features: JSON.stringify([
        'Equivalente a R$ 99,00/mês (Economia de 22%)',
        'Cobrança semestral de R$ 594,00',
        'Pacientes ilimitados',
        'Profissionais ilimitados',
        'Agenda inteligente & TV Sala de Espera',
        'Prontuários, Anamneses e Evoluções',
        'Emissão de Laudos com IA clínica',
        'Disparos automáticos via WhatsApp',
        'Suporte prioritário',
      ]),
      active: true,
    },
    {
      code: 'ANUAL',
      name: 'Plano Anual',
      priceCents: 82800, // R$ 828,00 = R$ 69/mês
      maxPacientes: 100000,
      maxProfissionais: 1000,
      features: JSON.stringify([
        'Equivalente a R$ 69,00/mês (Economia de 45% - Campeão)',
        'Cobrança anual de R$ 828,00',
        'Pacientes ilimitados',
        'Profissionais ilimitados',
        'Agenda inteligente & TV Sala de Espera',
        'Prontuários, Anamneses e Evoluções',
        'Emissão de Laudos com IA clínica',
        'Disparos automáticos via WhatsApp',
        'Onboarding personalizado & Suporte VIP',
      ]),
      active: true,
    },
    {
      code: 'VIP',
      name: 'VIP Vitalício',
      priceCents: 0,
      maxPacientes: 100000,
      maxProfissionais: 1000,
      features: JSON.stringify([
        'Acesso Permanente e Ilimitado',
        'Todos os módulos clínicos e IA liberados',
        'WhatsApp ilimitado',
      ]),
      active: true,
    },
  ];

  for (const p of newPlans) {
    const upserted = await prisma.plan.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        priceCents: p.priceCents,
        maxPacientes: p.maxPacientes,
        maxProfissionais: p.maxProfissionais,
        features: p.features,
        active: p.active,
      },
      create: p,
    });
    console.log(`[PLANS] Plano ${upserted.code}: ${upserted.name} -> R$ ${(upserted.priceCents / 100).toFixed(2)} (Ativo: ${upserted.active})`);
  }

  console.log('[PLANS] Migração de planos concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error('[PLANS] Erro na migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
