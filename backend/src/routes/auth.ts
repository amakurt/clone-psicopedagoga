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
import { sendEmail, emailConfigured, send2FAEmail } from '../lib/email';
import { generateBase32Secret, verifyTOTP, getOtpAuthUrl } from '../lib/totp';
import { sendWhatsAppMessage } from './whatsapp';
import { sendSystemWhatsApp2FA } from '../services/whatsapp-client.service';

const router = Router();

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email || '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

function maskPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return digits;
  return `(***) *****-${digits.slice(-4)}`;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não definido. Configure o backend/.env antes de executar a aplicação.');
  }
  return secret;
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
    { expiresIn: '30d' }
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
    hasPassword: !!user.password,
    emailVerified: !!user.emailVerified,
    twoFactorEnabled: !!user.twoFactorEnabled,
    twoFactorMethod: user.twoFactorMethod || 'EMAIL'
  };
}

function buildTenantPayload(tenant: any, role: string) {
  let parsedAddress = null;
  if (tenant.address) {
    try {
      parsedAddress = typeof tenant.address === 'string' ? JSON.parse(tenant.address) : tenant.address;
    } catch {
      parsedAddress = tenant.address;
    }
  }

  let logoUrl = tenant.logoUrl;
  if (!logoUrl && (tenant.name?.toLowerCase().includes('vilma') || tenant.slug?.toLowerCase().includes('vilma'))) {
    logoUrl = '/api/uploads/public/logo-vilma-transparente.png';
  }

  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    plan: tenant.plan,
    status: tenant.status,
    logoUrl,
    colors: tenant.colors,
    phone: tenant.phone || null,
    email: tenant.email || null,
    cnpj: tenant.cnpj || null,
    address: parsedAddress,
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

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV AUTH] ${isActivation ? 'Ativação' : 'Reset'} para ${user.email || user.phone}: código ${code}`);
  }
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
  try {
    const { email, password } = req.body;
    const rawEmail = typeof email === 'string' ? email.trim() : '';
    const cleanEmail = rawEmail.toLowerCase();
    
    if (!rawEmail || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    let user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user && rawEmail !== cleanEmail) {
      user = await prisma.user.findUnique({ where: { email: rawEmail } });
    }
    if (!user) {
      const allUsers = await prisma.user.findMany({ select: { id: true, email: true } });
      const found = allUsers.find(u => (u.email || '').trim().toLowerCase() === cleanEmail);
      if (found) {
        user = await prisma.user.findUnique({ where: { id: found.id } });
      }
    }
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

    let membership: any = null;
    try {
      membership = await prisma.membership.findFirst({
        where: { userId: user.id, active: true },
        orderBy: { createdAt: 'asc' },
        include: { tenant: { include: { subscription: true } } },
      });
      if (membership?.tenant) {
        await enforceTenantStatus(membership.tenant);
        if (membership.tenant.status === 'BLOQUEADO') {
          return res.status(403).json({ error: 'Assinatura da clínica vencida ou bloqueada. Entre em contato com o suporte.' });
        }
      }
    } catch (billingErr: any) {
      console.warn('[AUTH_LOGIN_BILLING_WARN]', billingErr.message);
    }

    // 2FA - Verificação em Duas Etapas (Obrigatório para todos os usuários reais)
    const isDemo = cleanEmail === 'demo@edupsychpro.tech' || user.email === 'demo@edupsychpro.tech';
    const enforce2FA = !isDemo && process.env.TWO_FACTOR_DISABLED !== 'true';

    if (enforce2FA) {
      const resolvedPhone = user.phone || membership?.tenant?.phone || null;
      const tempToken = jwt.sign(
        { userId: user.id, purpose: '2FA_LOGIN' },
        getJwtSecret(),
        { expiresIn: '10m' }
      );

      // Se usuário configurou Google Authenticator (TOTP) como método ativo
      if (user.twoFactorEnabled && user.twoFactorSecret && user.twoFactorMethod === 'TOTP') {
        return res.json({
          require2FA: true,
          twoFactorMethod: 'TOTP',
          tempToken,
          maskedEmail: maskEmail(user.email),
          maskedPhone: resolvedPhone ? maskPhone(resolvedPhone) : null,
          hasWhatsApp: !!resolvedPhone,
        });
      }

      let emailToSend = user.email;
      if (user.role === 'SUPERADMIN' && (emailToSend.includes('@edupsychpro.tech') || emailToSend.includes('@edupsych.tech'))) {
        emailToSend = 'amakurt@gmail.com';
      }

      // Se o usuário tiver WhatsApp disponível, aguarda a escolha dele na tela antes de enviar qualquer código
      if (resolvedPhone) {
        return res.json({
          require2FA: true,
          twoFactorMethod: 'CHOOSE',
          codeSent: false,
          tempToken,
          maskedEmail: maskEmail(emailToSend),
          maskedPhone: maskPhone(resolvedPhone),
          hasWhatsApp: true,
        });
      }

      // Se só tiver e-mail, envia o código único por e-mail imediatamente
      const code = generateCode();
      const codeHash = hashValue(code);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Invalida códigos 2FA anteriores do usuário
      await prisma.verificationCode.updateMany({
        where: { userId: user.id, type: 'TWO_FACTOR_LOGIN', usedAt: null },
        data: { usedAt: new Date() },
      });

      await prisma.verificationCode.create({
        data: {
          userId: user.id,
          type: 'TWO_FACTOR_LOGIN',
          channel: 'EMAIL',
          codeHash,
          expiresAt,
        },
      });

      send2FAEmail(emailToSend, user.name, code).catch((err) =>
        console.warn('[2FA_EMAIL_WARN] Falha ao enviar e-mail:', err)
      );

      return res.json({
        require2FA: true,
        twoFactorMethod: 'EMAIL',
        codeSent: true,
        tempToken,
        maskedEmail: maskEmail(emailToSend),
        maskedPhone: null,
        hasWhatsApp: false,
      });
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
  } catch (err: any) {
    console.error('[AUTH_LOGIN_ERROR]', err);
    return res.status(500).json({ error: 'Erro no servidor ao autenticar: ' + (err?.message || err) });
  }
});

// 2FA: Validar código (Email, WhatsApp ou TOTP) e liberar login
router.post('/2fa/verify', strictLimiter, async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
      return res.status(400).json({ error: 'Token temporário e código de 6 dígitos são obrigatórios' });
    }

    let payload: any;
    try {
      payload = jwt.verify(tempToken, getJwtSecret()) as any;
      if (payload.purpose !== '2FA_LOGIN') throw new Error('Token inválido');
    } catch {
      return res.status(401).json({ error: 'Sessão de verificação expirada. Faça login novamente.' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo.' });
    }

    const cleanCode = String(code).trim().replace(/\s/g, '');
    let verified = false;

    // 1. Tentar validar via TOTP (Google Authenticator) se configurado
    if (user.twoFactorSecret && verifyTOTP(user.twoFactorSecret, cleanCode)) {
      verified = true;
    }

    // 2. Se não validou por TOTP, validar pelo VerificationCode (E-mail / WhatsApp)
    if (!verified) {
      const record = await prisma.verificationCode.findFirst({
        where: {
          userId: user.id,
          type: 'TWO_FACTOR_LOGIN',
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (record && record.codeHash === hashValue(cleanCode)) {
        verified = true;
        await prisma.verificationCode.update({
          where: { id: record.id },
          data: { usedAt: new Date() },
        });
      }
    }

    if (!verified) {
      return res.status(400).json({ error: 'Código de verificação incorreto ou expirado.' });
    }

    // Ao validar o código 2FA, o e-mail do usuário é automaticamente confirmado!
    let updatedUser = user;
    if (!user.emailVerified) {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    const token = signToken(updatedUser);
    const tenants = await getUserTenants(updatedUser.id);
    const tenant = pickDefaultTenant(tenants);

    return res.json({
      token,
      user: buildUserPayload(updatedUser),
      tenants,
      tenant,
      message: 'Autenticado com sucesso!',
    });
  } catch (err: any) {
    console.error('[2FA_VERIFY_ERROR]', err);
    return res.status(500).json({ error: 'Erro ao validar código: ' + (err?.message || err) });
  }
});

// 2FA: Reenviar código (por E-mail ou WhatsApp)
router.post('/2fa/resend', strictLimiter, async (req, res) => {
  try {
    const { tempToken, channel = 'EMAIL' } = req.body;
    if (!tempToken) {
      return res.status(400).json({ error: 'Token temporário é obrigatório' });
    }

    let payload: any;
    try {
      payload = jwt.verify(tempToken, getJwtSecret()) as any;
      if (payload.purpose !== '2FA_LOGIN') throw new Error('Token inválido');
    } catch {
      return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        memberships: {
          where: { active: true },
          take: 1,
          include: { tenant: { select: { phone: true } } },
        },
      },
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const resolvedPhone = user.phone || user.memberships?.[0]?.tenant?.phone || null;

    const code = generateCode();
    const codeHash = hashValue(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationCode.updateMany({
      where: { userId: user.id, type: 'TWO_FACTOR_LOGIN', usedAt: null },
      data: { usedAt: new Date() },
    });

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        type: 'TWO_FACTOR_LOGIN',
        channel: channel === 'WHATSAPP' ? 'WHATSAPP' : 'EMAIL',
        codeHash,
        expiresAt,
      },
    });

    if (channel === 'WHATSAPP') {
      if (!resolvedPhone) {
        return res.status(400).json({ error: 'Usuário não possui telefone/WhatsApp cadastrado.' });
      }
      try {
        await sendSystemWhatsApp2FA(
          resolvedPhone,
          `EduPsych Pro: Seu código de segurança em duas etapas é ${code}. Válido por 10 minutos.`,
          user.memberships?.[0]?.tenantId
        );
        return res.json({ message: 'Código enviado via WhatsApp com sucesso!', channel: 'WHATSAPP' });
      } catch (e: any) {
        console.warn('[2FA_WHATSAPP_WARN]', e.message);
        return res.status(500).json({ error: e.message || 'Falha ao enviar WhatsApp. Tente por e-mail.' });
      }
    }

    // Enviar via e-mail Resend
    let targetEmail = user.email;
    if (user.role === 'SUPERADMIN' && (targetEmail.includes('@edupsychpro.tech') || targetEmail.includes('@edupsych.tech'))) {
      targetEmail = 'amakurt@gmail.com';
    }
    await send2FAEmail(targetEmail, user.name, code);
    return res.json({ message: 'Código reenviado para seu e-mail com sucesso!', channel: 'EMAIL' });
  } catch (err: any) {
    console.error('[2FA_RESEND_ERROR]', err);
    return res.status(500).json({ error: 'Erro ao reenviar código' });
  }
});

// 2FA: Iniciar configuração do Google Authenticator (TOTP)
router.post('/2fa/setup', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const secret = generateBase32Secret(20);
    const otpAuthUrl = getOtpAuthUrl(secret, user.email, 'EduPsych Pro');
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(otpAuthUrl)}`;

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorTempSecret: secret },
    });

    return res.json({
      secret,
      otpAuthUrl,
      qrCodeUrl,
      message: 'Escaneie o QR Code no Google Authenticator ou insira a chave secreta.',
    });
  } catch (err: any) {
    console.error('[2FA_SETUP_ERROR]', err);
    return res.status(500).json({ error: 'Erro ao iniciar configuração do 2FA' });
  }
});

