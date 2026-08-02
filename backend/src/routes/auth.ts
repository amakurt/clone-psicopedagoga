import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
  const token = Buffer.from(JSON.stringify({ sub: user.id, email: user.email, role: user.role })).toString('base64');
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email já cadastrado' });
  const user = await prisma.user.create({ data: { name, email, role: role || 'SECRETARIA' } });
  res.status(201).json(user);
});

export default router;