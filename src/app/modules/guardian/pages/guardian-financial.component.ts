import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import QRCode from 'qrcode';
import { GuardianService } from '../services/guardian.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-guardian-financial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Cobranças</h2>
        <p class="text-gray-500 dark:text-slate-400 mt-1">Pagamentos das sessões pelo PIX da clínica</p>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <p class="text-sm text-gray-500 dark:text-slate-400">Pendente</p>
          <p class="text-2xl font-bold text-amber-600">R$ {{ pendingValue() }}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <p class="text-sm text-gray-500 dark:text-slate-400">Total cobrado</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">R$ {{ totalValue() }}</p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-16">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      } @else if (charges().length === 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-gray-200 dark:border-slate-700 text-center">
          <span class="material-icons text-6xl text-gray-300 dark:text-slate-600">qr_code_2</span>
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Nenhuma cobrança</h3>
          <p class="mt-2 text-gray-500 dark:text-slate-400">As cobranças enviadas pela clínica aparecerão aqui</p>
        </div>
      } @else {
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div class="overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
            <table class="w-full min-w-[600px]">
            <thead class="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Data</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Descrição</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Valor</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Status</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-slate-700">
              @for (c of charges(); track c.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td class="px-6 py-4 text-sm text-gray-700 dark:text-slate-300">{{ c.date | date:'dd/MM/yyyy' }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                    {{ c.description || c.paciente }}
                    @if (c.paciente) { <span class="text-gray-400">· {{ c.paciente }}</span> }
                  </td>
                  <td class="px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-white">R$ {{ c.value.toFixed(2) }}</td>
                  <td class="px-6 py-4 text-center">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold" [class]="getStatusClass(c)">
                      {{ c.payConfirmedByGuardian ? 'Paguei (aguardando confirmação)' : (c.status === 'PAGO' ? 'Pago' : 'Pendente') }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    @if (c.status !== 'PAGO') {
                      <button class="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 transition-all"
                        (click)="openPayModal(c)">
                        Pagar
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    <!-- Modal pagamento -->
    @if (payModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="payModalOpen.set(false)">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 ring-1 ring-slate-200 dark:ring-slate-800" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="size-11 bg-primary/10 rounded-2xl flex items-center justify-center">
                <span class="material-icons text-primary text-2xl">qr_code_2</span>
              </div>
              <div>
                <h3 class="text-lg font-black text-gray-900 dark:text-white">Pagar com PIX</h3>
                <p class="text-xs text-gray-500 dark:text-slate-400">{{ selected()?.paciente || '' }} · R$ {{ selected()?.value?.toFixed(2) }}</p>
              </div>
            </div>
            <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" (click)="payModalOpen.set(false)">
              <span class="material-icons">close</span>
            </button>
          </div>

          @if (payConfirmed()) {
            <div class="flex flex-col items-center py-8 text-center">
              <span class="material-icons text-emerald-500 text-6xl">check_circle</span>
              <h4 class="mt-4 text-lg font-bold text-gray-900 dark:text-white">Pagamento comunicado!</h4>
              <p class="mt-2 text-sm text-gray-500 dark:text-slate-400">A clínica foi notificada e vai confirmar o recebimento.</p>
              <button class="mt-6 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl text-sm font-bold"
                (click)="payModalOpen.set(false)">Fechar</button>
            </div>
          } @else {
            <div class="flex justify-center mb-5">
              <img [src]="qrImage()" alt="QR Code PIX" class="w-52 h-52 rounded-2xl ring-1 ring-gray-200 dark:ring-slate-700 bg-white p-3">
            </div>
            <div class="flex items-center gap-2 mb-5">
              <input [value]="selected()?.pixCopiaECola" readonly
                class="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-600 dark:text-gray-300 font-mono">
              <button class="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl text-sm font-bold shrink-0" (click)="copyCode()">Copiar</button>
            </div>
            <p class="text-xs text-gray-400 mb-5 text-center">Abra o app do seu banco, escaneie o QR Code ou cole o código acima.</p>
            <button class="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all"
              [disabled]="saving()" (click)="confirmPay()">
              {{ saving() ? 'Enviando…' : 'Já paguei — avisar a clínica' }}
            </button>
          }
        </div>
      </div>
    }
  `
})
export class GuardianFinancialComponent implements OnInit {
  private guardianService = inject(GuardianService);
  private toast = inject(ToastService);

  charges = signal<any[]>([]);
  loading = signal(true);
  payModalOpen = signal(false);
  selected = signal<any>(null);
  qrImage = signal('');
  saving = signal(false);
  payConfirmed = signal(false);

  ngOnInit() {
    this.loadCharges();
  }

  loadCharges() {
    this.loading.set(true);
    this.guardianService.getCharges().subscribe({
      next: (res: any) => {
        this.charges.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  totalValue() {
    return this.charges().reduce((sum, c) => sum + (c.value || 0), 0).toFixed(2);
  }

  pendingValue() {
    return this.charges()
      .filter(c => c.status !== 'PAGO')
      .reduce((sum, c) => sum + (c.value || 0), 0).toFixed(2);
  }

  getStatusClass(c: any): string {
    if (c.payConfirmedByGuardian) return 'bg-blue-100 text-blue-700';
    if (c.status === 'PAGO') return 'bg-green-100 text-green-700';
    return 'bg-amber-100 text-amber-700';
  }

  openPayModal(c: any) {
    this.selected.set(c);
    this.payConfirmed.set(false);
    this.qrImage.set('');
    this.payModalOpen.set(true);
    QRCode.toDataURL(c.pixCopiaECola || '', { width: 260, margin: 2 }).then((url: string) => this.qrImage.set(url));
  }

  copyCode() {
    navigator.clipboard?.writeText(this.selected()?.pixCopiaECola || '');
    this.toast.success('Código PIX copiado!');
  }

  confirmPay() {
    this.saving.set(true);
    this.guardianService.confirmChargePayment(this.selected()?.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.payConfirmed.set(true);
        this.loadCharges();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erro ao comunicar pagamento');
      },
    });
  }
}