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
    <div class="space-y-6 sm:space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Rastreios e Triagens</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Triagens padronizadas com correção automática (TEA, TDAH, habilidades sociais)</p>
        </div>
        <a routerLink="/app/rastreios/novo" 
          class="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 self-start sm:self-auto">
          <span class="material-icons text-[18px]">add</span>
          <span>Novo Rastreio</span>
        </a>
      </div>

      <!-- Filtros Responsivos -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="relative group sm:col-span-2 lg:col-span-1">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
          <input type="text" class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary shadow-sm transition-all outline-none"
            placeholder="Buscar por paciente..."
            [(ngModel)]="search" (ngModelChange)="applyFilters()">
        </div>

        <select class="px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary shadow-sm outline-none"
          [(ngModel)]="filterInstrument" (ngModelChange)="applyFilters()">
          <option value="">Todos os instrumentos</option>
          @for (i of instruments(); track i.code) { 
            <option [value]="i.code">{{ i.name }}</option> 
          }
        </select>

        <select class="px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary shadow-sm outline-none"
          [(ngModel)]="filterRisk" (ngModelChange)="applyFilters()">
          <option value="">Todos os riscos</option>
          <option value="ELEVADO">Risco elevado</option>
          <option value="ALTO">Risco alto</option>
          <option value="MODERADO">Risco moderado</option>
          <option value="BAIXO">Risco baixo</option>
        </select>

        <button class="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 text-slate-700 dark:text-slate-200 transition-all"
          (click)="toggleAll()">
          <span class="material-icons text-base">{{ allHidden() ? 'visibility' : 'visibility_off' }}</span>
          <span>{{ allHidden() ? 'Mostrar todos' : 'Ocultar todos' }}</span>
        </button>
      </div>

      @if (hiddenCount() > 0 && !allHidden()) {
        <p class="text-xs text-slate-500 dark:text-slate-400">
          {{ hiddenCount() }} rastreio(s) oculto(s) — use "Mostrar todos" para exibi-los novamente.
        </p>
      }

      <!-- Lista de Itens -->
      @if (loading()) {
        <div class="flex items-center justify-center p-12 text-slate-500">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      } @else if (filtered().length === 0) {
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center ring-1 ring-slate-200 dark:ring-slate-800">
          <span class="material-icons text-6xl text-slate-300 dark:text-slate-700">fact_check</span>
          <p class="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">Nenhum rastreio encontrado</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (r of filtered(); track r.id) {
            <div class="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:ring-primary/30 transition-all">
              <div class="flex items-start gap-3.5 min-w-0">
                <div class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" [style.background]="riskColor(r.riskLevel).bg">
                  <span class="material-icons text-white text-xl">fact_check</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="font-bold text-slate-900 dark:text-white text-sm">{{ r.paciente?.name || '—' }}</h3>
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold" [style]="riskColor(r.riskLevel).style">
                      {{ r.riskLevel }}
                    </span>
                    @if (r.respondent) { 
                      <span class="text-xs text-slate-500 dark:text-slate-400">· {{ respondentLabel(r.respondent) }}</span> 
                    }
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {{ instrumentName(r.instrument) }} · {{ r.assessedAt | date:'dd/MM/yyyy' }} · {{ r.profissional?.name || '—' }}
                  </p>
                  @if (r.summary) {
                    <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2" title="{{ r.summary }}">
                      {{ r.summary }}
                    </p>
                  }
                </div>
              </div>

              <!-- Ações -->
              <div class="flex items-center gap-2 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                <button class="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all" 
                  title="Editar" routerLink="/app/rastreios/novo" (click)="edit(r)">
                  <span class="material-icons text-lg">edit</span>
                </button>
                <button class="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" 
                  title="Excluir" (click)="remove(r)">
                  <span class="material-icons text-lg">delete</span>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
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
  hiddenCount = signal(0);
  allHidden = signal(false);

  ngOnInit() {
    this.service.instruments().subscribe((res: any) => this.instruments.set(res.data || []));
    this.load();
  }

  load() {
    this.loading.set(true);
    this.service.list({ includeHidden: 'true' }).subscribe({
      next: (res: any) => {
        const all = res.data || [];
        this.records.set(all);
        this.hiddenCount.set(all.filter((r: any) => r.hidden).length);
        this.allHidden.set(all.length > 0 && this.hiddenCount() === all.length);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Erro ao carregar rastreios'); }
    });
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filtered.set(this.records().filter((r) => {
      if (r.hidden) return false;
      const name = (r.paciente?.name || '').toLowerCase();
      const inst = this.instrumentName(r.instrument).toLowerCase();
      const resp = (this.respondentLabel(r.respondent || '') || '').toLowerCase();
      const summary = (r.summary || '').toLowerCase();
      const haystack = `${name} ${inst} ${resp} ${summary}`;
      const okName = !term || haystack.includes(term);
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

  toggleHide(r: any) {
    const hidden = !r.hidden;
    this.service.hide(r.id, hidden).subscribe({
      next: () => {
        this.toast.success(hidden ? 'Rastreio ocultado' : 'Rastreio visível novamente');
        this.load();
      },
      error: () => this.toast.error('Erro ao atualizar rastreio')
    });
  }

  hideAll() {
    this.service.hideAll(true).subscribe({
      next: () => { this.toast.success('Todos os rastreios foram ocultados'); this.load(); },
      error: () => this.toast.error('Erro ao ocultar rastreios')
    });
  }

  showAll() {
    this.service.hideAll(false).subscribe({
      next: () => { this.toast.success('Rastreios visíveis novamente'); this.load(); },
      error: () => this.toast.error('Erro ao mostrar rastreios')
    });
  }

  toggleAll() {
    if (this.allHidden()) this.showAll();
    else this.hideAll();
  }

  remove(r: any) {
    if (!confirm(`Excluir o rastreio de ${r.paciente?.name || '—'} (${new Date(r.assessedAt).toLocaleDateString('pt-BR')})?`)) return;
    this.service.delete(r.id).subscribe({
      next: () => { this.toast.success('Rastreio excluído'); this.load(); },
      error: () => this.toast.error('Erro ao excluir rastreio')
    });
  }
}