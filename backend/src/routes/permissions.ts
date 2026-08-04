import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware';

const router = Router();
router.use(authenticate);

const roleTemplates = {
  gestor: {
    pacientes: ['read', 'write', 'delete'],
    evolucoes: ['read', 'write', 'delete'],
    sessoes: ['read', 'write', 'delete'],
    anamnese: ['read', 'write', 'delete'],
    laudos: ['read', 'write', 'delete'],
    encaminhamentos: ['read', 'write', 'delete'],
    documentos: ['read', 'write', 'delete'],
    financeiro: ['read', 'write', 'delete'],
    agenda: ['read', 'write', 'delete'],
    comunicacao: ['read', 'write', 'delete'],
    responsaveis: ['read', 'write', 'delete'],
    escolas: ['read', 'write', 'delete'],
    protocolos: ['read', 'write', 'delete'],
    planos: ['read', 'write', 'delete'],
    configuracoes: ['read', 'write', 'delete'],
    users: ['read', 'write', 'delete'],
    lgpd: ['read', 'write', 'delete']
  },
  psicopedagogo: {
    pacientes: ['read', 'write'],
    evolucoes: ['read', 'write'],
    sessoes: ['read', 'write'],
    anamnese: ['read', 'write'],
    laudos: ['read', 'write'],
    encaminhamentos: ['read', 'write'],
    documentos: ['read', 'write'],
    financeiro: ['read'],
    agenda: ['read', 'write'],
    comunicacao: ['read', 'write'],
    responsaveis: ['read', 'write'],
    escolas: ['read'],
    protocolos: ['read', 'write'],
    planos: ['read', 'write'],
    configuracoes: ['read'],
    users: [],
    lgpd: ['read']
  },
  secretaria: {
    pacientes: ['read'],
    evolucoes: ['read'],
    sessoes: ['read'],
    anamnese: ['read'],
    laudos: ['read'],
    encaminhamentos: [],
    documentos: ['read'],
    financeiro: ['read', 'write'],
    agenda: ['read', 'write'],
    comunicacao: ['read', 'write'],
    responsaveis: ['read'],
    escolas: ['read'],
    protocolos: [],
    planos: [],
    configuracoes: [],
    users: [],
    lgpd: []
  },
  estagiario: {
    pacientes: ['read'],
    evolucoes: ['read'],
    sessoes: ['read'],
    anamnese: ['read'],
    laudos: ['read'],
    encaminhamentos: [],
    documentos: ['read'],
    financeiro: [],
    agenda: ['read'],
    comunicacao: [],
    responsaveis: [],
    escolas: [],
    protocolos: [],
    planos: [],
    configuracoes: [],
    users: [],
    lgpd: []
  }
};

router.get('/templates', (req, res) => {
  res.json({ data: roleTemplates });
});

router.get('/:userId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    let permissions = {};
    if (user.permissions) {
      try {
        permissions = JSON.parse(user.permissions);
      } catch {
        permissions = {};
      }
    }
    res.json({ permissions });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:userId', authorize('GESTOR'), async (req, res) => {
  try {
    const { permissions } = req.body;
    const userId = req.params.userId as string;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { permissions: JSON.stringify(permissions) }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar permissões' });
  }
});

export default router;
