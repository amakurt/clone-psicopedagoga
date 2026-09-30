import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/components/toast.component';
import { ClinicalDocEditorComponent } from '@shared/components/clinical-doc-editor/clinical-doc-editor.component';
import { ConfirmModalComponent } from '@shared/components/confirm-modal.component';
import { DOC_TEMPLATES, replaceDocPlaceholders } from '@core/data/doc-templates.data';

@Component({
  selector: 'app-plano-intervencao-doc',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ClinicalDocEditorComponent, ConfirmModalComponent],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex items-center gap-4">
          <a routerLink="/app/documentos" class="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
            <span class="material-icons text-slate-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white">Plano de Intervenção Clínico</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Elaboração estruturada com exportação A4 timbrada direta</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="save()" [disabled]="saving() || !form.pacienteId"
            class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-bold text-sm shadow-xl shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95">
            <span class="material-icons text-[18px]">save</span>
            {{ saving() ? 'Salvando...' : 'Salvar Plano' }}
          </button>
        </div>
      </div>

      <!-- Settings Card -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paciente *</label>
            <select [(ngModel)]="form.pacienteId" (change)="onPatientChange()"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white">
              <option value="">Selecione um paciente</option>
              @for (p of patients(); track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Profissional Responsável</label>
            <input type="text" [(ngModel)]="form.professionalName"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
              placeholder="Nome do profissional">
          </div>
          <div class="flex items-end">
            <button type="button" (click)="showFinancialDetails.set(!showFinancialDetails())"
              class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5">
              <span class="material-icons text-sm">payments</span>
              {{ showFinancialDetails() ? 'Ocultar' : 'Configurar' }} Honorários & Sessões
            </button>
          </div>
        </div>

        @if (showFinancialDetails()) {
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nº de Sessões</label>
              <input type="number" [(ngModel)]="form.sessionCount" (ngModelChange)="calculateTotal()"
                class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor/Sessão (R$)</label>
              <input type="number" [(ngModel)]="form.sessionValue" (ngModelChange)="calculateTotal()" step="0.01"
                class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Frequência</label>
              <input type="text" [(ngModel)]="form.frequency"
                class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white outline-none"
                placeholder="Ex: 2x por semana">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duração</label>
              <input type="text" [(ngModel)]="form.duration"
                class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white outline-none"
                placeholder="Ex: 50 minutos">
            </div>
          </div>
        }
      </div>

      <!-- Quick Templates -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <span class="material-icons text-sm">auto_awesome</span> Modelos:
        </span>
        <button type="button" (click)="loadTemplate('i1')"
          class="px-3 py-1.5 bg-white dark:bg-slate-900 hover:border-primary/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shrink-0">
          📋 PEI - Plano Educacional Individualizado
        </button>
        <button type="button" (click)="loadTemplate('i2')"
          class="px-3 py-1.5 bg-white dark:bg-slate-900 hover:border-primary/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shrink-0">
          🎯 PIT - Plano de Intervenção Terapêutica
        </button>
        <button type="button" (click)="loadTemplate('i4')"
          class="px-3 py-1.5 bg-white dark:bg-slate-900 hover:border-primary/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shrink-0">
          🧸 Plano de Estimulação Precoce
        </button>
      </div>

      <!-- Clinical A4 Document Editor -->
      <app-clinical-doc-editor
        [content]="documentContent"
        [paciente]="selectedPatient()"
        [clinicName]="clinicName()"
        [clinicLogo]="clinicLogo()"
        [professionalName]="form.professionalName || professionalName()"
        (contentChange)="onContentChange($event)">
      </app-clinical-doc-editor>

      <!-- Registros Anteriores -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <span class="material-icons text-amber-500 text-xl">history</span>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white">Planos Anteriores Salvos</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ records().length }} registro(s) de {{ getPatientName() }}</p>
            </div>
          </div>
          @if (editingId()) {
            <button (click)="resetForm()" class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-bold text-xs transition-all">
              <span class="material-icons text-[16px]">add</span>
              Novo Plano
            </button>
          }
        </div>

        @if (records().length === 0) {
          <div class="p-8 text-center text-slate-400 text-sm">
            Nenhum plano anterior salvo para este paciente.
          </div>
        } @else {
          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            @for (r of records(); track r.id) {
              <div class="px-5 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div class="flex items-center gap-3">
                  <span class="material-icons text-primary">description</span>
                  <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white">{{ r.step1 ? (r.step1 | slice:0:60) : 'Plano de Intervenção' }}</h4>
                    <p class="text-xs text-slate-400">{{ r.createdAt | date:'dd/MM/yyyy HH:mm' }} · {{ r.sessionCount || 0 }} sessões · {{ r.professionalName || 'Profissional' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button (click)="editRecord(r)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400" title="Editar">
                    <span class="material-icons text-[18px]">edit</span>
                  </button>
                  <button (click)="deleteRecord(r)" class="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-xl" title="Excluir">
                    <span class="material-icons text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
      <!-- Modal de Confirmação Padrão -->
      <app-confirm-modal
        [isOpen]="showConfirmModal()"
        [title]="confirmTitle()"
        [message]="confirmMessage()"
        [confirmText]="confirmButtonText()"
        [dangerMode]="confirmDanger()"
        (closed)="onModalClosed()"
        (confirmed)="onModalConfirmed()">
      </app-confirm-modal>
    </div>
  `
})
export class PlanoIntervencaoDocComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  saving = signal(false);
  patients = signal<any[]>([]);
  selectedPatient = signal<any>(null);
  records = signal<any[]>([]);
  editingId = signal('');
  showFinancialDetails = signal(false);

  documentContent = '';

  // Confirmation Modal state
  showConfirmModal = signal(false);
  confirmTitle = signal('Confirmar ação');
  confirmMessage = signal('Tem certeza que deseja continuar?');
  confirmButtonText = signal('Confirmar');
  confirmDanger = signal(false);
  pendingAction: (() => void) | null = null;

  clinicName = computed(() => this.auth.tenant()?.name || 'EduPsych Pro');
  clinicLogo = computed(() => this.auth.tenant()?.logoUrl || '');
  professionalName = computed(() => this.auth.user()?.name || 'Neuropsicopedagogo(a)');

  form: any = {
    pacienteId: '',
    professionalName: '',
    step1: '',
    step2: '',
    step3: '',
    sessionCount: 12,
    sessionValue: 150,
    totalValue: 1800,
    frequency: '2x por semana',
    duration: '50 min'
  };

  ngOnInit() {
    this.api.get('/pacientes').subscribe((res: any) => this.patients.set(res.data || []));
    this.form.professionalName = this.auth.user()?.name || '';
    this.loadDefaultTemplate();
  }

  loadDefaultTemplate() {
    const tpl = DOC_TEMPLATES.find(t => t.id === 'i2') || DOC_TEMPLATES.find(t => t.id === 'i1');
    if (tpl) {
      this.documentContent = tpl.content;
    }
  }

  loadTemplate(templateId: string) {
    const tpl = DOC_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;

    if (this.documentContent && this.documentContent.trim().length > 50) {
      this.confirmTitle.set('Substituir Conteúdo do Plano?');
      this.confirmMessage.set(`O plano atual já possui anotações preenchidas. Deseja carregar o modelo "${tpl.name}" e substituir o conteúdo?`);
      this.confirmButtonText.set('Carregar Modelo');
      this.confirmDanger.set(false);
      this.pendingAction = () => this.doLoadTemplate(tpl);
      this.showConfirmModal.set(true);
      return;
    }

    this.doLoadTemplate(tpl);
  }

  private doLoadTemplate(tpl: any) {
    const p = this.selectedPatient();
    this.documentContent = replaceDocPlaceholders(tpl.content, p);
    this.toast.info(`Modelo "${tpl.name}" carregado no editor.`);
  }

  onPatientChange() {
    const found = this.patients().find(p => p.id === this.form.pacienteId);
    this.selectedPatient.set(found || null);
    if (found) {
      this.documentContent = replaceDocPlaceholders(this.documentContent, found);
      this.loadRecords();
    }
  }

  loadRecords() {
    if (!this.form.pacienteId) {
      this.records.set([]);
      return;
    }
    this.api.get('/intervention-documents', { pacienteId: this.form.pacienteId }).subscribe((res: any) => {
      this.records.set((res.data || []).sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || '')));
    });
  }

  editRecord(r: any) {
    this.editingId.set(r.id);
    this.form = { ...r };
    if (r.step1 && r.step1.includes('<')) {
      this.documentContent = r.step1;
    } else {
      this.documentContent = `
        <h2>PLANO DE INTERVENÇÃO CLÍNICA</h2>
        <br>
        <p><strong>Paciente:</strong> {nome_paciente}</p>
        <br>
        <h3>1. AVALIAÇÃO / ANAMNESE</h3>
        <p>${r.step1 || '-'}</p>
        <br>
        <h3>2. HABILIDADES</h3>
        <p>${r.step2 || '-'}</p>
        <br>
        <h3>3. ROTEIRO DE ATENDIMENTO</h3>
        <p>${r.step3 || '-'}</p>
      `;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm() {
    this.editingId.set('');
    this.form = {
      pacienteId: this.form.pacienteId,
      professionalName: this.auth.user()?.name || '',
      step1: '',
      step2: '',
      step3: '',
      sessionCount: 12,
      sessionValue: 150,
      totalValue: 1800,
      frequency: '2x por semana',
      duration: '50 min'
    };
    this.loadDefaultTemplate();
  }

  deleteRecord(r: any) {
    this.confirmTitle.set('Excluir Plano de Intervenção?');
    this.confirmMessage.set('Tem certeza que deseja excluir este plano de intervenção? Esta ação não pode ser desfeita.');
    this.confirmButtonText.set('Excluir');
    this.confirmDanger.set(true);
    this.pendingAction = () => this.doDeleteRecord(r);
    this.showConfirmModal.set(true);
  }

  private doDeleteRecord(r: any) {
    this.api.delete(`/intervention-documents/${r.id}`).subscribe({
      next: () => {
        this.toast.success('Plano excluído');
        this.loadRecords();
      },
      error: () => this.toast.error('Erro ao excluir plano')
    });
  }

  onModalConfirmed() {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
    this.showConfirmModal.set(false);
  }

  onModalClosed() {
    this.pendingAction = null;
    this.showConfirmModal.set(false);
  }

  getPatientName(): string {
    const p = this.patients().find(p => p.id === this.form.pacienteId);
    return p?.name || '-';
  }

  calculateTotal() {
    const count = Number(this.form.sessionCount) || 0;
    const val = Number(this.form.sessionValue) || 0;
    this.form.totalValue = count * val;
  }

  onContentChange(newHtml: string) {
    this.documentContent = newHtml;
  }

  save() {
    if (!this.form.pacienteId) {
      this.toast.warning('Selecione um paciente');
      return;
    }

    this.saving.set(true);

    const payload = {
      ...this.form,
      step1: this.documentContent,
      step2: '',
      step3: '',
      sessionCount: Number(this.form.sessionCount) || 0,
      sessionValue: String(this.form.sessionValue || ''),
      totalValue: String(this.form.totalValue || '')
    };

    const req = this.editingId()
      ? this.api.put(`/intervention-documents/${this.editingId()}`, payload)
      : this.api.post('/intervention-documents', payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Plano de intervenção salvo com sucesso');
        this.resetForm();
        this.loadRecords();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erro ao salvar plano de intervenção');
      }
    });
  }
}
