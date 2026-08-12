import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EvolucoesService } from '../services/evolucoes.service';
import { ModalComponent } from '@shared/components/modal.component';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

declare var html2pdf: any;

@Component({
  selector: 'app-evolucoes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ModalComponent],
  template: `
    <div class="space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Evoluções</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Registros de sessões</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <!-- Toggle Lista / Gráfico -->
          <div class="flex bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl p-1">
            <button class="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all"
              [class]="viewMode() === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
              (click)="setView('list')">
              <span class="material-icons text-[18px]">view_list</span> Lista
            </button>
            <button class="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all"
              [class]="viewMode() === 'graph' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
              (click)="setView('graph')">
              <span class="material-icons text-[18px]">insights</span> Gráfico
            </button>
          </div>
          @if (viewMode() === 'list') {
            <a routerLink="/app/evolucoes/comparar"
              class="flex items-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-primary/50 px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95">
              <span class="material-icons text-[18px]">compare_arrows</span>
              <span>Comparar</span>
            </a>
            <a routerLink="/app/evolucoes/novo"
              class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
              <span class="material-icons text-[18px]">add</span>
              <span>Nova Evolução</span>
            </a>
          }
          @if (viewMode() === 'graph') {
            <select class="px-5 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all outline-none"
              [ngModel]="selectedPatient()" (ngModelChange)="selectPatient($event)">
              <option value="all">Todos os pacientes</option>
              @for (p of chartPatients(); track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </select>
          }
        </div>
      </div>

      @if (viewMode() === 'list') {
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
                            @for (star of getStars(ratingOf(e, 'focus')); track $index) {
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
                            <button class="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all" title="Compartilhar" (click)="openShareModal(e)">
                              <span class="material-icons text-lg">share</span>
                            </button>
                            <a [routerLink]="['/app/evolucoes', e.id]" class="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Ver detalhes">
                              <span class="material-icons text-lg">visibility</span>
                            </a>
                            <a [routerLink]="['/app/evolucoes', e.id, 'editar']" class="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all" title="Editar">
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
      }

      @if (viewMode() === 'graph') {
        <!-- Graph mode -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-8">
          @if (loading()) {
            <div class="h-80 flex items-center justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          } @else if (chartPoints().length === 0) {
            <div class="text-center py-16">
              <span class="material-icons text-6xl text-slate-300">insights</span>
              <p class="text-slate-500 mt-3">Nenhuma evolução com métricas para exibir</p>
            </div>
          } @else {
            <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white">Evolução das métricas</h2>
                <p class="text-sm text-slate-400 mt-0.5">
                  {{ selectedPatient() === 'all' ? 'Média por data · todos os pacientes' : 'Paciente selecionado' }}
                  · {{ chartPoints().length }} registro{{ chartPoints().length === 1 ? '' : 's' }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                @for (m of chartLegend(); track m.label) {
                  <div class="flex items-center gap-1.5">
                    <div class="size-2.5 rounded-full" [style.background]="m.color"></div>
                    <span class="text-xs font-bold text-slate-500">{{ m.label }}</span>
                  </div>
                }
              </div>
            </div>
            <div class="h-80 relative">
              <canvas #evoChart></canvas>
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal de Compartilhamento -->
    <app-modal [isOpen]="showShareModal()" title="Compartilhar Evolução" [showFooter]="false" maxWidth="560px"
      (closed)="closeShareModal()">
      @if (evoToShare()) {
        <div class="space-y-5">
          <div class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <div class="size-12 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm"
              [style.background]="getAvatarColor(evoToShare()?.paciente?.name || '')">
              {{ getInitials(evoToShare()?.paciente?.name || '') }}
            </div>
            <div class="min-w-0">
              <p class="font-black text-slate-900 dark:text-white">{{ evoToShare()?.paciente?.name || '—' }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ evoToShare()?.date | date:'dd/MM/yyyy' }} · Foco {{ ratingOf(evoToShare(), 'focus') }}/5</p>
            </div>
          </div>

          <!-- Opção principal: compartilhar com o responsável (LGPD seguro) -->
          <div>
            <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Recomendado · e seguro</p>
            <div class="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/20 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span class="material-icons text-[20px]">family_restroom</span>
                </div>
                <div class="min-w-0">
                  <p class="font-black text-slate-900 dark:text-white">Portal do responsável</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    O responsável verá esta evolução no app, sem exposição pública
                  </p>
                </div>
              </div>
              <button class="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
                [class]="evoToShare()?.sharedWithGuardian
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 cursor-default'
                  : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95'"
                [disabled]="evoToShare()?.sharedWithGuardian"
                (click)="shareWithGuardian()">
                <span class="material-icons text-sm">{{ evoToShare()?.sharedWithGuardian ? 'check_circle' : 'person_add' }}</span>
                {{ evoToShare()?.sharedWithGuardian ? 'Compartilhada' : 'Compartilhar' }}
              </button>
            </div>
          </div>

          <!-- Opção secundária: redes sociais (desaconselhado, requer reconhecimento LGPD) -->
          <div class="pt-1">
            <button class="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              (click)="showSocialOptions.set(!showSocialOptions())">
              <span class="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                <span class="material-icons text-[18px] text-slate-400">share</span>
                Redes sociais (desaconselhado)
              </span>
              <span class="material-icons text-slate-400 transition-transform" [class.rotate-180]="showSocialOptions()">expand_more</span>
            </button>

            @if (showSocialOptions()) {
              <div class="mt-3 space-y-4">
                <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Mensagem</p>
                <textarea rows="4" class="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary transition-all outline-none resize-none"
                  [(ngModel)]="shareMessage"></textarea>

                <div class="grid grid-cols-4 gap-3">
                  @for (net of shareNetworks(); track net.id) {
                    <button (click)="shareTo(net)" [disabled]="!lgpdAck()"
                      class="flex flex-col items-center gap-2 p-4 rounded-2xl font-bold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      [class]="net.bgClass">
                      <span class="material-icons text-2xl" [class]="net.iconClass">{{ net.icon }}</span>
                      <span class="text-slate-700 dark:text-slate-200" [class]="net.labelClass">{{ net.label }}</span>
                    </button>
                  }
                </div>

                <label class="flex items-start gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 cursor-pointer">
                  <input type="checkbox" class="mt-0.5 size-4 accent-amber-500" [checked]="lgpdAck()" (change)="lgpdAck.set($any($event.target).checked)">
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-amber-700 dark:text-amber-400">Reconhecimento LGPD</p>
                    <p class="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed mt-1">
                      Entendo que dados clínicos são sensíveis (Lei 13.709/2018) e que redes públicas expõem o conteúdo a terceiros.
                      Autorizo o compartilhamento somente após remover ou reduzir informações identificáveis na mensagem.
                    </p>
                  </div>
                </label>
              </div>
            }
          </div>
        </div>
      }
    </app-modal>

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
  @ViewChild('evoChart') evoChart!: ElementRef<HTMLCanvasElement>;

  private service = inject(EvolucoesService);
  items = signal<any[]>([]);
  loading = signal(true);
  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal('info');

  viewMode = signal<'list' | 'graph'>('list');
  selectedPatient = signal<string>('all');
  private chart: Chart | null = null;

  showShareModal = signal(false);
  evoToShare = signal<any>(null);
  showSocialOptions = signal(false);
  lgpdAck = signal(false);
  shareMessage = '';

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (res: any) => { this.items.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  // ---------- Modo gráfico ----------

  setView(mode: 'list' | 'graph') {
    this.viewMode.set(mode);
    if (mode === 'graph') {
      setTimeout(() => this.renderChart(), 50);
    }
  }

  selectPatient(id: string) {
    this.selectedPatient.set(id);
    setTimeout(() => this.renderChart(), 50);
  }

  chartPatients() {
    const map = new Map<string, any>();
    this.items().forEach((e: any) => {
      if (e.paciente?.id) map.set(e.paciente.id, e.paciente);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  chartLegend() {
    return [
      { label: 'Foco', color: '#007F80' },
      { label: 'Engajamento', color: '#8B5CF6' },
      { label: 'Progresso', color: '#F59E0B' },
      { label: 'Comportamento', color: '#3B82F6' },
    ];
  }

  chartPoints() {
    const all = this.selectedPatient() === 'all';
    const filtered = this.items().filter((e: any) =>
      all || e.pacienteId === this.selectedPatient()
    );
    if (!all) return filtered.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const byDate = new Map<string, any[]>();
    filtered.forEach((e: any) => {
      const key = String(e.date).slice(0, 10);
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key)!.push(e);
    });
    return Array.from(byDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, list]) => {
        const avg = (key: string) => list.reduce((s, e) => s + this.ratingOf(e, key), 0) / list.length;
        return {
          date,
          focus: avg('focus'),
          engagement: avg('engagement'),
          skillProgress: avg('skillProgress'),
          behavior: avg('behavior'),
        };
      });
  }

  renderChart() {
    if (!this.evoChart?.nativeElement) return;
    if (this.chart) this.chart.destroy();

    const points = this.chartPoints();
    if (points.length === 0) return;

    const labels = points.map((p: any) => {
      const d = new Date(p.date);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    });

    this.chart = new Chart(this.evoChart.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: this.chartLegend().map(m => ({
          label: m.label,
          data: points.map((p: any) => {
            const key = m.label === 'Foco' ? 'focus' : m.label === 'Engajamento' ? 'engagement' : m.label === 'Progresso' ? 'skillProgress' : 'behavior';
            return Math.round(p[key] * 10) / 10;
          }),
          borderColor: m.color,
          backgroundColor: m.color + '20',
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { weight: 'bold' as const },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 8,
          },
        },
        scales: {
          y: {
            min: 0,
            max: 5,
            ticks: {
              stepSize: 1,
              font: { size: 11 },
              color: '#94A3B8',
              callback: (value: any) => `${value}★`,
            },
            grid: { color: '#F1F5F9' },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11, weight: 'bold' as const }, color: '#94A3B8' },
          },
        },
      },
    });
  }

  // ---------- Métricas ----------

  ratingOf(e: any, key: string): number {
    const v = e[`${key}Rating`] ?? e[key] ?? 0;
    const n = typeof v === 'number' ? v : parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  getStars(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
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

  // ---------- Compartilhamento ----------

  shareNetworks() {
    return [
      { id: 'whatsapp', label: 'WhatsApp', icon: 'chat', bgClass: 'bg-emerald-50 dark:bg-emerald-500/10 ring-1 ring-emerald-100 dark:ring-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20', iconClass: 'text-emerald-600 dark:text-emerald-400', labelClass: '' },
      { id: 'telegram', label: 'Telegram', icon: 'send', bgClass: 'bg-sky-50 dark:bg-sky-500/10 ring-1 ring-sky-100 dark:ring-sky-500/20 hover:bg-sky-100 dark:hover:bg-sky-500/20', iconClass: 'text-sky-600 dark:text-sky-400', labelClass: '' },
      { id: 'email', label: 'E-mail', icon: 'mail', bgClass: 'bg-slate-50 dark:bg-slate-800/60 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800', iconClass: 'text-slate-600 dark:text-slate-300', labelClass: '' },
      { id: 'facebook', label: 'Facebook', icon: 'thumb_up', bgClass: 'bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-100 dark:ring-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20', iconClass: 'text-blue-600 dark:text-blue-400', labelClass: '' },
      { id: 'instagram', label: 'Instagram', icon: 'photo_camera', bgClass: 'bg-pink-50 dark:bg-pink-500/10 ring-1 ring-pink-100 dark:ring-pink-500/20 hover:bg-pink-100 dark:hover:bg-pink-500/20', iconClass: 'text-pink-600 dark:text-pink-400', labelClass: '' },
      { id: 'x', label: 'X', icon: 'tag', bgClass: 'bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700', iconClass: 'text-slate-900 dark:text-white', labelClass: '' },
      { id: 'copy', label: 'Copiar', icon: 'content_copy', bgClass: 'bg-amber-50 dark:bg-amber-500/10 ring-1 ring-amber-100 dark:ring-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20', iconClass: 'text-amber-600 dark:text-amber-400', labelClass: '' },
    ];
  }

  openShareModal(evo: any) {
    this.evoToShare.set(evo);
    this.shareMessage = this.buildShareText(evo);
    this.showSocialOptions.set(false);
    this.lgpdAck.set(false);
    this.showShareModal.set(true);
  }

  closeShareModal() {
    this.showShareModal.set(false);
  }

  buildShareText(evo: any): string {
    const stars = (n: number) => '★'.repeat(5).slice(0, n) + '☆'.repeat(5).slice(0, 5 - n);
    const date = new Date(evo.date).toLocaleDateString('pt-BR');
    const lines = [
      `Evolução de ${evo.paciente?.name || '—'} — ${date}`,
      `Foco: ${stars(this.ratingOf(evo, 'focus'))}`,
      `Engajamento: ${stars(this.ratingOf(evo, 'engagement'))}`,
    ];
    if (evo.summary) lines.push(`\n${evo.summary}`);
    return lines.join('\n');
  }

  async shareTo(net: any) {
    const evo = this.evoToShare();
    if (!evo) return;
    const text = this.shareMessage || this.buildShareText(evo);
    const url = window.location.href;

    if (net.id === 'copy') {
      try {
        await navigator.clipboard.writeText(text);
        this.showNotification('Mensagem copiada!', 'success');
      } catch {
        this.showNotification('Não foi possível copiar', 'info');
      }
      return;
    }

    if (net.id === 'instagram') {
      if (navigator.share) {
        try {
          await navigator.share({ text });
          this.showNotification('Compartilhado!', 'success');
        } catch {}
      } else {
        try {
          await navigator.clipboard.writeText(text);
          this.showNotification('Seu navegador não abre o Instagram: texto copiado', 'info');
        } catch {
          this.showNotification('Seu navegador não abre o Instagram', 'info');
        }
      }
      return;
    }

    const encoded = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    let target = '';
    if (net.id === 'whatsapp') target = `https://wa.me/?text=${encoded}`;
    if (net.id === 'telegram') target = `https://t.me/share/url?url=${encodedUrl}&text=${encoded}`;
    if (net.id === 'email') target = `mailto:?subject=${encodeURIComponent('Evolução clínica')}&body=${encoded}`;
    if (net.id === 'facebook') target = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encoded}`;
    if (net.id === 'x') target = `https://twitter.com/intent/tweet?text=${encoded}`;

    if (target) {
      window.open(target, '_blank', 'noopener,width=600,height=640');
      this.showNotification(`Abrindo ${net.label}...`, 'success');
    }
  }

  shareWithGuardian() {
    const evo = this.evoToShare();
    if (!evo || evo.sharedWithGuardian) return;
    this.service.update(evo.id, { sharedWithGuardian: true }).subscribe({
      next: () => {
        evo.sharedWithGuardian = true;
        this.showNotification('Evolução compartilhada com o responsável!', 'success');
      },
      error: () => this.showNotification('Falha ao compartilhar no portal', 'info')
    });
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
            <td style="padding: 10px; font-size: 16px; color: #F59E0B;">${starsText(this.ratingOf(evo, 'focus'))}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; color: #666;">Engajamento</td>
            <td style="padding: 10px; font-size: 16px; color: #F59E0B;">${starsText(this.ratingOf(evo, 'engagement'))}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; color: #666;">Progresso</td>
            <td style="padding: 10px; font-size: 16px; color: #F59E0B;">${starsText(this.ratingOf(evo, 'skillProgress'))}</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #666;">Comportamento</td>
            <td style="padding: 10px; font-size: 16px; color: #F59E0B;">${starsText(this.ratingOf(evo, 'behavior'))}</td>
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

  showNotification(message: string, type: string) {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}