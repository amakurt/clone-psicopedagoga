import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { enforcePlanLimits } from '../lib/billing';
import { authenticate, authorize, validate } from '../middleware';

const router = Router();
router.use(authenticate);
router.use(authorize('GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA'));

const basePacienteFields = {
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().optional().or(z.literal('')).nullable(),
  phone: z.string().optional().or(z.literal('')).nullable(),
  phoneIsWhatsApp: z.coerce.boolean().optional(),
  cpf: z.string().optional().or(z.literal('')).nullable(),
  rg: z.string().optional().or(z.literal('')).nullable(),
  birthDate: z.string().optional().or(z.literal('')).nullable(),
  age: z.string().optional().or(z.literal('')).nullable(),
  initials: z.string().optional().or(z.literal('')).nullable(),
  schoolId: z.string().optional().or(z.literal('')).nullable(),
  responsibleId: z.string().optional().or(z.literal('')).nullable(),
  responsavelId: z.string().optional().or(z.literal('')).nullable(),
  school: z.string().optional().or(z.literal('')).nullable(),
  grade: z.string().optional().or(z.literal('')).nullable(),
  schoolShift: z.string().optional().or(z.literal('')).nullable(),
  diagnosis: z.string().optional().or(z.literal('')).nullable(),
  medications: z.string().optional().or(z.literal('')).nullable(),
  allergies: z.string().optional().or(z.literal('')).nullable(),
  notes: z.string().optional().or(z.literal('')).nullable(),
  accessCode: z.string().optional().or(z.literal('')).nullable(),
  active: z.boolean().optional(),
  status: z.string().optional(),
  color: z.string().optional(),
  cep: z.string().optional().or(z.literal('')).nullable(),
  street: z.string().optional().or(z.literal('')).nullable(),
  neighborhood: z.string().optional().or(z.literal('')).nullable(),
  number: z.string().optional().or(z.literal('')).nullable(),
  complement: z.string().optional().or(z.literal('')).nullable(),
  city: z.string().optional().or(z.literal('')).nullable(),
  state: z.string().optional().or(z.literal('')).nullable(),
  avatarUrl: z.string().optional().or(z.literal('')).nullable(),
  avatar: z.string().optional().or(z.literal('')).nullable(),
};

const pacienteSchema = z.object(basePacienteFields);
const pacienteUpdateSchema = z.object(basePacienteFields).partial();

