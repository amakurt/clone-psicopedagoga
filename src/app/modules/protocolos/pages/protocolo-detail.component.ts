import { Component, inject, signal, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { escapeHtml } from '@core/utils/escape';
import { Chart, registerables } from 'chart.js';
import { ToastService } from '@shared/components/toast.component';

Chart.register(...registerables);

declare var html2pdf: any;

@Component({
  selector: 'app-protocolo-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <a routerLink="/app/protocolos" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <span class="material-icons text-gray-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Avaliação Protocolo TEA</h1>
            <p class="text-sm text-gray-500 dark:text-slate-400">
              {{ item()?.paciente?.name || '—' }} — {{ item()?.date | date:'dd/MM/yyyy' }}
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <button (click)="exportPDF()"
            class="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-medium text-sm transition-all">
            <span class="material-icons text-[18px]">picture_as_pdf</span>
            Exportar PDF
          </button>
          <a [routerLink]="['/app/protocolos', id, 'editar']"
            class="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-medium text-sm transition-all">
            <span class="material-icons text-[18px]">edit</span>
            Editar
          </a>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      } @else if (stats()) {
        <!-- Classification Card -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
          <div class="flex flex-col md:flex-row items-center gap-6">
            <!-- Score Circle -->
            <div class="relative w-32 h-32 flex-shrink-0">
              <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="#e5e7eb" stroke-width="10" fill="none" />
                <circle cx="60" cy="60" r="50" [attr.stroke]="getClassificationColor()" stroke-width="10" fill="none"
                  stroke-linecap="round" [attr.stroke-dasharray]="getCircleDash()" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-black" [style.color]="getClassificationColor()">{{ stats()!.overallPercentage }}%</span>
                <span class="text-[10px] text-gray-400 uppercase tracking-wider">Geral</span>
              </div>
            </div>

            <div class="flex-1 text-center md:text-left">
              <div class="flex items-center gap-3 justify-center md:justify-start mb-2">
                <span class="px-4 py-1.5 rounded-full text-sm font-bold"
                  [style.background]="getClassificationColor() + '20'"
                  [style.color]="getClassificationColor()">
                  {{ getClassification(stats()!.overallPercentage) }}
                </span>
                <span class="text-sm text-gray-500 dark:text-slate-400">
                  {{ stats()!.totalScore }}/{{ stats()!.totalMax }} pontos
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-slate-400">{{ getClassificationDescription(stats()!.overallPercentage) }}</p>
              <div class="flex gap-4 mt-3 justify-center md:justify-start">
                <div class="text-center">
                  <p class="text-lg font-bold text-gray-900 dark:text-white">{{ getEvaluatedItems() }}</p>
                  <p class="text-[10px] text-gray-400 uppercase">Avaliados</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-bold text-gray-900 dark:text-white">{{ getTotalItems() - getEvaluatedItems() }}</p>
                  <p class="text-[10px] text-gray-400 uppercase">Pendentes</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-bold text-gray-900 dark:text-white">{{ getTotalItems() }}</p>
                  <p class="text-[10px] text-gray-400 uppercase">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Radar Chart -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Radar Geral</h3>
            <div class="flex justify-center">
              <canvas #radarChart width="400" height="400"></canvas>
            </div>
          </div>

          <!-- Bar Chart -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comparativo por Categoria</h3>
            <div class="flex justify-center">
              <canvas #barChart width="400" height="400"></canvas>
            </div>
          </div>
        </div>

        <!-- Category Progress Bars -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Detalhamento por Categoria</h3>
          <div class="space-y-5">
            @for (cat of stats()!.categories; track cat.id) {
              <div class="group">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full" [style.background]="cat.color"></div>
                    <span class="text-sm font-semibold text-gray-700 dark:text-slate-300">{{ cat.name }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold" [style.color]="cat.color">{{ cat.percentage }}%</span>
                    <span class="text-xs text-gray-400">({{ cat.score }}/{{ cat.maxScore }})</span>
                  </div>
                </div>
                <div class="w-full h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700 ease-out"
                    [style.width.%]="cat.percentage"
                    [style.background]="cat.color">
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Toast -->
    @if (showToast()) {
      <div class="fixed bottom-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 animate-in shadow-lg bg-emerald-500 text-white">
        <span class="material-icons">check_circle</span>
        <span class="text-sm font-medium">{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    @keyframes animate-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-in { animation: animate-in 0.3s ease-out; }
  `]
})
export class ProtocoloDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('radarChart') radarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;

  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  id = '';
  item = signal<any>(null);
  stats = signal<any>(null);
  loading = signal(true);
  showToast = signal(false);
  toastMessage = signal('');

  private radarChart: Chart | null = null;
  private barChart: Chart | null = null;

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.loadData();
  }

  ngAfterViewInit() {
    // Charts will be created after data loads
  }

  loadData() {
    this.loading.set(true);

    // Load evaluation details
    this.api.get(`/protocol-evaluations/${this.id}`).subscribe({
      next: (res: any) => {
        this.item.set(res);

        // Load stats
        this.api.get(`/protocol-evaluations/protocol-stats/${this.id}`).subscribe({
          next: (statsRes: any) => {
            this.stats.set(statsRes);
            this.loading.set(false);
            setTimeout(() => this.createCharts(), 100);
          },
          error: () => {
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.toast.error('Avaliação não encontrada');
        this.loading.set(false);
      }
    });
  }

  createCharts() {
    this.createRadarChart();
    this.createBarChart();
  }

  createRadarChart() {
    if (!this.radarChartRef || !this.stats()) return;
    if (this.radarChart) this.radarChart.destroy();

    const cats = this.stats()!.categories;

    this.radarChart = new Chart(this.radarChartRef.nativeElement, {
      type: 'radar',
      data: {
        labels: cats.map((c: any) => c.name.replace('Habilidades ', '').replace('Habilidades Funcionais', 'Funcionais')),
        datasets: [{
          label: 'Pontuação',
          data: cats.map((c: any) => c.percentage),
          backgroundColor: 'rgba(0, 127, 128, 0.15)',
          borderColor: '#007F80',
          borderWidth: 2,
          pointBackgroundColor: cats.map((c: any) => c.color),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20, display: false },
            grid: { color: '#e5e7eb' },
            pointLabels: { font: { size: 11, weight: 'bold' }, color: '#64748b' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  createBarChart() {
    if (!this.barChartRef || !this.stats()) return;
    if (this.barChart) this.barChart.destroy();

    const cats = this.stats()!.categories;

    this.barChart = new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: cats.map((c: any) => c.name.replace('Habilidades ', '').replace('Habilidades Funcionais', 'Funcionais')),
        datasets: [{
          label: 'Pontuação %',
          data: cats.map((c: any) => c.percentage),
          backgroundColor: cats.map((c: any) => c.color + '80'),
          borderColor: cats.map((c: any) => c.color),
          borderWidth: 2,
          borderRadius: 8,
          barPercentage: 0.7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } },
          y: { grid: { display: false } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  getEvaluatedItems(): number {
    if (!this.item()?.evaluations) return 0;
    try {
      const evals = JSON.parse(this.item().evaluations);
      return Object.keys(evals).length;
    } catch { return 0; }
  }

  getTotalItems(): number {
    return 200; // 5 categories × 4 subcategories × 10 items
  }

  getClassification(pct: number): string {
    if (pct >= 67) return 'Leve';
    if (pct >= 34) return 'Moderado';
    return 'Grave';
  }

  getClassificationColor(): string {
    const pct = this.stats()?.overallPercentage || 0;
    if (pct >= 67) return '#10B981';
    if (pct >= 34) return '#F59E0B';
    return '#EF4444';
  }

  getClassificationDescription(pct: number): string {
    if (pct >= 67) return 'Boa performance nas habilidades avaliadas. Manter acompanhamento e reforçar áreas específicas.';
    if (pct >= 34) return 'Habilidades intermediárias. Necessita intervenção moderada nas áreas com menor pontuação.';
    return 'Necessita intervenção intensiva. Recomenda-se plano de intervenção estruturado.';
  }

  getCircleDash(): string {
    const pct = this.stats()?.overallPercentage || 0;
    const circumference = 2 * Math.PI * 50;
    const filled = (pct / 100) * circumference;
    return `${filled} ${circumference}`;
  }

  exportPDF() {
    const data = this.stats();
    const info = this.item();
    if (!data || !info) return;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007F80; margin: 0;">EduPsych Pro</h1>
          <h2 style="color: #333; margin: 10px 0 0;">Avaliação Protocolo TEA</h2>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;">

        <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
          <tr><td style="padding: 8px 0; color: #666; width: 140px;">Paciente:</td><td style="padding: 8px 0; font-weight: bold;">${escapeHtml(info.paciente?.name) || '—'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Data:</td><td style="padding: 8px 0;">${new Date(info.date).toLocaleDateString('pt-BR')}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Pontuação Geral:</td><td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #007F80;">${data.totalScore}/${data.totalMax} (${data.overallPercentage}%)</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Classificação:</td><td style="padding: 8px 0; font-weight: bold; color: ${this.getClassificationColor()};">${this.getClassification(data.overallPercentage)}</td></tr>
        </table>

        <h3 style="color: #007F80; font-size: 16px; margin: 30px 0 15px; border-bottom: 2px solid #007F80; padding-bottom: 8px;">Resultado por Categoria</h3>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
              <th style="padding: 10px; text-align: left; font-weight: bold;">Categoria</th>
              <th style="padding: 10px; text-align: center; font-weight: bold;">Pontuação</th>
              <th style="padding: 10px; text-align: center; font-weight: bold;">%</th>
              <th style="padding: 10px; text-align: center; font-weight: bold;">Classificação</th>
            </tr>
          </thead>
          <tbody>
            ${data.categories.map((cat: any) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${escapeHtml(cat.color)};"></div>
                    <span style="font-weight: 500;">${escapeHtml(cat.name)}</span>
                  </div>
                </td>
                <td style="padding: 10px; text-align: center; font-weight: bold;">${cat.score}/${cat.maxScore}</td>
                <td style="padding: 10px; text-align: center; font-weight: bold; color: ${escapeHtml(cat.color)};">${cat.percentage}%</td>
                <td style="padding: 10px; text-align: center;">
                  <span style="background: ${escapeHtml(cat.color)}20; color: ${escapeHtml(cat.color)}; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                    ${cat.percentage >= 67 ? 'Bom' : cat.percentage >= 34 ? 'Regular' : 'Baixo'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h4 style="color: #333; margin: 0 0 8px; font-size: 14px;">Observações Clínicas</h4>
          <p style="color: #666; font-size: 13px; margin: 0; white-space: pre-wrap;">${escapeHtml(info.notes) || 'Nenhuma observação registrada.'}</p>
        </div>

        <hr style="border: 1px solid #eee; margin: 30px 0 20px;">
        <p style="text-align: center; color: #999; font-size: 11px;">Documento gerado em ${new Date().toLocaleString('pt-BR')} — EduPsych Pro</p>
      </div>
    `;

    if (typeof html2pdf !== 'undefined') {
      const element = document.createElement('div');
      element.innerHTML = html;
      html2pdf().from(element).set({
        filename: `protocolo-tea-${info.paciente?.name || 'paciente'}-${info.date}.pdf`,
        margin: 10
      }).save();
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }
    }

    this.toastMessage.set('PDF exportado com sucesso!');
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
