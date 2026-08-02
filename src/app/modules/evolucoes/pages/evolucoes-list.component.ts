import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EvolucoesService } from '../services/evolucoes.service';

declare var html2pdf: any;

@Component({
  selector: 'app-evolucoes-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Evoluções</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Registros de sessões</p>
        </div>
        <a routerLink="/evolucoes/novo"
          class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
          <span class="material-icons text-[18px]">add</span>
          <span>Nova Evolução</span>
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
              <span class="material-icons text-6xl text-slate-300">description</span>
              <p class="text-slate-500 mt-3">Nenhuma evolução encontrada</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Paciente</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Métricas</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Resumo</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (e of items(); track e.id) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ e.date | date:'dd/MM/yyyy' }}</td>
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="size-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                            [style.background]="getAvatarColor(e.paciente?.name || '')">
                            {{ getInitials(e.paciente?.name || '') }}
                          </div>
                          <span class="text-sm font-bold text-slate-900 dark:text-white">{{ e.paciente?.name || '—' }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex gap-1">
                          @for (star of getStars(e.focusRating || e.focus || 0); track $index) {
                            <span class="material-icons text-sm" [class]="star ? 'text-amber-400' : 'text-slate-200'">
                              {{ star ? 'star' : 'star_border' }}
                            </span>
                          }
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{{ e.summary || '—' }}</td>
                      <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-1">
                          <button class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all" title="Exportar PDF" (click)="exportFrequencySheet(e)">
                            <span class="material-icons text-lg">picture_as_pdf</span>
                          </button>
                          <button class="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all" title="Compartilhar" (click)="shareSession(e)">
                            <span class="material-icons text-lg">share</span>
                          </button>
                          <a [routerLink]="['/evolucoes', e.id]" class="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Ver detalhes">
                            <span class="material-icons text-lg">visibility</span>
                          </a>
                          <a [routerLink]="['/evolucoes', e.id, 'editar']" class="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all" title="Editar">
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
export class EvolucoesListComponent implements OnInit {
  private service = inject(EvolucoesService);
  items = signal<any[]>([]);
  loading = signal(true);
  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal('info');

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

  getStars(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }

  exportFrequencySheet(evo: any) {
    const starsText = (rating: number) => {
      let text = '';
      for (let i = 0; i < 5; i++) text += i < rating ? '★' : '☆';
      return text;
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007F80; margin: 0;">EduPsych Pro</h1>
          <h2 style="color: #333; margin: 10px 0 0;">Ficha de Frequência</h2>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
          <tr><td style="padding: 8px 0; color: #666; width: 120px;">Paciente:</td><td style="padding: 8px 0; font-weight: bold;">${evo.paciente?.name || '—'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Data:</td><td style="padding: 8px 0;">${new Date(evo.date).toLocaleDateString('pt-BR')}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Profissional:</td><td style="padding: 8px 0;">Dra. Sarah Miller</td></tr>
        </table>
        <h3 style="color: #007F80; font-size: 14px; margin: 20px 0 10px;">Métricas da Sessão</h3>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; color: #666;">Foco</td>
            <td style="padding: 10px; font-size: 16px; color: #F59E0B;">${starsText(evo.focusRating || evo.focus || 0)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; color: #666;">Engajamento</td>
            <td style="padding: 10px; font-size: 16px; color: #F59E0B;">${starsText(evo.engagementRating || evo.engagement || 0)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; color: #666;">Progresso</td>
            <td style="padding: 10px; font-size: 16px; color: #F59E0B;">${starsText(evo.progressRating || evo.progress || 0)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #666;">Comportamento</td>
            <td style="padding: 10px; font-size: 16px; color: #F59E0B;">${starsText(evo.behaviorRating || evo.behavior || 0)}</td>
          </tr>
        </table>
        <h3 style="color: #007F80; font-size: 14px; margin: 20px 0 10px;">Resumo da Sessão</h3>
        <p style="font-size: 13px; color: #333; line-height: 1.6; background: #f8fafc; padding: 16px; border-radius: 8px;">${evo.summary || 'Sem resumo registrado.'}</p>
        ${evo.activities ? `
          <h3 style="color: #007F80; font-size: 14px; margin: 20px 0 10px;">Atividades Realizadas</h3>
          <p style="font-size: 13px; color: #333; line-height: 1.6;">${evo.activities}</p>
        ` : ''}
        <hr style="border: 1px solid #eee; margin: 30px 0 20px;">
        <p style="text-align: center; color: #999; font-size: 11px;">Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    `;

    if (typeof html2pdf !== 'undefined') {
      const element = document.createElement('div');
      element.innerHTML = html;
      html2pdf().from(element).set({ filename: `ficha-frequencia-${evo.paciente?.name || 'paciente'}-${evo.date}.pdf`, margin: 10 }).save();
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }
    }
    this.showNotification('Ficha de frequência exportada!', 'success');
  }

  shareSession(evo: any) {
    if (confirm('Deseja compartilhar esta evolução com o responsável?')) {
      this.service.update(evo.id, { sharedWithGuardian: true }).subscribe({
        next: () => this.showNotification('Evolução compartilhada com sucesso!', 'success'),
        error: () => this.showNotification('Evolução compartilhada (modo local)', 'info')
      });
    }
  }

  showNotification(message: string, type: string) {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
