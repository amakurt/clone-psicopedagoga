import { Component, inject, signal, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Dashboard</h1>
          <p class="text-sm text-slate-500 dark:text-slate-500 mt-1 capitalize">{{ todayLabel() }}</p>
        </div>
        <a routerLink="/app/agenda" class="inline-flex items-center gap-2 text-primary font-bold text-sm hover:opacity-80 transition-opacity">
          <span class="material-icons text-[18px]">event</span> Ver agenda completa
        </a>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        @if (loading()) {
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="p-5 bg-white dark:bg-slate-900 rounded-[1.75rem] border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
              <div class="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4"></div>
              <div class="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded-full mb-2"></div>
              <div class="h-8 w-14 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
            </div>
          }
        } @else {
          @for (card of statCards(); track card.key) {
            <button class="p-5 bg-white dark:bg-slate-900 rounded-[1.75rem] border border-slate-200 dark:border-slate-800 shadow-sm group hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer text-left"
              (click)="navigateTo(card.route)">
              <div class="size-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-4"
                [class]="card.iconClass">
                <span class="material-icons text-[22px]">{{ card.icon }}</span>
              </div>
              <p class="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">{{ card.label }}</p>
              <p class="text-3xl font-black text-slate-900 dark:text-white leading-tight">{{ card.value }}</p>
            </button>
          }
        }
      </div>

      <!-- Agenda Hoje + Sala de Espera -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Agenda de hoje -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">Agenda de hoje</h2>
            <span class="text-xs font-black text-primary uppercase tracking-widest">{{ todayCount() }} agendamento{{ todayCount() === 1 ? '' : 's' }}</span>
          </div>

          @if (loadingToday()) {
            <div class="space-y-4 animate-pulse">
              @for (i of [1,2,3,4]; track i) {
                <div class="flex items-center gap-4">
                  <div class="h-10 w-16 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                  <div class="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                  <div class="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                </div>
              }
            </div>
          } @else if (todaysAppointments().length === 0) {
            <div class="text-center py-10">
              <span class="material-icons text-5xl text-slate-500 dark:text-slate-700">event_available</span>
              <p class="text-slate-500 dark:text-slate-500 mt-3 text-sm">Nenhum agendamento para hoje</p>
            </div>
          } @else {
            <div class="space-y-3">
              @for (a of todaysAppointments(); track a.id) {
                <a [routerLink]="['/app/agenda', a.id]"
                  class="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group">
                  <div class="w-16 text-center shrink-0">
                    <p class="text-sm font-black text-slate-900 dark:text-white">{{ a.startTime }}</p>
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider">{{ a.endTime }}</p>
                  </div>
                  <div class="h-8 w-1 rounded-full shrink-0" [class]="apptDot(a.status)"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ a.patientName }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">{{ a.type || 'Sessão' }}</p>
                  </div>
                  <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0" [class]="apptChip(a.status)">{{ a.status }}</span>
                </a>
              }
              @if (todaysTotal() > todaysAppointments().length) {
                <a routerLink="/app/agenda" class="block text-center text-sm font-bold text-primary hover:opacity-80 transition-opacity pt-2">
                  Ver +{{ todaysTotal() - todaysAppointments().length }} agendamentos
                </a>
              }
            </div>
          }
        </div>

        <!-- Sala de espera -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">Sala de espera</h2>
            <a routerLink="/app/agenda/sala-espera" class="text-xs font-bold text-primary hover:opacity-80 transition-opacity shrink-0 ml-3">Abrir</a>
          </div>

          @if (loadingQueue()) {
            <div class="space-y-4 animate-pulse">
              @for (i of [1,2,3]; track i) {
                <div class="flex items-center gap-3">
                  <div class="size-8 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                  <div class="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                </div>
              }
            </div>
          } @else if (queue().length === 0) {
            <div class="text-center py-10">
              <span class="material-icons text-5xl text-slate-500 dark:text-slate-700">event_seat</span>
              <p class="text-slate-500 dark:text-slate-500 mt-3 text-sm">Ninguém aguardando</p>
            </div>
          } @else {
            <div class="space-y-3">
              @for (q of queue(); track q.id) {
                <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <div class="size-8 rounded-full flex items-center justify-center shrink-0" [class]="waitIconClass(q.status)">
                    <span class="material-icons text-sm">{{ waitIcon(q.status) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ q.paciente?.name || q.patientName }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">{{ waitSince(q.checkInAt) }}</p>
                  </div>
                  <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0" [class]="waitChip(q.status)">{{ waitLabel(q.status) }}</span>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Financeiro + Plano -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Financial Chart -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">Financeiro</h2>
            <a routerLink="/app/financeiro" class="text-xs font-bold text-primary hover:opacity-80 transition-opacity">Ver detalhes</a>
          </div>

          @if (chartLoading()) {
            <div class="h-64 flex items-end gap-3 animate-pulse">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="flex-1 rounded-t-2xl bg-slate-100 dark:bg-slate-800" [style.height]="(20 + i * 9) + '%'"></div>
              }
            </div>
          } @else {
            <div class="h-64 relative">
              <canvas #chartCanvas></canvas>
              @if (chartEmpty()) {
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <span class="material-icons text-4xl text-slate-500 dark:text-slate-700">bar_chart</span>
                    <p class="text-slate-500 dark:text-slate-500 mt-2 text-sm">Sem movimentações financeiras no período</p>
                  </div>
                </div>
              }
              @if (chartError()) {
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <span class="material-icons text-4xl text-slate-500 dark:text-slate-700">cloud_off</span>
                    <p class="text-slate-500 dark:text-slate-500 mt-2 text-sm">Não foi possível carregar os dados</p>
                    <button class="mt-3 text-sm font-bold text-primary hover:opacity-80 transition-opacity" (click)="loadFinancialChart()">Tentar novamente</button>
                  </div>
                </div>
              }
            </div>
            <div class="flex justify-center gap-8 mt-4">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-[#007F80]"></div>
                <span class="text-sm text-slate-500">Receita</span>
                <span class="text-sm font-bold text-slate-900 dark:text-white">{{ totalReceita() | currency:'BRL' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <span class="text-sm text-slate-500">Despesa</span>
                <span class="text-sm font-bold text-slate-900 dark:text-white">{{ totalDespesa() | currency:'BRL' }}</span>
              </div>
            </div>
          }
        </div>

        <!-- Uso do plano -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex flex-col">
          <div class="flex items-center justify-between mb-1">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">Plano</h2>
            <a routerLink="/app/plano" class="text-xs font-bold text-primary hover:opacity-80 transition-opacity shrink-0 ml-3">Gerenciar</a>
          </div>

          @if (loadingPlan()) {
            <div class="space-y-6 mt-6 animate-pulse">
              <div class="h-8 w-32 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
              <div class="space-y-4">
                @for (i of [1,2]; track i) {
                  <div>
                    <div class="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded-full mb-2"></div>
                    <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                  </div>
                }
              </div>
            </div>
          } @else if (planError()) {
            <div class="text-center py-12">
              <span class="material-icons text-5xl text-slate-500 dark:text-slate-700">credit_card_off</span>
              <p class="text-slate-500 dark:text-slate-500 mt-3 text-sm">Não foi possível carregar o plano</p>
            </div>
          } @else {
            <div class="flex items-center gap-3 mt-5">
              <div class="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <span class="material-icons text-[20px]">workspace_premium</span>
              </div>
              <div>
                <p class="font-black text-slate-900 dark:text-white">{{ planName() }}</p>
                <p class="text-xs text-slate-500 mt-0.5">Vence em {{ planExpiry() }}</p>
              </div>
            </div>

            <div class="space-y-5 mt-6">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pacientes</span>
                  <span class="text-xs font-black text-slate-700 dark:text-slate-300">{{ usage()?.pacientes ?? 0 }} / {{ maxLabel('pacientes') }}</span>
                </div>
                <div class="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div class="h-full rounded-full bg-primary transition-all duration-700" [style.width.%]="pct('pacientes')"></div>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Profissionais</span>
                  <span class="text-xs font-black text-slate-700 dark:text-slate-300">{{ usage()?.profissionais ?? 0 }} / {{ maxLabel('profissionais') }}</span>
                </div>
                <div class="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div class="h-full rounded-full bg-amber-500 transition-all duration-700" [style.width.%]="pct('profissionais')"></div>
                </div>
              </div>
            </div>

            <a routerLink="/app/plano" class="mt-auto pt-6 block">
              <button class="w-full bg-slate-800 hover:bg-slate-700 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white py-3 rounded-2xl font-bold text-sm transition-all active:scale-95">
                Gerenciar assinatura
              </button>
            </a>
          }
        </div>
      </div>

      <!-- Atividade Recente -->
      <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Atividade Recente</h2>
        @if (activitiesLoading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-pulse">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="flex items-start gap-3">
                <div class="size-8 bg-slate-100 dark:bg-slate-800 rounded-full shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                  <div class="h-2 w-12 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            @for (activity of activities(); track activity.id) {
              <div class="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <div class="size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  [class]="activity.colorClass">
                  <span class="material-icons text-sm">{{ activity.icon }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-slate-900 dark:text-white truncate">{{ activity.message }}</p>
                  <p class="text-xs text-slate-500 mt-0.5">{{ activity.time }}</p>
                </div>
              </div>
            }
            @if (activities().length === 0) {
              <div class="col-span-full text-center py-8">
                <span class="material-icons text-4xl text-slate-300">notifications_none</span>
                <p class="text-slate-500 mt-3 text-sm">Nenhuma atividade recente</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private chart: Chart | null = null;

  stats = signal<any>({});
  activities = signal<any[]>([]);
  totalReceita = signal(0);
  totalDespesa = signal(0);

  loading = signal(true);
  chartLoading = signal(true);
  chartError = signal(false);
  loadingPlan = signal(true);
  planError = signal(false);
  activitiesLoading = signal(true);
  loadingToday = signal(true);
  loadingQueue = signal(true);

  todaysAppointments = signal<any[]>([]);
  todaysTotal = signal(0);
  queue = signal<any[]>([]);
  plan = signal<any>(null);
  billing = signal<any>(null);
  todayLabel = signal('');

  private chartReady = false;
  private pendingChartData: any = null;

  ngOnInit() {
    const now = new Date();
    this.todayLabel.set(now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    this.loadDashboard();
    this.loadToday();
    this.loadQueue();
    this.loadFinancialChart();
    this.loadPlan();
    this.loadNotifications();
  }

  ngAfterViewInit() {
    this.chartReady = true;
    if (this.pendingChartData) {
      this.renderChart(this.pendingChartData);
    }
  }

  statCards() {
    return [
      { key: 'totalPacientes', label: 'Pacientes Ativos', value: this.stats()?.totalPacientes || 0, icon: 'people', route: '/app/pacientes', iconClass: 'bg-primary text-on-primary shadow-primary/20' },
      { key: 'totalSessoes', label: 'Sessões', value: this.stats()?.totalSessoes || 0, icon: 'psychology_alt', route: '/app/sessoes', iconClass: 'bg-emerald-100 text-emerald-600 shadow-emerald-100' },
      { key: 'documentosPendentes', label: 'Documentos Pendentes', value: this.stats()?.documentosPendentes || 0, icon: 'description', route: '/app/documentos', iconClass: 'bg-amber-100 text-amber-700 shadow-amber-100' },
      { key: 'totalEncaminhamentos', label: 'Encaminhamentos', value: this.stats()?.totalEncaminhamentos || 0, icon: 'forward', route: '/app/encaminhamentos', iconClass: 'bg-sky-100 text-sky-600 shadow-sky-100' },
      { key: 'casosArquivados', label: 'Casos Arquivados', value: this.stats()?.casosArquivados || 0, icon: 'archive', route: '/app/sessoes', iconClass: 'bg-slate-100 text-slate-600 shadow-slate-100' },
      { key: 'protocolosTEA', label: 'Protocolos TEA', value: this.stats()?.protocolosTEA || 0, icon: 'psychology', route: '/app/protocolos', iconClass: 'bg-purple-100 text-purple-600 shadow-purple-100' },
    ];
  }

  todayCount() { return this.todaysTotal(); }

  loadDashboard() {
    this.api.get('/dashboard').subscribe({
      next: (res: any) => {
        this.stats.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadToday() {
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.api.get('/appointments', { date: iso }).subscribe({
      next: (res: any) => {
        const today = (res.data || []).filter((a: any) => a.status !== 'CANCELADO');
        today.sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''));
        this.todaysTotal.set(today.length);
        this.todaysAppointments.set(today.slice(0, 6));
        this.loadingToday.set(false);
      },
      error: () => this.loadingToday.set(false)
    });
  }

  loadQueue() {
    this.api.get('/waiting-room').subscribe({
      next: (res: any) => {
        this.queue.set((res.data || []).filter((q: any) => q.status !== 'CONCLUIDO'));
        this.loadingQueue.set(false);
      },
      error: () => this.loadingQueue.set(false)
    });
  }

  loadPlan() {
    this.api.get('/billing').subscribe({
      next: (res: any) => {
        this.billing.set(res);
        this.plan.set(res.plan || null);
        this.loadingPlan.set(false);
      },
      error: () => {
        this.planError.set(true);
        this.loadingPlan.set(false);
      }
    });
  }

  planName(): string {
    const p = this.plan();
    const name = p?.name || p?.code || 'Trial';
    const status = this.billing()?.subscription?.status;
    return status === 'ATIVA' || status === 'TRIAL' ? name : `${name} (${status || 'pendente'})`;
  }

  planExpiry(): string {
    const end = this.billing()?.subscription?.currentPeriodEnd;
    if (!end) return '—';
    return new Date(end).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  maxLabel(kind: 'pacientes' | 'profissionais'): string {
    const b = this.billing();
    const max = kind === 'pacientes' ? b?.maxPacientes : b?.maxProfissionais;
    if (!max || max >= 1000) return 'ilimitado';
    return String(max);
  }

  pct(kind: 'pacientes' | 'profissionais'): number {
    const b = this.billing();
    const used = kind === 'pacientes' ? b?.usage?.pacientes ?? 0 : b?.usage?.profissionais ?? 0;
    const max = kind === 'pacientes' ? b?.maxPacientes : b?.maxProfissionais;
    if (!max || max >= 1000) return Math.min(100, used > 0 ? 12 : 0);
    return Math.min(100, Math.round((used / max) * 100));
  }

  usage() { return this.billing()?.usage || null; }

  loadFinancialChart() {
    this.chartLoading.set(true);
    this.chartError.set(false);
    this.api.get('/financeiro').subscribe({
      next: (res: any) => {
        const transactions = res.data || [];
        const months: Record<string, { receita: number; despesa: number }> = {};

        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
          months[key] = { receita: 0, despesa: 0 };
        }

        let totalR = 0, totalD = 0;
        transactions.forEach((t: any) => {
          if (t.status !== 'PAGO') return;
          const d = new Date(t.date || t.createdAt);
          const key = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
          if (months[key]) {
            const val = parseFloat(t.valor) || 0;
            if (t.tipo === 'RECEITA' || t.type === 'RECEITA') {
              months[key].receita += val;
              totalR += val;
            } else {
              months[key].despesa += val;
              totalD += val;
            }
          }
        });

        this.totalReceita.set(totalR);
        this.totalDespesa.set(totalD);

        this.pendingChartData = {
          labels: Object.keys(months),
          receitaData: Object.keys(months).map(l => months[l].receita),
          despesaData: Object.keys(months).map(l => months[l].despesa),
        };
        if (this.chartReady) {
          this.renderChart(this.pendingChartData);
        }
        this.chartLoading.set(false);
      },
      error: () => {
        this.chartLoading.set(false);
        this.chartError.set(true);
      }
    });
  }

  chartEmpty(): boolean {
    return !this.chartError() && this.chartLoading() === false && this.totalReceita() === 0 && this.totalDespesa() === 0;
  }

  renderChart(data: any) {
    if (!this.chartCanvas?.nativeElement) return;
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Receita',
            data: data.receitaData,
            backgroundColor: '#007F80',
            borderRadius: 8,
            barPercentage: 0.6,
          },
          {
            label: 'Despesa',
            data: data.despesaData,
            backgroundColor: '#EF4444',
            borderRadius: 8,
            barPercentage: 0.6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { weight: 'bold' as const },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (ctx: any) => `${ctx.dataset.label}: R$ ${(ctx.parsed.y || 0).toLocaleString('pt-BR')}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11, weight: 'bold' as const }, color: '#94A3B8' }
          },
          y: {
            grid: { color: '#F1F5F9' },
            ticks: {
              font: { size: 11 },
              color: '#94A3B8',
              callback: (value: any) => `R$ ${Number(value).toLocaleString('pt-BR')}`
            }
          }
        }
      }
    });
  }

  loadNotifications() {
    this.activitiesLoading.set(true);
    this.api.get('/notifications').subscribe({
      next: (res: any) => {
        const notifs = (res.data || []).slice(0, 5);
        const activities = notifs.map((n: any) => ({
          id: n.id,
          message: n.message || n.title,
          time: new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          icon: this.getNotifIcon(n.type || n.title),
          colorClass: this.getNotifColor(n.type || n.title),
        }));
        if (activities.length === 0) {
          activities.push({
            id: 'welcome',
            message: 'Bem-vindo ao Dashboard',
            time: 'Agora',
            icon: 'info',
            colorClass: 'bg-primary/10 text-primary'
          });
        }
        this.activities.set(activities);
        this.activitiesLoading.set(false);
      },
      error: () => {
        this.activities.set([]);
        this.activitiesLoading.set(false);
      }
    });
  }

  getNotifIcon(type: string): string {
    if (type.includes('paciente') || type.includes('Paciente')) return 'person_add';
    if (type.includes('documento') || type.includes('Documento')) return 'description';
    if (type.includes('sessao') || type.includes('Sessão') || type.includes('evolucao')) return 'check_circle';
    if (type.includes('pagamento') || type.includes('Pagamento') || type.includes('Financeiro')) return 'payments';
    if (type.includes('agendamento') || type.includes('Agendamento')) return 'calendar_month';
    return 'notifications';
  }

  getNotifColor(type: string): string {
    if (type.includes('paciente') || type.includes('Paciente')) return 'bg-blue-100 text-blue-600';
    if (type.includes('documento') || type.includes('Documento')) return 'bg-amber-100 text-amber-700';
    if (type.includes('sessao') || type.includes('Sessão') || type.includes('evolucao')) return 'bg-green-100 text-green-600';
    if (type.includes('pagamento') || type.includes('Pagamento') || type.includes('Financeiro')) return 'bg-purple-100 text-purple-600';
    if (type.includes('agendamento') || type.includes('Agendamento')) return 'bg-cyan-100 text-cyan-600';
    return 'bg-slate-100 text-slate-600';
  }

  apptDot(status: string): string {
    if (status === 'CONFIRMADO') return 'bg-emerald-500';
    if (status === 'CONCLUIDO') return 'bg-emerald-500';
    if (status === 'CANCELADO') return 'bg-red-400';
    return 'bg-amber-500';
  }

  apptChip(status: string): string {
    if (status === 'CONFIRMADO') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
    if (status === 'CONCLUIDO') return 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400';
    if (status === 'CANCELADO') return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
  }

  waitIcon(status: string): string {
    if (status === 'CHAMADO') return 'campaign';
    if (status === 'EM_SESSAO') return 'psychology_alt';
    return 'hourglass_top';
  }

  waitIconClass(status: string): string {
    if (status === 'CHAMADO') return 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400';
    if (status === 'EM_SESSAO') return 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
  }

  waitLabel(status: string): string {
    if (status === 'CHAMADO') return 'Chamado';
    if (status === 'EM_SESSAO') return 'Em sessão';
    return 'Aguardando';
  }

  waitChip(status: string): string {
    return this.waitIconClass(status);
  }

  waitSince(checkInAt: string): string {
    if (!checkInAt) return '—';
    const diff = Math.floor((Date.now() - new Date(checkInAt).getTime()) / 60000);
    if (diff < 1) return 'agora mesmo';
    if (diff < 60) return `há ${diff} min`;
    const h = Math.floor(diff / 60);
    return `há ${h}h${diff % 60 ? ` ${diff % 60}min` : ''}`;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

}