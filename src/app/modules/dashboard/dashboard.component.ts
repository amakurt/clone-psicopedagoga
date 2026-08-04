import { Component, inject, signal, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-in">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <button class="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:-translate-y-1 transition-all cursor-pointer text-left w-full"
          (click)="navigateTo('/app/pacientes')">
          <div class="size-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <span class="material-icons text-[28px]">people</span>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Pacientes Ativos</p>
            <p class="text-3xl font-black text-slate-900 dark:text-white leading-tight">{{ stats()?.totalPacientes || 0 }}</p>
          </div>
        </button>

        <button class="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:-translate-y-1 transition-all cursor-pointer text-left w-full"
          (click)="navigateTo('/app/documentos')">
          <div class="size-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-100 group-hover:scale-110 transition-transform">
            <span class="material-icons text-[28px]">description</span>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Documentos Pendentes</p>
            <p class="text-3xl font-black text-slate-900 dark:text-white leading-tight">{{ stats()?.documentosPendentes || 0 }}</p>
          </div>
        </button>

        <button class="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:-translate-y-1 transition-all cursor-pointer text-left w-full"
          (click)="navigateTo('/app/sessoes')">
          <div class="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform">
            <span class="material-icons text-[28px]">archive</span>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Casos Arquivados</p>
            <p class="text-3xl font-black text-slate-900 dark:text-white leading-tight">{{ stats()?.casosArquivados || 0 }}</p>
          </div>
        </button>

        <button class="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:-translate-y-1 transition-all cursor-pointer text-left w-full"
          (click)="navigateTo('/app/protocolos')">
          <div class="size-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-lg shadow-purple-100 group-hover:scale-110 transition-transform">
            <span class="material-icons text-[28px]">psychology</span>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Protocolos TEA</p>
            <p class="text-3xl font-black text-slate-900 dark:text-white leading-tight">{{ stats()?.protocolosTEA || 0 }}</p>
          </div>
        </button>
      </div>

      <!-- Charts + Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Financial Chart -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Financeiro</h2>
          <div class="h-64 relative">
            <canvas #chartCanvas></canvas>
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
        </div>

        <!-- Activity Feed -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Atividade Recente</h2>
          <div class="space-y-4">
            @for (activity of activities(); track activity.id) {
              <div class="flex items-start gap-3">
                <div class="size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  [class]="activity.colorClass">
                  <span class="material-icons text-sm">{{ activity.icon }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-slate-900 dark:text-white truncate">{{ activity.message }}</p>
                  <p class="text-xs text-slate-400 mt-0.5">{{ activity.time }}</p>
                </div>
              </div>
            }
            @if (activities().length === 0) {
              <div class="text-center py-8">
                <span class="material-icons text-4xl text-slate-300">notifications_none</span>
                <p class="text-slate-400 mt-3 text-sm">Nenhuma atividade recente</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Notification Lab -->
      <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Laboratório de Notificações</h2>
        <div class="flex gap-3 flex-wrap">
          <button class="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            (click)="createTestNotification('Paciente cadastrado com sucesso', 'paciente')">
            <span class="material-icons text-lg">person_add</span> Novo Paciente
          </button>
          <button class="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2"
            (click)="createTestNotification('Documento pendente de assinatura', 'documento')">
            <span class="material-icons text-lg">description</span> Documento
          </button>
          <button class="px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
            (click)="createTestNotification('Sessão concluída com sucesso', 'evolucao')">
            <span class="material-icons text-lg">check_circle</span> Evolução
          </button>
          <button class="px-5 py-2.5 bg-purple-500 text-white rounded-xl text-sm font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
            (click)="createTestNotification('Pagamento recebido', 'pagamento')">
            <span class="material-icons text-lg">payments</span> Pagamento
          </button>
        </div>

        @if (showToast()) {
          <div class="mt-4 p-4 rounded-xl flex items-center gap-3 animate-in"
            [class]="toastType() === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'">
            <span class="material-icons">{{ toastType() === 'success' ? 'check_circle' : 'info' }}</span>
            <span class="text-sm font-medium">{{ toastMessage() }}</span>
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
  private router = inject(Router);
  private chart: Chart | null = null;

  stats = signal<any>({});
  activities = signal<any[]>([]);
  totalReceita = signal(0);
  totalDespesa = signal(0);
  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal('info');

  private chartReady = false;
  private pendingChartData: any = null;

  ngOnInit() {
    this.loadDashboard();
    this.loadFinancialChart();
    this.loadNotifications();
  }

  ngAfterViewInit() {
    this.chartReady = true;
    if (this.pendingChartData) {
      this.renderChart(this.pendingChartData);
    }
  }

  loadDashboard() {
    this.api.get('/dashboard').subscribe({
      next: (res: any) => {
        this.stats.set(res);
        this.activities.set(res.activities || []);
      },
      error: () => {}
    });
  }

  loadFinancialChart() {
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

        const labels = Object.keys(months);
        const receitaData = labels.map(l => months[l].receita);
        const despesaData = labels.map(l => months[l].despesa);

        this.pendingChartData = { labels, receitaData, despesaData };
        if (this.chartReady) {
          this.renderChart(this.pendingChartData);
        }
      },
      error: () => {
        const now = new Date();
        const labels = [];
        const receitaData = [];
        const despesaData = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          labels.push(d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase());
          receitaData.push(Math.random() * 5000 + 1000);
          despesaData.push(Math.random() * 3000 + 500);
        }
        this.pendingChartData = { labels, receitaData, despesaData };
        if (this.chartReady) {
          this.renderChart(this.pendingChartData);
        }
      }
    });
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
      },
      error: () => {}
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
    if (type.includes('documento') || type.includes('Documento')) return 'bg-amber-100 text-amber-600';
    if (type.includes('sessao') || type.includes('Sessão') || type.includes('evolucao')) return 'bg-green-100 text-green-600';
    if (type.includes('pagamento') || type.includes('Pagamento') || type.includes('Financeiro')) return 'bg-purple-100 text-purple-600';
    if (type.includes('agendamento') || type.includes('Agendamento')) return 'bg-cyan-100 text-cyan-600';
    return 'bg-slate-100 text-slate-600';
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  createTestNotification(message: string, type: string) {
    this.api.post('/notifications', { title: message, message, type, read: false }).subscribe({
      next: () => {
        this.showToast.set(true);
        this.toastMessage.set('Notificação criada com sucesso!');
        this.toastType.set('success');
        this.loadNotifications();
        setTimeout(() => this.showToast.set(false), 3000);
      },
      error: () => {
        this.showToast.set(true);
        this.toastMessage.set('Notificação criada (modo local)');
        this.toastType.set('info');
        const newActivity = {
          id: Date.now().toString(),
          message,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          icon: this.getNotifIcon(type),
          colorClass: this.getNotifColor(type),
        };
        this.activities.update(a => [newActivity, ...a].slice(0, 5));
        setTimeout(() => this.showToast.set(false), 3000);
      }
    });
  }
}
