import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-diario-sessao',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/app/documentos" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <span class="material-icons text-slate-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white">Diário de Sessões</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Registro detalhado de cada sessão de acompanhamento</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button (click)="exportPDF()" [disabled]="!form.pacienteId"
            class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20">
            <span class="material-icons text-[18px]">picture_as_pdf</span>
            Exportar PDF
          </button>
          <button (click)="save()" [disabled]="saving() || !form.pacienteId || !form.date"
            class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm disabled:opacity-50 transition-all flex items-center gap-2 shadow-xl shadow-primary/20 active:scale-95">
            <span class="material-icons text-[18px]">save</span>
            {{ saving() ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Form -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Dados da Sessão -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div class="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span class="material-icons text-primary text-xl">event_note</span>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 dark:text-white">Dados da Sessão</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Informações básicas do atendimento</p>
              </div>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Paciente *</label>
                  <select [(ngModel)]="form.pacienteId"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white">
                    <option value="">Selecione um paciente</option>
                    @for (p of patients(); track p.id) {
                      <option [value]="p.id">{{ p.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Data *</label>
                  <input type="date" [(ngModel)]="form.date"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Nº da Sessão</label>
                  <input type="number" [(ngModel)]="form.sessionNumber"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white"
                    placeholder="Ex: 1">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Profissional</label>
                  <input type="text" [(ngModel)]="form.professionalName"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white"
                    placeholder="Nome do profissional">
                </div>
              </div>
            </div>
          </div>

          <!-- Conteúdo da Sessão -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div class="size-10 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <span class="material-icons text-violet-500 text-xl">edit_note</span>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 dark:text-white">Conteúdo da Sessão</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Registre os detalhes do atendimento</p>
              </div>
            </div>
            <div class="p-6 space-y-5">
              <div>
                <label class="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <span class="material-icons text-[14px]">flag</span>
                  Objetivo
                </label>
                <textarea [(ngModel)]="form.objective" rows="3"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white resize-y min-h-[80px]"
                  placeholder="Qual o objetivo desta sessão?"></textarea>
              </div>
              <div>
                <label class="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <span class="material-icons text-[14px]">build</span>
                  Instrumentos Utilizados
                </label>
                <textarea [(ngModel)]="form.instruments" rows="3"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white resize-y min-h-[80px]"
                  placeholder="Materiais e instrumentos utilizados"></textarea>
              </div>
              <div>
                <label class="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <span class="material-icons text-[14px]">psychology</span>
                  Comportamento do Aluno
                </label>
                <textarea [(ngModel)]="form.studentBehavior" rows="4"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white resize-y min-h-[100px]"
                  placeholder="Como o aluno se comportou durante a sessão?"></textarea>
              </div>
              <div>
                <label class="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <span class="material-icons text-[14px]">assignment</span>
                  Atividades Realizadas
                </label>
                <textarea [(ngModel)]="form.activities" rows="4"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white resize-y min-h-[100px]"
                  placeholder="Descreva as atividades realizadas na sessão"></textarea>
              </div>
              <div>
                <label class="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <span class="material-icons text-[14px]">sticky_note_2</span>
                  Observações
                </label>
                <textarea [(ngModel)]="form.observations" rows="3"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white resize-y min-h-[80px]"
                  placeholder="Observações adicionais"></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview PDF -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden sticky top-4">
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div class="size-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <span class="material-icons text-rose-500 text-xl">preview</span>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 dark:text-white">Preview do Documento</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Visualize antes de exportar</p>
              </div>
            </div>
            <div class="p-6">
              <div id="pdf-preview" class="aspect-[3/4] bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 overflow-auto text-xs text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700">
                <div class="text-center mb-5">
                  <div class="size-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span class="material-icons text-white text-xl">menu_book</span>
                  </div>
                  <h4 class="font-black text-sm text-slate-900 dark:text-white">DIÁRIO DE SESSÕES</h4>
                  <p class="text-[10px] text-slate-500 mt-1">Neuropsicopedagogia Clínica</p>
                </div>
                <div class="space-y-2.5 mb-5 p-3 bg-white dark:bg-slate-700 rounded-xl">
                  <p class="flex items-center gap-2"><span class="material-icons text-[12px] text-primary">person</span> <strong>Aluno:</strong> {{ getPatientName() }}</p>
                  <p class="flex items-center gap-2"><span class="material-icons text-[12px] text-primary">tag</span> <strong>Nº Sessão:</strong> {{ form.sessionNumber || '-' }}</p>
                  <p class="flex items-center gap-2"><span class="material-icons text-[12px] text-primary">calendar_today</span> <strong>Data:</strong> {{ form.date || '-' }}</p>
                  <p class="flex items-center gap-2"><span class="material-icons text-[12px] text-primary">badge</span> <strong>Profissional:</strong> {{ form.professionalName || '-' }}</p>
                </div>
                <div class="space-y-3">
                  <div class="p-3 bg-white dark:bg-slate-700 rounded-xl">
                    <p class="font-bold text-[10px] uppercase tracking-wider text-primary mb-1 flex items-center gap-1">
                      <span class="material-icons text-[10px]">flag</span> Objetivo
                    </p>
                    <p class="text-[11px] min-h-[18px] text-slate-600 dark:text-slate-300">{{ form.objective || '—' }}</p>
                  </div>
                  <div class="p-3 bg-white dark:bg-slate-700 rounded-xl">
                    <p class="font-bold text-[10px] uppercase tracking-wider text-violet-500 mb-1 flex items-center gap-1">
                      <span class="material-icons text-[10px]">build</span> Instrumentos
                    </p>
                    <p class="text-[11px] min-h-[18px] text-slate-600 dark:text-slate-300">{{ form.instruments || '—' }}</p>
                  </div>
                  <div class="p-3 bg-white dark:bg-slate-700 rounded-xl">
                    <p class="font-bold text-[10px] uppercase tracking-wider text-amber-500 mb-1 flex items-center gap-1">
                      <span class="material-icons text-[10px]">psychology</span> Comportamento
                    </p>
                    <p class="text-[11px] min-h-[18px] text-slate-600 dark:text-slate-300">{{ form.studentBehavior || '—' }}</p>
                  </div>
                  <div class="p-3 bg-white dark:bg-slate-700 rounded-xl">
                    <p class="font-bold text-[10px] uppercase tracking-wider text-emerald-500 mb-1 flex items-center gap-1">
                      <span class="material-icons text-[10px]">assignment</span> Atividades
                    </p>
                    <p class="text-[11px] min-h-[18px] text-slate-600 dark:text-slate-300">{{ form.activities || '—' }}</p>
                  </div>
                  <div class="p-3 bg-white dark:bg-slate-700 rounded-xl">
                    <p class="font-bold text-[10px] uppercase tracking-wider text-rose-500 mb-1 flex items-center gap-1">
                      <span class="material-icons text-[10px]">sticky_note_2</span> Observações
                    </p>
                    <p class="text-[11px] min-h-[18px] text-slate-600 dark:text-slate-300">{{ form.observations || '—' }}</p>
                  </div>
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
  private toast = inject(ToastService);

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
        this.toast.success('Diário salvo com sucesso!');
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erro ao salvar diário');
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
