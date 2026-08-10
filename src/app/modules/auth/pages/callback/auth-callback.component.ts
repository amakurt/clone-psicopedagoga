import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E1B4B] to-[#007F80]">
      <div class="bg-white rounded-[20px] shadow-2xl p-10 text-center">
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
            <button (click)="goToLogin()" class="px-6 py-2 bg-primary text-white rounded-xl font-semibold">
              Voltar ao Login
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const userStr = params['user'];

      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          this.auth.login(token, user);
          this.auth
            .refreshTenants()
            .then(() => {
              const tenants = this.auth.tenants();
              if (tenants.length > 1) {
                this.router.navigate(['/auth/select-clinic']);
              } else {
                const redirectPath = user?.role === 'RESPONSAVEL' ? '/guardian' : '/app/dashboard';
                this.router.navigate([redirectPath]);
              }
            })
            .catch(() => {
              const redirectPath = user?.role === 'RESPONSAVEL' ? '/guardian' : '/app/dashboard';
              this.router.navigate([redirectPath]);
            });
        } catch (e) {
          this.error.set('Erro ao processar dados de autenticação');
          this.loading.set(false);
        }
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
