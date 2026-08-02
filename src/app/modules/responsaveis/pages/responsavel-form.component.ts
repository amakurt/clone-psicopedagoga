import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ResponsaveisService } from '../services/responsaveis.service';

@Component({
  selector: 'app-responsavel-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="header"><div><h1>{{ isEdit ? 'Editar' : 'Novo' }} Responsável</h1></div><a routerLink="/responsaveis" class="btn btn-outline"><span class="material-icons">arrow_back</span></a></div>
      <div class="card"><div class="card-body">
        <div class="form-grid">
          <div class="form-group"><label>Nome *</label><input class="form-control" [(ngModel)]="form.name"></div>
          <div class="form-group"><label>Parentesco</label><input class="form-control" [(ngModel)]="form.relationship"></div>
          <div class="form-group"><label>CPF</label><input class="form-control" [(ngModel)]="form.cpf"></div>
          <div class="form-group"><label>Telefones</label><input class="form-control" [(ngModel)]="form.phones"></div>
          <div class="form-group"><label>Email</label><input class="form-control" type="email" [(ngModel)]="form.email"></div>
          <div class="form-group full"><label>Endereço</label><input class="form-control" [(ngModel)]="form.address"></div>
        </div>
        <div class="form-actions"><a routerLink="/responsaveis" class="btn btn-outline">Cancelar</a><button class="btn btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Salvando...' : 'Salvar' }}</button></div>
      </div></div>
    </div>
  `,
  styles: [`.page { max-width: 900px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 24px; } .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } .form-group { display: flex; flex-direction: column; gap: 4px; } .form-group label { font-size: 13px; font-weight: 500; color: var(--gray-700); } .full { grid-column: 1 / -1; } .form-control { padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px; width: 100%; box-sizing: border-box; } .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-200); } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); }`]
})
export class ResponsavelFormComponent implements OnInit {
  private service = inject(ResponsaveisService); private router = inject(Router); private route = inject(ActivatedRoute);
  isEdit = false; id = ''; saving = signal(false);
  form: any = { name: '', relationship: '', cpf: '', phones: '', email: '', address: '' };
  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || ''; this.isEdit = !!this.id;
    if (this.isEdit) this.service.get(this.id).subscribe((res: any) => this.form = res);
  }
  save() {
    if (!this.form.name) return alert('Nome é obrigatório');
    this.saving.set(true);
    const obs = this.isEdit ? this.service.update(this.id, this.form) : this.service.create(this.form);
    obs.subscribe({ next: () => this.router.navigate(['/responsaveis']), error: () => { this.saving.set(false); alert('Erro ao salvar'); } });
  }
}
