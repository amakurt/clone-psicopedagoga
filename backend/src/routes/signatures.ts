import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

router.get('/user/:userId', async (req, res) => {
  try {
    const signature = await prisma.signature.findFirst({
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'desc' }
    });
    if (!signature) return res.status(404).json({ error: 'Assinatura não encontrada' });
    res.json(signature);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar assinatura' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const signature = await prisma.signature.findUnique({
      where: { id: req.params.id }
    });
    if (!signature) return res.status(404).json({ error: 'Assinatura não encontrada' });
    res.json(signature);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar assinatura' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { imageBase64, userId, documentType } = req.body;
    if (!imageBase64 || !userId) {
      return res.status(400).json({ error: 'imageBase64 e userId são obrigatórios' });
    }
    const signature = await prisma.signature.create({
      data: { imageBase64, userId, documentType }
    });
    res.status(201).json(signature);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar assinatura' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.signature.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar assinatura' });
  }
});

export default router;
