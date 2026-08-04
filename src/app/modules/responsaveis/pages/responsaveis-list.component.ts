import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResponsaveisService } from '../services/responsaveis.service';

@Component({
  selector: 'app-responsaveis-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="header"><div><h1>Responsáveis</h1><p class="subtitle">Responsáveis pelos pacientes</p></div><a routerLink="/app/responsaveis/novo" class="btn btn-primary"><span class="material-icons">add</span> Novo</a></div>
      @if (loading()) { <p>Carregando...</p> }
      @else if (items().length === 0) { <div class="empty"><span class="material-icons" style="font-size:48px;color:var(--gray-400)">people</span><p>Nenhum responsável</p></div> }
      @else { <div class="card"><div class="card-body"><table class="table"><thead><tr><th>Nome</th><th>Parentesco</th><th>Telefones</th><th>Email</th><th>Ações</th></tr></thead><tbody>
        @for (r of items(); track r.id) { <tr><td><strong>{{ r.name }}</strong></td><td>{{ r.relationship }}</td><td>{{ r.phones }}</td><td>{{ r.email || '—' }}</td><td class="actions"><a [routerLink]="['/app/app/responsaveis', r.id]" class="btn-sm btn-outline"><span class="material-icons">visibility</span></a><a [routerLink]="['/app/app/responsaveis', r.id, 'editar']" class="btn-sm btn-outline"><span class="material-icons">edit</span></a></td></tr> }
      </tbody></table></div></div> }
    </div>
  `,
  styles: [`.page { max-width: 1200px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 16px; } .table { width: 100%; border-collapse: collapse; } .table th, .table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--gray-200); font-size: 14px; } .table th { color: var(--gray-500); font-size: 12px; text-transform: uppercase; } .actions { display: flex; gap: 4px; } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-sm { padding: 4px 8px; font-size: 12px; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); } .btn-sm .material-icons { font-size: 16px; } .empty { text-align: center; padding: 40px; color: var(--gray-500); }`]
})
export class ResponsaveisListComponent implements OnInit {
  private service = inject(ResponsaveisService); items = signal<any[]>([]); loading = signal(true);
  ngOnInit() { this.service.list().subscribe({ next: (res: any) => { this.items.set(res.data); this.loading.set(false); }, error: () => this.loading.set(false) }); }
}
