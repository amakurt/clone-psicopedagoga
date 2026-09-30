import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, authorize, validate } from '../middleware';

const router = Router();
router.use(authenticate);
router.use(authorize('GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA'));

const schoolSchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().min(1, 'Nome da escola é obrigatório'),
  inep: z.string().optional().nullable(),
  levels: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  number: z.string().optional().nullable(),
  complement: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  patientCount: z.number().optional().nullable(),
  status: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { search, status } = req.query;
  const where: any = {};
  if (search) {
    const s = String(search);
    where.OR = [
      { name: { contains: s } },
      { inep: { contains: s } },
    ];
  }
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
  const { id, ...data } = req.body;
  const school = await db.school.create({ data });
  res.status(201).json(school);
});

router.put('/:id', validate(schoolSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { id, ...data } = req.body;
  const school = await db.school.update({ where: { id: req.params.id }, data });
  res.json(school);
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.school.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
