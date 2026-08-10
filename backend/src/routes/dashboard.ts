import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const [totalPacientes, totalSessoes, totalLaudos, totalEncaminhamentos, documentosPendentes, casosArquivados, protocolosTEA] = await Promise.all([
    db.paciente.count({ where: { active: true } }),
    db.sessao.count(),
    db.laudo.count(),
    db.encaminhamento.count(),
    db.document.count({ where: { status: 'PENDENTE' } }),
    db.sessao.count({ where: { status: 'CONCLUIDA' } }),
    db.protocolEvaluation.count(),
  ]);
  res.json({ totalPacientes, totalSessoes, totalLaudos, totalEncaminhamentos, documentosPendentes, casosArquivados, protocolosTEA });
});

export default router;