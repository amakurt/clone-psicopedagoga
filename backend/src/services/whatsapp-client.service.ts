import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';

/**
 * Normaliza uma URL garantindo protocolo http/https e removendo barras finais
 */
export function normalizeApiUrl(url: string): string {
  let cleaned = (url || '').trim();
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = cleaned.includes('localhost') || cleaned.includes('127.0.0.1')
      ? `http://${cleaned}`
      : `https://${cleaned}`;
  }
  return cleaned.replace(/\/+$/, '');
}

/**
 * Envia mensagem de texto via Evolution API externa com tratamento inteligente de erros e telefone
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  tenantId?: string,
  overrideConfig?: { apiUrl?: string; token?: string; phoneNumberId?: string }
) {
  const db = scoped(prisma, tenantId);
  const configRecord = await db.whatsAppConfig.findFirst();

  const apiUrlRaw = overrideConfig?.apiUrl || configRecord?.apiUrl;
  let token = overrideConfig?.token || configRecord?.token;
  const phoneNumberId =
    overrideConfig?.phoneNumberId !== undefined
      ? overrideConfig.phoneNumberId
      : configRecord?.phoneNumberId;

  if (!token && configRecord?.token) {
    token = configRecord.token;
  }

  if (!apiUrlRaw) {
    throw new Error('URL da API não informada. Preencha a URL da Evolution API em Configurações.');
  }
  if (!token) {
    throw new Error('Token (apikey) não informado. Preencha o Token de autenticação da Evolution API.');
  }

  let cleanedPhone = phone.replace(/\D/g, '');
  if (!cleanedPhone) {
    throw new Error('Número de telefone inválido.');
  }
  // Se for número brasileiro com 10 ou 11 dígitos sem DDI, adiciona o DDI 55
  if (cleanedPhone.length === 10 || cleanedPhone.length === 11) {
    cleanedPhone = '55' + cleanedPhone;
  }

  const baseUrl = normalizeApiUrl(apiUrlRaw);
  const instance = (phoneNumberId || '').trim();
  const endpoint = instance ? `${baseUrl}/message/sendText/${instance}` : `${baseUrl}/message/sendText`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': token.trim(),
      },
      body: JSON.stringify({
        number: cleanedPhone,
        text: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Falha de autenticação na Evolution API (HTTP ${response.status}). Verifique o Token (apikey).`);
      }
      if (response.status === 404) {
        throw new Error(
          `Instância "${instance || 'padrão'}" não encontrada na Evolution API (HTTP 404). Verifique o Nome da Instância.`
        );
      }
      throw new Error(`Erro na Evolution API (HTTP ${response.status}): ${errorText.slice(0, 150)}`);
    }

    return await response.json();
  } catch (err: any) {
    if (err.message && (err.message.includes('ECONNREFUSED') || err.message.includes('fetch failed'))) {
      throw new Error(
        `Não foi possível conectar ao servidor em "${baseUrl}". Verifique se o servidor da Evolution API está ligado e acessível.`
      );
    }
    throw err;
  }
}
