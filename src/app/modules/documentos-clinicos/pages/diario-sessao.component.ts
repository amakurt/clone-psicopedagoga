import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';
import { MaterialPickerModalComponent } from '@shared/components/material-picker-modal.component';
import { MateriaisService } from '../../biblioteca/services/materiais.service';
import { MaterialTerapeutico } from '@core/data/materiais-reais.data';

@Component({
  selector: 'app-diario-sessao',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MaterialPickerModalComponent],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/app/documentos" class="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
            <span class="material-icons text-slate-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white">Diário de Sessões</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Registro detalhado de cada sessão de acompanhamento clínico</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button (click)="exportPDF()" [disabled]="!form.pacienteId"
            class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20">
            <span class="material-icons text-[18px]">picture_as_pdf</span>
            Exportar PDF
          </button>
          <button (click)="save()" [disabled]="saving() || !form.pacienteId || !form.date"
            class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm disabled:opacity-50 transition-all flex items-center gap-2 shadow-xl shadow-primary/20 active:scale-95">
            <span class="material-icons text-[18px]">save</span>
            {{ saving() ? 'Salvando...' : 'Salvar Diário' }}
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
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Paciente *</label>
                  <select [(ngModel)]="form.pacienteId" (change)="loadRecords()"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white">
                    <option value="">Selecione um paciente</option>
                    @for (p of patients(); track p.id) {
                      <option [value]="p.id">{{ p.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Data *</label>
                  <input type="date" [(ngModel)]="form.date"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nº da Sessão</label>
                  <input type="number" [(ngModel)]="form.sessionNumber"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white"
                    placeholder="Ex: 1">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Profissional</label>
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
                <h3 class="font-bold text-slate-900 dark:text-white">Conteúdo e Intervenção</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Registre os detalhes do atendimento e materiais aplicados</p>
              </div>
            </div>
            <div class="p-6 space-y-5">
              <div>
                <label class="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  <span class="material-icons text-[14px]">flag</span>
                  Objetivo
                </label>
                <textarea [(ngModel)]="form.objective" rows="2"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white resize-y min-h-[60px]"
                  placeholder="Qual o objetivo desta sessão?"></textarea>
              </div>

              <!-- Instrumentos e Materiais da Biblioteca -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span class="material-icons text-[14px]">build</span>
                    Instrumentos e Recursos Terapêuticos
                  </label>
                  <button type="button" (click)="showPicker.set(true)"
                    class="px-3 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1">
                    <span class="material-icons text-[14px]">folder_special</span>
                    Inserir Materiais da Biblioteca
                  </button>
                </div>

                <!-- Chips dos Materiais Inseridos -->
                @if (selectedMaterials().length > 0) {
                  <div class="flex flex-wrap gap-2 mb-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                    @for (mat of selectedMaterials(); track mat.id) {
                      <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-xs border border-slate-100 dark:border-slate-600">
                        <span class="material-icons text-primary text-sm">description</span>
                        <span class="font-bold text-slate-800 dark:text-slate-200">{{ mat.name }}</span>
                        <button type="button" (click)="materiaisService.generateMaterialPdf(mat)" class="text-emerald-500 hover:text-emerald-600 ml-1" title="Baixar PDF">
                          <span class="material-icons text-xs">download</span>
                        </button>
                        <button type="button" (click)="removeMaterial(mat.id)" class="text-red-400 hover:text-red-600 ml-0.5" title="Remover">
                          <span class="material-icons text-xs">close</span>
                        </button>
                      </div>
                    }
                  </div>
                }

                <textarea [(ngModel)]="form.instruments" rows="2"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white resize-y min-h-[60px]"
                  placeholder="Materiais e instrumentos utilizados na sessão"></textarea>
              </div>

              <div>
                <label class="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  <span class="material-icons text-[14px]">psychology</span>
                  Comportamento e Resposta do Paciente
                </label>
                <textarea [(ngModel)]="form.studentBehavior" rows="3"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white resize-y min-h-[80px]"
                  placeholder="Como o aluno se comportou, foco atencional, tolerância à frustração..."></textarea>
              </div>

              <div>
                <label class="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  <span class="material-icons text-[14px]">assignment</span>
                  Atividades Realizadas e Mediações
                </label>
                <textarea [(ngModel)]="form.activities" rows="3"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white resize-y min-h-[80px]"
                  placeholder="Descreva as atividades executadas e estratégias de intervenção"></textarea>
              </div>

              <div>
                <label class="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  <span class="material-icons text-[14px]">sticky_note_2</span>
                  Observações e Próximos Passos
                </label>
                <textarea [(ngModel)]="form.observations" rows="2"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white resize-y min-h-[60px]"
                  placeholder="Orientações aos pais, tarefas ou planejamento para a próxima sessão"></textarea>
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
                <div class="text-center mb-4">
                  <div class="size-10 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-2 text-white">
                    <span class="material-icons text-lg">menu_book</span>
                  </div>
                  <h4 class="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">DIÁRIO DE SESSÃO CLÍNICA</h4>
                  <p class="text-[9px] text-slate-500">EduPsych Pro · Neuropsicopedagogia Integrada</p>
                </div>
                
                <div class="space-y-1.5 mb-4 p-2.5 bg-white dark:bg-slate-700 rounded-xl text-[11px]">
                  <p><strong>Paciente:</strong> {{ getPatientName() }}</p>
                  <p><strong>Nº Sessão:</strong> {{ form.sessionNumber || '-' }} &nbsp;|&nbsp; <strong>Data:</strong> {{ form.date || '-' }}</p>
                  <p><strong>Profissional:</strong> {{ form.professionalName || '-' }}</p>
                </div>

                <div class="space-y-2.5">
                  <div class="p-2.5 bg-white dark:bg-slate-700 rounded-xl">
                    <p class="font-bold text-[10px] uppercase text-primary mb-0.5">🎯 Objetivo</p>
                    <p class="text-[11px] text-slate-600 dark:text-slate-300">{{ form.objective || '—' }}</p>
                  </div>

                  <div class="p-2.5 bg-white dark:bg-slate-700 rounded-xl">
                    <p class="font-bold text-[10px] uppercase text-violet-500 mb-0.5">🛠️ Instrumentos & Recursos</p>
                    <p class="text-[11px] text-slate-600 dark:text-slate-300">{{ form.instruments || '—' }}</p>
                    @if (selectedMaterials().length > 0) {
                      <div class="mt-1 flex flex-wrap gap-1">
                        @for (m of selectedMaterials(); track m.id) {
                          <span class="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">
                            ✓ {{ m.name }}
                          </span>
                        }
                      </div>
                    }
                  </div>

                  <div class="p-2.5 bg-white dark:bg-slate-700 rounded-xl">
                    <p class="font-bold text-[10px] uppercase text-amber-500 mb-0.5">🧠 Comportamento</p>
                    <p class="text-[11px] text-slate-600 dark:text-slate-300">{{ form.studentBehavior || '—' }}</p>
                  </div>

                  <div class="p-2.5 bg-white dark:bg-slate-700 rounded-xl">
                    <p class="font-bold text-[10px] uppercase text-emerald-500 mb-0.5">📋 Atividades</p>
                    <p class="text-[11px] text-slate-600 dark:text-slate-300">{{ form.activities || '—' }}</p>
                  </div>

                  <div class="p-2.5 bg-white dark:bg-slate-700 rounded-xl">
                    <p class="font-bold text-[10px] uppercase text-rose-500 mb-0.5">📝 Observações</p>
                    <p class="text-[11px] text-slate-600 dark:text-slate-300">{{ form.observations || '—' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Registros Anteriores -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <span class="material-icons text-indigo-500 text-xl">history</span>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white">Histórico de Diários</h3>
              <p class="text-xs text-slate-500">{{ records().length }} registro(s) arquivado(s)</p>
            </div>
          </div>
          @if (editingId()) {
            <button class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl" (click)="resetForm()">
              + Novo Diário
            </button>
          }
        </div>

        @if (records().length === 0) {
          <div class="p-8 text-center text-slate-400 text-xs">
            Nenhum diário registrado para o paciente selecionado.
          </div>
        } @else {
          <div class="p-6 divide-y divide-slate-100 dark:divide-slate-800">
            @for (r of records(); track r.id) {
              <div class="py-3 flex items-center justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-slate-900 dark:text-white">Sessão {{ r.sessionNumber || '—' }}</span>
                    <span class="text-xs text-slate-400">{{ r.date }}</span>
                  </div>
                  <p class="text-xs text-slate-500 truncate mt-0.5">{{ r.objective || r.instruments || 'Sem descrição' }}</p>
                </div>
                <div class="flex items-center gap-1">
                  <button (click)="editRecord(r)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl" title="Editar">
                    <span class="material-icons text-base text-slate-500">edit</span>
                  </button>
                  <button (click)="deleteRecord(r)" class="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl" title="Excluir">
                    <span class="material-icons text-base text-red-500">delete</span>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Material Picker Modal -->
      @if (showPicker()) {
        <app-material-picker-modal
          [initialSelectedIds]="getSelectedMaterialIds()"
          (confirmed)="onMaterialsConfirmed($event)"
          (closed)="showPicker.set(false)">
        </app-material-picker-modal>
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class DiarioSessaoComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  materiaisService = inject(MateriaisService);

  saving = signal(false);
  patients = signal<any[]>([]);
  records = signal<any[]>([]);
  editingId = signal('');
  showPicker = signal(false);
  selectedMaterials = signal<MaterialTerapeutico[]>([]);

  form: any = {
    pacienteId: '',
    sessionNumber: 1,
    date: new Date().toISOString().split('T')[0],
    professionalName: '',
    objective: '',
    instruments: '',
    studentBehavior: '',
    activities: '',
    observations: '',
    materials: ''
  };

  ngOnInit() {
    this.api.get('/pacientes').subscribe((res: any) => {
      const list = res.data || res || [];
      this.patients.set(list);

      const qp = this.route.snapshot.queryParams['pacienteId'];
      const qd = this.route.snapshot.queryParams['date'];
      if (qp) {
        this.form.pacienteId = qp;
        if (qd) this.form.date = qd;
        this.loadRecords();
      }
    });
  }

  loadRecords() {
    if (!this.form.pacienteId) {
      this.records.set([]);
      return;
    }
    this.api.get('/session-diaries', { pacienteId: this.form.pacienteId }).subscribe((res: any) => {
      const list = res.data || res || [];
      this.records.set(list.sort((a: any, b: any) => (b.date || '').localeCompare(a.date || '')));
      if (list.length > 0) {
        this.form.sessionNumber = list.length + 1;
      }
    });
  }

  getSelectedMaterialIds(): number[] {
    return this.selectedMaterials().map(m => m.id);
  }

  onMaterialsConfirmed(mats: MaterialTerapeutico[]) {
    this.selectedMaterials.set(mats);
    this.showPicker.set(false);

    // Auto-enrich instruments field if empty or append
    const names = mats.map(m => m.name).join('; ');
    if (!this.form.instruments) {
      this.form.instruments = names;
    } else if (!this.form.instruments.includes(names)) {
      this.form.instruments += ` | ${names}`;
    }
    this.toast.success(`${mats.length} material(is) inserido(s) no diário!`);
  }

  removeMaterial(id: number) {
    this.selectedMaterials.set(this.selectedMaterials().filter(m => m.id !== id));
  }

  editRecord(r: any) {
    this.editingId.set(r.id);
    this.form = { ...r };
    if (r.materials) {
      try {
        const parsed = JSON.parse(r.materials);
        if (Array.isArray(parsed)) {
          const full = parsed.map(p => this.materiaisService.getById(p.id) || p);
          this.selectedMaterials.set(full);
        }
      } catch {
        this.selectedMaterials.set([]);
      }
    }
  }

  resetForm() {
    this.editingId.set('');
    this.selectedMaterials.set([]);
    this.form = {
      pacienteId: this.form.pacienteId,
      sessionNumber: this.records().length + 1,
      date: new Date().toISOString().split('T')[0],
      professionalName: '',
      objective: '',
      instruments: '',
      studentBehavior: '',
      activities: '',
      observations: '',
      materials: ''
    };
  }

  deleteRecord(r: any) {
    if (!confirm(`Excluir o diário da sessão ${r.sessionNumber} (${r.date})?`)) return;
    this.api.delete(`/session-diaries/${r.id}`).subscribe({
      next: () => {
        this.toast.success('Diário excluído');
        this.loadRecords();
      },
      error: () => this.toast.error('Erro ao excluir diário')
    });
  }

  getPatientName(): string {
    const p = this.patients().find(p => p.id === this.form.pacienteId);
    return p?.name || '-';
  }

  save() {
    if (!this.form.pacienteId || !this.form.date) return;
    this.saving.set(true);

    this.form.materials = JSON.stringify(this.selectedMaterials().map(m => ({
      id: m.id,
      name: m.name,
      subcategory: m.subcategory
    })));

    const req = this.editingId()
      ? this.api.put(`/session-diaries/${this.editingId()}`, this.form)
      : this.api.post('/session-diaries', this.form);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Diário de sessão salvo com sucesso!');
        this.resetForm();
        this.loadRecords();
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
