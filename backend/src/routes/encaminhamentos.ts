import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { pacienteId } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = pacienteId;
  const encaminhamentos = await db.encaminhamento.findMany({ where, include: { paciente: true, deUser: true, paraUser: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data: encaminhamentos, total: encaminhamentos.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const enc = await db.encaminhamento.findUnique({ where: { id: req.params.id }, include: { paciente: true, deUser: true, paraUser: true } });
  if (!enc) return res.status(404).json({ error: 'Encaminhamento não encontrado' });
  res.json(enc);
});

router.post('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const enc = await db.encaminhamento.create({ data: req.body });

  // Notifica o profissional de destino sobre o novo encaminhamento
  if (enc.paraUserId && enc.paraUserId !== req.user?.id) {
    const [deUser, paciente] = await Promise.all([
      db.user.findUnique({ where: { id: enc.deUserId } }),
      db.paciente.findUnique({ where: { id: enc.pacienteId } }),
    ]);
    await db.notification.create({
      data: {
        userId: enc.paraUserId,
        title: 'Novo encaminhamento',
        message: `${deUser?.name || 'Um profissional'} encaminhou ${paciente?.name || 'um paciente'} para você: "${enc.motivo}"`,
        type: 'encaminhamento',
      },
    });
  }

  res.status(201).json(enc);
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const current = await db.encaminhamento.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ error: 'Encaminhamento não encontrado' });
  const enc = await db.encaminhamento.update({ where: { id: req.params.id }, data: req.body });

  // Notifica o autor quando o destino responde ou muda o status
  const statusChanged = req.body.status && req.body.status !== current.status;
  const gotResposta = req.body.resposta && req.body.resposta !== current.resposta;
  if ((statusChanged || gotResposta) && enc.deUserId !== req.user?.id) {
    const [paraUser, paciente] = await Promise.all([
      db.user.findUnique({ where: { id: enc.paraUserId || '' } }),
      db.paciente.findUnique({ where: { id: enc.pacienteId } }),
    ]);
    await db.notification.create({
      data: {
        userId: enc.deUserId,
        title: 'Encaminhamento atualizado',
        message: `${paraUser?.name || 'Um profissional'} ${statusChanged ? `atualizou para "${enc.status}"` : 'respondeu'} o encaminhamento de ${paciente?.name || 'um paciente'}${req.body.resposta ? `: "${req.body.resposta}"` : ''}`,
        type: 'encaminhamento',
      },
    });
  }

  res.json(enc);
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.encaminhamento.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;