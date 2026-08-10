import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const libraryResourceSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  ageRange: z.string().optional(),
  category: z.string().min(1),
  icon: z.string().optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.string().optional(),
});

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { search, category } = req.query;
  const where: any = {};
  if (search) where.name = { contains: search };
  if (category) where.category = category;
  const resources = await db.libraryResource.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json({ data: resources, total: resources.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const resource = await db.libraryResource.findUnique({ where: { id: req.params.id } });
  if (!resource) return res.status(404).json({ error: 'Recurso não encontrado' });
  res.json(resource);
});

router.post('/', validate(libraryResourceSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const resource = await db.libraryResource.create({ data: req.body });
  res.status(201).json(resource);
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const resource = await db.libraryResource.update({ where: { id: req.params.id }, data: req.body });
  res.json(resource);
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.libraryResource.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
