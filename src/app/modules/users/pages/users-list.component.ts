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

      <!-- Barra de Busca -->
      <div class="w-full max-w-md">
        <div class="relative group">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
          <input type="text" class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary shadow-sm transition-all outline-none"
            placeholder="Buscar por nome, e-mail ou perfil..."
            [(ngModel)]="searchTerm">
        </div>
      </div>

      <!-- Card da Tabela -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center p-12 text-slate-500">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        } @else if (filteredUsers().length === 0) {
          <div class="text-center py-16 px-4">
            <span class="material-icons text-6xl text-slate-300 dark:text-slate-700">people</span>
            <p class="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">Nenhum usuário encontrado</p>
          </div>
        } @else {
          <div class="overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
            <table class="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr class="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome / Usuário</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Perfil</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (user of filteredUsers(); track user.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {{ user.name.charAt(0).toUpperCase() }}
                        </div>
                        <span class="font-bold text-slate-900 dark:text-white text-sm">{{ user.name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {{ user.email }}
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                        [class]="getRoleBadgeClass(user.role)">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        [class]="user.active ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'">
                        <span class="w-1.5 h-1.5 rounded-full" [class]="user.active ? 'bg-emerald-500' : 'bg-red-500'"></span>
                        {{ user.active ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <a [routerLink]="[user.id, 'editar']" 
                          class="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all" 
                          title="Editar">
                          <span class="material-icons text-lg">edit</span>
                        </a>
                        <a [routerLink]="[user.id, 'permissoes']" 
                          class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" 
                          title="Permissões">
                          <span class="material-icons text-lg">admin_panel_settings</span>
                        </a>
                        <button class="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" 
                          title="Excluir" (click)="confirmDelete(user.id)">
                          <span class="material-icons text-lg">delete</span>
                        </button>
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

    <app-confirm-modal
      [isOpen]="showDeleteModal()"
      title="Excluir usuário"
      message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
      confirmText="Excluir"
      [dangerMode]="true"
      (closed)="showDeleteModal.set(false)"
      (confirmed)="deleteUser()" />
  `,
  styles: [`:host { display: block; }`]
})
export class UsersListComponent implements OnInit {
  private usersService = inject(UsersService);
  private toast = inject(ToastService);

  users = signal<User[]>([]);
  loading = signal(true);
  searchTerm = '';
  showDeleteModal = signal(false);
  userIdToDelete = signal('');

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.usersService.getAll().subscribe({
      next: (users) => {
        this.users.set(users || []);
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
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'PSICOPEDAGOGO':
      case 'PROFISSIONAL':
        return 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  }

  confirmDelete(id: string) {
    this.userIdToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  deleteUser() {
    const id = this.userIdToDelete();
    this.showDeleteModal.set(false);
    this.usersService.delete(id).subscribe({
      next: () => { this.loadUsers(); this.toast.success('Usuário excluído com sucesso'); },
      error: () => this.toast.error('Erro ao excluir usuário')
    });
  }
}
