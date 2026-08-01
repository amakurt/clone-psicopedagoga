import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SessaoService } from '../services/sessao.service';

@Component({
  selector: 'app-sessoes-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="header"><div><h1>Sessões</h1><p class="subtitle">Agendamento e acompanhamento</p></div><a routerLink="/sessoes/nova" class="btn btn-primary"><span class="material-icons">add</span> Nova Sessão</a></div>
      @if (loading()) { <p>Carregando...</p> }
      @else if (items().length === 0) { <div class="empty"><span class="material-icons" style="font-size:48px;color:var(--gray-400)">event</span><p>Nenhuma sessão</p></div> }
      @else { <div class="card"><div class="card-body"><table class="table"><thead><tr><th>Data</th><th>Paciente</th><th>Tipo</th><th>Duração</th><th>Status</th><th>Valor</th><th>Ações</th></tr></thead><tbody>
        @for (s of items(); track s.id) { <tr><td>{{ s.date | date:'dd/MM/yyyy HH:mm' }}</td><td><strong>{{ s.paciente?.name }}</strong></td><td>{{ s.tipo || '—' }}</td><td>{{ s.duration ? s.duration + ' min' : '—' }}</td><td><span class="badge" [class]="'badge-' + s.status.toLowerCase()">{{ s.status }}</span></td><td>{{ s.valor ? (s.valor | currency:'BRL') : '—' }}</td><td class="actions"><a [routerLink]="['/sessoes', s.id]" class="btn-sm btn-outline"><span class="material-icons">visibility</span></a><a [routerLink]="['/sessoes', s.id, 'editar']" class="btn-sm btn-outline"><span class="material-icons">edit</span></a></td></tr> }
      </tbody></table></div></div> }
    </div>
  `,
  styles: [`.page { max-width: 1200px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 16px; } .table { width: 100%; border-collapse: collapse; } .table th, .table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--gray-200); font-size: 14px; } .table th { color: var(--gray-500); font-size: 12px; text-transform: uppercase; } .actions { display: flex; gap: 4px; } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-sm { padding: 4px 8px; font-size: 12px; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); } .btn-sm .material-icons { font-size: 16px; } .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; } .badge-agendada { background: #DBEAFE; color: #1E40AF; } .badge-concluida { background: #D1FAE5; color: #065F46; } .badge-cancelada { background: #FEE2E2; color: #991B1B; } .badge-em_andamento { background: #FEF3C7; color: #92400E; } .empty { text-align: center; padding: 40px; color: var(--gray-500); }`]
})
export class SessoesListComponent implements OnInit {
  private service = inject(SessaoService); items = signal<any[]>([]); loading = signal(true);
  ngOnInit() { this.service.list().subscribe({ next: (res: any) => { this.items.set(res.data); this.loading.set(false); }, error: () => this.loading.set(false) }); }
}
