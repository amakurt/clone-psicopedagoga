import { Component, inject, signal, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { escapeHtml } from '../../../core/utils/escape';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

declare var html2pdf: any;

@Component({
  selector: 'app-evolucao-comparativa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Evolução Comparativa</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Compare métricas entre períodos</p>
        </div>
        <button (click)="exportPDF()" class="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-red-500/20 transition-all active:scale-95">
          <span class="material-icons text-[18px]">picture_as_pdf</span>
          <span>Exportar PDF</span>
        </button>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Paciente</label>
            <select [(ngModel)]="selectedPatient" (change)="loadComparison()" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="">Todos os pacientes</option>
              @for (p of patients(); track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Período 1</label>
            <div class="grid grid-cols-2 gap-2">
              <input type="date" [(ngModel)]="period1Start" (change)="loadComparison()" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
              <input type="date" [(ngModel)]="period1End" (change)="loadComparison()" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Período 2</label>
            <div class="grid grid-cols-2 gap-2">
              <input type="date" [(ngModel)]="period2Start" (change)="loadComparison()" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
              <input type="date" [(ngModel)]="period2End" (change)="loadComparison()" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Comparação de Métricas</h3>
          <canvas #barChart></canvas>
        </div>
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Progresso ao Longo do Tempo</h3>
          <canvas #lineChart></canvas>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Análise por Domínio</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (domain of domains; track domain.key) {
            <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div class="flex items-center gap-3 mb-3">
                <span class="material-icons text-2xl" [style.color]="domain.color">{{ domain.icon }}</span>
                <span class="font-bold text-slate-900 dark:text-white text-sm">{{ domain.label }}</span>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-xs">
                  <span class="text-slate-500">Período 1</span>
                  <span class="font-bold text-slate-700 dark:text-slate-300">{{ getDomainAvg(domain.key, 1) }}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-slate-500">Período 2</span>
                  <span class="font-bold text-slate-700 dark:text-slate-300">{{ getDomainAvg(domain.key, 2) }}</span>
                </div>
                <div class="flex justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span class="text-slate-500">Variação</span>
                  <span class="font-bold" [class]="getVariationClass(domain.key)">{{ getVariation(domain.key) }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    @if (showToast()) {
      <div class="fixed bottom-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 animate-in shadow-lg bg-emerald-500 text-white">
        <span class="material-icons">check_circle</span>
        <span class="text-sm font-medium">{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class EvolucaoComparativaComponent implements OnInit, AfterViewInit {
  private api = inject(ApiService);

  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;

  patients = signal<any[]>([]);
  period1Data = signal<any[]>([]);
  period2Data = signal<any[]>([]);

  selectedPatient = '';
  period1Start = '';
  period1End = '';
  period2Start = '';
  period2End = '';

  showToast = signal(false);
  toastMessage = signal('');

  private barChart: Chart | null = null;
  private lineChart: Chart | null = null;

  domains = [
    { key: 'focus', label: 'Foco', icon: 'visibility', color: '#3B82F6' },
    { key: 'engagement', label: 'Engajamento', icon: 'psychology', color: '#8B5CF6' },
    { key: 'skillProgress', label: 'Progresso', icon: 'trending_up', color: '#10B981' },
    { key: 'behavior', label: 'Comportamento', icon: 'sentiment_satisfied', color: '#F59E0B' }
  ];

  ngOnInit() {
    this.setDefaultDates();
    this.loadPatients();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initCharts(), 100);
  }

  setDefaultDates() {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    this.period1Start = twoMonthsAgo.toISOString().split('T')[0];
    this.period1End = lastMonth.toISOString().split('T')[0];
    this.period2Start = lastMonth.toISOString().split('T')[0];
    this.period2End = today.toISOString().split('T')[0];
  }

  loadPatients() {
    this.api.get('/pacientes').subscribe({
      next: (res: any) => {
        this.patients.set(res.data || []);
        this.loadComparison();
      }
    });
  }

  loadComparison() {
    if (!this.period1Start || !this.period1End || !this.period2Start || !this.period2End) return;

    const params: any = {
      start1: this.period1Start,
      end1: this.period1End,
      start2: this.period2Start,
      end2: this.period2End
    };
    if (this.selectedPatient) params.patientId = this.selectedPatient;

    this.api.get('/evolution/compare', params).subscribe({
      next: (res: any) => {
        this.period1Data.set(res.period1 || []);
        this.period2Data.set(res.period2 || []);
        this.updateCharts();
      },
      error: () => {
        this.period1Data.set([]);
        this.period2Data.set([]);
        this.updateCharts();
      }
    });
  }

  initCharts() {
    if (!this.barChartRef?.nativeElement || !this.lineChartRef?.nativeElement) return;

    const barCtx = this.barChartRef.nativeElement.getContext('2d');
    const lineCtx = this.lineChartRef.nativeElement.getContext('2d');

    if (barCtx) {
      this.barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Foco', 'Engajamento', 'Progresso', 'Comportamento'],
          datasets: [
            { label: 'Período 1', data: [0, 0, 0, 0], backgroundColor: 'rgba(59, 130, 246, 0.7)' },
            { label: 'Período 2', data: [0, 0, 0, 0], backgroundColor: 'rgba(16, 185, 129, 0.7)' }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { position: 'top' } },
          scales: { y: { beginAtZero: true, max: 5 } }
        }
      });
    }

    if (lineCtx) {
      this.lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            { label: 'Foco', data: [], borderColor: '#3B82F6', tension: 0.4 },
            { label: 'Engajamento', data: [], borderColor: '#8B5CF6', tension: 0.4 },
            { label: 'Progresso', data: [], borderColor: '#10B981', tension: 0.4 },
            { label: 'Comportamento', data: [], borderColor: '#F59E0B', tension: 0.4 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { position: 'top' } },
          scales: { y: { beginAtZero: true, max: 5 } }
        }
      });
    }
  }

  updateCharts() {
    const p1 = this.period1Data();
    const p2 = this.period2Data();

    const p1Avg = this.calculateAverages(p1);
    const p2Avg = this.calculateAverages(p2);

    if (this.barChart) {
      this.barChart.data.datasets[0].data = [p1Avg.focus, p1Avg.engagement, p1Avg.skillProgress, p1Avg.behavior];
      this.barChart.data.datasets[1].data = [p2Avg.focus, p2Avg.engagement, p2Avg.skillProgress, p2Avg.behavior];
      this.barChart.update();
    }

    if (this.lineChart) {
      const allRecords = [...p1, ...p2].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const labels = allRecords.map(r => new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));

      this.lineChart.data.labels = labels;
      this.lineChart.data.datasets[0].data = allRecords.map(r => r.focus || 0);
      this.lineChart.data.datasets[1].data = allRecords.map(r => r.engagement || 0);
      this.lineChart.data.datasets[2].data = allRecords.map(r => r.skillProgress || 0);
      this.lineChart.data.datasets[3].data = allRecords.map(r => r.behavior || 0);
      this.lineChart.update();
    }
  }

  calculateAverages(records: any[]) {
    if (records.length === 0) return { focus: 0, engagement: 0, skillProgress: 0, behavior: 0 };

    const sum = records.reduce((acc, r) => ({
      focus: acc.focus + (r.focus || 0),
      engagement: acc.engagement + (r.engagement || 0),
      skillProgress: acc.skillProgress + (r.skillProgress || 0),
      behavior: acc.behavior + (r.behavior || 0)
    }), { focus: 0, engagement: 0, skillProgress: 0, behavior: 0 });

    return {
      focus: +(sum.focus / records.length).toFixed(1),
      engagement: +(sum.engagement / records.length).toFixed(1),
      skillProgress: +(sum.skillProgress / records.length).toFixed(1),
      behavior: +(sum.behavior / records.length).toFixed(1)
    };
  }

  getDomainAvg(domain: string, period: number): string {
    const data = period === 1 ? this.period1Data() : this.period2Data();
    const avg = this.calculateAverages(data);
    return (avg as any)[domain]?.toFixed(1) || '0.0';
  }

  getVariation(domain: string): string {
    const p1 = this.calculateAverages(this.period1Data());
    const p2 = this.calculateAverages(this.period2Data());
    const diff = ((p2 as any)[domain] || 0) - ((p1 as any)[domain] || 0);
    return diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  }

  getVariationClass(domain: string): string {
    const p1 = this.calculateAverages(this.period1Data());
    const p2 = this.calculateAverages(this.period2Data());
    const diff = ((p2 as any)[domain] || 0) - ((p1 as any)[domain] || 0);
    return diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-500' : 'text-slate-500';
  }

  exportPDF() {
    const p1Avg = this.calculateAverages(this.period1Data());
    const p2Avg = this.calculateAverages(this.period2Data());

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007F80; margin: 0;">EduPsych Pro</h1>
          <h2 style="color: #333; margin: 10px 0 0;">Relatório de Evolução Comparativa</h2>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
          <tr><td style="padding: 8px 0; color: #666; width: 120px;">Período 1:</td><td style="padding: 8px 0; font-weight: bold;">${escapeHtml(this.period1Start)} a ${escapeHtml(this.period1End)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Período 2:</td><td style="padding: 8px 0; font-weight: bold;">${escapeHtml(this.period2Start)} a ${escapeHtml(this.period2End)}</td></tr>
        </table>
        <h3 style="color: #007F80; font-size: 14px; margin: 20px 0 10px;">Médias por Domínio</h3>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr style="background: #f8fafc; border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Domínio</td>
            <td style="padding: 10px; font-weight: bold;">Período 1</td>
            <td style="padding: 10px; font-weight: bold;">Período 2</td>
            <td style="padding: 10px; font-weight: bold;">Variação</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">Foco</td>
            <td style="padding: 10px;">${escapeHtml(p1Avg.focus)}</td>
            <td style="padding: 10px;">${escapeHtml(p2Avg.focus)}</td>
            <td style="padding: 10px;">${(p2Avg.focus - p1Avg.focus).toFixed(1)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">Engajamento</td>
            <td style="padding: 10px;">${escapeHtml(p1Avg.engagement)}</td>
            <td style="padding: 10px;">${escapeHtml(p2Avg.engagement)}</td>
            <td style="padding: 10px;">${(p2Avg.engagement - p1Avg.engagement).toFixed(1)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">Progresso</td>
            <td style="padding: 10px;">${escapeHtml(p1Avg.skillProgress)}</td>
            <td style="padding: 10px;">${escapeHtml(p2Avg.skillProgress)}</td>
            <td style="padding: 10px;">${(p2Avg.skillProgress - p1Avg.skillProgress).toFixed(1)}</td>
          </tr>
          <tr>
            <td style="padding: 10px;">Comportamento</td>
            <td style="padding: 10px;">${escapeHtml(p1Avg.behavior)}</td>
            <td style="padding: 10px;">${escapeHtml(p2Avg.behavior)}</td>
            <td style="padding: 10px;">${(p2Avg.behavior - p1Avg.behavior).toFixed(1)}</td>
          </tr>
        </table>
        <hr style="border: 1px solid #eee; margin: 30px 0 20px;">
        <p style="text-align: center; color: #999; font-size: 11px;">Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    `;

    if (typeof html2pdf !== 'undefined') {
      const element = document.createElement('div');
      element.innerHTML = html;
      html2pdf().from(element).set({ filename: 'evolucao-comparativa.pdf', margin: 10 }).save();
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }
    }
    this.showNotification('Relatório exportado com sucesso!');
  }

  showNotification(message: string) {
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
