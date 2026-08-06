import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, validate } from '../middleware';

const router = Router();
router.use(authenticate);

const pacienteSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  phoneIsWhatsApp: z.coerce.boolean().optional(),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  school: z.string().optional(),
  grade: z.string().optional(),
  notes: z.string().optional(),
  responsavelId: z.string().optional(),
  accessCode: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  neighborhood: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
}).passthrough();

router.get('/', async (req, res) => {
  const { search, active } = req.query;
  const where: any = {};
  if (search) where.name = { contains: search };
  if (active !== undefined) where.active = active === 'true';
  const pacientes = await prisma.paciente.findMany({ where, orderBy: { name: 'asc' }, include: { prontuarios: true, sessoes: true, responsible: true, school: true } });
  res.json({ data: pacientes, total: pacientes.length });
});

router.get('/:id', async (req, res) => {
  const paciente = await prisma.paciente.findUnique({ where: { id: req.params.id }, include: { prontuarios: true, sessoes: true, anamneses: true, laudos: true, responsible: true, school: true } });
  if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });
  res.json(paciente);
});

router.post('/', validate(pacienteSchema), async (req, res) => {
  const { address, responsavelId, ...data } = req.body;
  if (address && typeof address === 'string') {
    try { Object.assign(data, JSON.parse(address)); } catch {}
  } else if (address && typeof address === 'object') {
    Object.assign(data, address);
  }
  delete data.address;
  if (responsavelId !== undefined) data.responsibleId = responsavelId;
  const paciente = await prisma.paciente.create({ data });
  res.status(201).json(paciente);
});

router.put('/:id', async (req, res) => {
  const { address, prontuarios, sessoes, anamneses, laudos, encaminhamentos, financeiro, documents, appointments, sessionRecords, protocolEvaluations, interventionPlans, chatMessages, sessionDiaries, frequencySheets, interventionDocuments, whatsappLogs, abaAssessments, abaPrograms, nfse, waitingRoom, consentLogs, responsible, school, responsavelId, ...data } = req.body;
  if (address && typeof address === 'string') {
    try { Object.assign(data, JSON.parse(address)); } catch {}
  } else if (address && typeof address === 'object') {
    Object.assign(data, address);
  }
  delete data.address;
  if (responsavelId !== undefined) data.responsibleId = responsavelId;
  const paciente = await prisma.paciente.update({ where: { id: req.params.id }, data });
  res.json(paciente);
});

router.delete('/:id', async (req, res) => {
  await prisma.paciente.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;