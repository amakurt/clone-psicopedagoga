import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const { pacienteId } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = pacienteId;
  const anamneses = await prisma.anamnese.findMany({ where, include: { paciente: true, autor: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data: anamneses, total: anamneses.length });
});

router.get('/:id', async (req, res) => {
  const anamnese = await prisma.anamnese.findUnique({ where: { id: req.params.id }, include: { paciente: true, autor: true } });
  if (!anamnese) return res.status(404).json({ error: 'Anamnese não encontrada' });
  res.json(anamnese);
});

router.post('/', async (req, res) => {
  const anamnese = await prisma.anamnese.create({ data: req.body });
  res.status(201).json(anamnese);
});

router.put('/:id', async (req, res) => {
  const anamnese = await prisma.anamnese.update({ where: { id: req.params.id }, data: req.body });
  res.json(anamnese);
});

router.delete('/:id', async (req, res) => {
  await prisma.anamnese.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;