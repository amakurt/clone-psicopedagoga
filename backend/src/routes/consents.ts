import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const consentSchema = z.object({
  patientId: z.string().min(1),
  responsibleId: z.string().optional(),
  consentType: z.enum(['DATA_PROCESSING', 'MARKETING', 'RESEARCH', 'SHARE_WITH_SCHOOL']),
  status: z.enum(['GRANTED', 'DENIED', 'REVOKED']),
  details: z.string().optional(),
  ipAddress: z.string().optional()
});

router.get('/', async (req, res) => {
  const { patientId, consentType, status } = req.query;
  const where: any = {};
  if (patientId) where.patientId = patientId;
  if (consentType) where.consentType = consentType;
  if (status) where.status = status;

  const consents = await prisma.consentLog.findMany({
    where,
    orderBy: { recordedAt: 'desc' },
    include: { paciente: true }
  });
  res.json({ data: consents, total: consents.length });
});

router.get('/:patientId', async (req, res) => {
  const consents = await prisma.consentLog.findMany({
    where: { patientId: req.params.patientId },
    orderBy: { recordedAt: 'desc' },
    include: { paciente: true }
  });
  res.json({ data: consents, total: consents.length });
});

router.post('/', validate(consentSchema), async (req, res) => {
  const consent = await prisma.consentLog.create({ data: req.body });
  res.status(201).json(consent);
});

export default router;
