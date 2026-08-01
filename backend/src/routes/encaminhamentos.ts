import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const encaminhamentos = await prisma.encaminhamento.findMany({ include: { paciente: true, deUser: true, paraUser: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data: encaminhamentos, total: encaminhamentos.length });
});

router.get('/:id', async (req, res) => {
  const enc = await prisma.encaminhamento.findUnique({ where: { id: req.params.id }, include: { paciente: true, deUser: true, paraUser: true } });
  if (!enc) return res.status(404).json({ error: 'Encaminhamento não encontrado' });
  res.json(enc);
});

router.post('/', async (req, res) => {
  const enc = await prisma.encaminhamento.create({ data: req.body });
  res.status(201).json(enc);
});

router.put('/:id', async (req, res) => {
  const enc = await prisma.encaminhamento.update({ where: { id: req.params.id }, data: req.body });
  res.json(enc);
});

export default router;