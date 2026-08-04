import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuardianService } from '../services/guardian.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-guardian-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 max-w-2xl">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h2>
        <p class="text-gray-500 dark:text-slate-400 mt-1">Gerenciar seu perfil</p>
      </div>

      <!-- Profile -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Perfil</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nome</label>
            <input [(ngModel)]="name" class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
            <input [value]="email()" disabled class="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
          </div>
          <button (click)="updateProfile()" [disabled]="saving()" 
            class="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold disabled:opacity-50 transition-all">
            {{ saving() ? 'Salvando...' : 'Salvar' }}
          </button>
          @if (saveSuccess()) {
            <p class="text-green-600 text-sm">{{ saveSuccess() }}</p>
          }
        </div>
      </div>

      <!-- Change Password -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alterar Senha</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Senha Atual</label>
            <input [(ngModel)]="currentPassword" type="password" class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nova Senha</label>
            <input [(ngModel)]="newPassword" type="password" class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Confirmar Nova Senha</label>
            <input [(ngModel)]="confirmPassword" type="password" class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
          @if (passwordError()) {
            <p class="text-red-500 text-sm">{{ passwordError() }}</p>
          }
          <button (click)="changePassword()" [disabled]="changingPassword()" 
            class="px-6 py-3 bg-gray-800 dark:bg-slate-600 hover:bg-gray-900 dark:hover:bg-slate-500 text-white rounded-xl font-semibold disabled:opacity-50 transition-all">
            {{ changingPassword() ? 'Alterando...' : 'Alterar Senha' }}
          </button>
        </div>
      </div>

      <!-- About -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sobre</h3>
        <p class="text-sm text-gray-500 dark:text-slate-400">EduPsych Pro - Portal da Família</p>
        <p class="text-sm text-gray-500 dark:text-slate-400">Versão 1.0.0</p>
      </div>
    </div>
  `
})
export class GuardianSettingsComponent implements OnInit {
  private guardianService = inject(GuardianService);
  private auth = inject(AuthService);

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
  }

  updateProfile() {
    if (!this.name.trim()) return;
    this.saving.set(true);
    this.saveSuccess.set('');

    this.guardianService.updateProfile(this.name).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set('Perfil atualizado com sucesso!');
        const user = this.auth.user();
        if (user) {
          user.name = this.name;
          localStorage.setItem('auth_user', JSON.stringify(user));
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
      },
      error: (err: any) => {
        this.changingPassword.set(false);
        this.passwordError.set(err.error?.error || 'Erro ao alterar senha');
      }
    });
  }
}
