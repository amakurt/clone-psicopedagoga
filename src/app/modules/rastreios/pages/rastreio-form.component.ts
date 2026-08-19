import { Component, inject, signal, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { RastreioService } from '../services/rastreio.service';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/components/toast.component';

Chart.register(...registerables);

@Component({
  selector: 'app-rastreio-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="header">
        <div><h1>{{ editingId() ? 'Editar' : 'Novo' }} Rastreio</h1><p class="subtitle">Triagem com correção automática e interpretação clínica</p></div>
        <a routerLink="/app/rastreios" class="btn btn-outline"><span class="material-icons">arrow_back</span></a>
      </div>

      <div class="card"><div class="card-body">
        <div class="form-grid">
          <div class="form-group"><label>Paciente *</label><select class="form-control" [(ngModel)]="form.pacienteId" (change)="onPatientChange()"><option value="">Selecione</option>@for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.name }}</option> }</select></div>
          <div class="form-group"><label>Instrumento *</label><select class="form-control" [(ngModel)]="form.instrument" (change)="onInstrumentChange()"><option value="">Selecione</option>@for (i of instruments(); track i.code) { <option [value]="i.code">{{ i.name }}</option> }</select></div>
          <div class="form-group"><label>Informante</label><select class="form-control" [(ngModel)]="form.respondent"><option value="">Selecione</option><option value="PAIS">Pais / responsáveis</option><option value="PROFESSOR">Professor</option><option value="AUTO">Autoavaliação</option><option value="PROFISSIONAL">Profissional</option></select></div>
          <div class="form-group"><label>Data da aplicação</label><input type="date" class="form-control" [(ngModel)]="form.assessedAt"></div>
        </div>

        @if (def()) {
          <div style="margin-top:20px;padding:12px 16px;background:var(--gray-50);border-radius:var(--radius);border:1px solid var(--gray-200)">
            <strong style="font-size:14px">{{ def()!.name }}</strong>
            <p style="margin:4px 0 0;font-size:12px;color:var(--gray-600)">{{ def()!.description }}</p>
            <p style="margin:2px 0 0;font-size:11px;color:var(--gray-500)">Público-alvo: {{ def()!.target }} · {{ def()!.items.length }} itens</p>
          </div>
        }

        @if (def()) {
          @for (dim of def()!.dimensions || []; track dim.id) {
            <div class="dimension">
              <h3>{{ dim.label }}</h3>
              @for (item of itemsByDimension(dim.id); track item.id) {
                <div class="item-row">
                  <span class="item-text">{{ item.text }}</span>
                  <div class="options">
                    @for (opt of def()!.options; track opt.value) {
                      <button type="button" class="opt" [class.active]="answers()[item.id] === opt.value" (click)="setAnswer(item.id, opt.value)">{{ opt.label }}</button>
                    }
                  </div>
                </div>
              }
            </div>
          }
          @if (!def()!.dimensions) {
            <div class="dimension">
              @for (item of def()!.items; track item.id) {
                <div class="item-row">
                  <span class="item-text">{{ item.text }}@if (item.critical) { <span class="critical" title="Item crítico">*</span> }</span>
                  <div class="options">
                    @for (opt of def()!.options; track opt.value) {
                      <button type="button" class="opt" [class.active]="answers()[item.id] === opt.value" (click)="setAnswer(item.id, opt.value)">{{ opt.label }}</button>
                    }
                  </div>
                </div>
              }
            </div>
          }
        }

        @if (preview()) {
          <div class="preview" [style]="preview()!.style">
            <div style="display:flex;align-items:center;gap:10px">
              <span class="material-icons" style="font-size:22px">{{ preview()!.icon }}</span>
              <div>
                <strong style="font-size:14px">Risco {{ preview()!.riskLevel }}</strong>
                <p style="margin:2px 0 0;font-size:12px">{{ preview()!.summary }}</p>
              </div>
            </div>
          </div>
          @if (chartLabels().length > 1) {
            <div style="margin-top:16px">
              <p style="font-size:13px;font-weight:600;color:var(--gray-600);margin-bottom:8px">Perfil por dimensão</p>
              <div class="h-64"><canvas #radarChart></canvas></div>
            </div>
          }
        }

        <div class="form-actions">
          <button class="btn btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Salvando...' : 'Salvar rastreio' }}</button>
        </div>
      </div></div>

      <div class="card" style="margin-top:20px"><div class="card-body">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>
            <h3 style="margin:0;font-size:16px">Registros Anteriores</h3>
            <p style="margin:2px 0 0;font-size:12px;color:var(--gray-500)">{{ records().length }} rastreio(s) de {{ getPatientName() }}</p>
          </div>
          @if (editingId()) {
            <button class="btn btn-outline" (click)="resetForm()"><span class="material-icons" style="font-size:16px">add</span> Novo rastreio</button>
          }
        </div>
        @if (records().length === 0) {
          <div style="text-align:center;padding:24px;color:var(--gray-400)"><span class="material-icons" style="font-size:40px">fact_check</span><p style="margin:8px 0 0">Nenhum rastreio para este paciente</p></div>
        } @else {
          <div style="display:flex;flex-direction:column;gap:8px">
            @for (r of records(); track r.id) {
              <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--gray-200);border-radius:var(--radius)">
                <div style="flex:1;min-width:0">
                  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                    <strong style="font-size:14px">{{ instrumentName(r.instrument) }}</strong>
                    <span style="padding:2px 8px;border-radius:12px;font-size:11px;font-weight:500;{{ riskStyle(r.riskLevel) }}">{{ r.riskLevel }}</span>
                    <span style="font-size:12px;color:var(--gray-500)">{{ scoresTotal(r) }} pontos</span>
                  </div>
                  <p style="margin:4px 0 0;font-size:12px;color:var(--gray-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ r.assessedAt | date:'dd/MM/yyyy' }} · {{ r.summary }}</p>
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
  styles: [`
    .page { max-width: 900px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 24px; }
    .subtitle { color: var(--gray-500); font-size: 14px; margin: 4px 0 0; }
    .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); }
    .card-body { padding: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; }
    .form-group label { font-size: 13px; font-weight: 500; color: var(--gray-700); }
    .form-control { padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px; width: 100%; box-sizing: border-box; }
    select.form-control { appearance: auto; }
    .dimension { margin-top: 24px; }
    .dimension h3 { font-size: 15px; font-weight: 600; margin: 0 0 12px; color: var(--gray-800); }
    .item-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--gray-100); flex-wrap: wrap; }
    .item-text { flex: 1; min-width: 220px; font-size: 13.5px; color: var(--gray-700); }
    .critical { color: #DC2626; font-weight: 700; }
    .options { display: flex; gap: 6px; flex-wrap: wrap; }
    .opt { padding: 6px 12px; border: 1px solid var(--gray-300); border-radius: 8px; background: transparent; color: var(--gray-600); font-size: 12px; cursor: pointer; }
    .opt.active { background: var(--primary); border-color: var(--primary); color: white; font-weight: 500; }
    .preview { margin-top: 20px; padding: 14px 16px; border-radius: var(--radius); border: 1px solid var(--gray-200); }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-200); }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; }
    .btn-primary { background: var(--primary); color: white; }
    .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); }
    .h-64 { height: 260px; }
  `]
})
export class RastreioFormComponent implements OnInit {
  @ViewChild('radarChart') radarChartRef!: ElementRef<HTMLCanvasElement>;

