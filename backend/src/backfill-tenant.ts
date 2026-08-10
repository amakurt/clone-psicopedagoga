import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TENANT_NAME = 'Clínica Principal';
const TENANT_SLUG = 'clinica-principal';

const TENANT_MODELS = [
  'Paciente', 'Responsible', 'School', 'Prontuario', 'Anamnese', 'Sessao',
  'Laudo', 'Encaminhamento', 'Comunicacao', 'FinanceiroSessao', 'Notification',
  'Document', 'Appointment', 'LibraryResource', 'Transaction', 'SessionRecord',
  'ABAAssessment', 'ABAProgram', 'ABADataPoint', 'ProtocolEvaluation',
  'InterventionPlan', 'ChatMessage', 'SessionDiary', 'FrequencySheet',
  'InterventionDocument', 'ConsentLog', 'Nfse', 'WaitingRoom', 'DocumentRequest',
  'Availability', 'Signature', 'WhatsAppConfig', 'WhatsAppLog',
] as const;

async function main() {
  const existing = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  const tenant = existing ?? await prisma.tenant.create({
    data: { name: TENANT_NAME, slug: TENANT_SLUG },
  });
  console.log(`Tenant: ${tenant.name} (${tenant.id})`);

  for (const model of TENANT_MODELS) {
    const result = await (prisma as any)[model].updateMany({
      where: { tenantId: '' },
      data: { tenantId: tenant.id },
    });
    console.log(`  ${model}: ${result.count} registros vinculados`);
  }

  const users = await prisma.user.findMany();
  for (const user of users) {
    const membership = await prisma.membership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      update: {},
      create: { tenantId: tenant.id, userId: user.id, role: user.role },
    });
    console.log(`  Membership: ${user.email} -> ${user.role}`);
    void membership;
  }

  const orphans = await prisma.paciente.count({ where: { tenantId: { not: tenant.id } } });
  console.log(orphans === 0 ? 'OK: sem registros órfãos' : `ATENCAO: ${orphans} registros sem tenant`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());