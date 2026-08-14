import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProtocolosService } from '../services/protocolos.service';
import { ApiService } from '@core/services/api.service';

declare var html2pdf: any;

@Component({
  selector: 'app-protocolos-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Protocolos TEA</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Avaliações com protocolos estruturados</p>
        </div>
        <a routerLink="/app/protocolos/novo"
          class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
          <span class="material-icons text-[18px]">add</span>
          <span>Nova Avaliação</span>
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
              <span class="material-icons text-6xl text-slate-300">assignment</span>
              <p class="text-slate-500 mt-3">Nenhuma avaliação encontrada</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Paciente</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Pontuação</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Classificação</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
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
                      <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ p.date | date:'dd/MM/yyyy' }}</td>
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                          <div class="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all"
                              [class]="getScoreColor(p.averageScore)"
                              [style.width.%]="(p.averageScore || 0) * 33"></div>
                          </div>
                          <span class="text-sm font-bold text-slate-900 dark:text-white">{{ p.averageScore || 0 }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                          [class]="getClassificationStyle(p.averageScore)">
                          {{ getClassification(p.averageScore) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-1">
                          <button class="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all" title="Exportar PDF" (click)="exportPDF(p)">
                            <span class="material-icons text-lg">picture_as_pdf</span>
                          </button>
                          <a [routerLink]="['/app/protocolos', p.id]" class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Ver detalhes">
                            <span class="material-icons text-lg">visibility</span>
                          </a>
                          <a [routerLink]="['/app/protocolos', p.id, 'editar']" class="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all" title="Editar">
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
export class ProtocolosListComponent implements OnInit {
  private service = inject(ProtocolosService);
  private api = inject(ApiService);
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
    const colors = ['#2563EB', '#6D28D9', '#BE185D', '#B45309', '#047857', '#B91C1C', '#0E7490', '#4D7C0F'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }

  getScoreColor(score: number): string {
    if (score >= 1.5) return 'bg-emerald-500';
    if (score >= 1) return 'bg-amber-500';
    return 'bg-red-500';
  }

  getClassification(score: number): string {
    if (score >= 1.5) return 'Leve';
    if (score >= 1) return 'Moderado';
    return 'Grave';
  }

  getClassificationStyle(score: number): string {
    if (score >= 1.5) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (score >= 1) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  }

  exportPDF(protocolo: any) {
    this.api.get(`/protocol-evaluations/protocol-stats/${protocolo.id}`).subscribe({
      next: (data: any) => {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #007F80; margin: 0;">EduPsych Pro</h1>
              <h2 style="color: #333; margin: 10px 0 0;">Avaliação Protocolo TEA</h2>
            </div>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
              <tr><td style="padding: 8px 0; color: #666; width: 140px;">Paciente:</td><td style="padding: 8px 0; font-weight: bold;">${protocolo.paciente?.name || '—'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Data:</td><td style="padding: 8px 0;">${new Date(protocolo.date).toLocaleDateString('pt-BR')}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Pontuação Geral:</td><td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #007F80;">${data.totalScore}/${data.totalMax} (${data.overallPercentage}%)</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Classificação:</td><td style="padding: 8px 0; font-weight: bold;">${this.getClassification(protocolo.averageScore)}</td></tr>
            </table>
            <h3 style="color: #007F80; font-size: 16px; margin: 30px 0 15px; border-bottom: 2px solid #007F80; padding-bottom: 8px;">Resultado por Categoria</h3>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                  <th style="padding: 10px; text-align: left; font-weight: bold;">Categoria</th>
                  <th style="padding: 10px; text-align: center; font-weight: bold;">Pontuação</th>
                  <th style="padding: 10px; text-align: center; font-weight: bold;">%</th>
                  <th style="padding: 10px; text-align: center; font-weight: bold;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.categories.map((cat: any) => `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${cat.color};"></div>
                        <span style="font-weight: 500;">${cat.name}</span>
                      </div>
                    </td>
                    <td style="padding: 10px; text-align: center; font-weight: bold;">${cat.score}/${cat.maxScore}</td>
                    <td style="padding: 10px; text-align: center; font-weight: bold; color: ${cat.color};">${cat.percentage}%</td>
                    <td style="padding: 10px; text-align: center;">
                      <span style="background: ${cat.color}20; color: ${cat.color}; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                        ${cat.percentage >= 67 ? 'Bom' : cat.percentage >= 34 ? 'Regular' : 'Baixo'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <hr style="border: 1px solid #eee; margin: 30px 0 20px;">
            <p style="text-align: center; color: #999; font-size: 11px;">Documento gerado em ${new Date().toLocaleString('pt-BR')} — EduPsych Pro</p>
          </div>
        `;

        if (typeof html2pdf !== 'undefined') {
          const element = document.createElement('div');
          element.innerHTML = html;
          html2pdf().from(element).set({ filename: `protocolo-tea-${protocolo.paciente?.name || 'paciente'}-${protocolo.date}.pdf`, margin: 10 }).save();
        } else {
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.print();
          }
        }
        this.toastMessage.set('PDF exportado com sucesso!');
        this.showToast.set(true);
        setTimeout(() => this.showToast.set(false), 3000);
      },
      error: () => {
        this.toastMessage.set('Erro ao buscar dados para PDF');
        this.showToast.set(true);
        setTimeout(() => this.showToast.set(false), 3000);
      }
    });
  }
}