// 2FA: Confirmar ativação do Google Authenticator
router.post('/2fa/confirm-setup', authenticate, async (req: any, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Código de 6 dígitos é obrigatório' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.twoFactorTempSecret) {
      return res.status(400).json({ error: 'Nenhuma configuração de 2FA em andamento. Inicie novamente.' });
    }

    const valid = verifyTOTP(user.twoFactorTempSecret, String(code).trim());
    if (!valid) {
      return res.status(400).json({ error: 'Código inválido. Verifique o horário do celular e tente novamente.' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: user.twoFactorTempSecret,
        twoFactorTempSecret: null,
        twoFactorEnabled: true,
        twoFactorMethod: 'TOTP',
      },
    });

    return res.json({
      success: true,
      message: 'Google Authenticator ativado com sucesso! Use o app para gerar seus códigos de login.',
      user: buildUserPayload(updated),
    });
  } catch (err: any) {
    console.error('[2FA_CONFIRM_SETUP_ERROR]', err);
    return res.status(500).json({ error: 'Erro ao confirmar ativação do 2FA' });
  }
});

// 2FA: Desativar Google Authenticator (retorna para 2FA via E-mail)
router.post('/2fa/disable', authenticate, async (req: any, res) => {
  try {
    const { password } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.password) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const validPassword = await bcrypt.compare(password || '', user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Senha incorreta para confirmar desativação' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: null,
        twoFactorTempSecret: null,
        twoFactorEnabled: false,
        twoFactorMethod: 'EMAIL',
      },
    });

    return res.json({
      success: true,
      message: 'Google Authenticator desativado. Suas verificações serão enviadas por e-mail.',
      user: buildUserPayload(updated),
    });
  } catch (err: any) {
    console.error('[2FA_DISABLE_ERROR]', err);
    return res.status(500).json({ error: 'Erro ao desativar autenticador' });
  }
});

