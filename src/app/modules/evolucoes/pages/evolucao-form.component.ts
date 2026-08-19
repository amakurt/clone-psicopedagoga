import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EvolucoesService } from '../services/evolucoes.service';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-evolucao-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="header"><div><h1>{{ isEdit ? 'Editar' : 'Nova' }} Evolução</h1></div><a routerLink="/app/evolucoes" class="btn btn-outline"><span class="material-icons">arrow_back</span></a></div>
      <div class="card"><div class="card-body">
        <div class="form-grid">
          <div class="form-group"><label>Paciente *</label><select class="form-control" [(ngModel)]="form.pacienteId" (change)="loadRecords()"><option value="">Selecione</option>@for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.name }}</option> }</select></div>
          <div class="form-group"><label>Data *</label><input class="form-control" type="date" [(ngModel)]="form.date"></div>
          <div class="form-group full"><label>Resumo *</label><textarea class="form-control" rows="3" [(ngModel)]="form.summary"></textarea></div>
          <div class="form-group full"><label>Atividades Realizadas</label><textarea class="form-control" rows="3" [(ngModel)]="form.activities"></textarea></div>
          <div class="form-group full"><label>Observações</label><textarea class="form-control" rows="3" [(ngModel)]="form.observations"></textarea></div>
          <div class="form-group full"><label>Evolução Clínica</label><textarea class="form-control" rows="3" [(ngModel)]="form.clinicalEvolution"></textarea></div>
          <div class="form-group full"><label>Conduta</label><textarea class="form-control" rows="3" [(ngModel)]="form.conduct"></textarea></div>
          <div class="form-group full"><label>Métricas da Sessão</label><div class="metric-grid">
            @for (m of metrics; track m.key) {
              <div class="metric-item">
                <span class="metric-label">{{ m.label }}</span>
                <div class="star-input">
                  @for (s of [1,2,3,4,5]; track s) {
                    <span class="material-icons star" [class.active]="s <= (form[m.key] || 0)" (click)="setRating(m.key, s)">star</span>
                  }
                </div>
              </div>
            }
          </div></div>
        </div>
        <div class="form-actions"><a routerLink="/app/evolucoes" class="btn btn-outline">Cancelar</a><button class="btn btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Salvando...' : 'Salvar' }}</button></div>
      </div></div>
      <div class="card" style="margin-top:20px"><div class="card-body">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>
            <h3 style="margin:0;font-size:16px">Registros Anteriores</h3>
            <p style="margin:2px 0 0;font-size:12px;color:var(--gray-500)">{{ records().length }} registro(s) de {{ getPatientName() }}</p>
          </div>
          @if (editingId()) {
            <button class="btn btn-outline" (click)="resetForm()"><span class="material-icons" style="font-size:16px">add</span> Novo registro</button>
          }
        </div>
        @if (records().length === 0) {
          <div class="empty" style="text-align:center;padding:24px;color:var(--gray-400)"><span class="material-icons" style="font-size:40px">history</span><p style="margin:8px 0 0">Nenhuma evolução para este paciente</p></div>
        } @else {
          <div style="display:flex;flex-direction:column;gap:8px">
            @for (r of records(); track r.id) {
              <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--gray-200);border-radius:var(--radius);background:var(--card-bg)">
                <div style="flex:1;min-width:0">
                  <div style="display:flex;gap:8px;align-items:center">
                    <strong style="font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ r.summary }}</strong>
                    <span class="badge" style="padding:2px 8px;border-radius:12px;font-size:11px;background:{{ ratingColor(r) }}">{{ ratingLabel(r) }}</span>
                  </div>
                  <p style="margin:4px 0 0;font-size:12px;color:var(--gray-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ r.date }} · {{ r.professionalName || '—' }} · {{ r.activities || '' }}</p>
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
  styles: [`.page { max-width: 900px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; } .header h1 { margin: 0; font-size: 24px; } .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); } .card-body { padding: 24px; } .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } .form-group { display: flex; flex-direction: column; gap: 4px; } .form-group label { font-size: 13px; font-weight: 500; color: var(--gray-700); } .full { grid-column: 1 / -1; } .form-control { padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px; width: 100%; box-sizing: border-box; } textarea.form-control { resize: vertical; } .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-200); } .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; } .btn-primary { background: var(--primary); color: white; } .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); } select.form-control { appearance: auto; } .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; } .metric-item { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px; border: 1px solid var(--gray-200); border-radius: var(--radius); } .metric-label { font-size: 12px; font-weight: 600; color: var(--gray-700); text-transform: uppercase; letter-spacing: .5px; } .star-input { display: flex; gap: 2px; } .star { cursor: pointer; font-size: 22px; color: var(--gray-300); transition: transform .1s, color .1s; user-select: none; } .star:hover { transform: scale(1.2); } .star.active { color: #F59E0B; }`]
})
export class EvolucaoFormComponent implements OnInit {
  private service = inject(EvolucoesService); private api = inject(ApiService); private route = inject(ActivatedRoute); private toast = inject(ToastService);
  isEdit = false; id = ''; saving = signal(false); pacientes = signal<any[]>([]); records = signal<any[]>([]); editingId = signal('');
  form: any = { pacienteId: '', date: '', summary: '', activities: '', observations: '', clinicalEvolution: '', conduct: '', focus: 0, engagement: 0, skillProgress: 0, behavior: 0 };
  metrics = [
    { key: 'focus', label: 'Foco' },
    { key: 'engagement', label: 'Engajamento' },
    { key: 'skillProgress', label: 'Progresso' },
    { key: 'behavior', label: 'Comportamento' }
  ];
  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || ''; this.isEdit = !!this.id;
    this.api.get('/pacientes').subscribe((res: any) => this.pacientes.set(res.data));
    if (this.isEdit) this.service.get(this.id).subscribe((res: any) => this.form = {
      pacienteId: res.pacienteId || '', date: res.date ? String(res.date).slice(0, 10) : '',
      summary: res.summary || '', activities: res.activities || '', observations: res.observations || '',
      clinicalEvolution: res.clinicalEvolution || '', conduct: res.conduct || '',
      focus: res.focus || 0, engagement: res.engagement || 0, skillProgress: res.skillProgress || 0, behavior: res.behavior || 0
    });
  }
  setRating(key: string, value: number) { this.form[key] = this.form[key] === value ? 0 : value; }
  getPatientName(): string { const p = this.pacientes().find(p => p.id === this.form.pacienteId); return p?.name || '-'; }
  ratingLabel(r: any): string { const vals = [r.focus, r.engagement, r.skillProgress, r.behavior].filter(v => v); return vals.length ? vals.join('·') + ' ★' : 'sem métricas'; }
  ratingColor(r: any): string { const vals = [r.focus, r.engagement, r.skillProgress, r.behavior].filter(v => v); if (!vals.length) return '#F1F5F9'; const avg = vals.reduce((a, b) => a + b, 0) / vals.length; return avg >= 4 ? '#D1FAE5' : avg >= 3 ? '#FEF3C7' : '#FEE2E2'; }
  loadRecords() {
    if (!this.form.pacienteId) { this.records.set([]); return; }
    this.api.get('/session-records', { pacienteId: this.form.pacienteId }).subscribe((res: any) => this.records.set(res.data || []));
  }
  editRecord(r: any) {
    this.editingId.set(r.id);
    this.form = {
      pacienteId: r.pacienteId || '', date: r.date ? String(r.date).slice(0, 10) : '',
      summary: r.summary || '', activities: r.activities || '', observations: r.observations || '',
      clinicalEvolution: r.clinicalEvolution || '', conduct: r.conduct || '',
      focus: r.focus || 0, engagement: r.engagement || 0, skillProgress: r.skillProgress || 0, behavior: r.behavior || 0
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  resetForm() {
    this.editingId.set('');
    this.form = { pacienteId: this.form.pacienteId, date: '', summary: '', activities: '', observations: '', clinicalEvolution: '', conduct: '', focus: 0, engagement: 0, skillProgress: 0, behavior: 0 };
  }
  deleteRecord(r: any) {
    if (!confirm(`Excluir a evolução de ${r.date}?`)) return;
    this.api.delete(`/session-records/${r.id}`).subscribe({
      next: () => { this.toast.success('Evolução excluída'); this.loadRecords(); },
      error: () => this.toast.error('Erro ao excluir evolução')
    });
  }
  save() {
    if (!this.form.pacienteId) return this.toast.warning('Selecione um paciente');
    this.saving.set(true);
    const obs = this.editingId() ? this.service.update(this.editingId(), this.form) : this.isEdit ? this.service.update(this.id, this.form) : this.service.create(this.form);
    obs.subscribe({
      next: () => { this.saving.set(false); this.toast.success('Evolução salva'); this.resetForm(); this.loadRecords(); },
      error: () => { this.saving.set(false); this.toast.error('Erro ao salvar'); }
    });
  }
}
