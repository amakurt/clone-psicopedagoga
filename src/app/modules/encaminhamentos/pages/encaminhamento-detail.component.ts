import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EncaminhamentoService } from '../services/encaminhamento.service';

@Component({
  selector: 'app-encaminhamento-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="header"><div><h1>Encaminhamento</h1><p class="subtitle">{{ item()?.paciente?.name }}</p></div><a routerLink="/app/encaminhamentos" class="btn btn-outline"><span class="material-icons">arrow_back</span></a></div>
      @if (item()) { <div class="card"><div class="card-body">
        <div class="info-grid">
          <div class="info-section"><h3>Dados</h3><p><strong>Status:</strong> {{ item()?.status }}</p><p><strong>De:</strong> {{ item()?.deUser?.name }}</p><p><strong>Para:</strong> {{ item()?.paraUser?.name || 'Não atribuído' }}</p></div>
          <div class="info-section full"><h3>Motivo</h3><p>{{ item()?.motivo }}</p></div>
          @if (item()?.resposta) { <div class="info-section full"><h3>Resposta</h3><p>{{ item()?.resposta }}</p></div> }
        </div>
      </div></div> }
    </div>
  `,
  styles: [`.page { max-width: 900px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 24px; } .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; } .info-section h3 { font-size: 14px; font-weight: 600; color: var(--primary); margin: 0 0 8px; text-transform: uppercase; } .info-section p { margin: 4px 0; font-size: 14px; color: var(--gray-700); } .full { grid-column: 1 / -1; } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); }`]
})
export class EncaminhamentoDetailComponent implements OnInit {
  private service = inject(EncaminhamentoService); private route = inject(ActivatedRoute);
  id = ''; item = signal<any>(null);
  ngOnInit() { this.id = this.route.snapshot.params['id']; this.service.get(this.id).subscribe((res: any) => this.item.set(res)); }
}
