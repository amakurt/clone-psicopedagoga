import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const documentSchema = z.object({
  name: z.string().min(1),
  pacienteId: z.string().optional(),
  size: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  uploadedBy: z.string().optional(),
  fileUrl: z.string().optional(),
  isShared: z.boolean().optional(),
  signedAt: z.string().optional(),
  guardianSignedAt: z.string().optional(),
  autorId: z.string().optional(),
});

router.get('/', async (req, res) => {
  const { search, category, status } = req.query;
  const where: any = {};
  if (search) where.name = { contains: search };
  if (category) where.category = category;
  if (status) where.status = status;
  const documentos = await prisma.document.findMany({ where, orderBy: { createdAt: 'desc' }, include: { paciente: true, autor: true } });
  res.json({ data: documentos, total: documentos.length });
});

router.get('/:id', async (req, res) => {
  const document = await prisma.document.findUnique({ where: { id: req.params.id }, include: { paciente: true, autor: true } });
  if (!document) return res.status(404).json({ error: 'Documento não encontrado' });
  res.json(document);
});

router.post('/', validate(documentSchema), async (req, res) => {
  const document = await prisma.document.create({ data: req.body });
  res.status(201).json(document);
});

router.put('/:id', async (req, res) => {
  const document = await prisma.document.update({ where: { id: req.params.id }, data: req.body });
  res.json(document);
});

router.delete('/:id', async (req, res) => {
  await prisma.document.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
