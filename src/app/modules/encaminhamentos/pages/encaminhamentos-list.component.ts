import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EncaminhamentoService } from '../services/encaminhamento.service';

@Component({
  selector: 'app-encaminhamentos-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="header"><div><h1>Encaminhamentos</h1><p class="subtitle">Encaminhamentos para atendimento</p></div></div>
      @if (loading()) { <p>Carregando...</p> }
      @else if (items().length === 0) { <div class="empty"><span class="material-icons" style="font-size:48px;color:var(--gray-400)">forward_to_inbox</span><p>Nenhum encaminhamento</p></div> }
      @else { <div class="card"><div class="card-body"><table class="table"><thead><tr><th>Data</th><th>Paciente</th><th>De</th><th>Para</th><th>Motivo</th><th>Status</th></tr></thead><tbody>
        @for (e of items(); track e.id) { <tr><td>{{ e.createdAt | date:'dd/MM/yyyy' }}</td><td><strong>{{ e.paciente?.name }}</strong></td><td>{{ e.deUser?.name }}</td><td>{{ e.paraUser?.name || '—' }}</td><td>{{ (e.motivo?.length > 40 ? (e.motivo | slice:0:40) + '...' : e.motivo) }}</td><td><span class="badge" [class]="'badge-' + e.status.toLowerCase()">{{ e.status }}</span></td></tr> }
      </tbody></table></div></div> }
    </div>
  `,
  styles: [`.page { max-width: 1200px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 16px; } .table { width: 100%; border-collapse: collapse; } .table th, .table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--gray-200); font-size: 14px; } .table th { color: var(--gray-500); font-size: 12px; text-transform: uppercase; } .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; } .badge-pendente { background: #FEF3C7; color: #92400E; } .badge-aceito { background: #D1FAE5; color: #065F46; } .badge-concluido { background: #DBEAFE; color: #1E40AF; } .empty { text-align: center; padding: 40px; color: var(--gray-500); }`]
})
export class EncaminhamentosListComponent implements OnInit {
  private service = inject(EncaminhamentoService); items = signal<any[]>([]); loading = signal(true);
  ngOnInit() { this.service.list().subscribe({ next: (res: any) => { this.items.set(res.data); this.loading.set(false); }, error: () => this.loading.set(false) }); }
}
