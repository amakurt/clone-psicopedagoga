import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  // Se for valor padrão/placeholder de exemplo, não tenta conectar
  if (user.includes('seu-email') || pass.includes('sua-senha') || host.includes('exemplo')) return null;
  try {
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
      connectionTimeout: 5000,
    });
    return transporter;
  } catch {
    return null;
  }
}

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY || !!getTransporter();
}

const FAKE_LOCAL_PARTS = ['test', 'teste', 'fake', 'demo', 'exemplo', 'example'];
const FAKE_DOMAINS = ['email.com', 'example.com', 'exemplo.com', 'test.com', 'teste.com', 'invalid', 'localhost', 'voigua.com', 'ttest.com'];

function domainOf(to: string): string {
  const at = to.lastIndexOf('@');
  return at === -1 ? '' : to.slice(at + 1).trim().toLowerCase();
}

function localPartOf(to: string): string {
  const at = to.indexOf('@');
  return at === -1 ? '' : to.slice(0, at).trim().toLowerCase();
}

// Detecta destinatários de teste/dados fictícios para não gerar bounce no envio real
export function isFakeEmail(to: string): boolean {
  const domain = domainOf(to);
  if (!domain) return true;
  if (FAKE_DOMAINS.includes(domain)) return true;
  const extra = (process.env.SMTP_FAKE_DOMAINS || '').split(',').map((d) => d.trim().toLowerCase()).filter(Boolean);
  if (extra.includes(domain)) return true;

  const local = localPartOf(to);
  if (!local) return true;
  return FAKE_LOCAL_PARTS.some((p) => local.includes(p));
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const from = process.env.SMTP_FROM || process.env.RESEND_FROM || 'EduPsych Pro <contato@edupsychpro.tech>';

  if (isFakeEmail(to)) {
    console.log(`[DEV EMAIL] Destinatário fictício ignorado: ${to}`);
    return false;
  }

  // 1. Envio prioritário e ultra-rápido via Resend REST API (porta 443 / HTTPS)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const sendViaResend = async (fromAddr: string) => {
        return fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromAddr,
            to: [to],
            subject,
            html,
          }),
        });
      };

      let res = await sendViaResend(from);
      if (res.ok) {
        console.log(`[RESEND EMAIL] E-mail despachado com sucesso para ${to}`);
        return true;
      }

      // Se falhou por domínio não verificado no Resend, tenta com onboarding@resend.dev
      const errData: any = await res.json().catch(() => ({}));
      if (errData?.message?.includes('not verified') || errData?.message?.includes('domain')) {
        console.warn(`[RESEND INFO] Domínio não verificado no Resend. Tentando fallback seguro onboarding@resend.dev...`);
        res = await sendViaResend('EduPsych Pro <onboarding@resend.dev>');
        if (res.ok) {
          console.log(`[RESEND EMAIL] E-mail despachado via onboarding@resend.dev para ${to}`);
          return true;
        }
      }
      console.warn(`[RESEND WARN] Falha Resend para ${to}:`, errData?.message || res.statusText);
    } catch (err: any) {
      console.warn(`[RESEND ERROR] Falha de conexão Resend para ${to}:`, err?.message || err);
    }
  }

  // 2. Fallback para Transporter SMTP clássico (Nodemailer)
  const t = getTransporter();
  if (!t) {
    console.log(`[DEV EMAIL] Para: ${to} | Assunto: ${subject}`);
    console.log(`[DEV EMAIL] HTML: ${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`);
    return false;
  }
  try {
    await t.sendMail({ from, to, subject, html });
    return true;
  } catch (err: any) {
    console.warn(`[SMTP WARN] Falha ao despachar e-mail para ${to}:`, err?.message || err);
    return false;
  }
}

export async function send2FAEmail(to: string, name: string, code: string): Promise<boolean> {
  const subject = `${code} é seu código de segurança - EduPsych Pro`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 20px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: #007F80; color: #ffffff; font-size: 22px; font-weight: 900;">
          Ψ
        </div>
        <h2 style="color: #0f172a; margin: 12px 0 2px; font-size: 20px; font-weight: 800;">EduPsych Pro</h2>
        <p style="color: #64748b; font-size: 12px; margin: 0;">Autenticação em Duas Etapas (2FA)</p>
      </div>

      <p style="color: #334155; font-size: 14px; margin: 0 0 16px;">Olá, <strong>${name || 'Usuário'}</strong>!</p>
      <p style="color: #475569; font-size: 13px; line-height: 1.5; margin: 0 0 20px;">
        Recebemos uma solicitação de acesso à sua conta. Para continuar com segurança, use o código de verificação abaixo:
      </p>

      <div style="text-align: center; margin: 24px 0; padding: 20px; background: #f0fdfa; border: 2px dashed #007F80; border-radius: 16px;">
        <p style="color: #0f766e; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin: 0 0 8px;">Código de Verificação</p>
        <span style="font-size: 34px; font-weight: 900; letter-spacing: 6px; color: #007F80; font-family: monospace;">
          ${code}
        </span>
      </div>

      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0 0 8px;">
        ⏳ Este código expira em <strong>10 minutos</strong>. Nunca compartilhe este código com ninguém.
      </p>
      <p style="color: #94a3b8; font-size: 11px; margin: 0;">
        Se você não solicitou este acesso, sua senha pode ter sido comprometida. Recomendamos alterá-la imediatamente.
      </p>
    </div>
  `;
  return sendEmail(to, subject, html);
}
