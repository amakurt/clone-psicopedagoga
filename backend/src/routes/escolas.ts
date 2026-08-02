import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const schoolSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional(),
  level: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  patientCount: z.number().optional(),
  status: z.string().optional(),
  imageUrl: z.string().optional(),
});

router.get('/', async (req, res) => {
  const { search, status } = req.query;
  const where: any = {};
  if (search) where.name = { contains: search };
  if (status) where.status = status;
  const escolas = await prisma.school.findMany({ where, orderBy: { name: 'asc' }, include: { patients: true } });
  res.json({ data: escolas, total: escolas.length });
});

router.get('/:id', async (req, res) => {
  const school = await prisma.school.findUnique({ where: { id: req.params.id }, include: { patients: true } });
  if (!school) return res.status(404).json({ error: 'Escola não encontrada' });
  res.json(school);
});

router.post('/', validate(schoolSchema), async (req, res) => {
  const school = await prisma.school.create({ data: req.body });
  res.status(201).json(school);
});

router.put('/:id', async (req, res) => {
  const school = await prisma.school.update({ where: { id: req.params.id }, data: req.body });
  res.json(school);
});

router.delete('/:id', async (req, res) => {
  await prisma.school.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
