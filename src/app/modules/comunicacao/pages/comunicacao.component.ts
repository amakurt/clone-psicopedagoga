import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-comunicacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="header"><h1>Comunicação</h1><p class="subtitle">Avisos e mensagens</p></div>
      <div class="card" style="margin-bottom:16px"><div class="card-body">
        <h3 style="margin-bottom:12px">Novo Aviso</h3>
        <input class="form-control" [(ngModel)]="newMsg.titulo" placeholder="Título" style="margin-bottom:8px">
        <textarea class="form-control" [(ngModel)]="newMsg.mensagem" rows="3" placeholder="Mensagem..." style="margin-bottom:8px"></textarea>
        <button class="btn btn-primary" (click)="send()">Enviar</button>
      </div></div>
      @for (m of items(); track m.id) {
        <div class="card" style="margin-bottom:8px"><div class="card-body">
          <div style="display:flex;justify-content:space-between"><strong>{{ m.titulo }}</strong><span class="text-muted">{{ m.createdAt | date:'dd/MM/yyyy HH:mm' }}</span></div>
          <p style="margin-top:8px;color:var(--gray-700)">{{ m.mensagem }}</p>
          <span class="text-muted">Por: {{ m.autor?.name }}</span>
        </div></div>
      }
    </div>
  `,
  styles: [`.page { max-width: 900px; } .header { margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 16px; } .form-control { padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px; width: 100%; box-sizing: border-box; } textarea.form-control { resize: vertical; } .btn { padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; } .btn-primary { background: var(--primary); color: white; } .text-muted { color: var(--gray-500); font-size: 13px; }`]
})
export class ComunicacaoComponent implements OnInit {
  private api = inject(ApiService);
  items = signal<any[]>([]);
  newMsg = { titulo: '', mensagem: '', tipo: 'AVISO' };
  ngOnInit() { this.load(); }
  load() { this.api.get('/comunicacao').subscribe((res: any) => this.items.set(res.data)); }
  send() {
    if (!this.newMsg.titulo || !this.newMsg.mensagem) return;
    this.api.post('/comunicacao', this.newMsg).subscribe(() => { this.newMsg = { titulo: '', mensagem: '', tipo: 'AVISO' }; this.load(); });
  }
}
