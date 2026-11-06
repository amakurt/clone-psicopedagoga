import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EscolasService } from '../services/escolas.service';
import { ToastService } from '@shared/components/toast.component';
import { ConfirmModalComponent } from '@shared/components/confirm-modal.component';

@Component({
  selector: 'app-escolas-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmModalComponent],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Escolas</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Cadastro e gestão de instituições de ensino</p>
        </div>
        <a routerLink="/app/escolas/novo"
          class="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 self-start sm:self-auto">
          <span class="material-icons text-[18px]">add</span>
          <span>Nova Escola</span>
        </a>
      </div>

      <!-- Barra de Busca e Filtros -->
      <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div class="w-full max-w-md">
          <div class="relative group">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
            <input type="text" class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary shadow-sm transition-all outline-none"
              placeholder="Buscar por nome da escola ou INEP..."
              [(ngModel)]="searchTerm" (input)="onSearch()">
          </div>
        </div>

        <!-- Filtro de Status: Padrão apenas ATIVAS -->
        <select class="px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all outline-none text-slate-700 dark:text-slate-200"
          [(ngModel)]="filterStatus" (change)="load()">
          <option value="Ativa">Status: Apenas Ativas</option>
          <option value="Inativa">Status: Inativas</option>
          <option value="">Status: Todas as Escolas</option>
        </select>
      </div>

      <!-- Card da Tabela com Scroll Horizontal para iPad -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        } @else if (filteredItems().length === 0) {
          <div class="text-center py-16 px-4">
            <span class="material-icons text-6xl text-slate-300 dark:text-slate-700">school</span>
            <p class="mt-3 text-slate-500 dark:text-slate-400 text-sm font-medium">Nenhuma escola encontrada com o filtro atual</p>
            @if (filterStatus === 'Ativa') {
              <button (click)="filterStatus = ''; load()" class="mt-2 text-xs font-bold text-primary hover:underline">
                Visualizar escolas inativas ou todas
              </button>
            }
          </div>
        } @else {
          <!-- Desktop Table (lg and up) -->
          <div class="hidden lg:block overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
            <table class="w-full text-left border-collapse min-w-[760px] xl:min-w-0">
              <thead>
                <tr class="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th class="px-4 xl:px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Instituição</th>
                  <th class="px-3 xl:px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Etapas / Níveis</th>
                  <th class="px-3 xl:px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Alunos</th>
                  <th class="px-3 xl:px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th class="px-4 xl:px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (e of filteredItems(); track e.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td class="px-4 xl:px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <span class="material-icons text-xl">school</span>
                        </div>
                        <div class="min-w-0">
                          <div class="flex items-center gap-2">
                            <span class="font-bold text-slate-900 dark:text-white text-sm truncate">{{ e.name }}</span>
                            @if (e.inep) {
                              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary">
                                {{ e.inep }}
                              </span>
                            }
                          </div>
                          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ e.city ? (e.city + (e.state ? '/' + e.state : '')) : 'Sem localização' }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-3 xl:px-6 py-4">
                      <div class="flex flex-wrap gap-1 max-w-[240px]">
                        @for (level of getLevels(e); track level) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {{ getLevelLabel(level) }}
                          </span>
                        }
                      </div>
                    </td>
                    <td class="px-3 xl:px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {{ e.patients?.length || e.patientCount || 0 }} paciente(s)
                    </td>
                    <td class="px-3 xl:px-6 py-4 text-center whitespace-nowrap">
                      <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                        [class]="e.status === 'Ativa' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'">
                        <span class="size-1.5 rounded-full" [class]="e.status === 'Ativa' ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                        {{ e.status }}
                      </span>
                    </td>
                    <td class="px-4 xl:px-6 py-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5 flex-nowrap">
                        <a [routerLink]="['/app/escolas', e.id]" 
                          class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95" 
                          title="Visualizar">
                          <span class="material-icons text-[15px]">visibility</span>
                          <span>Ver</span>
                        </a>

                        <a [routerLink]="['/app/escolas', e.id, 'editar']" 
                          class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95" 
                          title="Editar">
                          <span class="material-icons text-[15px]">edit</span>
                          <span>Editar</span>
                        </a>

                        @if (e.status === 'Ativa') {
                          <button (click)="confirmToggleStatus(e)"
                            class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95" 
                            title="Desativar escola">
                            <span class="material-icons text-[15px]">pause_circle</span>
                            <span>Desativar</span>
                          </button>
                        } @else {
                          <button (click)="confirmToggleStatus(e)"
                            class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95" 
                            title="Reativar escola">
                            <span class="material-icons text-[15px]">play_circle</span>
                            <span>Ativar</span>
                          </button>
                        }

                        <button (click)="confirmDelete(e)"
                          class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/70 dark:border-red-900/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95" 
                          title="Excluir">
                          <span class="material-icons text-[15px]">delete</span>
                          <span>Excluir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Cards Mobile & iPad Portrait (telas menores que 1024px) -->
          <div class="block lg:hidden p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (e of filteredItems(); track e.id) {
                <div class="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-4 ring-1 ring-slate-200/70 dark:ring-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
                  <div class="space-y-3">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-center gap-3 min-w-0 flex-1">
                        <div class="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <span class="material-icons text-xl">school</span>
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="flex items-center gap-1.5">
                            <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">{{ e.name }}</h4>
                            @if (e.inep) {
                              <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-primary/10 text-primary shrink-0">{{ e.inep }}</span>
                            }
                          </div>
                          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ e.city ? (e.city + (e.state ? '/' + e.state : '')) : 'Sem localização' }}</p>
                        </div>
                      </div>
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
                        [class]="e.status === 'Ativa' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'">
                        {{ e.status }}
                      </span>
                    </div>

                    <div class="text-xs bg-white dark:bg-slate-800/70 p-2.5 rounded-xl ring-1 ring-slate-200/50 dark:ring-slate-700/50 flex items-center justify-between">
                      <span class="text-slate-500 font-medium">Alunos vinculados:</span>
                      <span class="font-bold text-slate-800 dark:text-slate-200">{{ e.patients?.length || e.patientCount || 0 }} paciente(s)</span>
                    </div>
                  </div>

                  <!-- 4 Ações no Card: 100% visíveis, sem scroll no iPad e celular -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <a [routerLink]="['/app/escolas', e.id]"
                      class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs">
                      <span class="material-icons text-[16px]">visibility</span>
                      <span>Ver</span>
                    </a>
                    <a [routerLink]="['/app/escolas', e.id, 'editar']"
                      class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs">
                      <span class="material-icons text-[16px]">edit</span>
                      <span>Editar</span>
                    </a>
                    @if (e.status === 'Ativa') {
                      <button (click)="confirmToggleStatus(e)"
                        class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/60 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs">
                        <span class="material-icons text-[16px]">pause_circle</span>
                        <span>Desativar</span>
                      </button>
                    } @else {
                      <button (click)="confirmToggleStatus(e)"
                        class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/60 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs">
                        <span class="material-icons text-[16px]">play_circle</span>
                        <span>Ativar</span>
                      </button>
                    }
                    <button (click)="confirmDelete(e)"
                      class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/70 dark:border-red-900/60 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs">
                      <span class="material-icons text-[16px]">delete</span>
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Modal de Confirmação: Excluir Escola -->
    <app-confirm-modal
      [isOpen]="showDeleteModal()"
      title="Excluir Escola Definitivamente"
      [message]="'Tem certeza que deseja excluir o cadastro da instituição ' + (itemToDelete()?.name || 'esta escola') + '? Esta ação não pode ser desfeita.'"
      confirmText="Sim, Excluir Registro"
      [dangerMode]="true"
      (closed)="showDeleteModal.set(false)"
      (confirmed)="deleteItem()" />

    <!-- Modal de Confirmação: Ativar ou Desativar Escola -->
    <app-confirm-modal
      [isOpen]="showStatusModal()"
      [title]="itemToToggle()?.status === 'Ativa' ? 'Desativar Escola' : 'Reativar Escola'"
      [message]="itemToToggle()?.status === 'Ativa'
        ? 'Deseja desativar a escola ' + (itemToToggle()?.name || 'esta instituição') + '? Ela ficará inativa nas buscas do dia a dia, preservando todo o histórico de alunos vinculados.'
        : 'Deseja reativar a escola ' + (itemToToggle()?.name || 'esta instituição') + '? Ela voltará a constar como ativa no sistema.'"
      [confirmText]="itemToToggle()?.status === 'Ativa' ? 'Sim, Desativar' : 'Sim, Reativar'"
      [mode]="itemToToggle()?.status === 'Ativa' ? 'warning' : 'success'"
      [icon]="itemToToggle()?.status === 'Ativa' ? 'pause_circle' : 'play_circle'"
      (closed)="showStatusModal.set(false)"
      (confirmed)="toggleStatusItem()" />
  `,
  styles: [`:host { display: block; }`]
})
export class EscolasListComponent implements OnInit {
  private service = inject(EscolasService);
  private toast = inject(ToastService);

  items = signal<any[]>([]);
  loading = signal(true);
  searchTerm = '';
  filterStatus = 'Ativa'; // Padrão: Apenas ativas

  showDeleteModal = signal(false);
  itemToDelete = signal<any>(null);

  showStatusModal = signal(false);
  itemToToggle = signal<any>(null);

  private levelMap: Record<string, string> = {
    'EDUCACAO_INFANTIL': 'Educação Infantil',
    'ANOS_INICIAIS': 'Anos Iniciais',
    'ANOS_FINAIS': 'Anos Finais',
    'ENSINO_MEDIO': 'Ensino Médio',
    'SUPERIOR': 'Superior',
    'PROFISSIONALIZANTE': 'Profissionalizante',
  };

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;
    this.service.list(params).subscribe({
      next: (res: any) => {
        this.items.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filteredItems() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.items();
    return this.items().filter(e => {
      const name = (e.name || '').toLowerCase();
      const inep = (e.inep || '').toLowerCase();
      const city = (e.city || '').toLowerCase();
      return name.includes(term) || inep.includes(term) || city.includes(term);
    });
  }

  onSearch() {
    // Filtragem instantânea
  }

  getLevels(school: any): string[] {
    if (!school.levels) return [];
    try {
      return JSON.parse(school.levels);
    } catch {
      return school.levels ? [school.levels] : [];
    }
  }

  getLevelLabel(level: string): string {
    return this.levelMap[level] || level;
  }

  confirmDelete(item: any) {
    this.itemToDelete.set(item);
    this.showDeleteModal.set(true);
  }

  deleteItem() {
    const item = this.itemToDelete();
    if (!item) return;
    this.service.delete(item.id).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.toast.success('Escola excluída com sucesso');
        this.load();
      },
      error: (err: any) => {
        this.showDeleteModal.set(false);
        this.toast.error(err?.error?.error || 'Erro ao excluir escola');
      }
    });
  }

  confirmToggleStatus(item: any) {
    this.itemToToggle.set(item);
    this.showStatusModal.set(true);
  }

  toggleStatusItem() {
    const item = this.itemToToggle();
    if (!item) return;
    const nextStatus = item.status === 'Ativa' ? 'Inativa' : 'Ativa';
    this.service.toggleStatus(item.id).subscribe({
      next: () => {
        this.showStatusModal.set(false);
        this.toast.success(nextStatus === 'Ativa' ? 'Escola reativada com sucesso!' : 'Escola desativada com sucesso! Histórico preservado.');
        this.load();
      },
      error: (err: any) => {
        this.showStatusModal.set(false);
        this.toast.error(err?.error?.error || 'Erro ao alterar status da escola');
      }
    });
  }
}
