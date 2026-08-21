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

// --- Auditoria LGPD / Risco Jurídico ---
interface AuditFinding {
  severity: 'ALTO' | 'MEDIO' | 'BAIXO';
  category: string;
  message: string;
  suggestion: string;
}

router.post('/audit-lgpd', async (req, res) => {
  const { content, pacienteId } = req.body;
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'content (texto do documento) é obrigatório' });
  }

  const findings: AuditFinding[] = [];
  const text = content.toLowerCase();

  // 1. Dados pessoais expostos indevidamente
  const cpfPattern = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g;
  if (cpfPattern.test(content)) {
    findings.push({
      severity: 'ALTO',
      category: 'Dados Pessoais',
      message: 'CPF do paciente ou responsável encontrado no documento.',
      suggestion: 'Remova o CPF. Para documentos internos, use apenas o nome completo. Se necessário, referencie por código de cadastro.',
    });
  }

  const phonePattern = /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g;
  if (phonePattern.test(content)) {
    findings.push({
      severity: 'MEDIO',
      category: 'Dados Pessoais',
      message: 'Número de telefone encontrado no documento.',
      suggestion: 'Telefones não devem constar em laudos/pareceres. Se essencial, use apenas primeira parte (ex: "(11) 9****-****").',
    });
  }

  const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/g;
  if (emailPattern.test(content)) {
    findings.push({
      severity: 'MEDIO',
      category: 'Dados Pessoais',
      message: 'Endereço de e-mail encontrado no documento.',
      suggestion: 'E-mails não devem constar em laudos clínicos. Preserve a privacidade do paciente.',
    });
  }

  const cepPattern = /\d{5}-?\d{3}/g;
  if (cepPattern.test(content)) {
    findings.push({
      severity: 'BAIXO',
      category: 'Dados Pessoais',
      message: 'CEP/endereço encontrado no documento.',
      suggestion: 'Endereço completo não deve constar em laudos. Use apenas a cidade/estado se necessário.',
    });
  }

  // 2. Diagnóstico fechado demais
  const diagnosticPatterns = [
    { pattern: /diagnóstico\s+(definitivo|confirmado|fechado|concluído)/i, msg: 'Diagnóstico apresentado como definitivo/fechado.' },
    { pattern: /CID[-\s]?\d*[:\s]*[A-Z]\d{2}/gi, msg: 'Código CID detectado no documento.' },
    { pattern: /laudo\s+de\s+(diagnóstico|diagnose)/i, msg: 'Documento intitulado como "laudo de diagnóstico".' },
  ];
  for (const { pattern, msg } of diagnosticPatterns) {
    if (pattern.test(content)) {
      findings.push({
        severity: 'ALTO',
        category: 'Diagnóstico',
        message: msg,
        suggestion: 'Psicopedagogos não emitem diagnóstico médico. Use termos como "sinais compatíveis com", "indicações de", "hipótese clínica". Sempre deixe claro que é parecer clínico, não diagnóstico definitivo.',
      });
      break;
    }
  }

  // 3. Linguagem arriscada / garantias
  const riskyPatterns = [
    { pattern: /garanto|asseguro|certeza\s+absoluta|100%\s+seguro|curar|revert|totalmente\s+recuper/i, msg: 'Linguagem que garante resultado ou cura.' },
    { pattern: /definitivamente|sem\s+dúvida\s+alguma|irreversível|nunca\s+melhorará|sem\s+chance/i, msg: 'Linguagem definitiva sobre prognóstico.' },
    { pattern: /o\s+paciente\s+não\s+tem\s+jeito|caso\s+perdido|nada\s+pende\s+feito/i, msg: 'Linguagem depreciativa sobre o paciente.' },
  ];
  for (const { pattern, msg } of riskyPatterns) {
    if (pattern.test(content)) {
      findings.push({
        severity: 'ALTO',
        category: 'Risco Jurídico',
        message: msg,
        suggestion: 'Evite garantias de resultado, diagnósticos definitivos e linguagem que possa ser usada contra o profissional. Use "indica", "sugere", "compatível com", "recomenda-se acompanhamento".',
      });
      break;
    }
  }

  // 4. Menção a outros profissionais sem ressalva
  if (/o\s+(médico|psicólogo|neurologista|psiquiatra)\s+(errou|estava\s+errado|não\s+sabe|não\s+entende)/i.test(content)) {
    findings.push({
      severity: 'ALTO',
      category: 'Risco Jurídico',
      message: 'Menção depreciativa a outro profissional de saúde.',
      suggestion: 'Nunca critique profissionais em documentos oficiais. Use "em complemento à avaliação de..." ou "diferentemente do laudo anterior..." sem julgamento.',
    });
  }

  // 5. LGPD - Consentimento
  if (pacienteId) {
    const db = scoped(prisma, req.user?.tenantId);
    const consent = await db.consentLog.findFirst({
      where: { patientId: pacienteId, status: 'GRANTED' },
      orderBy: { recordedAt: 'desc' },
    });
    if (!consent) {
      findings.push({
        severity: 'MEDIO',
        category: 'LGPD',
        message: 'Nenhum consentimento LGPD registrado para este paciente.',
        suggestion: 'Antes de emitir documentos, registre o consentimento do responsável para tratamento de dados pessoais do menor (Art. 14, LGPD).',
      });
    }
  }

  // 6. Estrutura do documento
  if (content.length < 200) {
    findings.push({
      severity: 'MEDIO',
      category: 'Estrutura',
      message: 'Documento muito curto (menos de 200 caracteres).',
      suggestion: 'Laudos e pareceres devem conter: identificação, queixa, instrumentos aplicados, análise clínica, conclusão e conduta. Documentos curtos podem ser questionados.',
    });
  }

  if (!/identifica[çc][ãa]o|dados\s+do\s+paciente|nome.*paciente/i.test(content)) {
    findings.push({
      severity: 'BAIXO',
      category: 'Estrutura',
      message: 'Seção de identificação não encontrada.',
      suggestion: 'Todo documento clínico deve iniciar com identificação completa: nome, idade, responsável, escola, período de acompanhamento.',
    });
  }

  if (!/conduta|recomenda[çc][ãa]o|encaminhamento|plano\s+de\s+acompanhamento/i.test(content)) {
    findings.push({
      severity: 'BAIXO',
      category: 'Estrutura',
      message: 'Seção de conduta/recomendações não encontrada.',
      suggestion: 'Todo laudo deve finalizar com conduta clara: próximos passos, encaminhamentos, frequência de acompanhamento.',
    });
  }

  // 7. Dados de terceiros expostos
  if (/nome\s+da\s+(escola|instituição).*[A-Z][a-z]+/i.test(content) && /endere[çc]o|rua|avenida|bairro/i.test(content)) {
    findings.push({
      severity: 'MEDIO',
      category: 'Dados de Terceiros',
      message: 'Dados identificáveis de escola/instituição com endereço.',
      suggestion: 'Use apenas o nome da escola/instituição. Endereços completos de terceiros não devem constar em laudos.',
    });
  }

  // Calcular nota de segurança
  const alto = findings.filter((f) => f.severity === 'ALTO').length;
  const medio = findings.filter((f) => f.severity === 'MEDIO').length;
  const baixo = findings.filter((f) => f.severity === 'BAIXO').length;
  const score = Math.max(0, 100 - alto * 25 - medio * 10 - baixo * 3);

  let riskLevel: string;
  if (score >= 80) riskLevel = 'BAIXO';
  else if (score >= 50) riskLevel = 'MEDIO';
  else riskLevel = 'ALTO';

  res.json({
    score,
    riskLevel,
    summary: alto > 0
      ? `Documento com risco ALTO. ${alto} problema(s) grave(s) encontrado(s). Revisar antes de enviar.`
      : medio > 0
        ? `Documento com risco médio. ${medio} ponto(s) de atenção.`
        : 'Documento dentro dos parâmetros de segurança.',
    findings,
    totalFindings: findings.length,
    bySeverity: { alto, medio, baixo },
  });
});

export default router;