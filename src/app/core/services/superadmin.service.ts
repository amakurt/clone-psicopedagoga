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
