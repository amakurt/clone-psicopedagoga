// Deduplica pacientes, responsáveis e escolas criados por execuções repetidas do seed.
// Estratégia: para cada nome duplicado, mantém o registro com mais dados relacionados
// (desempate: mais antigo). Remove filhos dos duplicados em ordem segura.
// Uso: node scripts/dedupe-patients.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CHILDREN_BY_PACIENTE_ID = [
  'prontuario', 'anamnese', 'sessao', 'laudo', 'encaminhamento', 'financeiroSessao',
  'document', 'appointment', 'sessionRecord', 'protocolEvaluation', 'interventionPlan',
  'chatMessage', 'sessionDiary', 'frequencySheet', 'interventionDocument',
];
const CHILDREN_BY_PATIENT_ID = [
  'aBAAssessment', 'aBAProgram', 'nfse', 'waitingRoom', 'documentRequest',
  'consentLog', 'whatsAppLog',
];

async function countRelated(patientId) {
  let total = 0;
  for (const model of CHILDREN_BY_PACIENTE_ID) {
    total += await prisma[model].count({ where: { pacienteId: patientId } });
  }
  for (const model of CHILDREN_BY_PATIENT_ID) {
    total += await prisma[model].count({ where: { patientId } });
  }
  return total;
}

async function deleteChildren(patientId) {
  let removed = 0;
  const programs = await prisma.aBAProgram.findMany({ where: { patientId } });
  for (const prog of programs) {
    const { count } = await prisma.aBADataPoint.deleteMany({ where: { programId: prog.id } });
    removed += count;
  }
  for (const model of [...CHILDREN_BY_PACIENTE_ID, ...CHILDREN_BY_PATIENT_ID]) {
    const field = CHILDREN_BY_PACIENTE_ID.includes(model) ? 'pacienteId' : 'patientId';
    const { count } = await prisma[model].deleteMany({ where: { [field]: patientId } });
    removed += count;
  }
  return removed;
}

async function main() {
  const pacientes = await prisma.paciente.findMany({ orderBy: { createdAt: 'asc' } });
  const groups = new Map();
  for (const p of pacientes) {
    const key = `${p.name}|${p.tenantId}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }

  let deletedPatients = 0, deletedChildren = 0;
  const summary = [];
  for (const [key, group] of groups) {
    if (group.length <= 1) continue;
    const scored = [];
    for (const p of group) {
      scored.push({ p, score: await countRelated(p.id) });
    }
    scored.sort((a, b) => b.score - a.score || (a.p.createdAt - b.p.createdAt));
    const keep = scored[0];
    for (const { p } of scored.slice(1)) {
      deletedChildren += await deleteChildren(p.id);
      await prisma.paciente.delete({ where: { id: p.id } });
      deletedPatients++;
    }
    summary.push(`Mantido ${keep.p.name} (${keep.p.id.slice(0, 8)}, ${keep.score} relacionados) | descartados ${scored.length - 1}`);
  }

  // Responsáveis órfãos (sem userId real, sem pacientes, sem solicitações)
  const responsaveis = await prisma.responsible.findMany({
    where: { userId: null, patients: { none: {} }, documentRequests: { none: {} } },
  });
  let deletedResp = 0;
  for (const r of responsaveis) {
    const { count } = await prisma.documentRequest.deleteMany({ where: { responsibleId: r.id } });
    deletedChildren += count;
    await prisma.responsible.delete({ where: { id: r.id } });
    deletedResp++;
  }

  // Escolas órfãs
  const escolas = await prisma.school.findMany({ where: { patients: { none: {} } } });
  let deletedEsc = 0;
  for (const e of escolas) {
    await prisma.school.delete({ where: { id: e.id } });
    deletedEsc++;
  }

  console.log('=== PACIENTES DUPLICADOS ===');
  summary.forEach(s => console.log(' ', s));
  console.log(`\nRemovidos: ${deletedPatients} pacientes, ${deletedResp} responsáveis, ${deletedEsc} escolas | filhos deletados: ${deletedChildren}`);
  console.log(`Restam ${await prisma.paciente.count()} pacientes, ${await prisma.responsible.count()} responsáveis, ${await prisma.school.count()} escolas`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());