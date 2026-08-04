import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SessaoService } from '../services/sessao.service';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-sessao-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="header"><div><h1>{{ isEdit ? 'Editar' : 'Nova' }} Sessão</h1></div><a routerLink="/app/sessoes" class="btn btn-outline"><span class="material-icons">arrow_back</span></a></div>
      <div class="card"><div class="card-body">
        <div class="form-grid">
          <div class="form-group"><label>Paciente *</label><select class="form-control" [(ngModel)]="form.pacienteId"><option value="">Selecione</option>@for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.name }}</option> }</select></div>
          <div class="form-group"><label>Data/Hora *</label><input class="form-control" type="datetime-local" [(ngModel)]="form.date"></div>
          <div class="form-group"><label>Tipo</label><select class="form-control" [(ngModel)]="form.tipo"><option value="">Selecione</option><option value="AVALIACAO">Avaliação</option><option value="SESSAO">Sessão</option><option value="REUNIAO">Reunião</option><option value="ENCAMINHAMENTO">Encaminhamento</option></select></div>
          <div class="form-group"><label>Duração (min)</label><input class="form-control" type="number" [(ngModel)]="form.duration"></div>
          <div class="form-group"><label>Valor (R$)</label><input class="form-control" type="number" step="0.01" [(ngModel)]="form.valor"></div>
          <div class="form-group"><label>Status</label><select class="form-control" [(ngModel)]="form.status"><option value="AGENDADA">Agendada</option><option value="EM_ANDAMENTO">Em Andamento</option><option value="CONCLUIDA">Concluída</option><option value="CANCELADA">Cancelada</option></select></div>
          <div class="form-group full"><label>Observações</label><textarea class="form-control" rows="3" [(ngModel)]="form.observacoes"></textarea></div>
        </div>
        <div class="form-actions"><a routerLink="/app/sessoes" class="btn btn-outline">Cancelar</a><button class="btn btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Salvando...' : 'Salvar' }}</button></div>
      </div></div>
    </div>
  `,
  styles: [`.page { max-width: 900px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 24px; } .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } .form-group { display: flex; flex-direction: column; gap: 4px; } .form-group label { font-size: 13px; font-weight: 500; color: var(--gray-700); } .full { grid-column: 1 / -1; } .form-control { padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px; width: 100%; box-sizing: border-box; } textarea.form-control { resize: vertical; } .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-200); } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); } select.form-control { appearance: auto; }`]
})
export class SessaoFormComponent implements OnInit {
  private service = inject(SessaoService); private api = inject(ApiService); private router = inject(Router); private route = inject(ActivatedRoute);
  isEdit = false; id = ''; saving = signal(false); pacientes = signal<any[]>([]);
  form: any = { pacienteId: '', date: '', tipo: '', duration: 60, valor: '', status: 'AGENDADA', observacoes: '' };
  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || ''; this.isEdit = !!this.id;
    this.api.get('/pacientes').subscribe((res: any) => this.pacientes.set(res.data));
    if (this.isEdit) this.service.get(this.id).subscribe({ next: (res: any) => { this.form = res; this.form.date = res.date ? new Date(res.date).toISOString().slice(0, 16) : ''; } });
  }
  save() {
    if (!this.form.pacienteId || !this.form.date) return alert('Preencha paciente e data');
    this.saving.set(true);
    this.form.psicopedagogoId = 'system';
    const obs = this.isEdit ? this.service.update(this.id, this.form) : this.service.create(this.form);
    obs.subscribe({ next: () => this.router.navigate(['/app/sessoes']), error: () => { this.saving.set(false); alert('Erro'); } });
  }
}
