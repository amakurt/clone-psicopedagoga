import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeApiUrl(url: string): string {
  let cleaned = (url || '').trim();
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = cleaned.includes('localhost') || cleaned.includes('127.0.0.1')
      ? `http://${cleaned}`
      : `https://${cleaned}`;
  }
  try {
    const parsed = new URL(cleaned);
    parsed.username = '';
    parsed.password = '';
    cleaned = parsed.toString();
  } catch {}
  return cleaned.replace(/\/+$/, '');
}

async function main() {
  console.log('🔒 [Sanitização de Segurança] Iniciando limpeza de dados pessoais e credenciais sensíveis...');

  // 1. Limpeza de WhatsAppConfig da conta demo
  const demoTenants = await prisma.tenant.findMany({
    where: {
      OR: [
        { slug: 'clinica-demo' },
        { name: { contains: 'Demo' } },
      ],
    },
    select: { id: true, name: true, slug: true },
  });

  const demoTenantIds = demoTenants.map((t) => t.id);
  if (demoTenantIds.length > 0) {
    const deletedConfigs = await prisma.whatsAppConfig.deleteMany({
      where: {
        tenantId: { in: demoTenantIds },
      },
    });
    console.log(`✅ [Demo Tenant] ${deletedConfigs.count} configuração(ões) de WhatsApp excluída(s) do ambiente de demonstração.`);
  }

  // 2. Sanitização de URLs com credenciais embutidas (username:password@) em TODAS as clínicas
  const allConfigs = await prisma.whatsAppConfig.findMany();
  let sanitizedUrlCount = 0;

  for (const config of allConfigs) {
    const cleanedUrl = normalizeApiUrl(config.apiUrl);
    if (cleanedUrl !== config.apiUrl) {
      await prisma.whatsAppConfig.update({
        where: { id: config.id },
        data: { apiUrl: cleanedUrl },
      });
      sanitizedUrlCount++;
    }
  }
  console.log(`✅ [WhatsAppConfig] ${sanitizedUrlCount} URL(s) de API higienizada(s) (credenciais embutidas removidas).`);

  // 3. Sanitização de Usuários com e-mails pessoais identificáveis
  const personalKeywords = ['amakurt', 'iarlley', 'arley', 'castro'];
  const allUsers = await prisma.user.findMany();
  let anonymizedUsersCount = 0;

  for (const user of allUsers) {
    const emailLower = (user.email || '').toLowerCase();
    const nameLower = (user.name || '').toLowerCase();
    const isPersonal = personalKeywords.some(
      (k) => emailLower.includes(k) || (nameLower.includes(k) && !emailLower.includes('demo'))
    );

    if (isPersonal) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: `usuario.seguro.${user.id.slice(-6)}@edupsych.com`,
          name: 'Usuário Homologado',
        },
      });
      anonymizedUsersCount++;
    }
  }
  console.log(`✅ [Usuários] ${anonymizedUsersCount} registro(s) de usuário(s) anonimizado(s).`);

  console.log('🎉 [Concluído] Base de dados totalmente segura e livre de dados pessoais!');
}

main()
  .catch((err) => {
    console.error('❌ Erro durante sanitização:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
