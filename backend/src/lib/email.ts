import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
  return transporter;
}

export function emailConfigured(): boolean {
  return !!getTransporter();
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

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const t = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'EduPsych Pro <no-reply@edupsych.local>';
  if (!t || isFakeEmail(to)) {
    console.log(`[DEV EMAIL] Para: ${to} | Assunto: ${subject}`);
    console.log(`[DEV EMAIL] HTML: ${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`);
    return;
  }
  await t.sendMail({ from, to, subject, html });
}
