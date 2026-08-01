import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <span class="material-icons logo-icon">psychology</span>
          <span class="logo-text">Psicopedagoga</span>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item"><span class="material-icons">dashboard</span><span>Dashboard</span></a>
          <a routerLink="/pacientes" routerLinkActive="active" class="nav-item"><span class="material-icons">people</span><span>Pacientes</span></a>
          <a routerLink="/anamnese" routerLinkActive="active" class="nav-item"><span class="material-icons">description</span><span>Anamnese</span></a>
          <a routerLink="/sessoes" routerLinkActive="active" class="nav-item"><span class="material-icons">event</span><span>Sessões</span></a>
          <a routerLink="/laudos" routerLinkActive="active" class="nav-item"><span class="material-icons">assignment</span><span>Laudos</span></a>
          <a routerLink="/encaminhamentos" routerLinkActive="active" class="nav-item"><span class="material-icons">forward_to_inbox</span><span>Encaminhamentos</span></a>
          <a routerLink="/comunicacao" routerLinkActive="active" class="nav-item"><span class="material-icons">chat</span><span>Comunicação</span></a>
          <a routerLink="/financeiro" routerLinkActive="active" class="nav-item"><span class="material-icons">payments</span><span>Financeiro</span></a>
          <a routerLink="/configuracoes" routerLinkActive="active" class="nav-item"><span class="material-icons">settings</span><span>Configurações</span></a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <span class="material-icons">account_circle</span>
            <span>{{ auth.user()?.name || 'Usuário' }}</span>
          </div>
          <button class="logout-btn" (click)="auth.logout()"><span class="material-icons">logout</span></button>
        </div>
      </aside>
      <main class="main-content"><router-outlet /></main>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; }
    .sidebar { width: 260px; background: var(--sidebar-bg); color: var(--sidebar-text); display: flex; flex-direction: column; position: fixed; height: 100vh; }
    .sidebar-header { display: flex; align-items: center; gap: 12px; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .logo-icon { font-size: 28px; color: var(--primary); }
    .logo-text { font-size: 18px; font-weight: 600; color: white; }
    .sidebar-nav { flex: 1; padding: 12px; overflow-y: auto; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--radius); color: var(--sidebar-text); text-decoration: none; transition: all 0.15s; margin-bottom: 2px; }
    .nav-item:hover { background: rgba(255,255,255,0.1); }
    .nav-item.active { background: var(--sidebar-active); color: white; }
    .nav-item .material-icons { font-size: 20px; }
    .sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; }
    .user-info { display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .logout-btn { background: none; border: none; color: var(--sidebar-text); cursor: pointer; padding: 4px; border-radius: 4px; }
    .logout-btn:hover { background: rgba(255,255,255,0.1); }
    .main-content { margin-left: 260px; flex: 1; padding: 24px; }
  `]
})
export class MainLayoutComponent {
  auth = inject(AuthService);
}
