import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-plano-intervencao-doc',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/app/documentos" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <span class="material-icons text-gray-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Plano de Intervenção</h1>
            <p class="text-sm text-gray-500 dark:text-slate-400">Orçamento de plano de acompanhamento neuropsicopedagógico</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button (click)="exportPDF()" [disabled]="!form.pacienteId"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center gap-2">
            <span class="material-icons">picture_as_pdf</span>
            Exportar PDF
          </button>
          <button (click)="save()" [disabled]="saving() || !form.pacienteId"
            class="px-6 py-2 bg-primary hover:bg-primary-dark text-on-primary rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center gap-2">
            <span class="material-icons">save</span>
            {{ saving() ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <!-- Steps Indicator -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-200 dark:border-slate-700">
        <div class="flex items-center justify-center gap-4">
          <button (click)="currentStep.set(1)" class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
            [class]="currentStep() === 1 ? 'bg-primary text-on-primary' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'">
            <span class="material-icons">1</span>
            <span class="text-sm font-medium">Avaliação</span>
          </button>
          <span class="material-icons text-gray-300">chevron_right</span>
          <button (click)="currentStep.set(2)" class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
            [class]="currentStep() === 2 ? 'bg-primary text-on-primary' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'">
            <span class="material-icons">2</span>
            <span class="text-sm font-medium">Habilidades</span>
          </button>
          <span class="material-icons text-gray-300">chevron_right</span>
          <button (click)="currentStep.set(3)" class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
            [class]="currentStep() === 3 ? 'bg-primary text-on-primary' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'">
            <span class="material-icons">3</span>
            <span class="text-sm font-medium">Roteiro</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Step 1: Avaliação -->
          @if (currentStep() === 1) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">1º Passo - Avaliação Neuropsicopedagógica</h3>
              <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">Avaliação neuropsicopedagógica/Anamnese. Essa avaliação não tem finalidade diagnóstica. Ela mostrará os marcos para entender quais são os passos da intervenção.</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Paciente *</label>
                  <select [(ngModel)]="form.pacienteId" (change)="loadRecords()"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                    <option value="">Selecione um paciente</option>
                    @for (p of patients(); track p.id) {
                      <option [value]="p.id">{{ p.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Profissional</label>
                  <input type="text" [(ngModel)]="form.professionalName"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Nome do profissional">
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Avaliação Inicial</label>
                  <textarea [(ngModel)]="form.step1" rows="6"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-y"
                    placeholder="Descreva a avaliação neuropsicopedagógica inicial, incluindo anamnese, observações clínicas e marcos identificados..."></textarea>
                </div>
              </div>
            </div>
          }

          <!-- Step 2: Habilidades -->
          @if (currentStep() === 2) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">2º Passo - Dados e Habilidades</h3>
              <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">Listar as habilidades já desenvolvidas pelo paciente.</p>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Habilidades Desenvolvidas</label>
                  <textarea [(ngModel)]="form.step2" rows="8"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-y"
                    placeholder="Liste as habilidades que o paciente já desenvolveu:&#10;- Habilidades Comunicativas&#10;- Habilidades Sociais&#10;- Habilidades Motoras&#10;- Habilidades Funcionais&#10;- Habilidades Cognitivas"></textarea>
                </div>
              </div>
            </div>
          }

          <!-- Step 3: Roteiro -->
          @if (currentStep() === 3) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">3º Passo - Roteiro de Atendimento</h3>
              <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">Roteiro de atendimento sempre articulado com a queixa e o desenvolvimento das habilidades. Inclui diário de sessões e relatório.</p>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Roteiro de Atendimento</label>
                  <textarea [(ngModel)]="form.step3" rows="8"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-y"
                    placeholder="Descreva o roteiro de atendimento:&#10;- Objetivos das sessões&#10;- Atividades planejadas&#10;- Instrumentos a serem utilizados&#10;- Frequência e duração"></textarea>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Nº de Sessões</label>
                    <input type="number" [(ngModel)]="form.sessionCount"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Ex: 5">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Valor por Sessão (R$)</label>
                    <input type="text" [(ngModel)]="form.sessionValue"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Ex: 120,00">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Valor Total (R$)</label>
                    <input type="text" [(ngModel)]="form.totalValue"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Ex: 600,00">
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Frequência</label>
                    <input type="text" [(ngModel)]="form.frequency"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Ex: 1x por semana, aos sábados">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Duração</label>
                    <input type="text" [(ngModel)]="form.duration"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Ex: 45min a 1 hora">
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Navigation -->
          <div class="flex justify-between">
            <button (click)="currentStep.set(currentStep() - 1)" [disabled]="currentStep() === 1"
              class="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-semibold disabled:opacity-50 transition-all">
              Anterior
            </button>
            @if (currentStep() < 3) {
              <button (click)="currentStep.set(currentStep() + 1)"
                class="px-6 py-2 bg-primary hover:bg-primary-dark text-on-primary rounded-xl font-semibold transition-all">
                Próximo
              </button>
            }
          </div>
        </div>

        <!-- Preview PDF -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 sticky top-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview do Documento</h3>
            <div id="pdf-preview-plano" class="aspect-[3/4] bg-gray-100 dark:bg-slate-700 rounded-xl p-4 overflow-auto text-xs text-gray-700 dark:text-slate-300">
              <div class="text-center mb-4">
                <h4 class="font-bold text-sm">PLANO DE INTERVENÇÃO</h4>
                <p class="text-[10px] text-gray-500">Neuropsicopedagogia Clínica</p>
              </div>
              <div class="space-y-2 mb-4">
                <p><strong>Aluno:</strong> {{ getPatientName() }}</p>
                <p><strong>Profissional:</strong> {{ form.professionalName || '-' }}</p>
              </div>
              <div class="space-y-3">
                <div>
                  <p class="font-bold border-b border-gray-300 pb-1">1º Passo - Avaliação:</p>
                  <p class="text-[10px] min-h-[30px]">{{ form.step1 || '-' }}</p>
                </div>
                <div>
                  <p class="font-bold border-b border-gray-300 pb-1">2º Passo - Habilidades:</p>
                  <p class="text-[10px] min-h-[30px]">{{ form.step2 || '-' }}</p>
                </div>
                <div>
                  <p class="font-bold border-b border-gray-300 pb-1">3º Passo - Roteiro:</p>
                  <p class="text-[10px] min-h-[30px]">{{ form.step3 || '-' }}</p>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-300">
                  <p class="text-[10px]"><strong>Nº Sessões:</strong> {{ form.sessionCount || '-' }}</p>
                  <p class="text-[10px]"><strong>Valor/Sessão:</strong> R$ {{ form.sessionValue || '-' }}</p>
                  <p class="text-[10px]"><strong>Valor Total:</strong> R$ {{ form.totalValue || '-' }}</p>
                  <p class="text-[10px]"><strong>Frequência:</strong> {{ form.frequency || '-' }}</p>
                  <p class="text-[10px]"><strong>Duração:</strong> {{ form.duration || '-' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Registros Anteriores -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div class="p-5 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-xl bg-amber-600/10 flex items-center justify-center">
              <span class="material-icons text-amber-600 text-xl">history</span>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white">Registros Anteriores</h3>
              <p class="text-xs text-gray-500 dark:text-slate-400">{{ records().length }} registro(s) de {{ getPatientName() }}</p>
            </div>
          </div>
          @if (editingId()) {
            <button (click)="resetForm()" class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-gray-700 dark:text-slate-300 font-semibold text-xs transition-all">
              <span class="material-icons text-[16px]">add</span>
              Novo registro
            </button>
          }
        </div>
        @if (records().length === 0) {
          <div class="p-10 text-center">
            <span class="material-icons text-4xl text-gray-300 dark:text-slate-600">assignment</span>
            <p class="mt-3 text-sm font-semibold text-gray-500 dark:text-slate-400">Nenhum registro para este paciente</p>
            <p class="text-xs text-gray-400 dark:text-slate-500 mt-1">Selecione um paciente para listar os planos salvos</p>
          </div>
        } @else {
          <div class="divide-y divide-gray-100 dark:divide-slate-700">
            @for (r of records(); track r.id) {
              <div class="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div class="w-10 h-10 rounded-xl bg-amber-600/10 flex items-center justify-center shrink-0">
                  <span class="material-icons text-amber-600 text-lg">assignment</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ r.step1 || 'Plano de intervenção' }}</p>
                  <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                    {{ r.sessionCount }} sessões · {{ r.frequency || '—' }} · {{ r.duration || '—' }} · {{ r.professionalName || '' }}
                  </p>
                </div>
                <span class="text-xs font-bold px-2 py-1 rounded-full shrink-0"
                  [class]="r.status === 'APROVADO' ? 'bg-emerald-500/10 text-emerald-600' : r.status === 'RASCUNHO' ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-500/10 text-slate-500'">
                  {{ r.status || 'RASCUNHO' }}
                </span>
                <div class="flex items-center gap-1 shrink-0">
                  <button (click)="editRecord(r)" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-all" title="Editar">
                    <span class="material-icons text-[18px] text-gray-500 dark:text-slate-400">edit</span>
                  </button>
                  <button (click)="deleteRecord(r)" class="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Excluir">
                    <span class="material-icons text-[18px] text-red-500">delete</span>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class PlanoIntervencaoDocComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  saving = signal(false);
  patients = signal<any[]>([]);
  currentStep = signal(1);
  records = signal<any[]>([]);
  editingId = signal('');

  form: any = {
    pacienteId: '',
    professionalName: '',
    step1: '',
    step2: '',
    step3: '',
    sessionCount: 5,
    sessionValue: '',
    totalValue: '',
    frequency: '',
    duration: ''
  };

  ngOnInit() {
    this.api.get('/pacientes').subscribe((res: any) => this.patients.set(res.data || []));
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
  }

  resetForm() {
    this.editingId.set('');
    this.form = {
      pacienteId: this.form.pacienteId,
      professionalName: '',
      step1: '',
      step2: '',
      step3: '',
      sessionCount: 5,
      sessionValue: '',
      totalValue: '',
      frequency: '',
      duration: ''
    };
  }

  deleteRecord(r: any) {
    if (!confirm('Excluir este plano de intervenção?')) return;
    this.api.delete(`/intervention-documents/${r.id}`).subscribe({
      next: () => {
        this.toast.success('Plano excluído');
        this.loadRecords();
      },
      error: () => this.toast.error('Erro ao excluir plano')
    });
  }

  getPatientName(): string {
    const p = this.patients().find(p => p.id === this.form.pacienteId);
    return p?.name || '-';
  }

  save() {
    if (!this.form.pacienteId) return;
    this.saving.set(true);
    const req = this.editingId()
      ? this.api.put(`/intervention-documents/${this.editingId()}`, this.form)
      : this.api.post('/intervention-documents', this.form);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Plano de intervenção salvo com sucesso!');
        this.resetForm();
        this.loadRecords();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erro ao salvar plano de intervenção');
      }
    });
  }

  exportPDF() {
    const content = document.getElementById('pdf-preview-plano');
    if (!content) return;

    import('html2pdf.js').then(html2pdf => {
      html2pdf.default()
        .set({
          margin: 10,
          filename: `plano-intervencao-${this.form.pacienteId ? 'paciente' : 'rascunho'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(content)
        .save();
    });
  }
}