function sanitizePacienteInput(body: any) {
  const {
    address,
    responsavelId,
    responsibleId,
    schoolId,
    tenantId,
    id,
    createdAt,
    updatedAt,
    prontuarios,
    sessoes,
    anamneses,
    laudos,
    encaminhamentos,
    financeiro,
    documents,
    appointments,
    sessionRecords,
    protocolEvaluations,
    interventionPlans,
    chatMessages,
    sessionDiaries,
    frequencySheets,
    interventionDocuments,
    whatsappLogs,
    abaAssessments,
    abaPrograms,
    nfse,
    waitingRoom,
    consentLogs,
    responsible,
    school,
    guardianName,
    guardianPhone,
    ...data
  } = body;

  if (address && typeof address === 'string') {
    try { Object.assign(data, JSON.parse(address)); } catch {}
  } else if (address && typeof address === 'object') {
    Object.assign(data, address);
  }

  // Normaliza responsibleId: se vazio ou em branco, fica null para não violar foreign key
  const finalRespId = responsavelId !== undefined ? responsavelId : (responsibleId !== undefined ? responsibleId : data.responsibleId);
  if (finalRespId !== undefined) {
    const trimmed = String(finalRespId || '').trim();
    data.responsibleId = trimmed.length > 0 ? trimmed : null;
  }
  delete data.responsavelId;

  // Normaliza schoolId: se vazio ou em branco, fica null para não violar foreign key
  const finalSchoolId = schoolId !== undefined ? schoolId : data.schoolId;
  if (finalSchoolId !== undefined) {
    const trimmed = String(finalSchoolId || '').trim();
    data.schoolId = trimmed.length > 0 ? trimmed : null;
  }

  // Normaliza email
  if (data.email !== undefined) {
    const emailStr = String(data.email || '').trim();
    if (emailStr.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
      data.email = emailStr;
    } else {
      data.email = null;
    }
  }

  // Suporte a avatar / avatarUrl
  if (body.avatar !== undefined && !data.avatarUrl) {
    data.avatarUrl = body.avatar || null;
  }
  if (data.avatarUrl === '') {
    data.avatarUrl = null;
  }
  delete data.avatar;

  // Garante strings limpas para campos de texto opcionais
  const stringFields = ['cpf', 'rg', 'birthDate', 'grade', 'schoolShift', 'diagnosis', 'medications', 'allergies', 'notes', 'accessCode', 'cep', 'street', 'neighborhood', 'number', 'complement', 'city', 'state'];
  for (const f of stringFields) {
    if (data[f] !== undefined && data[f] !== null) {
      data[f] = String(data[f]);
    }
  }

  return data;
}

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { search, active, status } = req.query;
  const where: any = {};
  if (search) where.name = { contains: String(search) };
  if (active !== undefined && active !== '') {
    where.active = active === 'true';
  } else if (status === 'active' || status === 'ATIVO') {
    where.active = true;
  } else if (status === 'inactive' || status === 'INATIVO') {
    where.active = false;
  }
  const pacientes = await db.paciente.findMany({
    where,
    orderBy: { name: 'asc' },
    include: { prontuarios: true, sessoes: true, responsible: true, school: true }
  });
  const mapped = pacientes.map((p: any) => ({ ...p, avatar: p.avatarUrl }));
  res.json({ data: mapped, total: mapped.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const paciente = await db.paciente.findUnique({
    where: { id: req.params.id },
    include: { prontuarios: true, sessoes: true, anamneses: true, laudos: true, responsible: true, school: true }
  });
  if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });
  res.json({ ...paciente, avatar: paciente.avatarUrl });
});

router.post('/', validate(pacienteSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  try {
    await enforcePlanLimits(req.user!.tenantId || '', 'paciente');
    const data = sanitizePacienteInput(req.body);
    const paciente = await db.paciente.create({ data });
    res.status(201).json({ ...paciente, avatar: paciente.avatarUrl });
  } catch (err: any) {
    console.error('[ERRO POST /pacientes]:', err);
    res.status(500).json({ error: 'Erro ao cadastrar paciente: ' + (err?.message || 'Erro interno') });
  }
});

router.put('/:id', validate(pacienteUpdateSchema), async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  try {
    const data = sanitizePacienteInput(req.body);
    const paciente = await db.paciente.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ ...paciente, avatar: paciente.avatarUrl });
  } catch (err: any) {
    console.error('[ERRO PUT /pacientes]:', err);
    res.status(500).json({ error: 'Erro ao atualizar paciente: ' + (err?.message || 'Erro interno') });
  }
});

router.patch('/:id/avatar', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const avatarUrl = req.body.avatarUrl || req.body.avatar || null;
  const paciente = await db.paciente.update({
    where: { id: req.params.id },
    data: { avatarUrl: avatarUrl ? String(avatarUrl) : null }
  });
  res.json({ ...paciente, avatar: paciente.avatarUrl });
});

router.patch('/:id/toggle-status', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const existing = await db.paciente.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Paciente não encontrado' });
  const newActive = typeof req.body.active === 'boolean' ? req.body.active : !existing.active;
  const paciente = await db.paciente.update({
    where: { id: req.params.id },
    data: {
      active: newActive,
      status: newActive ? 'ATIVO' : 'INATIVO'
    }
  });
  res.json({ ...paciente, avatar: paciente.avatarUrl });
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  try {
    await db.paciente.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2003') {
      return res.status(400).json({
        error: 'Este paciente possui histórico clínico (prontuários, laudos ou sessões) vinculado. Para manter a segurança e a conformidade legal do prontuário, utilize a opção "Desativar" em vez de excluir.',
        hasRelations: true
      });
    }
    res.status(500).json({ error: 'Erro ao excluir paciente: ' + (err.message || 'Erro desconhecido') });
  }
});

export default router;