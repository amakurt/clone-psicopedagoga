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
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Evoluções Compartilhadas</h2>
          <p class="text-gray-500 dark:text-slate-400 mt-1">Registros de sessão compartilhados pelo profissional</p>
        </div>
        <div class="flex gap-2">
          <button (click)="exportToPdf()"
            class="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
            <span class="material-icons text-lg">picture_as_pdf</span> Exportar PDF
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-200 dark:border-slate-700 flex flex-wrap gap-4 items-center">
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-1">Data Início</label>
          <input type="date" [(ngModel)]="dateFrom" (change)="applyFilters()"
            class="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-1">Data Fim</label>
          <input type="date" [(ngModel)]="dateTo" (change)="applyFilters()"
            class="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
        </div>
        @if (filteredRecords().length > 0 && filteredRecords().length % 2 === 0 && filteredRecords().length >= 2) {
          <button (click)="toggleComparison()"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            [class]="comparisonMode() ? 'bg-primary text-on-primary' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'">
            <span class="material-icons text-lg">compare</span> Comparar
          </button>
        }
      </div>

      @if (records().length === 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-gray-200 dark:border-slate-700 text-center">
          <span class="material-icons text-6xl text-gray-300 dark:text-slate-600">trending_up</span>
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Nenhuma evolução compartilhada</h3>
          <p class="mt-2 text-gray-500 dark:text-slate-400">As evoluções compartilhadas pelo profissional aparecerão aqui</p>
        </div>
      } @else {
        <!-- Comparison View -->
        @if (comparisonMode() && filteredRecords().length >= 2) {
          <div class="grid grid-cols-2 gap-4">
            @for (record of filteredRecords().slice(0, 2); track record.id; let i = $index) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2"
                [class.border-primary]="i === 0"
                [class.border-green-500]="i === 1"
                [class.border-gray-200]="false"
                [class.dark:border-slate-700]="false">
                <div class="flex items-center gap-2 mb-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-bold"
                    [class]="i === 0 ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-700'">
                    {{ i === 0 ? 'ANTES' : 'DEPOIS' }}
                  </span>
                  <span class="text-sm text-gray-500">{{ record.date }}</span>
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white">{{ record.summary }}</h4>
                @if (record.focus || record.engagement || record.skillProgress || record.behavior) {
                  <div class="grid grid-cols-2 gap-2 mt-3">
                    @if (record.focus) {
                      <div class="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 text-center">
                        <p class="text-lg font-bold text-primary">{{ record.focus }}%</p>
                        <p class="text-[10px] text-gray-500">Foco</p>
                      </div>
                    }
                    @if (record.engagement) {
                      <div class="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 text-center">
                        <p class="text-lg font-bold text-primary">{{ record.engagement }}%</p>
                        <p class="text-[10px] text-gray-500">Engajamento</p>
                      </div>
                    }
                    @if (record.skillProgress) {
                      <div class="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 text-center">
                        <p class="text-lg font-bold text-primary">{{ record.skillProgress }}%</p>
                        <p class="text-[10px] text-gray-500">Progresso</p>
                      </div>
                    }
                    @if (record.behavior) {
                      <div class="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 text-center">
                        <p class="text-lg font-bold text-primary">{{ record.behavior }}%</p>
                        <p class="text-[10px] text-gray-500">Comportamento</p>
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
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-3">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      Sessão {{ record.sessionNumber || '-' }}
                    </span>
                    <span class="text-sm text-gray-500 dark:text-slate-400">{{ record.date }}</span>
                  </div>
                  <h3 class="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{{ record.summary }}</h3>
                </div>
              </div>

              @if (record.objective) {
                <div class="mt-4">
                  <p class="text-sm font-medium text-gray-500 dark:text-slate-400">Objetivo</p>
                  <p class="text-gray-700 dark:text-slate-300">{{ record.objective }}</p>
                </div>
              }

              @if (record.activities) {
                <div class="mt-4">
                  <p class="text-sm font-medium text-gray-500 dark:text-slate-400">Atividades</p>
                  <p class="text-gray-700 dark:text-slate-300">{{ record.activities }}</p>
                </div>
              }

              @if (record.observations) {
                <div class="mt-4">
                  <p class="text-sm font-medium text-gray-500 dark:text-slate-400">Observações</p>
                  <p class="text-gray-700 dark:text-slate-300">{{ record.observations }}</p>
                </div>
              }

              @if (record.focus || record.engagement || record.skillProgress || record.behavior) {
                <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  @if (record.focus) {
                    <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 text-center">
                      <p class="text-lg font-bold text-primary">{{ record.focus }}%</p>
                      <p class="text-xs text-gray-500">Foco</p>
                    </div>
                  }
                  @if (record.engagement) {
                    <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 text-center">
                      <p class="text-lg font-bold text-primary">{{ record.engagement }}%</p>
                      <p class="text-xs text-gray-500">Engajamento</p>
                    </div>
                  }
                  @if (record.skillProgress) {
                    <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 text-center">
                      <p class="text-lg font-bold text-primary">{{ record.skillProgress }}%</p>
                      <p class="text-xs text-gray-500">Progresso</p>
                    </div>
                  }
                  @if (record.behavior) {
                    <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 text-center">
                      <p class="text-lg font-bold text-primary">{{ record.behavior }}%</p>
                      <p class="text-xs text-gray-500">Comportamento</p>
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
