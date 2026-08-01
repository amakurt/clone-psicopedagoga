import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <span class="material-icons logo">psychology</span>
          <h1>Psicopedagoga</h1>
          <p>Acesse sua conta</p>
        </div>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input class="form-control" type="email" [(ngModel)]="email" name="email" placeholder="seu@email.com">
          </div>
          <div class="form-group">
            <label>Senha</label>
            <input class="form-control" type="password" [(ngModel)]="password" name="password" placeholder="Sua senha">
          </div>
          @if (error()) { <div class="error-msg">{{ error() }}</div> }
          <button class="btn btn-primary btn-block" type="submit" [disabled]="loading()">
            {{ loading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #1E1B4B 0%, #7C3AED 100%); }
    .login-card { background: white; border-radius: 12px; padding: 40px; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .login-header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 48px; color: var(--primary); }
    .login-header h1 { margin: 8px 0 4px; font-size: 24px; color: var(--gray-900); }
    .login-header p { color: var(--gray-500); font-size: 14px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--gray-700); margin-bottom: 4px; }
    .form-control { padding: 10px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px; width: 100%; outline: none; }
    .form-control:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
    .btn-block { width: 100%; justify-content: center; padding: 10px; }
    .error-msg { color: var(--danger); font-size: 13px; margin-bottom: 12px; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.api.post('/auth/login', { email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.auth.login(res.token, res.user);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Erro ao fazer login');
        this.loading.set(false);
      }
    });
  }
}
