import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AbaService } from '../services/aba.service';
import { AuthService } from '@core/services/auth.service';
import { ApiService } from '@core/services/api.service';
import { Chart, registerables } from 'chart.js';
import { ConfirmModalComponent } from '@shared/components/confirm-modal.component';

Chart.register(...registerables);

@Component({
  selector: 'app-aba-programs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmModalComponent],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Programas de Ensino ABA</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie programas de intervenção e coleta de dados</p>
        </div>
        <button (click)="showForm.set(true)"
          class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
          <span class="material-icons text-[18px]">add</span>
          Novo Programa
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 items-center">
        <select [(ngModel)]="filterPatientId" (ngModelChange)="loadPrograms()" class="w-full sm:w-auto px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium">
          <option value="">Todos os pacientes</option>
          @for (p of patients(); track p.id) {
            <option [value]="p.id">{{ p.name }}</option>
          }
        </select>
        <select [(ngModel)]="filterStatus" (ngModelChange)="loadPrograms()" class="w-full sm:w-auto px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium">
          <option value="">Todos os status</option>
          <option value="ATIVO">Ativo</option>
          <option value="PAUSADO">Pausado</option>
          <option value="CONCLUIDO">Concluído</option>
        </select>
      </div>

      @if (showForm()) {
        <!-- Program Form -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-black text-slate-900 dark:text-white">{{ editingProgram() ? 'Editar Programa' : 'Novo Programa' }}</h3>
            <button (click)="closeForm()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
              <span class="material-icons text-slate-500">close</span>
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Paciente *</label>
              <select [(ngModel)]="form.patientId" class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium">
                <option value="">Selecione</option>
                @for (p of patients(); track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Status</label>
              <select [(ngModel)]="form.status" class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium">
                <option value="ATIVO">Ativo</option>
                <option value="PAUSADO">Pausado</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Comportamento-Alvo *</label>
              <input type="text" [(ngModel)]="form.targetBehavior" placeholder="Ex: Aumentar vocabulário expressivo..."
                class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium">
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Estratégia de Intervenção *</label>
              <textarea [(ngModel)]="form.interventionStrategy" rows="2" placeholder="Descreva a estratégia de intervenção..."
                class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium resize-none"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Método de Coleta</label>
              <select [(ngModel)]="form.dataCollectionMethod" class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium">
                <option value="">Selecione</option>
                <option value="ABC">ABC (Antecedente-Behavior-Consequence)</option>
                <option value="FREQ">Frequência</option>
                <option value="DUR">Duração</option>
                <option value="LAT">Latência</option>
                <option value="INT">Intensidade</option>
                <option value="PERC">Porcentagem de Acerto</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Data de Início</label>
              <input type="date" [(ngModel)]="form.startDate" class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium">
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Observações</label>
              <textarea [(ngModel)]="form.notes" rows="2" placeholder="Observações adicionais..."
                class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium resize-none"></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button (click)="closeForm()" class="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all">
              Cancelar
            </button>
            <button (click)="saveProgram()" [disabled]="savingForm() || !form.patientId || !form.targetBehavior"
              class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-bold text-sm transition-all disabled:opacity-50">
              {{ savingForm() ? 'Salvando...' : 'Salvar Programa' }}
            </button>
          </div>
        </div>
      }

      <!-- Programs List -->
      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      } @else if (programs().length === 0) {
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-12 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 text-center">
          <span class="material-icons text-6xl text-slate-300 dark:text-slate-600">school</span>
          <h3 class="mt-4 text-lg font-bold text-slate-900 dark:text-white">Nenhum programa encontrado</h3>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Crie um novo programa de ensino para começar</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-4">
          @for (program of programs(); track program.id) {
            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="size-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      [style.background]="getStatusColor(program.status)">
                      <span class="material-icons text-[18px]">{{ program.status === 'ATIVO' ? 'play_arrow' : program.status === 'PAUSADO' ? 'pause' : 'check_circle' }}</span>
                    </div>
                    <div>
                      <h4 class="text-sm font-black text-slate-900 dark:text-white">{{ program.targetBehavior }}</h4>
                      <p class="text-xs text-slate-500">{{ getPatientName(program.patientId) }} — {{ program.interventionStrategy | slice:0:80 }}{{ program.interventionStrategy.length > 80 ? '...' : '' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1">
                    <button (click)="openDataForm(program)" class="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all" title="Adicionar dado">
                      <span class="material-icons text-lg">add_chart</span>
                    </button>
                    <button (click)="editProgram(program)" class="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all" title="Editar">
                      <span class="material-icons text-lg">edit</span>
                    </button>
                    <button (click)="deleteProgram(program)" class="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Excluir">
                      <span class="material-icons text-lg">delete</span>
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-3 mb-4">
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                    <p class="text-sm font-black mt-1" [class]="getStatusTextClass(program.status)">{{ program.status }}</p>
                  </div>
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Coleta</p>
                    <p class="text-sm font-black text-slate-900 dark:text-white mt-1">{{ program.dataCollectionMethod || '—' }}</p>
                  </div>
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Dados</p>
                    <p class="text-sm font-black text-slate-900 dark:text-white mt-1">{{ program.dataPoints?.length || 0 }}</p>
                  </div>
                </div>

                @if (program.dataPoints && program.dataPoints.length > 0) {
                  <div class="mt-4">
                    <p class="text-xs font-bold text-slate-500 mb-2">Progresso</p>
                    <div class="h-24">
                      <canvas #programChart [attr.data-program-id]="program.id"></canvas>
                    </div>
                  </div>
                }

                <!-- Data Points Table -->
                @if (expandedProgramId() === program.id && program.dataPoints && program.dataPoints.length > 0) {
                  <div class="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <p class="text-xs font-bold text-slate-500 mb-2">Histórico de Dados</p>
                    <div class="space-y-2 max-h-48 overflow-y-auto">
                      @for (dp of program.dataPoints; track dp.id) {
                        <div class="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <p class="text-xs font-bold text-slate-900 dark:text-white">{{ dp.date | date:'dd/MM/yyyy HH:mm' }}</p>
                            @if (dp.note) { <p class="text-[10px] text-slate-500">{{ dp.note }}</p> }
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-black text-primary">{{ dp.value }}</span>
                            <button (click)="deleteDataPoint(dp, program)" class="p-1 text-slate-500 hover:text-red-500 rounded">
                              <span class="material-icons text-sm">close</span>
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <button (click)="toggleExpand(program.id)" class="mt-3 text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                  {{ expandedProgramId() === program.id ? 'Recolher' : 'Ver detalhes' }}
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Data Point Modal -->
      @if (showDataForm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-black text-slate-900 dark:text-white">Adicionar Dado</h3>
              <button (click)="showDataForm.set(false)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <span class="material-icons text-slate-500">close</span>
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Data e Hora</label>
                <input type="datetime-local" [(ngModel)]="dataForm.date" class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Valor *</label>
                <input type="number" step="0.1" [(ngModel)]="dataForm.value" placeholder="0"
                  class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Observação</label>
                <textarea [(ngModel)]="dataForm.note" rows="2" placeholder="Observação opcional..."
                  class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium resize-none"></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button (click)="showDataForm.set(false)" class="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-sm">Cancelar</button>
              <button (click)="saveDataPoint()" [disabled]="!dataForm.value && dataForm.value !== 0"
                class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-bold text-sm transition-all disabled:opacity-50">
                Salvar Dado
              </button>
            </div>
          </div>
        </div>
      }
    </div>

    @if (showToast()) {
      <div class="fixed bottom-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 animate-in shadow-lg" [class]="toastType() === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'">
        <span class="material-icons">{{ toastType() === 'success' ? 'check_circle' : 'error' }}</span>
        <span class="text-sm font-medium">{{ toastMessage() }}</span>
      </div>
    }

    <app-confirm-modal
      [isOpen]="showDeleteModal()"
      title="Excluir programa"
      message="Tem certeza que deseja excluir este programa de ensino? Esta ação não pode ser desfeita."
      confirmText="Excluir"
      [dangerMode]="true"
      (closed)="showDeleteModal.set(false)"
      (confirmed)="confirmDeleteProgram()" />
  `,
  styles: [`:host { display: block; }`]
})
export class AbaProgramsComponent implements OnInit {
  @ViewChild('programChart') programChartRef!: ElementRef<HTMLCanvasElement>;

  private abaService = inject(AbaService);
  private api = inject(ApiService);
  private auth = inject(AuthService);

  patients = signal<any[]>([]);
  programs = signal<any[]>([]);
  loading = signal(true);
  showForm = signal(false);
  showDataForm = signal(false);
  savingForm = signal(false);
  editingProgram = signal<any>(null);
  expandedProgramId = signal<string | null>(null);
  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  showDeleteModal = signal(false);
  programToDelete = signal<any>(null);

  filterPatientId = '';
  filterStatus = '';

  form = {
    patientId: '',
    targetBehavior: '',
    interventionStrategy: '',
    dataCollectionMethod: '',
    status: 'ATIVO',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  };

  dataForm = {
    date: new Date().toISOString().slice(0, 16),
    value: 0,
    note: ''
  };

  private activeDataProgramId = '';
  private charts: Chart[] = [];

  ngOnInit() {
    this.api.get('/pacientes').subscribe((res: any) => {
      this.patients.set(res.data || []);
      this.loadPrograms();
    });
  }

  loadPrograms() {
    this.loading.set(true);
    const params: any = {};
    if (this.filterPatientId) params.patientId = this.filterPatientId;
    if (this.filterStatus) params.status = this.filterStatus;

    this.abaService.listPrograms(params).subscribe({
      next: (res: any) => {
        this.programs.set(res.data || []);
        this.loading.set(false);
        setTimeout(() => this.renderCharts(), 200);
      },
      error: () => this.loading.set(false)
    });
  }

  renderCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    this.programs().forEach(program => {
      if (!program.dataPoints || program.dataPoints.length === 0) return;
      const canvas = document.querySelector(`canvas[data-program-id="${program.id}"]`) as HTMLCanvasElement;
      if (!canvas) return;

      const chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: program.dataPoints.map((dp: any) => new Date(dp.date).toLocaleDateString('pt-BR')),
          datasets: [{
            label: 'Valor',
            data: program.dataPoints.map((dp: any) => dp.value),
            borderColor: '#007F80',
            backgroundColor: '#007F8020',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#007F80'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } }
          },
          plugins: { legend: { display: false } }
        }
      });
      this.charts.push(chart);
    });
  }

  closeForm() {
    this.showForm.set(false);
    this.editingProgram.set(null);
    this.resetForm();
  }

  resetForm() {
    this.form = {
      patientId: '',
      targetBehavior: '',
      interventionStrategy: '',
      dataCollectionMethod: '',
      status: 'ATIVO',
      startDate: new Date().toISOString().split('T')[0],
      notes: ''
    };
  }

  editProgram(program: any) {
    this.editingProgram.set(program);
    this.form = {
      patientId: program.patientId,
      targetBehavior: program.targetBehavior,
      interventionStrategy: program.interventionStrategy,
      dataCollectionMethod: program.dataCollectionMethod || '',
      status: program.status,
      startDate: program.startDate ? new Date(program.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: program.notes || ''
    };
    this.showForm.set(true);
  }

  saveProgram() {
    if (!this.form.patientId || !this.form.targetBehavior) return;
    this.savingForm.set(true);

    const data = {
      ...this.form,
      professionalId: this.auth.user()?.id || ''
    };

    const req = this.editingProgram()
      ? this.abaService.updateProgram(this.editingProgram().id, data)
      : this.abaService.createProgram(data);

    req.subscribe({
      next: () => {
        this.savingForm.set(false);
        this.closeForm();
        this.loadPrograms();
        this.toast('Programa salvo com sucesso!', 'success');
      },
      error: () => {
        this.savingForm.set(false);
        this.toast('Erro ao salvar programa', 'error');
      }
    });
  }

  deleteProgram(program: any) {
    this.programToDelete.set(program);
    this.showDeleteModal.set(true);
  }

  confirmDeleteProgram() {
    const program = this.programToDelete();
    this.showDeleteModal.set(false);
    this.abaService.deleteProgram(program.id).subscribe({
      next: () => { this.loadPrograms(); this.toast('Programa excluído', 'success'); },
      error: () => this.toast('Erro ao excluir programa', 'error')
    });
  }

  openDataForm(program: any) {
    this.activeDataProgramId = program.id;
    this.dataForm = {
      date: new Date().toISOString().slice(0, 16),
      value: 0,
      note: ''
    };
    this.showDataForm.set(true);
  }

  saveDataPoint() {
    this.abaService.addDataPoint(this.activeDataProgramId, this.dataForm).subscribe({
      next: () => {
        this.showDataForm.set(false);
        this.loadPrograms();
        this.toast('Dado registrado!', 'success');
      },
      error: () => this.toast('Erro ao registrar dado', 'error')
    });
  }

  deleteDataPoint(dp: any, program: any) {
    this.abaService.deleteDataPoint(dp.id).subscribe({
      next: () => this.loadPrograms(),
      error: () => this.toast('Erro ao excluir dado', 'error')
    });
  }

  toggleExpand(programId: string) {
    this.expandedProgramId.set(this.expandedProgramId() === programId ? null : programId);
  }

  getPatientName(id: string): string {
    return this.patients().find(p => p.id === id)?.name || '—';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ATIVO': return '#10B981';
      case 'PAUSADO': return '#F59E0B';
      case 'CONCLUIDO': return '#6366F1';
      default: return '#94a3b8';
    }
  }

  getStatusTextClass(status: string): string {
    switch (status) {
      case 'ATIVO': return 'text-emerald-600';
      case 'PAUSADO': return 'text-amber-600';
      case 'CONCLUIDO': return 'text-indigo-600';
      default: return 'text-slate-600';
    }
  }

  toast(msg: string, type: 'success' | 'error') {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
