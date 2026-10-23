import prisma from '../src/lib/prisma';

async function main() {
  const emailOrSlug = process.argv[2];
  const days = Number(process.argv[3]) || 7;

  if (!emailOrSlug) {
    console.error('Uso: npx ts-node scripts/grant-trial.ts <email-ou-slug-ou-nome> [dias (padrao: 7)]');
    process.exit(1);
  }

  console.log(`[TRIAL] Localizando conta para "${emailOrSlug}"...`);

  // Busca por e-mail de usuário ou slug/nome de tenant
  const user = await prisma.user.findFirst({
    where: { email: { equals: emailOrSlug } },
    include: { memberships: { include: { tenant: true } } },
  });

  let tenant = user?.memberships[0]?.tenant;

  if (!tenant) {
    tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: { contains: emailOrSlug } },
          { name: { contains: emailOrSlug } },
        ],
      },
    });
  }

  if (!tenant) {
    console.error(`[TRIAL] Nenhuma clínica ou usuário encontrado para "${emailOrSlug}".`);
    process.exit(1);
  }

  const trialEndsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  // Atualiza o tenant
  const updatedTenant = await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      status: 'ATIVO',
      plan: 'ANUAL', // Libera todos os recursos clínicos
      trialEndsAt,
    },
  });

  // Atualiza ou cria a subscription para período de degustação (TRIAL)
  const existingSub = await prisma.subscription.findUnique({
    where: { tenantId: tenant.id },
  });

  if (existingSub) {
    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        status: 'TRIAL',
        planCode: 'ANUAL',
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndsAt,
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planCode: 'ANUAL',
        status: 'TRIAL',
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndsAt,
      },
    });
  }

  // Ativa o usuário se estiver inativo
  if (user && (!user.active || !user.emailVerified)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { active: true, emailVerified: true },
    });
  }

  console.log('----------------------------------------------------');
  console.log(`✅ [TRIAL CONCEDIDO COM SUCESSO]`);
  console.log(`Clínica: ${updatedTenant.name} (${updatedTenant.slug})`);
  if (user) console.log(`Usuário: ${user.name} (${user.email})`);
  console.log(`Plano: ANUAL (Todos os recursos liberados)`);
  console.log(`Status: ATIVO (Degustação de ${days} dias)`);
  console.log(`Válido até: ${trialEndsAt.toLocaleString('pt-BR')}`);
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('[TRIAL] Erro ao conceder trial:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
