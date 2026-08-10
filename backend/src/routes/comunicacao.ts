import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate } from '../middleware';
import { AuthenticatedRequest } from '../types';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  const db = scoped(prisma, req.user?.tenantId);
  const comunicacoes = await db.comunicacao.findMany({ include: { autor: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data: comunicacoes, total: comunicacoes.length });
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const db = scoped(prisma, req.user?.tenantId);
  const comunicacao = await db.comunicacao.create({ data: { ...req.body, autorId: req.user?.id } });
  res.status(201).json(comunicacao);
});

export default router;