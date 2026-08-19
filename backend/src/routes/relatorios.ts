import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate } from '../middleware';
import { getInstrument } from '../lib/screening-instruments';

const router = Router();
router.use(authenticate);

function fmtDate(d: any): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString('pt-BR');
}

function clean(s?: string | null): string {
  return (s || '').trim();
}

router.post('/generate-draft', async (req, res) => {
  const { pacienteId, tipo } = req.body;
  if (!pacienteId) return res.status(400).json({ error: 'pacienteId é obrigatório' });
  const db = scoped(prisma, req.user?.tenantId);

  const [paciente, anamnese, evolucoes, protocolo, aba, rastreios, encaminhamentos, sessoes]: any[] =
    await Promise.all([
      db.paciente.findUnique({
        where: { id: pacienteId },
        include: { responsible: true, school: true },
      }),
      db.anamnese.findFirst({ where: { pacienteId }, orderBy: { createdAt: 'desc' } }),
      db.sessionRecord.findMany({ where: { pacienteId }, orderBy: { date: 'desc' }, take: 6 }),
      db.protocolEvaluation.findFirst({ where: { pacienteId }, orderBy: { date: 'desc' } }),
      db.aBAAssessment.findMany({ where: { patientId: pacienteId }, orderBy: { assessedAt: 'desc' }, take: 4 }),
      db.screeningAssessment.findMany({ where: { pacienteId }, orderBy: [{ assessedAt: 'desc' }, { createdAt: 'desc' }] }),
      db.encaminhamento.findMany({ where: { pacienteId }, orderBy: { createdAt: 'desc' }, take: 3 }),
      db.sessao.findMany({ where: { pacienteId }, orderBy: { date: 'desc' }, take: 3 }),
    ]);

  if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });

  const lines: string[] = [];
  const hoje = new Date().toLocaleDateString('pt-BR');
  const tipoLabel = { LAUDO: 'Laudo', PARECER: 'Parecer', RELATORIO: 'Relatório' }[tipo as string] || 'Relatório';

  lines.push(`${tipoLabel} de Avaliação`);
  lines.push('');
  lines.push(`Paciente: ${paciente.name} (${paciente.age || 'idade não informada'}${paciente.birthDate ? `, nascimento: ${fmtDate(paciente.birthDate)}` : ''})`);
  lines.push(`Responsável: ${clean(paciente.responsible?.name) || 'não informado'}`);
  lines.push(`Escola: ${clean(paciente.school?.name) || 'não informada'}`);
  lines.push(`Data do documento: ${hoje}`);
  lines.push('');

  lines.push('1. Queixa e histórico');
  const an = anamnese;
  lines.push(
    clean(an?.queixaPrincipal)
      ? `Queixa principal: ${an.queixaPrincipal}`
      : 'Queixa principal: (não registrada na anamnese).',
  );
  if (clean(an?.historiaQueixa)) lines.push(`História da queixa: ${an.historiaQueixa}`);
  if (clean(an?.historicoEscolar)) lines.push(`Histórico escolar: ${an.historicoEscolar}`);
  if (clean(an?.dificuldadesAprendizado)) lines.push(`Dificuldades de aprendizagem: ${an.dificuldadesAprendizado}`);
  if (clean(an?.interacaoSocial)) lines.push(`Interação social: ${an.interacaoSocial}`);
  if (clean(an?.desenvolvimentoLinguagem)) lines.push(`Desenvolvimento da linguagem: ${an.desenvolvimentoLinguagem}`);
  if (clean(an?.diagnostico)) lines.push(`Diagnóstico prévio informado: ${an.diagnostico}`);
  lines.push('');

  lines.push('2. Instrumentos e avaliações aplicados');
  if (rastreios.length > 0) {
    lines.push('Rastreios/triagens:');
    for (const r of rastreios) {
      const def = getInstrument(r.instrument);
      const scores = JSON.parse(r.scores || '{}');
      lines.push(
        `- ${def?.name || r.instrument} (${fmtDate(r.assessedAt)}): ${scores?.total ?? '-'} pontos — risco ${r.riskLevel}. ${r.summary || ''}`,
      );
    }
  } else {
    lines.push('Rastreios/triagens: nenhum registro encontrado.');
  }
  if (protocolo) {
    lines.push(
      `- Protocolo TEA (${fmtDate(protocolo.date)}): ${protocolo.totalEvaluations} itens avaliados, média ${protocolo.averageScore} (máx. ${protocolo.maxScore}).`,
    );
  }
  if (aba.length > 0) {
    for (const a of aba) {
      lines.push(`- Avaliação ABA ${a.protocolType} (${fmtDate(a.assessedAt)}): pontuação ${a.totalScore ?? '-'}.`);
    }
  }
  if (sessoes.length > 0) {
    lines.push('Sessões registradas:');
    for (const s of sessoes) lines.push(`- ${fmtDate(s.date)}: ${clean(s.objective) || clean(s.summary) || 'sem registro de objetivo'}`);
  }
  lines.push('');

  lines.push('3. Evolução observada');
  if (evolucoes.length > 0) {
    for (const e of evolucoes) {
      const metrics = [e.focus, e.engagement, e.skillProgress, e.behavior].filter((v) => typeof v === 'number');
      const media = metrics.length > 0 ? (metrics.reduce((a, b) => a + (b as number), 0) / metrics.length).toFixed(1) : '—';
      const texto = clean(e.summary) || clean(e.activities) || 'sem registro';
      lines.push(`- ${fmtDate(e.date)} (métricas ${media}/5): ${texto}`);
    }
  } else {
    lines.push('Ainda não há registros de evolução para este paciente.');
  }
  lines.push('');

  if (encaminhamentos.length > 0) {
    lines.push('4. Encaminhamentos');
    for (const en of encaminhamentos) {
      lines.push(`- ${clean(en.motivo) || 'sem motivo registrado'} (${en.status || 'sem status'})`);
    }
    lines.push('');
  }

  lines.push('5. Síntese clínica');
  const sinteses: string[] = [];
  if (rastreios.some((r: any) => ['ELEVADO', 'ALTO'].includes(r.riskLevel))) {
    sinteses.push('os rastreios aplicados indicam sinais que merecem atenção e encaminhamento para avaliação diagnóstica complementar');
  }
  if (protocolo) {
    const pct = protocolo.maxScore > 0 ? Math.round((protocolo.averageScore / protocolo.maxScore) * 100) : null;
    if (pct !== null && pct < 40) sinteses.push('o desempenho no protocolo TEA encontra-se abaixo do esperado para a faixa etária');
    else if (pct !== null && pct >= 70) sinteses.push('o desempenho no protocolo TEA indica boa evolução nas habilidades avaliadas');
  }
  if (evolucoes.length > 0) {
    const medias = evolucoes.map((e: any) => {
      const m = [e.focus, e.engagement, e.skillProgress, e.behavior].filter((v: any) => typeof v === 'number');
      return m.length ? m.reduce((a: any, b: any) => a + (b as number), 0) / m.length : 0;
    });
    const primeira = medias[medias.length - 1];
    const ultima = medias[0];
    if (primeira > 0 && ultima > primeira) sinteses.push('observa-se evolução positiva nas métricas das sessões ao longo do período');
    else if (primeira > 0 && ultima < primeira) sinteses.push('as métricas das sessões indicam oscilação/regressão que merece revisão do plano terapêutico');
  }
  lines.push(
    sinteses.length > 0
      ? `A partir dos dados disponíveis, ${sinteses.join('; ')}.`
      : 'A partir dos dados disponíveis no prontuário, ainda não é possível estabelecer síntese conclusiva; recomenda-se completar as avaliações.',
  );
  lines.push('');

  lines.push('6. Conduta e encaminhamentos');
  lines.push('Recomenda-se: (a preencher)');
  lines.push('');

  lines.push('____________________________');
  lines.push('Profissional responsável');
  lines.push('');
  lines.push('*Documento gerado como rascunho com base nos registros clínicos. O conteúdo deve ser revisado, complementado e assinado pelo profissional responsável antes de qualquer uso.*');

  const content = lines.join('\n');
  const title = `${tipoLabel} — ${paciente.name} (${hoje})`;

  res.json({ title, content });
});

export default router;