import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GuardianService } from '../services/guardian.service';
import { SessionRecord } from '@core/models';
import { escapeHtml } from '@core/utils/escape';

declare var html2pdf: any;

@Component({
  selector: 'app-guardian-evolutions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 sm:space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="size-11 sm:size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <span class="material-icons text-primary text-2xl">trending_up</span>
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Evoluções Compartilhadas</h2>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Registros e desempenho das sessões do seu filho</p>
          </div>
        </div>
        <button (click)="exportToPdf()"
          class="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-all active:scale-95">
          <span class="material-icons text-lg text-primary">picture_as_pdf</span> Exportar PDF
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div class="flex-1">
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Data Início</label>
          <input type="date" [(ngModel)]="dateFrom" (change)="applyFilters()"
            class="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent">
        </div>
        <div class="flex-1">
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Data Fim</label>
          <input type="date" [(ngModel)]="dateTo" (change)="applyFilters()"
            class="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent">
        </div>
        @if (filteredRecords().length > 0 && filteredRecords().length >= 2) {
          <button (click)="toggleComparison()"
            class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 shrink-0"
            [class]="comparisonMode() ? 'bg-primary text-on-primary shadow-sm' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'">
            <span class="material-icons text-lg">compare</span> {{ comparisonMode() ? 'Ver Lista Normal' : 'Modo Comparar' }}
          </button>
        }
      </div>

      @if (records().length === 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-gray-200 dark:border-slate-700 text-center shadow-sm">
          <div class="size-16 rounded-3xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-gray-400 dark:text-slate-500">
            <span class="material-icons text-3xl">trending_up</span>
          </div>
          <h3 class="mt-4 text-base sm:text-lg font-bold text-gray-900 dark:text-white">Nenhuma evolução compartilhada</h3>
          <p class="mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-400">Os registros de sessão compartilhados pelo profissional aparecerão aqui.</p>
        </div>
      } @else {
        <!-- Comparison View -->
        @if (comparisonMode() && filteredRecords().length >= 2) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (record of filteredRecords().slice(0, 2); track record.id; let i = $index) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border-2 shadow-sm"
                [class.border-primary]="i === 0"
                [class.border-green-500]="i === 1">
                <div class="flex items-center justify-between gap-2 mb-3">
                  <span class="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                    [class]="i === 0 ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'">
                    {{ i === 0 ? 'PRIMEIRA (ANTES)' : 'ÚLTIMA (DEPOIS)' }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-slate-400 font-medium">{{ record.date }}</span>
                </div>
                <h4 class="font-bold text-base text-gray-900 dark:text-white">{{ record.summary }}</h4>
                @if (record.focus || record.engagement || record.skillProgress || record.behavior) {
                  <div class="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
                    @if (record.focus) {
                      <div class="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-2.5 text-center">
                        <p class="text-lg font-black text-primary">{{ record.focus }}%</p>
                        <p class="text-[10px] uppercase font-bold text-gray-500">Foco</p>
                      </div>
                    }
                    @if (record.engagement) {
                      <div class="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-2.5 text-center">
                        <p class="text-lg font-black text-green-600">{{ record.engagement }}%</p>
                        <p class="text-[10px] uppercase font-bold text-gray-500">Engajamento</p>
                      </div>
                    }
                    @if (record.skillProgress) {
                      <div class="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-2.5 text-center">
                        <p class="text-lg font-black text-blue-600">{{ record.skillProgress }}%</p>
                        <p class="text-[10px] uppercase font-bold text-gray-500">Progresso</p>
                      </div>
                    }
                    @if (record.behavior) {
                      <div class="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-2.5 text-center">
                        <p class="text-lg font-black text-amber-600">{{ record.behavior }}%</p>
                        <p class="text-[10px] uppercase font-bold text-gray-500">Comportamento</p>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Normal List -->
        <div class="space-y-4" [class.hidden]="comparisonMode()">
          @for (record of filteredRecords(); track record.id) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2.5">
                  <span class="px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary">
                    Sessão {{ record.sessionNumber || '-' }}
                  </span>
                  <span class="text-xs sm:text-sm text-gray-500 dark:text-slate-400">{{ record.date }}</span>
                </div>
              </div>

              <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug">{{ record.summary }}</h3>

              @if (record.objective) {
                <div class="p-3 bg-gray-50 dark:bg-slate-700/30 rounded-2xl border border-gray-100 dark:border-slate-700/60">
                  <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Objetivo da Sessão</p>
                  <p class="text-xs sm:text-sm text-gray-700 dark:text-slate-300 mt-0.5">{{ record.objective }}</p>
                </div>
              }

              @if (record.activities) {
                <div class="p-3 bg-gray-50 dark:bg-slate-700/30 rounded-2xl border border-gray-100 dark:border-slate-700/60">
                  <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Atividades Realizadas</p>
                  <p class="text-xs sm:text-sm text-gray-700 dark:text-slate-300 mt-0.5">{{ record.activities }}</p>
                </div>
              }

              @if (record.observations) {
                <div class="p-3 bg-gray-50 dark:bg-slate-700/30 rounded-2xl border border-gray-100 dark:border-slate-700/60">
                  <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Observações Clínicas</p>
                  <p class="text-xs sm:text-sm text-gray-700 dark:text-slate-300 mt-0.5">{{ record.observations }}</p>
                </div>
              }

              @if (record.focus || record.engagement || record.skillProgress || record.behavior) {
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
                  @if (record.focus) {
                    <div class="bg-gray-50 dark:bg-slate-700/40 rounded-2xl p-2.5 text-center border border-gray-100 dark:border-slate-700">
                      <p class="text-lg sm:text-xl font-black text-primary">{{ record.focus }}%</p>
                      <p class="text-[10px] uppercase font-bold text-gray-500">Foco</p>
                    </div>
                  }
                  @if (record.engagement) {
                    <div class="bg-gray-50 dark:bg-slate-700/40 rounded-2xl p-2.5 text-center border border-gray-100 dark:border-slate-700">
                      <p class="text-lg sm:text-xl font-black text-green-600">{{ record.engagement }}%</p>
                      <p class="text-[10px] uppercase font-bold text-gray-500">Engajamento</p>
                    </div>
                  }
                  @if (record.skillProgress) {
                    <div class="bg-gray-50 dark:bg-slate-700/40 rounded-2xl p-2.5 text-center border border-gray-100 dark:border-slate-700">
                      <p class="text-lg sm:text-xl font-black text-blue-600">{{ record.skillProgress }}%</p>
                      <p class="text-[10px] uppercase font-bold text-gray-500">Progresso</p>
                    </div>
                  }
                  @if (record.behavior) {
                    <div class="bg-gray-50 dark:bg-slate-700/40 rounded-2xl p-2.5 text-center border border-gray-100 dark:border-slate-700">
                      <p class="text-lg sm:text-xl font-black text-amber-600">{{ record.behavior }}%</p>
                      <p class="text-[10px] uppercase font-bold text-gray-500">Comportamento</p>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class GuardianEvolutionsComponent implements OnInit {
  private guardianService = inject(GuardianService);
  private route = inject(ActivatedRoute);

  records = signal<SessionRecord[]>([]);
  filteredRecords = signal<SessionRecord[]>([]);
  comparisonMode = signal(false);
  dateFrom = '';
  dateTo = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const patientId = params['patientId'] || localStorage.getItem('guardian_patient_id');
      if (patientId) {
        this.loadEvolutions(patientId);
      }
    });
  }

  loadEvolutions(patientId: string) {
    this.guardianService.getEvolutions(patientId).subscribe({
      next: (res: any) => {
        const data = res.data || [];
        this.records.set(data);
        this.filteredRecords.set(data);
      }
    });
  }

  applyFilters() {
    let filtered = this.records();
    if (this.dateFrom) {
      filtered = filtered.filter(r => r.date >= this.dateFrom);
    }
    if (this.dateTo) {
      filtered = filtered.filter(r => r.date <= this.dateTo);
    }
    this.filteredRecords.set(filtered);
  }

  toggleComparison() {
    this.comparisonMode.update(v => !v);
  }

  exportToPdf() {
    const data = this.filteredRecords();
    let html = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 30px;">
      <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px solid #007F80; padding-bottom: 15px;">
        <h1 style="color: #007F80; margin: 0;">EduPsych Pro</h1>
        <h2 style="color: #333; margin: 5px 0 0;">Evoluções Compartilhadas</h2>
      </div>`;

    for (const r of data) {
      html += `<div style="margin-bottom: 15px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #007F80; font-weight: bold;">Sessão ${r.sessionNumber || '—'}</span>
          <span style="color: #666; font-size: 13px;">${r.date}</span>
        </div>
        <h3 style="margin: 0 0 8px; color: #1e293b;">${escapeHtml(r.summary)}</h3>
        ${r.objective ? `<p style="margin: 4px 0; font-size: 13px; color: #555;"><strong>Objetivo:</strong> ${escapeHtml(r.objective)}</p>` : ''}
        ${r.activities ? `<p style="margin: 4px 0; font-size: 13px; color: #555;"><strong>Atividades:</strong> ${escapeHtml(r.activities)}</p>` : ''}
        ${r.observations ? `<p style="margin: 4px 0; font-size: 13px; color: #555;"><strong>Obs:</strong> ${escapeHtml(r.observations)}</p>` : ''}
        ${(r.focus || r.engagement || r.skillProgress || r.behavior) ? `<div style="display: flex; gap: 15px; margin-top: 8px;">
          ${r.focus ? `<span style="font-size: 12px; color: #666;">Foco: ${r.focus}%</span>` : ''}
          ${r.engagement ? `<span style="font-size: 12px; color: #666;">Engajamento: ${r.engagement}%</span>` : ''}
          ${r.skillProgress ? `<span style="font-size: 12px; color: #666;">Progresso: ${r.skillProgress}%</span>` : ''}
        </div>` : ''}
      </div>`;
    }

    html += `<p style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">Exportado em ${new Date().toLocaleString('pt-BR')}</p></div>`;

    if (typeof html2pdf !== 'undefined') {
      const element = document.createElement('div');
      element.innerHTML = html;
      html2pdf().from(element).set({ filename: 'evolucoes-compartilhadas.pdf', margin: 10 }).save();
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) { printWindow.document.write(html); printWindow.document.close(); printWindow.print(); }
    }
  }
}
