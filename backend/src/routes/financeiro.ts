import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate } from '../middleware';
import { generatePixCopiaECola, normalizePixKey } from '../lib/pix';

const router = Router();
router.use(authenticate);

// Normaliza o payload do formulário (value/type/status minúsculos) p/ o schema Prisma (valor/tipo/status maiúsculo)
function normalizeInput(body: any) {
  const data: any = {};
  if (body.pacienteId !== undefined) data.pacienteId = body.pacienteId ? String(body.pacienteId) : null;
  if (body.sessaoId !== undefined) data.sessaoId = body.sessaoId ? String(body.sessaoId) : null;
  if (body.value !== undefined) data.valor = Number(body.value);
  else if (body.valor !== undefined) data.valor = Number(body.valor);
  if (body.type !== undefined) data.tipo = String(body.type).toUpperCase();
  else if (body.tipo !== undefined) data.tipo = String(body.tipo).toUpperCase();
  if (body.status !== undefined) data.status = String(body.status).toUpperCase();
  if (body.description !== undefined) data.description = body.description;
  if (body.category !== undefined) data.category = body.category;
  if (body.fornecedor !== undefined) data.fornecedor = body.fornecedor;
  if (body.dataVencimento !== undefined) {
    data.dataVencimento = body.dataVencimento ? new Date(body.dataVencimento) : null;
  }
  if (body.date !== undefined) data.dataPagamento = body.date ? new Date(body.date) : null;
  else if (body.dataPagamento !== undefined) data.dataPagamento = body.dataPagamento ? new Date(body.dataPagamento) : null;
  if (body.paymentMethod !== undefined) data.paymentMethod = String(body.paymentMethod).toUpperCase();
  return data;
}

// Normaliza a saída p/ o frontend (value/type/status minúsculos + paciente)
function normalizeOutput(r: any) {
  let status = (r.status || 'PENDENTE').toLowerCase();
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Se status pendente e data de vencimento passou de hoje, marcar como atrasado
  if (status === 'pendente' && r.dataVencimento && new Date(r.dataVencimento) < hoje) {
    status = 'atrasado';
  }

  const rawTipo = String(r.tipo || 'RECEITA').toUpperCase();
  const isDespesa = rawTipo === 'DESPESA';
  const type = isDespesa ? 'despesa' : 'receita';

  return {
    ...r,
    value: r.valor,
    type,
    status,
    date: r.dataPagamento || r.dataVencimento || r.createdAt,
    dataVencimento: r.dataVencimento,
    dataPagamento: r.dataPagamento,
    fornecedor: r.fornecedor,
  };
}

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { type, status } = req.query;

  const where: any = {};
  if (type) {
    const t = String(type).toUpperCase();
    if (t === 'RECEITA') {
      where.tipo = { in: ['RECEITA', 'SESSAO'] };
    } else {
      where.tipo = t;
    }
  }
  if (status) {
    where.status = String(status).toUpperCase();
  }

  const registros = await db.financeiroSessao.findMany({
    where,
    include: { paciente: { include: { responsible: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: registros.map(normalizeOutput), total: registros.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const registro = await db.financeiroSessao.findFirst({
    where: { id: req.params.id },
    include: { paciente: { include: { responsible: true } } },
  });
  if (!registro) return res.status(404).json({ error: 'Transação não encontrada' });
  res.json(normalizeOutput(registro));
});

router.post('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const registro = await db.financeiroSessao.create({ data: normalizeInput(req.body) });
  res.status(201).json(normalizeOutput(registro));
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const registro = await db.financeiroSessao.update({
    where: { id: req.params.id },
    data: normalizeInput(req.body),
  });
  res.json(normalizeOutput(registro));
});

// Marcar rapidamente como pago/quitado
router.patch('/:id/pay', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { paymentMethod, dataPagamento } = req.body;
  const registro = await db.financeiroSessao.update({
    where: { id: req.params.id },
    data: {
      status: 'PAGO',
      dataPagamento: dataPagamento ? new Date(dataPagamento) : new Date(),
      paymentMethod: paymentMethod ? String(paymentMethod).toUpperCase() : undefined,
    },
  });
  res.json(normalizeOutput(registro));
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const registro = await db.financeiroSessao.findFirst({ where: { id: req.params.id } });
  if (!registro) return res.status(404).json({ error: 'Transação não encontrada' });
  await db.financeiroSessao.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// Gera o PIX (copia e cola estático) da cobrança usando a chave do profissional logado
router.post('/:id/generate-pix', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const registro = await db.financeiroSessao.findFirst({
    where: { id: req.params.id },
    include: { paciente: true },
  });
  if (!registro) return res.status(404).json({ error: 'Transação não encontrada' });

  const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
  if (!user?.pixKey) {
    return res.status(400).json({ error: 'Configure sua chave PIX em Configurações → Recebimento antes de cobrar' });
  }

  let pixCopiaECola = registro.pixCopiaECola || '';
  const chaveNormalizada = normalizePixKey(user.pixKey, user.pixKeyType || undefined);
  const codigoObsoleto = !!pixCopiaECola && !pixCopiaECola.includes(chaveNormalizada);
  if (!pixCopiaECola || req.body?.force || registro.pixKey !== user.pixKey || codigoObsoleto) {
    pixCopiaECola = generatePixCopiaECola({
      key: user.pixKey,
      keyType: user.pixKeyType || undefined,
      amount: registro.valor,
      merchantName: user.name || 'CLINICA',
      merchantCity: 'BRASIL',
      txid: registro.id.slice(-20),
    });
    await db.financeiroSessao.update({
      where: { id: registro.id },
      data: {
        paymentMethod: 'PIX',
        pixCopiaECola,
        pixKey: user.pixKey,
        pixKeyType: user.pixKeyType || null,
      },
    });
  }

  res.json({ pixCopiaECola, pixKey: user.pixKey, pixKeyType: user.pixKeyType || '', amount: registro.valor });
});

export default router;