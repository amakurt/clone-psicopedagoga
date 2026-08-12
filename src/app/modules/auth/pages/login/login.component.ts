import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E1B4B] to-[#007F80] p-5">
      <div class="bg-white rounded-[20px] shadow-2xl w-full max-w-[420px] overflow-hidden">
        <!-- Header -->
        <div class="p-10 pb-8 text-center">
          <span class="material-icons text-[56px] text-primary">psychology</span>
          <h1 class="mt-3 text-[26px] font-black text-slate-900">EduPsych Pro</h1>
          <p class="text-sm text-slate-500 mt-1">{{ isRegister() ? 'Crie sua conta' : 'Acesse sua conta' }}</p>
        </div>

        <!-- Error/Success -->
        @if (error()) {
          <div class="mx-10 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <span class="material-icons text-lg">error</span> {{ error() }}
          </div>
          @if (needsVerification()) {
            <button class="mx-10 mb-4 w-[calc(100%-80px)] py-2 text-sm text-primary font-bold hover:underline"
              (click)="resendVerification()" [disabled]="resending()">
              {{ resending() ? 'Reenviando...' : 'Reenviar link de ativação' }}
            </button>
          }
        }
        @if (success()) {
          <div class="mx-10 mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm flex items-center gap-2">
            <span class="material-icons text-lg">check_circle</span> {{ success() }}
          </div>
        }

        <!-- Form -->
        <div class="px-10 pb-10">
          @if (isRegister() && selectedPlan()) {
            <div class="mb-5 p-3 bg-primary/5 border border-primary/20 rounded-xl text-sm text-slate-700 flex items-center gap-2">
              <span class="material-icons text-primary text-lg">workspace_premium</span>
              Você escolheu o plano <strong>{{ selectedPlan() }}</strong> — comece o trial e pague ao assinar.
            </div>
          }

          <form (ngSubmit)="onSubmit()">
            @if (isRegister()) {
              <div class="mb-5">
                <label class="block text-sm font-semibold text-slate-600 mb-2">Nome Completo</label>
                <input class="w-full px-4 py-3 border rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-all"
                  [class.border-red-300]="nameError()" [class.border-slate-200]="!nameError()"
                  type="text" [(ngModel)]="name" name="name" placeholder="Seu nome completo">
                @if (nameError()) {
                  <p class="text-red-500 text-xs mt-1">{{ nameError() }}</p>
                }
              </div>
            }

            <div class="mb-5">
              <label class="block text-sm font-semibold text-slate-600 mb-2">Email</label>
              <input class="w-full px-4 py-3 border rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-all"
                [class.border-red-300]="emailError()" [class.border-slate-200]="!emailError()"
                type="email" [(ngModel)]="email" name="email" placeholder="seu@email.com" autocomplete="off">
              @if (emailError()) {
                <p class="text-red-500 text-xs mt-1">{{ emailError() }}</p>
              }
            </div>

            <div class="mb-5">
              <label class="block text-sm font-semibold text-slate-600 mb-2">Senha</label>
              <input class="w-full px-4 py-3 border rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-all"
                [class.border-red-300]="passwordError()" [class.border-slate-200]="!passwordError()"
                type="password" [(ngModel)]="password" name="password" [placeholder]="isRegister() ? 'Mínimo 6 caracteres' : 'Sua senha'" autocomplete="new-password">
              @if (passwordError()) {
                <p class="text-red-500 text-xs mt-1">{{ passwordError() }}</p>
              }
            </div>

            @if (isRegister() && !contracting()) {
              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-600 mb-2">Tipo de Conta</label>
                <div class="grid grid-cols-2 gap-3">
                  <button type="button" class="p-4 border-2 rounded-xl text-center transition-all"
                    [class]="selectedRole() === 'PSICOPEDAGOGO' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'"
                    (click)="selectedRole.set('PSICOPEDAGOGO')">
                    <span class="material-icons text-2xl mb-1">science</span>
                    <p class="text-xs font-bold">Profissional</p>
                  </button>
                  <button type="button" class="p-4 border-2 rounded-xl text-center transition-all"
                    [class]="selectedRole() === 'RESPONSAVEL' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'"
                    (click)="selectedRole.set('RESPONSAVEL')">
                    <span class="material-icons text-2xl mb-1">family_restroom</span>
                    <p class="text-xs font-bold">Responsável</p>
                  </button>
                </div>
              </div>
            }

            @if (isRegister() && selectedRole() !== 'RESPONSAVEL') {
              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-600 mb-2">Nome da Clínica</label>
                <input class="w-full px-4 py-3 border rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-all"
                  [class.border-red-300]="clinicNameError()" [class.border-slate-200]="!clinicNameError()"
                  type="text" [(ngModel)]="clinicName" name="clinicName" placeholder="Ex.: Clínica Florescer">
                @if (clinicNameError()) {
                  <p class="text-red-500 text-xs mt-1">{{ clinicNameError() }}</p>
                }
                <p class="text-xs text-slate-400 mt-1">Sua clínica terá 14 dias grátis, sem cartão.</p>
              </div>
            }

            <button class="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-[15px] font-bold transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
              type="submit" [disabled]="loading()">
              {{ loading() ? (isRegister() ? 'Criando conta...' : 'Entrando...') : (isRegister() ? 'Criar Conta' : 'Entrar') }}
            </button>

            @if (!isRegister()) {
              <div class="text-right mt-2">
                <button type="button" class="text-xs text-slate-400 hover:text-primary font-semibold" (click)="forgotPassword()">
                  Esqueceu sua senha?
                </button>
              </div>
            }
          </form>

          <!-- Divider -->
          <div class="flex items-center my-6">
            <div class="flex-1 border-b border-slate-200"></div>
            <span class="px-3 text-xs font-semibold text-slate-400 uppercase">ou</span>
            <div class="flex-1 border-b border-slate-200"></div>
          </div>

          <!-- Social Login -->
          <div class="space-y-3">
            <button class="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
              (click)="socialLogin('google')">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>
          </div>

          <!-- Toggle Mode -->
          <div class="text-center mt-6">
            <button class="text-sm text-primary font-semibold hover:underline"
              (click)="toggleMode()">
              {{ isRegister() ? 'Já tem conta? Entrar' : 'Não tem conta? Criar agora' }}
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
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  name = '';
  clinicName = '';
  loading = signal(false);
  error = signal('');
  success = signal('');
  isRegister = signal(false);
  selectedRole = signal('PSICOPEDAGOGO');
  selectedPlan = signal('');
  contracting = signal(false);
  needsVerification = signal(false);
  resending = signal(false);

  emailError = signal('');
  passwordError = signal('');
  nameError = signal('');
  clinicNameError = signal('');

  private route = inject(ActivatedRoute);

  constructor() {
    const mode = this.route.snapshot.queryParamMap.get('mode');
    const plan = this.route.snapshot.queryParamMap.get('plan');
    const type = this.route.snapshot.queryParamMap.get('type');
    if (mode === 'register') this.isRegister.set(true);
    if (plan) this.selectedPlan.set(plan);
    this.contracting.set(!!plan || type === 'professional');
    if (this.contracting()) this.selectedRole.set('PSICOPEDAGOGO');
  }

  toggleMode() {
    this.isRegister.set(!this.isRegister());
    this.error.set('');
    this.success.set('');
    this.needsVerification.set(false);
    this.clearErrors();
  }

  forgotPassword() {
    this.router.navigate(['/auth/recuperar-senha']);
  }

  clearErrors() {
    this.emailError.set('');
    this.passwordError.set('');
    this.nameError.set('');
    this.clinicNameError.set('');
  }

  validate(): boolean {
    this.clearErrors();
    let valid = true;

    if (!this.email) {
      this.emailError.set('Email é obrigatório');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError.set('Email inválido');
      valid = false;
    }

    if (!this.password) {
      this.passwordError.set('Senha é obrigatória');
      valid = false;
    } else if (this.isRegister() && this.password.length < 6) {
      this.passwordError.set('A senha deve ter pelo menos 6 caracteres');
      valid = false;
    }

    if (this.isRegister() && !this.name) {
      this.nameError.set('Nome é obrigatório');
      valid = false;
    }

    if (this.isRegister() && this.selectedRole() !== 'RESPONSAVEL' && !this.clinicName) {
      this.clinicNameError.set('Informe o nome da sua clínica');
      valid = false;
    }

    return valid;
  }

  onSubmit() {
    if (!this.validate()) return;

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    if (this.isRegister()) {
      this.register();
    } else {
      this.login();
    }
  }

  login() {
    fetch(`${environment.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.email, password: this.password })
    })
    .then(res => {
      if (!res.ok) return res.json().then(data => { throw new Error(data.error || 'Erro ao fazer login'); });
      return res.json();
    })
    .then(data => {
      this.auth.login(data.token, data.user, data.tenants, data.tenant);
      const tenants = this.auth.tenants();
      if (!tenants.length) {
        throw new Error('Sua conta não está vinculada a nenhuma clínica');
      }
      if (tenants.length > 1) {
        this.router.navigate(['/auth/select-clinic']);
        return;
      }
      const redirectPath = data.user?.role === 'RESPONSAVEL'
        ? '/guardian'
        : this.selectedPlan() ? '/app/plano' : '/app/dashboard';
      this.router.navigate([redirectPath]);
    })
    .catch(err => {
      this.error.set(err.message || 'Erro ao conectar com o servidor');
      this.needsVerification.set(err.message?.includes('não ativada') || false);
      this.loading.set(false);
    });
  }

  resendVerification() {
    this.resending.set(true);
    fetch(`${environment.apiUrl}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.email })
    })
    .then(res => res.json().then((data: any) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) throw new Error(data.error || 'Erro ao reenviar');
      this.error.set('');
      this.needsVerification.set(false);
      this.success.set('Link de ativação reenviado! Verifique seu email.');
      this.resending.set(false);
    })
    .catch(err => {
      this.error.set(err.message || 'Erro ao reenviar');
      this.resending.set(false);
    });
  }

