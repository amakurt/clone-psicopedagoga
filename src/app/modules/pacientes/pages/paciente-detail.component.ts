import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PacientesService } from '../services/pacientes.service';

@Component({
  selector: 'app-paciente-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="header">
        <div><h1>{{ paciente()?.name }}</h1><p class="subtitle">{{ paciente()?.email }}</p></div>
        <div class="actions">
          <a routerLink="/pacientes" class="btn btn-outline"><span class="material-icons">arrow_back</span></a>
          <a [routerLink]="['/pacientes', id, 'editar']" class="btn btn-primary"><span class="material-icons">edit</span></a>
          <a [routerLink]="['/pacientes', id, 'prontuario']" class="btn btn-outline"><span class="material-icons">description</span> Prontuário</a>
        </div>
      </div>
      @if (paciente()) {
        <div class="info-grid">
          <div class="card"><div class="card-body">
            <h3>Dados Pessoais</h3>
            <p><strong>CPF:</strong> {{ paciente()?.cpf || '—' }}</p>
            <p><strong>Nascimento:</strong> {{ paciente()?.birthDate | date:'dd/MM/yyyy' }}</p>
            <p><strong>Telefone:</strong> {{ paciente()?.phone || '—' }}</p>
          </div></div>
          <div class="card"><div class="card-body">
            <h3>Escolar</h3>
            <p><strong>Escola:</strong> {{ paciente()?.school || '—' }}</p>
            <p><strong>Série:</strong> {{ paciente()?.grade || '—' }}</p>
          </div></div>
          <div class="card"><div class="card-body">
            <h3>Responsável</h3>
            <p><strong>Nome:</strong> {{ paciente()?.guardianName || '—' }}</p>
            <p><strong>Telefone:</strong> {{ paciente()?.guardianPhone || '—' }}</p>
          </div></div>
          @if (paciente()?.notes) {
            <div class="card full"><div class="card-body">
              <h3>Observações</h3>
              <p>{{ paciente()?.notes }}</p>
            </div></div>
          }
        </div>
      }
    </div>
  `,
  styles: [`.page { max-width: 1000px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .actions { display: flex; gap: 8px; } .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 20px; } .card-body h3 { font-size: 14px; font-weight: 600; color: var(--primary); margin: 0 0 12px; text-transform: uppercase; } .card-body p { margin: 4px 0; font-size: 14px; color: var(--gray-700); } .full { grid-column: 1 / -1; } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); }`]
})
export class PacienteDetailComponent implements OnInit {
  private service = inject(PacientesService);
  private route = inject(ActivatedRoute);
  id = '';
  paciente = signal<any>(null);
  ngOnInit() { this.id = this.route.snapshot.params['id']; this.service.get(this.id).subscribe((res: any) => this.paciente.set(res)); }
}
