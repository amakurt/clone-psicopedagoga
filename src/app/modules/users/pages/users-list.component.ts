import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsersService } from '../services/users.service';
import { User } from '../../../core/models';
import { ConfirmModalComponent } from '@shared/components/confirm-modal.component';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, MatTooltipModule, ConfirmModalComponent],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Usuários</h1>
        <a mat-raised-button color="primary" routerLink="novo">
          <mat-icon>add</mat-icon>
          Novo Usuário
        </a>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="users" class="w-full">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nome</th>
              <td mat-cell *matCellDef="let user">{{ user.name }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let user">{{ user.email }}</td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Perfil</th>
              <td mat-cell *matCellDef="let user">
                <mat-chip [color]="getRoleColor(user.role)" selected>{{ user.role }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let user">
                <span [class]="user.active ? 'text-green-600' : 'text-red-600'">
                  {{ user.active ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Ações</th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button [routerLink]="[user.id, 'editar']">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button [routerLink]="[user.id, 'permissoes']" matTooltip="Permissões">
                  <mat-icon>admin_panel_settings</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="confirmDelete(user.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>

    <app-confirm-modal
      [isOpen]="showDeleteModal()"
      title="Excluir usuário"
      message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
      confirmText="Excluir"
      [dangerMode]="true"
      (closed)="showDeleteModal.set(false)"
      (confirmed)="deleteUser()" />
  `
})
export class UsersListComponent implements OnInit {
  private usersService = inject(UsersService);
  private toast = inject(ToastService);

  users: User[] = [];
  displayedColumns = ['name', 'email', 'role', 'active', 'actions'];
  showDeleteModal = signal(false);
  userIdToDelete = signal('');

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.usersService.getAll().subscribe(users => this.users = users);
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'GESTOR': return 'primary';
      case 'PSICOPEDAGOGO': return 'accent';
      default: return 'warn';
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
