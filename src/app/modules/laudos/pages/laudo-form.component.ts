import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LaudoService } from '../services/laudo.service';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { SignatureModalComponent } from '@shared/components/signature-modal.component';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-laudo-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SignatureModalComponent],
  template: `
    <div class="max-w-[900px] legacy-page">
      <div class="flex justify-between items-start mb-5">
        <div>
          <h1 class="text-2xl font-bold m-0">{{ isEdit ? 'Editar' : 'Novo' }} Laudo</h1>
        </div>
        <a routerLink="/app/laudos" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 no-underline">
          <span class="material-icons text-[18px]">arrow_back</span>
          Voltar
        </a>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 legacy-card">
        <div class="p-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2 flex flex-col gap-1">
              <label class="text-xs font-semibold text-slate-600">Paciente *</label>
              <select class="px-3 py-2 border border-slate-300 rounded-lg text-sm w-full" [(ngModel)]="form.pacienteId" (change)="loadRecords()">
                <option value="">Selecione um paciente</option>
                @for (p of pacientes(); track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
            </div>
            <div class="col-span-2 flex flex-col gap-1">
              <label class="text-xs font-semibold text-slate-600">Título *</label>
              <input class="px-3 py-2 border border-slate-300 rounded-lg text-sm w-full" [(ngModel)]="form.titulo" placeholder="Ex: Laudo Psicopedagógico">
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-slate-600">Tipo</label>
              <select class="px-3 py-2 border border-slate-300 rounded-lg text-sm" [(ngModel)]="form.type">
                <option value="LAUDO">Laudo</option>
                <option value="PARECER">Parecer</option>
                <option value="RELATORIO">Relatório</option>
              </select>
            </div>
            @if (isEdit) {
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-slate-600">Status</label>
                <select class="px-3 py-2 border border-slate-300 rounded-lg text-sm" [(ngModel)]="form.status">
                  <option value="RASCUNHO">Rascunho</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="ASSINADO">Assinado</option>
                </select>
              </div>
            }
            <div class="col-span-2 flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold text-slate-600">Conteúdo *</label>
                <div class="flex items-center gap-2">
                  <button type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    [disabled]="!form.content || auditing()" (click)="auditDocument()">
                    <span class="material-icons text-[15px]">{{ auditing() ? 'hourglass_empty' : 'shield' }}</span>
                    {{ auditing() ? 'Auditing...' : 'Auditar LGPD' }}
                  </button>
                  <button type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    [disabled]="!form.pacienteId || generating()" (click)="generateDraft()">
                    <span class="material-icons text-[15px]">{{ generating() ? 'hourglass_empty' : 'auto_awesome' }}</span>
                    {{ generating() ? 'Gerando rascunho...' : 'Gerar rascunho com IA' }}
                  </button>
                </div>
              </div>
              <textarea class="px-3 py-2 border border-slate-300 rounded-lg text-sm w-full resize-y" rows="15" [(ngModel)]="form.content"></textarea>
            </div>

            @if (auditResult()) {
              <div class="col-span-2">
                <div class="rounded-xl border overflow-hidden"
                  [ngClass]="{ 'bg-red-50 border-red-200': auditResult().riskLevel === 'ALTO', 'bg-amber-50 border-amber-200': auditResult().riskLevel === 'MEDIO', 'bg-emerald-50 border-emerald-200': auditResult().riskLevel === 'BAIXO' }">
                  <div class="px-4 py-3 flex items-center justify-between"
                    [ngClass]="{ 'bg-red-100': auditResult().riskLevel === 'ALTO', 'bg-amber-100': auditResult().riskLevel === 'MEDIO', 'bg-emerald-100': auditResult().riskLevel === 'BAIXO' }">
                    <div class="flex items-center gap-2">
                      <span class="material-icons"
                        [ngClass]="{ 'text-red-600': auditResult().riskLevel === 'ALTO', 'text-amber-600': auditResult().riskLevel === 'MEDIO', 'text-emerald-600': auditResult().riskLevel === 'BAIXO' }">
                        {{ auditResult().riskLevel === 'ALTO' ? 'error' : auditResult().riskLevel === 'MEDIO' ? 'warning' : 'check_circle' }}
                      </span>
                      <span class="text-sm font-bold"
                        [ngClass]="{ 'text-red-800': auditResult().riskLevel === 'ALTO', 'text-amber-800': auditResult().riskLevel === 'MEDIO', 'text-emerald-800': auditResult().riskLevel === 'BAIXO' }">
                        Seguranca: {{ auditResult().score }}/100 — Risco {{ auditResult().riskLevel }}
                      </span>
                    </div>
                    <button class="p-1 hover:bg-white/50 rounded-lg" (click)="auditResult.set(null)">
                      <span class="material-icons text-sm">close</span>
                    </button>
                  </div>
                  <div class="p-4">
                    <p class="text-sm font-medium mb-3"
                      [ngClass]="{ 'text-red-700': auditResult().riskLevel === 'ALTO', 'text-amber-700': auditResult().riskLevel === 'MEDIO', 'text-emerald-700': auditResult().riskLevel === 'BAIXO' }">
                      {{ auditResult().summary }}
                    </p>
                    @if (auditResult().findings.length > 0) {
                      <div class="space-y-2">
                        @for (f of auditResult().findings; track $index) {
                          <div class="flex items-start gap-2 text-sm">
                            <span class="material-icons text-[16px] mt-0.5 shrink-0"
                              [ngClass]="{ 'text-red-500': f.severity === 'ALTO', 'text-amber-500': f.severity === 'MEDIO', 'text-slate-400': f.severity === 'BAIXO' }">
                              {{ f.severity === 'ALTO' ? 'error' : f.severity === 'MEDIO' ? 'warning' : 'info' }}
                            </span>
                            <div>
                              <span class="font-semibold text-slate-800">[{{ f.category }}]</span>
                              <span class="text-slate-700"> {{ f.message }}</span>
                              <p class="text-xs text-slate-500 mt-0.5 italic">{{ f.suggestion }}</p>
                            </div>
                          </div>
                        }
                      </div>
                    } @else {
                      <p class="text-sm text-emerald-600 flex items-center gap-1">
                        <span class="material-icons text-[16px]">check</span>
                        Nenhum problema encontrado. Documento seguro.
                      </p>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          @if (isEdit && form.status === 'ASSINADO') {
            <div class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div class="flex items-center gap-2 text-emerald-700">
                <span class="material-icons text-[20px]">verified</span>
                <span class="text-sm font-semibold">Assinado digitalmente</span>
              </div>
              @if (form.signatureImage) {
                <div class="mt-3 p-3 bg-white rounded-lg border border-emerald-200 inline-block">
                  <img [src]="form.signatureImage" alt="Assinatura" class="max-h-16">
                </div>
              }
            </div>
          }

          @if (isEdit && form.status !== 'ASSINADO') {
            <div class="mt-4 pt-4 border-t border-slate-200">
              <button type="button"
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-all"
                (click)="openSignatureModal()">
                <span class="material-icons text-[18px]">draw</span>
                Assinar Documento
              </button>
            </div>
          }

          <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200">
            <a routerLink="/app/laudos" class="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 no-underline">
              Cancelar
            </a>
            <button class="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              (click)="save()" [disabled]="saving()">
              <span class="material-icons text-[16px]">{{ saving() ? 'hourglass_empty' : 'save' }}</span>
              {{ saving() ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>

      <app-signature-modal
        [isOpen]="showSignatureModal()"
        title="Assinar Laudo"
        subtitle="Desenhe sua assinatura para validar o documento"
        (closed)="showSignatureModal.set(false)"
        (confirmed)="onSignatureConfirmed($event)">
      </app-signature-modal>
    </div>

    <div class="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 legacy-card">
      <div class="p-5 border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <span class="material-icons text-indigo-600">history</span>
          </div>
          <div>
            <h3 class="font-semibold text-slate-900">Registros Anteriores</h3>
            <p class="text-xs text-slate-500">{{ records().length }} laudo(s) de {{ getPatientName() }}</p>
          </div>
        </div>
        @if (editingId()) {
          <button class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors" (click)="resetForm()">
            <span class="material-icons text-[16px]">add</span> Novo laudo
          </button>
        }
      </div>
      @if (records().length === 0) {
        <div class="p-10 text-center">
          <span class="material-icons text-4xl text-slate-300">description</span>
          <p class="mt-3 text-sm font-semibold text-slate-500">Nenhum laudo para este paciente</p>
          <p class="text-xs text-slate-400 mt-1">Selecione um paciente para listar os laudos salvos</p>
        </div>
      } @else {
        <div class="divide-y divide-slate-100">
          @for (r of records(); track r.id) {
            <div class="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
              <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <span class="material-icons text-amber-600 text-lg">description</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-bold text-slate-900 truncate">{{ r.titulo || 'Sem título' }}</p>
                  <span class="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
                    [class]="r.status === 'FINALIZADO' ? 'bg-emerald-100 text-emerald-700' : r.status === 'ASSINADO' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'">{{ r.status }}</span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5 truncate">{{ r.createdAt | date:'dd/MM/yyyy' }} · {{ r.type }} · {{ r.autor?.name || '—' }}</p>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button class="p-2 hover:bg-slate-100 rounded-lg transition-all" title="Editar" (click)="editRecord(r)">
                  <span class="material-icons text-[18px] text-slate-500">edit</span>
                </button>
                <button class="p-2 hover:bg-red-50 rounded-lg transition-all" title="Excluir" (click)="deleteRecord(r)">
                  <span class="material-icons text-[18px] text-red-500">delete</span>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class LaudoFormComponent implements OnInit {
  private service = inject(LaudoService);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  isEdit = false;
  id = '';
  saving = signal(false);
  generating = signal(false);
  auditing = signal(false);
  auditResult = signal<any>(null);
  pacientes = signal<any[]>([]);
  records = signal<any[]>([]);
  editingId = signal('');
  showSignatureModal = signal(false);

  form: any = {
    pacienteId: '',
    titulo: '',
    content: '',
    type: 'LAUDO',
    status: 'RASCUNHO',
    signatureImage: null,
    signedAt: null
  };

  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.id;
    this.api.get('/pacientes').subscribe((res: any) => this.pacientes.set(res.data));
    if (this.isEdit) {
      this.service.get(this.id).subscribe((res: any) => this.form = res);
    }
  }

  getPatientName(): string {
    const p = this.pacientes().find(p => p.id === this.form.pacienteId);
    return p?.name || '-';
  }

  generateDraft() {
    if (!this.form.pacienteId) return this.toast.warning('Selecione um paciente');
    this.generating.set(true);
    this.api.post('/relatorios/generate-draft', { pacienteId: this.form.pacienteId, tipo: this.form.type || 'LAUDO' }).subscribe({
      next: (res: any) => {
        this.generating.set(false);
        this.form.titulo = res.title;
        this.form.content = res.content;
        this.toast.success('Rascunho gerado — revise antes de salvar');
      },
      error: () => { this.generating.set(false); this.toast.error('Erro ao gerar rascunho'); }
    });
  }

  loadRecords() {
    if (!this.form.pacienteId) { this.records.set([]); return; }
    this.api.get('/laudos', { pacienteId: this.form.pacienteId }).subscribe((res: any) => this.records.set(res.data || []));
  }

  editRecord(r: any) {
    this.editingId.set(r.id);
    this.form = { ...r };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm() {
    this.editingId.set('');
    this.form = {
      pacienteId: this.form.pacienteId,
      titulo: '',
      content: '',
      type: 'LAUDO',
      status: 'RASCUNHO',
      signatureImage: null,
      signedAt: null
    };
  }

  deleteRecord(r: any) {
    if (!confirm(`Excluir o laudo "${r.titulo}"?`)) return;
    this.api.delete(`/laudos/${r.id}`).subscribe({
      next: () => { this.toast.success('Laudo excluído'); this.loadRecords(); },
      error: () => this.toast.error('Erro ao excluir laudo')
    });
  }

  openSignatureModal() {
    this.showSignatureModal.set(true);
  }

  onSignatureConfirmed(signatureData: string) {
    this.form.signatureImage = signatureData;
    this.form.status = 'ASSINADO';
    this.form.signedAt = new Date().toISOString();
    this.showSignatureModal.set(false);
    this.save();
  }

  auditDocument() {
    if (!this.form.content) return this.toast.warning('Escreva o conteúdo antes de auditar');
    this.auditing.set(true);
    this.auditResult.set(null);
    this.api.post('/relatorios/audit-lgpd', { content: this.form.content, pacienteId: this.form.pacienteId }).subscribe({
      next: (res: any) => { this.auditing.set(false); this.auditResult.set(res); },
      error: () => { this.auditing.set(false); this.toast.error('Erro ao auditar documento'); }
    });
  }

  save() {
    if (!this.form.pacienteId || !this.form.titulo || !this.form.content) {
      return this.toast.warning('Preencha os campos obrigatórios');
    }
    this.saving.set(true);
    const payload = {
      ...this.form,
      signedAt: this.form.status === 'ASSINADO' ? (this.form.signedAt || new Date().toISOString()) : null
    };
    const obs = this.editingId() ? this.service.update(this.editingId(), payload) : this.isEdit ? this.service.update(this.id, payload) : this.service.create(payload);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Laudo salvo');
        this.resetForm();
        this.loadRecords();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erro ao salvar');
      }
    });
  }
}
