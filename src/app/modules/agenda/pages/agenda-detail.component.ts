import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AgendaService } from '../services/agenda.service';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-agenda-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="header"><div><h1>Consulta</h1><p class="subtitle">{{ item()?.paciente?.name }} — {{ item()?.date | date:'dd/MM/yyyy' }}</p></div>
        <div class="actions"><a routerLink="/app/agenda" class="btn btn-outline"><span class="material-icons">arrow_back</span></a><a [routerLink]="['/app/agenda', id, 'editar']" class="btn btn-outline"><span class="material-icons">edit</span></a></div></div>
      @if (item()) { <div class="card"><div class="card-body">
        <div class="info-grid">
          <div class="info-section"><h3>Paciente</h3><p>{{ item()?.paciente?.name || '—' }}</p></div>
          <div class="info-section"><h3>Data</h3><p>{{ item()?.date | date:'dd/MM/yyyy' }}</p></div>
          <div class="info-section"><h3>Horário</h3><p>{{ item()?.startTime }} - {{ item()?.endTime }}</p></div>
          <div class="info-section"><h3>Tipo</h3><p>{{ item()?.type || '—' }}</p></div>
          <div class="info-section"><h3>Status</h3><p><span class="badge" [class]="'badge-' + item()?.status?.toLowerCase()">{{ item()?.status }}</span></p></div>
          <div class="info-section"><h3>Observações</h3><p>{{ item()?.notes || '—' }}</p></div>
        </div>
        <div class="status-actions">
          @if (canConfirm()) {
            <button class="btn btn-confirm" (click)="changeStatus('CONFIRMADO')" [disabled]="updating()">
              <span class="material-icons">check_circle</span> Confirmar
            </button>
          }
          @if (canFinalize()) {
            <button class="btn btn-finalize" (click)="changeStatus('CONCLUIDO')" [disabled]="updating()">
              <span class="material-icons">flag</span> Finalizar
            </button>
          }
          @if (canCancel()) {
            <button class="btn btn-cancel" (click)="changeStatus('CANCELADO')" [disabled]="updating()">
              <span class="material-icons">cancel</span> Cancelar
            </button>
          }
          @if (item()?.status === 'CONCLUIDO') {
            <p class="terminal-note">Agendamento finalizado — nenhuma ação pendente.</p>
          }
        </div>
      </div></div> }
    </div>
  `,
  styles: [`.page { max-width: 900px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .actions { display: flex; gap: 8px; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 24px; } .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; } .info-section h3 { font-size: 14px; font-weight: 600; color: var(--primary); margin: 0 0 8px; text-transform: uppercase; } .info-section p { margin: 4px 0; font-size: 14px; color: var(--gray-700); white-space: pre-wrap; } .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; } .badge-pendente { background: #FEF3C7; color: #92400E; } .badge-confirmado { background: #D1FAE5; color: #065F46; } .badge-cancelado { background: #FEE2E2; color: #991B1B; } .badge-concluido { background: #DBEAFE; color: #1E40AF; } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn:disabled { opacity: 0.5; cursor: not-allowed; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); } .btn-confirm { background: #059669; color: white; } .btn-finalize { background: #2563EB; color: white; } .btn-cancel { background: #DC2626; color: white; } .status-actions { display: flex; gap: 8px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-200); align-items: center; } .terminal-note { margin: 0; font-size: 13px; color: var(--gray-500); }`]
})
export class AgendaDetailComponent implements OnInit {
  private service = inject(AgendaService);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  id = ''; item = signal<any>(null); updating = signal(false);

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.load();
  }

  load() {
    this.service.get(this.id).subscribe((res: any) => this.item.set(res));
  }

  canConfirm() {
    const s = this.item()?.status;
    return s === 'PENDENTE' || s === 'CANCELADO';
  }

  canFinalize() {
    return this.item()?.status === 'CONFIRMADO';
  }

  canCancel() {
    const s = this.item()?.status;
    return s === 'PENDENTE' || s === 'CONFIRMADO';
  }

  changeStatus(status: string) {
    this.updating.set(true);
    this.api.put(`/appointments/${this.id}/status`, { status }).subscribe({
      next: (res: any) => {
        this.item.set(res);
        this.updating.set(false);
        this.toast.success(`Agendamento ${status === 'CONFIRMADO' ? 'confirmado' : status === 'CANCELADO' ? 'cancelado' : 'finalizado'} com sucesso`);
      },
      error: (err: any) => {
        this.updating.set(false);
        this.toast.error(err?.error?.error || 'Erro ao atualizar status');
      }
    });
  }
}
