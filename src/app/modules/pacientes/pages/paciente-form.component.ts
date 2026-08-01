import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PacientesService } from '../services/pacientes.service';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="header">
        <div><h1>{{ isEdit ? 'Editar' : 'Novo' }} Paciente</h1></div>
        <a routerLink="/pacientes" class="btn btn-outline"><span class="material-icons">arrow_back</span></a>
      </div>
      <div class="card"><div class="card-body">
        <div class="form-grid">
          <div class="form-group"><label>Nome *</label><input class="form-control" [(ngModel)]="form.name"></div>
          <div class="form-group"><label>Email</label><input class="form-control" type="email" [(ngModel)]="form.email"></div>
          <div class="form-group"><label>Telefone</label><input class="form-control" [(ngModel)]="form.phone"></div>
          <div class="form-group"><label>CPF</label><input class="form-control" [(ngModel)]="form.cpf"></div>
          <div class="form-group"><label>Data de Nascimento</label><input class="form-control" type="date" [(ngModel)]="form.birthDate"></div>
          <div class="form-group"><label>Escola</label><input class="form-control" [(ngModel)]="form.school"></div>
          <div class="form-group"><label>Série</label><input class="form-control" [(ngModel)]="form.grade"></div>
          <div class="form-group"><label>Responsável</label><input class="form-control" [(ngModel)]="form.guardianName"></div>
          <div class="form-group"><label>Tel. Responsável</label><input class="form-control" [(ngModel)]="form.guardianPhone"></div>
          <div class="form-group full"><label>Observações</label><textarea class="form-control" rows="3" [(ngModel)]="form.notes"></textarea></div>
        </div>
        <div class="form-actions">
          <a routerLink="/pacientes" class="btn btn-outline">Cancelar</a>
          <button class="btn btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Salvando...' : 'Salvar' }}</button>
        </div>
      </div></div>
    </div>
  `,
  styles: [`.page { max-width: 900px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 24px; } .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } .form-group { display: flex; flex-direction: column; gap: 4px; } .form-group label { font-size: 13px; font-weight: 500; color: var(--gray-700); } .full { grid-column: 1 / -1; } .form-control { padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px; width: 100%; box-sizing: border-box; } textarea.form-control { resize: vertical; } .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-200); } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); }`]
})
export class PacienteFormComponent implements OnInit {
  private service = inject(PacientesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  isEdit = false;
  id = '';
  saving = signal(false);
  form: any = { name: '', email: '', phone: '', cpf: '', birthDate: '', school: '', grade: '', guardianName: '', guardianPhone: '', notes: '' };

  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.id;
    if (this.isEdit) this.service.get(this.id).subscribe((res: any) => this.form = res);
  }

  save() {
    if (!this.form.name) return alert('Nome é obrigatório');
    this.saving.set(true);
    const obs = this.isEdit ? this.service.update(this.id, this.form) : this.service.create(this.form);
    obs.subscribe({ next: () => this.router.navigate(['/pacientes']), error: () => { this.saving.set(false); alert('Erro ao salvar'); } });
  }
}
