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
}
