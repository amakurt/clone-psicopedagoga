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
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span class="material-icons text-primary text-2xl">calendar_month</span>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Agendamentos</h2>
            <p class="text-gray-500 dark:text-slate-400 mt-1">Solicite, modifique ou cancele seus agendamentos</p>
          </div>
        </div>
        <button (click)="showRequestForm.set(true)"
          class="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-semibold text-sm shadow-lg transition-all">
          <span class="material-icons text-[18px]">add</span> Solicitar Agendamento
        </button>
      </div>

      <!-- Upcoming Appointments -->
      @if (appointments().length === 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-gray-200 dark:border-slate-700 text-center">
          <span class="material-icons text-6xl text-gray-300 dark:text-slate-600">event_busy</span>
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Nenhum agendamento</h3>
          <p class="mt-2 text-gray-500 dark:text-slate-400">Solicite um novo agendamento ao profissional</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (apt of appointments(); track apt.id) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700 flex items-center gap-4">
              <div class="size-12 rounded-xl flex items-center justify-center shrink-0"
                [class]="apt.status === 'CONFIRMADO' ? 'bg-green-100 dark:bg-green-900/30' : apt.status === 'PENDENTE' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-slate-700'">
                <span class="material-icons text-xl"
                  [class]="apt.status === 'CONFIRMADO' ? 'text-green-600' : apt.status === 'PENDENTE' ? 'text-amber-600' : 'text-gray-400'">
                  {{ apt.status === 'CONFIRMADO' ? 'event_available' : apt.status === 'PENDENTE' ? 'schedule' : 'event_busy' }}
                </span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-gray-900 dark:text-white">{{ apt.patientName }}</h3>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    [class]="apt.status === 'CONFIRMADO' ? 'bg-green-100 text-green-700' : apt.status === 'PENDENTE' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'">
                    {{ apt.status }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{{ apt.date }} às {{ apt.startTime }}</p>
                @if (apt.notes) {
                  <p class="text-xs text-gray-400 mt-1 italic">{{ apt.notes }}</p>
                }
              </div>
              @if (canManage(apt)) {
                <div class="flex items-center gap-2 shrink-0">
                  <button (click)="openReschedule(apt)" title="Modificar agendamento"
                    class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all">
                    <span class="material-icons text-sm">edit_calendar</span> Modificar
                  </button>
                  <button (click)="toggleCancelArmed(apt.id)" title="Cancelar agendamento"
                    [class]="cancelArmedId() === apt.id
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'"
                    class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all">
                    <span class="material-icons text-sm">{{ cancelArmedId() === apt.id ? 'warning' : 'event_busy' }}</span>
                    {{ cancelArmedId() === apt.id ? 'Confirmar cancelamento?' : 'Cancelar' }}
                  </button>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Request Form Modal -->
      @if (showRequestForm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="showRequestForm.set(false)">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-gray-200 dark:border-slate-700" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Solicitar Agendamento</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Paciente *</label>
                <select class="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  [(ngModel)]="requestForm.pacienteId">
                  <option value="">Selecione</option>
                  @for (p of patients(); track p.id) {
                    <option [value]="p.id">{{ p.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Data Preferida *</label>
                <input type="date" class="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  [(ngModel)]="requestForm.date">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Horário Preferido</label>
                <input type="time" class="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  [(ngModel)]="requestForm.startTime">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Observações</label>
                <textarea class="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                  rows="2" [(ngModel)]="requestForm.notes" placeholder="Motivo da consulta..."></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all" (click)="showRequestForm.set(false)">Cancelar</button>
              <button (click)="requestAppointment()" [disabled]="saving()"
                class="px-5 py-2 text-sm font-medium text-on-primary bg-primary rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50">
                {{ saving() ? 'Enviando...' : 'Solicitar' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Reschedule Modal -->
      @if (rescheduleApt() && showRescheduleForm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="closeReschedule()">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-gray-200 dark:border-slate-700" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Modificar Agendamento</h3>
            <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">{{ rescheduleApt()?.patientName }} — após a alteração, o agendamento volta para <b>Pendente</b> até a equipe confirmar.</p>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nova Data *</label>
                <input type="date" class="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  [(ngModel)]="rescheduleForm.date">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Novo Horário</label>
                <input type="time" class="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  [(ngModel)]="rescheduleForm.startTime">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Observações</label>
                <textarea class="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                  rows="2" [(ngModel)]="rescheduleForm.notes" placeholder="Motivo da alteração..."></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all" (click)="closeReschedule()">Voltar</button>
              <button (click)="submitReschedule()" [disabled]="saving()"
                class="px-5 py-2 text-sm font-medium text-on-primary bg-primary rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50">
                {{ saving() ? 'Enviando...' : 'Salvar Alteração' }}
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
