import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const sendReminderSchema = z.object({
  patientId: z.string().min(1),
  message: z.string().min(1),
  phone: z.string().optional(),
});

const sendBulkSchema = z.object({
  patientIds: z.array(z.string()).min(1),
  message: z.string().min(1),
});

const configSchema = z.object({
  apiUrl: z.string().url(),
  token: z.string().min(1),
  phoneNumberId: z.string().optional(),
});

export async function sendWhatsAppMessage(phone: string, message: string, tenantId?: string) {
  const db = scoped(prisma, tenantId);
  const configRecord = await db.whatsAppConfig.findFirst();
  if (!configRecord) {
    throw new Error('WhatsApp não configurado. Configure a API em Configurações > WhatsApp.');
  }

  const cleanedPhone = phone.replace(/\D/g, '');

  const response = await fetch(`${configRecord.apiUrl}/message/sendText/${configRecord.phoneNumberId || ''}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': configRecord.token,
    },
    body: JSON.stringify({
      number: cleanedPhone,
      text: message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

router.post('/send-reminder', validate(sendReminderSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { patientId, message, phone } = req.body;

  const patient = await db.paciente.findUnique({ where: { id: patientId } });
  if (!patient) {
    return res.status(404).json({ error: 'Paciente não encontrado' });
  }

  const phoneToUse = phone || patient.phone;
  if (!phoneToUse) {
    return res.status(400).json({ error: 'Paciente não possui telefone cadastrado' });
  }

  try {
    await sendWhatsAppMessage(phoneToUse, message, req.user?.tenantId);

    const log = await db.whatsAppLog.create({
      data: {
        patientId,
        phone: phoneToUse,
        message,
        status: 'SENT',
        sentBy: req.user!.id,
      },
    });

    res.json({ success: true, log });
  } catch (error: any) {
    const log = await db.whatsAppLog.create({
      data: {
        patientId,
        phone: phoneToUse,
        message,
        status: 'FAILED',
        sentBy: req.user!.id,
      },
    });

    res.status(500).json({ error: error.message, log });
  }
});

router.post('/send-bulk', validate(sendBulkSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { patientIds, message } = req.body;

  const patients = await db.paciente.findMany({
    where: { id: { in: patientIds } },
  });

  const results = [];

  for (const patient of patients) {
    if (!patient.phone) {
      results.push({ patientId: patient.id, status: 'SKIPPED', reason: 'Sem telefone' });
      continue;
    }

    try {
      await sendWhatsAppMessage(patient.phone, message, req.user?.tenantId);

      const log = await db.whatsAppLog.create({
        data: {
          patientId: patient.id,
          phone: patient.phone,
          message,
          status: 'SENT',
          sentBy: req.user!.id,
        },
      });

      results.push({ patientId: patient.id, status: 'SENT', log });
    } catch (error: any) {
      const log = await db.whatsAppLog.create({
        data: {
          patientId: patient.id,
          phone: patient.phone,
          message,
          status: 'FAILED',
          sentBy: req.user!.id,
        },
      });

      results.push({ patientId: patient.id, status: 'FAILED', error: error.message, log });
    }
  }

  res.json({ results });
});

router.get('/history', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { patientId, status, page = '1', limit = '50' } = req.query;
  const where: any = {};
  if (patientId) where.patientId = patientId;
  if (status) where.status = status;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    db.whatsAppLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: { paciente: { select: { id: true, name: true } } },
    }),
    db.whatsAppLog.count({ where }),
  ]);

  res.json({ data: logs, total, page: pageNum, limit: limitNum });
});

router.post('/config', validate(configSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { apiUrl, token, phoneNumberId } = req.body;

  const existing = await db.whatsAppConfig.findFirst();
  let config;
  if (existing) {
    config = await db.whatsAppConfig.update({
      where: { id: existing.id },
      data: { apiUrl, token, phoneNumberId },
    });
  } else {
    config = await db.whatsAppConfig.create({
      data: { apiUrl, token, phoneNumberId },
    });
  }

  res.json({ success: true, config });
});

router.get('/config', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const config = await db.whatsAppConfig.findFirst();
  if (!config) {
    return res.json({ configured: false });
  }
  res.json({
    configured: true,
    config: { apiUrl: config.apiUrl, phoneNumberId: config.phoneNumberId, hasToken: !!config.token },
  });
});

router.post('/test', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Telefone é obrigatório' });
  }

  try {
    await sendWhatsAppMessage(phone, '✅ Mensagem de teste do EduPsych Pro - WhatsApp configurado com sucesso!', req.user?.tenantId);
    res.json({ success: true, message: 'Mensagem de teste enviada com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
