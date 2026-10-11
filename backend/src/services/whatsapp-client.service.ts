import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';

/**
 * Envia mensagem de texto via Evolution API externa
 */
export async function sendWhatsAppMessage(phone: string, message: string, tenantId?: string) {
  const db = scoped(prisma, tenantId);
  const configRecord = await db.whatsAppConfig.findFirst();
  if (!configRecord) {
    throw new Error('WhatsApp não configurado. Configure a API em Configurações > WhatsApp.');
  }

  const cleanedPhone = phone.replace(/\D/g, '');
  const baseUrl = configRecord.apiUrl.replace(/\/+$/, '');
  const instance = configRecord.phoneNumberId || '';
  const endpoint = instance ? `${baseUrl}/message/sendText/${instance}` : `${baseUrl}/message/sendText`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': configRecord.token,
    },
    body: JSON.stringify({
      number: cleanedPhone,
      text: message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}
