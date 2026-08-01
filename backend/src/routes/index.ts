import { Router } from 'express';
import authRoutes from './auth';
import usersRoutes from './users';
import pacientesRoutes from './pacientes';
import prontuariosRoutes from './prontuarios';
import anamnesesRoutes from './anamneses';
import sessoesRoutes from './sessoes';
import laudosRoutes from './laudos';
import encaminhamentosRoutes from './encaminhamentos';
import comunicacaoRoutes from './comunicacao';
import financeiroRoutes from './financeiro';
import dashboardRoutes from './dashboard';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/pacientes', pacientesRoutes);
router.use('/prontuarios', prontuariosRoutes);
router.use('/anamneses', anamnesesRoutes);
router.use('/sessoes', sessoesRoutes);
router.use('/laudos', laudosRoutes);
router.use('/encaminhamentos', encaminhamentosRoutes);
router.use('/comunicacao', comunicacaoRoutes);
router.use('/financeiro', financeiroRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;