import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const { status } = req.query;
  const where: any = {};
  if (status) where.status = status;
  const items = await prisma.waitingRoom.findMany({
    where,
    include: { paciente: true },
    orderBy: { checkInAt: 'asc' }
  });
  res.json({ data: items, total: items.length });
});

router.post('/checkin', async (req, res) => {
  const { patientId, appointmentId, notes } = req.body;
  if (!patientId) {
    return res.status(400).json({ error: 'patientId é obrigatório' });
  }

  const existing = await prisma.waitingRoom.findFirst({
    where: { patientId, status: { in: ['AGUARDANDO', 'CHAMADO'] } }
  });
  if (existing) {
    return res.status(400).json({ error: 'Paciente já está na sala de espera' });
  }

  const item = await prisma.waitingRoom.create({
    data: {
      patientId,
      appointmentId: appointmentId || null,
      notes: notes || null,
      status: 'AGUARDANDO'
    },
    include: { paciente: true }
  });

  res.status(201).json(item);
});

router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['AGUARDANDO', 'CHAMADO', 'EM_SESSAO', 'CONCLUIDO'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status inválido. Use: ${validStatuses.join(', ')}` });
  }

  const updateData: any = { status };
  if (status === 'CHAMADO') updateData.calledAt = new Date();
  if (status === 'EM_SESSAO') updateData.sessionAt = new Date();
  if (status === 'CONCLUIDO') updateData.completedAt = new Date();

  const item = await prisma.waitingRoom.update({
    where: { id: req.params.id },
    data: updateData,
    include: { paciente: true }
  });

  res.json(item);
});

router.delete('/:id', async (req, res) => {
  await prisma.waitingRoom.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
