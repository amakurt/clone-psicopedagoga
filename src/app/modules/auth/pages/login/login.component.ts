import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

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
        }
        @if (success()) {
          <div class="mx-10 mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm flex items-center gap-2">
            <span class="material-icons text-lg">check_circle</span> {{ success() }}
          </div>
        }

        <!-- Form -->
        <div class="px-10 pb-10">
          <form (ngSubmit)="onSubmit()">
            @if (isRegister()) {
              <div class="mb-5">
                <label class="block text-sm font-semibold text-slate-600 mb-2">Nome Completo</label>
                <input class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                  type="text" [(ngModel)]="name" name="name" placeholder="Seu nome completo">
              </div>
            }

            <div class="mb-5">
              <label class="block text-sm font-semibold text-slate-600 mb-2">Email</label>
              <input class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                type="email" [(ngModel)]="email" name="email" placeholder="seu@email.com" autocomplete="off">
            </div>

            <div class="mb-5">
              <label class="block text-sm font-semibold text-slate-600 mb-2">Senha</label>
              <input class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                type="password" [(ngModel)]="password" name="password" placeholder="Sua senha" autocomplete="new-password">
            </div>

            @if (isRegister()) {
              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-600 mb-2">Tipo de Conta</label>
                <div class="grid grid-cols-2 gap-3">
                  <button type="button" class="p-4 border-2 rounded-xl text-center transition-all"
                    [class]="selectedRole() === 'PROFISSIONAL' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'"
                    (click)="selectedRole.set('PROFISSIONAL')">
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

            <button class="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-[15px] font-bold transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
              type="submit" [disabled]="loading()">
              {{ loading() ? (isRegister() ? 'Criando conta...' : 'Entrando...') : (isRegister() ? 'Criar Conta' : 'Entrar') }}
            </button>
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
            <button class="w-full py-3 bg-[#0078D4] rounded-xl text-sm font-semibold text-white hover:bg-[#006CBE] transition-all flex items-center justify-center gap-3"
              (click)="socialLogin('azure')">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M11.4 2L2 11.4V22h7.6V14h4.8v8H22V11.4L11.4 2z"/>
              </svg>
              Continuar com Microsoft
            </button>
          </div>

          <!-- Toggle Mode -->
          <div class="text-center mt-6">
            <button class="text-sm text-primary font-semibold hover:underline"
              (click)="isRegister.set(!isRegister())">
              {{ isRegister() ? 'Já tem conta? Entrar' : 'Não tem conta? Criar agora' }}
            </button>
          </div>

          <!-- Help -->
          <div class="text-center mt-6 text-xs text-slate-400 leading-relaxed">
            <p>Use o email <strong class="text-primary">sarah&#64;edupsych.com</strong> para testar</p>
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
  loading = signal(false);
  error = signal('');
  success = signal('');
  isRegister = signal(false);
  selectedRole = signal('PROFISSIONAL');

  onSubmit() {
    if (!this.email) {
      this.error.set('Informe o email');
      return;
    }
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
    const url = 'http://localhost:3000/api/auth/login';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.email, password: this.password })
    })
    .then(res => {
      if (!res.ok) return res.json().then(data => { throw new Error(data.error || 'Erro ao fazer login'); });
      return res.json();
    })
    .then(data => {
      this.auth.login(data.token, data.user);
      this.router.navigate(['/dashboard']);
    })
    .catch(err => {
      this.error.set(err.message || 'Erro ao conectar com o servidor');
      this.loading.set(false);
    });
  }

  register() {
    const url = 'http://localhost:3000/api/auth/register';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: this.name || this.email.split('@')[0],
        email: this.email,
        role: this.selectedRole()
      })
    })
    .then(res => {
      if (!res.ok) return res.json().then(data => { throw new Error(data.error || 'Erro ao cadastrar'); });
      return res.json();
    })
    .then(() => {
      this.success.set('Conta criada! Fazendo login...');
      setTimeout(() => {
        this.isRegister.set(false);
        this.login();
      }, 1000);
    })
    .catch(err => {
      this.error.set(err.message || 'Erro ao conectar com o servidor');
      this.loading.set(false);
    });
  }

  socialLogin(provider: string) {
    this.error.set(`Login com ${provider === 'google' ? 'Google' : 'Microsoft'} será configurado em breve.`);
  }
}
