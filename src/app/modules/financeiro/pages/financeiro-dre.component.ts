import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';

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
        <div class="flex flex-wrap items-center gap-3">
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
          <button class="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all text-slate-700 dark:text-slate-200 shadow-sm"
            (click)="openReportModal('dre')">
            <span class="material-icons text-lg text-primary">picture_as_pdf</span> Visualizar / Exportar DRE
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Receita Mensal</p>
          <p class="text-xl font-black text-emerald-700 dark:text-emerald-400">{{ kpiReceita() | currency:'BRL' }}</p>
        </div>
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Despesas Mensais</p>
          <p class="text-xl font-black text-red-600 dark:text-red-400">{{ kpiDespesas() | currency:'BRL' }}</p>
        </div>
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800"
          [class]="kpiLucro() >= 0 ? 'ring-emerald-500/30' : 'ring-red-500/30'">
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Lucro Líquido</p>
          <p class="text-xl font-black" [class]="kpiLucro() >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">{{ kpiLucro() | currency:'BRL' }}</p>
        </div>
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ticket Médio</p>
          <p class="text-xl font-black text-blue-600 dark:text-blue-400">{{ kpiTicketMedio() | currency:'BRL' }}</p>
        </div>
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Inadimplência</p>
          <p class="text-xl font-black text-amber-600 dark:text-amber-400">{{ kpiInadimplencia() }}%</p>
        </div>
      </div>

      <!-- DRE Table -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-black text-slate-900 dark:text-white">DRE - {{ getMonthName() }}/{{ selectedYear() }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Estrutura de receitas, impostos e custos operacionais</p>
          </div>
          <button (click)="openReportModal('dre')" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span class="material-icons text-sm">visibility</span> Relatório Completo
          </button>
        </div>
        <div class="p-6 overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
          <table class="w-full text-left min-w-[500px]">
            <tbody>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <td class="py-3 text-sm font-bold text-slate-900 dark:text-white">(+) Receita Bruta</td>
                <td class="py-3 text-sm font-bold text-emerald-700 dark:text-emerald-400 text-right">{{ dreReceitaBruta() | currency:'BRL' }}</td>
              </tr>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <td class="py-3 text-sm text-slate-600 dark:text-slate-400 pl-4">(-) Impostos sobre Receita (est. 11.5%)</td>
                <td class="py-3 text-sm text-red-600 dark:text-red-400 text-right">{{ dreImpostos() | currency:'BRL' }}</td>
              </tr>
              <tr class="border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <td class="py-3 text-sm font-black text-slate-900 dark:text-white">(=) Receita Líquida</td>
                <td class="py-3 text-sm font-black text-emerald-700 dark:text-emerald-400 text-right">{{ dreReceitaLiquida() | currency:'BRL' }}</td>
              </tr>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <td class="py-3 text-sm text-slate-600 dark:text-slate-400 pl-4">(-) Despesas Operacionais</td>
                <td class="py-3 text-sm text-red-600 dark:text-red-400 text-right">{{ dreDespesasOperacionais() | currency:'BRL' }}</td>
              </tr>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <td class="py-3 text-sm text-slate-600 dark:text-slate-400 pl-8">Aluguel & Condomínio</td>
                <td class="py-3 text-sm text-slate-500 dark:text-slate-400 text-right">{{ dreAluguel() | currency:'BRL' }}</td>
              </tr>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <td class="py-3 text-sm text-slate-600 dark:text-slate-400 pl-8">Funcionários / Pró-labore</td>
                <td class="py-3 text-sm text-slate-500 dark:text-slate-400 text-right">{{ dreFuncionarios() | currency:'BRL' }}</td>
              </tr>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <td class="py-3 text-sm text-slate-600 dark:text-slate-400 pl-8">Materiais Clínicos & Didáticos</td>
                <td class="py-3 text-sm text-slate-500 dark:text-slate-400 text-right">{{ dreMateriais() | currency:'BRL' }}</td>
              </tr>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <td class="py-3 text-sm text-slate-600 dark:text-slate-400 pl-8">Outras Despesas Operacionais</td>
                <td class="py-3 text-sm text-slate-500 dark:text-slate-400 text-right">{{ dreOutrasDespesas() | currency:'BRL' }}</td>
              </tr>
              <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-t-2 border-slate-200 dark:border-slate-700">
                <td class="py-4 text-base font-black text-slate-900 dark:text-white">= Lucro / (Prejuízo) Líquido</td>
                <td class="py-4 text-base font-black text-right"
                  [class]="dreLucro() >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
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
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Comparativo entre faturado/previsto e valores efetivamente liquidados</p>
        </div>
        <div class="p-6">
          @if (barData().length === 0) {
            <div class="py-12 text-center">
              <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-3">
                <span class="material-icons text-2xl">bar_chart</span>
              </div>
              <p class="text-sm font-bold text-slate-700 dark:text-slate-300">Sem dados financeiros no período</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                O gráfico de previsto vs. realizado será gerado automaticamente assim que receitas e despesas forem lançadas em {{ getMonthName() }}/{{ selectedYear() }}.
              </p>
            </div>
          } @else {
            <div class="flex items-end gap-4 h-48">
              @for (item of barData(); track item.label) {
                <div class="flex-1 flex flex-col items-center gap-1">
                  <span class="text-[10px] font-bold text-slate-500">{{ item.value | currency:'BRL':'symbol':'1.0-0' }}</span>
                  <div class="w-full rounded-t-lg transition-all"
                    [style.height.%]="item.height"
                    [class]="item.type === 'previsto' ? 'bg-blue-200 dark:bg-blue-800' : 'bg-emerald-500'">
                  </div>
                  <span class="text-[10px] font-bold text-slate-500 text-center">{{ item.label }}</span>
                </div>
              }
            </div>
            <div class="flex items-center justify-center gap-6 mt-4">
              <div class="flex items-center gap-2"><div class="w-3 h-3 rounded bg-blue-200 dark:bg-blue-800"></div><span class="text-xs text-slate-500">Previsto (Aberto + Liquidado)</span></div>
              <div class="flex items-center gap-2"><div class="w-3 h-3 rounded bg-emerald-500"></div><span class="text-xs text-slate-500">Realizado (Pago)</span></div>
            </div>
          }
        </div>
      </div>

      <!-- Cobranças do Mês (DADOS REAIS) -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-black text-slate-900 dark:text-white">Cobranças do Mês</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receitas e atendimentos faturados em {{ getMonthName() }}/{{ selectedYear() }}</p>
          </div>
          @if (cobrancas().length > 0) {
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
              {{ cobrancas().length }} {{ cobrancas().length === 1 ? 'cobrança' : 'cobranças' }}
            </span>
          }
        </div>
        <div class="p-6">
          @if (loading()) {
            <div class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          } @else if (cobrancas().length === 0) {
            <div class="py-12 px-4 text-center">
              <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-3">
                <span class="material-icons text-2xl">receipt_long</span>
              </div>
              <p class="text-sm font-bold text-slate-800 dark:text-slate-200">Nenhuma cobrança registrada neste mês</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Quando você registrar sessões ou receitas para {{ getMonthName() }}/{{ selectedYear() }}, elas serão listadas aqui com seus valores e status de pagamento.
              </p>
            </div>
          } @else {
            <div class="overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
              <table class="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th class="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Paciente / Origem</th>
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
                      <td class="px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-400">{{ item.valor | currency:'BRL' }}</td>
                      <td class="px-4 py-3">
                        <span class="px-3 py-1 rounded-full text-xs font-bold"
                          [class]="item.status === 'pago' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : item.status === 'pendente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">
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

      <!-- Relatórios Especializados -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-lg font-black text-slate-900 dark:text-white">Relatórios Financeiros</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Selecione um relatório para visualizar, imprimir ou baixar em PDF</p>
        </div>
        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          @for (report of reports; track report.name) {
            <button class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center hover:ring-2 hover:ring-primary transition-all group flex flex-col items-center justify-between"
              (click)="openReportModal(report.key)">
              <div>
                <span class="material-icons text-3xl text-primary group-hover:scale-110 transition-transform">{{ report.icon }}</span>
                <p class="text-sm font-bold text-slate-900 dark:text-white mt-2">{{ report.name }}</p>
                <p class="text-[10px] text-slate-500 mt-1">{{ report.desc }}</p>
              </div>
              <span class="mt-3 text-[11px] font-bold text-primary inline-flex items-center gap-1 group-hover:underline">
                Visualizar <span class="material-icons text-xs">arrow_forward</span>
              </span>
            </button>
          }
        </div>
      </div>
    </div>

    <!-- MODAL DE VISUALIZAÇÃO DE RELATÓRIO (COM BOTÃO VISÍVEL DE VOLTAR P/ IPAD) -->
    @if (showReportModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
        (click)="closeReportModal()">
        <div class="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden my-auto animate-in"
          (click)="$event.stopPropagation()">
          
          <!-- Top Bar com Botão ← Voltar ao DRE proeminente -->
          <div class="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/50">
            <div class="flex items-center gap-3">
              <button (click)="closeReportModal()"
                class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm">
                <span class="material-icons text-base">arrow_back</span>
                <span>Voltar ao DRE</span>
              </button>
              <div>
                <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">{{ activeReportTitle() }}</h3>
                <p class="text-xs text-slate-500">{{ getMonthName() }}/{{ selectedYear() }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button (click)="printReportModal()"
                class="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all">
                <span class="material-icons text-sm">print</span>
                <span>Imprimir</span>
              </button>
              <button (click)="downloadReportPdf()"
                class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-sm">
                <span class="material-icons text-sm">download</span>
                <span>Baixar PDF</span>
              </button>
              <button (click)="closeReportModal()"
                class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Fechar">
                <span class="material-icons">close</span>
              </button>
            </div>
          </div>

          <!-- Printable Report Container -->
          <div class="p-4 sm:p-8 max-h-[68vh] overflow-y-auto bg-slate-100/60 dark:bg-slate-950/60 custom-scrollbar">
            <div id="dre-report-printable" class="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200 max-w-3xl mx-auto">
              
              <!-- Cabeçalho Clínico do Documento -->
              <div class="flex items-center justify-between pb-6 border-b border-slate-200 mb-6">
                <div class="flex items-center gap-3">
                  @if (auth.tenant()?.logoUrl) {
                    <img [src]="auth.tenant()?.logoUrl" alt="Logo" class="h-12 max-w-[160px] object-contain">
                  }
                  <div>
                    <h2 class="text-xl font-black text-[#007F80]">{{ auth.tenant()?.name || 'EduPsych Pro' }}</h2>
                    <p class="text-xs text-slate-500 font-medium">Clínica Multidisciplinar & Psicopedagogia</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {{ getMonthName() }}/{{ selectedYear() }}
                  </span>
                  <p class="text-[10px] text-slate-400 mt-1">Gerado em {{ currentDateFormatted() }}</p>
                </div>
              </div>

              <!-- Título do Relatório Específico -->
              <div class="mb-6">
                <h3 class="text-lg font-black text-slate-900">{{ activeReportTitle() }}</h3>
                <p class="text-xs text-slate-500 mt-0.5">{{ activeReportSubtitle() }}</p>
              </div>

              <!-- CASO 1: RELATÓRIO DRE -->
              @if (activeReportKey() === 'dre') {
                <table class="w-full text-left border-collapse text-sm mb-6">
                  <tbody>
                    <tr class="border-b border-slate-200 bg-slate-50 font-bold">
                      <td class="py-2.5 px-3">(+) Receita Bruta</td>
                      <td class="py-2.5 px-3 text-right text-emerald-700">{{ dreReceitaBruta() | currency:'BRL' }}</td>
                    </tr>
                    <tr class="border-b border-slate-100">
                      <td class="py-2 px-3 pl-6 text-slate-600">(-) Impostos sobre Receita (est. 11.5%)</td>
                      <td class="py-2 px-3 text-right text-red-600">{{ dreImpostos() | currency:'BRL' }}</td>
                    </tr>
                    <tr class="border-b-2 border-slate-300 bg-emerald-50/50 font-black">
                      <td class="py-2.5 px-3">(=) Receita Líquida</td>
                      <td class="py-2.5 px-3 text-right text-emerald-800">{{ dreReceitaLiquida() | currency:'BRL' }}</td>
                    </tr>
                    <tr class="border-b border-slate-100">
                      <td class="py-2 px-3 pl-6 text-slate-600">(-) Despesas Operacionais Totais</td>
                      <td class="py-2 px-3 text-right text-red-600">{{ dreDespesasOperacionais() | currency:'BRL' }}</td>
                    </tr>
                    <tr class="border-b border-slate-100 text-xs text-slate-500">
                      <td class="py-1.5 px-3 pl-10">Aluguel & Condomínio</td>
                      <td class="py-1.5 px-3 text-right">{{ dreAluguel() | currency:'BRL' }}</td>
                    </tr>
                    <tr class="border-b border-slate-100 text-xs text-slate-500">
                      <td class="py-1.5 px-3 pl-10">Funcionários & Pró-labore</td>
                      <td class="py-1.5 px-3 text-right">{{ dreFuncionarios() | currency:'BRL' }}</td>
                    </tr>
                    <tr class="border-b border-slate-100 text-xs text-slate-500">
                      <td class="py-1.5 px-3 pl-10">Materiais Clínicos & Didáticos</td>
                      <td class="py-1.5 px-3 text-right">{{ dreMateriais() | currency:'BRL' }}</td>
                    </tr>
                    <tr class="border-b border-slate-200 text-xs text-slate-500">
                      <td class="py-1.5 px-3 pl-10">Outras Despesas Operacionais</td>
                      <td class="py-1.5 px-3 text-right">{{ dreOutrasDespesas() | currency:'BRL' }}</td>
                    </tr>
                    <tr class="border-t-2 border-slate-400 bg-slate-100 text-base font-black">
                      <td class="py-3 px-3">(=) Lucro / (Prejuízo) Líquido do Exercício</td>
                      <td class="py-3 px-3 text-right" [class]="dreLucro() >= 0 ? 'text-emerald-700' : 'text-red-600'">
                        {{ dreLucro() | currency:'BRL' }}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div class="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div>
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Ticket Médio</p>
                    <p class="text-base font-black text-blue-700">{{ kpiTicketMedio() | currency:'BRL' }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Inadimplência</p>
                    <p class="text-base font-black text-amber-700">{{ kpiInadimplencia() }}%</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Margem Líquida</p>
                    <p class="text-base font-black text-emerald-700">
                      {{ dreReceitaBruta() > 0 ? ((dreLucro() / dreReceitaBruta()) * 100 | number:'1.1-1') : 0 }}%
                    </p>
                  </div>
                </div>
              }

              <!-- CASO 2: EXTRATO MENSAL DETALHADO -->
              @if (activeReportKey() === 'extrato') {
                <div class="grid grid-cols-3 gap-3 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs">
                  <div>
                    <span class="text-slate-500">Receitas:</span>
                    <b class="text-emerald-700 ml-1">{{ kpiReceita() | currency:'BRL' }}</b>
                  </div>
                  <div>
                    <span class="text-slate-500">Despesas:</span>
                    <b class="text-red-600 ml-1">{{ kpiDespesas() | currency:'BRL' }}</b>
                  </div>
                  <div>
                    <span class="text-slate-500">Saldo:</span>
                    <b class="ml-1" [class]="kpiLucro() >= 0 ? 'text-emerald-700' : 'text-red-600'">{{ kpiLucro() | currency:'BRL' }}</b>
                  </div>
                </div>

                @if (allTransactionsForMonth().length === 0) {
                  <p class="text-center text-slate-500 py-8 text-sm italic">Nenhum lançamento no extrato para {{ getMonthName() }}/{{ selectedYear() }}.</p>
                } @else {
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                        <th class="p-2">Data</th>
                        <th class="p-2">Descrição / Favorecido</th>
                        <th class="p-2">Tipo</th>
                        <th class="p-2">Status</th>
                        <th class="p-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (t of allTransactionsForMonth(); track t.id) {
                        <tr>
                          <td class="p-2 text-slate-500">{{ t.date ? (t.date | date:'dd/MM/yyyy') : '—' }}</td>
                          <td class="p-2 font-medium text-slate-900">{{ t.paciente?.name || t.fornecedor || t.description || 'Lançamento' }}</td>
                          <td class="p-2">
                            <span class="px-2 py-0.5 rounded font-bold text-[10px]"
                              [class]="t.type === 'receita' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'">
                              {{ t.type === 'receita' ? 'Receita' : 'Despesa' }}
                            </span>
                          </td>
                          <td class="p-2 text-slate-600">{{ t.status | titlecase }}</td>
                          <td class="p-2 text-right font-bold"
                            [class]="t.type === 'receita' ? 'text-emerald-700' : 'text-red-600'">
                            {{ (t.value || t.valor || 0) | currency:'BRL' }}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
              }

              <!-- CASO 3: FLUXO DE CAIXA -->
              @if (activeReportKey() === 'fluxo') {
                <div class="space-y-4 mb-6 text-sm">
                  <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <p class="font-bold text-emerald-900 mb-1">Entradas (Receitas)</p>
                    <div class="flex justify-between text-xs text-emerald-800">
                      <span>Realizadas (Pagas):</span>
                      <b>{{ fluxoEntradasPagas() | currency:'BRL' }}</b>
                    </div>
                    <div class="flex justify-between text-xs text-emerald-700 mt-1">
                      <span>A Receber (Pendentes):</span>
                      <b>{{ fluxoEntradasPendentes() | currency:'BRL' }}</b>
                    </div>
                  </div>

                  <div class="p-4 bg-red-50 rounded-xl border border-red-200">
                    <p class="font-bold text-red-900 mb-1">Saídas (Despesas)</p>
                    <div class="flex justify-between text-xs text-red-800">
                      <span>Pagas / Liquidadas:</span>
                      <b>{{ fluxoSaidasPagas() | currency:'BRL' }}</b>
                    </div>
                    <div class="flex justify-between text-xs text-red-700 mt-1">
                      <span>A Pagar (Pendentes):</span>
                      <b>{{ fluxoSaidasPendentes() | currency:'BRL' }}</b>
                    </div>
                  </div>

                  <div class="p-4 bg-slate-100 rounded-xl border border-slate-300">
                    <div class="flex justify-between items-center text-base font-black">
                      <span>Saldo Operacional Realizado:</span>
                      <span [class]="(fluxoEntradasPagas() - fluxoSaidasPagas()) >= 0 ? 'text-emerald-700' : 'text-red-600'">
                        {{ (fluxoEntradasPagas() - fluxoSaidasPagas()) | currency:'BRL' }}
                      </span>
                    </div>
                    <div class="flex justify-between items-center text-xs font-bold text-slate-600 mt-2 pt-2 border-t border-slate-200">
                      <span>Saldo Projetado (com pendências):</span>
                      <span>{{ (kpiReceita() - kpiDespesas()) | currency:'BRL' }}</span>
                    </div>
                  </div>
                </div>
              }

              <!-- CASO 4: INADIMPLÊNCIA -->
              @if (activeReportKey() === 'inadimplencia') {
                @if (inadimplenciaReportData().length === 0) {
                  <div class="text-center py-10 px-4 bg-emerald-50 rounded-2xl border border-emerald-200 my-4">
                    <span class="material-icons text-3xl text-emerald-600 mb-2">verified</span>
                    <p class="text-sm font-bold text-emerald-900">Nenhuma inadimplência encontrada!</p>
                    <p class="text-xs text-emerald-700 mt-1">Todas as cobranças do mês de {{ getMonthName() }}/{{ selectedYear() }} estão quitadas ou em dia.</p>
                  </div>
                } @else {
                  <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs mb-4 flex justify-between items-center font-bold">
                    <span>Total em Aberto / Inadimplente:</span>
                    <span class="text-base text-amber-800">{{ totalInadimplente() | currency:'BRL' }}</span>
                  </div>
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                        <th class="p-2">Paciente</th>
                        <th class="p-2">Vencimento</th>
                        <th class="p-2">Status</th>
                        <th class="p-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (item of inadimplenciaReportData(); track item.id) {
                        <tr>
                          <td class="p-2 font-medium text-slate-900">{{ item.paciente?.name || item.fornecedor || item.description || 'Paciente' }}</td>
                          <td class="p-2 text-slate-500">{{ item.dataVencimento ? (item.dataVencimento | date:'dd/MM/yyyy') : '—' }}</td>
                          <td class="p-2">
                            <span class="px-2 py-0.5 rounded font-bold text-[10px]"
                              [class]="item.status === 'atrasado' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'">
                              {{ item.status === 'atrasado' ? 'Atrasado' : 'Pendente' }}
                            </span>
                          </td>
                          <td class="p-2 text-right font-bold text-amber-800">{{ (item.value || item.valor || 0) | currency:'BRL' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
              }

              <!-- CASO 5: POR PACIENTE -->
              @if (activeReportKey() === 'paciente') {
                @if (pacientesReportData().length === 0) {
                  <p class="text-center text-slate-500 py-8 text-sm italic">Nenhum atendimento faturado para {{ getMonthName() }}/{{ selectedYear() }}.</p>
                } @else {
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                        <th class="p-2">Paciente</th>
                        <th class="p-2 text-center">Atendimentos</th>
                        <th class="p-2 text-right">Pago</th>
                        <th class="p-2 text-right">Pendente</th>
                        <th class="p-2 text-right font-bold">Total Faturado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (p of pacientesReportData(); track p.name) {
                        <tr>
                          <td class="p-2 font-medium text-slate-900">{{ p.name }}</td>
                          <td class="p-2 text-center text-slate-600">{{ p.count }}</td>
                          <td class="p-2 text-right text-emerald-700">{{ p.pago | currency:'BRL' }}</td>
                          <td class="p-2 text-right text-amber-700">{{ p.pendente | currency:'BRL' }}</td>
                          <td class="p-2 text-right font-bold text-slate-900">{{ p.total | currency:'BRL' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
              }

              <!-- Rodapé Clínico Oficial -->
              <div class="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
                <p>{{ auth.tenant()?.name || 'EduPsych Pro' }} — Sistema de Gestão Clínica Integrada</p>
                <p class="mt-0.5">Relatório confidencial gerado eletronicamente em {{ currentDateFormatted() }}</p>
              </div>
            </div>
          </div>

          <!-- Bottom Footer com Botão ← Fechar e Voltar ao DRE proeminente -->
          <div class="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/50">
            <button (click)="closeReportModal()"
              class="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
              <span class="material-icons text-base">arrow_back</span>
              <span>Fechar e Voltar ao DRE</span>
            </button>

            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button (click)="printReportModal()"
                class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-all">
                <span class="material-icons text-base">print</span>
                <span>Imprimir</span>
              </button>
              <button (click)="downloadReportPdf()"
                class="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-1.5 shadow-sm transition-all">
                <span class="material-icons text-base">download</span>
                <span>Baixar em PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Toast Notification -->
    @if (showToast()) {
      <div class="fixed bottom-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 animate-in shadow-lg bg-emerald-600 text-white font-medium text-sm">
        <span class="material-icons">check_circle</span>
        <span>{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class FinanceiroDreComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  selectedMonth = signal(new Date().getMonth() + 1);
  selectedYear = signal(new Date().getFullYear());
  loading = signal(true);
  showToast = signal(false);
  toastMessage = signal('');

  // In-App Report Modal State
  showReportModal = signal(false);
  activeReportKey = signal<string>('dre');
  activeReportTitle = signal<string>('DRE - Demonstração do Resultado');
  activeReportSubtitle = signal<string>('');

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
    { key: 'dre', name: 'DRE', icon: 'assessment', desc: 'Demonstração do resultado do exercício' },
    { key: 'extrato', name: 'Extrato Mensal', icon: 'receipt_long', desc: 'Extrato analítico de entradas e saídas' },
    { key: 'fluxo', name: 'Fluxo de Caixa', icon: 'account_balance', desc: 'Realizado vs Projetado no período' },
    { key: 'inadimplencia', name: 'Inadimplência', icon: 'warning', desc: 'Controle de pagamentos em atraso' },
    { key: 'paciente', name: 'Por Paciente', icon: 'person', desc: 'Faturamento consolidado por paciente' },
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
    const m = this.selectedMonth();
    const y = this.selectedYear();

    this.api.get('/financeiro', { month: m, year: y }).subscribe({
      next: (res: any) => {
        const rawData = res.data || [];
        // Filtra estritamente pelo mês e ano selecionados
        const data = rawData.filter((t: any) => {
          const dStr = t.dataPagamento || t.dataVencimento || t.date || t.createdAt;
          if (!dStr) return false;
          const d = new Date(dStr);
          return (d.getMonth() + 1) === m && d.getFullYear() === y;
        });

        const receitas = data.filter((t: any) => t.type === 'receita');
        const despesas = data.filter((t: any) => t.type === 'despesa');
        this.receitas.set(receitas);
        this.despesas.set(despesas);
        this.calculateKPIs(receitas, despesas);
        this.calculateDRE(receitas, despesas);
        this.calculateBarData(receitas, despesas);
        this.setCobrancasFromReceitas(receitas);
        this.loading.set(false);
      },
      error: () => {
        this.receitas.set([]);
        this.despesas.set([]);
        this.calculateKPIs([], []);
        this.calculateDRE([], []);
        this.calculateBarData([], []);
        this.setCobrancasFromReceitas([]);
        this.loading.set(false);
      }
    });
  }

  calculateKPIs(receitas: any[], despesas: any[]) {
    const totalReceita = receitas.reduce((sum: number, t: any) => sum + (parseFloat(t.value || t.valor) || 0), 0);
    const totalDespesa = despesas.reduce((sum: number, t: any) => sum + (parseFloat(t.value || t.valor) || 0), 0);
    const pendente = receitas
      .filter((t: any) => {
        const st = (t.status || '').toLowerCase();
        return st === 'pendente' || st === 'atrasado';
      })
      .reduce((sum: number, t: any) => sum + (parseFloat(t.value || t.valor) || 0), 0);

    this.kpiReceita.set(totalReceita);
    this.kpiDespesas.set(totalDespesa);
    this.kpiLucro.set(totalReceita - totalDespesa);
    this.kpiTicketMedio.set(receitas.length > 0 ? totalReceita / receitas.length : 0);
    this.kpiInadimplencia.set(totalReceita > 0 ? Math.round((pendente / totalReceita) * 100) : 0);
  }

  calculateDRE(receitas: any[], despesas: any[]) {
    const receitaBruta = receitas.reduce((sum: number, t: any) => sum + (parseFloat(t.value || t.valor) || 0), 0);
    // Impostos lançados diretamente na categoria IMPOSTOS ou 6% (alíquota média Simples Nacional Anexo III clínica)
    const impostosLancados = despesas
      .filter((d: any) => (d.category || '').toUpperCase() === 'IMPOSTOS')
      .reduce((sum: number, t: any) => sum + (parseFloat(t.value || t.valor) || 0), 0);
    const impostos = impostosLancados > 0 ? impostosLancados : (receitaBruta * 0.06);
    const receitaLiquida = Math.max(0, receitaBruta - impostos);

    // Despesas Reais Calculadas por Categoria Real Cadastrada
    const aluguel = despesas
      .filter((d: any) => ['ALUGUEL', 'ENERGIA_AGUA', 'INTERNET_TELEFONE'].includes((d.category || '').toUpperCase()))
      .reduce((sum: number, t: any) => sum + (parseFloat(t.value || t.valor) || 0), 0);

    const funcionarios = despesas
      .filter((d: any) => ['SALARIOS'].includes((d.category || '').toUpperCase()))
      .reduce((sum: number, t: any) => sum + (parseFloat(t.value || t.valor) || 0), 0);

    const materiais = despesas
      .filter((d: any) => ['MATERIAIS'].includes((d.category || '').toUpperCase()))
      .reduce((sum: number, t: any) => sum + (parseFloat(t.value || t.valor) || 0), 0);

    const outras = despesas
      .filter((d: any) => !['ALUGUEL', 'ENERGIA_AGUA', 'INTERNET_TELEFONE', 'SALARIOS', 'MATERIAIS', 'IMPOSTOS'].includes((d.category || '').toUpperCase()))
      .reduce((sum: number, t: any) => sum + (parseFloat(t.value || t.valor) || 0), 0);

    const despesaOperacional = aluguel + funcionarios + materiais + outras;

    this.dreReceitaBruta.set(receitaBruta);
    this.dreImpostos.set(impostos);
    this.dreReceitaLiquida.set(receitaLiquida);
    this.dreDespesasOperacionais.set(despesaOperacional);
    this.dreAluguel.set(aluguel);
    this.dreFuncionarios.set(funcionarios);
    this.dreMateriais.set(materiais);
    this.dreOutrasDespesas.set(outras);
    this.dreLucro.set(receitaLiquida - despesaOperacional);
  }

  calculateBarData(receitas: any[], despesas: any[]) {
    if (receitas.length === 0 && despesas.length === 0) {
      this.barData.set([]);
      return;
    }

    const recPagas = receitas
      .filter((r: any) => (r.status || '').toLowerCase() === 'pago')
      .reduce((s, r) => s + (parseFloat(r.value || r.valor) || 0), 0);
    const recPrevistas = receitas
      .reduce((s, r) => s + (parseFloat(r.value || r.valor) || 0), 0);

    const despPagas = despesas
      .filter((d: any) => (d.status || '').toLowerCase() === 'pago')
      .reduce((s, d) => s + (parseFloat(d.value || d.valor) || 0), 0);
    const despPrevistas = despesas
      .reduce((s, d) => s + (parseFloat(d.value || d.valor) || 0), 0);

    const lucroRealizado = recPagas - despPagas;
    const lucroPrevisto = recPrevistas - despPrevistas;

    const maxVal = Math.max(recPrevistas, despPrevistas, Math.abs(lucroPrevisto), Math.abs(lucroRealizado), 1);

    this.barData.set([
      { label: 'Receita Prevista', value: recPrevistas, height: Math.min(100, (recPrevistas / maxVal) * 100), type: 'previsto' },
      { label: 'Receita Realizada', value: recPagas, height: Math.min(100, (recPagas / maxVal) * 100), type: 'realizado' },
      { label: 'Despesa Prevista', value: despPrevistas, height: Math.min(100, (despPrevistas / maxVal) * 100), type: 'previsto' },
      { label: 'Despesa Realizada', value: despPagas, height: Math.min(100, (despPagas / maxVal) * 100), type: 'realizado' },
      { label: 'Resultado Previsto', value: lucroPrevisto, height: Math.min(100, (Math.abs(lucroPrevisto) / maxVal) * 100), type: 'previsto' },
      { label: 'Resultado Realizado', value: lucroRealizado, height: Math.min(100, (Math.abs(lucroRealizado) / maxVal) * 100), type: 'realizado' },
    ]);
  }

  // Cobranças Reais baseadas nos lançamentos da clínica (sem dados falsos)
  setCobrancasFromReceitas(receitas: any[]) {
    const items = (receitas || []).map((r, i) => {
      const rawVenc = r.dataVencimento || r.date || r.createdAt;
      let vencFormatado = '—';
      if (rawVenc) {
        try {
          vencFormatado = new Date(rawVenc).toLocaleDateString('pt-BR');
        } catch {
          vencFormatado = String(rawVenc);
        }
      }
      return {
        id: r.id || i + 1,
        paciente: r.paciente?.name || r.fornecedor || r.description || 'Paciente',
        vencimento: vencFormatado,
        valor: parseFloat(r.value || r.valor) || 0,
        status: (r.status || 'pendente').toLowerCase(),
      };
    });
    this.cobrancas.set(items);
  }

  getMonthName(): string {
    return this.months.find(m => m.value === this.selectedMonth())?.label || '';
  }

  currentDateFormatted(): string {
    return new Date().toLocaleString('pt-BR');
  }

  // Abertura do Modal de Relatório In-App
  openReportModal(key: string) {
    this.activeReportKey.set(key);
    const m = this.getMonthName();
    const y = this.selectedYear();

    switch (key) {
      case 'dre':
        this.activeReportTitle.set('Demonstração do Resultado do Exercício (DRE)');
        this.activeReportSubtitle.set(`Análise contábil gerencial referente a ${m}/${y}`);
        break;
      case 'extrato':
        this.activeReportTitle.set('Extrato Mensal Detalhado');
        this.activeReportSubtitle.set(`Relatório consolidado de todas as entradas e saídas de ${m}/${y}`);
        break;
      case 'fluxo':
        this.activeReportTitle.set('Demonstrativo de Fluxo de Caixa');
        this.activeReportSubtitle.set(`Visão operacional de entradas pagas e saídas de ${m}/${y}`);
        break;
      case 'inadimplencia':
        this.activeReportTitle.set('Relatório de Inadimplência & Contas a Receber');
        this.activeReportSubtitle.set(`Cobranças pendentes e atrasadas de ${m}/${y}`);
        break;
      case 'paciente':
        this.activeReportTitle.set('Receitas Faturadas por Paciente');
        this.activeReportSubtitle.set(`Totalização de atendimentos e valores de ${m}/${y}`);
        break;
      default:
        this.activeReportTitle.set('Relatório Financeiro');
        this.activeReportSubtitle.set(`Período de ${m}/${y}`);
    }

    this.showReportModal.set(true);
  }

  closeReportModal() {
    this.showReportModal.set(false);
  }

  // Dados auxiliares para os relatórios
  allTransactionsForMonth(): any[] {
    const list = [...this.receitas(), ...this.despesas()];
    return list.sort((a, b) => {
      const da = new Date(a.date || a.createdAt || 0).getTime();
      const db = new Date(b.date || b.createdAt || 0).getTime();
      return db - da;
    });
  }

  fluxoEntradasPagas(): number {
    return this.receitas()
      .filter(r => (r.status || '').toLowerCase() === 'pago')
      .reduce((s, r) => s + (parseFloat(r.value || r.valor) || 0), 0);
  }

  fluxoEntradasPendentes(): number {
    return this.receitas()
      .filter(r => (r.status || '').toLowerCase() !== 'pago')
      .reduce((s, r) => s + (parseFloat(r.value || r.valor) || 0), 0);
  }

  fluxoSaidasPagas(): number {
    return this.despesas()
      .filter(d => (d.status || '').toLowerCase() === 'pago')
      .reduce((s, d) => s + (parseFloat(d.value || d.valor) || 0), 0);
  }

  fluxoSaidasPendentes(): number {
    return this.despesas()
      .filter(d => (d.status || '').toLowerCase() !== 'pago')
      .reduce((s, d) => s + (parseFloat(d.value || d.valor) || 0), 0);
  }

  inadimplenciaReportData(): any[] {
    return this.receitas().filter(r => {
      const st = (r.status || '').toLowerCase();
      return st === 'pendente' || st === 'atrasado';
    });
  }

  totalInadimplente(): number {
    return this.inadimplenciaReportData().reduce((s, r) => s + (parseFloat(r.value || r.valor) || 0), 0);
  }

  pacientesReportData(): { name: string; count: number; pago: number; pendente: number; total: number }[] {
    const map = new Map<string, { name: string; count: number; pago: number; pendente: number; total: number }>();
    for (const r of this.receitas()) {
      const name = r.paciente?.name || r.fornecedor || r.description || 'Não Identificado';
      const val = parseFloat(r.value || r.valor) || 0;
      const isPago = (r.status || '').toLowerCase() === 'pago';

      if (!map.has(name)) {
        map.set(name, { name, count: 0, pago: 0, pendente: 0, total: 0 });
      }
      const item = map.get(name)!;
      item.count += 1;
      item.total += val;
      if (isPago) item.pago += val;
      else item.pendente += val;
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }

  // Baixar PDF diretamente (usando html2pdf.js com dynamic import)
  downloadReportPdf() {
    const el = document.getElementById('dre-report-printable');
    if (!el) return;
    this.toastMessage.set('Gerando arquivo PDF...');
    this.showToast.set(true);

    import('html2pdf.js').then((module: any) => {
      const html2pdf = module.default || module;
      html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename: `${this.activeReportKey()}-${this.selectedMonth()}-${this.selectedYear()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(el)
        .save()
        .then(() => {
          this.toastMessage.set('PDF baixado com sucesso!');
          setTimeout(() => this.showToast.set(false), 3000);
        })
        .catch(() => {
          this.toastMessage.set('PDF preparado para impressão');
          setTimeout(() => this.showToast.set(false), 3000);
        });
    }).catch(() => {
      this.printReportModal();
    });
  }

  // Imprimir com barra fixa "← Voltar ao Sistema" (salva-vidas no iPad PWA)
  printReportModal() {
    const el = document.getElementById('dre-report-printable');
    if (!el) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <title>${this.activeReportTitle()} - ${this.getMonthName()}/${this.selectedYear()}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 0; color: #1e293b; background: #fff; }
            .no-print-bar {
              position: sticky; top: 0; background: #0f172a; color: white; padding: 12px 20px;
              display: flex; justify-content: space-between; align-items: center; z-index: 9999;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            }
            .no-print-bar button {
              background: #334155; color: white; border: none; padding: 10px 18px; border-radius: 10px;
              font-weight: 700; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
            }
            .no-print-bar button:active { opacity: 0.8; }
            .no-print-bar button.primary { background: #007F80; }
            .report-wrapper { max-width: 800px; margin: 20px auto; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            @media print {
              .no-print-bar { display: none !important; }
              .report-wrapper { margin: 0; padding: 0; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="no-print-bar">
            <button onclick="window.close(); history.back();">← Voltar ao Sistema</button>
            <span style="font-weight: 700; font-size: 15px;">${this.activeReportTitle()}</span>
            <button class="primary" onclick="window.print();">🖨️ Imprimir</button>
          </div>
          <div class="report-wrapper">
            ${el.innerHTML}
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 350);
    }
  }
}