  private service = inject(RastreioService);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  saving = signal(false);
  pacientes = signal<any[]>([]);
  instruments = signal<any[]>([]);
  def = signal<any>(null);
  answers = signal<Record<string, string>>({});
  records = signal<any[]>([]);
  editingId = signal('');
  preview = signal<any>(null);
  chartLabels = signal<string[]>([]);
  chartValues = signal<number[]>([]);

  form: any = { pacienteId: '', instrument: '', respondent: '', assessedAt: '', notes: '' };
  private chart: Chart | null = null;

  ngOnInit() {
    const stored = sessionStorage.getItem('rastreio_edit');
    if (stored) {
      sessionStorage.removeItem('rastreio_edit');
      try {
        const r = JSON.parse(stored);
        this.editingId.set(r.id);
        this.form = {
          pacienteId: r.pacienteId || '',
          instrument: r.instrument || '',
          respondent: r.respondent || '',
          assessedAt: r.assessedAt ? new Date(r.assessedAt).toISOString().slice(0, 10) : '',
          notes: r.notes || '',
        };
        this.answers.set(JSON.parse(r.answers || '{}'));
      } catch { /* ignore */ }
    }
    this.api.get('/pacientes').subscribe((res: any) => this.pacientes.set(res.data));
    this.service.instruments().subscribe((res: any) => this.instruments.set(res.data || []));
    if (this.editingId()) this.onInstrumentChange();
    else this.onPatientChange();
  }

