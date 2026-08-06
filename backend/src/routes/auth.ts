import { Router } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'psicopedagoga-secret-key-2026';

// Local login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  if (!user.password) {
    return res.status(401).json({ error: 'Conta sem senha definida. Use login social.' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ 
    token, 
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      phoneIsWhatsApp: user.phoneIsWhatsApp,
      registration: user.registration,
      bio: user.bio,
      hasPassword: !!user.password
    } 
  });
});

// Local register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: 'Email já cadastrado' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'SECRETARIA'
    }
  });

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({ 
    token, 
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      avatarUrl: user.avatarUrl,
      hasPassword: !!user.password
    } 
  });
});

// Google OAuth - Initiate
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth - Callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
  (req: any, res) => {
    const user = req.user;
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      hasPassword: !!user.password
    }))}`);
  }
);

// Change password
router.post('/change-password', authenticate, async (req: any, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  if (!user.password) {
    return res.status(400).json({ error: 'Conta sem senha definida. Use login social.' });
  }

  const validPassword = await bcrypt.compare(currentPassword, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Senha atual incorreta' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  res.json({ message: 'Senha alterada com sucesso' });
});

// Update own profile
router.put('/profile', authenticate, async (req: any, res) => {
  const { name, email, phone, phoneIsWhatsApp, registration, bio, avatarUrl } = req.body;
  const userId = req.user?.id;

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (phone !== undefined) data.phone = phone;
  if (phoneIsWhatsApp !== undefined) data.phoneIsWhatsApp = phoneIsWhatsApp;
  if (registration !== undefined) data.registration = registration;
  if (bio !== undefined) data.bio = bio;
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

  if (email !== undefined && email !== req.user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    data.email = email;
  }

  const user = await prisma.user.update({ where: { id: userId }, data });
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      phoneIsWhatsApp: user.phoneIsWhatsApp,
      registration: user.registration,
      bio: user.bio,
      hasPassword: !!user.password
    }
  });
});

// Set/change own password (accounts without password can set one without 'current')
router.put('/password', authenticate, async (req: any, res) => {
  const { current, currentPassword, newPassword } = req.body;
  const password = newPassword;

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  if (user.password) {
    const typed = current || currentPassword;
    if (!typed) {
      return res.status(400).json({ error: 'Senha atual é obrigatória' });
    }
    const validPassword = await bcrypt.compare(typed, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

  res.json({ message: 'Senha alterada com sucesso' });
});

export default router;
