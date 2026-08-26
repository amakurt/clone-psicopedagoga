import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EncaminhamentoService } from '../services/encaminhamento.service';

@Component({
  selector: 'app-encaminhamentos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Encaminhamentos</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Encaminhamentos e transferências para atendimento</p>
        </div>
        <a routerLink="/app/encaminhamentos/novo" 
          class="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 self-start sm:self-auto">
          <span class="material-icons text-[18px]">add</span>
          <span>Novo Encaminhamento</span>
        </a>
      </div>

      <!-- Barra de Busca -->
      <div class="w-full max-w-md">
        <div class="relative group">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
          <input type="text" class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary shadow-sm transition-all outline-none"
            placeholder="Buscar por paciente, profissional ou motivo..."
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
            <span class="material-icons text-6xl text-slate-300 dark:text-slate-700">forward_to_inbox</span>
            <p class="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">Nenhum encaminhamento encontrado</p>
          </div>
        } @else {
          <div class="overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
            <table class="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr class="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Paciente</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">De</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Para</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Motivo</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (e of filteredItems(); track e.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                      {{ e.createdAt | date:'dd/MM/yyyy' }}
                    </td>
                    <td class="px-6 py-4">
                      <div class="font-bold text-slate-900 dark:text-white text-sm">
                        {{ e.paciente?.name || '—' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {{ e.deUser?.name || 'Dra. Sarah Miller' }}
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {{ e.paraUser?.name || '—' }}
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {{ e.motivo || '—' }}
                    </td>
                    <td class="px-6 py-4 text-center whitespace-nowrap">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                        [class]="getStatusClass(e.status)">
                        {{ e.status }}
                      </span>
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
export class EncaminhamentosListComponent implements OnInit {
  private service = inject(EncaminhamentoService);
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
    return this.items().filter(e => {
      const patient = (e.paciente?.name || '').toLowerCase();
      const de = (e.deUser?.name || '').toLowerCase();
      const para = (e.paraUser?.name || '').toLowerCase();
      const motivo = (e.motivo || '').toLowerCase();
      return patient.includes(term) || de.includes(term) || para.includes(term) || motivo.includes(term);
    });
  }

  getStatusClass(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'CONCLUIDO' || s === 'CONCLUÍDO' || s === 'ACEITO') {
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
    }
    if (s === 'PENDENTE') {
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    }
    if (s === 'CANCELADO' || s === 'RECUSADO') {
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    }
    return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
  }
}
