import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const responsibleSchema = z.object({
  name: z.string().min(1),
  birthDate: z.string().optional(),
  relationship: z.string().min(1),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  phones: z.string().optional(),
  email: z.string().optional(),
  avatarUrl: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  neighborhood: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  userId: z.string().optional(),
});

router.get('/', async (req, res) => {
  const { search } = req.query;
  const where: any = {};
  if (search) where.name = { contains: search };
  const responsaveis = await prisma.responsible.findMany({ where, orderBy: { name: 'asc' }, include: { patients: true } });
  res.json({ data: responsaveis, total: responsaveis.length });
});

router.get('/:id', async (req, res) => {
  const responsible = await prisma.responsible.findUnique({ where: { id: req.params.id }, include: { patients: true } });
  if (!responsible) return res.status(404).json({ error: 'Responsável não encontrado' });
  res.json(responsible);
});

router.post('/', validate(responsibleSchema), async (req, res) => {
  const responsible = await prisma.responsible.create({ data: req.body });
  res.status(201).json(responsible);
});

router.put('/:id', async (req, res) => {
  const responsible = await prisma.responsible.update({ where: { id: req.params.id }, data: req.body });
  res.json(responsible);
});

router.delete('/:id', async (req, res) => {
  await prisma.responsible.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
