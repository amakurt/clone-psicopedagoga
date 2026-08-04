import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuardianService } from '../services/guardian.service';
import { Paciente, Appointment } from '@core/models';

@Component({
  selector: 'app-guardian-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Agendamentos</h2>
          <p class="text-gray-500 dark:text-slate-400 mt-1">Visualize e solicite novos agendamentos</p>
        </div>
        <button (click)="showRequestForm.set(true)"
          class="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm shadow-lg transition-all">
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
                class="px-5 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50">
                {{ saving() ? 'Enviando...' : 'Solicitar' }}
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

  patients = signal<Paciente[]>([]);
  appointments = signal<Appointment[]>([]);
  showRequestForm = signal(false);
  saving = signal(false);
  requestForm: any = { pacienteId: '', date: '', startTime: '', notes: '' };

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

  requestAppointment() {
    if (!this.requestForm.pacienteId || !this.requestForm.date) return;
    this.saving.set(true);
    this.guardianService.requestAppointment(this.requestForm).subscribe({
      next: () => {
        this.showRequestForm.set(false);
        this.saving.set(false);
        this.requestForm = { pacienteId: '', date: '', startTime: '', notes: '' };
        this.loadAppointments();
      },
      error: () => { this.saving.set(false); }
    });
  }
}
