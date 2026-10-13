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

  // Em testes manuais (overrideConfig fornecido), verifica o estado da instância antes
  if (instance && overrideConfig) {
    try {
      const stateRes = await fetch(`${baseUrl}/instance/connectionState/${instance}`, {
        headers: { apikey: token.trim() },
        signal: AbortSignal.timeout(3000),
      });
      if (stateRes.ok) {
        const stateData = (await stateRes.json()) as any;
        const state = stateData?.instance?.state;
        if (state && state !== 'open') {
          const stateLabels: Record<string, string> = {
            close: 'desconectada',
            connecting: 'aguardando conexão/leitura do QR Code',
          };
          const statusDesc = stateLabels[state] || state;
          throw new Error(
            `A instância "${instance}" está ${statusDesc}. Acesse ${baseUrl}/manager no seu navegador para escanear o QR Code no seu WhatsApp e conectar o aparelho.`
          );
        }
      }
    } catch (stateErr: any) {
      if (stateErr.message?.includes('A instância')) {
        throw stateErr;
      }
      if (stateErr.message?.includes('ECONNREFUSED') || stateErr.message?.includes('fetch failed')) {
        throw new Error(
          `Não foi possível conectar ao servidor em "${baseUrl}". Verifique se o servidor da Evolution API está ligado e acessível.`
        );
      }
    }
  }

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
      signal: AbortSignal.timeout(12000),
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
    if (err.name === 'TimeoutError' || err.message?.includes('aborted') || err.message?.includes('timeout')) {
      throw new Error(
        `Tempo limite esgotado ao aguardar a Evolution API. Verifique se a instância "${instance}" está conectada ao WhatsApp em ${baseUrl}/manager.`
      );
    }
    if (err.message && (err.message.includes('ECONNREFUSED') || err.message.includes('fetch failed'))) {
      throw new Error(
        `Não foi possível conectar ao servidor em "${baseUrl}". Verifique se o servidor da Evolution API está ligado e acessível.`
      );
    }
    throw err;
  }
}

// =========================================================================
// 2. MULTI-TENANT & GESTÃO DA EVOLUTION API (SUPERADMIN / PLANOS PRO & VIP)
// =========================================================================

/**
 * Valida se o plano da clínica permite utilizar o módulo WhatsApp (PRO ou VIP)
 */
export function isPlanWhatsAppEligible(plan?: string | null): boolean {
  if (!plan) return false;
  const p = plan.trim().toUpperCase();
  return p === 'PRO' || p === 'VIP';
}

/**
 * Retorna as credenciais mestres da Evolution API
 */
export function getEvolutionMasterConfig() {
  const apiUrl = normalizeApiUrl(process.env.EVOLUTION_API_URL || 'http://localhost:8080');
  const apiKey = (process.env.EVOLUTION_API_KEY || '34aa2d83eef4cf4e74691e0ef22b8ac4e3c8c343f9b66822').trim();
  return { apiUrl, apiKey };
}

/**
 * Verifica se o servidor da Evolution API está online e respondendo
 */
export async function checkEvolutionHealth(): Promise<{
  online: boolean;
  status: number | null;
  version?: string;
  managerUrl?: string;
  latencyMs: number;
  error?: string;
}> {
  const { apiUrl, apiKey } = getEvolutionMasterConfig();
  const start = Date.now();
  try {
    const res = await fetch(`${apiUrl}/`, {
      headers: { apikey: apiKey },
      signal: AbortSignal.timeout(4000),
    });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      const data = (await res.json()) as any;
      return {
        online: true,
        status: res.status,
        version: data?.version || 'v2',
        managerUrl: data?.manager || `${apiUrl}/manager`,
        latencyMs,
      };
    }
    return {
      online: false,
      status: res.status,
      latencyMs,
      error: `HTTP ${res.status}`,
    };
  } catch (err: any) {
    return {
      online: false,
      status: null,
      latencyMs: Date.now() - start,
      error: err.message || 'Servidor inacessível',
    };
  }
}

