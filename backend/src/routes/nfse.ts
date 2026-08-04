import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

function generatePdfHtml(nfse: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #007F80; padding-bottom: 20px;">
        <h1 style="color: #007F80; margin: 0;">EduPsych Pro</h1>
        <h2 style="color: #333; margin: 5px 0 0;">Nota de Serviço Eletrônica (NFS-e)</h2>
      </div>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr><td style="padding: 10px; color: #666; border-bottom: 1px solid #eee; width: 40%;">Número:</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">NFS-e nº ${nfse.number}</td></tr>
        <tr><td style="padding: 10px; color: #666; border-bottom: 1px solid #eee;">Paciente:</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${nfse.paciente?.name || '—'}</td></tr>
        <tr><td style="padding: 10px; color: #666; border-bottom: 1px solid #eee;">Profissional:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${nfse.professional?.name || '—'}</td></tr>
        <tr><td style="padding: 10px; color: #666; border-bottom: 1px solid #eee;">Descrição:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${nfse.description}</td></tr>
        <tr><td style="padding: 10px; color: #666; border-bottom: 1px solid #eee;">Status:</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: ${nfse.status === 'EMITIDA' ? '#10B981' : nfse.status === 'CANCELADA' ? '#EF4444' : '#F59E0B'};">${nfse.status}</td></tr>
        <tr><td style="padding: 10px; color: #666; border-bottom: 1px solid #eee;">Valor do Serviço:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">R$ ${nfse.value.toFixed(2)}</td></tr>
        <tr><td style="padding: 10px; color: #666; border-bottom: 1px solid #eee;">Alíquota ISS (${nfse.taxRate}%):</td><td style="padding: 10px; border-bottom: 1px solid #eee;">R$ ${nfse.taxValue.toFixed(2)}</td></tr>
        <tr><td style="padding: 10px; color: #666; font-size: 16px;">Valor Total:</td><td style="padding: 10px; font-size: 16px; font-weight: bold; color: #10B981;">R$ ${nfse.totalValue.toFixed(2)}</td></tr>
      </table>
      ${nfse.issuedAt ? `<p style="margin-top: 20px; color: #666; font-size: 12px;">Emitida em: ${new Date(nfse.issuedAt).toLocaleString('pt-BR')}</p>` : ''}
      ${nfse.notes ? `<div style="margin-top: 15px; padding: 10px; background: #f8fafc; border-radius: 8px;"><p style="font-size: 12px; color: #666;">Observações: ${nfse.notes}</p></div>` : ''}
      <p style="text-align: center; color: #999; font-size: 11px; margin-top: 30px;">Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
    </div>
  `;
}

router.get('/', async (req, res) => {
  const { status, patientId } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (patientId) where.patientId = patientId;
  const items = await prisma.nfse.findMany({
    where,
    include: { paciente: true, professional: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ data: items, total: items.length });
});

router.get('/:id', async (req, res) => {
  const item = await prisma.nfse.findUnique({
    where: { id: req.params.id },
    include: { paciente: true, professional: true }
  });
  if (!item) return res.status(404).json({ error: 'NFS-e não encontrada' });
  res.json(item);
});

router.post('/', async (req, res) => {
  const { patientId, professionalId, description, value, taxRate, notes } = req.body;
  if (!patientId || !professionalId || !description || !value) {
    return res.status(400).json({ error: 'Campos obrigatórios: patientId, professionalId, description, value' });
  }

  const rate = taxRate || 0;
  const taxValue = (value * rate) / 100;
  const totalValue = value + taxValue;

  const lastNfse = await prisma.nfse.findFirst({ orderBy: { number: 'desc' } });
  const nextNumber = (lastNfse?.number || 0) + 1;

  const nfse = await prisma.nfse.create({
    data: {
      number: nextNumber,
      patientId,
      professionalId,
      description,
      value,
      taxRate: rate,
      taxValue,
      totalValue,
      notes: notes || null,
      status: 'PENDENTE'
    },
    include: { paciente: true, professional: true }
  });

  res.status(201).json(nfse);
});

router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['PENDENTE', 'EMITIDA', 'CANCELADA'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status inválido. Use: ${validStatuses.join(', ')}` });
  }

  const updateData: any = { status };
  if (status === 'EMITIDA') updateData.issuedAt = new Date();
  if (status === 'CANCELADA') updateData.cancelledAt = new Date();

  const nfse = await prisma.nfse.update({
    where: { id: req.params.id },
    data: updateData,
    include: { paciente: true, professional: true }
  });

  res.json(nfse);
});

router.get('/:id/pdf', async (req, res) => {
  const nfse = await prisma.nfse.findUnique({
    where: { id: req.params.id },
    include: { paciente: true, professional: true }
  });
  if (!nfse) return res.status(404).json({ error: 'NFS-e não encontrada' });

  const html = generatePdfHtml(nfse);
  res.json({ html, filename: `nfse-${nfse.number}.html` });
});

export default router;
