import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EvolucoesService } from '../services/evolucoes.service';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-evolucao-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="header"><div><h1>{{ isEdit ? 'Editar' : 'Nova' }} Evolução</h1></div><a routerLink="/evolucoes" class="btn btn-outline"><span class="material-icons">arrow_back</span></a></div>
      <div class="card"><div class="card-body">
        <div class="form-grid">
          <div class="form-group"><label>Paciente *</label><select class="form-control" [(ngModel)]="form.pacienteId"><option value="">Selecione</option>@for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.name }}</option> }</select></div>
          <div class="form-group"><label>Data *</label><input class="form-control" type="date" [(ngModel)]="form.date"></div>
          <div class="form-group full"><label>Resumo *</label><textarea class="form-control" rows="3" [(ngModel)]="form.summary"></textarea></div>
          <div class="form-group full"><label>Atividades Realizadas</label><textarea class="form-control" rows="3" [(ngModel)]="form.activities"></textarea></div>
          <div class="form-group full"><label>Observações</label><textarea class="form-control" rows="3" [(ngModel)]="form.observations"></textarea></div>
          <div class="form-group full"><label>Evolução Clínica</label><textarea class="form-control" rows="3" [(ngModel)]="form.clinicalEvolution"></textarea></div>
          <div class="form-group full"><label>Conduta</label><textarea class="form-control" rows="3" [(ngModel)]="form.conduct"></textarea></div>
        </div>
        <div class="form-actions"><a routerLink="/evolucoes" class="btn btn-outline">Cancelar</a><button class="btn btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Salvando...' : 'Salvar' }}</button></div>
      </div></div>
    </div>
  `,
  styles: [`.page { max-width: 900px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 24px; } .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } .form-group { display: flex; flex-direction: column; gap: 4px; } .form-group label { font-size: 13px; font-weight: 500; color: var(--gray-700); } .full { grid-column: 1 / -1; } .form-control { padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px; width: 100%; box-sizing: border-box; } textarea.form-control { resize: vertical; } .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-200); } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); } select.form-control { appearance: auto; }`]
})
export class EvolucaoFormComponent implements OnInit {
  private service = inject(EvolucoesService); private api = inject(ApiService); private router = inject(Router); private route = inject(ActivatedRoute);
  isEdit = false; id = ''; saving = signal(false); pacientes = signal<any[]>([]);
  form: any = { pacienteId: '', date: '', summary: '', activities: '', observations: '', clinicalEvolution: '', conduct: '' };
  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || ''; this.isEdit = !!this.id;
    this.api.get('/pacientes').subscribe((res: any) => this.pacientes.set(res.data));
    if (this.isEdit) this.service.get(this.id).subscribe((res: any) => this.form = res);
  }
  save() {
    if (!this.form.pacienteId) return alert('Selecione um paciente');
    this.saving.set(true);
    const obs = this.isEdit ? this.service.update(this.id, this.form) : this.service.create(this.form);
    obs.subscribe({ next: () => this.router.navigate(['/evolucoes']), error: () => { this.saving.set(false); alert('Erro ao salvar'); } });
  }
}
