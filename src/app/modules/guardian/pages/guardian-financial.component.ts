import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GuardianService } from '../services/guardian.service';
import { Transaction } from '@core/models';

@Component({
  selector: 'app-guardian-financial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Financeiro</h2>
        <p class="text-gray-500 dark:text-slate-400 mt-1">Valores das sessões</p>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <p class="text-sm text-gray-500 dark:text-slate-400">Total</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">R$ {{ totalValue() }}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <p class="text-sm text-gray-500 dark:text-slate-400">Pago</p>
          <p class="text-2xl font-bold text-green-600">R$ {{ paidValue() }}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <p class="text-sm text-gray-500 dark:text-slate-400">Pendente</p>
          <p class="text-2xl font-bold text-amber-600">R$ {{ pendingValue() }}</p>
        </div>
      </div>

      @if (transactions().length === 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-gray-200 dark:border-slate-700 text-center">
          <span class="material-icons text-6xl text-gray-300 dark:text-slate-600">payments</span>
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Nenhum lançamento</h3>
          <p class="mt-2 text-gray-500 dark:text-slate-400">Os registros financeiros aparecerão aqui</p>
        </div>
      } @else {
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Data</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Descrição</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Valor</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-slate-700">
              @for (t of transactions(); track t.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td class="px-6 py-4 text-sm text-gray-700 dark:text-slate-300">{{ t.date }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{{ t.description || t.patientName }}</td>
                  <td class="px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-white">R$ {{ t.value }}</td>
                  <td class="px-6 py-4 text-center">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold"
                      [class]="getStatusClass(t.status)">
                      {{ t.status }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class GuardianFinancialComponent implements OnInit {
  private guardianService = inject(GuardianService);
  private route = inject(ActivatedRoute);

  transactions = signal<Transaction[]>([]);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const patientId = params['patientId'] || localStorage.getItem('guardian_patient_id');
      if (patientId) {
        this.loadFinancial(patientId);
      }
    });
  }

  loadFinancial(patientId: string) {
    this.guardianService.getFinancial(patientId).subscribe({
      next: (res: any) => this.transactions.set(res.data || [])
    });
  }

  totalValue() {
    return this.transactions().reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0).toFixed(2);
  }

  paidValue() {
    return this.transactions()
      .filter(t => t.status === 'PAGO')
      .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0).toFixed(2);
  }

  pendingValue() {
    return this.transactions()
      .filter(t => t.status === 'PENDENTE' || t.status === 'ATRASADO')
      .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0).toFixed(2);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PAGO': return 'bg-green-100 text-green-700';
      case 'PENDENTE': return 'bg-amber-100 text-amber-700';
      case 'ATRASADO': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
