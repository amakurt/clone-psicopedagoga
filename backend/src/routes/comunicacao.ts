import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware';
import { AuthenticatedRequest } from '../types';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  const comunicacoes = await prisma.comunicacao.findMany({ include: { autor: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data: comunicacoes, total: comunicacoes.length });
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const comunicacao = await prisma.comunicacao.create({ data: { ...req.body, autorId: req.user?.id } });
  res.status(201).json(comunicacao);
});

export default router;