import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EscolasService } from '../services/escolas.service';

@Component({
  selector: 'app-escola-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="header"><div><h1>{{ item()?.name }}</h1><p class="subtitle">{{ item()?.location }}</p></div>
        <div class="actions"><a routerLink="/escolas" class="btn btn-outline"><span class="material-icons">arrow_back</span></a><a [routerLink]="['/escolas', id, 'editar']" class="btn btn-primary"><span class="material-icons">edit</span></a></div></div>
      @if (item()) { <div class="card"><div class="card-body">
        <div class="info-grid">
          <div class="info-section"><h3>Nível</h3><p>{{ item()?.level || '—' }}</p></div>
          <div class="info-section"><h3>Status</h3><p><span class="badge" [class]="item()?.active ? 'badge-success' : 'badge-danger'">{{ item()?.active ? 'Ativa' : 'Inativa' }}</span></p></div>
          <div class="info-section"><h3>Telefone</h3><p>{{ item()?.phone || '—' }}</p></div>
          <div class="info-section"><h3>Email</h3><p>{{ item()?.email || '—' }}</p></div>
          <div class="info-section"><h3>Pacientes</h3><p>{{ item()?.patientCount || 0 }}</p></div>
          <div class="info-section"><h3>Observações</h3><p>{{ item()?.notes || '—' }}</p></div>
        </div>
      </div></div> }
    </div>
  `,
  styles: [`.page { max-width: 900px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .actions { display: flex; gap: 8px; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 24px; } .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; } .info-section h3 { font-size: 14px; font-weight: 600; color: var(--primary); margin: 0 0 8px; text-transform: uppercase; } .info-section p { margin: 4px 0; font-size: 14px; color: var(--gray-700); white-space: pre-wrap; } .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; } .badge-success { background: #D1FAE5; color: #065F46; } .badge-danger { background: #FEE2E2; color: #991B1B; } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); }`]
})
export class EscolaDetailComponent implements OnInit {
  private service = inject(EscolasService); private route = inject(ActivatedRoute);
  id = ''; item = signal<any>(null);
  ngOnInit() { this.id = this.route.snapshot.params['id']; this.service.get(this.id).subscribe((res: any) => this.item.set(res)); }
}