// Local register
// register usa strictLimiter
router.post('/register', strictLimiter, async (req, res) => {
  try {
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
    const hasSmtp = emailConfigured();
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'SECRETARIA',
        phone: phone || null,
        active: true, // Soft activation: usuário sempre ativo para acesso imediato
        emailVerified: false,
      }
    });

    await ensureMembership(user);
    await ensureResponsibleForUser(user);

    let channel = 'DEV';
    if (hasSmtp) {
      try {
        const { code, token } = await createVerificationRecord(user, 'ACCOUNT_ACTIVATION', 'EMAIL', 60 * 24);
        channel = await sendVerificationMessage(user, code, token, 'ACCOUNT_ACTIVATION');
      } catch (err: any) {
        console.warn('[AUTH] Falha ao enviar verificação:', err?.message);
      }
    }

    const token = signToken(user);
    const tenants = await getUserTenants(user.id);

    res.status(201).json({
      message: 'Conta criada com sucesso!',
      needsVerification: false,
      channel,
      token,
      tenants,
      user: buildUserPayload(user)
    });
  } catch (error: any) {
    console.error('[REGISTER_ERROR]', error);
    res.status(500).json({ error: error?.message || 'Erro ao criar conta' });
  }
});

// Registro de nova clínica (self-service, fluxo de venda da landing)
// Cria o Tenant da clínica + usuário GESTOR admin + subscription TRIAL 14d
router.post('/register-clinic', strictLimiter, async (req, res) => {
  try {
    const { name, email, password, clinicName, phone, plan } = req.body;

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
      planCode: plan || 'MENSAL',
    });

    const hasSmtp = emailConfigured();
    let channel = 'DEV';

    if (hasSmtp) {
      try {
        const { code, token } = await createVerificationRecord(user, 'ACCOUNT_ACTIVATION', 'EMAIL', 60 * 24);
        channel = await sendVerificationMessage(user, code, token, 'ACCOUNT_ACTIVATION');
      } catch (err: any) {
        console.warn('[AUTH] Falha ao enviar verificação da clínica:', err?.message);
      }
    }

    console.log(`[AUTH] Clínica criada: ${tenant.name} (${tenant.slug}) | admin ${user.email} | trial 14d | ativo: ${user.active}`);

    const token = signToken(user);
    const tenants = await getUserTenants(user.id);

    res.status(201).json({
      message: 'Cadastro realizado com sucesso!',
      needsVerification: false,
      channel,
      token,
      tenant: buildTenantPayload(tenant, 'GESTOR'),
      tenants,
      user: buildUserPayload(user),
    });
  } catch (error: any) {
    console.error('[REGISTER_CLINIC_ERROR]', error);
    res.status(500).json({ error: error?.message || 'Erro ao criar conta da clínica' });
  }
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

  if (user.emailVerified) {
    return res.json({ message: 'E-mail já confirmado!', alreadyActive: true, user: buildUserPayload(user) });
  }

  const record = await verifyCodeAndToken(user.id, 'ACCOUNT_ACTIVATION', token, code);
  if (!record) {
    return res.status(400).json({ error: 'Código ou link inválido ou expirado' });
  }

  await invalidateVerificationCodes(user.id, 'ACCOUNT_ACTIVATION');
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, active: true },
  });

  const authToken = signToken(updatedUser);
  res.json({ message: 'E-mail confirmado com sucesso!', token: authToken, user: buildUserPayload(updatedUser) });
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

  if (user.emailVerified) {
    return res.status(400).json({ error: 'E-mail já confirmado anteriormente.' });
  }

  const { code, token } = await createVerificationRecord(user, 'ACCOUNT_ACTIVATION', 'EMAIL', 60 * 24);
  const channel = await sendVerificationMessage(user, code, token, 'ACCOUNT_ACTIVATION');

  res.json({ message: 'Link de confirmação reenviado com sucesso', channel });
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
    { expiresIn: '30d' }
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

