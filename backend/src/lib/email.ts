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

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const t = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'EduPsych Pro <no-reply@edupsych.local>';
  if (!t) {
    console.log(`[DEV EMAIL] Para: ${to} | Assunto: ${subject}`);
    console.log(`[DEV EMAIL] HTML: ${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`);
    return;
  }
  await t.sendMail({ from, to, subject, html });
}
