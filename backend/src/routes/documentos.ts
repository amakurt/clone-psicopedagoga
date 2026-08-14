import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
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
  const db = scoped(prisma, req.user?.tenantId);
  const { search, category, status } = req.query;
  const where: any = {};
  if (search) where.name = { contains: search };
  if (category) where.category = category;
  if (status) where.status = status;
  const documentos = await db.document.findMany({ where, orderBy: { createdAt: 'desc' }, include: { paciente: true, autor: true } });
  res.json({ data: documentos, total: documentos.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const document = await db.document.findUnique({ where: { id: req.params.id }, include: { paciente: true, autor: true } });
  if (!document) return res.status(404).json({ error: 'Documento não encontrado' });
  res.json(document);
});

router.post('/', validate(documentSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const document = await db.document.create({ data: req.body });
  res.status(201).json(document);
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const document = await db.document.update({ where: { id: req.params.id }, data: req.body });
  res.json(document);
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.document.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// Staff aprova ou recusa documento enviado pelo portal da família
router.patch('/:id/aprovar', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { id } = req.params;
  const { aprovar, feedback } = req.body;

  if (typeof aprovar !== 'boolean') {
    return res.status(400).json({ error: 'Campo "aprovar" (boolean) é obrigatório' });
  }

  const document = await db.document.findUnique({ where: { id } });
  if (!document) return res.status(404).json({ error: 'Documento não encontrado' });

  const updated = await db.document.update({
    where: { id },
    data: {
      status: aprovar ? 'APROVADO' : 'RECUSADO',
      approvalFeedback: aprovar ? null : (feedback || null),
    },
  });

  // Notifica o responsável (autor do envio) sobre a decisão
  if (document.autorId) {
    const responsible = await db.responsible.findFirst({ where: { userId: document.autorId } });
    if (responsible) {
      const patient = document.pacienteId
        ? await db.paciente.findUnique({ where: { id: document.pacienteId } })
        : null;
      await db.notification.create({
        data: {
          userId: document.autorId,
          title: aprovar ? 'Documento aprovado' : 'Documento recusado',
          message: aprovar
            ? `Seu documento "${document.name}"${patient ? ` de ${patient.name}` : ''} foi aprovado`
            : `Seu documento "${document.name}"${patient ? ` de ${patient.name}` : ''} foi recusado${feedback ? `: ${feedback}` : ''}`,
          type: 'document',
        },
      });
    }
  }

  res.json(updated);
});

export default router;
