import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuardianService } from '../services/guardian.service';
import { ToastService } from '@shared/components/toast.component';
import { Paciente, Appointment } from '@core/models';

@Component({
  selector: 'app-guardian-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 sm:space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="size-11 sm:size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <span class="material-icons text-primary text-2xl">calendar_month</span>
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Agendamentos</h2>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Solicite, acompanhe ou modifique consultas</p>
          </div>
        </div>
        <button (click)="showRequestForm.set(true)"
          class="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-md shadow-primary/20 transition-all active:scale-95">
          <span class="material-icons text-[18px]">add</span> Solicitar Agendamento
        </button>
      </div>

      <!-- Appointments List -->
      @if (appointments().length === 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-gray-200 dark:border-slate-700 text-center shadow-sm">
          <div class="size-16 rounded-3xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-gray-400 dark:text-slate-500">
            <span class="material-icons text-3xl">event_busy</span>
          </div>
          <h3 class="mt-4 text-base sm:text-lg font-bold text-gray-900 dark:text-white">Nenhum agendamento</h3>
          <p class="mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-400">Você ainda não possui sessões agendadas. Clique no botão acima para solicitar.</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (apt of appointments(); track apt.id) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all">
              <div class="flex items-start gap-3 sm:gap-4 min-w-0">
                <div class="size-11 sm:size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  [class]="apt.status === 'CONFIRMADO' ? 'bg-green-100 dark:bg-green-900/30' : apt.status === 'PENDENTE' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-slate-700'">
                  <span class="material-icons text-xl"
                    [class]="apt.status === 'CONFIRMADO' ? 'text-green-600' : apt.status === 'PENDENTE' ? 'text-amber-600' : 'text-gray-400'">
                    {{ apt.status === 'CONFIRMADO' ? 'event_available' : apt.status === 'PENDENTE' ? 'schedule' : 'event_busy' }}
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">{{ apt.patientName }}</h3>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                      [class]="apt.status === 'CONFIRMADO' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : apt.status === 'PENDENTE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'">
                      {{ apt.status }}
                    </span>
                  </div>
                  <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <span class="material-icons text-[14px]">schedule</span>
                    {{ apt.date }} às {{ apt.startTime }}
                  </p>
                  @if (apt.notes) {
                    <p class="text-xs text-gray-400 dark:text-slate-500 mt-1.5 italic bg-gray-50 dark:bg-slate-700/50 p-2 rounded-xl border border-gray-100 dark:border-slate-700">
                      "{{ apt.notes }}"
                    </p>
                  }
                </div>
              </div>

              <!-- Action Buttons -->
              @if (canManage(apt)) {
                <div class="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-slate-700 shrink-0">
                  <button (click)="openReschedule(apt)" title="Modificar agendamento"
                    class="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95">
                    <span class="material-icons text-sm">edit_calendar</span> Modificar
                  </button>
                  <button (click)="toggleCancelArmed(apt.id)" title="Cancelar agendamento"
                    [class]="cancelArmedId() === apt.id
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'"
                    class="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95">
                    <span class="material-icons text-sm">{{ cancelArmedId() === apt.id ? 'warning' : 'event_busy' }}</span>
                    {{ cancelArmedId() === apt.id ? 'Confirmar?' : 'Cancelar' }}
                  </button>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Request Form Modal -->
      @if (showRequestForm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" (click)="showRequestForm.set(false)">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 border border-gray-100 dark:border-slate-800" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-5">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span class="material-icons text-xl">add_circle</span>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Solicitar Agendamento</h3>
              </div>
              <button (click)="showRequestForm.set(false)" class="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">
                <span class="material-icons text-lg">close</span>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Filho / Paciente *</label>
                <select class="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  [(ngModel)]="requestForm.pacienteId">
                  <option value="">Selecione o filho</option>
                  @for (p of patients(); track p.id) {
                    <option [value]="p.id">{{ p.name }}</option>
                  }
                </select>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Data Preferida *</label>
                  <input type="date" class="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    [(ngModel)]="requestForm.date">
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Horário</label>
                  <input type="time" class="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    [(ngModel)]="requestForm.startTime">
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Observações ou Motivo</label>
                <textarea class="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows="2" [(ngModel)]="requestForm.notes" placeholder="Informe se há algum motivo específico..."></textarea>
              </div>
            </div>

            <div class="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
              <button class="flex-1 py-3 text-sm font-bold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all" (click)="showRequestForm.set(false)">Cancelar</button>
              <button (click)="requestAppointment()" [disabled]="saving() || !requestForm.pacienteId || !requestForm.date"
                class="flex-1 py-3 text-sm font-bold text-on-primary bg-primary rounded-2xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 active:scale-95">
                {{ saving() ? 'Enviando...' : 'Solicitar' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Reschedule Modal -->
      @if (rescheduleApt() && showRescheduleForm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" (click)="closeReschedule()">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 border border-gray-100 dark:border-slate-800" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-4">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <span class="material-icons text-xl">edit_calendar</span>
                </div>
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Modificar Agendamento</h3>
                  <p class="text-xs text-gray-500 dark:text-slate-400">{{ rescheduleApt()?.patientName }}</p>
                </div>
              </div>
              <button (click)="closeReschedule()" class="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">
                <span class="material-icons text-lg">close</span>
              </button>
            </div>

            <p class="text-xs text-amber-600 dark:text-amber-400 mb-4 bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-xl border border-amber-100 dark:border-amber-800/50">
              Após alterar a data/horário, o agendamento retornará para o status <b>Pendente</b> até que a clínica confirme.
            </p>

            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Nova Data *</label>
                  <input type="date" class="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    [(ngModel)]="rescheduleForm.date">
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Novo Horário</label>
                  <input type="time" class="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    [(ngModel)]="rescheduleForm.startTime">
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Motivo da Alteração</label>
                <textarea class="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows="2" [(ngModel)]="rescheduleForm.notes" placeholder="Informe o motivo da mudança..."></textarea>
              </div>
            </div>

            <div class="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
              <button class="flex-1 py-3 text-sm font-bold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all" (click)="closeReschedule()">Voltar</button>
              <button (click)="submitReschedule()" [disabled]="saving() || !rescheduleForm.date"
                class="flex-1 py-3 text-sm font-bold text-on-primary bg-primary rounded-2xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 active:scale-95">
                {{ saving() ? 'Salvando...' : 'Salvar Alteração' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class GuardianAppointmentsComponent implements OnInit {
  private guardianService = inject(GuardianService);
  private toast = inject(ToastService);

  patients = signal<Paciente[]>([]);
  appointments = signal<Appointment[]>([]);
  showRequestForm = signal(false);
  saving = signal(false);
  cancelArmedId = signal<string | null>(null);
  showRescheduleForm = signal(false);
  rescheduleApt = signal<Appointment | null>(null);
  requestForm: any = { pacienteId: '', date: '', startTime: '', notes: '' };
  rescheduleForm: any = { date: '', startTime: '', notes: '' };

  ngOnInit() {
    this.guardianService.getPatients().subscribe({
      next: (res: any) => {
        this.patients.set(res.data || []);
        this.loadAppointments();
      }
    });
  }

  loadAppointments() {
    this.guardianService.getAppointmentsList().subscribe({
      next: (res: any) => this.appointments.set(res.data || [])
    });
  }

  canManage(apt: any) {
    return apt.status === 'PENDENTE' || apt.status === 'CONFIRMADO';
  }

  toggleCancelArmed(id: string) {
    if (this.cancelArmedId() === id) {
      this.cancelAppointment(id);
    } else {
      this.cancelArmedId.set(id);
      setTimeout(() => {
        if (this.cancelArmedId() === id) this.cancelArmedId.set(null);
      }, 5000);
    }
  }

  cancelAppointment(id: string) {
    this.saving.set(true);
    this.guardianService.cancelAppointment(id).subscribe({
      next: () => {
        this.saving.set(false);
        this.cancelArmedId.set(null);
        this.toast.success('Agendamento cancelado com sucesso');
        this.loadAppointments();
      },
      error: (err: any) => {
        this.saving.set(false);
        this.cancelArmedId.set(null);
        this.toast.error(err?.error?.error || 'Erro ao cancelar agendamento');
      }
    });
  }

  openReschedule(apt: any) {
    this.rescheduleApt.set(apt);
    this.rescheduleForm = { date: apt.date, startTime: apt.startTime || '', notes: '' };
    this.showRescheduleForm.set(true);
  }

  closeReschedule() {
    this.showRescheduleForm.set(false);
    this.rescheduleApt.set(null);
  }

  submitReschedule() {
    const apt = this.rescheduleApt();
    if (!apt || !this.rescheduleForm.date) {
      this.toast.warning('Informe a nova data');
      return;
    }
    this.saving.set(true);
    this.guardianService.rescheduleAppointment(apt.id, this.rescheduleForm).subscribe({
      next: () => {
        this.saving.set(false);
        this.showRescheduleForm.set(false);
        this.rescheduleApt.set(null);
        this.toast.success('Agendamento modificado — aguardando confirmação da equipe');
        this.loadAppointments();
      },
      error: (err: any) => {
        this.saving.set(false);
        this.toast.error(err?.error?.error || 'Erro ao modificar agendamento');
      }
    });
  }

  requestAppointment() {
    if (!this.requestForm.pacienteId || !this.requestForm.date) return;
    this.saving.set(true);
    this.guardianService.requestAppointment(this.requestForm).subscribe({
      next: () => {
        this.showRequestForm.set(false);
        this.saving.set(false);
        this.requestForm = { pacienteId: '', date: '', startTime: '', notes: '' };
        this.toast.success('Solicitação enviada à equipe');
        this.loadAppointments();
      },
      error: () => { this.saving.set(false); }
    });
  }
}
