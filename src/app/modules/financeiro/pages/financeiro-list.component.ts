import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import QRCode from 'qrcode';
import { ApiService } from '@core/services/api.service';
import { escapeHtml } from '@core/utils/escape';
import { ToastService } from '@shared/components/toast.component';
import { ConfirmModalComponent } from '@shared/components/confirm-modal.component';

declare var html2pdf: any;

@Component({
  selector: 'app-financeiro-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmModalComponent],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Financeiro</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestão completa de receitas, despesas e contas a pagar</p>
        </div>
        <div class="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button class="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-white dark:bg-slate-900 rounded-2xl text-xs sm:text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all text-slate-700 dark:text-slate-300 shadow-sm"
            (click)="exportMonthlyReport()">
            <span class="material-icons text-lg">picture_as_pdf</span> Relatório
          </button>
          <button (click)="openExpenseModal()"
            class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-red-600/20 transition-all active:scale-95">
            <span class="material-icons text-lg">trending_down</span>
            <span>+ Lançar Gasto / Conta</span>
          </button>
          <a routerLink="/app/financeiro/novo"
            class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-primary/20 transition-all active:scale-95">
            <span class="material-icons text-lg">add</span>
            <span>+ Nova Receita</span>
          </a>
        </div>
      </div>

      <!-- Summary Cards (5 Métricas) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <!-- Total Receitas Realizadas -->
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-3.5">
          <div class="size-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <span class="material-icons text-emerald-600 dark:text-emerald-400 text-xl">trending_up</span>
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">Receitas Realizadas</p>
            <p class="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400 truncate">{{ totalReceitas() | currency:'BRL' }}</p>
          </div>
        </div>

        <!-- Total Despesas Pagas -->
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-3.5">
          <div class="size-11 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <span class="material-icons text-red-600 dark:text-red-400 text-xl">trending_down</span>
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">Despesas Pagas</p>
            <p class="text-lg sm:text-xl font-black text-red-600 dark:text-red-400 truncate">{{ totalDespesas() | currency:'BRL' }}</p>
          </div>
        </div>

        <!-- A Receber (Receitas Pendentes) -->
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-3.5">
          <div class="size-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <span class="material-icons text-amber-600 dark:text-amber-400 text-xl">schedule</span>
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">A Receber</p>
            <p class="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 truncate">{{ aReceber() | currency:'BRL' }}</p>
          </div>
        </div>

        <!-- Contas a Pagar (Despesas Pendentes) -->
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-3.5">
          <div class="size-11 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
            <span class="material-icons text-rose-600 dark:text-rose-400 text-xl">pending_actions</span>
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">Contas a Pagar</p>
            <p class="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 truncate">{{ aPagar() | currency:'BRL' }}</p>
          </div>
        </div>

        <!-- Saldo Real em Caixa -->
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-3.5">
          <div class="size-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <span class="material-icons text-blue-600 dark:text-blue-400 text-xl">account_balance_wallet</span>
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">Saldo em Caixa</p>
            <p class="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 truncate">{{ saldo() | currency:'BRL' }}</p>
          </div>
        </div>
      </div>

      <!-- Main Box -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <!-- Filter Tabs -->
        <div class="px-6 pt-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <button (click)="setTypeFilter('todos')"
            class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 border-b-2"
            [class]="activeTab() === 'todos' 
              ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'">
            <span class="material-icons text-base">format_list_bulleted</span>
            <span>Todas as Transações</span>
            <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {{ items().length }}
            </span>
          </button>

          <button (click)="setTypeFilter('receita')"
            class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 border-b-2"
            [class]="activeTab() === 'receita' 
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'">
            <span class="material-icons text-base">trending_up</span>
            <span>Receitas</span>
            <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
              {{ countReceitas() }}
            </span>
          </button>

          <button (click)="setTypeFilter('despesa')"
            class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 border-b-2"
            [class]="activeTab() === 'despesa' 
              ? 'border-red-600 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'">
            <span class="material-icons text-base">receipt_long</span>
            <span>Contas a Pagar & Despesas</span>
            <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              {{ countDespesas() }}
            </span>
          </button>
        </div>

        <!-- Filter Bar -->
        <div class="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1 max-w-md">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
            <input class="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white"
              placeholder="Buscar por descrição, favorecido ou paciente..." [(ngModel)]="searchTerm" (input)="onSearch()">
          </div>
          <select class="px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-700 dark:text-slate-200"
            [(ngModel)]="filterStatus" (change)="load()">
            <option value="">Todos os status</option>
            <option value="pago">Pago / Liquidado</option>
            <option value="pendente">Pendente / A Pagar / A Receber</option>
            <option value="atrasado">Atrasado / Vencido</option>
          </select>
        </div>

        <!-- Items Content -->
        <div class="p-4 sm:p-6">
          @if (loading()) {
            <div class="flex items-center justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          } @else if (filteredItems().length === 0) {
            <div class="text-center py-12">
              <span class="material-icons text-6xl text-slate-300 dark:text-slate-600">payments</span>
              <p class="text-slate-500 dark:text-slate-400 mt-3 font-medium">Nenhum lançamento encontrado nesta visualização</p>
              @if (activeTab() === 'despesa') {
                <button (click)="openExpenseModal()" class="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline">
                  <span class="material-icons text-sm">add</span> Lançar primeira conta a pagar
                </button>
              }
            </div>
          } @else {
            <!-- Desktop Table (md and up) -->
            <div class="hidden md:block overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
              <table class="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Identificação / Favorecido</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Vencimento / Data</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Valor</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tipo / Categoria</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (item of filteredItems(); track item.id) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <!-- Nome / Identificação -->
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          @if (item.type === 'receita') {
                            <div class="size-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0"
                              [style.background]="getAvatarColor(item.paciente?.name || '')">
                              {{ getInitials(item.paciente?.name || '') }}
                            </div>
                            <div class="min-w-0">
                              <span class="text-sm font-bold text-slate-900 dark:text-white truncate block">
                                {{ item.paciente?.name || 'Receita Avulsa' }}
                              </span>
                              @if (item.description) {
                                <span class="text-xs text-slate-400 truncate block">{{ item.description }}</span>
                              }
                            </div>
                          } @else {
                            <div class="size-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 bg-red-600/90">
                              <span class="material-icons text-xl">{{ getCategoryIcon(item.category) }}</span>
                            </div>
                            <div class="min-w-0">
                              <span class="text-sm font-bold text-slate-900 dark:text-white truncate block">
                                {{ item.fornecedor || item.description || 'Despesa da Clínica' }}
                              </span>
                              <span class="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                                <span>{{ getCategoryLabel(item.category) }}</span>
                                @if (item.paciente?.name) {
                                  <span>• Paciente: {{ item.paciente.name }}</span>
                                }
                              </span>
                            </div>
                          }
                        </div>
                      </td>

                      <!-- Data / Vencimento -->
                      <td class="px-6 py-4">
                        <div class="text-sm text-slate-700 dark:text-slate-300">
                          {{ (item.dataVencimento || item.date) | date:'dd/MM/yyyy' }}
                        </div>
                        @if (item.status === 'pendente') {
                          <span class="text-[11px] text-amber-600 font-medium">A vencer</span>
                        } @else if (item.status === 'atrasado') {
                          <span class="text-[11px] text-red-600 font-medium">Vencido</span>
                        } @else if (item.status === 'pago') {
                          <span class="text-[11px] text-emerald-600 font-medium">Liquidado</span>
                        }
                      </td>

                      <!-- Valor -->
                      <td class="px-6 py-4 text-sm font-black" [class]="item.type === 'receita' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                        {{ item.type === 'receita' ? '+' : '-' }}{{ item.value | currency:'BRL' }}
                      </td>

                      <!-- Tipo / Categoria -->
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                          [class]="item.type === 'receita' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">
                          <span class="material-icons text-xs">{{ item.type === 'receita' ? 'arrow_upward' : 'arrow_downward' }}</span>
                          {{ item.type === 'receita' ? 'Receita' : 'Despesa' }}
                        </span>
                      </td>

                      <!-- Status -->
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                          [class]="item.status === 'pago' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : item.status === 'pendente' 
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'">
                          {{ item.status === 'pendente' ? (item.type === 'despesa' ? 'A Pagar' : 'A Receber') : (item.status | titlecase) }}
                        </span>
                      </td>

                      <!-- Ações -->
                      <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-1">
                          <!-- Quitar Despesa (Contas a Pagar) -->
                          @if (item.type === 'despesa' && item.status !== 'pago') {
                            <button class="p-2 text-rose-600 hover:text-white hover:bg-rose-600 rounded-xl transition-all" 
                              title="Pagar conta agora" (click)="openPayModal(item)">
                              <span class="material-icons text-lg">check_circle</span>
                            </button>
                          }

                          <!-- Ações de Receita -->
                          @if (item.type === 'receita' && item.status === 'pendente') {
                            <button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Cobrar via PIX" (click)="openPixModal(item)">
                              <span class="material-icons text-lg">qr_code</span>
                            </button>
                            <button class="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all" title="Confirmar recebimento" (click)="openConfirmPaymentModal(item)">
                              <span class="material-icons text-lg">check_circle</span>
                            </button>
                          }

                          <button class="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all" title="Gerar comprovante/recibo" (click)="generateReceipt(item)">
                            <span class="material-icons text-lg">receipt</span>
                          </button>
                          <a [routerLink]="['/app/financeiro', item.id, 'editar']" class="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all" title="Editar">
                            <span class="material-icons text-lg">edit</span>
                          </a>
                          <button class="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Excluir" (click)="confirmDelete(item)">
                            <span class="material-icons text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Mobile Cards (under md / Smartphones) -->
            <div class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              @for (item of filteredItems(); track item.id) {
                <div class="p-4 space-y-3">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                      @if (item.type === 'receita') {
                        <div class="size-10 rounded-full flex items-center justify-center text-xs font-black text-white shadow-sm shrink-0"
                          [style.background]="getAvatarColor(item.paciente?.name || '')">
                          {{ getInitials(item.paciente?.name || '') }}
                        </div>
                        <div class="min-w-0 flex-1">
                          <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">{{ item.paciente?.name || 'Receita' }}</h4>
                          <p class="text-xs text-slate-500 dark:text-slate-400">{{ (item.dataVencimento || item.date) | date:'dd/MM/yyyy' }}</p>
                        </div>
                      } @else {
                        <div class="size-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 bg-red-600/90">
                          <span class="material-icons text-xl">{{ getCategoryIcon(item.category) }}</span>
                        </div>
                        <div class="min-w-0 flex-1">
                          <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">{{ item.fornecedor || item.description || 'Despesa' }}</h4>
                          <p class="text-xs text-slate-500 dark:text-slate-400">
                            Vence: {{ (item.dataVencimento || item.date) | date:'dd/MM/yyyy' }} · {{ getCategoryLabel(item.category) }}
                          </p>
                        </div>
                      }
                    </div>
                    <div class="text-right shrink-0">
                      <p class="text-base font-black" [class]="item.type === 'receita' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                        {{ item.type === 'receita' ? '+' : '-' }}{{ item.value | currency:'BRL' }}
                      </p>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mt-0.5"
                        [class]="item.status === 'pago' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : item.status === 'pendente' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-red-100 text-red-700'">
                        {{ item.status === 'pendente' ? (item.type === 'despesa' ? 'A Pagar' : 'A Receber') : item.status }}
                      </span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <!-- Pagar conta (Despesa) no mobile -->
                    @if (item.type === 'despesa' && item.status !== 'pago') {
                      <button (click)="openPayModal(item)"
                        class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/10 transition-all active:scale-95">
                        <span class="material-icons text-[16px]">check_circle</span>
                        Pagar Conta
                      </button>
                    }

                    <!-- PIX Receita no mobile -->
                    @if (item.status === 'pendente' && item.type === 'receita') {
                      <button (click)="openPixModal(item)"
                        class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-md shadow-primary/10 transition-all active:scale-95">
                        <span class="material-icons text-[16px]">qr_code</span>
                        PIX
                      </button>
                      <button (click)="openConfirmPaymentModal(item)"
                        class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95">
                        <span class="material-icons text-[16px]">check_circle</span>
                        Receber
                      </button>
                    }

                    <button (click)="generateReceipt(item)"
                      class="flex items-center justify-center size-9 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-all shrink-0"
                      title="Comprovante">
                      <span class="material-icons text-[16px]">receipt</span>
                    </button>
                    <a [routerLink]="['/app/financeiro', item.id, 'editar']"
                      class="flex items-center justify-center size-9 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-all shrink-0"
                      title="Editar">
                      <span class="material-icons text-[16px]">edit</span>
                    </a>
                    <button (click)="confirmDelete(item)"
                      class="flex items-center justify-center size-9 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 transition-all shrink-0"
                      title="Excluir">
                      <span class="material-icons text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>

    <!-- MODAL RÁPIDO: NOVO GASTO / CONTA A PAGAR -->
    @if (showExpenseModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" (click)="closeExpenseModal()">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 ring-1 ring-slate-200 dark:ring-slate-800 my-8 chat-rise" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div class="size-11 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center">
                <span class="material-icons text-2xl">receipt_long</span>
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">Lançar Gasto / Conta a Pagar</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Registre despesas gerais, boletos ou compras da clínica</p>
              </div>
            </div>
            <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1" (click)="closeExpenseModal()">
              <span class="material-icons">close</span>
            </button>
          </div>

          <div class="py-5 space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Descrição / Favorecido *</label>
              <input type="text" [(ngModel)]="expenseForm.description" placeholder="Ex: Aluguel consultório, Conta de Luz (Enel), Papelaria..."
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Categoria *</label>
                <select [(ngModel)]="expenseForm.category"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none">
                  <option value="ALUGUEL">🏢 Aluguel & Condomínio</option>
                  <option value="ENERGIA_AGUA">⚡ Energia, Água & Gás</option>
                  <option value="INTERNET_TELEFONE">📶 Internet & Telefonia</option>
                  <option value="MATERIAIS">🎨 Materiais Didáticos</option>
                  <option value="SOFTWARE">💻 Softwares & Assinaturas</option>
                  <option value="MANUTENCAO">🧹 Limpeza & Manutenção</option>
                  <option value="IMPOSTOS">📋 Impostos & Taxas</option>
                  <option value="SALARIOS">💼 Salários / Pró-labore</option>
                  <option value="OUTROS">📦 Outros Gastos</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Valor (R$) *</label>
                <input type="number" step="0.01" [(ngModel)]="expenseForm.value" placeholder="0,00"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Data de Vencimento *</label>
                <input type="date" [(ngModel)]="expenseForm.date"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none">
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Status Inicial *</label>
                <select [(ngModel)]="expenseForm.status"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none">
                  <option value="pendente">A Pagar (Pendente)</option>
                  <option value="pago">Já Pago (Liquidado)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Forma de Pagamento</label>
                <select [(ngModel)]="expenseForm.paymentMethod"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none">
                  <option value="BOLETO">Boleto Bancário</option>
                  <option value="PIX">PIX</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de Débito</option>
                  <option value="TRANSFERENCIA">Transferência / TED</option>
                  <option value="DINHEIRO">Dinheiro</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Paciente Vinculado (Opcional)</label>
                <select [(ngModel)]="expenseForm.pacienteId"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none">
                  <option value="">Geral da Clínica (Sem paciente)</option>
                  @for (p of pacientes(); track p.id) {
                    <option [value]="p.id">{{ p.name }}</option>
                  }
                </select>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button (click)="closeExpenseModal()" class="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-all">
              Cancelar
            </button>
            <button (click)="saveQuickExpense()" [disabled]="savingExpense()"
              class="px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50">
              {{ savingExpense() ? 'Salvando...' : 'Salvar Despesa' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL QUITAR CONTA RÁPIDO -->
    @if (showPayModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" (click)="showPayModal.set(false)">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 ring-1 ring-slate-200 dark:ring-slate-800 chat-rise" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 mb-5">
            <div class="size-11 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
              <span class="material-icons text-2xl">check_circle</span>
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-900 dark:text-white">Confirmar Pagamento da Conta</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Marcar esta despesa como liquidada</p>
            </div>
          </div>

          <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl mb-5 space-y-1.5">
            <p class="text-xs text-slate-500 dark:text-slate-400">Conta / Favorecido:</p>
            <p class="text-sm font-bold text-slate-900 dark:text-white">{{ itemToPay()?.fornecedor || itemToPay()?.description || 'Despesa' }}</p>
            <p class="text-base font-black text-red-600">{{ itemToPay()?.value | currency:'BRL' }}</p>
          </div>

          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Forma de Pagamento Utilizada</label>
              <select [(ngModel)]="payMethod"
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="BOLETO">Boleto Bancário</option>
                <option value="PIX">PIX</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="CARTAO_DEBITO">Cartão de Débito</option>
                <option value="TRANSFERENCIA">Transferência / TED</option>
                <option value="DINHEIRO">Dinheiro</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Data da Quitação</label>
              <input type="date" [(ngModel)]="payDate"
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button (click)="showPayModal.set(false)" class="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-all">
              Cancelar
            </button>
            <button (click)="executePayExpense()"
              class="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
              Confirmar Pagamento
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Confirmação de Recebimento -->
    <app-confirm-modal
      [isOpen]="showConfirmPaymentModal()"
      title="Confirmar Recebimento"
      message="Tem certeza que deseja confirmar o recebimento deste pagamento?"
      confirmText="Confirmar"
      [dangerMode]="false"
      (closed)="showConfirmPaymentModal.set(false)"
      (confirmed)="executeConfirmPayment()">
    </app-confirm-modal>

    <!-- Modal Exclusão -->
    @if (showDeleteModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="showDeleteModal.set(false)">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 ring-1 ring-slate-200 dark:ring-slate-800" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-4 mb-6">
            <div class="size-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
              <span class="material-icons text-red-600 dark:text-red-400 text-2xl">warning</span>
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white">Excluir Lançamento</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">Esta ação não poderá ser desfeita</p>
            </div>
          </div>
          <p class="text-slate-600 dark:text-slate-400 mb-8">Tem certeza que deseja excluir esta transação do financeiro?</p>
          <div class="flex justify-end gap-3">
            <button class="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all" (click)="showDeleteModal.set(false)">Cancelar</button>
            <button class="px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20" (click)="deleteItem()">Excluir</button>
          </div>
        </div>
      </div>
    }

    <!-- Modal PIX -->
    @if (showPixModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="closePixModal()">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 ring-1 ring-slate-200 dark:ring-slate-800 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="size-11 bg-primary/10 rounded-2xl flex items-center justify-center">
                <span class="material-icons text-primary text-2xl">qr_code_2</span>
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">Cobrança via PIX</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ pixTarget()?.paciente?.name || '' }} · R$ {{ pixValue() }}</p>
              </div>
            </div>
            <button class="text-slate-500 hover:text-slate-600 dark:hover:text-slate-200" (click)="closePixModal()">
              <span class="material-icons">close</span>
            </button>
          </div>

          @if (pixError()) {
            <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-700 dark:text-amber-300 text-sm flex items-start gap-2 mb-4">
              <span class="material-icons text-[18px] shrink-0">warning</span>
              <span>{{ pixError() }}</span>
            </div>
            <div class="flex justify-end">
              <button class="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all" (click)="closePixModal()">Fechar</button>
            </div>
          } @else if (pixCode()) {
            @if (pixQrImage()) {
              <div class="flex justify-center mb-5">
                <img [src]="pixQrImage()" alt="QR Code PIX" class="w-52 h-52 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 bg-white p-3">
              </div>
            }
            <div class="flex items-center gap-2 mb-4">
              <input [value]="pixCode()" readonly
                class="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-mono">
              <button class="px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold shrink-0" (click)="copyPixCode()">Copiar</button>
            </div>
            <div class="flex flex-col gap-2">
              <a [href]="whatsAppUrl()" target="_blank"
                class="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all">
                <span class="material-icons text-[18px]">chat</span> Compartilhar no WhatsApp
              </a>
              <p class="text-[11px] text-slate-500 text-center">O responsável também vê esta cobrança no Portal da Família</p>
            </div>
          } @else {
            <div class="flex flex-col items-center justify-center py-10">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p class="text-sm text-slate-500 mt-4">Gerando QR Code…</p>
            </div>
          }
        </div>
      </div>
    }

    <!-- Toast Notification -->
    @if (showToast()) {
      <div class="fixed bottom-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 animate-in shadow-lg"
        [class]="toastType() === 'success' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'">
        <span class="material-icons">{{ toastType() === 'success' ? 'check_circle' : 'info' }}</span>
        <span class="text-sm font-medium">{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class FinanceiroListComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  items = signal<any[]>([]);
  pacientes = signal<any[]>([]);
  loading = signal(true);
  searchTerm = '';
  filterStatus = '';
  activeTab = signal<'todos' | 'receita' | 'despesa'>('todos');

  // Métricas
  totalReceitas = signal(0);
  totalDespesas = signal(0);
  aReceber = signal(0);
  aPagar = signal(0);
  saldo = signal(0);

  // Contagens
  countReceitas = signal(0);
  countDespesas = signal(0);

  // Modais de exclusão e pagamento
  showDeleteModal = signal(false);
  itemToDelete = signal<any>(null);
  showConfirmPaymentModal = signal(false);
  paymentToConfirm = signal<any>(null);

  // Modal rápido de despesa
  showExpenseModal = signal(false);
  savingExpense = signal(false);
  expenseForm: any = {
    description: '',
    category: 'ALUGUEL',
    value: '',
    date: new Date().toISOString().substring(0, 10),
    status: 'pendente',
    paymentMethod: 'BOLETO',
    pacienteId: ''
  };

  // Modal de quitação rápida de despesa
  showPayModal = signal(false);
  itemToPay = signal<any>(null);
  payMethod = 'BOLETO';
  payDate = new Date().toISOString().substring(0, 10);

  // PIX
  showPixModal = signal(false);
  pixTarget = signal<any>(null);
  pixCode = signal('');
  pixQrImage = signal('');
  pixError = signal('');

  // Toast
  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal('info');

  private timeout: any;

  ngOnInit() {
    this.load();
    this.api.get('/pacientes').subscribe((res: any) => this.pacientes.set(res.data || []));
  }

  load() {
    this.loading.set(true);
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;

    this.api.get('/financeiro', params).subscribe({
      next: (res: any) => {
        const data = res.data || [];
        this.items.set(data);
        this.calculateSummary(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setTypeFilter(tab: 'todos' | 'receita' | 'despesa') {
    this.activeTab.set(tab);
  }

  filteredItems(): any[] {
    let list = this.items();
    const tab = this.activeTab();
    if (tab !== 'todos') {
      list = list.filter(item => item.type === tab);
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      list = list.filter(item => {
        const patientName = (item.paciente?.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const fornecedor = (item.fornecedor || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        return patientName.includes(term) || desc.includes(term) || fornecedor.includes(term) || cat.includes(term);
      });
    }
    return list;
  }

  calculateSummary(data: any[]) {
    let receitas = 0;
    let despesas = 0;
    let aReceber = 0;
    let aPagar = 0;
    let nReceitas = 0;
    let nDespesas = 0;

    data.forEach(item => {
      const val = parseFloat(item.value) || 0;
      if (item.type === 'receita') {
        nReceitas++;
        if (item.status === 'pago') {
          receitas += val;
        } else {
          aReceber += val;
        }
      } else {
        nDespesas++;
        if (item.status === 'pago') {
          despesas += val;
        } else {
          aPagar += val;
        }
      }
    });

    this.totalReceitas.set(receitas);
    this.totalDespesas.set(despesas);
    this.aReceber.set(aReceber);
    this.aPagar.set(aPagar);
    this.saldo.set(receitas - despesas);
    this.countReceitas.set(nReceitas);
    this.countDespesas.set(nDespesas);
  }

  onSearch() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      // filtering computed in filteredItems()
    }, 150);
  }

  getCategoryIcon(cat?: string): string {
    switch (cat) {
      case 'ALUGUEL': return 'domain';
      case 'ENERGIA_AGUA': return 'bolt';
      case 'INTERNET_TELEFONE': return 'wifi';
      case 'MATERIAIS': return 'toys';
      case 'SOFTWARE': return 'dns';
      case 'MANUTENCAO': return 'cleaning_services';
      case 'IMPOSTOS': return 'receipt_long';
      case 'SALARIOS': return 'badge';
      default: return 'payments';
    }
  }

  getCategoryLabel(cat?: string): string {
    switch (cat) {
      case 'ALUGUEL': return 'Aluguel & Condomínio';
      case 'ENERGIA_AGUA': return 'Energia, Água & Gás';
      case 'INTERNET_TELEFONE': return 'Internet & Telefonia';
      case 'MATERIAIS': return 'Materiais Didáticos';
      case 'SOFTWARE': return 'Softwares & Assinaturas';
      case 'MANUTENCAO': return 'Limpeza & Manutenção';
      case 'IMPOSTOS': return 'Impostos & Contabilidade';
      case 'SALARIOS': return 'Salários / Pró-labore';
      default: return 'Geral';
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = ['#2563EB', '#6D28D9', '#BE185D', '#B45309', '#047857', '#B91C1C', '#0E7490', '#4D7C0F'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }

  // Quick Expense Modal
  openExpenseModal() {
    this.expenseForm = {
      description: '',
      category: 'ALUGUEL',
      value: '',
      date: new Date().toISOString().substring(0, 10),
      status: 'pendente',
      paymentMethod: 'BOLETO',
      pacienteId: ''
    };
    this.showExpenseModal.set(true);
  }

  closeExpenseModal() {
    this.showExpenseModal.set(false);
  }

  saveQuickExpense() {
    if (!this.expenseForm.description?.trim()) {
      return this.toast.warning('Informe a descrição ou favorecido');
    }
    if (!this.expenseForm.value || Number(this.expenseForm.value) <= 0) {
      return this.toast.warning('Informe um valor válido');
    }
    if (!this.expenseForm.date) {
      return this.toast.warning('Informe a data de vencimento');
    }

    this.savingExpense.set(true);
    const payload = {
      ...this.expenseForm,
      type: 'despesa',
      fornecedor: this.expenseForm.description,
      dataVencimento: this.expenseForm.date,
      dataPagamento: this.expenseForm.status === 'pago' ? this.expenseForm.date : null,
    };

    this.api.post('/financeiro', payload).subscribe({
      next: () => {
        this.savingExpense.set(false);
        this.showExpenseModal.set(false);
        this.showNotification('Despesa lançada com sucesso!', 'success');
        this.load();
      },
      error: () => {
        this.savingExpense.set(false);
        this.toast.error('Erro ao registrar despesa');
      }
    });
  }

  // Quitação Rápida de Despesa
  openPayModal(item: any) {
    this.itemToPay.set(item);
    this.payMethod = item.paymentMethod || 'BOLETO';
    this.payDate = new Date().toISOString().substring(0, 10);
    this.showPayModal.set(true);
  }

  executePayExpense() {
    const item = this.itemToPay();
    if (!item) return;

    this.api.patch(`/financeiro/${item.id}/pay`, {
      paymentMethod: this.payMethod,
      dataPagamento: this.payDate
    }).subscribe({
      next: () => {
        this.showPayModal.set(false);
        this.showNotification('Conta quitada com sucesso!', 'success');
        this.load();
      },
      error: () => this.toast.error('Erro ao registrar quitação')
    });
  }

  // Receitas: Confirmação de recebimento
  openConfirmPaymentModal(item: any) {
    this.paymentToConfirm.set(item);
    this.showConfirmPaymentModal.set(true);
  }

  executeConfirmPayment() {
    const item = this.paymentToConfirm();
    this.showConfirmPaymentModal.set(false);
    if (item) {
      this.api.put(`/financeiro/${item.id}`, { status: 'pago' }).subscribe({
        next: () => {
          this.showNotification('Recebimento confirmado com sucesso!', 'success');
          this.load();
        },
        error: () => this.showNotification('Erro ao confirmar recebimento', 'error')
      });
    }
  }

  // Exclusão
  confirmDelete(item: any) {
    this.itemToDelete.set(item);
    this.showDeleteModal.set(true);
  }

  deleteItem() {
    const item = this.itemToDelete();
    if (!item) return;
    this.api.delete(`/financeiro/${item.id}`).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.showNotification('Lançamento excluído com sucesso!', 'success');
        this.load();
      },
      error: () => this.toast.error('Erro ao excluir transação')
    });
  }

  // Recibo / Comprovante
  generateReceipt(item: any) {
    const isDespesa = item.type === 'despesa';
    const docTitle = isDespesa ? 'Comprovante de Despesa / Pagamento' : 'Recibo de Pagamento';
    const entityLabel = isDespesa ? 'Favorecido / Fornecedor:' : 'Paciente:';
    const entityValue = isDespesa 
      ? (item.fornecedor || item.description || 'Despesa Geral') 
      : (escapeHtml(item.paciente?.name) || '—');

    const receiptHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007F80; margin: 0;">EduPsych Pro</h1>
          <p style="color: #666; margin: 5px 0 0;">${docTitle}</p>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #666;">${entityLabel}</td><td style="padding: 8px 0; font-weight: bold;">${entityValue}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Data:</td><td style="padding: 8px 0;">${new Date(item.date).toLocaleDateString('pt-BR')}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Tipo:</td><td style="padding: 8px 0;">${item.type === 'receita' ? 'Receita' : 'Despesa'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Status:</td><td style="padding: 8px 0;">${item.status === 'pago' ? 'Pago / Liquidado' : 'Pendente'}</td></tr>
          ${item.category ? `<tr><td style="padding: 8px 0; color: #666;">Categoria:</td><td style="padding: 8px 0;">${this.getCategoryLabel(item.category)}</td></tr>` : ''}
          ${item.paymentMethod ? `<tr><td style="padding: 8px 0; color: #666;">Forma:</td><td style="padding: 8px 0;">${item.paymentMethod}</td></tr>` : ''}
          <tr><td style="padding: 8px 0; color: #666; font-size: 16px;">Valor:</td><td style="padding: 8px 0; font-size: 16px; font-weight: bold; color: ${item.type === 'receita' ? '#10B981' : '#EF4444'};">R$ ${(parseFloat(item.value) || 0).toFixed(2)}</td></tr>
        </table>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="text-align: center; color: #999; font-size: 12px;">Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    `;

    if (typeof html2pdf !== 'undefined') {
      const element = document.createElement('div');
      element.innerHTML = receiptHtml;
      html2pdf().from(element).set({ filename: `comprovante-${item.id}.pdf`, margin: 10 }).save();
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
        printWindow.print();
      }
    }
    this.showNotification('Comprovante gerado com sucesso!', 'success');
  }

  // Relatório Mensal
  exportMonthlyReport() {
    const now = new Date();
    const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const data = this.filteredItems();

    const reportHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007F80; margin: 0;">EduPsych Pro</h1>
          <h2 style="color: #333; margin: 10px 0 0;">Relatório Financeiro - ${monthName}</h2>
        </div>
        <div style="display: flex; gap: 15px; margin-bottom: 30px;">
          <div style="flex: 1; padding: 15px; background: #D1FAE5; border-radius: 12px; text-align: center;">
            <p style="margin: 0; color: #065F46; font-size: 11px;">RECEITAS PAGAS</p>
            <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #065F46;">R$ ${this.totalReceitas().toFixed(2)}</p>
          </div>
          <div style="flex: 1; padding: 15px; background: #FEE2E2; border-radius: 12px; text-align: center;">
            <p style="margin: 0; color: #991B1B; font-size: 11px;">DESPESAS PAGAS</p>
            <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #991B1B;">R$ ${this.totalDespesas().toFixed(2)}</p>
          </div>
          <div style="flex: 1; padding: 15px; background: #FFE4E6; border-radius: 12px; text-align: center;">
            <p style="margin: 0; color: #BE123C; font-size: 11px;">A PAGAR</p>
            <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #BE123C;">R$ ${this.aPagar().toFixed(2)}</p>
          </div>
          <div style="flex: 1; padding: 15px; background: #DBEAFE; border-radius: 12px; text-align: center;">
            <p style="margin: 0; color: #1E40AF; font-size: 11px;">SALDO ATUAL</p>
            <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #1E40AF;">R$ ${this.saldo().toFixed(2)}</p>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Data / Venc.</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Identificação</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Tipo</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Status</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px;">${new Date(item.date).toLocaleDateString('pt-BR')}</td>
                <td style="padding: 10px;">${escapeHtml(item.fornecedor || item.paciente?.name || item.description) || '—'}</td>
                <td style="padding: 10px;">${item.type === 'receita' ? 'Receita' : 'Despesa'}</td>
                <td style="padding: 10px;">${item.status === 'pago' ? 'Pago' : item.status === 'pendente' ? 'Pendente' : 'Atrasado'}</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; color: ${item.type === 'receita' ? '#10B981' : '#EF4444'};">R$ ${(parseFloat(item.value) || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="text-align: center; color: #999; font-size: 11px; margin-top: 30px;">Relatório gerado em ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    `;

    if (typeof html2pdf !== 'undefined') {
      const element = document.createElement('div');
      element.innerHTML = reportHtml;
      html2pdf().from(element).set({ filename: `relatorio-financeiro-${now.getMonth() + 1}-${now.getFullYear()}.pdf`, margin: 10 }).save();
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(reportHtml);
        printWindow.document.close();
        printWindow.print();
      }
    }
    this.showNotification('Relatório exportado com sucesso!', 'success');
  }

  showNotification(message: string, type: string) {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }

  // PIX
  openPixModal(item: any) {
    this.pixTarget.set(item);
    this.pixCode.set('');
    this.pixQrImage.set('');
    this.pixError.set('');
    this.showPixModal.set(true);
    this.api.post(`/financeiro/${item.id}/generate-pix`, { force: true }).subscribe({
      next: (res: any) => {
        this.pixCode.set(res.pixCopiaECola || '');
        this.renderPixQr(res.pixCopiaECola || '');
      },
      error: (err) => this.pixError.set(err.error?.error || 'Erro ao gerar cobrança PIX'),
    });
  }

  closePixModal() {
    this.showPixModal.set(false);
    this.load();
  }

  renderPixQr(code: string) {
    QRCode.toDataURL(code, { width: 260, margin: 2 }).then((url: string) => this.pixQrImage.set(url));
  }

  copyPixCode() {
    navigator.clipboard?.writeText(this.pixCode());
    this.showNotification('Código PIX copiado!', 'success');
  }

  pixValue() {
    const v = parseFloat(this.pixTarget()?.value) || 0;
    return v.toFixed(2);
  }

  whatsAppUrl() {
    const item = this.pixTarget();
    const phone = item?.paciente?.responsible?.phone || '';
    const digits = phone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Olá! Segue a cobrança de R$ ${this.pixValue()} (${item?.paciente?.name || ''}).\n\nPague com o PIX abaixo:\n${this.pixCode()}`
    );
    return `https://wa.me/${digits}?text=${text}`;
  }
}
