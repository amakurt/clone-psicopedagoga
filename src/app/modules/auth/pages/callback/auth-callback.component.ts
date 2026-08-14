import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E1B4B] to-[#007F80]">
      <div class="bg-white rounded-[20px] shadow-2xl p-10 text-center legacy-card">
        @if (loading()) {
          <div class="flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-slate-600 font-semibold">Processando autenticação...</p>
          </div>
        }
        @if (error()) {
          <div class="flex flex-col items-center gap-4">
            <span class="material-icons text-[56px] text-red-500">error</span>
            <p class="text-red-600 font-semibold">{{ error() }}</p>
            <button (click)="goToLogin()" class="px-6 py-2 bg-primary text-on-primary rounded-xl font-semibold">
              Voltar ao Login
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];

      if (code) {
        this.api.post('/auth/google/exchange', { code }).subscribe({
          next: (res: any) => {
            this.auth.login(res.token, res.user);
            this.auth
              .refreshTenants()
              .then(() => {
                const tenants = this.auth.tenants();
                if (tenants.length > 1) {
                  this.router.navigate(['/auth/select-clinic']);
                } else {
                  const redirectPath = res.user?.role === 'RESPONSAVEL' ? '/guardian' : '/app/dashboard';
                  this.router.navigate([redirectPath]);
                }
              })
              .catch(() => {
                const redirectPath = res.user?.role === 'RESPONSAVEL' ? '/guardian' : '/app/dashboard';
                this.router.navigate([redirectPath]);
              });
          },
          error: (e) => {
            this.error.set('Falha na autenticação. Tente novamente.');
            this.loading.set(false);
          }
        });
      } else {
        this.error.set('Dados de autenticação não encontrados');
        this.loading.set(false);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}