import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const [totalPacientes, totalSessoes, totalLaudos, totalEncaminhamentos] = await Promise.all([
    prisma.paciente.count({ where: { active: true } }),
    prisma.sessao.count(),
    prisma.laudo.count(),
    prisma.encaminhamento.count(),
  ]);
  res.json({ totalPacientes, totalSessoes, totalLaudos, totalEncaminhamentos });
});

export default router;