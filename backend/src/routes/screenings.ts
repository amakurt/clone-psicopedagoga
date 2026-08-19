import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate } from '../middleware';
import { SCREENING_INSTRUMENTS, getInstrument, scoreScreening } from '../lib/screening-instruments';

const router = Router();
router.use(authenticate);

router.get('/instruments', (_req, res) => {
  res.json({
    data: SCREENING_INSTRUMENTS.map((i) => ({
      code: i.code,
      name: i.name,
      description: i.description,
      target: i.target,
      optionType: i.optionType,
      options: i.options,
      dimensions: i.dimensions,
      itemsCount: i.items.length,
    })),
  });
});

router.get('/instruments/:code', (req, res) => {
  const def = getInstrument(req.params.code);
  if (!def) return res.status(404).json({ error: 'Instrumento não encontrado' });
  res.json(def);
});

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { pacienteId, instrument } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = pacienteId;
  if (instrument) where.instrument = instrument;
  const data = await db.screeningAssessment.findMany({
    where,
    include: { paciente: true, profissional: { select: { id: true, name: true } } },
    orderBy: [{ assessedAt: 'desc' }, { createdAt: 'desc' }],
  });
  res.json({ data, total: data.length });
});

router.get('/:id', async (req, res) => {
  if (req.params.id === 'instruments') return;
  const db = scoped(prisma, req.user?.tenantId);
  const found = await db.screeningAssessment.findUnique({
    where: { id: req.params.id },
    include: { paciente: true, profissional: { select: { id: true, name: true } } },
  });
  if (!found) return res.status(404).json({ error: 'Rastreio não encontrado' });
  res.json(found);
});

function buildPayload(body: any, profissionalId: string) {
  const instrument = getInstrument(body.instrument);
  if (!instrument) {
    const err: any = new Error('Instrumento de rastreio inválido');
    err.status = 400;
    throw err;
  }
  const answers: Record<string, any> = {};
  for (const [k, v] of Object.entries((body.answers || {}) as Record<string, any>)) {
    answers[k] = typeof v === 'string' ? v.trim().toLowerCase() : v;
  }
  const result = scoreScreening(body.instrument, answers, body.respondent);
  return {
    pacienteId: body.pacienteId,
    profissionalId,
    instrument: body.instrument,
    respondent: body.respondent || null,
    answers: JSON.stringify(answers),
    scores: JSON.stringify(result.scores),
    riskLevel: result.riskLevel,
    summary: result.summary,
    notes: body.notes || null,
    assessedAt: body.assessedAt ? new Date(body.assessedAt) : new Date(),
  };
}

router.post('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const data = buildPayload(req.body, req.user!.id);
  const created = await db.screeningAssessment.create({ data });
  res.status(201).json(created);
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const data = buildPayload(req.body, req.user!.id);
  const updated = await db.screeningAssessment.update({ where: { id: req.params.id }, data });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.screeningAssessment.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;