import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const schoolSchema = z.object({
  name: z.string().min(1),
  levels: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  neighborhood: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  patientCount: z.number().optional(),
  status: z.string().optional(),
  imageUrl: z.string().optional(),
  notes: z.string().optional(),
});

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { search, status } = req.query;
  const where: any = {};
  if (search) where.name = { contains: search };
  if (status) where.status = status;
  const escolas = await db.school.findMany({ where, orderBy: { name: 'asc' }, include: { patients: true } });
  res.json({ data: escolas, total: escolas.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const school = await db.school.findUnique({ where: { id: req.params.id }, include: { patients: true } });
  if (!school) return res.status(404).json({ error: 'Escola não encontrada' });
  res.json(school);
});

router.post('/', validate(schoolSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const school = await db.school.create({ data: req.body });
  res.status(201).json(school);
});

router.put('/:id', validate(schoolSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const school = await db.school.update({ where: { id: req.params.id }, data: req.body });
  res.json(school);
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.school.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
