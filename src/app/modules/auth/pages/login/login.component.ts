import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-5">
      <div class="bg-white rounded-[20px] shadow-2xl w-full max-w-[420px] overflow-hidden legacy-card">
        <!-- Header -->
        <div class="p-10 pb-6 text-center">
          <img src="/web-app-manifest-192x192.png" alt="EduPsych Pro" class="size-16 mx-auto rounded-2xl shadow-lg shadow-primary/20 object-contain">
          <h1 class="mt-3 text-[26px] font-black text-slate-900">EduPsych Pro</h1>
          <p class="text-sm text-slate-500 mt-1">
            @if (step2FA()) {
              Verificação de Segurança em Duas Etapas
            } @else {
              {{ isRegister() ? 'Crie sua conta' : 'Acesse sua conta' }}
            }
          </p>
        </div>

        <!-- Error/Success -->
        @if (error()) {
          <div class="mx-10 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <span class="material-icons text-lg">error</span> {{ error() }}
          </div>
          @if (!step2FA() && needsVerification()) {
            <button class="mx-10 mb-4 w-[calc(100%-80px)] py-2 text-sm text-primary font-bold hover:underline"
              (click)="resendVerification()" [disabled]="resending()">
              {{ resending() ? 'Reenviando...' : 'Reenviar link de ativação' }}
            </button>
          }
        }
        @if (success()) {
          <div class="mx-10 mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
            <span class="material-icons text-lg">check_circle</span> {{ success() }}
          </div>
        }

        <!-- 2FA Verification Screen -->
        @if (step2FA()) {
          <div class="px-10 pb-10">
            <div class="p-4 bg-teal-50/80 border border-teal-100 rounded-2xl text-center mb-6">
              <div class="size-12 mx-auto rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 mb-2">
                <span class="material-icons text-2xl">
                  {{ twoFactorMethod() === 'TOTP' ? 'smartphone' : (twoFactorMethod() === 'WHATSAPP' ? 'chat' : 'mark_email_read') }}
                </span>
              </div>
              <h3 class="text-sm font-black text-slate-900">
                {{ twoFactorMethod() === 'TOTP' ? 'Google Authenticator' : (twoFactorMethod() === 'WHATSAPP' ? 'Código via WhatsApp' : 'Código via E-mail') }}
              </h3>
              <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                @if (twoFactorMethod() === 'TOTP') {
                  Abra o aplicativo <strong>Google Authenticator</strong> no seu celular e digite o código de 6 dígitos.
                } @else if (twoFactorMethod() === 'WHATSAPP') {
                  Enviamos o código para seu WhatsApp <strong>{{ twoFactorMaskedPhone() }}</strong>.
                } @else {
                  Enviamos o código para seu e-mail <strong>{{ twoFactorMaskedEmail() }}</strong>.
                }
              </p>
            </div>

            <form (ngSubmit)="verify2FA()">
              <div class="mb-5">
                <label class="block text-xs font-bold text-slate-600 text-center uppercase tracking-wider mb-2">
                  Código de 6 Dígitos
                </label>
                <input
                  class="w-full py-3.5 px-4 text-center text-3xl font-mono font-black tracking-[0.4em] bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-primary focus:bg-white transition-all shadow-inner placeholder-slate-300"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  maxlength="6"
                  [(ngModel)]="twoFactorCode"
                  name="twoFactorCode"
                  placeholder="000000"
                  autocomplete="one-time-code"
                  autofocus
                  (input)="on2FACodeInput($event)"
                />
                <div class="flex items-center justify-between mt-2.5 px-1">
                  <p class="text-[11px] text-slate-400">
                    ⏳ Expira em 10 min
                  </p>
                  <button
                    type="button"
                    (click)="pasteCodeFromClipboard()"
                    class="text-[11px] font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                    title="Colar código copiado">
                    <span class="material-icons text-xs">content_paste</span>
                    <span>Colar Código</span>
                  </button>
                </div>
              </div>

              <button
                class="w-full py-3.5 bg-primary hover:bg-primary-dark text-on-primary rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
                type="submit"
                [disabled]="loading() || !twoFactorCode || twoFactorCode.length < 6">
                @if (loading()) {
                  <span class="material-icons text-base animate-spin">refresh</span>
                  <span>Validando código...</span>
                } @else {
                  <span class="material-icons text-base">verified_user</span>
                  <span>Confirmar e Entrar</span>
                }
              </button>
            </form>

            <!-- Reenvio e Canais Alternativos -->
            <div class="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500">Não recebeu o código?</span>
                <button
                  type="button"
                  class="font-bold text-primary hover:underline disabled:opacity-50"
                  (click)="resend2FA('EMAIL')"
                  [disabled]="resending2FA()">
                  {{ resending2FA() ? 'Reenviando...' : 'Reenviar por E-mail' }}
                </button>
              </div>

              @if (hasWhatsApp()) {
                <div class="flex items-center justify-between text-xs pt-1">
                  <span class="text-slate-500">Prefere pelo WhatsApp?</span>
                  <button
                    type="button"
                    class="font-bold text-emerald-600 hover:underline disabled:opacity-50 flex items-center gap-1"
                    (click)="resend2FA('WHATSAPP')"
                    [disabled]="resending2FA()">
                    <span class="material-icons text-sm">chat</span>
                    <span>Receber no WhatsApp</span>
                  </button>
                </div>
              }

              <div class="text-center pt-3">
                <button
                  type="button"
                  class="text-xs text-slate-400 hover:text-slate-600 font-semibold flex items-center justify-center gap-1 mx-auto"
                  (click)="cancel2FA()">
                  <span class="material-icons text-sm">arrow_back</span>
                  <span>Voltar e usar outra conta</span>
                </button>
              </div>
            </div>
          </div>
        } @else {
          <!-- Form Normal de Login / Cadastro -->
          <div class="px-10 pb-10">
          @if (isRegister() && selectedRole() !== 'RESPONSAVEL') {
            <div class="mb-5 p-3.5 bg-primary/5 border border-primary/20 rounded-xl text-sm text-slate-700 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span class="material-icons text-lg">workspace_premium</span>
                </div>
                <div>
                  <p class="font-bold text-[11px] text-primary uppercase tracking-wider">Plano Selecionado</p>
                  @if (selectedPlan() === 'TRIAL') {
                    <p class="text-xs text-slate-800 font-semibold">7 Dias de Degustação Gratuita</p>
                  } @else if (selectedPlan()) {
                    <p class="text-xs text-slate-800 font-semibold">Plano {{ selectedPlan() }}</p>
                  } @else {
                    <p class="text-xs text-slate-800 font-semibold">7 Dias de Degustação Gratuita</p>
                  }
                </div>
              </div>
              <a routerLink="/" fragment="planos" class="text-xs font-bold text-primary hover:underline shrink-0">
                Trocar plano
              </a>
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
                type="email" [(ngModel)]="email" name="email" placeholder="seu@email.com" autocomplete="email" autocapitalize="none" autocorrect="off">
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
                <p class="text-xs text-slate-500 mt-1">Sua clínica terá acesso completo a todas as ferramentas clínicas.</p>
              </div>
            }

            <button class="w-full py-3 bg-primary hover:bg-primary-dark text-on-primary rounded-xl text-[15px] font-bold transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
              type="submit" [disabled]="loading()">
              {{ loading() ? (isRegister() ? 'Criando conta...' : 'Entrando...') : (isRegister() ? 'Criar Conta' : 'Entrar') }}
            </button>

            @if (!isRegister()) {
              <div class="text-right mt-2">
                <button type="button" class="text-xs text-slate-500 hover:text-primary font-semibold" (click)="forgotPassword()">
                  Esqueceu sua senha?
                </button>
              </div>
            }
          </form>

          <!-- Divider -->
          <div class="flex items-center my-6">
            <div class="flex-1 border-b border-slate-200"></div>
            <span class="px-3 text-xs font-semibold text-slate-500 uppercase">ou</span>
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
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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

  // 2FA Signals & State
  step2FA = signal(false);
  temp2FAToken = signal('');
  twoFactorMethod = signal<'EMAIL' | 'WHATSAPP' | 'TOTP'>('EMAIL');
  twoFactorMaskedEmail = signal('');
  twoFactorMaskedPhone = signal('');
  hasWhatsApp = signal(false);
  twoFactorCode = '';
  resending2FA = signal(false);

  emailError = signal('');
  passwordError = signal('');
  nameError = signal('');
  clinicNameError = signal('');

  private bc?: BroadcastChannel;
  private storageHandler = (ev: StorageEvent) => {
    if (ev.key === 'edupsych_2fa_code' && ev.newValue) {
      const digits = String(ev.newValue).replace(/\D/g, '').slice(0, 6);
      if (digits.length === 6 && this.step2FA() && !this.loading()) {
        this.twoFactorCode = digits;
        this.verify2FA();
      }
    }
  };

  constructor() {
    if (this.auth.token) {
      if (this.auth.user()?.role === 'SUPERADMIN') {
        this.router.navigate(['/master']);
      } else {
        this.router.navigate(['/app/dashboard']);
      }
      return;
    }
    const mode = this.route.snapshot.queryParamMap.get('mode');
    const plan = this.route.snapshot.queryParamMap.get('plan');
    const type = this.route.snapshot.queryParamMap.get('type');
    if (mode === 'register') this.isRegister.set(true);
    if (plan) {
      this.selectedPlan.set(plan);
    } else if (mode === 'register') {
      this.selectedPlan.set('TRIAL');
    }
    this.contracting.set(!!plan || type === 'professional');
    if (this.contracting()) this.selectedRole.set('PSICOPEDAGOGO');
  }

  ngOnInit() {
    // 1. Preenchimento automático caso abra a página com ?c= ou ?code=
    this.route.queryParams.subscribe((params) => {
      const c = params['code'] || params['c'];
      if (c) {
        const digits = String(c).replace(/\D/g, '').slice(0, 6);
        if (digits.length === 6) {
          this.twoFactorCode = digits;
          if (this.step2FA() && !this.loading()) {
            this.verify2FA();
          }
        }
      }
    });

    // 2. Ouvir BroadcastChannel transmitido pela tela de cópia em 1 clique (/copiar.html)
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.bc = new BroadcastChannel('edupsych_2fa');
          this.bc.onmessage = (ev) => {
            if (ev?.data?.code) {
              const digits = String(ev.data.code).replace(/\D/g, '').slice(0, 6);
              if (digits.length === 6 && this.step2FA() && !this.loading()) {
                this.twoFactorCode = digits;
                this.verify2FA();
              }
            }
          };
        }
      } catch (e) {}

      window.addEventListener('storage', this.storageHandler);
    }
  }

  ngOnDestroy() {
    this.bc?.close();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageHandler);
    }
  }

  async pasteCodeFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      const digits = String(text || '').replace(/\D/g, '').slice(0, 6);
      if (digits.length === 6) {
        this.twoFactorCode = digits;
        if (!this.loading()) {
          this.verify2FA();
        }
      } else if (digits.length > 0) {
        this.twoFactorCode = digits;
      } else {
        this.error.set('Nenhum código de 6 dígitos encontrado na área de transferência.');
      }
    } catch (err) {
      this.error.set('Cole o código usando Ctrl+V ou Cmd+V.');
    }
  }

  toggleMode() {
    this.isRegister.set(!this.isRegister());
    this.error.set('');
    this.success.set('');
    this.needsVerification.set(false);
    this.step2FA.set(false);
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
      body: JSON.stringify({ email: this.email.trim(), password: this.password })
    })
    .then(async res => {
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        if (!res.ok) {
          throw new Error(res.status === 502 || res.status === 503
            ? 'O servidor backend está reiniciando ou temporariamente indisponível. Tente novamente em instantes.'
            : `Erro no servidor (${res.status}).`);
        }
      }
      if (!res.ok) throw new Error(data.error || 'Credenciais inválidas ou erro ao fazer login');
      return data;
    })
    .then(data => {
      if (data.require2FA) {
        this.step2FA.set(true);
        this.temp2FAToken.set(data.tempToken);
        this.twoFactorMethod.set(data.twoFactorMethod || 'EMAIL');
        this.twoFactorMaskedEmail.set(data.maskedEmail || '');
        this.twoFactorMaskedPhone.set(data.maskedPhone || '');
        this.hasWhatsApp.set(!!data.hasWhatsApp);
        this.twoFactorCode = '';
        this.loading.set(false);
        return;
      }
      this.finishLogin(data);
    })
    .catch(err => {
      this.error.set(err.message || 'Erro ao conectar com o servidor');
      this.needsVerification.set(err.message?.includes('não ativada') || false);
      this.loading.set(false);
    });
  }

  finishLogin(data: any) {
    this.auth.login(data.token, data.user, data.tenants, data.tenant);
    if (data.user?.role === 'SUPERADMIN') {
      this.router.navigate(['/master']);
      return;
    }
    const tenants = this.auth.tenants();
    if (!tenants || !tenants.length) {
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
  }

  on2FACodeInput(event: any) {
    const val = event?.target?.value || this.twoFactorCode;
    const digits = String(val).replace(/\D/g, '').slice(0, 6);
    this.twoFactorCode = digits;
    if (digits.length === 6 && !this.loading()) {
      this.verify2FA();
    }
  }

  verify2FA() {
    const code = String(this.twoFactorCode).trim().replace(/\D/g, '');
    if (!code || code.length < 6) {
      this.error.set('Por favor, digite o código de 6 dígitos.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    fetch(`${environment.apiUrl}/auth/2fa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tempToken: this.temp2FAToken(),
        code: code
      })
    })
    .then(async res => {
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        if (!res.ok) throw new Error(`Erro no servidor (${res.status})`);
      }
      if (!res.ok) throw new Error(data.error || 'Código incorreto ou expirado.');
      return data;
    })
    .then(data => {
      this.finishLogin(data);
    })
    .catch(err => {
      this.error.set(err.message || 'Código inválido. Tente novamente.');
      this.loading.set(false);
    });
  }

  resend2FA(channel: 'EMAIL' | 'WHATSAPP') {
    this.resending2FA.set(true);
    this.error.set('');
    this.success.set('');

    fetch(`${environment.apiUrl}/auth/2fa/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tempToken: this.temp2FAToken(),
        channel
      })
    })
    .then(async res => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Falha ao reenviar código');
      return data;
    })
    .then(data => {
      this.twoFactorMethod.set(channel);
      this.success.set(data.message || (channel === 'WHATSAPP' ? 'Código reenviado via WhatsApp!' : 'Código reenviado para seu e-mail!'));
      this.resending2FA.set(false);
    })
    .catch(err => {
      this.error.set(err.message || 'Erro ao reenviar');
      this.resending2FA.set(false);
    });
  }

  cancel2FA() {
    this.step2FA.set(false);
    this.temp2FAToken.set('');
    this.twoFactorCode = '';
    this.error.set('');
    this.success.set('');
    this.loading.set(false);
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
          plan: this.selectedPlan() || 'TRIAL',
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
    .then(async res => {
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        if (!res.ok) {
          throw new Error(res.status === 502 || res.status === 503
            ? 'O servidor backend está reiniciando ou temporariamente indisponível. Tente novamente em instantes.'
            : `Erro no servidor (${res.status}).`);
        }
      }
      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar');
      return data;
    })
    .then(data => {
      this.auth.login(data.token, data.user, data.tenants, data.tenant);
      const isPaidPlanPending = this.selectedPlan() && this.selectedPlan() !== 'TRIAL';
      const redirectPath = data.user?.role === 'RESPONSAVEL'
        ? '/guardian'
        : (isPaidPlanPending ? '/app/plano' : '/app/dashboard');
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
