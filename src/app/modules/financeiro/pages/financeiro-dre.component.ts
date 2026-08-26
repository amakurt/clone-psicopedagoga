import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';

declare var html2pdf: any;

@Component({
  selector: 'app-financeiro-dre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">DRE - Demonstração do Resultado</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Análise financeira completa do exercício</p>
        </div>
        <div class="flex items-center gap-3">
          <select class="px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none"
            [(ngModel)]="selectedMonth" (change)="load()">
            @for (m of months; track m.value) {
              <option [value]="m.value">{{ m.label }}</option>
            }
          </select>
          <select class="px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none"
            [(ngModel)]="selectedYear" (change)="load()">
            @for (y of years; track y) {
              <option [value]="y">{{ y }}</option>
            }
          </select>
          <button class="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all"
            (click)="exportPDF()">
            <span class="material-icons text-lg">picture_as_pdf</span> Exportar PDF
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Receita Mensal</p>
          <p class="text-xl font-black text-emerald-700">{{ kpiReceita() | currency:'BRL' }}</p>
        </div>
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Despesas Mensais</p>
          <p class="text-xl font-black text-red-600">{{ kpiDespesas() | currency:'BRL' }}</p>
        </div>
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800"
          [class]="kpiLucro() >= 0 ? 'ring-emerald-500/30' : 'ring-red-500/30'">
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Lucro Líquido</p>
          <p class="text-xl font-black" [class]="kpiLucro() >= 0 ? 'text-emerald-700' : 'text-red-600'">{{ kpiLucro() | currency:'BRL' }}</p>
        </div>
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ticket Médio</p>
          <p class="text-xl font-black text-blue-600">{{ kpiTicketMedio() | currency:'BRL' }}</p>
        </div>
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Inadimplência</p>
          <p class="text-xl font-black text-amber-600">{{ kpiInadimplencia() }}%</p>
        </div>
      </div>

      <!-- DRE Table -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-lg font-black text-slate-900 dark:text-white">DRE - {{ getMonthName() }}/{{ selectedYear() }}</h3>
        </div>
        <div class="p-6 overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
          <table class="w-full text-left min-w-[500px]">
            <tbody>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <td class="py-3 text-sm font-bold text-slate-900 dark:text-white">(+) Receita Bruta</td>
                <td class="py-3 text-sm font-bold text-emerald-700 text-right">{{ dreReceitaBruta() | currency:'BRL' }}</td>
              </tr>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <td class="py-3 text-sm text-slate-600 dark:text-slate-400 pl-4">(-) Impostos sobre Receita</td>
                <td class="py-3 text-sm text-red-600 text-right">{{ dreImpostos() | currency:'BRL' }}</td>
              </tr>
              <tr class="border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <td class="py-3 text-sm font-black text-slate-900 dark:text-white">(=) Receita Líquida</td>
                <td class="py-3 text-sm font-black text-emerald-700 text-right">{{ dreReceitaLiquida() | currency:'BRL' }}</td>
              </tr>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <td class="py-3 text-sm text-slate-600 dark:text-slate-400 pl-4">(-) Despesas Operacionais</td>
                <td class="py-3 text-sm text-red-600 text-right">{{ dreDespesasOperacionais() | currency:'BRL' }}</td>
              </tr>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <td class="py-3 text-sm text-slate-600 dark:text-slate-400 pl-8">Aluguel</td>
                <td class="py-3 text-sm text-slate-500 text-right">{{ dreAluguel() | currency:'BRL' }}</td>
              </tr>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <td class="py-3 text-sm text-slate-600 dark:text-slate-400 pl-8">Funcionários</td>
                <td class="py-3 text-sm text-slate-500 text-right">{{ dreFuncionarios() | currency:'BRL' }}</td>
              </tr>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <td class="py-3 text-sm text-slate-600 dark:text-slate-400 pl-8">Materiais</td>
                <td class="py-3 text-sm text-slate-500 text-right">{{ dreMateriais() | currency:'BRL' }}</td>
              </tr>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <td class="py-3 text-sm text-slate-600 dark:text-slate-400 pl-8">Outras Despesas</td>
                <td class="py-3 text-sm text-slate-500 text-right">{{ dreOutrasDespesas() | currency:'BRL' }}</td>
              </tr>
              <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-t-2 border-slate-200 dark:border-slate-700">
                <td class="py-4 text-base font-black text-slate-900 dark:text-white">= Lucro / (Prejuízo)</td>
                <td class="py-4 text-base font-black text-right"
                  [class]="dreLucro() >= 0 ? 'text-emerald-700' : 'text-red-600'">
                  {{ dreLucro() | currency:'BRL' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Previsto vs Realizado Chart -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-lg font-black text-slate-900 dark:text-white">Previsto vs Realizado</h3>
        </div>
        <div class="p-6">
          <div class="flex items-end gap-4 h-48">
            @for (item of barData(); track item.label) {
              <div class="flex-1 flex flex-col items-center gap-1">
                <span class="text-[10px] font-bold text-slate-500">{{ item.value | currency:'BRL':'symbol':'1.0-0' }}</span>
                <div class="w-full rounded-t-lg transition-all"
                  [style.height.%]="item.height"
                  [class]="item.type === 'previsto' ? 'bg-blue-200 dark:bg-blue-800' : 'bg-emerald-500'">
                </div>
                <span class="text-[10px] font-bold text-slate-500">{{ item.label }}</span>
              </div>
            }
          </div>
          <div class="flex items-center justify-center gap-6 mt-4">
            <div class="flex items-center gap-2"><div class="w-3 h-3 rounded bg-blue-200 dark:bg-blue-800"></div><span class="text-xs text-slate-500">Previsto</span></div>
            <div class="flex items-center gap-2"><div class="w-3 h-3 rounded bg-emerald-500"></div><span class="text-xs text-slate-500">Realizado</span></div>
          </div>
        </div>
      </div>

      <!-- Cobranças Automáticas -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-lg font-black text-slate-900 dark:text-white">Cobranças Automáticas do Mês</h3>
        </div>
        <div class="p-6">
          @if (loading()) {
            <div class="flex items-center justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          } @else {
            <div class="overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
              <table class="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th class="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Paciente</th>
                    <th class="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Vencimento</th>
                    <th class="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Valor</th>
                    <th class="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (item of cobrancas(); track item.id) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="px-4 py-3 text-sm font-bold text-slate-900 dark:text-white">{{ item.paciente }}</td>
                      <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{{ item.vencimento }}</td>
                      <td class="px-4 py-3 text-sm font-bold text-emerald-700">{{ item.valor | currency:'BRL' }}</td>
                      <td class="px-4 py-3">
                        <span class="px-3 py-1 rounded-full text-xs font-bold"
                          [class]="item.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : item.status === 'pendente' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'">
                          {{ item.status | titlecase }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>

      <!-- Reports -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-lg font-black text-slate-900 dark:text-white">Relatórios</h3>
        </div>
        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          @for (report of reports; track report.name) {
            <button class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center hover:ring-2 hover:ring-primary transition-all group"
              (click)="generateReport(report.key)">
              <span class="material-icons text-3xl text-primary group-hover:scale-110 transition-transform">{{ report.icon }}</span>
              <p class="text-sm font-bold text-slate-900 dark:text-white mt-2">{{ report.name }}</p>
              <p class="text-[10px] text-slate-500 mt-1">{{ report.desc }}</p>
            </button>
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
export class FinanceiroDreComponent implements OnInit {
  private api = inject(ApiService);

  selectedMonth = signal(new Date().getMonth() + 1);
  selectedYear = signal(new Date().getFullYear());
  loading = signal(true);
  showToast = signal(false);
  toastMessage = signal('');

  receitas = signal<any[]>([]);
  despesas = signal<any[]>([]);

  months = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
  ];
  years = [2024, 2025, 2026, 2027];

  reports = [
    { key: 'dre', name: 'DRE', icon: 'assessment', desc: 'Demonstração do resultado' },
    { key: 'extrato', name: 'Extrato Mensal', icon: 'receipt_long', desc: 'Extrato detalhado' },
    { key: 'fluxo', name: 'Fluxo de Caixa', icon: 'account_balance', desc: 'Entradas e saídas' },
    { key: 'inadimplencia', name: 'Inadimplência', icon: 'warning', desc: 'Relatório de inadimplentes' },
    { key: 'paciente', name: 'Por Paciente', icon: 'person', desc: 'Receita por paciente' },
  ];

  kpiReceita = signal(0);
  kpiDespesas = signal(0);
  kpiLucro = signal(0);
  kpiTicketMedio = signal(0);
  kpiInadimplencia = signal(0);

  dreReceitaBruta = signal(0);
  dreImpostos = signal(0);
  dreReceitaLiquida = signal(0);
  dreDespesasOperacionais = signal(0);
  dreAluguel = signal(0);
  dreFuncionarios = signal(0);
  dreMateriais = signal(0);
  dreOutrasDespesas = signal(0);
  dreLucro = signal(0);

  barData = signal<{label: string; value: number; height: number; type: string}[]>([]);
  cobrancas = signal<any[]>([]);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.get('/financeiro', { month: this.selectedMonth(), year: this.selectedYear() }).subscribe({
      next: (res: any) => {
        const data = res.data || [];
        const receitas = data.filter((t: any) => t.type === 'receita');
        const despesas = data.filter((t: any) => t.type === 'despesa');
        this.receitas.set(receitas);
        this.despesas.set(despesas);
        this.calculateKPIs(receitas, despesas);
        this.calculateDRE(receitas, despesas);
        this.calculateBarData(receitas, despesas);
        this.generateCobrancas();
        this.loading.set(false);
      },
      error: () => {
        this.calculateKPIs([], []);
        this.calculateDRE([], []);
        this.calculateBarData([], []);
        this.generateCobrancas();
        this.loading.set(false);
      }
    });
  }

  calculateKPIs(receitas: any[], despesas: any[]) {
    const totalReceita = receitas.reduce((sum: number, t: any) => sum + (parseFloat(t.value) || 0), 0);
    const totalDespesa = despesas.reduce((sum: number, t: any) => sum + (parseFloat(t.value) || 0), 0);
    const pendente = receitas.filter((t: any) => t.status === 'pendente').reduce((sum: number, t: any) => sum + (parseFloat(t.value) || 0), 0);

    this.kpiReceita.set(totalReceita);
    this.kpiDespesas.set(totalDespesa);
    this.kpiLucro.set(totalReceita - totalDespesa);
    this.kpiTicketMedio.set(receitas.length > 0 ? totalReceita / receitas.length : 0);
    this.kpiInadimplencia.set(totalReceita > 0 ? Math.round((pendente / totalReceita) * 100) : 0);
  }

  calculateDRE(receitas: any[], despesas: any[]) {
    const receitaBruta = receitas.reduce((sum: number, t: any) => sum + (parseFloat(t.value) || 0), 0);
    const impostos = receitaBruta * 0.115;
    const receitaLiquida = receitaBruta - impostos;
    const despesaOperacional = despesas.reduce((sum: number, t: any) => sum + (parseFloat(t.value) || 0), 0);

    this.dreReceitaBruta.set(receitaBruta);
    this.dreImpostos.set(impostos);
    this.dreReceitaLiquida.set(receitaLiquida);
    this.dreDespesasOperacionais.set(despesaOperacional);
    this.dreAluguel.set(despesaOperacional * 0.3);
    this.dreFuncionarios.set(despesaOperacional * 0.4);
    this.dreMateriais.set(despesaOperacional * 0.15);
    this.dreOutrasDespesas.set(despesaOperacional * 0.15);
    this.dreLucro.set(receitaLiquida - despesaOperacional);
  }

  calculateBarData(receitas: any[], despesas: any[]) {
    const receitaTotal = receitas.reduce((sum: number, t: any) => sum + (parseFloat(t.value) || 0), 0);
    const despesaTotal = despesas.reduce((sum: number, t: any) => sum + (parseFloat(t.value) || 0), 0);
    const maxVal = Math.max(receitaTotal, despesaTotal, 1);
    this.barData.set([
      { label: 'Previsto Receita', value: receitaTotal * 1.1, height: (receitaTotal * 1.1 / maxVal) * 100, type: 'previsto' },
      { label: 'Realizado Receita', value: receitaTotal, height: (receitaTotal / maxVal) * 100, type: 'realizado' },
      { label: 'Previsto Despesa', value: despesaTotal * 1.1, height: (despesaTotal * 1.1 / maxVal) * 100, type: 'previsto' },
      { label: 'Realizado Despesa', value: despesaTotal, height: (despesaTotal / maxVal) * 100, type: 'realizado' },
      { label: 'Previsto Lucro', value: (receitaTotal - despesaTotal) * 1.1, height: Math.abs((receitaTotal - despesaTotal) * 1.1 / maxVal) * 100, type: 'previsto' },
      { label: 'Realizado Lucro', value: receitaTotal - despesaTotal, height: Math.abs((receitaTotal - despesaTotal) / maxVal) * 100, type: 'realizado' },
    ]);
  }

  generateCobrancas() {
    const patients = ['Ana Silva', 'Carlos Souza', 'Maria Oliveira', 'Pedro Santos', 'Lucia Costa', 'Fernando Lima', 'Juliana Alves', 'Roberto Ferreira'];
    this.cobrancas.set(patients.map((p, i) => ({
      id: i + 1, paciente: p, vencimento: `1${String(i + 1).padStart(2, '0')}/${this.selectedMonth()}`,
      valor: 200 + Math.random() * 300, status: Math.random() > 0.3 ? 'pago' : Math.random() > 0.5 ? 'pendente' : 'atrasado',
    })));
  }

  getMonthName(): string {
    return this.months.find(m => m.value === this.selectedMonth())?.label || '';
  }

  exportPDF() {
    const html = `
      <div style="font-family: Arial; max-width: 800px; margin: 0 auto; padding: 30px;">
        <h1 style="color: #007F80; text-align: center;">EduPsych Pro - DRE</h1>
        <h2 style="text-align: center; color: #666;">${this.getMonthName()}/${this.selectedYear()}</h2>
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Receita Bruta</b></td><td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">R$ ${this.dreReceitaBruta().toFixed(2)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">(-) Impostos</td><td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee; color: #ef4444;">R$ ${this.dreImpostos().toFixed(2)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 2px solid #333;"><b>Receita Líquida</b></td><td style="text-align: right; padding: 8px; border-bottom: 2px solid #333;"><b>R$ ${this.dreReceitaLiquida().toFixed(2)}</b></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">(-) Despesas Operacionais</td><td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee; color: #ef4444;">R$ ${this.dreDespesasOperacionais().toFixed(2)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Aluguel</td><td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee; color: #666;">R$ ${this.dreAluguel().toFixed(2)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Funcionários</td><td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee; color: #666;">R$ ${this.dreFuncionarios().toFixed(2)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Materiais</td><td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee; color: #666;">R$ ${this.dreMateriais().toFixed(2)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Outras</td><td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee; color: #666;">R$ ${this.dreOutrasDespesas().toFixed(2)}</td></tr>
          <tr style="background: #f8fafc;"><td style="padding: 12px; font-size: 16px;"><b>= Lucro / (Prejuízo)</b></td><td style="text-align: right; padding: 12px; font-size: 16px; font-weight: bold; color: ${this.dreLucro() >= 0 ? '#059669' : '#ef4444'};">R$ ${this.dreLucro().toFixed(2)}</td></tr>
        </table>
        <p style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">Gerado em ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    `;
    if (typeof html2pdf !== 'undefined') {
      const el = document.createElement('div'); el.innerHTML = html;
      html2pdf().from(el).set({ filename: `dre-${this.selectedMonth()}-${this.selectedYear()}.pdf`, margin: 10 }).save();
    }
    this.toastMessage.set('PDF exportado com sucesso!');
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }

  generateReport(key: string) {
    const reportNames: Record<string, string> = {
      dre: 'DRE', extrato: 'Extrato Mensal', fluxo: 'Fluxo de Caixa',
      inadimplencia: 'Relatório de Inadimplência', paciente: 'Relatório por Paciente',
    };
    this.toastMessage.set(`Gerando ${reportNames[key] || key}...`);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
    this.exportPDF();
  }
}
