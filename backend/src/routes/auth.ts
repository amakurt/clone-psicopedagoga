import 'dotenv/config';
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma';
import { scoped, ensureMembership, createClinicWithAdmin } from '../lib/tenant';
import { enforceTenantStatus } from '../lib/billing';
import { authenticate } from '../middleware';
import { sendEmail, emailConfigured } from '../lib/email';
import { sendWhatsAppMessage } from './whatsapp';

const router = Router();

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'psico-default-jwt-secret-dev-2026';
}
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';


// Rate limit estrito para rotas sensíveis (brute force / enumeration)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
});

function generateCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function signToken(user: any) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

function buildUserPayload(user: any) {
  return {
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
  };
}

function buildTenantPayload(tenant: any, role: string) {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    plan: tenant.plan,
    status: tenant.status,
    logoUrl: tenant.logoUrl,
    colors: tenant.colors,
    role,
  };
}

async function getUserTenants(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId, active: true },
    orderBy: { createdAt: 'asc' },
    include: { tenant: true },
  });
  return memberships.map((m) => buildTenantPayload(m.tenant, m.role));
}

function pickDefaultTenant(tenants: any[]) {
  return tenants.find((t) => t.status !== 'BLOQUEADO') || tenants[0];
}

async function sendVerificationMessage(user: any, code: string, token: string, type: string) {
  const isActivation = type === 'ACCOUNT_ACTIVATION';
  const link = `${FRONTEND_URL}/auth/${isActivation ? 'verify' : 'recuperar-senha'}?token=${token}`;

  if (user.email && emailConfigured()) {
    await sendEmail(
      user.email,
      isActivation ? 'Confirme seu cadastro - EduPsych Pro' : 'Recuperação de senha - EduPsych Pro',
      `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px">
        <h2 style="color:#1E1B4B;margin:0 0 8px">EduPsych Pro</h2>
        <p style="color:#475569;font-size:14px">Olá, <strong>${user.name}</strong>!</p>
        ${isActivation
          ? '<p style="color:#475569;font-size:14px">Confirme seu cadastro clicando no botão abaixo:</p>'
          : '<p style="color:#475569;font-size:14px">Recebemos um pedido de recuperação de senha. Use o botão abaixo:</p>'}
        <div style="text-align:center;margin:24px 0">
          <a href="${link}" style="background:#1E1B4B;color:#ffffff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px">
            ${isActivation ? 'Confirmar Cadastro' : 'Redefinir Senha'}
          </a>
        </div>
        <p style="color:#64748b;font-size:13px">Ou use o código de verificação: <strong style="font-size:18px;letter-spacing:3px">${code}</strong></p>
        <p style="color:#94a3b8;font-size:12px">O link e o código expiram em ${isActivation ? '24 horas' : '10 minutos'}. Se não foi você, ignore este e-mail.</p>
      </div>`
    );
    return 'EMAIL';
  }

  if (user.phone) {
    try {
      await sendWhatsAppMessage(
        user.phone,
        `EduPsych Pro: ${isActivation ? 'Confirme seu cadastro' : 'Seu código de recuperação'} ${code}. Link: ${link}`
      );
      return 'WHATSAPP';
    } catch (e: any) {
      console.warn('[AUTH] Falha ao enviar WhatsApp:', e.message);
    }
  }

  console.log(`[DEV AUTH] ${isActivation ? 'Ativação' : 'Reset'} para ${user.email || user.phone}: código ${code} | link ${link}`);
  return 'DEV';
}

async function createVerificationRecord(user: any, type: string, channel: string, minutesToExpire: number) {
  const code = generateCode();
  const token = crypto.randomBytes(32).toString('hex');

  await prisma.verificationCode.create({
    data: {
      userId: user.id,
      type,
      channel,
      codeHash: hashValue(code),
      tokenHash: hashValue(token),
      expiresAt: new Date(Date.now() + minutesToExpire * 60 * 1000),
    },
  });

  return { code, token };
}

