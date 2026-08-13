import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E1B4B] to-[#007F80] p-5">
      <div class="bg-white rounded-[20px] shadow-2xl w-full max-w-[420px] overflow-hidden legacy-card">
        <div class="p-10 pb-8 text-center">
          <span class="material-icons text-[56px] text-primary" [class.text-emerald-500]="success()">verified_user</span>
          <h1 class="mt-3 text-[24px] font-black text-slate-900">Ativação de Conta</h1>
          <p class="text-sm text-slate-500 mt-1">{{ status() }}</p>
        </div>

        @if (error()) {
          <div class="mx-10 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <span class="material-icons text-lg">error</span> {{ error() }}
          </div>
        }

        @if (success()) {
          <div class="mx-10 mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm flex items-center gap-2">
            <span class="material-icons text-lg">check_circle</span> {{ success() }}
          </div>
        }

        <div class="px-10 pb-10">
          @if (!success()) {
            <form (ngSubmit)="submitCode()">
              <div class="mb-5">
                <label class="block text-sm font-semibold text-slate-600 mb-2">Email cadastrado</label>
                <input class="w-full px-4 py-3 border rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 outline-none"
                  [class.border-red-300]="emailError()" [class.border-slate-200]="!emailError()"
                  type="email" [(ngModel)]="email" name="email" placeholder="seu@email.com">
                @if (emailError()) {
                  <p class="text-red-500 text-xs mt-1">{{ emailError() }}</p>
                }
              </div>

              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-600 mb-2">Código de verificação</label>
                <input class="w-full px-4 py-3 border rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 outline-none tracking-[0.5em] text-center text-lg font-bold"
                  [class.border-red-300]="codeError()" [class.border-slate-200]="!codeError()"
                  type="text" [(ngModel)]="code" name="code" placeholder="000000" maxlength="6" inputmode="numeric">
                @if (codeError()) {
                  <p class="text-red-500 text-xs mt-1">{{ codeError() }}</p>
                }
              </div>

              <button class="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-[15px] font-bold transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                type="submit" [disabled]="loading()">
                {{ loading() ? 'Ativando...' : 'Ativar Conta' }}
              </button>
            </form>
          }

          @if (success()) {
            <button class="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-[15px] font-bold transition-all shadow-lg shadow-primary/25"
              (click)="goApp()">
              Ir para o Dashboard
            </button>
          }

          <div class="text-center mt-6">
            <button class="text-sm text-primary font-semibold hover:underline" (click)="goLogin()">
              Voltar para o login
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class VerifyAccountComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  code = '';
  loading = signal(false);
  error = signal('');
  success = signal('');
  emailError = signal('');
  codeError = signal('');

  status = signal('Verifique seu email e insira o código recebido');

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    if (token) {
      this.verifyWithToken(token);
    }
  }

  verifyWithToken(token: string) {
    this.loading.set(true);
    this.status.set('Ativando sua conta...');
    fetch(`${environment.apiUrl}/auth/verify-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json().then((d: any) => ({ ok: res.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.error || 'Link inválido ou já utilizado');
        this.onSuccess(d);
      })
      .catch(err => {
        this.error.set(err.message || 'Erro ao ativar conta');
        this.status.set('Vínculo inválido — digite o código manualmente');
        this.loading.set(false);
      });
  }

  submitCode() {
    this.emailError.set('');
    this.codeError.set('');

    if (!this.email) {
      this.emailError.set('Email é obrigatório');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError.set('Email inválido');
      return;
    }
    if (!this.code || this.code.length !== 6) {
      this.codeError.set('Digite o código de 6 dígitos');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    fetch(`${environment.apiUrl}/auth/verify-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.email, code: this.code }),
    })
      .then(res => res.json().then((d: any) => ({ ok: res.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.error || 'Erro ao ativar conta');
        this.onSuccess(d);
      })
      .catch(err => {
        this.error.set(err.message || 'Erro ao conectar com o servidor');
        this.loading.set(false);
      });
  }

  onSuccess(d: any) {
    this.success.set('Conta ativada com sucesso!');
    this.status.set('Bem-vindo ao EduPsych Pro');
    this.loading.set(false);
    if (d.token && d.user) {
      this.auth.login(d.token, d.user);
    }
  }

  goApp() {
    if (this.auth.isLoggedIn()) {
      const user = this.auth.user();
      this.router.navigate([user?.role === 'RESPONSAVEL' ? '/guardian' : '/app/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}