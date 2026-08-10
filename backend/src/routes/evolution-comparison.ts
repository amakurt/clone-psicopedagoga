import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

router.get('/compare', async (req, res) => {
  try {
    const { patientId, start1, end1, start2, end2 } = req.query;

    if (!start1 || !end1 || !start2 || !end2) {
      return res.status(400).json({ error: 'Datas dos períodos são obrigatórias' });
    }

    const where1: any = {
      date: { gte: start1 as string, lte: end1 as string }
    };
    const where2: any = {
      date: { gte: start2 as string, lte: end2 as string }
    };

    if (patientId) {
      where1.pacienteId = patientId;
      where2.pacienteId = patientId;
    }

    const db = scoped(prisma, req.user?.tenantId);
    const [period1, period2] = await Promise.all([
      db.sessionRecord.findMany({ where: where1, orderBy: { date: 'asc' } }),
      db.sessionRecord.findMany({ where: where2, orderBy: { date: 'asc' } })
    ]);

    res.json({ period1, period2 });
  } catch (error) {
    console.error('Erro ao comparar evoluções:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