async function verifyCodeAndToken(userId: string, type: string, token?: string, code?: string) {
  const records = await prisma.verificationCode.findMany({
    where: { userId, type, usedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  for (const record of records) {
    if (record.expiresAt < new Date()) continue;
    const tokenOk = token && record.tokenHash && record.tokenHash === hashValue(token);
    const codeOk = code && record.codeHash === hashValue(code);

    if (tokenOk || codeOk) {
      return record;
    }
  }

  return null;
}

async function findUserByVerificationToken(token: string, type: string) {
  const record = await prisma.verificationCode.findFirst({
    where: { tokenHash: hashValue(token), type, usedAt: null, expiresAt: { gt: new Date() } },
    include: { user: true },
  });
  return record?.user || null;
}

async function invalidateVerificationCodes(userId: string, type: string) {
  await prisma.verificationCode.updateMany({
    where: { userId, type, usedAt: null },
    data: { usedAt: new Date() },
  });
}

// Vincula/cria o registro de Responsible para usuários com papel RESPONSAVEL
async function ensureResponsibleForUser(user: any) {
  if (user.role !== 'RESPONSAVEL') return;

  const membership = await prisma.membership.findFirst({ where: { userId: user.id } });
  const tenantId = membership?.tenantId || '';
  const db = scoped(prisma, tenantId);

  const linked = await db.responsible.findFirst({ where: { userId: user.id } });
  if (linked) return;

  const byEmail = user.email
    ? await db.responsible.findFirst({ where: { email: user.email } })
    : null;

  if (byEmail) {
    await db.responsible.update({
      where: { id: byEmail.id },
      data: { userId: user.id },
    });
    return;
  }

  await db.responsible.create({
    data: {
      name: user.name,
      relationship: 'Responsável',
      email: user.email || null,
      phones: user.phone || null,
      phoneIsWhatsApp: !!user.phone,
      userId: user.id,
    },
  });
}

// Local login
router.post('/login', strictLimiter, async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  if (!user.active) {
    return res.status(403).json({ error: 'Conta não ativada. Verifique seu email ou reenvie o link de ativação.' });
  }

  if (!user.password) {
    return res.status(401).json({ error: 'Conta sem senha definida. Use login social.' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, active: true },
    orderBy: { createdAt: 'asc' },
    include: { tenant: { include: { subscription: true } } },
  });
  if (membership) {
    await enforceTenantStatus(membership.tenant);
    if (membership.tenant.status === 'BLOQUEADO') {
      return res.status(403).json({ error: 'Assinatura da clínica vencida ou bloqueada. Entre em contato com o suporte.' });
    }
  }

  const token = signToken(user);
  const tenants = await getUserTenants(user.id);
  const tenant = pickDefaultTenant(tenants);

  res.json({ 
    token, 
    user: buildUserPayload(user),
    tenants,
    tenant,
  });
});

// Local register
// register usa strictLimiter
router.post('/register', strictLimiter, async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  
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
      role: role || 'SECRETARIA',
      phone: phone || null,
      active: false,
    }
  });

  await ensureMembership(user);
  await ensureResponsibleForUser(user);

  const { code, token } = await createVerificationRecord(user, 'ACCOUNT_ACTIVATION', 'EMAIL', 60 * 24);
  const channel = await sendVerificationMessage(user, code, token, 'ACCOUNT_ACTIVATION');

  res.status(201).json({
    message: 'Conta criada. Enviamos um link de ativação para o seu email.',
    needsVerification: true,
    channel,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

// Registro de nova clínica (self-service, fluxo de venda da landing)
// Cria o Tenant da clínica + usuário GESTOR admin + subscription TRIAL 14d
router.post('/register-clinic', strictLimiter, async (req, res) => {
  const { name, email, password, clinicName, phone } = req.body;

  if (!name || !email || !password || !clinicName) {
    return res.status(400).json({ error: 'Nome, email, senha e nome da clínica são obrigatórios' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: 'Email já cadastrado' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const { tenant, user } = await createClinicWithAdmin({
    name,
    email,
    password: hashedPassword,
    clinicName,
    phone,
  });

  const { code, token } = await createVerificationRecord(user, 'ACCOUNT_ACTIVATION', 'EMAIL', 60 * 24);
  const channel = await sendVerificationMessage(user, code, token, 'ACCOUNT_ACTIVATION');

  console.log(`[AUTH] Clínica criada: ${tenant.name} (${tenant.slug}) | admin ${user.email} | trial 14d`);

  res.status(201).json({
    message: 'Clínica criada. Enviamos um link de ativação para o seu email.',
    needsVerification: true,
    channel,
    tenant: buildTenantPayload(tenant, 'GESTOR'),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// Verify account (link click or code)
router.post('/verify-account', strictLimiter, async (req, res) => {
  const { token, code, email } = req.body;

  let user: any = null;
  if (token) {
    user = await findUserByVerificationToken(token, 'ACCOUNT_ACTIVATION');
  } else if (email && code) {
    user = await prisma.user.findUnique({ where: { email } });
  }

  if (!user) {
    return res.status(400).json({ error: 'Link ou código inválido ou expirado' });
  }

  if (user.active) {
    return res.json({ message: 'Conta já ativada', alreadyActive: true });
  }

  const record = await verifyCodeAndToken(user.id, 'ACCOUNT_ACTIVATION', token, code);
  if (!record) {
    return res.status(400).json({ error: 'Código inválido ou expirado' });
  }

  await invalidateVerificationCodes(user.id, 'ACCOUNT_ACTIVATION');
  await prisma.user.update({ where: { id: user.id }, data: { active: true } });

  const authToken = signToken(user);
  res.json({ message: 'Conta ativada com sucesso', token: authToken, user: buildUserPayload(user) });
});

// Resend activation link/code
// resend usa strictLimiter
router.post('/resend-verification', strictLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  if (user.active) {
    return res.status(400).json({ error: 'Conta já ativada' });
  }

  const { code, token } = await createVerificationRecord(user, 'ACCOUNT_ACTIVATION', 'EMAIL', 60 * 24);
  const channel = await sendVerificationMessage(user, code, token, 'ACCOUNT_ACTIVATION');

  res.json({ message: 'Link de ativação reenviado', channel });
});

// Forgot password - send code/link to email or WhatsApp
router.post('/forgot-password', strictLimiter, async (req, res) => {
  const { email, phone, channel } = req.body;
  const ch = channel === 'WHATSAPP' ? 'WHATSAPP' : 'EMAIL';

  const user = email
    ? await prisma.user.findUnique({ where: { email } })
    : await prisma.user.findFirst({ where: { phone } });

  if (!user) {
    return res.json({ message: 'Se o endereço estiver cadastrado, enviaremos as instruções.' });
  }

  if (ch === 'WHATSAPP') {
    if (!user.phone) {
      return res.status(400).json({ error: 'Usuário não possui telefone cadastrado' });
    }
  } else if (!emailConfigured()) {
    const { code, token } = await createVerificationRecord(user, 'PASSWORD_RESET', 'EMAIL', 10);
    await sendVerificationMessage(user, code, token, 'PASSWORD_RESET');
    return res.json({ message: 'Instruções enviadas (modo dev - consulte o console do backend)' });
  }

  const { code, token } = await createVerificationRecord(user, 'PASSWORD_RESET', ch, 10);
  const sentChannel = await sendVerificationMessage(user, code, token, 'PASSWORD_RESET');

  res.json({ message: 'Instruções de recuperação enviadas', channel: sentChannel });
});

// Reset password with token or code
router.post('/reset-password', strictLimiter, async (req, res) => {
  const { token, code, email, phone, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
  }

  let user: any = null;
  if (token) {
    user = await findUserByVerificationToken(token, 'PASSWORD_RESET');
  } else if (email && code) {
    user = await prisma.user.findUnique({ where: { email } });
  } else if (phone && code) {
    user = await prisma.user.findFirst({ where: { phone } });
  }

  if (!user) {
    return res.status(400).json({ error: 'Link ou código inválido ou expirado' });
  }

  const record = await verifyCodeAndToken(user.id, 'PASSWORD_RESET', token, code);
  if (!record) {
    return res.status(400).json({ error: 'Código ou link inválido ou expirado' });
  }

  await invalidateVerificationCodes(user.id, 'PASSWORD_RESET');
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword, active: true } });

  res.json({ message: 'Senha redefinida com sucesso' });
});

// Minhas clínicas (memberships ativas)
router.get('/tenants', authenticate, async (req: any, res) => {
  const tenants = await getUserTenants(req.user.id);
  res.json({ tenants, tenant: pickDefaultTenant(tenants) });
});

// Selecionar clínica ativa (a middleware usa X-Tenant-Id nas próximas requisições)
router.post('/select-tenant', authenticate, async (req: any, res) => {
  const { tenantId } = req.body;
  if (!tenantId) {
    return res.status(400).json({ error: 'tenantId é obrigatório' });
  }
  const membership = await prisma.membership.findFirst({
    where: { userId: req.user.id, tenantId, active: true },
    include: { tenant: true },
  });
  if (!membership) {
    return res.status(403).json({ error: 'Você não tem vínculo ativo com esta clínica' });
  }
  res.json({ tenant: buildTenantPayload(membership.tenant, membership.role) });
});

// Google OAuth - Initiate
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth - Callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
  async (req: any, res) => {
    const user = req.user;
    await ensureMembership(user);
    // Code de curta duração (5 min) — o JWT nunca passa pela URL
    const exchangeCode = jwt.sign(
      { purpose: 'oauth-exchange', sub: user.id },
      getJwtSecret(),
      { expiresIn: '5m' }
    );

    // Redirect to frontend with code (sem token na URL)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    res.redirect(`${frontendUrl}/auth/callback?code=${exchangeCode}`);
  }
);

// Troca o code do OAuth por um token de sessão (o code nunca toca a URL do usuário final)
router.post('/google/exchange', strictLimiter, async (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Código ausente' });

  let payload: any;
  try {
    payload = jwt.verify(code, getJwtSecret());
  } catch {
    return res.status(400).json({ error: 'Código inválido ou expirado' });
  }

  if (payload.purpose !== 'oauth-exchange') {
    return res.status(400).json({ error: 'Código inválido' });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  res.json({ token, user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    hasPassword: !!user.password,
  } });
});

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
  const { name, email, phone, phoneIsWhatsApp, registration, bio, avatarUrl, pixKey, pixKeyType } = req.body;
  const userId = req.user?.id;

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (phone !== undefined) data.phone = phone;
  if (phoneIsWhatsApp !== undefined) data.phoneIsWhatsApp = phoneIsWhatsApp;
  if (registration !== undefined) data.registration = registration;
  if (bio !== undefined) data.bio = bio;
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
  if (pixKey !== undefined) data.pixKey = pixKey;
  if (pixKeyType !== undefined) data.pixKeyType = pixKeyType;

  if (data.pixKey && !data.pixKeyType) {
    return res.status(400).json({ error: 'Informe o tipo da chave PIX (CPF, CNPJ, e-mail, telefone ou aleatória)' });
  }
  if (data.pixKeyType && !data.pixKey) {
    return res.status(400).json({ error: 'Informe a chave PIX' });
  }
  if (data.pixKey && data.pixKeyType) {
    const type = String(data.pixKeyType).toUpperCase();
    const digits = String(data.pixKey).replace(/\D/g, '');
    const valid =
      (type === 'CPF' && /^\d{11}$/.test(digits)) ||
      (type === 'CNPJ' && /^\d{14}$/.test(digits)) ||
      (type === 'EMAIL' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.pixKey))) ||
      (type === 'PHONE' && /^\d{10,13}$/.test(digits)) ||
      (type === 'RANDOM' && /^[a-zA-Z0-9-]{10,32}$/.test(String(data.pixKey).trim()));
    if (!valid) {
      return res.status(400).json({ error: 'Chave PIX inválida para o tipo selecionado' });
    }
    data.pixKeyType = type;
  }

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
      pixKey: user.pixKey,
      pixKeyType: user.pixKeyType,
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
