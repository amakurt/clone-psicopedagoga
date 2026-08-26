import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LaudoService } from '../services/laudo.service';

@Component({
  selector: 'app-laudos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Laudos e Pareceres</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Documentos diagnósticos e relatórios clínicos emitidos</p>
        </div>
        <a routerLink="/app/laudos/novo" 
          class="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 self-start sm:self-auto">
          <span class="material-icons text-[18px]">add</span>
          <span>Novo Laudo</span>
        </a>
      </div>

      <!-- Barra de Busca -->
      <div class="w-full max-w-md">
        <div class="relative group">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
          <input type="text" class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary shadow-sm transition-all outline-none"
            placeholder="Buscar por paciente, título ou status..."
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
            <span class="material-icons text-6xl text-slate-300 dark:text-slate-700">description</span>
            <p class="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">Nenhum laudo encontrado</p>
          </div>
        } @else {
          <div class="overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
            <table class="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr class="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Paciente</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Título / Descrição</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tipo</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (l of filteredItems(); track l.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                      {{ l.createdAt | date:'dd/MM/yyyy' }}
                    </td>
                    <td class="px-6 py-4">
                      <div class="font-bold text-slate-900 dark:text-white text-sm">
                        {{ l.paciente?.name || '—' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {{ l.titulo || 'Laudo Psicopedagógico' }}
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {{ l.type || 'Laudo' }}
                    </td>
                    <td class="px-6 py-4 text-center whitespace-nowrap">
                      @if (l.status === 'ASSINADO') {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          <span class="material-icons text-[14px]">verified</span>
                          Assinado
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                          [class]="l.status === 'RASCUNHO' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'">
                          {{ l.status || 'Rascunho' }}
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1">
                        <a [routerLink]="['/app/laudos', l.id]" 
                          class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" 
                          title="Visualizar">
                          <span class="material-icons text-lg">visibility</span>
                        </a>
                        <a [routerLink]="['/app/laudos', l.id, 'editar']" 
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
        }
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class LaudosListComponent implements OnInit {
  private service = inject(LaudoService);
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
    return this.items().filter(l => {
      const patient = (l.paciente?.name || '').toLowerCase();
      const title = (l.titulo || '').toLowerCase();
      const status = (l.status || '').toLowerCase();
      return patient.includes(term) || title.includes(term) || status.includes(term);
    });
  }
}
