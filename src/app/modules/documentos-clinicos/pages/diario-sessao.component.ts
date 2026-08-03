import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-diario-sessao',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/documentos" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <span class="material-icons text-gray-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Diário de Sessões</h1>
            <p class="text-sm text-gray-500 dark:text-slate-400">Registro detalhado de cada sessão de acompanhamento</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button (click)="exportPDF()" [disabled]="!form.pacienteId"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center gap-2">
            <span class="material-icons">picture_as_pdf</span>
            Exportar PDF
          </button>
          <button (click)="save()" [disabled]="saving() || !form.pacienteId || !form.date"
            class="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center gap-2">
            <span class="material-icons">save</span>
            {{ saving() ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Form -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dados da Sessão</h3>
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
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Data *</label>
                <input type="date" [(ngModel)]="form.date"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Nº da Sessão</label>
                <input type="number" [(ngModel)]="form.sessionNumber"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Ex: 1">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Profissional</label>
                <input type="text" [(ngModel)]="form.professionalName"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Nome do profissional">
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conteúdo da Sessão</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Objetivo</label>
                <textarea [(ngModel)]="form.objective" rows="3"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-y"
                  placeholder="Objetivo da sessão"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Instrumentos Utilizados</label>
                <textarea [(ngModel)]="form.instruments" rows="3"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-y"
                  placeholder="Materiais e instrumentos utilizados"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Comportamento do Aluno</label>
                <textarea [(ngModel)]="form.studentBehavior" rows="4"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-y"
                  placeholder="Observações sobre o comportamento do aluno durante a sessão"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Atividades Realizadas</label>
                <textarea [(ngModel)]="form.activities" rows="4"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-y"
                  placeholder="Descreva as atividades realizadas na sessão"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Observações</label>
                <textarea [(ngModel)]="form.observations" rows="3"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-y"
                  placeholder="Observações adicionais"></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview PDF -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 sticky top-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview do Documento</h3>
            <div id="pdf-preview" class="aspect-[3/4] bg-gray-100 dark:bg-slate-700 rounded-xl p-4 overflow-auto text-xs text-gray-700 dark:text-slate-300">
              <div class="text-center mb-4">
                <h4 class="font-bold text-sm">DIÁRIO DE SESSÕES</h4>
                <p class="text-[10px] text-gray-500">Neuropsicopedagogia Clínica</p>
              </div>
              <div class="space-y-2 mb-4">
                <p><strong>Aluno:</strong> {{ getPatientName() }}</p>
                <p><strong>Nº Sessão:</strong> {{ form.sessionNumber || '-' }}</p>
                <p><strong>Data:</strong> {{ form.date || '-' }}</p>
                <p><strong>Profissional:</strong> {{ form.professionalName || '-' }}</p>
              </div>
              <div class="space-y-2">
                <div>
                  <p class="font-bold">Objetivo:</p>
                  <p class="text-[10px] min-h-[20px] border-b border-gray-300">{{ form.objective || '-' }}</p>
                </div>
                <div>
                  <p class="font-bold">Instrumentos:</p>
                  <p class="text-[10px] min-h-[20px] border-b border-gray-300">{{ form.instruments || '-' }}</p>
                </div>
                <div>
                  <p class="font-bold">Comportamento:</p>
                  <p class="text-[10px] min-h-[20px] border-b border-gray-300">{{ form.studentBehavior || '-' }}</p>
                </div>
                <div>
                  <p class="font-bold">Atividades:</p>
                  <p class="text-[10px] min-h-[20px] border-b border-gray-300">{{ form.activities || '-' }}</p>
                </div>
                <div>
                  <p class="font-bold">Observações:</p>
                  <p class="text-[10px] min-h-[20px] border-b border-gray-300">{{ form.observations || '-' }}</p>
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
export class DiarioSessaoComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  saving = signal(false);
  patients = signal<any[]>([]);

  form: any = {
    pacienteId: '',
    sessionNumber: 1,
    date: new Date().toISOString().split('T')[0],
    professionalName: '',
    objective: '',
    instruments: '',
    studentBehavior: '',
    activities: '',
    observations: ''
  };

  ngOnInit() {
    this.api.get('/pacientes').subscribe((res: any) => this.patients.set(res.data || []));
  }

  getPatientName(): string {
    const p = this.patients().find(p => p.id === this.form.pacienteId);
    return p?.name || '-';
  }

  save() {
    if (!this.form.pacienteId || !this.form.date) return;
    this.saving.set(true);
    this.api.post('/session-diaries', this.form).subscribe({
      next: () => {
        this.saving.set(false);
        alert('Diário salvo com sucesso!');
      },
      error: () => {
        this.saving.set(false);
        alert('Erro ao salvar diário');
      }
    });
  }

  exportPDF() {
    const content = document.getElementById('pdf-preview');
    if (!content) return;

    import('html2pdf.js').then(html2pdf => {
      html2pdf.default()
        .set({
          margin: 10,
          filename: `diario-sessao-${this.form.date || 'sem-data'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(content)
        .save();
    });
  }
}