/**
 * Lista todas as instâncias existentes na Evolution API
 */
export async function fetchEvolutionInstances(): Promise<any[]> {
  const { apiUrl, apiKey } = getEvolutionMasterConfig();
  try {
    const res = await fetch(`${apiUrl}/instance/fetchInstances`, {
      headers: { apikey: apiKey },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    return ((await res.json()) as any[]) || [];
  } catch (err) {
    return [];
  }
}

/**
 * Consulta o estado de conexão de uma instância específica
 */
export async function getEvolutionInstanceStatus(instanceName: string): Promise<{
  state: 'open' | 'close' | 'connecting' | 'not_found' | 'error';
  raw?: any;
}> {
  const { apiUrl, apiKey } = getEvolutionMasterConfig();
  const cleanName = (instanceName || '').trim();
  if (!cleanName) return { state: 'not_found' };

  try {
    const res = await fetch(`${apiUrl}/instance/connectionState/${cleanName}`, {
      headers: { apikey: apiKey },
      signal: AbortSignal.timeout(4000),
    });
    if (res.status === 404) return { state: 'not_found' };
    if (!res.ok) return { state: 'error' };
    const data = (await res.json()) as any;
    const state = data?.instance?.state || (data?.state as any) || 'close';
    return { state, raw: data };
  } catch (err) {
    return { state: 'error' };
  }
}

/**
 * Obtém o QR Code ou código de pareamento para conectar ao WhatsApp
 */
export async function getEvolutionQrCode(instanceName: string): Promise<{
  state: string;
  base64?: string;
  code?: string;
  pairingCode?: string;
  error?: string;
}> {
  const { apiUrl, apiKey } = getEvolutionMasterConfig();
  const cleanName = (instanceName || '').trim();
  if (!cleanName) return { state: 'error', error: 'Nome de instância inválido' };

  try {
    const res = await fetch(`${apiUrl}/instance/connect/${cleanName}`, {
      headers: { apikey: apiKey },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      const errText = await res.text();
      return { state: 'error', error: `Falha ao conectar: HTTP ${res.status} - ${errText.slice(0, 100)}` };
    }
    const data = (await res.json()) as any;
    return {
      state: data?.instance?.state || data?.state || (data?.base64 ? 'connecting' : 'unknown'),
      base64: data?.base64 || undefined,
      code: data?.code || undefined,
      pairingCode: data?.pairingCode || undefined,
    };
  } catch (err: any) {
    return { state: 'error', error: err.message || 'Erro ao obter QR Code' };
  }
}

/**
 * Cria ou provisiona uma instância na Evolution API já configurando o webhook
 */
export async function createEvolutionInstance(
  instanceName: string,
  webhookTargetUrl?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const { apiUrl, apiKey } = getEvolutionMasterConfig();
  const cleanName = (instanceName || '').trim();
  if (!cleanName) return { success: false, error: 'Nome de instância inválido' };

  try {
    // 1. Cria instância
    const createRes = await fetch(`${apiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({
        instanceName: cleanName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      }),
      signal: AbortSignal.timeout(8000),
    });

    let data = null;
    if (createRes.ok) {
      data = await createRes.json();
    } else if (createRes.status !== 403 && createRes.status !== 409) {
      // Se não for já existente
      const errText = await createRes.text();
      return { success: false, error: `Erro ao criar instância: HTTP ${createRes.status} - ${errText.slice(0, 120)}` };
    }

    // 2. Configura Webhook padrão da clínica
    const webhookUrl = webhookTargetUrl || 'http://host.docker.internal:3000/api/whatsapp/webhook';
    try {
      await fetch(`${apiUrl}/webhook/set/${cleanName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
        body: JSON.stringify({
          url: webhookUrl,
          enabled: true,
          webhookByEvents: false,
          events: ['MESSAGES_UPSERT'],
        }),
        signal: AbortSignal.timeout(5000),
      });
    } catch (whErr) {
      console.warn(`[EVOLUTION_WEBHOOK_WARN] Falha ao configurar webhook para ${cleanName}:`, whErr);
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao provisionar instância' };
  }
}

/**
 * Reinicia uma instância na Evolution API
 */
export async function restartEvolutionInstance(instanceName: string): Promise<{ success: boolean; error?: string }> {
  const { apiUrl, apiKey } = getEvolutionMasterConfig();
  const cleanName = (instanceName || '').trim();
  if (!cleanName) return { success: false, error: 'Nome de instância inválido' };

  try {
    const res = await fetch(`${apiUrl}/instance/restart/${cleanName}`, {
      method: 'POST',
      headers: { apikey: apiKey },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao reiniciar' };
  }
}

/**
 * Desconecta (logout) uma instância da Evolution API (reverte sessão)
 */
export async function logoutEvolutionInstance(instanceName: string): Promise<{ success: boolean; error?: string }> {
  const { apiUrl, apiKey } = getEvolutionMasterConfig();
  const cleanName = (instanceName || '').trim();
  if (!cleanName) return { success: false, error: 'Nome de instância inválido' };

  try {
    const res = await fetch(`${apiUrl}/instance/logout/${cleanName}`, {
      method: 'DELETE',
      headers: { apikey: apiKey },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok && res.status !== 404) {
      return { success: false, error: `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao desconectar' };
  }
}

/**
 * Garante e sincroniza a instância de WhatsApp para o Tenant com base no seu plano
 */
export async function syncTenantWhatsAppInstance(tenantId: string): Promise<{
  eligible: boolean;
  instanceName?: string;
  status: string;
  message?: string;
}> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return { eligible: false, status: 'TENANT_NOT_FOUND' };

  const eligible = isPlanWhatsAppEligible(tenant.plan) && tenant.status === 'ATIVO';
  const { apiUrl, apiKey } = getEvolutionMasterConfig();

  // Gera nome padronizado da instância (ex: edupsych para tenant default ou slug da clínica)
  let instanceName = tenant.slug ? tenant.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '') : `clinica-${tenant.id.slice(-6)}`;
  if (!instanceName || instanceName.length < 3) {
    instanceName = `clinica-${tenant.id.slice(-6)}`;
  }

  let config = await prisma.whatsAppConfig.findFirst({ where: { tenantId } });

  if (!eligible) {
    // Rebaixamento ou bloqueio (Regra A): se possuía instância conectada, desconecta da Evolution API
    if (config?.phoneNumberId) {
      try {
        await logoutEvolutionInstance(config.phoneNumberId);
      } catch (e) {
        // Ignora erros caso já desconectado
      }
    }
    return {
      eligible: false,
      instanceName: config?.phoneNumberId || instanceName,
      status: 'PLAN_INELIGIBLE',
      message: `Plano atual (${tenant.plan}) não contempla WhatsApp. Módulo restrito aos planos PRO e VIP.`,
    };
  }

  // Se for elegível (PRO/VIP e ATIVO):
  if (!config) {
    config = await prisma.whatsAppConfig.create({
      data: {
        tenantId,
        apiUrl,
        token: apiKey,
        phoneNumberId: instanceName,
        aiEnabled: true,
      },
    });
  } else if (!config.phoneNumberId) {
    config = await prisma.whatsAppConfig.update({
      where: { id: config.id },
      data: {
        apiUrl,
        token: apiKey,
        phoneNumberId: instanceName,
      },
    });
  }

  // Provisiona na Evolution API se necessário
  await createEvolutionInstance(config.phoneNumberId || instanceName);

  const conn = await getEvolutionInstanceStatus(config.phoneNumberId || instanceName);
  return {
    eligible: true,
    instanceName: config.phoneNumberId || instanceName,
    status: conn.state,
    message: 'Instância ativa e vinculada ao plano PRO/VIP',
  };
}
