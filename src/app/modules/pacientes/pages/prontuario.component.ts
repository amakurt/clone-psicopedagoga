import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-prontuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="header">
        <div><h1>Prontuário</h1><p class="subtitle">Registro de evolução do paciente</p></div>
        <a [routerLink]="['/pacientes', pacienteId]" class="btn btn-outline"><span class="material-icons">arrow_back</span></a>
      </div>
      <div class="card" style="margin-bottom:16px"><div class="card-body">
        <h3 style="margin-bottom:12px">Nova Anotação</h3>
        <input class="form-control" [(ngModel)]="newEntry.titulo" placeholder="Título" style="margin-bottom:8px">
        <textarea class="form-control" [(ngModel)]="newEntry.conteudo" rows="4" placeholder="Descreva a evolução..." style="margin-bottom:8px"></textarea>
        <button class="btn btn-primary" (click)="addEntry()">Salvar Anotação</button>
      </div></div>
      @for (entry of entries(); track entry.id) {
        <div class="card" style="margin-bottom:8px"><div class="card-body">
          <div style="display:flex;justify-content:space-between"><strong>{{ entry.titulo }}</strong><span class="text-muted">{{ entry.createdAt | date:'dd/MM/yyyy HH:mm' }}</span></div>
          <p style="margin-top:8px;color:var(--gray-700)">{{ entry.conteudo }}</p>
          <span class="text-muted">Por: {{ entry.autor?.name }}</span>
        </div></div>
      }
    </div>
  `,
  styles: [`.page { max-width: 900px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 16px; } .form-control { padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px; width: 100%; box-sizing: border-box; } textarea.form-control { resize: vertical; } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); } .text-muted { color: var(--gray-500); font-size: 13px; }`]
})
export class ProntuarioComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  pacienteId = '';
  entries = signal<any[]>([]);
  newEntry = { titulo: '', conteudo: '' };

  ngOnInit() {
    this.pacienteId = this.route.snapshot.params['id'];
    this.loadEntries();
  }

  loadEntries() {
    this.api.get('/prontuarios', { pacienteId: this.pacienteId }).subscribe((res: any) => this.entries.set(res.data));
  }

  addEntry() {
    if (!this.newEntry.titulo || !this.newEntry.conteudo) return;
    this.api.post('/prontuarios', { ...this.newEntry, pacienteId: this.pacienteId }).subscribe(() => {
      this.newEntry = { titulo: '', conteudo: '' };
      this.loadEntries();
    });
  }
}
