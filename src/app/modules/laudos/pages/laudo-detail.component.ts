import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LaudoService } from '../services/laudo.service';

@Component({
  selector: 'app-laudo-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="header"><div><h1>{{ item()?.titulo }}</h1><p class="subtitle">{{ item()?.paciente?.name }} — {{ item()?.createdAt | date:'dd/MM/yyyy' }}</p></div>
        <div class="actions"><a routerLink="/laudos" class="btn btn-outline"><span class="material-icons">arrow_back</span></a><a [routerLink]="['/laudos', id, 'editar']" class="btn btn-primary"><span class="material-icons">edit</span></a></div></div>
      @if (item()) { <div class="card"><div class="card-body"><div class="meta"><span class="badge" [class]="item()?.status === 'RASCUNHO' ? 'badge-warn' : 'badge-success'">{{ item()?.status }}</span><span>Por: {{ item()?.autor?.name }}</span></div><div class="content">{{ item()?.content }}</div></div></div> }
    </div>
  `,
  styles: [`.page { max-width: 900px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .actions { display: flex; gap: 8px; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 24px; } .meta { display: flex; gap: 16px; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--gray-200); font-size: 14px; color: var(--gray-600); } .content { font-size: 15px; line-height: 1.7; white-space: pre-wrap; } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); } .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; } .badge-warn { background: #FEF3C7; color: #92400E; } .badge-success { background: #D1FAE5; color: #065F46; }`]
})
export class LaudoDetailComponent implements OnInit {
  private service = inject(LaudoService); private route = inject(ActivatedRoute);
  id = ''; item = signal<any>(null);
  ngOnInit() { this.id = this.route.snapshot.params['id']; this.service.get(this.id).subscribe((res: any) => this.item.set(res)); }
}
