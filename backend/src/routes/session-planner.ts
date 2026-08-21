import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

const PHASE_TEMPLATES = [
  {
    name: 'AQUECIMENTO',
    label: 'Aquecimento e Conexao',
    durationMinutes: 5,
    description: 'Establish rapport, review previous session, set expectations',
    icon: 'waving_hand',
    color: 'emerald',
  },
  {
    name: 'AVALIACAO',
    label: 'Avaliacao Rapida',
    durationMinutes: 10,
    description: 'Quick assessment of current state, collect baseline data',
    icon: 'fact_check',
    color: 'blue',
  },
  {
    name: 'INTERVENCAO',
    label: 'Intervencao Principal',
    durationMinutes: 25,
    description: 'Main intervention activities based on the plan objectives',
    icon: 'psychology',
    color: 'primary',
  },
  {
    name: 'GENERALIZACAO',
    label: 'Generalizacao',
    durationMinutes: 10,
    description: 'Practice skills in natural context, transfer to real situations',
    icon: 'diversity_3',
    color: 'purple',
  },
  {
    name: 'ENCERRAMENTO',
    label: 'Encerramento e Registro',
    durationMinutes: 5,
    description: 'Review what was done, set homework, document session',
    icon: 'assignment_turned_in',
    color: 'amber',
  },
];

function generateSessionCycle(patientName: string, objectives: string[], frequency: string, totalSessions: number) {
  const sessions: any[] = [];
  const freqNum = frequency.includes('3') ? 3 : 2;

  for (let i = 1; i <= totalSessions; i++) {
    const phases = PHASE_TEMPLATES.map((p, idx) => ({
      ...p,
      order: idx + 1,
      status: 'PENDENTE',
      startedAt: null,
      completedAt: null,
      notes: '',
    }));

    sessions.push({
      sessionNumber: i,
      title: `Sessao ${i} — ${patientName}`,
      date: null,
      status: 'AGENDADA',
      phases,
      objectives: objectives.slice(0, 2),
      totalDuration: PHASE_TEMPLATES.reduce((sum, p) => sum + p.durationMinutes, 0),
    });
  }

  return {
    cycle: {
      patientName,
      frequency: `${freqNum}x/semana`,
      totalSessions,
      estimatedWeeks: Math.ceil(totalSessions / freqNum),
      createdAt: new Date().toISOString(),
    },
    sessions,
    summary: `Ciclo de ${totalSessions} sessoes gerado para ${patientName}. Frequencia: ${freqNum}x/semana. Duracao estimada: ${Math.ceil(totalSessions / freqNum)} semanas.`,
  };
}

router.post('/generate-cycle', async (req, res) => {
  const { patientName, objectives, frequency, totalSessions } = req.body;
  if (!patientName || !objectives || !objectives.length) {
    return res.status(400).json({ error: 'Campos obrigatorios: patientName, objectives (array)' });
  }
  const cycle = generateSessionCycle(patientName, objectives, frequency || '2x', totalSessions || 12);
  res.json(cycle);
});

router.post('/session/:sessionId/phase/:phaseName/start', async (req, res) => {
  const { sessionId, phaseName } = req.params;
  res.json({ success: true, message: `Fase ${phaseName} iniciada`, startedAt: new Date().toISOString() });
});

router.post('/session/:sessionId/phase/:phaseName/complete', async (req, res) => {
  const { sessionId, phaseName } = req.params;
  const { notes } = req.body;
  res.json({ success: true, message: `Fase ${phaseName} concluida`, completedAt: new Date().toISOString(), notes });
});

export default router;
