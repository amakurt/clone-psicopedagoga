import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

declare var html2pdf: any;

@Component({
  selector: 'app-consent-log',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Histórico de Consentimentos</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Registro de consentimentos LGPD</p>
        </div>
        <div class="flex gap-3">
          <a routerLink="/app/lgpd/novo" class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
            <span class="material-icons text-[18px]">add</span>
            <span>Novo Consentimento</span>
          </a>
          <button (click)="exportPDF()" class="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all">
            <span class="material-icons text-[18px]">picture_as_pdf</span>
            <span>Exportar</span>
          </button>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Paciente</label>
            <select [(ngModel)]="filterPatient" (change)="loadConsents()" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
              <option value="">Todos</option>
              @for (p of patients(); track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Tipo</label>
            <select [(ngModel)]="filterType" (change)="loadConsents()" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
              <option value="">Todos</option>
              <option value="DATA_PROCESSING">Tratamento de Dados</option>
              <option value="MARKETING">Marketing</option>
              <option value="RESEARCH">Pesquisa</option>
              <option value="SHARE_WITH_SCHOOL">Compartilhamento Escola</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Status</label>
            <select [(ngModel)]="filterStatus" (change)="loadConsents()" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
              <option value="">Todos</option>
              <option value="GRANTED">Concedido</option>
              <option value="DENIED">Negado</option>
              <option value="REVOKED">Revogado</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div class="p-6">
          @if (loading()) {
            <div class="flex items-center justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          } @else if (consents().length === 0) {
            <div class="text-center py-12">
              <span class="material-icons text-6xl text-slate-300">gpp_good</span>
              <p class="text-slate-500 mt-3">Nenhum consentimento registrado</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Paciente</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tipo</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">IP</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (c of consents(); track c.id) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ c.recordedAt | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-bold text-slate-900 dark:text-white">{{ c.paciente?.name || '—' }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-xs font-bold px-2 py-1 rounded-full" [class]="getTypeClass(c.consentType)">
                          {{ getTypeLabel(c.consentType) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-xs font-bold px-2 py-1 rounded-full" [class]="getStatusClass(c.status)">
                          {{ getStatusLabel(c.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-xs text-slate-500">{{ c.ipAddress || '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
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
export class ConsentLogComponent implements OnInit {
  private api = inject(ApiService);

  consents = signal<any[]>([]);
  patients = signal<any[]>([]);
  loading = signal(true);

  filterPatient = '';
  filterType = '';
  filterStatus = '';

  showToast = signal(false);
  toastMessage = signal('');

  ngOnInit() {
    this.loadPatients();
    this.loadConsents();
  }

  loadPatients() {
    this.api.get('/pacientes').subscribe({
      next: (res: any) => this.patients.set(res.data || [])
    });
  }

  loadConsents() {
    this.loading.set(true);
    const params: any = {};
    if (this.filterPatient) params.patientId = this.filterPatient;
    if (this.filterType) params.consentType = this.filterType;
    if (this.filterStatus) params.status = this.filterStatus;

    this.api.get('/consents', params).subscribe({
      next: (res: any) => {
        this.consents.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'DATA_PROCESSING': 'Dados',
      'MARKETING': 'Marketing',
      'RESEARCH': 'Pesquisa',
      'SHARE_WITH_SCHOOL': 'Escola'
    };
    return labels[type] || type;
  }

  getTypeClass(type: string): string {
    const classes: Record<string, string> = {
      'DATA_PROCESSING': 'bg-blue-100 text-blue-700',
      'MARKETING': 'bg-purple-100 text-purple-700',
      'RESEARCH': 'bg-emerald-100 text-emerald-700',
      'SHARE_WITH_SCHOOL': 'bg-amber-100 text-amber-700'
    };
    return classes[type] || 'bg-slate-100 text-slate-700';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'GRANTED': 'Concedido',
      'DENIED': 'Negado',
      'REVOKED': 'Revogado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'GRANTED': 'bg-emerald-100 text-emerald-700',
      'DENIED': 'bg-red-100 text-red-700',
      'REVOKED': 'bg-amber-100 text-amber-700'
    };
    return classes[status] || 'bg-slate-100 text-slate-700';
  }

  exportPDF() {
    const rows = this.consents().map(c => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px;">${new Date(c.recordedAt).toLocaleDateString('pt-BR')}</td>
        <td style="padding: 10px;">${c.paciente?.name || '—'}</td>
        <td style="padding: 10px;">${this.getTypeLabel(c.consentType)}</td>
        <td style="padding: 10px;">${this.getStatusLabel(c.status)}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007F80; margin: 0;">EduPsych Pro</h1>
          <h2 style="color: #333; margin: 10px 0 0;">Histórico de Consentimentos</h2>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr style="background: #f8fafc; border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Data</td>
            <td style="padding: 10px; font-weight: bold;">Paciente</td>
            <td style="padding: 10px; font-weight: bold;">Tipo</td>
            <td style="padding: 10px; font-weight: bold;">Status</td>
          </tr>
          ${rows}
        </table>
        <hr style="border: 1px solid #eee; margin: 30px 0 20px;">
        <p style="text-align: center; color: #999; font-size: 11px;">Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    `;

    if (typeof html2pdf !== 'undefined') {
      const element = document.createElement('div');
      element.innerHTML = html;
      html2pdf().from(element).set({ filename: 'historico-consentimentos.pdf', margin: 10 }).save();
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }
    }
    this.showNotification('Relatório exportado com sucesso!');
  }

  showNotification(message: string) {
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
