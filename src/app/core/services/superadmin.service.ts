import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Observable } from 'rxjs';

export interface SuperAdminStats {
  tenantsTotal: number;
  tenantsActive: number;
  tenantsBlocked: number;
  tenantsTrial: number;
  totalPacientes: number;
  totalProfissionais: number;
  totalSessoes: number;
  mrrCents: number;
  mrrFormatted: string;
  planCounts: Record<string, number>;
}

export interface TenantListItem {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: 'ATIVO' | 'BLOQUEADO';
  trialEndsAt: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  stats: {
    pacientes: number;
    profissionais: number;
    sessoes: number;
  };
  subscription: {
    id: string;
    planCode: string;
    status: string;
    currentPeriodEnd: string | null;
    provider: string | null;
  } | null;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
}

export interface TenantsResponse {
  data: TenantListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class SuperAdminService {
  private api = inject(ApiService);

  getStats(): Observable<SuperAdminStats> {
    return this.api.get<SuperAdminStats>('/superadmin/stats');
  }

  getTenants(params?: {
    search?: string;
    status?: string;
    plan?: string;
    page?: number;
    limit?: number;
  }): Observable<TenantsResponse> {
    return this.api.get<TenantsResponse>('/superadmin/tenants', params);
  }

  updateStatus(tenantId: string, status: 'ATIVO' | 'BLOQUEADO'): Observable<any> {
    return this.api.patch(`/superadmin/tenants/${tenantId}/status`, { status });
  }

  extendTrial(tenantId: string, days: number): Observable<any> {
    return this.api.patch(`/superadmin/tenants/${tenantId}/trial`, { days });
  }

  updatePlan(tenantId: string, planCode: string): Observable<any> {
    return this.api.patch(`/superadmin/tenants/${tenantId}/plan`, { planCode });
  }

  impersonate(tenantId: string): Observable<{
    token: string;
    user: any;
    tenant: any;
    isImpersonated: boolean;
    message: string;
  }> {
    return this.api.post(`/superadmin/tenants/${tenantId}/impersonate`, {});
  }

  // --- WhatsApp Gateway & Multi-Tenant (Evolution API) ---

  getWhatsAppGatewayStatus(): Observable<EvolutionGatewayStatus> {
    return this.api.get<EvolutionGatewayStatus>('/superadmin/whatsapp/status');
  }

  getWhatsAppInstances(): Observable<WhatsAppInstancesResponse> {
    return this.api.get<WhatsAppInstancesResponse>('/superadmin/whatsapp/instances');
  }

  provisionWhatsAppInstance(tenantId: string): Observable<any> {
    return this.api.post(`/superadmin/whatsapp/instances/${tenantId}/provision`, {});
  }

  getWhatsAppQrCode(tenantId: string): Observable<WhatsAppQrCodeResponse> {
    return this.api.get<WhatsAppQrCodeResponse>(`/superadmin/whatsapp/instances/${tenantId}/qrcode`);
  }

  restartWhatsAppInstance(tenantId: string): Observable<any> {
    return this.api.post(`/superadmin/whatsapp/instances/${tenantId}/restart`, {});
  }

  disconnectWhatsAppInstance(tenantId: string): Observable<any> {
    return this.api.post(`/superadmin/whatsapp/instances/${tenantId}/disconnect`, {});
  }

  // --- Gestão Financeira & Faturamento SaaS ---

  getBillingStats(): Observable<BillingStats> {
    return this.api.get<BillingStats>('/superadmin/billing/stats');
  }

  getInvoices(params?: {
    search?: string;
    status?: string;
    tenantId?: string;
    page?: number;
    limit?: number;
  }): Observable<InvoicesResponse> {
    return this.api.get<InvoicesResponse>('/superadmin/billing/invoices', params);
  }

  confirmInvoicePayment(invoiceId: string, data?: { paymentMethod?: string; notes?: string }): Observable<any> {
    return this.api.post(`/superadmin/billing/invoices/${invoiceId}/confirm-payment`, data || {});
  }

  createManualInvoice(data: {
    tenantId: string;
    planCode: string;
    amountCents?: number;
    dueDate?: string;
    notes?: string;
    paymentMethod?: string;
  }): Observable<any> {
    return this.api.post('/superadmin/billing/invoices/create-manual', data);
  }

  sendInvoiceReminder(invoiceId: string): Observable<any> {
    return this.api.post(`/superadmin/billing/invoices/${invoiceId}/send-reminder`, {});
  }

  getBillingConfig(): Observable<{ success: boolean; config: SaaSBillingConfig }> {
    return this.api.get<{ success: boolean; config: SaaSBillingConfig }>('/superadmin/billing/config');
  }

  updateBillingConfig(data: Partial<SaaSBillingConfig>): Observable<{ success: boolean; message: string; config: SaaSBillingConfig }> {
    return this.api.put<{ success: boolean; message: string; config: SaaSBillingConfig }>('/superadmin/billing/config', data);
  }
}

export interface SaaSBillingConfig {
  id?: string;
  pixKeyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE' | 'ALEATORIA' | string;
  pixKey: string;
  beneficiaryName: string;
  beneficiaryDoc: string;
  bankName: string;
  bankAgency: string;
  bankAccount: string;
  bankAccountType: 'CORRENTE' | 'POUPANCA' | string;
  gatewayProvider: 'none' | 'asaas' | 'mercadopago' | string;
  gatewayApiKey?: string;
  gatewayWebhookSecret?: string;
  autoReminderMessage?: string;
  updatedAt?: string;
}

export interface BillingStats {
  totalReceivedCents: number;
  totalReceivedFormatted: string;
  totalPendingCents: number;
  totalPendingFormatted: string;
  totalOverdueCents: number;
  totalOverdueFormatted: string;
  mrrCents: number;
  mrrFormatted: string;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  totalCount: number;
}

export interface SubscriptionInvoiceItem {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  tenantStatus: string;
  planCode: string;
  amountCents: number;
  amountFormatted: string;
  status: 'PAGA' | 'PENDENTE' | 'VENCIDA' | 'CANCELADA' | string;
  dueDate: string;
  paidAt: string | null;
  paymentMethod: string;
  provider: string;
  providerPaymentId: string | null;
  pixCopiaECola: string | null;
  pixQrImage: string | null;
  notes: string | null;
  createdAt: string;
  owner: {
    name: string;
    email: string;
    phone: string | null;
  } | null;
}

export interface InvoicesResponse {
  data: SubscriptionInvoiceItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EvolutionGatewayStatus {
  health: {
    online: boolean;
    status: number | null;
    version?: string;
    managerUrl?: string;
    latencyMs: number;
    error?: string;
  };
  counts: {
    total: number;
    open: number;
    close: number;
    connecting: number;
  };
}

export interface ClinicWhatsAppInstance {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  plan: string;
  status: string;
  eligible: boolean;
  instanceName: string;
  isProvisioned: boolean;
  state: 'open' | 'close' | 'connecting' | 'not_provisioned' | 'not_found' | string;
  ownerJid: string | null;
  ownerPhone: string | null;
  profileName: string | null;
  profilePicUrl: string | null;
  conversationsCount: number;
  pacientesCount: number;
  aiEnabled: boolean;
}

export interface WhatsAppInstancesResponse {
  instances: ClinicWhatsAppInstance[];
  totalTenants: number;
  eligibleCount: number;
  connectedCount: number;
}

export interface WhatsAppQrCodeResponse {
  tenantId?: string;
  tenantName?: string;
  instanceName: string;
  state: string;
  base64?: string;
  code?: string;
  pairingCode?: string;
  error?: string;
}
