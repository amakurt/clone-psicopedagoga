import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate, authorize } from '../middleware';

const router = Router();
router.use(authenticate);
router.use(authorize('GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA'));

const ALLOWED_ANAMNESE_FIELDS = new Set([
  'pacienteId', 'autorId', 'status', 'turno', 'telefoneEscola', 'enderecoEscola',
  'escolaCep', 'escolaRua', 'escolaBairro', 'escolaNumero', 'escolaComplemento', 'escolaCidade', 'escolaEstado',
  'indicacaoTratamento', 'diagnostico', 'profissaoPai', 'idadePai', 'escolaridadePai',
  'profissaoMae', 'idadeMae', 'escolaridadeMae', 'queixaPrincipal', 'historiaQueixa',
  'constelacaoFamiliar', 'gestacao', 'parto', 'desenvolvimentoMotor', 'desenvolvimentoLinguagem',
  'sono', 'alimentacao', 'medicacoes', 'tratamentosAnteriores', 'historicoEscolar',
  'dificuldadesAprendizado', 'interacaoSocial', 'historicoFamiliar', 'observacoesComportamentais',
  'historico', 'desenvolvimento', 'comportamento', 'escolaridade', 'familial', 'observacoes'
]);

function sanitizeAnamneseData(body: any, defaultAutorId?: string) {
  const data: any = {};
  for (const key of Object.keys(body)) {
    if (ALLOWED_ANAMNESE_FIELDS.has(key)) {
      const val = body[key];
      if (val !== undefined && val !== null) {
        data[key] = typeof val === 'object' ? JSON.stringify(val) : String(val);
      }
    }
  }
  if (!data.autorId && defaultAutorId) {
    data.autorId = defaultAutorId;
  }
  return data;
}

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { pacienteId } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = String(pacienteId);
  const anamneses = await db.anamnese.findMany({ where, include: { paciente: true, autor: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data: anamneses, total: anamneses.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const anamnese = await db.anamnese.findUnique({ where: { id: req.params.id }, include: { paciente: true, autor: true } });
  if (!anamnese) return res.status(404).json({ error: 'Anamnese não encontrada' });
  res.json(anamnese);
});

router.post('/', async (req, res) => {
  try {
    const db = scoped(prisma, req.user?.tenantId);
    const data = sanitizeAnamneseData(req.body, req.user?.id);
    if (!data.pacienteId) return res.status(400).json({ error: 'pacienteId é obrigatório' });
    const anamnese = await db.anamnese.create({ data });
    res.status(201).json(anamnese);
  } catch (err: any) {
    console.error('[ERRO POST /anamneses]:', err);
    res.status(500).json({ error: 'Erro ao salvar anamnese: ' + (err?.message || err) });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = scoped(prisma, req.user?.tenantId);
    const data = sanitizeAnamneseData(req.body);
    delete data.id;
    delete data.autorId;
    delete data.pacienteId;
    const anamnese = await db.anamnese.update({ where: { id: req.params.id }, data });
    res.json(anamnese);
  } catch (err: any) {
    console.error('[ERRO PUT /anamneses]:', err);
    res.status(500).json({ error: 'Erro ao atualizar anamnese: ' + (err?.message || err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = scoped(prisma, req.user?.tenantId);
    await db.anamnese.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao excluir anamnese: ' + (err?.message || err) });
  }
});

export default router;