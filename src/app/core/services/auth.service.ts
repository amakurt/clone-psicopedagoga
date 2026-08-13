import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private tenantsKey = 'auth_tenants';
  private tenantKey = 'auth_tenant';

  user = signal<any>(null);
  tenants = signal<any[]>([]);
  tenant = signal<any>(null);
  isLoggedIn = computed(() => !!this.token);

  constructor(private router: Router) {
    const savedUser = localStorage.getItem(this.userKey);
    if (savedUser) this.user.set(JSON.parse(savedUser));

    const savedTenants = localStorage.getItem(this.tenantsKey);
    if (savedTenants) this.tenants.set(JSON.parse(savedTenants));

    const savedTenant = localStorage.getItem(this.tenantKey);
    if (savedTenant) this.tenant.set(JSON.parse(savedTenant));
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get tenantId(): string | null {
    return this.tenant()?.id || null;
  }

  login(token: string, user: any, tenants?: any[], tenant?: any) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.user.set(user);

    if (tenants) {
      localStorage.setItem(this.tenantsKey, JSON.stringify(tenants));
      this.tenants.set(tenants);
    }
    if (tenant) {
      localStorage.setItem(this.tenantKey, JSON.stringify(tenant));
      this.tenant.set(tenant);
    }

    if (!tenants) {
      this.refreshTenants().catch(() => {});
    }
  }

  async refreshTenants(): Promise<void> {
    const res = await fetch(`${environment.apiUrl}/auth/tenants`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    this.tenants.set(data.tenants || []);
    localStorage.setItem(this.tenantsKey, JSON.stringify(data.tenants || []));
    if (data.tenant) {
      this.tenant.set(data.tenant);
      localStorage.setItem(this.tenantKey, JSON.stringify(data.tenant));
    }
  }

  async selectTenant(tenantId: string): Promise<any> {
    const res = await fetch(`${environment.apiUrl}/auth/select-tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ tenantId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao trocar de clínica');
    this.tenant.set(data.tenant);
    localStorage.setItem(this.tenantKey, JSON.stringify(data.tenant));
    return data.tenant;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tenantsKey);
    localStorage.removeItem(this.tenantKey);
    this.user.set(null);
    this.tenants.set([]);
    this.tenant.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(...roles: string[]): boolean {
    const u = this.user();
    return u && roles.includes(u.role);
  }

  updateUser(patch: any) {
    const current = this.user() || {};
    const next = { ...current, ...patch };
    this.user.set(next);
    localStorage.setItem(this.userKey, JSON.stringify(next));
  }
}