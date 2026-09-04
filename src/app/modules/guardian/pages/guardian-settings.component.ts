import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuardianService } from '../services/guardian.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/components/toast.component';
import { applyAccentColor } from '@core/utils/theme';

@Component({
  selector: 'app-guardian-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 sm:space-y-6 max-w-2xl">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="size-11 sm:size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <span class="material-icons text-primary text-2xl">settings</span>
        </div>
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Configurações da Conta</h2>
          <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Gerencie seus dados, aparência e segurança</p>
        </div>
      </div>

      <!-- Theme & Appearance -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
        <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="material-icons text-primary">palette</span> Tema e Aparência
        </h3>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-5">Escolha o modo de visualização e cor de destaque do seu aplicativo</p>

        <!-- Theme Selector Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          @for (theme of themes; track theme.id) {
            <button class="relative flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl ring-2 transition-all hover:scale-[1.02] text-left"
              [class]="currentTheme() === theme.id
                ? 'ring-primary bg-primary/5 shadow-md shadow-primary/10'
                : 'ring-gray-200 dark:ring-slate-700 hover:ring-gray-300 dark:hover:ring-slate-600 bg-gray-50 dark:bg-slate-900/50'"
              (click)="setTheme(theme.id)">
              @if (currentTheme() === theme.id) {
                <div class="absolute top-2.5 right-2.5">
                  <span class="material-icons text-primary text-base">check_circle</span>
                </div>
              }
              <div class="size-12 rounded-2xl flex items-center justify-center transition-colors"
                [class]="currentTheme() === theme.id ? 'bg-primary/10 text-primary' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'">
                <span class="material-icons text-2xl">{{ theme.icon }}</span>
              </div>
              <div class="text-center">
                <p class="font-bold text-sm"
                  [class]="currentTheme() === theme.id ? 'text-primary' : 'text-gray-900 dark:text-white'">
                  {{ theme.label }}
                </p>
                <p class="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">{{ theme.description }}</p>
              </div>
            </button>
          }
        </div>

        <!-- Accent Colors -->
        <div class="pt-5 border-t border-gray-100 dark:border-slate-700">
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">Cor de Destaque</label>
          <div class="flex flex-wrap gap-3">
            <button class="size-9 sm:size-10 rounded-full ring-2 ring-offset-2 transition-all hover:scale-110 active:scale-95"
              style="background: #4f46e5"
              title="Índigo"
              [class]="accentColor() === '#4f46e5' ? 'ring-indigo-500 ring-offset-white dark:ring-offset-slate-800' : 'ring-transparent'"
              (click)="setAccentColor('#4f46e5')"></button>
            <button class="size-9 sm:size-10 rounded-full ring-2 ring-offset-2 transition-all hover:scale-110 active:scale-95"
              style="background: #6d28d9"
              title="Violeta"
              [class]="accentColor() === '#6d28d9' ? 'ring-violet-500 ring-offset-white dark:ring-offset-slate-800' : 'ring-transparent'"
              (click)="setAccentColor('#6d28d9')"></button>
            <button class="size-9 sm:size-10 rounded-full ring-2 ring-offset-2 transition-all hover:scale-110 active:scale-95"
              style="background: #be185d"
              title="Rosa"
              [class]="accentColor() === '#be185d' ? 'ring-pink-500 ring-offset-white dark:ring-offset-slate-800' : 'ring-transparent'"
              (click)="setAccentColor('#be185d')"></button>
            <button class="size-9 sm:size-10 rounded-full ring-2 ring-offset-2 transition-all hover:scale-110 active:scale-95"
              style="background: #047857"
              title="Esmeralda"
              [class]="accentColor() === '#047857' ? 'ring-emerald-500 ring-offset-white dark:ring-offset-slate-800' : 'ring-transparent'"
              (click)="setAccentColor('#047857')"></button>
            <button class="size-9 sm:size-10 rounded-full ring-2 ring-offset-2 transition-all hover:scale-110 active:scale-95"
              style="background: #b45309"
              title="Âmbar"
              [class]="accentColor() === '#b45309' ? 'ring-amber-500 ring-offset-white dark:ring-offset-slate-800' : 'ring-transparent'"
              (click)="setAccentColor('#b45309')"></button>
            <button class="size-9 sm:size-10 rounded-full ring-2 ring-offset-2 transition-all hover:scale-110 active:scale-95"
              style="background: #b91c1c"
              title="Vermelho"
              [class]="accentColor() === '#b91c1c' ? 'ring-red-500 ring-offset-white dark:ring-offset-slate-800' : 'ring-transparent'"
              (click)="setAccentColor('#b91c1c')"></button>
          </div>
        </div>

        <div class="mt-6 pt-5 border-t border-gray-100 dark:border-slate-700 flex justify-end">
          <button (click)="saveAppearance()" 
            class="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-md shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2">
            <span class="material-icons text-[18px]">done</span> Salvar Aparência
          </button>
        </div>
      </div>

      <!-- Profile -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
        <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span class="material-icons text-primary">person</span> Dados Pessoais
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Seu Nome Completo</label>
            <input [(ngModel)]="name" class="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">E-mail Cadastrado</label>
            <input [value]="email()" disabled class="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl bg-gray-50 dark:bg-slate-900/50 text-gray-400 dark:text-slate-500 text-sm cursor-not-allowed">
          </div>
          <button (click)="updateProfile()" [disabled]="saving() || !name.trim()" 
            class="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-md shadow-primary/20 disabled:opacity-50 transition-all active:scale-95">
            {{ saving() ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
          @if (saveSuccess()) {
            <p class="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
              <span class="material-icons text-[16px]">check_circle</span> {{ saveSuccess() }}
            </p>
          }
        </div>
      </div>

      <!-- Change Password -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
        <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span class="material-icons text-primary">lock</span> Alterar Senha
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Senha Atual</label>
            <input [(ngModel)]="currentPassword" type="password" class="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Nova Senha</label>
              <input [(ngModel)]="newPassword" type="password" class="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Confirmar Nova Senha</label>
              <input [(ngModel)]="confirmPassword" type="password" class="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
          </div>
          @if (passwordError()) {
            <p class="text-red-500 text-xs font-semibold">{{ passwordError() }}</p>
          }
          <button (click)="changePassword()" [disabled]="changingPassword()" 
            class="w-full sm:w-auto px-6 py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-2xl font-bold text-sm disabled:opacity-50 transition-all active:scale-95">
            {{ changingPassword() ? 'Alterando senha...' : 'Atualizar Senha' }}
          </button>
        </div>
      </div>

      <!-- About -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div>
          <h4 class="text-sm font-bold text-gray-900 dark:text-white">EduPsych Pro — Portal da Família</h4>
          <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Ambiente seguro com criptografia e isolamento de dados.</p>
        </div>
        <span class="px-2.5 py-1 bg-primary/10 text-primary text-xs font-black rounded-full">v1.0.0</span>
      </div>
    </div>
  `
})
export class GuardianSettingsComponent implements OnInit {
  private guardianService = inject(GuardianService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  themes = [
    { id: 'light', label: 'Claro', icon: 'light_mode', description: 'Tema claro para ambientes iluminados' },
    { id: 'dark', label: 'Escuro', icon: 'dark_mode', description: 'Tema escuro para conforto visual' },
    { id: 'system', label: 'Sistema', icon: 'contrast', description: 'Segue o modo padrão do dispositivo' },
  ];

  currentTheme = signal(localStorage.getItem('theme') || 'system');
  accentColor = signal(localStorage.getItem('accentColor') || '#4f46e5');

  name = '';
  email = signal('');
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  saving = signal(false);
  saveSuccess = signal('');
  changingPassword = signal(false);
  passwordError = signal('');

  ngOnInit() {
    const user = this.auth.user();
    if (user) {
      this.name = user.name;
      this.email.set(user.email);
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
      this.applyTheme(savedTheme);
    }

    const savedColor = localStorage.getItem('accentColor');
    if (savedColor) {
      this.accentColor.set(savedColor);
      applyAccentColor(savedColor);
    }
  }

  setTheme(themeId: string) {
    this.currentTheme.set(themeId);
    this.applyTheme(themeId);
  }

  applyTheme(theme: string) {
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      html.classList.add(theme);
    }
  }

  setAccentColor(color: string) {
    this.accentColor.set(color);
    applyAccentColor(color);
  }

  saveAppearance() {
    localStorage.setItem('theme', this.currentTheme());
    localStorage.setItem('accentColor', this.accentColor());
    this.toast.success('Preferências de aparência salvas com sucesso!');
  }

  updateProfile() {
    if (!this.name.trim()) return;
    this.saving.set(true);
    this.saveSuccess.set('');

    this.guardianService.updateProfile(this.name).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set('Perfil atualizado com sucesso!');
        this.toast.success('Perfil atualizado com sucesso!');
        const user = this.auth.user();
        if (user) {
          user.name = this.name;
          this.auth.updateUser({ name: this.name });
        }
      },
      error: () => this.saving.set(false)
    });
  }

  changePassword() {
    this.passwordError.set('');

    if (!this.currentPassword || !this.newPassword) {
      this.passwordError.set('Preencha todos os campos');
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError.set('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('As senhas não conferem');
      return;
    }

    this.changingPassword.set(true);
    this.guardianService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.saveSuccess.set('Senha alterada com sucesso!');
        this.toast.success('Senha alterada com sucesso!');
      },
      error: (err: any) => {
        this.changingPassword.set(false);
        this.passwordError.set(err.error?.error || 'Erro ao alterar senha');
        this.toast.error(err.error?.error || 'Erro ao alterar senha');
      }
    });
  }
}
