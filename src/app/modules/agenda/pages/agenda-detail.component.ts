import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AgendaService } from '../services/agenda.service';

@Component({
  selector: 'app-agenda-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="header"><div><h1>Consulta</h1><p class="subtitle">{{ item()?.paciente?.name }} — {{ item()?.date | date:'dd/MM/yyyy' }}</p></div>
        <div class="actions"><a routerLink="/agenda" class="btn btn-outline"><span class="material-icons">arrow_back</span></a><a [routerLink]="['/agenda', id, 'editar']" class="btn btn-primary"><span class="material-icons">edit</span></a></div></div>
      @if (item()) { <div class="card"><div class="card-body">
        <div class="info-grid">
          <div class="info-section"><h3>Paciente</h3><p>{{ item()?.paciente?.name || '—' }}</p></div>
          <div class="info-section"><h3>Data</h3><p>{{ item()?.date | date:'dd/MM/yyyy' }}</p></div>
          <div class="info-section"><h3>Horário</h3><p>{{ item()?.startTime }} - {{ item()?.endTime }}</p></div>
          <div class="info-section"><h3>Tipo</h3><p>{{ item()?.type || '—' }}</p></div>
          <div class="info-section"><h3>Status</h3><p><span class="badge" [class]="'badge-' + item()?.status?.toLowerCase()">{{ item()?.status }}</span></p></div>
          <div class="info-section"><h3>Observações</h3><p>{{ item()?.notes || '—' }}</p></div>
        </div>
      </div></div> }
    </div>
  `,
  styles: [`.page { max-width: 900px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .actions { display: flex; gap: 8px; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 24px; } .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; } .info-section h3 { font-size: 14px; font-weight: 600; color: var(--primary); margin: 0 0 8px; text-transform: uppercase; } .info-section p { margin: 4px 0; font-size: 14px; color: var(--gray-700); white-space: pre-wrap; } .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; } .badge-pendente { background: #FEF3C7; color: #92400E; } .badge-confirmado { background: #D1FAE5; color: #065F46; } .badge-cancelado { background: #FEE2E2; color: #991B1B; } .badge-concluido { background: #DBEAFE; color: #1E40AF; } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); }`]
})
export class AgendaDetailComponent implements OnInit {
  private service = inject(AgendaService); private route = inject(ActivatedRoute);
  id = ''; item = signal<any>(null);
  ngOnInit() { this.id = this.route.snapshot.params['id']; this.service.get(this.id).subscribe((res: any) => this.item.set(res)); }
}
