import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AgendaService } from '../services/agenda.service';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-agenda-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="header"><div><h1>{{ isEdit ? 'Editar' : 'Nova' }} Consulta</h1></div><a routerLink="/app/agenda" class="btn btn-outline"><span class="material-icons">arrow_back</span></a></div>
      <div class="card"><div class="card-body">
        <div class="form-grid">
          <div class="form-group"><label>Paciente *</label><select class="form-control" [(ngModel)]="form.pacienteId" (change)="loadRecords()"><option value="">Selecione</option>@for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.name }}</option> }</select></div>
          <div class="form-group"><label>Data *</label><input class="form-control" type="date" [(ngModel)]="form.date"></div>
          <div class="form-group"><label>Hora Início</label><input class="form-control" type="time" [(ngModel)]="form.startTime"></div>
          <div class="form-group"><label>Hora Fim</label><input class="form-control" type="time" [(ngModel)]="form.endTime"></div>
          <div class="form-group"><label>Tipo</label><input class="form-control" [(ngModel)]="form.type"></div>
          <div class="form-group full"><label>Observações</label><textarea class="form-control" rows="3" [(ngModel)]="form.notes"></textarea></div>
        </div>
        <div class="form-actions"><a routerLink="/app/agenda" class="btn btn-outline">Cancelar</a><button class="btn btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Salvando...' : 'Salvar' }}</button></div>
      </div></div>
      <div class="card" style="margin-top:20px"><div class="card-body">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>
            <h3 style="margin:0;font-size:16px">Registros Anteriores</h3>
            <p style="margin:2px 0 0;font-size:12px;color:var(--gray-500)">{{ records().length }} consulta(s) de {{ getPatientName() }}</p>
          </div>
          @if (editingId()) {
            <button class="btn btn-outline" (click)="resetForm()"><span class="material-icons" style="font-size:16px">add</span> Nova consulta</button>
          }
        </div>
        @if (records().length === 0) {
          <div style="text-align:center;padding:24px;color:var(--gray-400)"><span class="material-icons" style="font-size:40px">history</span><p style="margin:8px 0 0">Nenhuma consulta para este paciente</p></div>
        } @else {
          <div style="display:flex;flex-direction:column;gap:8px">
            @for (r of records(); track r.id) {
              <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--gray-200);border-radius:var(--radius)">
                <div style="flex:1;min-width:0">
                  <div style="display:flex;gap:8px;align-items:center">
                    <strong style="font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ r.date }} · {{ r.startTime }}–{{ r.endTime }}</strong>
                    <span style="padding:2px 8px;border-radius:12px;font-size:11px;font-weight:500;{{ statusColor(r.status) }}">{{ r.status }}</span>
                  </div>
                  <p style="margin:4px 0 0;font-size:12px;color:var(--gray-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ r.type }} · {{ r.notes || '—' }}</p>
                </div>
                <button class="btn btn-outline" style="padding:6px 10px" title="Editar" (click)="editRecord(r)"><span class="material-icons" style="font-size:16px">edit</span></button>
                <button class="btn btn-outline" style="padding:6px 10px;color:#DC2626;border-color:#FECACA" title="Excluir" (click)="deleteRecord(r)"><span class="material-icons" style="font-size:16px">delete</span></button>
              </div>
            }
          </div>
        }
      </div></div>
    </div>
  `,
  styles: [`.page { max-width: 900px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 24px; } .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } .form-group { display: flex; flex-direction: column; gap: 4px; } .form-group label { font-size: 13px; font-weight: 500; color: var(--gray-700); } .full { grid-column: 1 / -1; } .form-control { padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px; width: 100%; box-sizing: border-box; } textarea.form-control { resize: vertical; } .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-200); } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); } select.form-control { appearance: auto; }`]
})
export class AgendaFormComponent implements OnInit {
  private service = inject(AgendaService); private api = inject(ApiService); private route = inject(ActivatedRoute); private toast = inject(ToastService);
  isEdit = false; id = ''; saving = signal(false); pacientes = signal<any[]>([]); records = signal<any[]>([]); editingId = signal('');
  form: any = { pacienteId: '', date: '', startTime: '', endTime: '', type: '', notes: '' };
  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || ''; this.isEdit = !!this.id;
    this.api.get('/pacientes').subscribe((res: any) => this.pacientes.set(res.data));
    if (this.isEdit) this.service.get(this.id).subscribe((res: any) => this.form = res);
  }
  getPatientName(): string { const p = this.pacientes().find(p => p.id === this.form.pacienteId); return p?.name || '-'; }
  statusColor(status: string): string {
    const map: any = { PENDENTE: 'background:#FEF3C7;color:#92400E', CONFIRMADO: 'background:#DBEAFE;color:#1E40AF', CONCLUIDO: 'background:#D1FAE5;color:#065F46', CANCELADO: 'background:#FEE2E2;color:#991B1B' };
    return map[status] || 'background:#F1F5F9;color:#475569';
  }
  loadRecords() {
    if (!this.form.pacienteId) { this.records.set([]); return; }
    this.api.get('/appointments', { pacienteId: this.form.pacienteId }).subscribe((res: any) => this.records.set((res.data || []).sort((a: any, b: any) => (b.date + ' ' + b.startTime).localeCompare(a.date + ' ' + a.startTime))));
  }
  editRecord(r: any) {
    this.editingId.set(r.id);
    this.form = { pacienteId: r.pacienteId || '', date: r.date || '', startTime: r.startTime || '', endTime: r.endTime || '', type: r.type || '', notes: r.notes || '' };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  resetForm() {
    this.editingId.set('');
    this.form = { pacienteId: this.form.pacienteId, date: '', startTime: '', endTime: '', type: '', notes: '' };
  }
  deleteRecord(r: any) {
    if (!confirm(`Excluir a consulta de ${r.date} (${r.startTime})?`)) return;
    this.api.delete(`/appointments/${r.id}`).subscribe({
      next: () => { this.toast.success('Consulta excluída'); this.loadRecords(); },
      error: () => this.toast.error('Erro ao excluir consulta')
    });
  }
  save() {
    if (!this.form.pacienteId) return this.toast.warning('Selecione um paciente');
    this.saving.set(true);
    const obs = this.editingId() ? this.service.update(this.editingId(), this.form) : this.isEdit ? this.service.update(this.id, this.form) : this.service.create(this.form);
    obs.subscribe({
      next: () => { this.saving.set(false); this.toast.success('Consulta salva'); this.resetForm(); this.loadRecords(); },
      error: () => { this.saving.set(false); this.toast.error('Erro ao salvar'); }
    });
  }
}
