import { Component, inject, signal, OnInit, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ApiService } from '@core/services/api.service';
import { AbaService } from '../services/aba.service';
import { ABLLS_R_DOMAINS, ABLLS_TOTAL_SKILLS, ABLLS_SCORE_LABELS } from '../data/ablls-r';
import { VB_MAPP_DOMAINS, VB_MAPP_TOTAL_MILESTONES, VB_MAPP_SCORE_LABELS } from '../data/vb-mapp';
import { DENVER_DOMAINS, DENVER_TOTAL_ITEMS, DENVER_SCORE_LABELS } from '../data/denver';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

declare var html2pdf: any;

type ProtocolType = 'ABLLS-R' | 'VB-MAPP' | 'DENVER';

@Component({
  selector: 'app-aba-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/app/protocolos-aba" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <span class="material-icons text-slate-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white">Avaliação ABA</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Protocolos de Análise do Comportamento Aplicada</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="exportPDF()" class="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all">
            <span class="material-icons text-[18px]">picture_as_pdf</span>
            Exportar PDF
          </button>
          <button (click)="save()" [disabled]="saving() || !selectedPatientId()"
            class="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50">
            <span class="material-icons text-[18px]">save</span>
            {{ saving() ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <!-- Patient & Protocol Selection -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Paciente *</label>
            <select [(ngModel)]="selectedPatientId" class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium">
              <option value="">Selecione um paciente</option>
              @for (p of patients(); track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Data</label>
            <input type="date" [(ngModel)]="assessmentDate" class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Buscar Habilidade</label>
            <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar habilidade..."
              class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium">
          </div>
        </div>
      </div>

      <!-- Protocol Tabs -->
      <div class="flex gap-2 bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        @for (protocol of protocols; track protocol) {
          <button (click)="selectedProtocol.set(protocol)"
            class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all"
            [class]="selectedProtocol() === protocol
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'">
            <span class="material-icons text-[18px]">{{ getProtocolIcon(protocol) }}</span>
            {{ protocol }}
          </button>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Domains Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden sticky top-4">
            <div class="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 class="font-black text-slate-900 dark:text-white text-sm">Domínios</h3>
            </div>
            <div class="p-2">
              @for (domain of currentDomains(); track domain.id) {
                <button (click)="selectDomain(domain)"
                  class="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group"
                  [class]="selectedDomain()?.id === domain.id ? 'bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'">
                  <div class="w-3 h-3 rounded-full shrink-0" [style.background]="domain.color"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold truncate"
                      [class]="selectedDomain()?.id === domain.id ? 'text-primary' : 'text-slate-900 dark:text-white'">
                      {{ domain.name }}
                    </p>
                    <p class="text-xs text-slate-400">{{ getDomainScore(domain) }}/{{ getDomainMax(domain) }}</p>
                  </div>
                  <span class="text-xs font-black px-2 py-0.5 rounded-full"
                    [style.background]="domain.color + '20'" [style.color]="domain.color">
                    {{ getDomainPercent(domain) }}%
                  </span>
                </button>
              }
            </div>

            <!-- Summary Stats -->
            <div class="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div class="text-center">
                <p class="text-4xl font-black text-primary">{{ overallPercentage() }}%</p>
                <p class="text-xs text-slate-400 mt-1">Pontuação Geral</p>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div class="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p class="text-lg font-black text-slate-900 dark:text-white">{{ totalScore() }}</p>
                  <p class="text-[10px] text-slate-400">Pontos</p>
                </div>
                <div class="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p class="text-lg font-black text-slate-900 dark:text-white">{{ totalMax() }}</p>
                  <p class="text-[10px] text-slate-400">Máximo</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div class="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <p class="text-lg font-black text-emerald-600">{{ acquiredCount() }}</p>
                  <p class="text-[10px] text-emerald-500">Adquiridos</p>
                </div>
                <div class="text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <p class="text-lg font-black text-amber-600">{{ inProgressCount() }}</p>
                  <p class="text-[10px] text-amber-500">Em Progresso</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          @if (selectedDomain()) {
            <!-- Radar Chart -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <h3 class="font-black text-slate-900 dark:text-white text-sm mb-4">Gráfico de Progresso</h3>
              <div class="flex justify-center">
                <canvas #radarChart width="400" height="400"></canvas>
              </div>
            </div>

            <!-- Domain Items -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
              <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 class="font-black text-slate-900 dark:text-white text-sm">{{ selectedDomain()!.name }}</h4>
                  <p class="text-xs text-slate-400 mt-0.5">{{ getDomainItems().length }} habilidades</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-black"
                  [style.background]="selectedDomain()!.color + '20'" [style.color]="selectedDomain()!.color">
                  {{ getDomainScore(selectedDomain()!) }}/{{ getDomainMax(selectedDomain()!) }}
                </span>
              </div>
              <div class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (item of getDomainItems(); track item.id; let i = $index) {
                  @if (!searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                    <div class="px-4 py-3 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <span class="text-xs font-bold text-slate-400 w-8 text-center">{{ i + 1 }}</span>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold text-slate-900 dark:text-white">{{ item.name }}</p>
                        <p class="text-xs text-slate-400 truncate">{{ item.description }}</p>
                      </div>
                      <div class="flex gap-1 shrink-0">
                        @for (score of getScoreRange(); track score) {
                          <button (click)="setScore(item.id, score)"
                            class="w-10 h-10 rounded-lg font-bold text-xs transition-all"
                            [class]="getScore(item.id) === score
                              ? getScoreButtonClass(score)
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200'">
                            {{ score }}
                          </button>
                        }
                      </div>
                    </div>
                  }
                }
              </div>
            </div>

            <!-- Notes -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Observações</label>
              <textarea [(ngModel)]="notes" rows="3" placeholder="Adicione observações sobre a avaliação..."
                class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium resize-none"></textarea>
            </div>
          } @else {
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-12 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 text-center">
              <span class="material-icons text-6xl text-slate-300 dark:text-slate-600">touch_app</span>
              <h3 class="mt-4 text-lg font-bold text-slate-900 dark:text-white">Selecione um domínio</h3>
              <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Escolha um domínio ao lado para iniciar a avaliação</p>
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
export class AbaAssessmentComponent implements OnInit {
  @ViewChild('radarChart') radarChartRef!: ElementRef<HTMLCanvasElement>;

  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protocols: ProtocolType[] = ['ABLLS-R', 'VB-MAPP', 'DENVER'];

  patients = signal<any[]>([]);
  selectedPatientId = signal('');
  assessmentDate = new Date().toISOString().split('T')[0];
  selectedProtocol = signal<ProtocolType>('ABLLS-R');
  selectedDomain = signal<any>(null);
  evaluations = signal<Record<string, number>>({});
  searchTerm = '';
  notes = '';
  saving = signal(false);
  showToast = signal(false);
  toastMessage = signal('');

  private chart: Chart | null = null;
  isEdit = false;
  assessmentId = '';

  ngOnInit() {
    this.assessmentId = this.route.snapshot.paramMap.get('id') || '';
    this.isEdit = !!this.assessmentId;

    this.api.get('/pacientes').subscribe((res: any) => {
      this.patients.set(res.data || []);

      if (this.isEdit) {
        this.loadAssessment();
      } else {
        this.selectDomain(this.currentDomains()[0]);
      }
    });

    effect(() => {
      this.selectedProtocol();
      this.evaluations.set({});
      this.selectedDomain.set(null);
      setTimeout(() => {
        const domains = this.currentDomains();
        if (domains.length > 0) this.selectDomain(domains[0]);
      }, 50);
    });
  }

  loadAssessment() {
    this.api.get(`/aba/assessments/${this.assessmentId}`).subscribe({
      next: (res: any) => {
        this.selectedPatientId.set(res.patientId || '');
        this.assessmentDate = res.assessedAt ? new Date(res.assessedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        this.selectedProtocol.set(res.protocolType as ProtocolType);
        this.notes = res.notes || '';
        if (res.evaluations) {
          try { this.evaluations.set(JSON.parse(res.evaluations)); } catch { this.evaluations.set({}); }
        }
        setTimeout(() => {
          const domains = this.currentDomains();
          if (domains.length > 0) this.selectDomain(domains[0]);
        }, 100);
      },
      error: () => { this.router.navigate(['/app/protocolos-aba']); }
    });
  }

  currentDomains(): any[] {
    switch (this.selectedProtocol()) {
      case 'ABLLS-R': return ABLLS_R_DOMAINS.map(d => ({ ...d, items: d.skills }));
      case 'VB-MAPP': return VB_MAPP_DOMAINS.map(d => ({ ...d, items: d.milestones }));
      case 'DENVER': return DENVER_DOMAINS.map(d => ({ ...d, items: d.items }));
      default: return [];
    }
  }

  getScoreRange(): number[] {
    switch (this.selectedProtocol()) {
      case 'ABLLS-R': return [0, 1, 2];
      case 'VB-MAPP': return [0, 1, 2, 3];
      case 'DENVER': return [0, 1, 2, 3];
      default: return [0, 1, 2];
    }
  }

  getMaxScore(): number {
    switch (this.selectedProtocol()) {
      case 'ABLLS-R': return 2;
      case 'VB-MAPP': return 3;
      case 'DENVER': return 3;
      default: return 2;
    }
  }

  getScoreLabels(): Record<number, string> {
    switch (this.selectedProtocol()) {
      case 'ABLLS-R': return ABLLS_SCORE_LABELS;
      case 'VB-MAPP': return VB_MAPP_SCORE_LABELS;
      case 'DENVER': return DENVER_SCORE_LABELS;
      default: return {};
    }
  }

  getTotalItems(): number {
    switch (this.selectedProtocol()) {
      case 'ABLLS-R': return ABLLS_TOTAL_SKILLS;
      case 'VB-MAPP': return VB_MAPP_TOTAL_MILESTONES;
      case 'DENVER': return DENVER_TOTAL_ITEMS;
      default: return 0;
    }
  }

  getProtocolIcon(protocol: ProtocolType): string {
    switch (protocol) {
      case 'ABLLS-R': return 'assessment';
      case 'VB-MAPP': return 'psychology';
      case 'DENVER': return 'child_care';
      default: return 'science';
    }
  }

  selectDomain(domain: any) {
    this.selectedDomain.set(domain);
    setTimeout(() => this.updateChart(), 100);
  }

  getDomainItems(): any[] {
    return this.selectedDomain()?.items || [];
  }

  getScore(itemId: string): number {
    return this.evaluations()[itemId] ?? -1;
  }

  setScore(itemId: string, score: number) {
    this.evaluations.update(e => ({ ...e, [itemId]: score }));
    this.updateChart();
  }

  getScoreButtonClass(score: number): string {
    const max = this.getMaxScore();
    const ratio = max > 0 ? score / max : 0;
    if (ratio >= 0.67) return 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300';
    if (ratio >= 0.33) return 'bg-amber-100 text-amber-700 ring-2 ring-amber-300';
    return 'bg-red-100 text-red-700 ring-2 ring-red-300';
  }

  getDomainScore(domain: any): number {
    let score = 0;
    const evals = this.evaluations();
    (domain.items || []).forEach((item: any) => {
      score += evals[item.id] || 0;
    });
    return score;
  }

  getDomainMax(domain: any): number {
    return (domain.items || []).length * this.getMaxScore();
  }

  getDomainPercent(domain: any): number {
    const max = this.getDomainMax(domain);
    return max > 0 ? Math.round((this.getDomainScore(domain) / max) * 100) : 0;
  }

  totalScore(): number {
    return Object.values(this.evaluations()).reduce((sum, v) => sum + v, 0);
  }

  totalMax(): number {
    return this.currentDomains().reduce((sum, d) => sum + this.getDomainMax(d), 0);
  }

  overallPercentage(): number {
    const max = this.totalMax();
    return max > 0 ? Math.round((this.totalScore() / max) * 100) : 0;
  }

  acquiredCount(): number {
    const max = this.getMaxScore();
    return Object.values(this.evaluations()).filter(v => v === max).length;
  }

  inProgressCount(): number {
    const max = this.getMaxScore();
    return Object.values(this.evaluations()).filter(v => v > 0 && v < max).length;
  }

  updateChart() {
    if (!this.radarChartRef) return;
    if (this.chart) this.chart.destroy();

    const domains = this.currentDomains();
    const labels = domains.map(d => d.name);
    const data = domains.map(d => {
      const score = this.getDomainScore(d);
      const max = this.getDomainMax(d);
      return max > 0 ? Math.round((score / max) * 100) : 0;
    });
    const colors = domains.map(d => d.color);

    this.chart = new Chart(this.radarChartRef.nativeElement, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: this.selectedProtocol(),
          data,
          backgroundColor: colors[0] + '20',
          borderColor: colors[0],
          borderWidth: 2,
          pointBackgroundColor: colors,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5
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
            pointLabels: { font: { size: 11, weight: 'bold' } }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  save() {
    if (!this.selectedPatientId()) return;
    this.saving.set(true);

    const evals = this.evaluations();
    const totalScore = this.totalScore();
    const totalMax = this.totalMax();

    const domainScores: Record<string, number> = {};
    this.currentDomains().forEach(d => {
      domainScores[d.id] = this.getDomainScore(d);
    });

    const data = {
      patientId: this.selectedPatientId(),
      professionalId: this.auth.user()?.id || '',
      protocolType: this.selectedProtocol(),
      evaluations: JSON.stringify(evals),
      totalScore,
      domainScores: JSON.stringify(domainScores),
      notes: this.notes,
      assessedAt: this.assessmentDate
    };

    const req = this.isEdit
      ? this.api.put(`/aba/assessments/${this.assessmentId}`, data)
      : this.api.post('/aba/assessments', data);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast('Avaliação salva com sucesso!');
        setTimeout(() => this.router.navigate(['/app/protocolos-aba']), 1500);
      },
      error: () => { this.saving.set(false); this.toast('Erro ao salvar avaliação'); }
    });
  }

  toast(msg: string) {
    this.toastMessage.set(msg);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }

  exportPDF() {
    const protocol = this.selectedProtocol();
    const domains = this.currentDomains();
    const labels = this.getScoreLabels();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007F80; margin: 0;">EduPsych Pro</h1>
          <h2 style="color: #333; margin: 10px 0 0;">Avaliação ABA - ${protocol}</h2>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
          <tr><td style="padding: 8px 0; color: #666; width: 120px;">Paciente:</td><td style="padding: 8px 0; font-weight: bold;">${this.patients().find(p => p.id === this.selectedPatientId())?.name || '—'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Protocolo:</td><td style="padding: 8px 0; font-weight: bold;">${protocol}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Data:</td><td style="padding: 8px 0;">${new Date(this.assessmentDate).toLocaleDateString('pt-BR')}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Pontuação:</td><td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #007F80;">${this.totalScore()}/${this.totalMax()} (${this.overallPercentage()}%)</td></tr>
        </table>
        ${domains.map(domain => `
          <h3 style="color: ${domain.color}; font-size: 14px; margin: 20px 0 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${domain.name} — ${this.getDomainScore(domain)}/${this.getDomainMax(domain)}</h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse; margin-bottom: 15px;">
            ${(domain.items || []).map((item: any) => `
              <tr style="border-bottom: 1px solid #f5f5f5;">
                <td style="padding: 8px; color: #666; width: 70%;">${item.name}</td>
                <td style="padding: 8px; text-align: right; font-weight: bold;">${labels[this.evaluations()[item.id] || 0] || '—'}</td>
              </tr>
            `).join('')}
          </table>
        `).join('')}
        ${this.notes ? `<h3 style="color: #333; font-size: 14px; margin: 20px 0 10px;">Observações</h3><p style="font-size: 12px; color: #666;">${this.notes}</p>` : ''}
        <hr style="border: 1px solid #eee; margin: 30px 0 20px;">
        <p style="text-align: center; color: #999; font-size: 11px;">Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    `;

    if (typeof html2pdf !== 'undefined') {
      const element = document.createElement('div');
      element.innerHTML = html;
      html2pdf().from(element).set({ filename: `avaliacao-aba-${protocol}-${this.assessmentDate}.pdf`, margin: 10 }).save();
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) { printWindow.document.write(html); printWindow.document.close(); printWindow.print(); }
    }
    this.toast('PDF exportado com sucesso!');
  }
}
