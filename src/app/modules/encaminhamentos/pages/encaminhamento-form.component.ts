import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EncaminhamentoService } from '../services/encaminhamento.service';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-encaminhamento-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="header"><div><h1>{{ isEdit ? 'Editar' : 'Novo' }} Encaminhamento</h1><p class="subtitle">Encaminhe o paciente para outro profissional</p></div><a routerLink="/app/encaminhamentos" class="btn btn-outline"><span class="material-icons">arrow_back</span></a></div>
      <div class="card"><div class="card-body">
        <div class="form-grid">
          <div class="form-group"><label>Paciente *</label><select class="form-control" [(ngModel)]="form.pacienteId" (change)="loadRecords()"><option value="">Selecione</option>@for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.name }}</option> }</select></div>
          <div class="form-group"><label>De</label><input class="form-control" [value]="getCurrentUserName()" disabled></div>
          <div class="form-group full"><label>Para (profissional)</label><select class="form-control" [(ngModel)]="form.paraUserId"><option value="">Selecione o profissional</option>@for (m of members(); track m.id) { <option [value]="m.id">{{ m.name }} ({{ m.role }})</option> }</select></div>
          <div class="form-group full"><label>Motivo *</label><textarea class="form-control" rows="3" [(ngModel)]="form.motivo" placeholder="Descreva o motivo do encaminhamento"></textarea></div>
          <div class="form-group full"><label>Resposta</label><textarea class="form-control" rows="2" [(ngModel)]="form.resposta" placeholder="Resposta do profissional (opcional)"></textarea></div>
          @if (isEdit || editingId()) {
            <div class="form-group"><label>Status</label><select class="form-control" [(ngModel)]="form.status"><option value="PENDENTE">Pendente</option><option value="ACEITO">Aceito</option><option value="CONCLUIDO">Concluído</option></select></div>
          }
        </div>
        <div class="form-actions"><a routerLink="/app/encaminhamentos" class="btn btn-outline">Cancelar</a><button class="btn btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Salvando...' : 'Salvar' }}</button></div>
      </div></div>
      <div class="card" style="margin-top:20px"><div class="card-body">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>
            <h3 style="margin:0;font-size:16px">Registros Anteriores</h3>
            <p style="margin:2px 0 0;font-size:12px;color:var(--gray-500)">{{ records().length }} encaminhamento(s) de {{ getPatientName() }}</p>
          </div>
          @if (editingId()) {
            <button class="btn btn-outline" (click)="resetForm()"><span class="material-icons" style="font-size:16px">add</span> Novo encaminhamento</button>
          }
        </div>
        @if (records().length === 0) {
          <div style="text-align:center;padding:24px;color:var(--gray-400)"><span class="material-icons" style="font-size:40px">history</span><p style="margin:8px 0 0">Nenhum encaminhamento para este paciente</p></div>
        } @else {
          <div style="display:flex;flex-direction:column;gap:8px">
            @for (r of records(); track r.id) {
              <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--gray-200);border-radius:var(--radius)">
                <div style="flex:1;min-width:0">
                  <div style="display:flex;gap:8px;align-items:center">
                    <strong style="font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ r.motivo }}</strong>
                    <span style="padding:2px 8px;border-radius:12px;font-size:11px;font-weight:500;{{ statusColor(r.status) }}">{{ r.status }}</span>
                  </div>
                  <p style="margin:4px 0 0;font-size:12px;color:var(--gray-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ r.createdAt | date:'dd/MM/yyyy' }} · {{ r.deUser?.name || '—' }} → {{ r.paraUser?.name || '—' }}</p>
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
  styles: [`.page { max-width: 900px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 24px; } .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } .form-group { display: flex; flex-direction: column; gap: 4px; } .form-group label { font-size: 13px; font-weight: 500; color: var(--gray-700); } .full { grid-column: 1 / -1; } .form-control { padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px; width: 100%; box-sizing: border-box; } textarea.form-control { resize: vertical; } .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-200); } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); } select.form-control { appearance: auto; }`]
})
export class EncaminhamentoFormComponent implements OnInit {
  private service = inject(EncaminhamentoService);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  isEdit = false;
  id = '';
  saving = signal(false);
  pacientes = signal<any[]>([]);
  members = signal<any[]>([]);
  records = signal<any[]>([]);
  editingId = signal('');

  form: any = { pacienteId: '', deUserId: '', paraUserId: '', motivo: '', resposta: '', status: 'PENDENTE' };

  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.id;
    this.form.deUserId = this.auth.user()?.id || '';
    this.api.get('/pacientes').subscribe((res: any) => this.pacientes.set(res.data));
    this.api.get('/users/members').subscribe((res: any) => this.members.set(res.data || []));
    if (this.isEdit) this.service.get(this.id).subscribe((res: any) => this.form = res);
  }

  getCurrentUserName(): string {
    return this.auth.user()?.name || '—';
  }

  getPatientName(): string {
    const p = this.pacientes().find(p => p.id === this.form.pacienteId);
    return p?.name || '-';
  }

  statusColor(status: string): string {
    const map: any = { PENDENTE: 'background:#FEF3C7;color:#92400E', ACEITO: 'background:#D1FAE5;color:#065F46', CONCLUIDO: 'background:#DBEAFE;color:#1E40AF' };
    return map[status] || 'background:#F1F5F9;color:#475569';
  }

  loadRecords() {
    if (!this.form.pacienteId) { this.records.set([]); return; }
    this.service.list({ pacienteId: this.form.pacienteId }).subscribe((res: any) => this.records.set(res.data || []));
  }

  editRecord(r: any) {
    this.editingId.set(r.id);
    this.form = { pacienteId: r.pacienteId || '', deUserId: r.deUserId || '', paraUserId: r.paraUserId || '', motivo: r.motivo || '', resposta: r.resposta || '', status: r.status || 'PENDENTE' };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm() {
    this.editingId.set('');
    this.form = { pacienteId: this.form.pacienteId, deUserId: this.auth.user()?.id || '', paraUserId: '', motivo: '', resposta: '', status: 'PENDENTE' };
  }

  deleteRecord(r: any) {
    if (!confirm(`Excluir o encaminhamento de ${r.createdAt ? new Date(r.createdAt).toLocaleDateString('pt-BR') : '—'}?`)) return;
    this.service.delete(r.id).subscribe({
      next: () => { this.toast.success('Encaminhamento excluído'); this.loadRecords(); },
      error: () => this.toast.error('Erro ao excluir encaminhamento')
    });
  }

  save() {
    if (!this.form.pacienteId) return this.toast.warning('Selecione um paciente');
    if (!this.form.motivo) return this.toast.warning('Preencha o motivo');
    this.saving.set(true);
    const payload = { ...this.form, paraUserId: this.form.paraUserId || null };
    const obs = this.editingId() ? this.service.update(this.editingId(), payload) : this.isEdit ? this.service.update(this.id, payload) : this.service.create(payload);
    obs.subscribe({
      next: () => { this.saving.set(false); this.toast.success('Encaminhamento salvo'); this.resetForm(); this.loadRecords(); },
      error: () => { this.saving.set(false); this.toast.error('Erro ao salvar'); }
    });
  }
}