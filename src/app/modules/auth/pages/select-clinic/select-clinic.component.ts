import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-select-clinic',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E1B4B] to-primary p-5">
      <div class="bg-white rounded-[20px] shadow-2xl w-full max-w-[520px] overflow-hidden legacy-card">
        <div class="p-10 pb-6 text-center">
          <span class="material-icons text-[56px] text-primary">domain</span>
          <h1 class="mt-3 text-[24px] font-black text-slate-900">Selecione sua clínica</h1>
          <p class="text-sm text-slate-500 mt-1">Você tem acesso a mais de uma clínica. Escolha onde quer trabalhar.</p>
        </div>

        @if (error()) {
          <div class="mx-10 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {{ error() }}
          </div>
        }

        <div class="px-10 pb-10 space-y-3">
          @for (tenant of auth.tenants(); track tenant.id) {
            <button
              class="w-full flex items-center gap-4 p-4 border-2 rounded-2xl text-left transition-all"
              [class]="tenant.status === 'BLOQUEADO'
                ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                : (tenant.id === auth.tenant()?.id
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 hover:border-primary/50')"
              [disabled]="tenant.status === 'BLOQUEADO' || loading()"
              (click)="select(tenant)">
              <div class="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                @if (tenant.logoUrl) {
                  <img [src]="tenant.logoUrl" class="size-full object-cover">
                } @else {
                  <span class="material-icons text-primary text-2xl">psychology</span>
                }
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[15px] font-bold text-slate-900 truncate">{{ tenant.name }}</p>
                <p class="text-xs text-slate-500">
                  {{ tenant.status === 'BLOQUEADO' ? 'Assinatura bloqueada' : 'Plano ' + tenant.plan + ' · ' + tenant.role }}
                </p>
              </div>
              @if (tenant.id === auth.tenant()?.id) {
                <span class="material-icons text-primary">check_circle</span>
              }
            </button>
          }

          @if (!auth.tenants().length) {
            <p class="text-center text-sm text-slate-500 py-6">
              Nenhuma clínica vinculada à sua conta.
            </p>
          }

          <div class="text-center pt-2">
            <button class="text-sm text-slate-500 hover:text-primary font-semibold" (click)="auth.logout()">
              Sair e trocar de conta
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SelectClinicComponent implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');

  ngOnInit() {
    if (!this.auth.token) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.auth.tenants().length === 0) {
      this.auth.refreshTenants().catch(() => {});
    }
  }

  select(tenant: any) {
    if (tenant.status === 'BLOQUEADO') return;
    this.loading.set(true);
    this.error.set('');
    this.auth
      .selectTenant(tenant.id)
      .then(() => {
        const role = this.auth.user()?.role;
        const redirectPath = role === 'RESPONSAVEL' ? '/guardian' : '/app/dashboard';
        this.router.navigate([redirectPath]);
      })
      .catch((err) => {
        this.error.set(err.message || 'Erro ao selecionar a clínica');
        this.loading.set(false);
      });
  }
}