import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../services/users.service';
import { User } from '../../../core/models';
import { ConfirmModalComponent } from '@shared/components/confirm-modal.component';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmModalComponent],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Usuários do Sistema</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestão de profissionais, colaboradores e permissões</p>
        </div>
        <a routerLink="novo"
          class="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 self-start sm:self-auto">
          <span class="material-icons text-[18px]">add</span>
          <span>Novo Usuário</span>
        </a>
      </div>

      <!-- Barra de Busca e Filtros -->
      <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div class="w-full max-w-md">
          <div class="relative group">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
            <input type="text" class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary shadow-sm transition-all outline-none"
              placeholder="Buscar por nome, e-mail ou perfil..."
              [(ngModel)]="searchTerm">
          </div>
        </div>

        <!-- Filtro de Status: Padrão apenas ATIVOS -->
        <select class="px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all outline-none text-slate-700 dark:text-slate-200"
          [(ngModel)]="filterStatus" (change)="loadUsers()">
          <option value="active">Status: Apenas Ativos</option>
          <option value="inactive">Status: Inativos</option>
          <option value="">Status: Todos os Usuários</option>
        </select>
      </div>

      <!-- Card da Tabela com Scroll Horizontal para iPad -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center p-12 text-slate-500">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        } @else if (filteredUsers().length === 0) {
          <div class="text-center py-16 px-4">
            <span class="material-icons text-6xl text-slate-300 dark:text-slate-700">people</span>
            <p class="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">Nenhum usuário encontrado com o filtro atual</p>
            @if (filterStatus === 'active') {
              <button (click)="filterStatus = ''; loadUsers()" class="mt-2 text-xs font-bold text-primary hover:underline">
                Visualizar usuários inativos ou todos
              </button>
            }
          </div>
        } @else {
          <!-- Desktop & iPad Table (md and up) -->
          <div class="hidden md:block overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
            <table class="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr class="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome / Usuário</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Perfil</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right min-w-[280px]">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (user of filteredUsers(); track user.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="size-9 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                          @if (user.avatarUrl) {
                            <img [src]="user.avatarUrl" [alt]="user.name" class="size-full object-cover">
                          } @else {
                            {{ user.name.charAt(0).toUpperCase() }}
                          }
                        </div>
                        <span class="font-bold text-slate-900 dark:text-white text-sm">{{ user.name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {{ user.email }}
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                        [class]="getRoleBadgeClass(user.role)">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-center whitespace-nowrap">
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        [class]="user.active ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'">
                        <span class="size-1.5 rounded-full" [class]="user.active ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                        {{ user.active ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5 flex-nowrap">
                        <a [routerLink]="[user.id, 'editar']" 
                          class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95" 
                          title="Editar">
                          <span class="material-icons text-[15px]">edit</span>
                          <span>Editar</span>
                        </a>

                        <a [routerLink]="[user.id, 'permissoes']" 
                          class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95" 
                          title="Permissões">
                          <span class="material-icons text-[15px]">admin_panel_settings</span>
                          <span>Permissões</span>
                        </a>

                        @if (user.active) {
                          <button (click)="confirmToggleStatus(user)"
                            class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                            title="Desativar usuário">
                            <span class="material-icons text-[15px]">pause_circle</span>
                            <span>Desativar</span>
                          </button>
                        } @else {
                          <button (click)="confirmToggleStatus(user)"
                            class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                            title="Reativar usuário">
                            <span class="material-icons text-[15px]">play_circle</span>
                            <span>Ativar</span>
                          </button>
                        }

                        <button class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/70 dark:border-red-900/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95" 
                          title="Excluir" (click)="confirmDelete(user)">
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

          <!-- Mobile Cards (telas menores que md) -->
          <div class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            @for (user of filteredUsers(); track user.id) {
              <div class="p-4 space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div class="size-10 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0 border border-primary/20">
                      @if (user.avatarUrl) {
                        <img [src]="user.avatarUrl" [alt]="user.name" class="size-full object-cover">
                      } @else {
                        {{ user.name.charAt(0).toUpperCase() }}
                      }
                    </div>
                    <div class="min-w-0 flex-1">
                      <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">{{ user.name }}</h4>
                      <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ user.email }}</p>
                    </div>
                  </div>
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0"
                    [class]="user.active ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'">
                    <span class="size-1.5 rounded-full" [class]="user.active ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                    {{ user.active ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>

                <div class="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
                  <span class="text-slate-500 font-bold">Perfil / Cargo:</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                    [class]="getRoleBadgeClass(user.role)">
                    {{ user.role }}
                  </span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <a [routerLink]="[user.id, 'editar']"
                    class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all">
                    <span class="material-icons text-[16px]">edit</span>
                    <span>Editar</span>
                  </a>
                  <a [routerLink]="[user.id, 'permissoes']"
                    class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all">
                    <span class="material-icons text-[16px]">admin_panel_settings</span>
                    <span>Permissões</span>
                  </a>
                  @if (user.active) {
                    <button (click)="confirmToggleStatus(user)"
                      class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/60 rounded-xl text-xs font-bold transition-all">
                      <span class="material-icons text-[16px]">pause_circle</span>
                      <span>Desativar</span>
                    </button>
                  } @else {
                    <button (click)="confirmToggleStatus(user)"
                      class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/60 rounded-xl text-xs font-bold transition-all">
                      <span class="material-icons text-[16px]">play_circle</span>
                      <span>Ativar</span>
                    </button>
                  }
                  <button (click)="confirmDelete(user)"
                    class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/70 dark:border-red-900/60 rounded-xl text-xs font-bold transition-all">
                    <span class="material-icons text-[16px]">delete</span>
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Modal de Confirmação: Excluir Usuário -->
    <app-confirm-modal
      [isOpen]="showDeleteModal()"
      title="Excluir Usuário Definitivamente"
      [message]="'Tem certeza que deseja excluir o usuário ' + (userToDelete()?.name || 'este usuário') + '? Esta ação não pode ser desfeita.'"
      confirmText="Sim, Excluir Registro"
      [dangerMode]="true"
      (closed)="showDeleteModal.set(false)"
      (confirmed)="deleteUser()" />

    <!-- Modal de Confirmação: Ativar ou Desativar Usuário -->
    <app-confirm-modal
      [isOpen]="showStatusModal()"
      [title]="userToToggle()?.active ? 'Desativar Usuário' : 'Reativar Usuário'"
      [message]="userToToggle()?.active
        ? 'Deseja desativar o usuário ' + (userToToggle()?.name || 'este usuário') + '? Ele perderá temporariamente o acesso ao sistema, mas todo o seu histórico permanecerá salvo.'
        : 'Deseja reativar o usuário ' + (userToToggle()?.name || 'este usuário') + '? Ele poderá voltar a acessar o sistema normalmente.'"
      [confirmText]="userToToggle()?.active ? 'Sim, Desativar' : 'Sim, Reativar'"
      [mode]="userToToggle()?.active ? 'warning' : 'success'"
      [icon]="userToToggle()?.active ? 'pause_circle' : 'play_circle'"
      (closed)="showStatusModal.set(false)"
      (confirmed)="toggleStatusUser()" />
  `,
  styles: [`:host { display: block; }`]
})
export class UsersListComponent implements OnInit {
  private usersService = inject(UsersService);
  private toast = inject(ToastService);

  users = signal<User[]>([]);
  loading = signal(true);
  searchTerm = '';
  filterStatus = 'active'; // Padrão: Apenas ativos

  showDeleteModal = signal(false);
  userToDelete = signal<any>(null);

  showStatusModal = signal(false);
  userToToggle = signal<any>(null);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    const params: any = {};
    if (this.filterStatus) {
      params.status = this.filterStatus;
      params.active = this.filterStatus === 'active' ? 'true' : 'false';
    }
    this.usersService.getAll(params).subscribe({
      next: (res: any) => {
        this.users.set(res?.data || res || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filteredUsers() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.users();
    return this.users().filter(u => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const role = (u.role || '').toLowerCase();
      return name.includes(term) || email.includes(term) || role.includes(term);
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role?.toUpperCase()) {
      case 'GESTOR':
      case 'ADMIN':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300';
      case 'PSICOPEDAGOGO':
      case 'PROFISSIONAL':
        return 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  }

  confirmDelete(user: any) {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  deleteUser() {
    const user = this.userToDelete();
    if (!user) return;
    this.usersService.delete(user.id).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.loadUsers();
        this.toast.success('Usuário excluído com sucesso');
      },
      error: (err: any) => {
        this.showDeleteModal.set(false);
        this.toast.error(err?.error?.error || 'Erro ao excluir usuário');
      }
    });
  }

  confirmToggleStatus(user: any) {
    this.userToToggle.set(user);
    this.showStatusModal.set(true);
  }

  toggleStatusUser() {
    const user = this.userToToggle();
    if (!user) return;
    const nextActive = !user.active;
    this.usersService.toggleStatus(user.id, nextActive).subscribe({
      next: () => {
        this.showStatusModal.set(false);
        this.toast.success(nextActive ? 'Usuário reativado com sucesso!' : 'Usuário desativado com sucesso!');
        this.loadUsers();
      },
      error: (err: any) => {
        this.showStatusModal.set(false);
        this.toast.error(err?.error?.error || 'Erro ao alterar status do usuário');
      }
    });
  }
}
