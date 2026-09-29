import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ResponsaveisService } from '../services/responsaveis.service';

@Component({
  selector: 'app-responsavel-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="header">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 56px; height: 56px; border-radius: 50%; overflow: hidden; background: rgba(0, 127, 128, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            @if (item()?.avatarUrl) {
              <img [src]="item()?.avatarUrl" [alt]="item()?.name" style="width: 100%; height: 100%; object-fit: cover;">
            } @else {
              {{ getInitials(item()?.name) }}
            }
          </div>
          <div>
            <h1>{{ item()?.name }}</h1>
            <p class="subtitle">{{ item()?.relationship }}</p>
          </div>
        </div>
        <div class="actions">
          <a routerLink="/app/responsaveis" class="btn btn-outline"><span class="material-icons">arrow_back</span></a>
          <a [routerLink]="['/app/responsaveis', id, 'editar']" class="btn btn-primary"><span class="material-icons">edit</span></a>
        </div>
      </div>
      @if (item()) { <div class="card"><div class="card-body">
        <div class="info-grid">
          <div class="info-section"><h3>CPF</h3><p>{{ item()?.cpf || '—' }}</p></div>
          <div class="info-section"><h3>Telefones</h3><p>{{ item()?.phones || '—' }}{{ item()?.phoneIsWhatsApp ? ' (WhatsApp)' : '' }}</p></div>
          <div class="info-section"><h3>Email</h3><p>{{ item()?.email || '—' }}</p></div>
          <div class="info-section"><h3>CPF</h3><p>{{ item()?.cpf || '—' }}</p></div>
          <div class="info-section"><h3>Data de Nascimento</h3><p>{{ item()?.birthDate || '—' }}</p></div>
          <div class="info-section info-full"><h3>Endereço</h3>
            <p>{{ item()?.street || '—' }}{{ item()?.number ? ', ' + item()?.number : '' }}{{ item()?.complement ? ' - ' + item()?.complement : '' }}</p>
            <p>{{ item()?.neighborhood || '' }}{{ item()?.city ? ' - ' + item()?.city : '' }}{{ item()?.state ? '/' + item()?.state : '' }}</p>
            <p>{{ item()?.cep || '' }}</p>
          </div>
        </div>
      </div></div> }
    </div>
  `,
  styles: [`.page { max-width: 900px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .actions { display: flex; gap: 8px; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 24px; } .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; } .info-full { grid-column: 1 / -1; } .info-section h3 { font-size: 14px; font-weight: 600; color: var(--primary); margin: 0 0 8px; text-transform: uppercase; } .info-section p { margin: 4px 0; font-size: 14px; color: var(--gray-700); white-space: pre-wrap; } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); }`]
})
export class ResponsavelDetailComponent implements OnInit {
  private service = inject(ResponsaveisService); private route = inject(ActivatedRoute);
  id = ''; item = signal<any>(null);

  getInitials(name?: string): string {
    if (!name) return 'R';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');
  }

  ngOnInit() { this.id = this.route.snapshot.params['id']; this.service.get(this.id).subscribe((res: any) => this.item.set(res)); }
}
