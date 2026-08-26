import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SessaoService } from '../services/sessao.service';

@Component({
  selector: 'app-sessoes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Sessões Clínicas</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Histórico de atendimentos e sessões realizadas</p>
        </div>
        <a routerLink="/app/sessoes/nova"
          class="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 self-start sm:self-auto">
          <span class="material-icons text-[18px]">add</span>
          <span>Nova Sessão</span>
        </a>
      </div>

      <!-- Barra de Busca -->
      <div class="w-full max-w-md">
        <div class="relative group">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
          <input type="text" class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary shadow-sm transition-all outline-none"
            placeholder="Buscar por paciente, tipo ou status..."
            [(ngModel)]="searchTerm">
        </div>
      </div>

      <!-- Card da Tabela -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center p-12 text-slate-500">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        } @else if (filteredItems().length === 0) {
          <div class="text-center py-16 px-4">
            <span class="material-icons text-6xl text-slate-300 dark:text-slate-700">event</span>
            <p class="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">Nenhuma sessão encontrada</p>
          </div>
        } @else {
          <!-- Desktop Table (md and up) -->
          <div class="hidden md:block overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
            <table class="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr class="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data / Hora</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Paciente</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tipo</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Duração</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Valor</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (s of filteredItems(); track s.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td class="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      {{ s.date | date:'dd/MM/yyyy HH:mm' }}
                    </td>
                    <td class="px-6 py-4">
                      <div class="font-bold text-slate-900 dark:text-white text-sm">
                        {{ s.paciente?.name || '—' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {{ s.tipo || 'Sessão' }}
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {{ s.duration ? s.duration + ' min' : '—' }}
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                        [class]="getStatusClass(s.status)">
                        {{ s.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {{ s.valor ? (s.valor | currency:'BRL') : '—' }}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <a [routerLink]="['/app/sessoes', s.id]" 
                          class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" 
                          title="Ver detalhes">
                          <span class="material-icons text-lg">visibility</span>
                        </a>
                        <a [routerLink]="['/app/sessoes', s.id, 'editar']" 
                          class="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all" 
                          title="Editar">
                          <span class="material-icons text-lg">edit</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards (under md / Smartphones) -->
          <div class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            @for (s of filteredItems(); track s.id) {
              <div class="p-4 space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">{{ s.paciente?.name || 'Sessão sem paciente' }}</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span class="material-icons text-[14px]">event</span>
                      {{ s.date | date:'dd/MM/yyyy HH:mm' }}
                    </p>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0"
                    [class]="getStatusClass(s.status)">
                    {{ s.status }}
                  </span>
                </div>

                <div class="grid grid-cols-3 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
                  <div>
                    <span class="text-[10px] font-bold text-slate-500 uppercase block">Tipo</span>
                    <span class="font-semibold text-slate-800 dark:text-slate-200 truncate block">{{ s.tipo || 'Sessão' }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-bold text-slate-500 uppercase block">Duração</span>
                    <span class="font-semibold text-slate-800 dark:text-slate-200 block">{{ s.duration ? s.duration + ' min' : '—' }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-bold text-slate-500 uppercase block">Valor</span>
                    <span class="font-semibold text-slate-800 dark:text-slate-200 block">{{ s.valor ? (s.valor | currency:'BRL') : '—' }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2 pt-1">
                  <a [routerLink]="['/app/sessoes', s.id]"
                    class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all">
                    <span class="material-icons text-[16px]">visibility</span>
                    Ver Detalhes
                  </a>
                  <a [routerLink]="['/app/sessoes', s.id, 'editar']"
                    class="flex items-center justify-center size-9 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-all"
                    title="Editar">
                    <span class="material-icons text-[16px]">edit</span>
                  </a>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SessoesListComponent implements OnInit {
  private service = inject(SessaoService);
  items = signal<any[]>([]);
  loading = signal(true);
  searchTerm = '';

  ngOnInit() {
    this.service.list().subscribe({
      next: (res: any) => {
        this.items.set(res.data || res || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filteredItems() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.items();
    return this.items().filter(s => {
      const patient = (s.paciente?.name || '').toLowerCase();
      const tipo = (s.tipo || '').toLowerCase();
      const status = (s.status || '').toLowerCase();
      return patient.includes(term) || tipo.includes(term) || status.includes(term);
    });
  }

  getStatusClass(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'CONCLUIDA' || s === 'CONCLUÍDA' || s === 'REALIZADA') {
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
    }
    if (s === 'CANCELADA') {
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    }
    if (s === 'EM_ANDAMENTO') {
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    }
    return 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400';
  }
}
