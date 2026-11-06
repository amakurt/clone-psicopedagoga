import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ResponsaveisService } from '../services/responsaveis.service';
import { ToastService } from '@shared/components/toast.component';
import { ConfirmModalComponent } from '@shared/components/confirm-modal.component';

@Component({
  selector: 'app-responsaveis-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmModalComponent],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Responsáveis</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestão de pais, mães e tutores legais dos pacientes</p>
        </div>
        <a routerLink="/app/responsaveis/novo"
          class="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 self-start sm:self-auto">
          <span class="material-icons text-[18px]">person_add</span>
          <span>Novo Responsável</span>
        </a>
      </div>

      <!-- Barra de Busca e Filtros -->
      <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div class="w-full max-w-md">
          <div class="relative group">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
            <input type="text" class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary shadow-sm transition-all outline-none"
              placeholder="Buscar por nome, parentesco, telefone ou email..."
              [(ngModel)]="searchTerm" (input)="onSearch()">
          </div>
        </div>

        <!-- Filtro de Status: Padrão apenas ATIVOS -->
        <select class="px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all outline-none text-slate-700 dark:text-slate-200"
          [(ngModel)]="filterStatus" (change)="load()">
          <option value="active">Status: Apenas Ativos</option>
          <option value="inactive">Status: Inativos</option>
          <option value="">Status: Todos os Responsáveis</option>
        </select>
      </div>

      <!-- Card da Tabela com Scroll Horizontal Responsivo para iPad -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center p-12 text-slate-500">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        } @else if (filteredItems().length === 0) {
          <div class="text-center py-16 px-4">
            <span class="material-icons text-6xl text-slate-300 dark:text-slate-700">people</span>
            <p class="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">Nenhum responsável encontrado com o filtro atual</p>
            @if (filterStatus === 'active') {
              <button (click)="filterStatus = ''; load()" class="mt-2 text-xs font-bold text-primary hover:underline">
                Visualizar responsáveis inativos ou todos
              </button>
            }
          </div>
        } @else {
          <!-- Desktop Table (lg and up) -->
          <div class="hidden lg:block overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
            <table class="w-full text-left border-collapse min-w-[780px] xl:min-w-0">
              <thead>
                <tr class="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th class="px-4 xl:px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Responsável</th>
                  <th class="px-3 xl:px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Parentesco</th>
                  <th class="px-3 xl:px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Contato</th>
                  <th class="px-3 xl:px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th class="px-4 xl:px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (r of filteredItems(); track r.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td class="px-4 xl:px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="size-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-800 shrink-0"
                          [style.background]="r.avatarUrl ? 'transparent' : getAvatarColor(r.name)">
                          @if (r.avatarUrl) {
                            <img [src]="r.avatarUrl" [alt]="r.name" class="size-full object-cover">
                          } @else {
                            {{ getInitials(r.name) }}
                          }
                        </div>
                        <div class="min-w-0">
                          <p class="font-bold text-slate-900 dark:text-white text-sm truncate">{{ r.name }}</p>
                          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ r.email || 'Sem e-mail cadastrado' }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-3 xl:px-6 py-4">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {{ r.relationship || 'Responsável' }}
                      </span>
                    </td>
                    <td class="px-3 xl:px-6 py-4">
                      <div class="flex items-center gap-2">
                        @if (r.phoneIsWhatsApp) {
                          <span class="size-2 rounded-full bg-emerald-500 shrink-0" title="WhatsApp disponível"></span>
                        }
                        <span class="text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">{{ r.phones || '—' }}</span>
                      </div>
                    </td>
                    <td class="px-3 xl:px-6 py-4 text-center whitespace-nowrap">
                      <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                        [class]="(r.active ?? true) ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'">
                        <span class="size-1.5 rounded-full" [class]="(r.active ?? true) ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                        {{ (r.active ?? true) ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="px-4 xl:px-6 py-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5 flex-nowrap">
                        <!-- Visualizar -->
                        <a [routerLink]="['/app/responsaveis', r.id]" 
                          class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95" 
                          title="Ver detalhes">
                          <span class="material-icons text-[15px]">visibility</span>
                          <span>Ver</span>
                        </a>

                        <!-- Editar -->
                        <a [routerLink]="['/app/responsaveis', r.id, 'editar']" 
                          class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95" 
                          title="Editar">
                          <span class="material-icons text-[15px]">edit</span>
                          <span>Editar</span>
                        </a>

                        <!-- Ativar / Desativar -->
                        @if (r.active ?? true) {
                          <button (click)="confirmToggleStatus(r)"
                            class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                            title="Desativar responsável">
                            <span class="material-icons text-[15px]">pause_circle</span>
                            <span>Desativar</span>
                          </button>
                        } @else {
                          <button (click)="confirmToggleStatus(r)"
                            class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                            title="Reativar responsável">
                            <span class="material-icons text-[15px]">play_circle</span>
                            <span>Ativar</span>
                          </button>
                        }

                        <!-- Excluir -->
                        <button (click)="confirmDelete(r)"
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

          <!-- Mobile & iPad Portrait Cards (Telas menores que 1024px) -->
          <div class="block lg:hidden p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (r of filteredItems(); track r.id) {
                <div class="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-4 ring-1 ring-slate-200/70 dark:ring-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
                  <div class="space-y-3">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-center gap-3 min-w-0 flex-1">
                        <div class="size-11 rounded-full overflow-hidden flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0"
                          [style.background]="r.avatarUrl ? 'transparent' : getAvatarColor(r.name)">
                          @if (r.avatarUrl) {
                            <img [src]="r.avatarUrl" [alt]="r.name" class="size-full object-cover">
                          } @else {
                            {{ getInitials(r.name) }}
                          }
                        </div>
                        <div class="min-w-0 flex-1">
                          <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">{{ r.name }}</h4>
                          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ r.email || 'Sem e-mail cadastrado' }}</p>
                        </div>
                      </div>
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
                        [class]="(r.active ?? true) ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'">
                        {{ (r.active ?? true) ? 'Ativo' : 'Inativo' }}
                      </span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-slate-800/70 p-2.5 rounded-xl ring-1 ring-slate-200/50 dark:ring-slate-700/50">
                      <div>
                        <span class="text-[10px] font-bold text-slate-500 uppercase block">Contato</span>
                        <span class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                          @if (r.phoneIsWhatsApp) {
                            <span class="size-2 rounded-full bg-emerald-500 shrink-0"></span>
                          }
                          {{ r.phones || '—' }}
                        </span>
                      </div>
                      <div>
                        <span class="text-[10px] font-bold text-slate-500 uppercase block">Parentesco</span>
                        <span class="font-semibold text-slate-800 dark:text-slate-200 truncate block">{{ r.relationship || 'Responsável' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- 4 Ações no Card: 100% visíveis, sem necessidade de scroll no iPad e celular -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <a [routerLink]="['/app/responsaveis', r.id]"
                      class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs">
                      <span class="material-icons text-[16px]">visibility</span>
                      <span>Ver</span>
                    </a>
                    <a [routerLink]="['/app/responsaveis', r.id, 'editar']"
                      class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs">
                      <span class="material-icons text-[16px]">edit</span>
                      <span>Editar</span>
                    </a>
                    @if (r.active ?? true) {
                      <button (click)="confirmToggleStatus(r)"
                        class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/60 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs">
                        <span class="material-icons text-[16px]">pause_circle</span>
                        <span>Desativar</span>
                      </button>
                    } @else {
                      <button (click)="confirmToggleStatus(r)"
                        class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/60 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs">
                        <span class="material-icons text-[16px]">play_circle</span>
                        <span>Ativar</span>
                      </button>
                    }
                    <button (click)="confirmDelete(r)"
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

    <!-- Modal de Confirmação: Excluir Responsável -->
    <app-confirm-modal
      [isOpen]="showDeleteModal()"
      title="Excluir Responsável Definitivamente"
      [message]="'Tem certeza que deseja excluir o cadastro de ' + (itemToDelete()?.name || 'este responsável') + '? Esta ação não pode ser desfeita.'"
      confirmText="Sim, Excluir Registro"
      [dangerMode]="true"
      (closed)="showDeleteModal.set(false)"
      (confirmed)="deleteItem()" />

    <!-- Modal de Confirmação: Ativar ou Desativar Responsável -->
    <app-confirm-modal
      [isOpen]="showStatusModal()"
      [title]="(itemToToggle()?.active ?? true) ? 'Desativar Responsável' : 'Reativar Responsável'"
      [message]="(itemToToggle()?.active ?? true)
        ? 'Deseja desativar ' + (itemToToggle()?.name || 'este responsável') + '? Ele ficará inativo nas buscas do dia a dia, preservando todo o histórico de contatos e pacientes vinculados.'
        : 'Deseja reativar ' + (itemToToggle()?.name || 'este responsável') + '? Ele voltará a constar como ativo no sistema.'"
      [confirmText]="(itemToToggle()?.active ?? true) ? 'Sim, Desativar' : 'Sim, Reativar'"
      [mode]="(itemToToggle()?.active ?? true) ? 'warning' : 'success'"
      [icon]="(itemToToggle()?.active ?? true) ? 'pause_circle' : 'play_circle'"
      (closed)="showStatusModal.set(false)"
      (confirmed)="toggleStatusItem()" />
  `,
  styles: [`:host { display: block; }`]
})
export class ResponsaveisListComponent implements OnInit {
  private service = inject(ResponsaveisService);
  private toast = inject(ToastService);

  items = signal<any[]>([]);
  loading = signal(true);
  searchTerm = '';
  filterStatus = 'active'; // Padrão: Apenas ativos

  showDeleteModal = signal(false);
  itemToDelete = signal<any>(null);

  showStatusModal = signal(false);
  itemToToggle = signal<any>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    const params: any = {};
    if (this.filterStatus) {
      params.status = this.filterStatus;
      params.active = this.filterStatus === 'active' ? 'true' : 'false';
    }
    this.service.list(params).subscribe({
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
    return this.items().filter(item => {
      const name = (item.name || '').toLowerCase();
      const rel = (item.relationship || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      const phones = (item.phones || '').toLowerCase();
      const city = (item.city || '').toLowerCase();
      return name.includes(term) || rel.includes(term) || email.includes(term) || phones.includes(term) || city.includes(term);
    });
  }

  onSearch() {
    // Filtragem reativa instantânea
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = ['#007F80', '#0284C7', '#059669', '#D97706', '#DC2626', '#475569'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
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
        this.toast.success('Responsável excluído com sucesso');
        this.load();
      },
      error: (err: any) => {
        this.showDeleteModal.set(false);
        this.toast.error(err?.error?.error || 'Erro ao excluir responsável');
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
    const nextActive = !(item.active ?? true);
    this.service.toggleStatus(item.id, nextActive).subscribe({
      next: () => {
        this.showStatusModal.set(false);
        this.toast.success(nextActive ? 'Responsável reativado com sucesso!' : 'Responsável desativado com sucesso! Histórico preservado.');
        this.load();
      },
      error: (err: any) => {
        this.showStatusModal.set(false);
        this.toast.error(err?.error?.error || 'Erro ao alterar status do responsável');
      }
    });
  }
}