register() {
    const isProfessional = this.selectedRole() !== 'RESPONSAVEL';
    const endpoint = isProfessional ? '/auth/register-clinic' : '/auth/register';
    const payload = isProfessional
      ? {
          name: this.name,
          email: this.email,
          password: this.password,
          clinicName: this.clinicName,
        }
      : {
          name: this.name,
          email: this.email,
          password: this.password,
          role: this.selectedRole()
        };

    fetch(`${environment.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) return res.json().then(data => { throw new Error(data.error || 'Erro ao cadastrar'); });
      return res.json();
    })
    .then(data => {
      if (data.needsVerification) {
        this.router.navigate(['/auth/verify'], { queryParams: { email: this.email } });
        return;
      }
      this.auth.login(data.token, data.user);
      const redirectPath = data.user?.role === 'RESPONSAVEL' ? '/guardian' : '/app/dashboard';
      this.router.navigate([redirectPath]);
    })
    .catch(err => {
      this.error.set(err.message || 'Erro ao conectar com o servidor');
      this.loading.set(false);
    });
  }

  socialLogin(provider: string) {
    if (provider === 'google') {
      window.location.href = `${environment.apiUrl}/auth/google`;
    } else {
      this.error.set(`Login com Microsoft será configurado em breve.`);
    }
  }
}
