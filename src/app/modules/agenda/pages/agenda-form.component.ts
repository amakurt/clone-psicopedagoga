import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AgendaService } from '../services/agenda.service';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-agenda-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6 animate-in max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/app/agenda" class="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
            <span class="material-icons text-slate-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white">{{ isEdit ? 'Editar' : 'Novo' }} Agendamento</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Marque ou atualize uma consulta ou sessão na agenda</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <a routerLink="/app/agenda" class="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm transition-all">
            Cancelar
          </a>
          <button (click)="save()" [disabled]="saving() || !form.pacienteId || !form.date"
            class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
            <span class="material-icons text-[18px]">event</span>
            {{ saving() ? 'Salvando...' : 'Salvar Agendamento' }}
          </button>
        </div>
      </div>

      <!-- Main Form Card -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-8 space-y-6">
        <div class="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div class="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span class="material-icons text-xl">event_available</span>
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Informações da Consulta</h2>
            <p class="text-xs text-slate-500">Defina o paciente, horário e tipo do atendimento</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- Paciente Selector -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paciente *</label>
            <select [(ngModel)]="form.pacienteId" (change)="onPatientChange()"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white">
              <option value="">Selecione um paciente cadastrado...</option>
              @for (p of pacientes(); track p.id) {
                <option [value]="p.id">{{ p.name }} ({{ p.diagnosis || 'Sem diagnóstico' }})</option>
              }
            </select>
          </div>

          <!-- Data -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data da Consulta *</label>
            <input type="date" [(ngModel)]="form.date"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white">
          </div>

          <!-- Tipo de Atendimento -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Atendimento</label>
            <select [(ngModel)]="form.type"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white">
              <option value="Sessão Psicopedagógica">Sessão Psicopedagógica</option>
              <option value="Avaliação / Testagem">Avaliação / Testagem</option>
              <option value="Devolutiva com Família">Devolutiva com Família</option>
              <option value="Anamnese Inicial">Anamnese Inicial</option>
              <option value="Visita Escolar / AEE">Visita Escolar / AEE</option>
              <option value="Supervisão Clínica">Supervisão Clínica</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <!-- Horário Início e Fim -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hora de Início *</label>
            <input type="time" [(ngModel)]="form.startTime" (change)="onStartTimeChange()"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hora de Término</label>
            <input type="time" [(ngModel)]="form.endTime"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white">
          </div>

          <!-- Status -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status Inicial</label>
            <select [(ngModel)]="form.status"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white">
              <option value="CONFIRMADO">Confirmado</option>
              <option value="PENDENTE">Pendente</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          <!-- Duração Rápida -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duração Rápida</label>
            <div class="flex gap-2">
              <button type="button" (click)="setDuration(45)" class="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary rounded-xl text-xs font-bold transition-all">45 min</button>
              <button type="button" (click)="setDuration(50)" class="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary rounded-xl text-xs font-bold transition-all">50 min</button>
              <button type="button" (click)="setDuration(60)" class="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary rounded-xl text-xs font-bold transition-all">60 min</button>
            </div>
          </div>

          <!-- Observações -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Observações e Recomendações</label>
            <textarea [(ngModel)]="form.notes" rows="3"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white resize-y min-h-[80px]"
              placeholder="Ex: Trazer caderno escolar, orientar sobre o uso de óculos..."></textarea>
          </div>
        </div>
      </div>

      <!-- Registros e Histórico -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Consultas Marcadas do Paciente</h3>
            <p class="text-xs text-slate-500">{{ records().length }} registro(s) encontrado(s)</p>
          </div>
          @if (editingId()) {
            <button class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold rounded-xl" (click)="resetForm()">
              + Novo Agendamento
            </button>
          }
        </div>

        @if (records().length === 0) {
          <div class="p-8 text-center text-slate-400 text-xs">
            Nenhuma consulta registrada para o paciente selecionado.
          </div>
        } @else {
          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            @for (r of records(); track r.id) {
              <div class="py-3 flex items-center justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-slate-900 dark:text-white">{{ r.date }}</span>
                    <span class="text-xs text-slate-500 font-bold">· {{ r.startTime }} - {{ r.endTime }}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" [ngClass]="statusBadgeClass(r.status)">
                      {{ r.status }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 truncate mt-0.5">{{ r.type }} · {{ r.notes || 'Sem observações' }}</p>
                </div>
                <div class="flex items-center gap-1">
                  <button (click)="editRecord(r)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Editar">
                    <span class="material-icons text-base text-slate-500">edit</span>
                  </button>
                  <button (click)="deleteRecord(r)" class="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Excluir">
                    <span class="material-icons text-base text-red-500">delete</span>
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
export class AgendaFormComponent implements OnInit {
  private service = inject(AgendaService);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = false;
  id = '';
  saving = signal(false);
  pacientes = signal<any[]>([]);
  records = signal<any[]>([]);
  editingId = signal('');

  form: any = {
    pacienteId: '',
    patientName: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '09:50',
    type: 'Sessão Psicopedagógica',
    status: 'CONFIRMADO',
    notes: ''
  };

  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.id;

    this.api.get('/pacientes').subscribe({
      next: (res: any) => {
        const list = res.data || res || [];
        this.pacientes.set(list);

        const qp = this.route.snapshot.queryParams['pacienteId'];
        const qd = this.route.snapshot.queryParams['date'];
        if (qp) {
          this.form.pacienteId = qp;
          if (qd) this.form.date = qd;
          this.onPatientChange();
        }
      },
      error: () => {}
    });

    if (this.isEdit) {
      this.service.get(this.id).subscribe({
        next: (res: any) => {
          this.form = { ...res };
          this.loadRecords();
        },
        error: () => this.toast.error('Erro ao carregar agendamento')
      });
    }
  }

  onPatientChange() {
    const p = this.pacientes().find(p => p.id === this.form.pacienteId);
    if (p) {
      this.form.patientName = p.name;
    }
    this.loadRecords();
  }

  onStartTimeChange() {
    if (this.form.startTime && !this.form.endTime) {
      this.setDuration(50);
    }
  }

  setDuration(minutes: number) {
    if (!this.form.startTime) return;
    const [h, m] = this.form.startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + minutes);
    const endH = String(date.getHours()).padStart(2, '0');
    const endM = String(date.getMinutes()).padStart(2, '0');
    this.form.endTime = `${endH}:${endM}`;
  }

  getPatientName(): string {
    const p = this.pacientes().find(p => p.id === this.form.pacienteId);
    return p?.name || '-';
  }

  statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      CONFIRMADO: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      PENDENTE: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      CONCLUIDO: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      CANCELADO: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  }

  loadRecords() {
    if (!this.form.pacienteId) {
      this.records.set([]);
      return;
    }
    this.api.get('/appointments', { pacienteId: this.form.pacienteId }).subscribe({
      next: (res: any) => {
        const list = res.data || res || [];
        this.records.set(list.sort((a: any, b: any) => (b.date + ' ' + b.startTime).localeCompare(a.date + ' ' + a.startTime)));
      },
      error: () => {}
    });
  }

  editRecord(r: any) {
    this.editingId.set(r.id);
    this.form = { ...r };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm() {
    this.editingId.set('');
    this.form = {
      pacienteId: this.form.pacienteId,
      patientName: this.form.patientName,
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '09:50',
      type: 'Sessão Psicopedagógica',
      status: 'CONFIRMADO',
      notes: ''
    };
  }

  deleteRecord(r: any) {
    if (!confirm(`Excluir a consulta de ${r.date} (${r.startTime})?`)) return;
    this.api.delete(`/appointments/${r.id}`).subscribe({
      next: () => {
        this.toast.success('Consulta excluída');
        this.loadRecords();
      },
      error: () => this.toast.error('Erro ao excluir consulta')
    });
  }

  save() {
    if (!this.form.pacienteId) return this.toast.warning('Selecione um paciente');
    if (!this.form.date) return this.toast.warning('Selecione a data da consulta');

    if (!this.form.patientName) {
      const p = this.pacientes().find(p => p.id === this.form.pacienteId);
      this.form.patientName = p?.name || 'Paciente';
    }

    if (!this.form.startTime) this.form.startTime = '09:00';
    if (!this.form.endTime) this.form.endTime = '09:50';

    this.saving.set(true);
    const obs = this.editingId()
      ? this.service.update(this.editingId(), this.form)
      : this.isEdit
        ? this.service.update(this.id, this.form)
        : this.service.create(this.form);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Consulta agendada com sucesso!');
        if (this.isEdit) {
          this.router.navigate(['/app/agenda']);
        } else {
          this.resetForm();
          this.loadRecords();
        }
      },
      error: (err: any) => {
        this.saving.set(false);
        const msg = err.error?.error || err.error?.message || 'Erro ao salvar agendamento';
        this.toast.error(msg);
      }
    });
  }
}
