import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E1B4B] to-[#007F80] p-5">
      <div class="bg-white rounded-[20px] shadow-2xl w-full max-w-[420px] overflow-hidden">
        <div class="p-10 pb-8 text-center">
          <span class="material-icons text-[56px] text-primary">lock_reset</span>
          <h1 class="mt-3 text-[24px] font-black text-slate-900">Recuperar Senha</h1>
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
          <!-- Passo 1: identificar conta + canal -->
          @if (step() === 1) {
            <form (ngSubmit)="sendCode()">
              <div class="mb-5">
                <label class="block text-sm font-semibold text-slate-600 mb-2">Email ou telefone cadastrado</label>
                <input class="w-full px-4 py-3 border rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 outline-none"
                  type="text" [(ngModel)]="identifier" name="identifier" placeholder="seu@email.com ou (11) 99999-9999">
              </div>

              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-600 mb-2">Como deseja receber o código?</label>
                <div class="grid grid-cols-2 gap-3">
                  <button type="button" class="p-4 border-2 rounded-xl text-center transition-all"
                    [class]="channel() === 'EMAIL' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'"
                    (click)="channel.set('EMAIL')">
                    <span class="material-icons text-2xl mb-1">mail</span>
                    <p class="text-xs font-bold">Email</p>
                  </button>
                  <button type="button" class="p-4 border-2 rounded-xl text-center transition-all"
                    [class]="channel() === 'WHATSAPP' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'"
                    (click)="channel.set('WHATSAPP')">
                    <span class="material-icons text-2xl mb-1">whatsapp</span>
                    <p class="text-xs font-bold">WhatsApp</p>
                  </button>
                </div>
              </div>

              <button class="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-[15px] font-bold transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                type="submit" [disabled]="loading()">
                {{ loading() ? 'Enviando...' : 'Enviar código' }}
              </button>
            </form>
          }

          <!-- Passo 2: digitar código -->
          @if (step() === 2) {
            <form (ngSubmit)="submitCode()">
              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-600 mb-2">Código recebido</label>
                <input class="w-full px-4 py-3 border rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 outline-none tracking-[0.5em] text-center text-lg font-bold"
                  [class.border-red-300]="codeError()" [class.border-slate-200]="!codeError()"
                  type="text" [(ngModel)]="code" name="code" placeholder="000000" maxlength="6" inputmode="numeric">
                @if (codeError()) {
                  <p class="text-red-500 text-xs mt-1">{{ codeError() }}</p>
                }
              </div>

              <button class="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-[15px] font-bold transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                type="submit" [disabled]="loading()">
                {{ loading() ? 'Validando...' : 'Continuar' }}
              </button>

              <button type="button" class="w-full mt-3 py-2 text-sm text-primary font-semibold hover:underline"
                (click)="backToStep1()">Usar outro email/telefone</button>
            </form>
          }

          <!-- Passo 3: nova senha -->
          @if (step() === 3) {
            <form (ngSubmit)="resetPassword()">
              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-600 mb-2">Nova senha</label>
                <input class="w-full px-4 py-3 border rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 outline-none"
                  [class.border-red-300]="passwordError()" [class.border-slate-200]="!passwordError()"
                  type="password" [(ngModel)]="newPassword" name="newPassword" placeholder="Mínimo 6 caracteres">
                @if (passwordError()) {
                  <p class="text-red-500 text-xs mt-1">{{ passwordError() }}</p>
                }
              </div>

              <button class="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-[15px] font-bold transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                type="submit" [disabled]="loading()">
                {{ loading() ? 'Salvando...' : 'Redefinir Senha' }}
              </button>
            </form>
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
export class ResetPasswordComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  identifier = '';
  channel = signal<'EMAIL' | 'WHATSAPP'>('EMAIL');
  code = '';
  newPassword = '';
  step = signal(1);
  loading = signal(false);
  error = signal('');
  success = signal('');
  codeError = signal('');
  passwordError = signal('');

  token: string | null = null;
  email: string | null = null;
  status = signal('Informe seu email ou telefone para receber um código');

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (this.token) {
      this.step.set(3);
      this.status.set('Clique no link recebido e defina sua nova senha');
    }
  }

  sendCode() {
    if (!this.identifier) {
      this.error.set('Informe seu email ou telefone');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    const isEmail = this.identifier.includes('@');
    const payload: any = { channel: this.channel() };
    if (isEmail) payload.email = this.identifier.toLowerCase();
    else payload.phone = this.identifier;

    fetch(`${environment.apiUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.json().then((d: any) => ({ ok: res.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.error || 'Erro ao enviar código');
        this.step.set(2);
        this.status.set('Digite o código recebido');
        this.loading.set(false);
      })
      .catch(err => {
        this.error.set(err.message || 'Erro ao conectar com o servidor');
        this.loading.set(false);
      });
  }

  submitCode() {
    this.codeError.set('');
    if (!this.code || this.code.length !== 6) {
      this.codeError.set('Digite o código de 6 dígitos');
      return;
    }
    this.step.set(3);
    this.status.set('Defina sua nova senha');
  }

  resetPassword() {
    this.passwordError.set('');
    if (!this.newPassword || this.newPassword.length < 6) {
      this.passwordError.set('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const payload: any = { newPassword: this.newPassword };
    if (this.token) {
      payload.token = this.token;
    } else {
      const isEmail = this.identifier.includes('@');
      if (isEmail) payload.email = this.identifier.toLowerCase();
      else payload.phone = this.identifier;
      payload.code = this.code;
    }

    fetch(`${environment.apiUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.json().then((d: any) => ({ ok: res.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.error || 'Erro ao redefinir senha');
        this.success.set('Senha redefinida com sucesso!');
        this.status.set('Agora faça login com a nova senha');
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/login']), 2000);
      })
      .catch(err => {
        this.error.set(err.message || 'Erro ao conectar com o servidor');
        this.loading.set(false);
      });
  }

  backToStep1() {
    this.step.set(1);
    this.error.set('');
    this.status.set('Informe seu email ou telefone para receber um código');
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}
