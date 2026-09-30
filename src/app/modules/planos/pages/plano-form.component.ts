import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/components/toast.component';
import { ClinicalDocEditorComponent } from '@shared/components/clinical-doc-editor/clinical-doc-editor.component';
import { ConfirmModalComponent } from '@shared/components/confirm-modal.component';
import { DOC_TEMPLATES, replaceDocPlaceholders } from '@core/data/doc-templates.data';

@Component({
  selector: 'app-plano-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ClinicalDocEditorComponent, ConfirmModalComponent],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Top Navigation & Actions Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex items-center gap-4">
          <a routerLink="/app/planos" class="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all shrink-0">
            <span class="material-icons text-slate-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-black text-slate-900 dark:text-white">{{ isEdit ? 'Editar' : 'Novo' }} Plano de Intervenção</h1>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase"
                [class]="status === 'FINALIZADO' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'">
                {{ status }}
              </span>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Elaboração de PEI, PDI, metas e proposta clínica no formato A4</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <a routerLink="/app/planos" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            Cancelar
          </a>
          <button (click)="save()" [disabled]="saving() || !selectedPatientId"
            class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-bold text-sm shadow-xl shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95">
            <span class="material-icons text-[18px]">save</span>
            {{ saving() ? 'Salvando...' : 'Salvar Plano' }}
          </button>
        </div>
      </div>

      <!-- Settings & Financial Data Bar -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div class="flex items-center gap-2">
            <span class="material-icons text-primary text-xl">tune</span>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Dados do Plano & Condições</h3>
          </div>
          <button type="button" (click)="showFinancialDetails.set(!showFinancialDetails())"
            class="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            <span>{{ showFinancialDetails() ? 'Ocultar' : 'Ajustar' }} Valores e Sessões</span>
            <span class="material-icons text-sm">{{ showFinancialDetails() ? 'expand_less' : 'expand_more' }}</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Patient Selector -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paciente *</label>
            <select [(ngModel)]="selectedPatientId" (change)="onPatientSelect()"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white">
              <option value="">Selecione o paciente</option>
              @for (p of patients(); track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>

          <!-- Date -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data de Emissão</label>
            <input type="date" [(ngModel)]="planDate"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white">
          </div>

          <!-- Status -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status do Documento</label>
            <select [(ngModel)]="status"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white">
              <option value="RASCUNHO">Rascunho (Em Edição)</option>
              <option value="ATIVO">Ativo (Em Aplicação)</option>
              <option value="FINALIZADO">Finalizado (Aprovado)</option>
            </select>
          </div>
        </div>

        <!-- Collapsible Financial Details -->
        @if (showFinancialDetails()) {
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 animate-in">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nº de Sessões</label>
                <input type="number" [(ngModel)]="sessionCount" min="1"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor por Sessão (R$)</label>
                <input type="number" [(ngModel)]="sessionValue" min="0" step="0.01"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Frequência</label>
                <select [(ngModel)]="frequency"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white">
                  <option value="1x por semana">1x por semana</option>
                  <option value="2x por semana">2x por semana</option>
                  <option value="3x por semana">3x por semana</option>
                  <option value="Quinzenal">Quinzenal</option>
                  <option value="Diário">Diário</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duração da Sessão</label>
                <select [(ngModel)]="duration"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white">
                  <option value="30 min">30 minutos</option>
                  <option value="45 min">45 minutos</option>
                  <option value="50 min">50 minutos</option>
                  <option value="60 min">60 minutos</option>
                  <option value="90 min">90 minutos</option>
                </select>
              </div>
            </div>

            <!-- Financial Summary Pill & Insertion -->
            <div class="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/20 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-xs font-bold text-primary uppercase tracking-wider">Investimento Total do Ciclo</span>
                <p class="text-lg font-black text-primary">
                  R$ {{ totalValue().toFixed(2) }}
                  <span class="text-xs font-normal text-slate-500 ml-1">({{ sessionCount }} sessões × R$ {{ sessionValue.toFixed(2) }})</span>
                </p>
              </div>
              <button type="button" (click)="insertFinancialSummaryIntoDoc()"
                class="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95">
                <span class="material-icons text-sm">post_add</span>
                Inserir Tabela Financeira no Documento
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Quick Template Shortcuts for Plans -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <span class="material-icons text-sm">auto_stories</span> Modelos Rápidos:
        </span>
        <button type="button" (click)="applyQuickTemplate('i1')"
          class="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-primary/5 hover:border-primary/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shrink-0">
          📋 PEI - Plano Educacional Individualizado
        </button>
        <button type="button" (click)="applyQuickTemplate('i2')"
          class="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-primary/5 hover:border-primary/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shrink-0">
          🎯 PIT - Plano de Intervenção Terapêutica
        </button>
        <button type="button" (click)="applyQuickTemplate('i4')"
          class="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-primary/5 hover:border-primary/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shrink-0">
          🧸 Plano de Estimulação Precoce
        </button>
        <button type="button" (click)="applyQuickTemplate('e2')"
          class="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-primary/5 hover:border-primary/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shrink-0">
          🏫 Parecer de Acomodação Curricular
        </button>
      </div>

      <!-- Clinical A4 Document Editor -->
      <app-clinical-doc-editor
        [content]="documentContent"
        [paciente]="selectedPatient()"
        [clinicName]="clinicName()"
        [clinicLogo]="clinicLogo()"
        [professionalName]="professionalName()"
        (contentChange)="onContentChange($event)">
      </app-clinical-doc-editor>

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
export class PlanoFormComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  patients = signal<any[]>([]);
  selectedPatient = signal<any>(null);
  selectedPatientId = '';
  isEdit = false;
  planId = '';
  saving = signal(false);
  showFinancialDetails = signal(false);

  planDate = new Date().toISOString().split('T')[0];
  status = 'RASCUNHO';
  documentContent = '';

  sessionCount = 12;
  sessionValue = 150;
  frequency = '2x por semana';
  duration = '50 min';

  clinicName = computed(() => this.auth.tenant()?.name || 'EduPsych Pro');
  clinicLogo = computed(() => this.auth.tenant()?.logoUrl || '');
  professionalName = computed(() => this.auth.user()?.name || 'Neuropsicopedagogo(a)');

  ngOnInit() {
    this.api.get('/pacientes').subscribe((res: any) => {
      this.patients.set(res.data || []);
      if (this.selectedPatientId) {
        this.updateSelectedPatient();
      }
    });

    this.planId = this.route.snapshot.paramMap.get('id') || '';
    this.isEdit = !!this.planId;

    if (this.isEdit) {
      this.api.get(`/intervention-plans/${this.planId}`).subscribe((res: any) => {
        this.selectedPatientId = res.pacienteId || '';
        this.planDate = res.date || '';
        this.status = res.status || 'RASCUNHO';
        this.sessionCount = res.sessionCount || 12;
        this.sessionValue = parseFloat(res.sessionValue) || 150;
        this.frequency = res.frequency || '2x por semana';
        this.duration = res.duration || '50 min';

        // Load document content: either step1 has full HTML or reconstruct from steps
        if (res.step1 && res.step1.includes('<')) {
          this.documentContent = res.step1;
        } else if (res.step1 || res.step2 || res.step3) {
          this.documentContent = `
            <h2>PLANO DE INTERVENÇÃO CLÍNICA</h2>
            <br>
            <p><strong>Paciente:</strong> {nome_paciente} | <strong>Data:</strong> ${this.planDate}</p>
            <br>
            <h3>1. AVALIAÇÃO / ANAMNESE</h3>
            <p>${res.step1 || 'Em avaliação.'}</p>
            <br>
            <h3>2. HABILIDADES DESENVOLVIDAS & ALVO</h3>
            <p>${res.step2 || 'Em desenvolvimento.'}</p>
            <br>
            <h3>3. ROTEIRO DE ATENDIMENTO & ESTRATÉGIAS</h3>
            <p>${res.step3 || 'Sessões estruturadas semanais.'}</p>
          `;
        } else {
          this.loadDefaultTemplate();
        }

        this.updateSelectedPatient();
      });
    } else {
      this.loadDefaultTemplate();
    }
  }

  // Confirmation Modal state
  showConfirmModal = signal(false);
  confirmTitle = signal('Confirmar ação');
  confirmMessage = signal('Tem certeza que deseja continuar?');
  confirmButtonText = signal('Confirmar');
  confirmDanger = signal(false);
  pendingAction: (() => void) | null = null;

  loadDefaultTemplate() {
    const tpl = DOC_TEMPLATES.find(t => t.id === 'i2') || DOC_TEMPLATES.find(t => t.id === 'i1');
    if (tpl) {
      this.documentContent = tpl.content;
    }
  }

  applyQuickTemplate(templateId: string) {
    const tpl = DOC_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;

    if (this.documentContent && this.documentContent.trim().length > 50) {
      this.confirmTitle.set('Substituir Conteúdo do Plano?');
      this.confirmMessage.set(`O plano atual já possui anotações preenchidas. Deseja carregar o modelo "${tpl.name}" e substituir o conteúdo?`);
      this.confirmButtonText.set('Carregar Modelo');
      this.confirmDanger.set(false);
      this.pendingAction = () => this.doApplyQuickTemplate(tpl);
      this.showConfirmModal.set(true);
      return;
    }

    this.doApplyQuickTemplate(tpl);
  }

  private doApplyQuickTemplate(tpl: any) {
    const p = this.selectedPatient();
    this.documentContent = replaceDocPlaceholders(tpl.content, p);
    this.toast.info(`Modelo "${tpl.name}" carregado no editor.`);
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

  onPatientSelect() {
    this.updateSelectedPatient();
    // Update placeholders if content has tags
    if (this.selectedPatient()) {
      this.documentContent = replaceDocPlaceholders(this.documentContent, this.selectedPatient());
    }
  }

  private updateSelectedPatient() {
    const found = this.patients().find(p => p.id === this.selectedPatientId);
    this.selectedPatient.set(found || null);
  }

  totalValue(): number {
    return (this.sessionCount || 0) * (this.sessionValue || 0);
  }

  onContentChange(newHtml: string) {
    this.documentContent = newHtml;
  }

  insertFinancialSummaryIntoDoc() {
    const tableHtml = `
      <div style="margin: 16px 0; padding: 14px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
        <h4 style="margin: 0 0 8px 0; color: #007F80; font-size: 14px;">PROPOSTA E CONDIÇÕES DE ATENDIMENTO</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="padding: 4px 0; color: #475569;">Ciclo Inicial:</td>
            <td style="padding: 4px 0; font-weight: bold; text-align: right;">${this.sessionCount} sessões</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #475569;">Frequência & Duração:</td>
            <td style="padding: 4px 0; font-weight: bold; text-align: right;">${this.frequency} (${this.duration})</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #475569;">Valor Unitário por Sessão:</td>
            <td style="padding: 4px 0; font-weight: bold; text-align: right;">R$ ${this.sessionValue.toFixed(2)}</td>
          </tr>
          <tr style="border-top: 1px solid #cbd5e1;">
            <td style="padding: 8px 0 0 0; font-weight: bold; color: #0f172a;">VALOR TOTAL DO INVESTIMENTO:</td>
            <td style="padding: 8px 0 0 0; font-weight: 900; color: #007F80; font-size: 14px; text-align: right;">R$ ${this.totalValue().toFixed(2)}</td>
          </tr>
        </table>
      </div>
      <p></p>
    `;
    this.documentContent += tableHtml;
    this.toast.success('Condições financeiras inseridas no documento.');
  }

  save() {
    if (!this.selectedPatientId) {
      this.toast.warning('Selecione um paciente para o plano');
      return;
    }

    this.saving.set(true);

    const payload = {
      pacienteId: this.selectedPatientId,
      professionalId: this.auth.user()?.id || '',
      date: this.planDate,
      step1: this.documentContent,
      step2: '',
      step3: '',
      sessionCount: this.sessionCount,
      sessionValue: this.sessionValue.toString(),
      totalValue: this.totalValue().toString(),
      frequency: this.frequency,
      duration: this.duration,
      status: this.status
    };

    const req = this.isEdit
      ? this.api.put(`/intervention-plans/${this.planId}`, payload)
      : this.api.post('/intervention-plans', payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Plano de intervenção salvo com sucesso');
        this.router.navigate(['/app/planos']);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erro ao salvar plano de intervenção');
      }
    });
  }
}