// Sessão instantânea de demonstração (Live Demo interativo)
router.post('/demo', async (req, res) => {
  try {
    const DEMO_EMAIL = 'demo@edupsychpro.tech';
    const DEMO_SLUG = 'clinica-demo';

    let tenant = await prisma.tenant.findUnique({ where: { slug: DEMO_SLUG } });
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'Clínica Modelo EduPsych Pro',
          slug: DEMO_SLUG,
          plan: 'ANUAL',
          status: 'ATIVO',
          trialEndsAt: null,
        },
      });
    }

    // SEGURANÇA & PRIVACIDADE: O ambiente de demonstração JAMAIS deve reter credenciais reais de WhatsApp
    await prisma.whatsAppConfig.deleteMany({ where: { tenantId: tenant.id } });

    let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Dra. Camila Monteiro',
          email: DEMO_EMAIL,
          role: 'GESTOR',
          active: true,
          emailVerified: true,
          clinicName: 'Clínica Modelo EduPsych Pro',
          registration: 'ABPp 4829/SP',
          bio: 'Psicopedagoga Clínica especialista em Neuropsicologia do Desenvolvimento e TEA.',
          avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
        },
      });
    }

    await prisma.membership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      update: { role: 'GESTOR', active: true },
      create: { tenantId: tenant.id, userId: user.id, role: 'GESTOR', active: true },
    });

    await prisma.subscription.upsert({
      where: { tenantId: tenant.id },
      update: { status: 'ATIVA', planCode: 'ANUAL' },
      create: {
        tenantId: tenant.id,
        planCode: 'ANUAL',
        status: 'ATIVA',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    // Garante pacientes simulados
    const count = await prisma.paciente.count({ where: { tenantId: tenant.id } });
    if (count === 0) {
      await prisma.paciente.createMany({
        data: [
          {
            tenantId: tenant.id,
            name: 'Lucas Silva Meireles',
            birthDate: '2018-05-14',
            diagnosis: 'Transtorno do Espectro Autista (TEA Nível 1)',
            status: 'ATIVO',
            notes: 'Excelente engajamento com recursos visuais e jogos cognitivos. Foco atual em autorregulação e flexibilidade.',
          },
          {
            tenantId: tenant.id,
            name: 'Sofia Rodrigues Santos',
            birthDate: '2016-11-20',
            diagnosis: 'TDAH Tipo Misto + Desafios de Leitura/Dislexia',
            status: 'ATIVO',
            notes: 'Intervenção psicopedagógica semanal focada em funções executivas, atenção sustentada e consciência fonológica.',
          },
          {
            tenantId: tenant.id,
            name: 'Enzo Gabriel Castro',
            birthDate: '2019-02-08',
            diagnosis: 'Atraso Global do Desenvolvimento / Linguagem',
            status: 'ATIVO',
            notes: 'Fase de rastreio inicial e aplicação de protocolos lúdicos de estimulação cognitiva.',
          },
        ],
      });
    }

    const token = signToken(user);
    const tenants = await getUserTenants(user.id);
    const tenantPayload = buildTenantPayload(tenant, 'GESTOR');

    res.json({
      token,
      user: buildUserPayload(user),
      tenant: tenantPayload,
      tenants,
      isDemo: true,
      message: 'Bem-vindo à demonstração ao vivo do EduPsych Pro!',
    });
  } catch (error: any) {
    console.error('[DEMO_SESSION_ERROR]', error);
    res.status(500).json({ error: 'Erro ao iniciar sessão de demonstração' });
  }
});

export default router;
