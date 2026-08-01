import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1>Dashboard</h1>
      <p class="subtitle">Visão geral do sistema</p>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="material-icons stat-icon">people</span>
          <div><span class="stat-value">{{ stats()?.totalPacientes || 0 }}</span><span class="stat-label">Pacientes Ativos</span></div>
        </div>
        <div class="stat-card">
          <span class="material-icons stat-icon">event</span>
          <div><span class="stat-value">{{ stats()?.totalSessoes || 0 }}</span><span class="stat-label">Sessões</span></div>
        </div>
        <div class="stat-card">
          <span class="material-icons stat-icon">assignment</span>
          <div><span class="stat-value">{{ stats()?.totalLaudos || 0 }}</span><span class="stat-label">Laudos</span></div>
        </div>
        <div class="stat-card">
          <span class="material-icons stat-icon">forward_to_inbox</span>
          <div><span class="stat-value">{{ stats()?.totalEncaminhamentos || 0 }}</span><span class="stat-label">Encaminhamentos</span></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; }
    h1 { margin: 0; font-size: 24px; }
    .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    .stat-card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); padding: 24px; display: flex; align-items: center; gap: 16px; }
    .stat-icon { font-size: 40px; color: var(--primary); }
    .stat-value { display: block; font-size: 28px; font-weight: 700; color: var(--gray-900); }
    .stat-label { font-size: 13px; color: var(--gray-500); }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  stats = signal<any>({});
  ngOnInit() { this.api.get('/dashboard').subscribe((res: any) => this.stats.set(res)); }
}
