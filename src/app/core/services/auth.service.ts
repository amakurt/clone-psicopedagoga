import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private tenantsKey = 'auth_tenants';
  private tenantKey = 'auth_tenant';
  private impersonationBackupKey = 'superadmin_impersonate_backup';

  user = signal<any>(null);
  tenants = signal<any[]>([]);
  tenant = signal<any>(null);
  isImpersonating = signal<boolean>(false);
  impersonatedClinicName = signal<string>('');

  isLoggedIn = computed(() => !!this.token);

  isSuperAdmin = computed(() => {
    if (this.user()?.role === 'SUPERADMIN') return true;
    if (this.isImpersonating()) {
      const backupRaw = sessionStorage.getItem(this.impersonationBackupKey);
      if (backupRaw) {
        try {
          return JSON.parse(backupRaw).user?.role === 'SUPERADMIN';
        } catch {}
      }
    }
    return false;
  });

  constructor(private router: Router) {
    // Migração: remover credenciais antigas do localStorage (agora a sessão é sessionStorage)
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tenantsKey);
    localStorage.removeItem(this.tenantKey);

    const savedUser = sessionStorage.getItem(this.userKey);
    if (savedUser) this.user.set(JSON.parse(savedUser));

    const savedTenants = sessionStorage.getItem(this.tenantsKey);
    if (savedTenants) this.tenants.set(JSON.parse(savedTenants));

    const savedTenant = sessionStorage.getItem(this.tenantKey);
    if (savedTenant) this.tenant.set(JSON.parse(savedTenant));

    const impersonateBackup = sessionStorage.getItem(this.impersonationBackupKey);
    if (impersonateBackup) {
      this.isImpersonating.set(true);
      try {
        const parsed = JSON.parse(impersonateBackup);
        this.impersonatedClinicName.set(parsed.targetClinicName || '');
      } catch {}
    }
  }

  get token(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  get tenantId(): string | null {
    return this.tenant()?.id || null;
  }

  login(token: string, user: any, tenants?: any[], tenant?: any) {
    sessionStorage.setItem(this.tokenKey, token);
    sessionStorage.setItem(this.userKey, JSON.stringify(user));
    this.user.set(user);

    if (tenants) {
      sessionStorage.setItem(this.tenantsKey, JSON.stringify(tenants));
      this.tenants.set(tenants);
    }
    if (tenant) {
      sessionStorage.setItem(this.tenantKey, JSON.stringify(tenant));
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
    sessionStorage.setItem(this.tenantsKey, JSON.stringify(data.tenants || []));
    if (data.tenant) {
      this.tenant.set(data.tenant);
      sessionStorage.setItem(this.tenantKey, JSON.stringify(data.tenant));
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
    sessionStorage.setItem(this.tenantKey, JSON.stringify(data.tenant));
    return data.tenant;
  }

  startImpersonation(token: string, user: any, tenant: any) {
    const backup = {
      token: this.token,
      user: this.user(),
      tenants: this.tenants(),
      tenant: this.tenant(),
      targetClinicName: tenant?.name || 'Clínica',
    };
    sessionStorage.setItem(this.impersonationBackupKey, JSON.stringify(backup));
    this.login(token, user, [tenant], tenant);
    this.isImpersonating.set(true);
    this.impersonatedClinicName.set(tenant?.name || 'Clínica');
    this.router.navigate(['/app/dashboard']);
  }

  stopImpersonation() {
    const backupRaw = sessionStorage.getItem(this.impersonationBackupKey);
    if (backupRaw) {
      try {
        const backup = JSON.parse(backupRaw);
        sessionStorage.removeItem(this.impersonationBackupKey);
        this.isImpersonating.set(false);
        this.impersonatedClinicName.set('');
        this.login(backup.token, backup.user, backup.tenants, backup.tenant);
        this.router.navigate(['/master']);
        return;
      } catch (e) {
        console.error('Erro ao restaurar sessão de Superadmin', e);
      }
    }
    this.isImpersonating.set(false);
    this.router.navigate(['/master']);
  }

  logout() {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.tenantsKey);
    sessionStorage.removeItem(this.tenantKey);
    sessionStorage.removeItem(this.impersonationBackupKey);
    this.user.set(null);
    this.tenants.set([]);
    this.tenant.set(null);
    this.isImpersonating.set(false);
    this.impersonatedClinicName.set('');
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
    sessionStorage.setItem(this.userKey, JSON.stringify(next));
  }
}