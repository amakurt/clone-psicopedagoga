import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
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

async function sendWhatsAppMessage(phone: string, message: string) {
  const configRecord = await prisma.whatsappConfig.findFirst();
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
  const { patientId, message, phone } = req.body;

  const patient = await prisma.paciente.findUnique({ where: { id: patientId } });
  if (!patient) {
    return res.status(404).json({ error: 'Paciente não encontrado' });
  }

  const phoneToUse = phone || patient.phone;
  if (!phoneToUse) {
    return res.status(400).json({ error: 'Paciente não possui telefone cadastrado' });
  }

  try {
    await sendWhatsAppMessage(phoneToUse, message);

    const log = await prisma.whatsappLog.create({
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
    const log = await prisma.whatsappLog.create({
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
  const { patientIds, message } = req.body;

  const patients = await prisma.paciente.findMany({
    where: { id: { in: patientIds } },
  });

  const results = [];

  for (const patient of patients) {
    if (!patient.phone) {
      results.push({ patientId: patient.id, status: 'SKIPPED', reason: 'Sem telefone' });
      continue;
    }

    try {
      await sendWhatsAppMessage(patient.phone, message);

      const log = await prisma.whatsappLog.create({
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
      const log = await prisma.whatsappLog.create({
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
  const { patientId, status, page = '1', limit = '50' } = req.query;
  const where: any = {};
  if (patientId) where.patientId = patientId;
  if (status) where.status = status;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    prisma.whatsappLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: { paciente: { select: { id: true, name: true } } },
    }),
    prisma.whatsappLog.count({ where }),
  ]);

  res.json({ data: logs, total, page: pageNum, limit: limitNum });
});

router.post('/config', validate(configSchema), async (req, res) => {
  const { apiUrl, token, phoneNumberId } = req.body;

  const existing = await prisma.whatsappConfig.findFirst();
  let config;
  if (existing) {
    config = await prisma.whatsappConfig.update({
      where: { id: existing.id },
      data: { apiUrl, token, phoneNumberId },
    });
  } else {
    config = await prisma.whatsappConfig.create({
      data: { apiUrl, token, phoneNumberId },
    });
  }

  res.json({ success: true, config });
});

router.get('/config', async (_req, res) => {
  const config = await prisma.whatsappConfig.findFirst();
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
    await sendWhatsAppMessage(phone, '✅ Mensagem de teste do EduPsych Pro - WhatsApp configurado com sucesso!');
    res.json({ success: true, message: 'Mensagem de teste enviada com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
