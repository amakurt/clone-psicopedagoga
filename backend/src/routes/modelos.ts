import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, authorize, validate } from '../middleware';

const router = Router();
router.use(authenticate);
router.use(authorize('GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA'));

const modeloSchema = z.object({
  name: z.string().min(1, 'Nome do modelo é obrigatório'),
  description: z.string().optional().nullable(),
  category: z.string().default('Avaliação'),
  content: z.string().min(1, 'Conteúdo do modelo é obrigatório'),
  favorite: z.boolean().optional(),
});

// Listar todos os modelos customizados da clínica/tenant
router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const modelos = await db.documentTemplate.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { autor: { select: { id: true, name: true } } },
  });
  res.json({ data: modelos, total: modelos.length });
});

// Buscar um modelo específico por ID
router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const modelo = await db.documentTemplate.findFirst({
    where: { id: req.params.id },
    include: { autor: { select: { id: true, name: true } } },
  });
  if (!modelo) return res.status(404).json({ error: 'Modelo não encontrado' });
  res.json(modelo);
});

// Criar nova cópia ou novo modelo customizado
router.post('/', validate(modeloSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { name, description, category, content, favorite } = req.body;

  const modelo = await db.documentTemplate.create({
    data: {
      name,
      description: description || '',
      category: category || 'Avaliação',
      content,
      favorite: !!favorite,
      isCustom: true,
      autorId: req.user?.id || null,
    },
    include: { autor: { select: { id: true, name: true } } },
  });

  res.status(201).json(modelo);
});

// Atualizar modelo customizado existente
router.put('/:id', validate(modeloSchema.partial()), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const existe = await db.documentTemplate.findFirst({ where: { id: req.params.id } });
  if (!existe) return res.status(404).json({ error: 'Modelo não encontrado' });

  const modelo = await db.documentTemplate.update({
    where: { id: req.params.id },
    data: req.body,
    include: { autor: { select: { id: true, name: true } } },
  });

  res.json(modelo);
});

// Excluir modelo customizado
router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const existe = await db.documentTemplate.findFirst({ where: { id: req.params.id } });
  if (!existe) return res.status(404).json({ error: 'Modelo não encontrado' });

  await db.documentTemplate.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;