  getPatientName(): string {
    const p = this.pacientes().find(p => p.id === this.form.pacienteId);
    return p?.name || '-';
  }

  instrumentName(code: string): string {
    return this.instruments().find(i => i.code === code)?.name || code;
  }

  itemsByDimension(dimId: string) {
    return (this.def()?.items || []).filter((it: any) => it.dimension === dimId);
  }

  onPatientChange() {
    this.loadRecords();
  }

  onInstrumentChange() {
    if (!this.form.instrument) { this.def.set(null); return; }
    this.service.instrumentDef(this.form.instrument).subscribe({
      next: (res: any) => {
        this.def.set(res);
        if (!this.editingId()) {
          const keys = new Set(res.items.map((it: any) => it.id));
          const kept: Record<string, string> = {};
          for (const [k, v] of Object.entries(this.answers())) if (keys.has(k)) kept[k] = v as string;
          this.answers.set(kept);
        }
        this.computePreview();
      },
      error: () => this.toast.error('Erro ao carregar instrumento')
    });
  }

  setAnswer(itemId: string, value: string) {
    this.answers.update(a => ({ ...a, [itemId]: value }));
    this.computePreview();
  }

  answeredCount(): number {
    return Object.values(this.answers()).filter(v => v !== undefined && v !== null && v !== '').length;
  }

