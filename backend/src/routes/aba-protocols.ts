import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

// --- ABA Assessments ---

router.get('/assessments', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { patientId, protocolType } = req.query;
  const where: any = {};
  if (patientId) where.patientId = patientId;
  if (protocolType) where.protocolType = protocolType;
  const assessments = await db.aBAAssessment.findMany({
    where,
    orderBy: { assessedAt: 'desc' },
    include: { paciente: true, professional: true }
  });
  res.json({ data: assessments, total: assessments.length });
});

router.get('/assessments/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const assessment = await db.aBAAssessment.findUnique({
    where: { id: req.params.id },
    include: { paciente: true, professional: true }
  });
  if (!assessment) return res.status(404).json({ error: 'Avaliação ABA não encontrada' });
  res.json(assessment);
});

router.post('/assessments', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  try {
    const assessment = await db.aBAAssessment.create({ data: req.body });
    res.status(201).json(assessment);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao criar avaliação' });
  }
});

router.put('/assessments/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  try {
    const assessment = await db.aBAAssessment.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(assessment);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao atualizar avaliação' });
  }
});

router.delete('/assessments/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  try {
    await db.aBAAssessment.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Avaliação não encontrada' });
  }
});

// --- ABA Programs ---

router.get('/programs', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { patientId, status } = req.query;
  const where: any = {};
  if (patientId) where.patientId = patientId;
  if (status) where.status = status;
  const programs = await db.aBAProgram.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { paciente: true, professional: true, dataPoints: { orderBy: { date: 'asc' } } }
  });
  res.json({ data: programs, total: programs.length });
});

router.get('/programs/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const program = await db.aBAProgram.findUnique({
    where: { id: req.params.id },
    include: { paciente: true, professional: true, dataPoints: { orderBy: { date: 'asc' } } }
  });
  if (!program) return res.status(404).json({ error: 'Programa ABA não encontrado' });
  res.json(program);
});

router.post('/programs', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  try {
    const program = await db.aBAProgram.create({ data: req.body });
    res.status(201).json(program);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao criar programa' });
  }
});

router.put('/programs/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  try {
    const program = await db.aBAProgram.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(program);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao atualizar programa' });
  }
});

router.delete('/programs/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.aBADataPoint.deleteMany({ where: { programId: req.params.id } });
  await db.aBAProgram.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// --- ABA Data Points ---

router.post('/programs/:id/data', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  try {
    const program = await db.aBAProgram.findUnique({ where: { id: req.params.id } });
    if (!program) return res.status(404).json({ error: 'Programa não encontrado' });

    const dataPoint = await db.aBADataPoint.create({
      data: {
        programId: req.params.id,
        date: req.body.date ? new Date(req.body.date) : new Date(),
        value: req.body.value,
        note: req.body.note
      }
    });
    res.status(201).json(dataPoint);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao adicionar ponto de dados' });
  }
});

router.get('/programs/:id/data', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const dataPoints = await db.aBADataPoint.findMany({
    where: { programId: req.params.id },
    orderBy: { date: 'asc' }
  });
  res.json({ data: dataPoints });
});

router.delete('/data/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.aBADataPoint.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;