import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const [totalPacientes, totalSessoes, totalLaudos, totalEncaminhamentos, documentosPendentes, casosArquivados, protocolosTEA] = await Promise.all([
    prisma.paciente.count({ where: { active: true } }),
    prisma.sessao.count(),
    prisma.laudo.count(),
    prisma.encaminhamento.count(),
    prisma.document.count({ where: { status: 'PENDENTE' } }),
    prisma.sessao.count({ where: { status: 'CONCLUIDA' } }),
    prisma.protocolEvaluation.count(),
  ]);
  res.json({ totalPacientes, totalSessoes, totalLaudos, totalEncaminhamentos, documentosPendentes, casosArquivados, protocolosTEA });
});

export default router;