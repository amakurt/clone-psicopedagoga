import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-prontuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="header">
        <div><h1>Prontuário</h1><p class="subtitle">Registro de evolução do paciente</p></div>
        <a [routerLink]="['/app/pacientes', pacienteId]" class="btn btn-outline"><span class="material-icons">arrow_back</span></a>
      </div>
      <div class="card" style="margin-bottom:16px"><div class="card-body">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3 style="margin:0">{{ editingId() ? 'Editar Anotação' : 'Nova Anotação' }}</h3>
          @if (editingId()) {
            <button class="btn btn-outline" (click)="resetForm()"><span class="material-icons" style="font-size:16px">add</span> Nova anotação</button>
          }
        </div>
        <input class="form-control" [(ngModel)]="newEntry.titulo" placeholder="Título" style="margin-bottom:8px">
        <textarea class="form-control" [(ngModel)]="newEntry.conteudo" rows="4" placeholder="Descreva a evolução..." style="margin-bottom:8px"></textarea>
        <button class="btn btn-primary" (click)="saveEntry()">{{ editingId() ? 'Salvar Alteração' : 'Salvar Anotação' }}</button>
      </div></div>
      @for (entry of entries(); track entry.id) {
        <div class="card" style="margin-bottom:8px"><div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <strong>{{ entry.titulo }}</strong>
            <div style="display:flex;align-items:center;gap:4px">
              <button class="btn btn-outline" style="padding:4px 8px" title="Editar" (click)="editEntry(entry)"><span class="material-icons" style="font-size:16px">edit</span></button>
              <button class="btn btn-outline" style="padding:4px 8px;color:#DC2626;border-color:#FECACA" title="Excluir" (click)="deleteEntry(entry)"><span class="material-icons" style="font-size:16px">delete</span></button>
            </div>
          </div>
          <p style="margin:8px 0 0;color:var(--gray-700)">{{ entry.conteudo }}</p>
          <span class="text-muted" style="display:block;margin-top:4px">{{ entry.createdAt | date:'dd/MM/yyyy HH:mm' }} · Por: {{ entry.autor?.name }}</span>
        </div></div>
      }
      @if (entries().length === 0) {
        <div class="card"><div class="card-body" style="text-align:center;color:var(--gray-400);padding:32px">
          <span class="material-icons" style="font-size:40px">history</span>
          <p style="margin:8px 0 0">Nenhuma anotação neste prontuário</p>
        </div></div>
      }
    </div>
  `,
  styles: [`.page { max-width: 900px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 16px; } .form-control { padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px; width: 100%; box-sizing: border-box; } textarea.form-control { resize: vertical; } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); } .text-muted { color: var(--gray-500); font-size: 13px; }`]
})
export class ProntuarioComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  pacienteId = '';
  entries = signal<any[]>([]);
  editingId = signal('');
  newEntry = { titulo: '', conteudo: '' };

  ngOnInit() {
    this.pacienteId = this.route.snapshot.params['id'];
    this.loadEntries();
  }

  loadEntries() {
    this.api.get('/prontuarios', { pacienteId: this.pacienteId }).subscribe((res: any) => this.entries.set(res.data));
  }

  resetForm() {
    this.editingId.set('');
    this.newEntry = { titulo: '', conteudo: '' };
  }

  editEntry(entry: any) {
    this.editingId.set(entry.id);
    this.newEntry = { titulo: entry.titulo, conteudo: entry.conteudo };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveEntry() {
    if (!this.newEntry.titulo || !this.newEntry.conteudo) return;
    const req = this.editingId()
      ? this.api.put(`/prontuarios/${this.editingId()}`, this.newEntry)
      : this.api.post('/prontuarios', { ...this.newEntry, pacienteId: this.pacienteId });
    req.subscribe({
      next: () => {
        this.toast.success(this.editingId() ? 'Anotação atualizada' : 'Anotação salva');
        this.resetForm();
        this.loadEntries();
      },
      error: () => this.toast.error('Erro ao salvar anotação')
    });
  }

  deleteEntry(entry: any) {
    if (!confirm(`Excluir a anotação "${entry.titulo}"?`)) return;
    this.api.delete(`/prontuarios/${entry.id}`).subscribe({
      next: () => {
        this.toast.success('Anotação excluída');
        this.loadEntries();
      },
      error: () => this.toast.error('Erro ao excluir anotação')
    });
  }
}