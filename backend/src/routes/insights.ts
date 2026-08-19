import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate } from '../middleware';
import { getInstrument } from '../lib/screening-instruments';

const router = Router();
router.use(authenticate);

router.get('/:pacienteId', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { pacienteId } = req.params;

  const [evolucoes, rastreios, protocolo, aba, sessoes, financeiro, encaminhamentos]: any[] = await Promise.all([
    db.sessionRecord.findMany({ where: { pacienteId }, orderBy: { date: 'desc' } }),
    db.screeningAssessment.findMany({ where: { pacienteId }, orderBy: [{ assessedAt: 'desc' }, { createdAt: 'desc' }] }),
    db.protocolEvaluation.findFirst({ where: { pacienteId }, orderBy: { date: 'desc' } }),
    db.aBAAssessment.findMany({ where: { patientId: pacienteId }, orderBy: { assessedAt: 'desc' } }),
    db.sessao.findMany({ where: { pacienteId }, orderBy: { date: 'desc' } }),
    db.financeiroSessao.findMany({ where: { pacienteId, status: 'PENDENTE' } }),
    db.encaminhamento.findMany({ where: { pacienteId, status: 'PENDENTE' } }),
  ]);

  const insights: { icon: string; color: string; text: string }[] = [];
  const alertas: { icon: string; color: string; text: string }[] = [];

  if (rastreios.length > 0) {
    const ultimo = rastreios[0];
    const def = getInstrument(ultimo.instrument);
    const scores = JSON.parse(ultimo.scores || '{}');
    if (ultimo.riskLevel === 'ELEVADO' || ultimo.riskLevel === 'ALTO') {
      alertas.push({
        icon: 'warning',
        color: 'red',
        text: `Último rastreio (${def?.name || ultimo.instrument}, ${new Date(ultimo.assessedAt).toLocaleDateString('pt-BR')}) apontou risco ${ultimo.riskLevel} — ${ultimo.summary || ''}`,
      });
    } else {
      insights.push({
        icon: 'fact_check',
        color: 'emerald',
        text: `Último rastreio (${def?.name || ultimo.instrument}): risco ${ultimo.riskLevel} (${scores?.total ?? '-'} pontos).`,
      });
    }
  }

  if (aba.length > 0) {
    const latest = aba[0];
    const previous = aba.find((a: any) => a.id !== latest.id && a.protocolType === latest.protocolType);
    if (previous && typeof latest.totalScore === 'number' && typeof previous.totalScore === 'number') {
      const delta = Math.round((latest.totalScore - previous.totalScore) * 10) / 10;
      if (delta > 0) {
        insights.push({
          icon: 'trending_up',
          color: 'emerald',
          text: `ABA ${latest.protocolType}: evolução de ${previous.totalScore} → ${latest.totalScore} pontos (+${delta}) entre avaliações.`,
        });
      } else {
        alertas.push({
          icon: 'trending_down',
          color: 'red',
          text: `ABA ${latest.protocolType}: pontuação recuou de ${previous.totalScore} → ${latest.totalScore} (${delta}) na última reavaliação.`,
        });
      }
    } else {
      insights.push({
        icon: 'psychology',
        color: 'sky',
        text: `${aba.length} avaliação(ões) ABA registrada(s); última: ${latest.protocolType} (${latest.totalScore ?? '-'} pontos).`,
      });
    }
  }

  if (protocolo) {
    const pct = protocolo.maxScore > 0 ? Math.round((protocolo.averageScore / protocolo.maxScore) * 100) : null;
    if (pct !== null && pct < 40) {
      alertas.push({ icon: 'fact_check', color: 'amber', text: `Protocolo TEA (${protocolo.date}): ${pct}% de aproveitamento — abaixo do esperado.` });
    } else if (pct !== null) {
      insights.push({ icon: 'fact_check', color: 'emerald', text: `Protocolo TEA: ${pct}% de aproveitamento na última aplicação.` });
    }
  }

  if (evolucoes.length > 0) {
    const medias = evolucoes.map((e: any) => {
      const m = [e.focus, e.engagement, e.skillProgress, e.behavior].filter((v: any) => typeof v === 'number');
      return m.length ? m.reduce((a: any, b: any) => a + (b as number), 0) / m.length : 0;
    });
    const primeira = medias[medias.length - 1];
    const ultima = medias[0];
    const mediaGeral = medias.length ? medias.reduce((a: any, b: any) => a + b, 0) / medias.length : 0;
    insights.push({
      icon: 'star',
      color: 'amber',
      text: `${evolucoes.length} evolução(ões) registrada(s); média geral ${mediaGeral.toFixed(1)}/5.${primeira > 0 && ultima > primeira ? ' Tendência de melhora nas métricas.' : ''}`,
    });
    if (primeira > 0 && ultima < primeira) {
      alertas.push({ icon: 'trending_down', color: 'red', text: 'Métricas das últimas sessões estão abaixo das iniciais — revisar plano terapêutico.' });
    }
  }

  if (sessoes.length > 0) {
    insights.push({ icon: 'event', color: 'sky', text: `${sessoes.length} sessão(ões) registrada(s); última em ${new Date(sessoes[0].date).toLocaleDateString('pt-BR')}.` });
  } else {
    insights.push({ icon: 'event', color: 'slate', text: 'Nenhuma sessão registrada ainda.' });
  }

  if (encaminhamentos.length > 0) {
    alertas.push({ icon: 'forward', color: 'sky', text: `${encaminhamentos.length} encaminhamento(s) pendente(s) de resposta.` });
  }

  if (financeiro.length > 0) {
    alertas.push({ icon: 'payments', color: 'amber', text: `${financeiro.length} cobrança(s) pendente(s) de pagamento.` });
  }

  res.json({
    pacienteId,
    totalEvolucoes: evolucoes.length,
    totalRastreios: rastreios.length,
    totalSessoes: sessoes.length,
    insights,
    alertas,
  });
});

export default router;