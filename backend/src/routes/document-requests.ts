import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, validate } from '../middleware';
import { sendEmail, emailConfigured } from '../lib/email';
import { sendWhatsAppMessage } from './whatsapp';

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

const fieldSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['text', 'textarea', 'select', 'radio', 'date', 'checkbox', 'number']),
  label: z.string().min(1),
  required: z.boolean().optional(),
  options: z.array(z.string()).max(50).optional(),
  placeholder: z.string().optional(),
});

const documentRequestSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  patientId: z.string().optional(),
  responsibleId: z.string().min(1, 'Responsável é obrigatório'),
  dueDate: z.string().optional(),
  sendVia: z.enum(['EMAIL', 'WHATSAPP', 'LINK']).optional().default('LINK'),
  fields: z.array(fieldSchema).min(1, 'Adicione pelo menos um campo ao formulário'),
});

const publicLink = (token: string) => `${FRONTEND_URL}/formulario/${token}`;

async function sendRequestNotification(doc: any) {
  const db = scoped(prisma, doc.tenantId);
  const responsible = doc.responsibleId
    ? await db.responsible.findUnique({ where: { id: doc.responsibleId } })
    : null;

  const link = publicLink(doc.token);

if (doc.sentVia === 'EMAIL' && responsible?.email) {
    if (emailConfigured()) {
      try {
        await sendEmail(
          responsible.email,
          `Formulário para preencher: ${doc.title} - EduPsych Pro`,
          `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px">
            <h2 style="color:#1E1B4B;margin:0 0 8px">EduPsych Pro</h2>
            <p style="color:#475569;font-size:14px">Olá, <strong>${responsible.name}</strong>!</p>
            <p style="color:#475569;font-size:14px">Recebemos uma solicitação para preencher o formulário <strong>${doc.title}</strong>.</p>
            ${doc.description ? `<p style="color:#64748b;font-size:13px">${doc.description}</p>` : ''}
            <div style="text-align:center;margin:24px 0">
              <a href="${link}" style="background:#1E1B4B;color:#ffffff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px">
                Preencher Formulário
              </a>
            </div>
            <p style="color:#94a3b8;font-size:12px">Este link é único e não deve ser compartilhado.</p>
          </div>`
        );
        console.log(`[DOC REQUEST] Email enviado para ${responsible.email}`);
        return 'EMAIL';
      } catch (e: any) {
        console.warn('[DOC REQUEST] Erro ao enviar email:', e.message);
        return undefined;
      }
    } else {
      console.log(`[DOC REQUEST] Link para ${responsible.email}: ${link}`);
      return 'EMAIL';
    }
  }

  if (doc.sentVia === 'WHATSAPP' && responsible?.phones) {
    try {
      await sendWhatsAppMessage(
        responsible.phones,
        `Olá ${responsible.name}! Recebemos uma solicitação de formulário: ${doc.title}. Preencha neste link: ${link}`,
        doc.tenantId
      );
      return 'WHATSAPP';
    } catch (e: any) {
      console.warn('[DOC REQUEST] Falha WhatsApp:', e.message);
      return undefined;
    }
  }

  return undefined;
}

// Public: get form data (no auth)
router.get('/public/:token', async (req, res) => {
  const { token } = req.params;
  const doc = await prisma.documentRequest.findUnique({
    where: { token },
    include: {
      responsible: { select: { name: true } },
      paciente: { select: { name: true } },
    },
  });

  if (!doc) return res.status(404).json({ error: 'Formulário não encontrado' });
  if (doc.status === 'CANCELADO') return res.status(410).json({ error: 'Formulário cancelado' });

  const template = JSON.parse(doc.templateJson || '[]');
  res.json({
    id: doc.id,
    title: doc.title,
    description: doc.description,
    patientName: doc.paciente?.name,
    responsibleName: doc.responsible?.name,
    dueDate: doc.dueDate,
    fields: template,
  });
});

