import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LaudoService } from '../services/laudo.service';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { SignatureModalComponent } from '@shared/components/signature-modal.component';
import { ToastService } from '@shared/components/toast.component';
import { ClinicalDocEditorComponent } from '@shared/components/clinical-doc-editor/clinical-doc-editor.component';

@Component({
  selector: 'app-laudo-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SignatureModalComponent, ClinicalDocEditorComponent],
  template: `
    <div class="max-w-[1050px] mx-auto space-y-6 animate-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <a routerLink="/app/laudos" class="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <span class="material-icons text-slate-500">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white">
              {{ isEdit ? 'Editar' : 'Novo' }} Documento Clínico
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Crie laudos, pareceres e relatórios com formatação oficial A4 e papel timbrado
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button type="button" (click)="resetForm()" *ngIf="editingId()"
            class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            Cancelar Edição
          </button>

          <button type="button" (click)="save()" [disabled]="saving() || !form.pacienteId || !form.titulo || !form.content"
            class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-bold text-sm disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95">
            <span class="material-icons text-[18px]">save</span>
            {{ saving() ? 'Salvando...' : 'Salvar Documento' }}
          </button>
        </div>
      </div>

      <!-- Settings & Metadata Card -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Paciente Selector -->
          <div class="sm:col-span-2 flex flex-col gap-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Paciente *</label>
            <select class="px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm w-full text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
              [(ngModel)]="form.pacienteId" (change)="onPacienteSelected()">
              <option value="">Selecione o paciente para vincular os dados...</option>
              @for (p of pacientes(); track p.id) {
                <option [value]="p.id">{{ p.name }} {{ p.grade ? '• ' + p.grade : '' }}</option>
              }
            </select>
          </div>

          <!-- Document Type -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Tipo de Documento</label>
            <select class="px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
              [(ngModel)]="form.type">
              <option value="LAUDO">Laudo Diagnóstico</option>
              <option value="PARECER">Parecer Técnico</option>
              <option value="RELATORIO">Relatório de Evolução / Devolutiva</option>
            </select>
          </div>

          <!-- Document Title -->
          <div class="sm:col-span-2 flex flex-col gap-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Título Oficial do Documento *</label>
            <input class="px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
              [(ngModel)]="form.titulo" placeholder="Ex: Laudo de Avaliação Neuropsicopedagógica">
          </div>

          <!-- Document Status -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Status</label>
            <select class="px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
              [(ngModel)]="form.status">
              <option value="RASCUNHO">Rascunho</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="ASSINADO">Assinado Digitalmente</option>
            </select>
          </div>
        </div>

        <!-- AI Assistant & LGPD Audit Buttons -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Copiloto Inteligente:</span>
            <button type="button"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800 text-xs font-bold hover:bg-violet-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
              [disabled]="!form.pacienteId || generating()" (click)="generateDraft()">
              <span class="material-icons text-[16px]">{{ generating() ? 'hourglass_empty' : 'auto_awesome' }}</span>
              {{ generating() ? 'Gerando rascunho com IA...' : 'Gerar Rascunho Clínico com IA' }}
            </button>

            <button type="button"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
              [disabled]="!form.content || auditing()" (click)="auditDocument()">
              <span class="material-icons text-[16px]">{{ auditing() ? 'hourglass_empty' : 'shield' }}</span>
              {{ auditing() ? 'Auditando...' : 'Auditar LGPD' }}
            </button>
          </div>

          @if (form.status === 'FINALIZADO') {
            <button type="button" (click)="openSignatureModal()"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
              <span class="material-icons text-[16px]">draw</span>
              Assinar Digitalmente
            </button>
          }
        </div>
      </div>

      <!-- LGPD Audit Feedback Alert -->
      @if (auditResult()) {
        <div class="rounded-2xl border overflow-hidden shadow-lg animate-in"
          [ngClass]="{ 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50': auditResult().riskLevel === 'ALTO', 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50': auditResult().riskLevel === 'MEDIO', 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50': auditResult().riskLevel === 'BAIXO' }">
          <div class="px-5 py-3.5 flex items-center justify-between"
            [ngClass]="{ 'bg-red-100/70 dark:bg-red-900/30': auditResult().riskLevel === 'ALTO', 'bg-amber-100/70 dark:bg-amber-900/30': auditResult().riskLevel === 'MEDIO', 'bg-emerald-100/70 dark:bg-emerald-900/30': auditResult().riskLevel === 'BAIXO' }">
            <div class="flex items-center gap-2">
              <span class="material-icons text-xl"
                [ngClass]="{ 'text-red-600': auditResult().riskLevel === 'ALTO', 'text-amber-600': auditResult().riskLevel === 'MEDIO', 'text-emerald-600': auditResult().riskLevel === 'BAIXO' }">
                {{ auditResult().riskLevel === 'ALTO' ? 'error' : auditResult().riskLevel === 'MEDIO' ? 'warning' : 'check_circle' }}
              </span>
              <span class="text-sm font-black"
                [ngClass]="{ 'text-red-900 dark:text-red-200': auditResult().riskLevel === 'ALTO', 'text-amber-900 dark:text-amber-200': auditResult().riskLevel === 'MEDIO', 'text-emerald-900 dark:text-emerald-200': auditResult().riskLevel === 'BAIXO' }">
                Auditoria de Conformidade LGPD: Score {{ auditResult().score }}/100 — Risco {{ auditResult().riskLevel }}
              </span>
            </div>
            <button class="p-1 hover:bg-black/10 rounded-lg transition-colors" (click)="auditResult.set(null)">
              <span class="material-icons text-sm">close</span>
            </button>
          </div>
          <div class="p-5">
            <p class="text-sm font-semibold mb-3"
              [ngClass]="{ 'text-red-800 dark:text-red-300': auditResult().riskLevel === 'ALTO', 'text-amber-800 dark:text-amber-300': auditResult().riskLevel === 'MEDIO', 'text-emerald-800 dark:text-emerald-300': auditResult().riskLevel === 'BAIXO' }">
              {{ auditResult().summary }}
            </p>
            @if (auditResult().findings && auditResult().findings.length > 0) {
              <div class="space-y-2.5">
                @for (f of auditResult().findings; track $index) {
                  <div class="flex items-start gap-2.5 text-xs bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-black/5">
                    <span class="material-icons text-[18px] shrink-0 mt-0.5"
                      [ngClass]="{ 'text-red-500': f.severity === 'ALTO', 'text-amber-500': f.severity === 'MEDIO', 'text-slate-400': f.severity === 'BAIXO' }">
                      {{ f.severity === 'ALTO' ? 'error' : f.severity === 'MEDIO' ? 'warning' : 'info' }}
                    </span>
                    <div>
                      <strong class="font-bold text-slate-900 dark:text-white">[{{ f.category }}]</strong>
                      <span class="text-slate-700 dark:text-slate-300"> {{ f.message }}</span>
                      <p class="text-slate-500 dark:text-slate-400 mt-1 italic">{{ f.suggestion }}</p>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Modern Visual A4 Clinical Document Editor -->
      <app-clinical-doc-editor
        [content]="form.content"
        [paciente]="selectedPatient()"
        [clinicName]="clinicName()"
        [clinicLogo]="clinicLogo()"
        [professionalName]="professionalName()"
        [professionalSpecialty]="'Psicopedagoga Clínica & Neuropsicopedagogia'"
        [professionalRegistry]="'CBO 2394-25 • ABPp Nacional'"
        (contentChange)="form.content = $event">
      </app-clinical-doc-editor>

      <!-- Signature Modal -->
      <app-signature-modal
        [isOpen]="showSignatureModal()"
        (confirmed)="onSignatureConfirmed($event)"
        (closed)="showSignatureModal.set(false)">
      </app-signature-modal>

      <!-- Previous Records Section -->
      @if (form.pacienteId) {
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 class="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
              <span class="material-icons text-primary text-lg">history</span>
              Laudos Anteriores de {{ getPatientName() }} ({{ records().length }})
            </h3>
          </div>

          @if (records().length === 0) {
            <div class="p-10 text-center">
              <span class="material-icons text-4xl text-slate-300">description</span>
              <p class="mt-2 text-sm font-semibold text-slate-500">Nenhum outro laudo arquivado para este paciente</p>
            </div>
          } @else {
            <div class="divide-y divide-slate-100 dark:divide-slate-800">
              @for (r of records(); track r.id) {
                <div class="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                      <span class="material-icons text-lg">description</span>
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ r.titulo || 'Sem título' }}</p>
                        <span class="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
                          [class]="r.status === 'FINALIZADO' ? 'bg-emerald-100 text-emerald-700' : r.status === 'ASSINADO' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'">
                          {{ r.status }}
                        </span>
                      </div>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {{ r.createdAt | date:'dd/MM/yyyy' }} · {{ r.type }} · Emitido por {{ r.autor?.name || 'Clínica' }}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-1 shrink-0">
                    <button type="button" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all" title="Editar" (click)="editRecord(r)">
                      <span class="material-icons text-[18px] text-slate-500 hover:text-primary">edit</span>
                    </button>
                    <button type="button" class="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all" title="Excluir" (click)="deleteRecord(r)">
                      <span class="material-icons text-[18px] text-red-500">delete</span>
                    </button>
                  </div>
                </div>
              }
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

  selectedPatient = signal<any>(null);
  clinicName = signal<string>('');
  clinicLogo = signal<string>('');
  professionalName = signal<string>('');

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

    const user = this.auth.user();
    if (user?.name) {
      this.professionalName.set(user.name);
    }
    const tenant = this.auth.tenant();
    if (tenant?.name) {
      this.clinicName.set(tenant.name);
    }
    if (tenant?.logoUrl) {
      this.clinicLogo.set(tenant.logoUrl);
    }

    this.api.get('/pacientes').subscribe((res: any) => {
      this.pacientes.set(res.data || []);
      if (this.form.pacienteId) {
        this.updateSelectedPatient();
      }
    });

    if (this.isEdit) {
      this.service.get(this.id).subscribe((res: any) => {
        this.form = res;
        this.updateSelectedPatient();
        this.loadRecords();
      });
    } else {
      const tplTitle = sessionStorage.getItem('template_title');
      const tplContent = sessionStorage.getItem('template_content');
      if (tplContent) {
        this.form.content = tplContent;
        if (tplTitle) {
          this.form.titulo = tplTitle;
        }
        sessionStorage.removeItem('template_title');
        sessionStorage.removeItem('template_content');
      }
    }
  }

  onPacienteSelected() {
    this.updateSelectedPatient();
    this.loadRecords();
  }

  updateSelectedPatient() {
    const p = this.pacientes().find(item => item.id === this.form.pacienteId) || null;
    this.selectedPatient.set(p);
  }

  getPatientName(): string {
    return this.selectedPatient()?.name || 'Paciente';
  }

  generateDraft() {
    if (!this.form.pacienteId) return this.toast.warning('Selecione um paciente');
    this.generating.set(true);
    this.api.post('/relatorios/generate-draft', { pacienteId: this.form.pacienteId, tipo: this.form.type || 'LAUDO' }).subscribe({
      next: (res: any) => {
        this.generating.set(false);
        this.form.titulo = res.title;
        // Convert plain text formatting to clean readable HTML if needed
        const formattedContent = res.content.includes('<') 
          ? res.content 
          : res.content.split('\n\n').map((p: string) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
        this.form.content = formattedContent;
        this.toast.success('Rascunho inteligente gerado com sucesso!');
      },
      error: () => {
        this.generating.set(false);
        this.toast.error('Erro ao gerar rascunho com IA');
      }
    });
  }

  loadRecords() {
    if (!this.form.pacienteId) {
      this.records.set([]);
      return;
    }
    this.api.get('/laudos', { pacienteId: this.form.pacienteId }).subscribe((res: any) => {
      this.records.set(res.data || []);
    });
  }

  editRecord(r: any) {
    this.editingId.set(r.id);
    this.form = { ...r };
    this.updateSelectedPatient();
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
      next: () => {
        this.toast.success('Laudo excluído');
        this.loadRecords();
      },
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
      next: (res: any) => {
        this.auditing.set(false);
        this.auditResult.set(res);
      },
      error: () => {
        this.auditing.set(false);
        this.toast.error('Erro ao auditar documento');
      }
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
    const obs = this.editingId() 
      ? this.service.update(this.editingId(), payload) 
      : this.isEdit 
      ? this.service.update(this.id, payload) 
      : this.service.create(payload);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Documento salvo com sucesso');
        this.resetForm();
        this.loadRecords();
      },
      error: (err: any) => {
        this.saving.set(false);
        const msg = err?.error?.error || 'Erro ao salvar documento';
        this.toast.error(msg);
      }
    });
  }
}
