import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PacientesService } from '../services/pacientes.service';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="header">
        <div><h1>Pacientes</h1><p class="subtitle">Gerenciar cadastros de pacientes</p></div>
        <a routerLink="/pacientes/novo" class="btn btn-primary"><span class="material-icons">add</span> Novo Paciente</a>
      </div>
      <div class="card">
        <div class="card-header">
          <input class="form-control search" placeholder="Buscar paciente..." [(ngModel)]="searchTerm" (input)="onSearch()">
        </div>
        <div class="card-body">
          @if (loading()) { <p>Carregando...</p> }
          @else if (items().length === 0) { <div class="empty"><span class="material-icons" style="font-size:48px;color:var(--gray-400)">people</span><p>Nenhum paciente encontrado</p></div> }
          @else {
            <table class="table">
              <thead><tr><th>Nome</th><th>Email</th><th>Telefone</th><th>Escola</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>
                @for (p of items(); track p.id) {
                  <tr>
                    <td><strong>{{ p.name }}</strong></td>
                    <td>{{ p.email || '—' }}</td>
                    <td>{{ p.phone || '—' }}</td>
                    <td>{{ p.school || '—' }}</td>
                    <td><span class="badge" [class]="p.active ? 'badge-success' : 'badge-danger'">{{ p.active ? 'Ativo' : 'Inativo' }}</span></td>
                    <td class="actions">
                      <a [routerLink]="['/pacientes', p.id]" class="btn-sm btn-outline"><span class="material-icons">visibility</span></a>
                      <a [routerLink]="['/pacientes', p.id, 'editar']" class="btn-sm btn-outline"><span class="material-icons">edit</span></a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`.page { max-width: 1200px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-header { padding: 16px; border-bottom: 1px solid var(--gray-200); } .search { max-width: 400px; } .card-body { padding: 16px; } .table { width: 100%; border-collapse: collapse; } .table th, .table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--gray-200); font-size: 14px; } .table th { color: var(--gray-500); font-size: 12px; text-transform: uppercase; } .actions { display: flex; gap: 4px; } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-sm { padding: 4px 8px; font-size: 12px; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); } .btn-sm .material-icons { font-size: 16px; } .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; } .badge-success { background: #D1FAE5; color: #065F46; } .badge-danger { background: #FEE2E2; color: #991B1B; } .empty { text-align: center; padding: 40px; color: var(--gray-500); }`]
})
export class PacientesListComponent implements OnInit {
  private service = inject(PacientesService);
  items = signal<any[]>([]);
  loading = signal(true);
  searchTerm = '';
  private timeout: any;
  ngOnInit() { this.load(); }
  load() { this.service.list({ search: this.searchTerm }).subscribe({ next: (res: any) => { this.items.set(res.data); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  onSearch() { clearTimeout(this.timeout); this.timeout = setTimeout(() => this.load(), 300); }
}
