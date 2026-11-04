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

  isDemo = computed(() => {
    const u = this.user();
    const t = this.tenant();
    return u?.email === 'demo@edupsychpro.tech' || Boolean(u?.isDemo) || t?.slug === 'clinica-demo';
  });

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

  private setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {}
    try {
      sessionStorage.setItem(key, value);
    } catch {}
  }

  private getItem(key: string): string | null {
    try {
      const fromLocal = localStorage.getItem(key);
      if (fromLocal) return fromLocal;
    } catch {}
    try {
      return sessionStorage.getItem(key);
    } catch {}
    return null;
  }

  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
    try {
      sessionStorage.removeItem(key);
    } catch {}
  }

  constructor(private router: Router) {
    const savedUser = this.getItem(this.userKey);
    if (savedUser) {
      try { this.user.set(JSON.parse(savedUser)); } catch {}
    }

    const savedTenants = this.getItem(this.tenantsKey);
    if (savedTenants) {
      try { this.tenants.set(JSON.parse(savedTenants)); } catch {}
    }

    const savedTenant = this.getItem(this.tenantKey);
    if (savedTenant) {
      try { this.tenant.set(JSON.parse(savedTenant)); } catch {}
    }

    const impersonateBackup = this.getItem(this.impersonationBackupKey);
    if (impersonateBackup) {
      this.isImpersonating.set(true);
      try {
        const parsed = JSON.parse(impersonateBackup);
        this.impersonatedClinicName.set(parsed.targetClinicName || '');
      } catch {}
    }
  }

  get token(): string | null {
    return this.getItem(this.tokenKey);
  }

  get tenantId(): string | null {
    return this.tenant()?.id || null;
  }

  login(token: string, user: any, tenants?: any[], tenant?: any) {
    this.setItem(this.tokenKey, token);
    this.setItem(this.userKey, JSON.stringify(user));
    this.user.set(user);

    if (tenants) {
      this.setItem(this.tenantsKey, JSON.stringify(tenants));
      this.tenants.set(tenants);
    }
    if (tenant) {
      this.setItem(this.tenantKey, JSON.stringify(tenant));
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
    this.setItem(this.tenantsKey, JSON.stringify(data.tenants || []));
    if (data.tenant) {
      this.tenant.set(data.tenant);
      this.setItem(this.tenantKey, JSON.stringify(data.tenant));
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
    this.setItem(this.tenantKey, JSON.stringify(data.tenant));
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
    this.setItem(this.impersonationBackupKey, JSON.stringify(backup));
    this.login(token, user, [tenant], tenant);
    this.isImpersonating.set(true);
    this.impersonatedClinicName.set(tenant?.name || 'Clínica');
    this.router.navigate(['/app/dashboard']);
  }

  stopImpersonation() {
    const backupRaw = this.getItem(this.impersonationBackupKey);
    if (backupRaw) {
      try {
        const backup = JSON.parse(backupRaw);
        this.removeItem(this.impersonationBackupKey);
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
    this.removeItem(this.tokenKey);
    this.removeItem(this.userKey);
    this.removeItem(this.tenantsKey);
    this.removeItem(this.tenantKey);
    this.removeItem(this.impersonationBackupKey);
    this.user.set(null);
    this.tenants.set([]);
    this.tenant.set(null);
    this.isImpersonating.set(false);
    this.impersonatedClinicName.set('');
    this.router.navigate(['/login']);
  }

  hasRole(...roles: string[]): boolean {
    const u = this.user();
    if (!u) return false;
    if (u.role === 'SUPERADMIN') return true;
    return roles.includes(u.role);
  }

  updateUser(patch: any) {
    const current = this.user() || {};
    const next = { ...current, ...patch };
    this.user.set(next);
    this.setItem(this.userKey, JSON.stringify(next));
  }

  updateTenant(patch: any) {
    const current = this.tenant() || {};
    const next = { ...current, ...patch };
    this.tenant.set(next);
    this.setItem(this.tenantKey, JSON.stringify(next));

    const list = this.tenants().map(t => t.id === next.id ? { ...t, ...next } : t);
    this.tenants.set(list);
    this.setItem(this.tenantsKey, JSON.stringify(list));
  }
}