// Public: submit answers (without auth)
router.post('/public/:token/submit', async (req, res) => {
  const { token } = req.params;
  const answers = req.body.answers;

  if (typeof answers !== 'object' || answers === null || Array.isArray(answers)) {
    return res.status(400).json({ error: 'Respostas inválidas' });
  }

  const doc = await prisma.documentRequest.findUnique({ where: { token } });
  if (!doc) return res.status(404).json({ error: 'Formulário não encontrado' });
  if (doc.status !== 'PENDENTE') {
    return res.status(409).json({ error: 'Este formulário já foi respondido' });
  }
  if (doc.dueDate && doc.dueDate < new Date()) {
    const db = scoped(prisma, doc.tenantId);
    await db.documentRequest.update({
      where: { id: doc.id },
      data: { status: 'EXPIRADO' },
    });
    return res.status(410).json({ error: 'Este formulário expirou' });
  }

  const db = scoped(prisma, doc.tenantId);
  const updated = await db.documentRequest.update({
    where: { id: doc.id },
    data: {
      status: 'RESPONDIDO',
      answersJson: JSON.stringify(answers),
      submittedAt: new Date(),
    },
  });

  res.status(201).json({ message: 'Formulário enviado com sucesso', id: updated.id });
});

// Everything after this requires authentication
router.use(authenticate);

// Create a document request
router.post('/', validate(documentRequestSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const data = req.body;
  const token = crypto.randomBytes(20).toString('hex');
  const dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
  if (dueDate && isNaN(dueDate.getTime())) {
    return res.status(400).json({ error: 'Data de validade inválida' });
  }

  const doc = await db.documentRequest.create({
    data: {
      professionalId: req.user!.id,
      patientId: data.patientId || null,
      responsibleId: data.responsibleId,
      title: data.title,
      description: data.description,
      templateJson: JSON.stringify(data.fields),
      token,
      sentVia: data.sendVia,
      dueDate,
      status: 'PENDENTE',
    },
    include: { responsible: true, paciente: true },
  });

  const sentChannel = await sendRequestNotification(doc).catch((e: any) => {
    console.warn('[DOC REQUEST] Falha ao notificar:', e.message);
    return undefined;
  });

  res.status(201).json({
    doc: {
      ...doc,
      link: publicLink(token),
    },
    sentChannel,
  });
});

// List document requests
router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { status, patientId, professionalId, page = '1', limit = '50' } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (patientId) where.patientId = patientId;
  if (!professionalId && req.user!.role !== 'GESTOR') where.professionalId = req.user!.id;
  if (professionalId) where.professionalId = professionalId;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    db.documentRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: {
        responsible: { select: { id: true, name: true, email: true } },
        paciente: { select: { id: true, name: true } },
        professional: { select: { id: true, name: true } },
      },
    }),
    db.documentRequest.count({ where }),
  ]);

  res.json({ data, total, page: pageNum, limit: limitNum });
});

// Get detail
router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const doc = await db.documentRequest.findUnique({
    where: { id: req.params.id },
    include: {
      responsible: { select: { id: true, name: true, email: true, phones: true } },
      paciente: { select: { id: true, name: true } },
      professional: { select: { id: true, name: true } },
    },
  });
  if (!doc) return res.status(404).json({ error: 'Solicitação não encontrada' });

  let template: any[] = [];
  let answers: any = {};
  try {
    template = JSON.parse(doc.templateJson || '[]');
    answers = doc.answersJson ? JSON.parse(doc.answersJson) : {};
  } catch {}

  const currentUserIsOwner = req.user!.role === 'GESTOR' || doc.professionalId === req.user!.id;
  if (!currentUserIsOwner && req.user!.role !== 'GESTOR') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  res.json({
    ...doc,
    template,
    answers,
    link: publicLink(doc.token),
  });
});

// Resend notification
router.post('/:id/resend', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const doc = await db.documentRequest.findUnique({
    where: { id: req.params.id },
    include: { responsible: true },
  });
  if (!doc) return res.status(404).json({ error: 'Solicitação não encontrada' });
  if (doc.professionalId !== req.user!.id && req.user!.role !== 'GESTOR') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const sentChannel = await sendRequestNotification(doc).catch(() => undefined);
  res.json({ sentChannel, link: publicLink(doc.token) });
});

// Delete
router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const doc = await db.documentRequest.findUnique({ where: { id: req.params.id } });
  if (!doc) return res.status(404).json({ error: 'Solicitação não encontrada' });
  if (doc.professionalId !== req.user!.id && req.user!.role !== 'GESTOR') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  await db.documentRequest.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;