const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('[ADJUST_VILMA_BILLING] Iniciando ajuste de faturas e plano da clínica da Vilma...');

  // 1. Localizar o tenant da Vilma
  const allTenants = await prisma.tenant.findMany({
    include: {
      subscription: true,
      invoices: true,
      memberships: { include: { user: true } },
    },
  });

  // 1.1 Apagar todas as faturas de clínicas demo ou modelo para não constarem no faturamento SaaS
  const demoTenants = allTenants.filter((t) =>
    (t.slug && (t.slug === 'clinica-demo' || t.slug === 'edupsychpro' || t.slug.includes('demo') || t.slug.includes('modelo'))) ||
    (t.name && (t.name.toLowerCase().includes('modelo') || t.name.toLowerCase().includes('demo')))
  );

  for (const dt of demoTenants) {
    const del = await prisma.subscriptionInvoice.deleteMany({
      where: { tenantId: dt.id },
    });
    console.log(`[ADJUST_BILLING] ${del.count} fatura(s) removida(s) da clínica demo/modelo: ${dt.name} (${dt.slug})`);

    // Resetar plano da demo para TRIAL sem gerar cobrança
    await prisma.tenant.update({
      where: { id: dt.id },
      data: { plan: 'TRIAL' },
    });
  }

  const vilma = allTenants.find((t) =>
    (t.name && t.name.toLowerCase().includes('vilma')) ||
    (t.slug && t.slug.toLowerCase().includes('vilma')) ||
    t.memberships?.some((m) =>
      (m.user?.email && m.user.email.toLowerCase().includes('vmssredencao')) ||
      (m.user?.email && m.user.email.toLowerCase().includes('vilma')) ||
      (m.user?.name && m.user.name.toLowerCase().includes('vilma'))
    )
  );

  if (!vilma) {
    console.warn('[ADJUST_VILMA_BILLING] Clínica da Vilma não encontrada no banco.');
    return;
  }

  console.log(`[ADJUST_VILMA_BILLING] Clínica encontrada: ${vilma.name} (${vilma.id})`);
  console.log(`[ADJUST_VILMA_BILLING] Total de faturas atuais da clínica: ${vilma.invoices.length}`);

  // 2. Apagar todas as faturas anteriores da Vilma (vencidas ou antigas)
  const deleted = await prisma.subscriptionInvoice.deleteMany({
    where: { tenantId: vilma.id },
  });
  console.log(`[ADJUST_VILMA_BILLING] ${deleted.count} fatura(s) anterior(es) removida(s).`);

  // 3. Garantir / Atualizar assinatura no plano MENSAL (R$ 127,00) com próximo vencimento em 20/12/2026
  const periodStart = new Date('2026-11-20T00:00:00.000Z');
  const periodEnd = new Date('2026-12-20T23:59:59.999Z');

  let sub = await prisma.subscription.findUnique({ where: { tenantId: vilma.id } });
  if (sub) {
    sub = await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        planCode: 'MENSAL',
        status: 'ATIVA',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        provider: 'manual',
      },
    });
  } else {
    sub = await prisma.subscription.create({
      data: {
        tenantId: vilma.id,
        planCode: 'MENSAL',
        status: 'ATIVA',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        provider: 'manual',
      },
    });
  }
  console.log(`[ADJUST_VILMA_BILLING] Assinatura atualizada para MENSAL (ATIVA até ${periodEnd.toISOString().split('T')[0]}).`);

  // 4. Criar a nova fatura única PAGA referente à mensalidade de R$ 127,00 paga em 20/11
  const newInvoice = await prisma.subscriptionInvoice.create({
    data: {
      tenantId: vilma.id,
      subscriptionId: sub.id,
      planCode: 'MENSAL',
      amountCents: 12700, // R$ 127,00
      status: 'PAGA',
      dueDate: periodStart,
      paidAt: periodStart,
      paymentMethod: 'PIX',
      provider: 'manual',
      notes: 'Mensalidade Plano Mensal (R$ 127,00) paga diretamente via PIX - Próximo vencimento em 20/12/2026',
    },
  });
  console.log(`[ADJUST_VILMA_BILLING] Nova fatura criada com sucesso: ID ${newInvoice.id} - R$ 127,00 - PAGA.`);

  // 5. Atualizar o tenant para plano MENSAL, ATIVO, trialEndsAt = null e e-mail atualizado
  await prisma.tenant.update({
    where: { id: vilma.id },
    data: {
      email: 'vilmaneuropp@gmail.com',
      plan: 'MENSAL',
      status: 'ATIVO',
      trialEndsAt: null,
    },
  });
  console.log(`[ADJUST_VILMA_BILLING] Status da clínica atualizado: Plano MENSAL, Status ATIVO, trialEndsAt: null, email: vilmaneuropp@gmail.com.`);

  // 6. Atualizar o e-mail da Dra. Vilma para vilmaneuropp@gmail.com, mantendo a mesma senha, confirmando e ativando
  const updatedUsers = await prisma.user.updateMany({
    where: {
      OR: [
        { email: { contains: 'vmssredencao' } },
        { email: { contains: 'vilma' } },
        { name: { contains: 'vilma' } },
      ],
      role: { not: 'SUPERADMIN' },
    },
    data: {
      email: 'vilmaneuropp@gmail.com',
      emailVerified: true,
      active: true,
    },
  });
  console.log(`[ADJUST_VILMA_BILLING] ${updatedUsers.count} usuário(s) da Dra. Vilma atualizado(s) com e-mail vilmaneuropp@gmail.com, emailVerified=true e active=true.`);

  console.log('[ADJUST_VILMA_BILLING] Ajuste concluído com sucesso!');
}

main()
  .catch((err) => {
    console.error('[ADJUST_VILMA_BILLING_ERROR]', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
