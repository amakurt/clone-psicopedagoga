import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RastreioService } from '../services/rastreio.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-rastreios-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="header">
        <div><h1>Rastreios</h1><p class="subtitle">Triagens padronizadas com correção automática (TEA, TDAH, habilidades sociais)</p></div>
        <a routerLink="/app/rastreios/novo" class="btn btn-primary"><span class="material-icons">add</span> Novo rastreio</a>
      </div>

      <div class="filters">
        <input class="form-control" placeholder="Buscar por paciente..." [(ngModel)]="search" (ngModelChange)="applyFilters()" />
        <select class="form-control" [(ngModel)]="filterInstrument" (ngModelChange)="applyFilters()">
          <option value="">Todos os instrumentos</option>
          @for (i of instruments(); track i.code) { <option [value]="i.code">{{ i.name }}</option> }
        </select>
        <select class="form-control" [(ngModel)]="filterRisk" (ngModelChange)="applyFilters()">
          <option value="">Todos os riscos</option>
          <option value="ELEVADO">Risco elevado</option>
          <option value="ALTO">Risco alto</option>
          <option value="MODERADO">Risco moderado</option>
          <option value="BAIXO">Risco baixo</option>
        </select>
      </div>

      @if (loading()) {
        <div style="text-align:center;padding:40px;color:var(--gray-400)"><span class="material-icons" style="font-size:40px">hourglass_empty</span><p>Carregando...</p></div>
      } @else if (filtered().length === 0) {
        <div style="text-align:center;padding:40px;color:var(--gray-400)"><span class="material-icons" style="font-size:40px">fact_check</span><p>Nenhum rastreio encontrado</p></div>
      } @else {
        <div class="list">
          @for (r of filtered(); track r.id) {
            <div class="item">
              <div class="avatar" [style.background]="riskColor(r.riskLevel).bg">
                <span class="material-icons" style="color:white;font-size:20px">fact_check</span>
              </div>
              <div style="flex:1;min-width:0">
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                  <strong style="font-size:14px">{{ r.paciente?.name || '—' }}</strong>
                  <span class="chip" [style]="riskColor(r.riskLevel).style">{{ r.riskLevel }}</span>
                  @if (r.respondent) { <span style="font-size:11px;color:var(--gray-500)">{{ respondentLabel(r.respondent) }}</span> }
                </div>
                <p style="margin:4px 0 0;font-size:12px;color:var(--gray-500)">{{ instrumentName(r.instrument) }} · {{ r.assessedAt | date:'dd/MM/yyyy' }} · {{ r.profissional?.name || '—' }}</p>
                <p style="margin:4px 0 0;font-size:12px;color:var(--gray-600)" title="{{ r.summary }}">{{ (r.summary || '').slice(0, 110) }}{{ (r.summary || '').length > 110 ? '…' : '' }}</p>
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn btn-outline" style="padding:6px 10px" title="Editar" routerLink="/app/rastreios/novo" (click)="edit(r)"><span class="material-icons" style="font-size:16px">edit</span></button>
                <button class="btn btn-outline" style="padding:6px 10px;color:#DC2626;border-color:#FECACA" title="Excluir" (click)="remove(r)"><span class="material-icons" style="font-size:16px">delete</span></button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 900px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 24px; }
    .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; }
    .btn-primary { background: var(--primary); color: white; }
    .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); }
    .filters { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
    .form-control { padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px; }
    .filters .form-control:first-child { flex: 1; min-width: 200px; }
    .list { display: flex; flex-direction: column; gap: 10px; }
    .item { display: flex; align-items: center; gap: 12px; padding: 14px; background: var(--card-bg); border: 1px solid var(--gray-200); border-radius: var(--radius); }
    .avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .chip { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    select.form-control { appearance: auto; }
  `]
})
export class RastreiosListComponent implements OnInit {
  private service = inject(RastreioService);
  private toast = inject(ToastService);

  loading = signal(true);
  records = signal<any[]>([]);
  instruments = signal<any[]>([]);
  filtered = signal<any[]>([]);
  search = '';
  filterInstrument = '';
  filterRisk = '';

  ngOnInit() {
    this.service.instruments().subscribe((res: any) => this.instruments.set(res.data || []));
    this.load();
  }

  load() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (res: any) => { this.records.set(res.data || []); this.applyFilters(); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Erro ao carregar rastreios'); }
    });
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filtered.set(this.records().filter((r) => {
      const name = (r.paciente?.name || '').toLowerCase();
      const okName = !term || name.includes(term);
      const okInst = !this.filterInstrument || r.instrument === this.filterInstrument;
      const okRisk = !this.filterRisk || r.riskLevel === this.filterRisk;
      return okName && okInst && okRisk;
    }));
  }

  instrumentName(code: string): string {
    return this.instruments().find((i) => i.code === code)?.name || code;
  }

  respondentLabel(r: string): string {
    return ({ PAIS: 'Informante: pais', PROFESSOR: 'Informante: professor', AUTO: 'Autoavaliação', PROFISSIONAL: 'Profissional' } as any)[r] || r;
  }

  riskColor(risk: string): { bg: string; style: string } {
    const map: any = {
      BAIXO: { bg: '#059669', style: 'background:#D1FAE5;color:#065F46' },
      MODERADO: { bg: '#D97706', style: 'background:#FEF3C7;color:#92400E' },
      ELEVADO: { bg: '#DC2626', style: 'background:#FEE2E2;color:#991B1B' },
      ALTO: { bg: '#B91C1C', style: 'background:#FECACA;color:#7F1D1D' },
    };
    return map[risk] || { bg: '#64748B', style: 'background:#F1F5F9;color:#475569' };
  }

  edit(r: any) {
    const key = 'rastreio_edit';
    sessionStorage.setItem(key, JSON.stringify(r));
  }

  remove(r: any) {
    if (!confirm(`Excluir o rastreio de ${r.paciente?.name || '—'} (${new Date(r.assessedAt).toLocaleDateString('pt-BR')})?`)) return;
    this.service.delete(r.id).subscribe({
      next: () => { this.toast.success('Rastreio excluído'); this.load(); },
      error: () => this.toast.error('Erro ao excluir rastreio')
    });
  }
}