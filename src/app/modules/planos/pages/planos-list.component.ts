import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlanosService } from '../services/planos.service';

declare var html2pdf: any;

@Component({
  selector: 'app-planos-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Planos de Intervenção</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Planos terapêuticos estruturados</p>
        </div>
        <a routerLink="/planos/novo"
          class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
          <span class="material-icons text-[18px]">add</span>
          <span>Novo Plano</span>
        </a>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div class="p-6">
          @if (loading()) {
            <div class="flex items-center justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          } @else if (items().length === 0) {
            <div class="text-center py-12">
              <span class="material-icons text-6xl text-slate-300">playlist_add_check</span>
              <p class="text-slate-500 mt-3">Nenhum plano encontrado</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Paciente</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Frequência</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sessões</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Valor Total</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (p of items(); track p.id) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="size-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                            [style.background]="getAvatarColor(p.paciente?.name || '')">
                            {{ getInitials(p.paciente?.name || '') }}
                          </div>
                          <span class="text-sm font-bold text-slate-900 dark:text-white">{{ p.paciente?.name || '—' }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ p.createdAt | date:'dd/MM/yyyy' }}</td>
                      <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ p.frequency || '—' }}</td>
                      <td class="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{{ p.sessionCount || 0 }}</td>
                      <td class="px-6 py-4 text-sm font-bold text-primary">{{ calculateTotal(p) | currency:'BRL' }}</td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                          [class]="getStatusStyle(p.status)">
                          {{ p.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-1">
                          <button class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all" title="Exportar PDF" (click)="exportPDF(p)">
                            <span class="material-icons text-lg">picture_as_pdf</span>
                          </button>
                          <a [routerLink]="['/planos', p.id]" class="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Ver detalhes">
                            <span class="material-icons text-lg">visibility</span>
                          </a>
                          <a [routerLink]="['/planos', p.id, 'editar']" class="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all" title="Editar">
                            <span class="material-icons text-lg">edit</span>
                          </a>
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

    @if (showToast()) {
      <div class="fixed bottom-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 animate-in shadow-lg bg-emerald-500 text-white">
        <span class="material-icons">check_circle</span>
        <span class="text-sm font-medium">{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PlanosListComponent implements OnInit {
  private service = inject(PlanosService);
  items = signal<any[]>([]);
  loading = signal(true);
  showToast = signal(false);
  toastMessage = signal('');

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (res: any) => { this.items.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
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

  calculateTotal(plano: any): number {
    const sessionCount = plano.sessionCount || 0;
    const valuePerSession = plano.valuePerSession || 0;
    return sessionCount * valuePerSession;
  }

  getStatusStyle(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ATIVO': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'RASCUNHO': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'CONCLUIDO': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'CANCELADO': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  }

  exportPDF(plano: any) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007F80; margin: 0;">EduPsych Pro</h1>
          <h2 style="color: #333; margin: 10px 0 0;">Plano de Intervenção</h2>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
          <tr><td style="padding: 8px 0; color: #666; width: 140px;">Paciente:</td><td style="padding: 8px 0; font-weight: bold;">${plano.paciente?.name || '—'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Data:</td><td style="padding: 8px 0;">${new Date(plano.createdAt).toLocaleDateString('pt-BR')}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Frequência:</td><td style="padding: 8px 0;">${plano.frequency || '—'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Duração:</td><td style="padding: 8px 0;">${plano.duration || '—'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Nº Sessões:</td><td style="padding: 8px 0; font-weight: bold;">${plano.sessionCount || 0}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Valor/Sessão:</td><td style="padding: 8px 0;">R$ ${(plano.valuePerSession || 0).toFixed(2)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666; font-size: 16px;">Valor Total:</td><td style="padding: 8px 0; font-size: 16px; font-weight: bold; color: #007F80;">R$ ${this.calculateTotal(plano).toFixed(2)}</td></tr>
        </table>
        ${plano.description ? `
          <h3 style="color: #007F80; font-size: 14px; margin: 20px 0 10px;">Descrição do Plano</h3>
          <p style="font-size: 13px; color: #333; line-height: 1.6; background: #f8fafc; padding: 16px; border-radius: 8px;">${plano.description}</p>
        ` : ''}
        ${plano.steps ? `
          <h3 style="color: #007F80; font-size: 14px; margin: 20px 0 10px;">Etapas</h3>
          <div style="font-size: 13px; color: #333; line-height: 1.6;">
            ${plano.steps.split('\n').map((step: string, i: number) => `<p style="margin: 8px 0;"><strong>Etapa ${i + 1}:</strong> ${step}</p>`).join('')}
          </div>
        ` : ''}
        <hr style="border: 1px solid #eee; margin: 30px 0 20px;">
        <p style="text-align: center; color: #999; font-size: 11px;">Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    `;

    if (typeof html2pdf !== 'undefined') {
      const element = document.createElement('div');
      element.innerHTML = html;
      html2pdf().from(element).set({ filename: `plano-intervencao-${plano.paciente?.name || 'paciente'}-${plano.createdAt}.pdf`, margin: 10 }).save();
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }
    }
    this.toastMessage.set('Plano exportado com sucesso!');
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
