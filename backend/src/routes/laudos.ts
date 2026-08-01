import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const laudos = await prisma.laudo.findMany({ include: { paciente: true, autor: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data: laudos, total: laudos.length });
});

router.get('/:id', async (req, res) => {
  const laudo = await prisma.laudo.findUnique({ where: { id: req.params.id }, include: { paciente: true, autor: true } });
  if (!laudo) return res.status(404).json({ error: 'Laudo não encontrado' });
  res.json(laudo);
});

router.post('/', async (req, res) => {
  const laudo = await prisma.laudo.create({ data: req.body });
  res.status(201).json(laudo);
});

router.put('/:id', async (req, res) => {
  const laudo = await prisma.laudo.update({ where: { id: req.params.id }, data: req.body });
  res.json(laudo);
});

router.delete('/:id', async (req, res) => {
  await prisma.laudo.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;