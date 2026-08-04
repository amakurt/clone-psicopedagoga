import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';

declare var html2pdf: any;

@Component({
  selector: 'app-financeiro-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Financeiro</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Controle de receitas e despesas</p>
        </div>
        <div class="flex items-center gap-3">
          <button class="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all"
            (click)="exportMonthlyReport()">
            <span class="material-icons text-lg">picture_as_pdf</span> Relatório Mensal
          </button>
          <a routerLink="/app/financeiro/novo"
            class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
            <span class="material-icons text-[18px]">add</span>
            <span>Nova Transação</span>
          </a>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-4">
          <div class="size-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <span class="material-icons text-emerald-600 dark:text-emerald-400 text-xl">trending_up</span>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Receitas</p>
            <p class="text-xl font-black text-emerald-600">{{ totalReceitas() | currency:'BRL' }}</p>
          </div>
        </div>
        <div class="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-4">
          <div class="size-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span class="material-icons text-red-600 dark:text-red-400 text-xl">trending_down</span>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Despesas</p>
            <p class="text-xl font-black text-red-600">{{ totalDespesas() | currency:'BRL' }}</p>
          </div>
        </div>
        <div class="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-4">
          <div class="size-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <span class="material-icons text-amber-600 dark:text-amber-400 text-xl">schedule</span>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">A Receber</p>
            <p class="text-xl font-black text-amber-600">{{ aReceber() | currency:'BRL' }}</p>
          </div>
        </div>
        <div class="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-4">
          <div class="size-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <span class="material-icons text-blue-600 dark:text-blue-400 text-xl">account_balance_wallet</span>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo</p>
            <p class="text-xl font-black text-blue-600">{{ saldo() | currency:'BRL' }}</p>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1 max-w-md">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Buscar transação..." [(ngModel)]="searchTerm" (input)="onSearch()">
          </div>
          <select class="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
            [(ngModel)]="filterStatus" (change)="load()">
            <option value="">Todos os status</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="atrasado">Atrasado</option>
          </select>
        </div>

        <div class="p-6">
          @if (loading()) {
            <div class="flex items-center justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          } @else if (items().length === 0) {
            <div class="text-center py-12">
              <span class="material-icons text-6xl text-slate-300">payments</span>
              <p class="text-slate-500 mt-3">Nenhuma transação encontrada</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Paciente</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Valor</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tipo</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (item of items(); track item.id) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="size-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                            [style.background]="getAvatarColor(item.paciente?.name || '')">
                            {{ getInitials(item.paciente?.name || '') }}
                          </div>
                          <span class="text-sm font-bold text-slate-900 dark:text-white">{{ item.paciente?.name || '—' }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ item.date | date:'dd/MM/yyyy' }}</td>
                      <td class="px-6 py-4 text-sm font-bold" [class]="item.type === 'receita' ? 'text-emerald-600' : 'text-red-600'">
                        {{ item.type === 'receita' ? '+' : '-' }}{{ item.value | currency:'BRL' }}
                      </td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                          [class]="item.type === 'receita' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">
                          {{ item.type === 'receita' ? 'Receita' : 'Despesa' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                          [class]="item.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : item.status === 'pendente' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'">
                          {{ item.status | titlecase }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-1">
                          @if (item.status === 'pendente') {
                            <button class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all" title="Confirmar pagamento" (click)="confirmPayment(item)">
                              <span class="material-icons text-lg">check_circle</span>
                            </button>
                          }
                          <button class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all" title="Gerar recibo" (click)="generateReceipt(item)">
                            <span class="material-icons text-lg">receipt</span>
                          </button>
                          <a [routerLink]="['/app/financeiro', item.id, 'editar']" class="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all" title="Editar">
                            <span class="material-icons text-lg">edit</span>
                          </a>
                          <button class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Excluir" (click)="confirmDelete(item)">
                            <span class="material-icons text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>

    @if (showDeleteModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="showDeleteModal.set(false)">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 ring-1 ring-slate-200 dark:ring-slate-800" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-4 mb-6">
            <div class="size-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
              <span class="material-icons text-red-600 dark:text-red-400 text-2xl">warning</span>
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white">Excluir Transação</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">Esta ação não pode ser desfeita</p>
            </div>
          </div>
          <p class="text-slate-600 dark:text-slate-400 mb-8">Tem certeza que deseja excluir esta transação?</p>
          <div class="flex justify-end gap-3">
            <button class="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all" (click)="showDeleteModal.set(false)">Cancelar</button>
            <button class="px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20" (click)="deleteItem()">Excluir</button>
          </div>
        </div>
      </div>
    }

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
  items = signal<any[]>([]);
  loading = signal(true);
  searchTerm = '';
  filterStatus = '';
  showDeleteModal = signal(false);
  itemToDelete = signal<any>(null);
  totalReceitas = signal(0);
  totalDespesas = signal(0);
  aReceber = signal(0);
  saldo = signal(0);
  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal('info');
  private timeout: any;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const params: any = {};
    if (this.searchTerm) params.search = this.searchTerm;
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

  calculateSummary(data: any[]) {
    let receitas = 0, despesas = 0, pendente = 0;
    data.forEach(item => {
      const val = parseFloat(item.value) || 0;
      if (item.type === 'receita') {
        receitas += val;
        if (item.status === 'pendente') pendente += val;
      } else {
        despesas += val;
      }
    });
    this.totalReceitas.set(receitas);
    this.totalDespesas.set(despesas);
    this.aReceber.set(pendente);
    this.saldo.set(receitas - despesas);
  }

  onSearch() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.load(), 300);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#06B6D4', '#84CC16'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }

  confirmPayment(item: any) {
    if (confirm('Confirmar recebimento deste pagamento?')) {
      this.api.put(`/financeiro/${item.id}`, { status: 'pago' }).subscribe({
        next: () => {
          this.showNotification('Pagamento confirmado com sucesso!', 'success');
          this.load();
        },
        error: () => this.showNotification('Erro ao confirmar pagamento', 'error')
      });
    }
  }

  generateReceipt(item: any) {
    const receiptHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007F80; margin: 0;">EduPsych Pro</h1>
          <p style="color: #666; margin: 5px 0 0;">Recibo de Pagamento</p>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #666;">Paciente:</td><td style="padding: 8px 0; font-weight: bold;">${item.paciente?.name || '—'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Data:</td><td style="padding: 8px 0;">${new Date(item.date).toLocaleDateString('pt-BR')}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Tipo:</td><td style="padding: 8px 0;">${item.type === 'receita' ? 'Receita' : 'Despesa'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Status:</td><td style="padding: 8px 0;">${item.status === 'pago' ? 'Pago' : 'Pendente'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666; font-size: 16px;">Valor:</td><td style="padding: 8px 0; font-size: 16px; font-weight: bold; color: ${item.type === 'receita' ? '#10B981' : '#EF4444'};">R$ ${(parseFloat(item.value) || 0).toFixed(2)}</td></tr>
        </table>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="text-align: center; color: #999; font-size: 12px;">Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    `;

    if (typeof html2pdf !== 'undefined') {
      const element = document.createElement('div');
      element.innerHTML = receiptHtml;
      html2pdf().from(element).set({ filename: `recibo-${item.id}.pdf`, margin: 10 }).save();
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
        printWindow.print();
      }
    }
    this.showNotification('Recibo gerado com sucesso!', 'success');
  }

  exportMonthlyReport() {
    const now = new Date();
    const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const data = this.items();

    const reportHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007F80; margin: 0;">EduPsych Pro</h1>
          <h2 style="color: #333; margin: 10px 0 0;">Relatório Financeiro - ${monthName}</h2>
        </div>
        <div style="display: flex; gap: 20px; margin-bottom: 30px;">
          <div style="flex: 1; padding: 20px; background: #D1FAE5; border-radius: 12px; text-align: center;">
            <p style="margin: 0; color: #065F46; font-size: 12px;">RECEITAS</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #065F46;">R$ ${this.totalReceitas().toFixed(2)}</p>
          </div>
          <div style="flex: 1; padding: 20px; background: #FEE2E2; border-radius: 12px; text-align: center;">
            <p style="margin: 0; color: #991B1B; font-size: 12px;">DESPESAS</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #991B1B;">R$ ${this.totalDespesas().toFixed(2)}</p>
          </div>
          <div style="flex: 1; padding: 20px; background: #DBEAFE; border-radius: 12px; text-align: center;">
            <p style="margin: 0; color: #1E40AF; font-size: 12px;">SALDO</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #1E40AF;">R$ ${this.saldo().toFixed(2)}</p>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Data</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Paciente</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Tipo</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Status</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px;">${new Date(item.date).toLocaleDateString('pt-BR')}</td>
                <td style="padding: 10px;">${item.paciente?.name || '—'}</td>
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

  confirmDelete(item: any) {
    this.itemToDelete.set(item);
    this.showDeleteModal.set(true);
  }

  deleteItem() {
    const item = this.itemToDelete();
    if (!item) return;
    this.api.delete(`/financeiro/${item.id}`).subscribe({
      next: () => { this.showDeleteModal.set(false); this.load(); },
      error: () => alert('Erro ao excluir transação')
    });
  }

  showNotification(message: string, type: string) {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
