import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const registros = await db.financeiroSessao.findMany({ include: { paciente: true, sessao: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data: registros, total: registros.length });
});

router.post('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const registro = await db.financeiroSessao.create({ data: req.body });
  res.status(201).json(registro);
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const registro = await db.financeiroSessao.update({ where: { id: req.params.id }, data: req.body });
  res.json(registro);
});

export default router;