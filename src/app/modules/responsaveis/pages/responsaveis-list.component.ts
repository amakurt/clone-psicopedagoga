import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ResponsaveisService } from '../services/responsaveis.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-responsaveis-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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

      <!-- Barra de Busca -->
      <div class="w-full max-w-md">
        <div class="relative group">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
          <input type="text" class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary shadow-sm transition-all outline-none"
            placeholder="Buscar por nome, parentesco, telefone ou email..."
            [(ngModel)]="searchTerm" (input)="onSearch()">
        </div>
      </div>

      <!-- Card da Tabela com Scroll Horizontal Responsivo -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center p-12 text-slate-500">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        } @else if (filteredItems().length === 0) {
          <div class="text-center py-16 px-4">
            <span class="material-icons text-6xl text-slate-300 dark:text-slate-700">people</span>
            <p class="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">Nenhum responsável encontrado</p>
          </div>
        } @else {
          <!-- Desktop Table (md and up) -->
          <div class="hidden md:block overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
            <table class="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr class="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Responsável</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Parentesco</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Contato</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Localização</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (r of filteredItems(); track r.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="size-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-800 shrink-0"
                          [style.background]="getAvatarColor(r.name)">
                          {{ getInitials(r.name) }}
                        </div>
                        <div class="min-w-0">
                          <p class="font-bold text-slate-900 dark:text-white text-sm truncate">{{ r.name }}</p>
                          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ r.email || 'Sem e-mail' }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {{ r.relationship || 'Responsável' }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        @if (r.phoneIsWhatsApp) {
                          <span class="size-2 rounded-full bg-emerald-500 shrink-0" title="WhatsApp disponível"></span>
                        }
                        <span class="text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">{{ r.phones || '—' }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {{ (r.city ? r.city + (r.state ? '/' + r.state : '') : '—') }}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <a [routerLink]="['/app/responsaveis', r.id]" 
                          class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" 
                          title="Ver detalhes">
                          <span class="material-icons text-lg">visibility</span>
                        </a>
                        <a [routerLink]="['/app/responsaveis', r.id, 'editar']" 
                          class="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all" 
                          title="Editar">
                          <span class="material-icons text-lg">edit</span>
                        </a>
                        <button (click)="confirmDelete(r)"
                          class="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" 
                          title="Excluir">
                          <span class="material-icons text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards (under md / Smartphones) -->
          <div class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            @for (r of filteredItems(); track r.id) {
              <div class="p-4 space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div class="size-11 rounded-full flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0"
                      [style.background]="getAvatarColor(r.name)">
                      {{ getInitials(r.name) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">{{ r.name }}</h4>
                      <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ r.email || 'Sem e-mail cadastrado' }}</p>
                    </div>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                    {{ r.relationship || 'Responsável' }}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
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
                    <span class="text-[10px] font-bold text-slate-500 uppercase block">Localização</span>
                    <span class="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {{ (r.city ? r.city + (r.state ? '/' + r.state : '') : '—') }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-2 pt-1">
                  <a [routerLink]="['/app/responsaveis', r.id]" 
                    class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all">
                    <span class="material-icons text-[16px]">visibility</span>
                    Ver Detalhes
                  </a>
                  <a [routerLink]="['/app/responsaveis', r.id, 'editar']" 
                    class="flex items-center justify-center size-9 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-all"
                    title="Editar">
                    <span class="material-icons text-[16px]">edit</span>
                  </a>
                  <button (click)="confirmDelete(r)"
                    class="flex items-center justify-center size-9 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 transition-all"
                    title="Excluir">
                    <span class="material-icons text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Modal de Confirmação de Exclusão -->
    @if (showDeleteModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" (click)="showDeleteModal.set(false)">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 ring-1 ring-slate-200 dark:ring-slate-800" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-4 mb-6">
            <div class="size-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <span class="material-icons text-2xl">warning</span>
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-900 dark:text-white">Excluir Responsável</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Esta ação removerá o vínculo do responsável</p>
            </div>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Tem certeza de que deseja excluir <strong class="text-slate-900 dark:text-white">{{ itemToDelete()?.name }}</strong>?
          </p>
          <div class="flex justify-end gap-3">
            <button class="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all" 
              (click)="showDeleteModal.set(false)">
              Cancelar
            </button>
            <button class="px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20" 
              (click)="deleteItem()">
              Excluir
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ResponsaveisListComponent implements OnInit {
  private service = inject(ResponsaveisService);
  private toast = inject(ToastService);

  items = signal<any[]>([]);
  loading = signal(true);
  searchTerm = '';
  showDeleteModal = signal(false);
  itemToDelete = signal<any>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
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
    // Filtragem reativa via filteredItems()
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
      error: () => this.toast.error('Erro ao excluir responsável')
    });
  }
}