  computePreview() {
    const def = this.def();
    const ans = this.answers();
    if (!def || this.answeredCount() === 0) { this.preview.set(null); this.chartLabels.set([]); return; }
    const code = def.code;
    let result: { riskLevel: string; summary: string; icon: string; style: string } | null = null;

    if (code === 'MCHAT_R') {
      let fails = 0, criticalFails = 0;
      for (const it of def.items) {
        const a = ans[it.id];
        if (!a) continue;
        const failed = it.reverse ? a === 'sim' : a === 'nao';
        if (failed) { fails++; if (it.critical) criticalFails++; }
      }
      const risk = fails >= 8 ? 'ALTO' : fails >= 3 ? 'MODERADO' : 'BAIXO';
      result = {
        riskLevel: risk,
        summary: risk === 'ALTO'
          ? `${fails} itens com falha (${criticalFails} críticos) — encaminhar para avaliação diagnóstica especializada.`
          : risk === 'MODERADO'
            ? `${fails} itens com falha (${criticalFails} críticos) — aplicar Entrevista de Seguimento (M-CHAT-R/F).`
            : `${fails} itens com falha — manter monitoramento do desenvolvimento.`,
        icon: 'fact_check',
        style: '',
      };
    } else if (code === 'SNAP_IV') {
      const dims: any = {};
      for (const d of def.dimensions) {
        const items = def.items.filter((it: any) => it.dimension === d.id);
        let score = 0, count = 0;
        for (const it of items) { const v = parseInt(ans[it.id] ?? '0', 10) || 0; score += v; if (v >= 2) count++; }
        dims[d.id] = { score, max: items.length * 3, count, mean: Math.round((score / items.length) * 100) / 100 };
      }
      const maxC = Math.max(dims.desatencao.count, dims.hiperatividade.count);
      const risk = maxC >= 6 ? 'ELEVADO' : maxC >= 3 ? 'MODERADO' : 'BAIXO';
      result = {
        riskLevel: risk,
        summary: `${dims.desatencao.count} sintomas de desatenção · ${dims.hiperatividade.count} de hiperatividade/impulsividade.${risk === 'ELEVADO' ? ' Sugestivo de TDAH — avaliação diagnóstica recomendada.' : risk === 'MODERADO' ? ' Monitorar e considerar avaliação complementar.' : ''}`,
        icon: 'psychology',
        style: '',
      };
      this.chartLabels.set(def.dimensions.map((d: any) => d.label));
      this.chartValues.set(def.dimensions.map((d: any) => Math.round((dims[d.id].score / dims[d.id].max) * 100)));
    } else if (code === 'ATA') {
      let total = 0;
      for (const it of def.items) total += parseInt(ans[it.id] ?? '0', 10) || 0;
      const risk = total >= 15 ? 'ELEVADO' : total >= 8 ? 'MODERADO' : 'BAIXO';
      result = {
        riskLevel: risk,
        summary: `Pontuação ${total}/46.${risk === 'ELEVADO' ? ' Risco de traços autísticos — encaminhar para avaliação diagnóstica.' : risk === 'MODERADO' ? ' Indicadores moderados — manter acompanhamento.' : ' Sem indicadores significativos.'}`,
        icon: 'fact_check',
        style: '',
      };
    } else if (code === 'ASRS_18') {
      let partA = 0, partB = 0;
      for (const it of def.items) {
        const v = parseInt(ans[it.id] ?? '0', 10) || 0;
        if (it.dimension === 'parteA') partA += v; else partB += v;
      }
      const risk = partA >= 14 || partB >= 15 ? 'ELEVADO' : partA >= 9 || partB >= 10 ? 'MODERADO' : 'BAIXO';
      result = {
        riskLevel: risk,
        summary: `Parte A ${partA}/24 · Parte B ${partB}/48.${risk === 'ELEVADO' ? ' Sugestivo de TDAH no adulto — avaliação diagnóstica recomendada.' : risk === 'MODERADO' ? ' Indicadores parciais — monitorar.' : ''}`,
        icon: 'psychology',
        style: '',
      };
      this.chartLabels.set(['Parte A', 'Parte B']);
      this.chartValues.set([Math.round((partA / 24) * 100), Math.round((partB / 48) * 100)]);
    } else if (code === 'HABILIDADES_SOCIAIS') {
      const dims: any = {};
      let total = 0, max = 0;
      for (const d of def.dimensions) {
        const items = def.items.filter((it: any) => it.dimension === d.id);
        let score = 0;
        for (const it of items) score += parseInt(ans[it.id] ?? '0', 10) || 0;
        const m = items.length * 4;
        dims[d.id] = { score, max: m, pct: Math.round((score / m) * 100) };
        total += score; max += m;
      }
      const overall = Math.round((total / max) * 100);
      const weakest = [...def.dimensions].sort((a: any, b: any) => dims[a.id].pct - dims[b.id].pct)[0];
      const risk = overall >= 75 ? 'BAIXO' : overall >= 50 ? 'MODERADO' : 'ELEVADO';
      result = {
        riskLevel: risk,
        summary: `Repertório geral ${overall}% — menor índice em ${dims[weakest.id]?.label ?? '—'} (${dims[weakest.id]?.pct ?? 0}%).${risk === 'ELEVADO' ? ' Intervenção estruturada recomendada.' : risk === 'MODERADO' ? ' Estimulação direcionada recomendada.' : ''}`,
        icon: 'groups',
        style: '',
      };
      this.chartLabels.set(def.dimensions.map((d: any) => d.label));
      this.chartValues.set(def.dimensions.map((d: any) => dims[d.id].pct));
    }

    if (result) {
      result.style = this.riskStyle(result.riskLevel);
      this.preview.set(result);
      setTimeout(() => this.updateChart(), 100);
    } else {
      this.preview.set(null);
    }
  }

