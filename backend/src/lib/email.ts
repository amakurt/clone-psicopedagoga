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
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
        }),
      });

      if (res.ok) {
        console.log(`[RESEND EMAIL] E-mail despachado com sucesso para ${to}`);
        return true;
      }
      const data: any = await res.json().catch(() => ({}));
      console.warn(`[RESEND WARN] Falha Resend para ${to}:`, data?.message || res.statusText);
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
