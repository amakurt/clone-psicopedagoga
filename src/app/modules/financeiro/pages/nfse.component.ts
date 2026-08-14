import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';

declare var html2pdf: any;

@Component({
  selector: 'app-nfse',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">NFS-e</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Notas Fiscais de Serviço Eletrônica</p>
        </div>
        <button (click)="showForm.set(true)"
          class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
          <span class="material-icons text-[18px]">add</span> Nova NFS-e
        </button>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-4">
          <div class="size-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <span class="material-icons text-amber-600 dark:text-amber-400 text-xl">pending</span>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pendentes</p>
            <p class="text-xl font-black text-amber-600">{{ pendingCount() }}</p>
          </div>
        </div>
        <div class="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-4">
          <div class="size-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <span class="material-icons text-emerald-600 dark:text-emerald-400 text-xl">check_circle</span>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Emitidas</p>
            <p class="text-xl font-black text-emerald-700">{{ issuedCount() }}</p>
          </div>
        </div>
        <div class="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-4">
          <div class="size-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <span class="material-icons text-blue-600 dark:text-blue-400 text-xl">payments</span>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Emitido</p>
            <p class="text-xl font-black text-blue-600">{{ totalIssued() | currency:'BRL' }}</p>
          </div>
        </div>
      </div>

      <!-- Filter -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex gap-3">
          <select class="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
            [(ngModel)]="filterStatus" (change)="load()">
            <option value="">Todos os status</option>
            <option value="PENDENTE">Pendente</option>
            <option value="EMITIDA">Emitida</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>

        <div class="p-6">
          @if (loading()) {
            <div class="flex items-center justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          } @else if (items().length === 0) {
            <div class="text-center py-12">
              <span class="material-icons text-6xl text-slate-300">receipt_long</span>
              <p class="text-slate-500 mt-3">Nenhuma NFS-e encontrada</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nº</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Paciente</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Descrição</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Valor</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">ISS</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (item of items(); track item.id) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{{ item.number }}</td>
                      <td class="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{{ item.paciente?.name || '—' }}</td>
                      <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{{ item.description }}</td>
                      <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ item.value | currency:'BRL' }}</td>
                      <td class="px-6 py-4 text-sm text-red-600">-{{ item.taxValue | currency:'BRL' }}</td>
                      <td class="px-6 py-4 text-sm font-bold text-emerald-700">{{ item.totalValue | currency:'BRL' }}</td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                          [class]="getStatusClass(item.status)">
                          {{ getStatusLabel(item.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-1">
                          @if (item.status === 'PENDENTE') {
                            <button class="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all" title="Emitir" (click)="updateStatus(item.id, 'EMITIDA')">
                              <span class="material-icons text-lg">check_circle</span>
                            </button>
                          }
                          @if (item.status !== 'CANCELADA') {
                            <button class="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Cancelar" (click)="updateStatus(item.id, 'CANCELADA')">
                              <span class="material-icons text-lg">cancel</span>
                            </button>
                          }
                          <button class="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all" title="PDF" (click)="generatePdf(item)">
                            <span class="material-icons text-lg">picture_as_pdf</span>
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

    <!-- Form Modal -->
    @if (showForm()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="showForm.set(false)">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-8 ring-1 ring-slate-200 dark:ring-slate-800" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-4 mb-6">
            <div class="size-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <span class="material-icons text-primary text-2xl">receipt_long</span>
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white">Nova NFS-e</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">Preencha os dados da nota</p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Paciente *</label>
              <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                [(ngModel)]="form.patientId">
                <option value="">Selecione</option>
                @for (p of pacientes(); track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Profissional *</label>
              <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                [(ngModel)]="form.professionalId">
                <option value="">Selecione</option>
                @for (u of users(); track u.id) {
                  <option [value]="u.id">{{ u.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Descrição do serviço *</label>
              <textarea class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none resize-none"
                rows="2" [(ngModel)]="form.description" placeholder="Descrição do serviço prestado..."></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Valor (R$) *</label>
                <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                  type="number" step="0.01" [(ngModel)]="form.value" placeholder="0,00">
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">ISS (%)</label>
                <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                  type="number" step="0.1" [(ngModel)]="form.taxRate" placeholder="0">
              </div>
            </div>
            @if (form.value && form.taxRate) {
              <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p class="text-sm text-slate-600 dark:text-slate-400">Valor do serviço: <span class="font-bold">{{ form.value | currency:'BRL' }}</span></p>
                <p class="text-sm text-slate-600 dark:text-slate-400">ISS ({{ form.taxRate }}%): <span class="font-bold text-red-600">-{{ calcTax() | currency:'BRL' }}</span></p>
                <p class="text-sm font-bold text-emerald-700 mt-1">Total: {{ calcTotal() | currency:'BRL' }}</p>
              </div>
            }
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Observações</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                [(ngModel)]="form.notes" placeholder="Observações (opcional)">
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button class="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all" (click)="showForm.set(false)">Cancelar</button>
            <button class="px-5 py-2.5 text-sm font-bold text-on-primary bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              (click)="save()" [disabled]="saving()">
              {{ saving() ? 'Salvando...' : 'Emitir NFS-e' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (showToast()) {
      <div class="fixed bottom-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 animate-in shadow-lg"
        [class]="toastType() === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'">
        <span class="material-icons">{{ toastType() === 'success' ? 'check_circle' : 'error' }}</span>
        <span class="text-sm font-medium">{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class NfseComponent implements OnInit {
  private api = inject(ApiService);
  items = signal<any[]>([]);
  loading = signal(true);
  filterStatus = '';
  showForm = signal(false);
  saving = signal(false);
  pacientes = signal<any[]>([]);
  users = signal<any[]>([]);
  pendingCount = signal(0);
  issuedCount = signal(0);
  totalIssued = signal(0);
  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal('success');

  form: any = { patientId: '', professionalId: '', description: '', value: '', taxRate: 5, notes: '' };

  ngOnInit() {
    this.load();
    this.api.get('/pacientes').subscribe((res: any) => this.pacientes.set(res.data || []));
    this.api.get('/users/members').subscribe((res: any) => this.users.set(res.data || []));
  }

  load() {
    this.loading.set(true);
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;
    this.api.get('/nfse', params).subscribe({
      next: (res: any) => {
        const data = res.data || [];
        this.items.set(data);
        this.pendingCount.set(data.filter((i: any) => i.status === 'PENDENTE').length);
        this.issuedCount.set(data.filter((i: any) => i.status === 'EMITIDA').length);
        this.totalIssued.set(data.filter((i: any) => i.status === 'EMITIDA').reduce((sum: number, i: any) => sum + (i.totalValue || 0), 0));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  calcTax(): number {
    return (this.form.value * this.form.taxRate) / 100 || 0;
  }

  calcTotal(): number {
    return (this.form.value || 0) + this.calcTax();
  }

  save() {
    if (!this.form.patientId || !this.form.professionalId || !this.form.description || !this.form.value) {
      return this.notify('Preencha todos os campos obrigatórios', 'error');
    }
    this.saving.set(true);
    this.api.post('/nfse', this.form).subscribe({
      next: () => { this.showForm.set(false); this.saving.set(false); this.load(); this.notify('NFS-e criada com sucesso!', 'success'); },
      error: () => { this.saving.set(false); this.notify('Erro ao criar NFS-e', 'error'); }
    });
  }

  updateStatus(id: string, status: string) {
    this.api.put(`/nfse/${id}/status`, { status }).subscribe({
      next: () => { this.load(); this.notify('Status atualizado!', 'success'); },
      error: () => this.notify('Erro ao atualizar status', 'error')
    });
  }

  generatePdf(item: any) {
    this.api.get(`/nfse/${item.id}/pdf`).subscribe({
      next: (res: any) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(res.html);
          printWindow.document.close();
          setTimeout(() => printWindow.print(), 500);
        }
      },
      error: () => this.notify('Erro ao gerar PDF', 'error')
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'PENDENTE': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'EMITIDA': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'CANCELADA': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = { 'PENDENTE': 'Pendente', 'EMITIDA': 'Emitida', 'CANCELADA': 'Cancelada' };
    return map[status] || status;
  }

  notify(message: string, type: string) {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