  riskStyle(risk: string): string {
    const map: any = {
      BAIXO: 'background:#D1FAE5;color:#065F46',
      MODERADO: 'background:#FEF3C7;color:#92400E',
      ELEVADO: 'background:#FEE2E2;color:#991B1B',
      ALTO: 'background:#FECACA;color:#7F1D1D',
    };
    return map[risk] || 'background:#F1F5F9;color:#475569';
  }

  updateChart() {
    if (this.chart) { this.chart.destroy(); this.chart = null; }
    const el = this.radarChartRef?.nativeElement;
    if (!el) return;
    const labels = this.chartLabels();
    const values = this.chartValues();
    if (labels.length < 2) return;
    this.chart = new Chart(el, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Perfil',
          data: values,
          backgroundColor: 'rgba(0, 127, 128, 0.15)',
          borderColor: '#007F80',
          pointBackgroundColor: '#007F80',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { r: { min: 0, max: 100, ticks: { stepSize: 20 } } },
      },
    });
  }

  loadRecords() {
    if (!this.form.pacienteId) { this.records.set([]); return; }
    this.service.list({ pacienteId: this.form.pacienteId }).subscribe((res: any) => this.records.set(res.data || []));
  }

  scoresTotal(r: any): string {
    try { return String(JSON.parse(r.scores || '{}').total ?? '—'); } catch { return '—'; }
  }

  editRecord(r: any) {
    this.editingId.set(r.id);
    this.form = { pacienteId: r.pacienteId || '', instrument: r.instrument || '', respondent: r.respondent || '', assessedAt: r.assessedAt ? new Date(r.assessedAt).toISOString().slice(0, 10) : '', notes: r.notes || '' };
    this.answers.set(JSON.parse(r.answers || '{}'));
    this.onInstrumentChange();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm() {
    this.editingId.set('');
    this.answers.set({});
    this.preview.set(null);
    this.chartLabels.set([]);
    this.chartValues.set([]);
    this.form = { pacienteId: this.form.pacienteId, instrument: '', respondent: '', assessedAt: '', notes: '' };
    this.def.set(null);
  }

  deleteRecord(r: any) {
    if (!confirm(`Excluir o rastreio de ${new Date(r.assessedAt).toLocaleDateString('pt-BR')}?`)) return;
    this.service.delete(r.id).subscribe({
      next: () => { this.toast.success('Rastreio excluído'); this.loadRecords(); },
      error: () => this.toast.error('Erro ao excluir rastreio')
    });
  }

  save() {
    if (!this.form.pacienteId) return this.toast.warning('Selecione um paciente');
    if (!this.form.instrument) return this.toast.warning('Selecione um instrumento');
    const answered = this.answeredCount();
    if (answered === 0) return this.toast.warning('Responda pelo menos um item');
    if (answered < (this.def()?.items.length || 0)) {
      if (!confirm(`Apenas ${answered} de ${this.def()!.items.length} itens respondidos. Salvar mesmo assim?`)) return;
    }
    this.saving.set(true);
    const payload = {
      pacienteId: this.form.pacienteId,
      instrument: this.form.instrument,
      respondent: this.form.respondent || null,
      assessedAt: this.form.assessedAt ? new Date(this.form.assessedAt).toISOString() : new Date().toISOString(),
      answers: this.answers(),
      notes: this.form.notes || null,
    };
    const obs = this.editingId() ? this.service.update(this.editingId(), payload) : this.service.create(payload);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Rastreio salvo');
        this.resetForm();
        this.loadRecords();
      },
      error: () => { this.saving.set(false); this.toast.error('Erro ao salvar rastreio'); }
    });
  }
}