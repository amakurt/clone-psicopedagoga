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
    <div class="space-y-5 sm:space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="size-11 sm:size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <span class="material-icons text-primary text-2xl">payments</span>
        </div>
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Cobranças & PIX</h2>
          <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Acompanhe e realize o pagamento das sessões</p>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pendente</span>
            <span class="material-icons text-amber-500 text-lg">pending</span>
          </div>
          <p class="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">R$ {{ pendingValue() }}</p>
          <p class="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">Aguardando pagamento</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total</span>
            <span class="material-icons text-primary text-lg">account_balance_wallet</span>
          </div>
          <p class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">R$ {{ totalValue() }}</p>
          <p class="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">Histórico geral</p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-16">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      } @else if (charges().length === 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-gray-200 dark:border-slate-700 text-center shadow-sm">
          <div class="size-16 rounded-3xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-gray-400 dark:text-slate-500">
            <span class="material-icons text-3xl">qr_code_2</span>
          </div>
          <h3 class="mt-4 text-base sm:text-lg font-bold text-gray-900 dark:text-white">Nenhuma cobrança registrada</h3>
          <p class="mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-400">As cobranças enviadas pela clínica aparecerão aqui.</p>
        </div>
      } @else {
        <!-- Mobile Cards View (< 768px) -->
        <div class="block md:hidden space-y-3">
          @for (c of charges(); track c.id) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-xs text-gray-400 dark:text-slate-500">{{ c.date | date:'dd/MM/yyyy' }}</p>
                  <h4 class="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">
                    {{ c.description || c.paciente || 'Sessão Clínica' }}
                  </h4>
                  @if (c.paciente && c.description) {
                    <p class="text-xs text-primary font-medium truncate">{{ c.paciente }}</p>
                  }
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0" [class]="getStatusClass(c)">
                  {{ c.payConfirmedByGuardian ? 'Paguei' : (c.status === 'PAGO' ? 'Pago' : 'Pendente') }}
                </span>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700/60">
                <div>
                  <span class="text-[10px] uppercase font-bold text-gray-400">Valor</span>
                  <p class="text-lg font-black text-gray-900 dark:text-white">R$ {{ c.value.toFixed(2) }}</p>
                </div>

                @if (c.status !== 'PAGO') {
                  <button class="px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all active:scale-95 flex items-center gap-1.5"
                    (click)="openPayModal(c)">
                    <span class="material-icons text-sm">qr_code_2</span> Pagar PIX
                  </button>
                } @else {
                  <span class="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span class="material-icons text-sm">check_circle</span> Confirmado
                  </span>
                }
              </div>
            </div>
          }
        </div>

        <!-- Desktop Table View (>= 768px) -->
        <div class="hidden md:block bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div class="overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
            <table class="w-full min-w-[650px]">
              <thead class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                <tr>
                  <th class="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Data</th>
                  <th class="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Descrição / Paciente</th>
                  <th class="px-6 py-3.5 text-right text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Valor</th>
                  <th class="px-6 py-3.5 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3.5 text-right text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-slate-700/50">
                @for (c of charges(); track c.id) {
                  <tr class="hover:bg-gray-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td class="px-6 py-4 text-xs font-medium text-gray-600 dark:text-slate-300 whitespace-nowrap">{{ c.date | date:'dd/MM/yyyy' }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-white font-bold">
                      {{ c.description || c.paciente }}
                      @if (c.paciente && c.description) { <span class="text-xs font-normal text-gray-400">· {{ c.paciente }}</span> }
                    </td>
                    <td class="px-6 py-4 text-sm text-right font-black text-gray-900 dark:text-white whitespace-nowrap">R$ {{ c.value.toFixed(2) }}</td>
                    <td class="px-6 py-4 text-center whitespace-nowrap">
                      <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" [class]="getStatusClass(c)">
                        {{ c.payConfirmedByGuardian ? 'Paguei (aguardando confirmação)' : (c.status === 'PAGO' ? 'Pago' : 'Pendente') }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right whitespace-nowrap">
                      @if (c.status !== 'PAGO') {
                        <button class="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ml-auto"
                          (click)="openPayModal(c)">
                          <span class="material-icons text-sm">qr_code_2</span> Pagar
                        </button>
                      } @else {
                        <span class="text-xs text-gray-400 font-medium">Concluído</span>
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

    <!-- Modal Pagamento PIX -->
    @if (payModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" (click)="payModalOpen.set(false)">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 border border-gray-100 dark:border-slate-800" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-5">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <span class="material-icons text-xl">qr_code_2</span>
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Pagar com PIX</h3>
                <p class="text-xs text-gray-500 dark:text-slate-400">{{ selected()?.paciente || 'Sessão' }} · R$ {{ selected()?.value?.toFixed(2) }}</p>
              </div>
            </div>
            <button class="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl" (click)="payModalOpen.set(false)">
              <span class="material-icons text-lg">close</span>
            </button>
          </div>

          @if (payConfirmed()) {
            <div class="flex flex-col items-center py-6 text-center">
              <div class="size-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <span class="material-icons text-3xl">check_circle</span>
              </div>
              <h4 class="mt-4 text-base sm:text-lg font-bold text-gray-900 dark:text-white">Pagamento comunicado!</h4>
              <p class="mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-400">A clínica foi notificada e confirmará o recebimento em instantes.</p>
              <button class="mt-6 w-full py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-2xl text-sm font-bold transition-all"
                (click)="payModalOpen.set(false)">Concluir</button>
            </div>
          } @else {
            <div class="flex justify-center mb-4">
              <img [src]="qrImage()" alt="QR Code PIX" class="w-48 h-48 sm:w-52 sm:h-52 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white p-3 shadow-inner">
            </div>
            <div class="flex items-center gap-2 mb-4">
              <input [value]="selected()?.pixCopiaECola" readonly
                class="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-600 dark:text-gray-300 font-mono select-all">
              <button class="px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold shrink-0 transition-all" (click)="copyCode()">Copiar</button>
            </div>
            <p class="text-[11px] text-gray-400 text-center mb-5">Abra o app do seu banco, escolha "PIX Copia e Cola" ou escaneie o código.</p>
            <button class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              [disabled]="saving()" (click)="confirmPay()">
              <span class="material-icons text-[18px]">done_all</span>
              {{ saving() ? 'Avisando clínica...' : 'Já paguei — avisar a clínica' }}
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