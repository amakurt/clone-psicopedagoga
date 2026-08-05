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
            class="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center gap-2">
            <span class="material-icons">save</span>
            {{ saving() ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <!-- Steps Indicator -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-200 dark:border-slate-700">
        <div class="flex items-center justify-center gap-4">
          <button (click)="currentStep.set(1)" class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
            [class]="currentStep() === 1 ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'">
            <span class="material-icons">1</span>
            <span class="text-sm font-medium">Avaliação</span>
          </button>
          <span class="material-icons text-gray-300">chevron_right</span>
          <button (click)="currentStep.set(2)" class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
            [class]="currentStep() === 2 ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'">
            <span class="material-icons">2</span>
            <span class="text-sm font-medium">Habilidades</span>
          </button>
          <span class="material-icons text-gray-300">chevron_right</span>
          <button (click)="currentStep.set(3)" class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
            [class]="currentStep() === 3 ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'">
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
                  <select [(ngModel)]="form.pacienteId"
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
                class="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-all">
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

  getPatientName(): string {
    const p = this.patients().find(p => p.id === this.form.pacienteId);
    return p?.name || '-';
  }

  save() {
    if (!this.form.pacienteId) return;
    this.saving.set(true);
    this.api.post('/intervention-documents', this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Plano de intervenção salvo com sucesso!');
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
