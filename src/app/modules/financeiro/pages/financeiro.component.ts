import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="header"><h1>Financeiro</h1><p class="subtitle">Controle de pagamentos</p></div>
      @if (items().length === 0) { <div class="empty"><span class="material-icons" style="font-size:48px;color:var(--gray-400)">payments</span><p>Nenhum registro</p></div> }
      @else {
        <div class="card"><div class="card-body">
          <table class="table">
            <thead><tr><th>Data</th><th>Paciente</th><th>Valor</th><th>Status</th></tr></thead>
            <tbody>
              @for (f of items(); track f.id) {
                <tr>
                  <td>{{ f.createdAt | date:'dd/MM/yyyy' }}</td>
                  <td><strong>{{ f.paciente?.name }}</strong></td>
                  <td>{{ f.valor | currency:'BRL' }}</td>
                  <td><span class="badge" [class]="'badge-' + f.status.toLowerCase()">{{ f.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div></div>
      }
    </div>
  `,
  styles: [`.page { max-width: 1200px; } .header { margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 16px; } .table { width: 100%; border-collapse: collapse; } .table th, .table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--gray-200); font-size: 14px; } .table th { color: var(--gray-500); font-size: 12px; text-transform: uppercase; } .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; } .badge-pendente { background: #FEF3C7; color: #92400E; } .badge-pago { background: #D1FAE5; color: #065F46; } .empty { text-align: center; padding: 40px; color: var(--gray-500); }`]
})
export class FinanceiroComponent implements OnInit {
  private api = inject(ApiService);
  items = signal<any[]>([]);
  ngOnInit() { this.api.get('/financeiro').subscribe((res: any) => this.items.set(res.data)); }
}
