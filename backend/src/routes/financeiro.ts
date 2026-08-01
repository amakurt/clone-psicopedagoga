import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const registros = await prisma.financeiroSessao.findMany({ include: { paciente: true, sessao: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data: registros, total: registros.length });
});

router.post('/', async (req, res) => {
  const registro = await prisma.financeiroSessao.create({ data: req.body });
  res.status(201).json(registro);
});

router.put('/:id', async (req, res) => {
  const registro = await prisma.financeiroSessao.update({ where: { id: req.params.id }, data: req.body });
  res.json(registro);
});

export default router;