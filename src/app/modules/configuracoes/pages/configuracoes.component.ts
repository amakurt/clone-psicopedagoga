import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="header"><h1>Configurações</h1><p class="subtitle">Gerenciar sistema</p></div>
      <div class="card"><div class="card-body">
        <div class="config-grid">
          <a class="config-item" routerLink="/pacientes">
            <span class="material-icons">people</span>
            <strong>Pacientes</strong>
            <span>Gerenciar cadastros</span>
          </a>
          <div class="config-item" (click)="auth.logout()">
            <span class="material-icons">logout</span>
            <strong>Sair do Sistema</strong>
            <span>Encerrar sessão</span>
          </div>
        </div>
      </div></div>
    </div>
  `,
  styles: [`.page { max-width: 900px; } .header { margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 24px; } .config-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; } .config-item { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px; border: 1px solid var(--gray-200); border-radius: var(--radius); text-decoration: none; color: var(--gray-700); cursor: pointer; text-align: center; transition: all 0.15s; } .config-item:hover { border-color: var(--primary); background: var(--primary-light); } .config-item .material-icons { font-size: 32px; color: var(--primary); } .config-item strong { font-size: 14px; } .config-item span { font-size: 12px; color: var(--gray-500); }`]
})
export class ConfiguracoesComponent {
  auth = inject(AuthService);
}
