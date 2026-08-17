import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-frequencia-form',
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
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Ficha de Frequência</h1>
            <p class="text-sm text-gray-500 dark:text-slate-400">Registro de frequência em Neuropsicopedagogia Clínica</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button (click)="exportPDF()" [disabled]="!form.pacienteId"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center gap-2">
            <span class="material-icons">picture_as_pdf</span>
            Exportar PDF
          </button>
          <button (click)="save()" [disabled]="saving() || !form.pacienteId || !form.date"
            class="px-6 py-2 bg-primary hover:bg-primary-dark text-on-primary rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center gap-2">
            <span class="material-icons">save</span>
            {{ saving() ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Form -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dados do Atendimento</h3>
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
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Data *</label>
                <input type="date" [(ngModel)]="form.date"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Horário de Entrada</label>
                <input type="time" [(ngModel)]="form.entryTime"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Horário de Saída</label>
                <input type="time" [(ngModel)]="form.exitTime"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detalhes do Atendimento</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Atividades Realizadas</label>
                <textarea [(ngModel)]="form.activities" rows="4"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-y"
                  placeholder="Descreva as atividades realizadas durante o atendimento"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Instrumentos Utilizados</label>
                <textarea [(ngModel)]="form.instruments" rows="3"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-y"
                  placeholder="Materiais e instrumentos utilizados"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Observações</label>
                <textarea [(ngModel)]="form.observations" rows="3"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-y"
                  placeholder="Observações adicionais"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Rubrica do Responsável</label>
                <input type="text" [(ngModel)]="form.guardianSignature"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Nome do responsável que assina">
              </div>
            </div>
          </div>
        </div>

        <!-- Preview PDF -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 sticky top-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview do Documento</h3>
            <div id="pdf-preview-frequencia" class="aspect-[3/4] bg-gray-100 dark:bg-slate-700 rounded-xl p-4 overflow-auto text-xs text-gray-700 dark:text-slate-300">
              <div class="text-center mb-4">
                <h4 class="font-bold text-sm">FICHA DE FREQUÊNCIA</h4>
                <p class="text-[10px] text-gray-500">Neuropsicopedagogia Clínica</p>
              </div>
              <div class="space-y-2 mb-4">
                <p><strong>Aluno:</strong> {{ getPatientName() }}</p>
                <p><strong>Data:</strong> {{ form.date || '-' }}</p>
                <div class="grid grid-cols-2 gap-2">
                  <p><strong>Entrada:</strong> {{ form.entryTime || '-' }}</p>
                  <p><strong>Saída:</strong> {{ form.exitTime || '-' }}</p>
                </div>
              </div>
              <div class="space-y-3">
                <div>
                  <p class="font-bold border-b border-gray-300 pb-1">Atividades Realizadas:</p>
                  <p class="text-[10px] min-h-[30px]">{{ form.activities || '-' }}</p>
                </div>
                <div>
                  <p class="font-bold border-b border-gray-300 pb-1">Instrumentos Utilizados:</p>
                  <p class="text-[10px] min-h-[20px]">{{ form.instruments || '-' }}</p>
                </div>
                <div>
                  <p class="font-bold border-b border-gray-300 pb-1">Observações:</p>
                  <p class="text-[10px] min-h-[20px]">{{ form.observations || '-' }}</p>
                </div>
                <div class="mt-8 pt-4 border-t border-gray-300">
                  <p class="text-[10px]">Rubrica do Responsável: _________________________</p>
                  <p class="text-[10px] mt-2">{{ form.guardianSignature || 'Assinatura' }}</p>
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
            <div class="size-10 rounded-xl bg-green-600/10 flex items-center justify-center">
              <span class="material-icons text-green-600 text-xl">history</span>
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
            <span class="material-icons text-4xl text-gray-300 dark:text-slate-600">fact_check</span>
            <p class="mt-3 text-sm font-semibold text-gray-500 dark:text-slate-400">Nenhum registro para este paciente</p>
            <p class="text-xs text-gray-400 dark:text-slate-500 mt-1">Selecione um paciente para listar as fichas salvas</p>
          </div>
        } @else {
          <div class="divide-y divide-gray-100 dark:divide-slate-700">
            @for (r of records(); track r.id) {
              <div class="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div class="w-10 h-10 rounded-xl bg-green-600/10 flex items-center justify-center shrink-0">
                  <span class="material-icons text-green-600 text-lg">fact_check</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ r.date }} · {{ r.entryTime || '—' }} – {{ r.exitTime || '—' }}</p>
                  <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                    {{ r.activities || 'Sem atividades' }} · {{ r.guardianSignature ? 'Rubrica: ' + r.guardianSignature : '' }}
                  </p>
                </div>
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
export class FrequenciaFormComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  saving = signal(false);
  patients = signal<any[]>([]);
  records = signal<any[]>([]);
  editingId = signal('');

  form: any = {
    pacienteId: '',
    date: new Date().toISOString().split('T')[0],
    entryTime: '',
    exitTime: '',
    activities: '',
    instruments: '',
    observations: '',
    guardianSignature: ''
  };

  ngOnInit() {
    this.api.get('/pacientes').subscribe((res: any) => this.patients.set(res.data || []));
  }

  loadRecords() {
    if (!this.form.pacienteId) {
      this.records.set([]);
      return;
    }
    this.api.get('/frequency-sheets', { pacienteId: this.form.pacienteId }).subscribe((res: any) => {
      this.records.set((res.data || []).sort((a: any, b: any) => (b.date || '').localeCompare(a.date || '')));
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
      date: new Date().toISOString().split('T')[0],
      entryTime: '',
      exitTime: '',
      activities: '',
      instruments: '',
      observations: '',
      guardianSignature: ''
    };
  }

  deleteRecord(r: any) {
    if (!confirm(`Excluir a ficha de ${r.date}?`)) return;
    this.api.delete(`/frequency-sheets/${r.id}`).subscribe({
      next: () => {
        this.toast.success('Ficha excluída');
        this.loadRecords();
      },
      error: () => this.toast.error('Erro ao excluir ficha')
    });
  }

  getPatientName(): string {
    const p = this.patients().find(p => p.id === this.form.pacienteId);
    return p?.name || '-';
  }

  save() {
    if (!this.form.pacienteId || !this.form.date) return;
    this.saving.set(true);
    const req = this.editingId()
      ? this.api.put(`/frequency-sheets/${this.editingId()}`, this.form)
      : this.api.post('/frequency-sheets', this.form);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Ficha de frequência salva com sucesso!');
        this.resetForm();
        this.loadRecords();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erro ao salvar ficha de frequência');
      }
    });
  }

  exportPDF() {
    const content = document.getElementById('pdf-preview-frequencia');
    if (!content) return;

    import('html2pdf.js').then(html2pdf => {
      html2pdf.default()
        .set({
          margin: 10,
          filename: `frequencia-${this.form.date || 'sem-data'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(content)
        .save();
    });
  }
}
