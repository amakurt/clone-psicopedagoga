import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GuardianService } from '../services/guardian.service';
import { AuthService } from '@core/services/auth.service';
import { Paciente, Appointment, SessionRecord } from '@core/models';

@Component({
  selector: 'app-guardian-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-5 sm:space-y-6">
      <!-- Welcome Hero -->
      <div class="bg-gradient-to-r from-primary to-primary-dark rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-on-primary shadow-sm">
        <h2 class="text-xl sm:text-2xl font-bold">Olá, {{ userName() }}!</h2>
        <p class="mt-1 sm:mt-2 text-xs sm:text-sm opacity-90">Acompanhe o desenvolvimento e os atendimentos do seu filho</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="size-10 sm:size-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <span class="material-icons text-blue-600 dark:text-blue-400 text-xl sm:text-2xl">people</span>
            </div>
            <div class="min-w-0">
              <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-none">{{ patients().length }}</p>
              <p class="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 mt-1 truncate">Filhos vinculados</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="size-10 sm:size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <span class="material-icons text-amber-600 dark:text-amber-400 text-xl sm:text-2xl">event</span>
            </div>
            <div class="min-w-0">
              <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-none">{{ upcomingAppointments().length }}</p>
              <p class="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 mt-1 truncate">Próximas sessões</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="size-10 sm:size-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <span class="material-icons text-green-600 dark:text-green-400 text-xl sm:text-2xl">trending_up</span>
            </div>
            <div class="min-w-0">
              <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-none">{{ recentSessions().length }}</p>
              <p class="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 mt-1 truncate">Sessões recentes</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="size-10 sm:size-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
              <span class="material-icons text-purple-600 dark:text-purple-400 text-xl sm:text-2xl">pending</span>
            </div>
            <div class="min-w-0">
              <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-none">{{ pendingAnamnese() }}</p>
              <p class="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 mt-1 truncate">Anamneses pendentes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Link Patient (Empty state) -->
      @if (patients().length === 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-slate-700 text-center shadow-sm">
          <div class="size-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
            <span class="material-icons text-3xl">link</span>
          </div>
          <h3 class="mt-4 text-lg font-bold text-gray-900 dark:text-white">Vincule seu filho</h3>
          <p class="mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-400">Use o código de acesso fornecido pelo profissional para visualizar os registros</p>
          <div class="mt-5 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              [(ngModel)]="accessCode"
              class="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-primary focus:border-transparent uppercase font-mono tracking-wider"
              placeholder="Ex: ARTHUR-1234">
            <button
              (click)="linkPatient()"
              [disabled]="!accessCode || linking()"
              class="px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm disabled:opacity-50 transition-all shadow-sm active:scale-95">
              {{ linking() ? 'Vinculando...' : 'Vincular Filho' }}
            </button>
          </div>
          @if (linkError()) {
            <p class="mt-3 text-red-500 text-xs font-semibold">{{ linkError() }}</p>
          }
          @if (linkSuccess()) {
            <p class="mt-3 text-green-500 text-xs font-semibold">{{ linkSuccess() }}</p>
          }
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <!-- Upcoming Appointments -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span class="material-icons text-primary text-xl">event</span> Próximos Agendamentos
            </h3>
            <a routerLink="/guardian/appointments" class="text-xs font-bold text-primary hover:underline">Ver todos</a>
          </div>

          @if (upcomingAppointments().length === 0) {
            <div class="text-center py-8">
              <span class="material-icons text-4xl text-gray-300 dark:text-slate-600">event_available</span>
              <p class="text-gray-500 dark:text-slate-400 text-xs sm:text-sm mt-2">Nenhum agendamento futuro</p>
            </div>
          } @else {
            <div class="space-y-2.5">
              @for (apt of upcomingAppointments().slice(0, 4); track apt.id) {
                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/40 rounded-2xl">
                  <div class="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span class="material-icons text-lg">event</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">{{ apt.patientName }}</p>
                    <p class="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400">{{ apt.date }} às {{ apt.startTime }}</p>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0"
                    [class]="apt.status === 'CONFIRMADO' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'">
                    {{ apt.status }}
                  </span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Recent Sessions -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span class="material-icons text-green-600 text-xl">trending_up</span> Últimas Sessões
            </h3>
            <a routerLink="/guardian/evolutions" class="text-xs font-bold text-primary hover:underline">Ver evoluções</a>
          </div>

          @if (recentSessions().length === 0) {
            <div class="text-center py-8">
              <span class="material-icons text-4xl text-gray-300 dark:text-slate-600">article</span>
              <p class="text-gray-500 dark:text-slate-400 text-xs sm:text-sm mt-2">Nenhuma sessão compartilhada</p>
            </div>
          } @else {
            <div class="space-y-2.5">
              @for (session of recentSessions().slice(0, 4); track session.id) {
                <div class="p-3 bg-gray-50 dark:bg-slate-700/40 rounded-2xl">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-primary">Sessão {{ session.sessionNumber || '—' }}</span>
                    <span class="text-[11px] text-gray-400 dark:text-slate-500">{{ session.date }}</span>
                  </div>
                  <p class="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mt-1 line-clamp-2">{{ session.summary }}</p>
                  @if (session.focus || session.engagement || session.skillProgress) {
                    <div class="flex flex-wrap gap-2 sm:gap-3 mt-2 pt-2 border-t border-gray-200/50 dark:border-slate-600/50 text-[11px] text-gray-500 dark:text-slate-400">
                      @if (session.focus) {
                        <span>Foco: <strong class="text-primary font-bold">{{ session.focus }}%</strong></span>
                      }
                      @if (session.engagement) {
                        <span>Engajamento: <strong class="text-primary font-bold">{{ session.engagement }}%</strong></span>
                      }
                      @if (session.skillProgress) {
                        <span>Progresso: <strong class="text-primary font-bold">{{ session.skillProgress }}%</strong></span>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Progress Chart Summary -->
      @if (recentSessions().length > 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-purple-600 text-xl">insights</span> Médias de Desempenho
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div class="text-center p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/40 rounded-2xl border border-gray-100 dark:border-slate-700">
              <p class="text-2xl sm:text-3xl font-black text-primary">{{ getAvgMetric('focus') }}%</p>
              <p class="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-slate-400 mt-1">Foco Médio</p>
            </div>
            <div class="text-center p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/40 rounded-2xl border border-gray-100 dark:border-slate-700">
              <p class="text-2xl sm:text-3xl font-black text-green-600">{{ getAvgMetric('engagement') }}%</p>
              <p class="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-slate-400 mt-1">Engajamento</p>
            </div>
            <div class="text-center p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/40 rounded-2xl border border-gray-100 dark:border-slate-700">
              <p class="text-2xl sm:text-3xl font-black text-blue-600">{{ getAvgMetric('skillProgress') }}%</p>
              <p class="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-slate-400 mt-1">Progresso</p>
            </div>
            <div class="text-center p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/40 rounded-2xl border border-gray-100 dark:border-slate-700">
              <p class="text-2xl sm:text-3xl font-black text-amber-600">{{ getAvgMetric('behavior') }}%</p>
              <p class="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-slate-400 mt-1">Comportamento</p>
            </div>
          </div>
        </div>
      }

      <!-- Patient Cards -->
      @if (patients().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          @for (patient of patients(); track patient.id) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div class="size-12 sm:size-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-sm"
                    [style.background]="patient.color || '#007F80'">
                    {{ patient.initials || patient.name.charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{{ patient.name }}</h3>
                    <p class="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                      {{ patient.age ? patient.age + ' anos' : '' }}
                      {{ patient.school ? ' • ' + patient.school.name : '' }}
                    </p>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0"
                  [class]="patient.status === 'ATIVO' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'">
                  {{ patient.status }}
                </span>
              </div>
              <div class="mt-5 grid grid-cols-2 gap-2.5">
                <a [routerLink]="['/guardian/evolutions']" [queryParams]="{ patientId: patient.id }"
                  class="py-2.5 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-300 text-center transition-all flex items-center justify-center gap-1.5">
                  <span class="material-icons text-[16px] text-primary">trending_up</span> Evoluções
                </a>
                <a [routerLink]="['/guardian/documents']" [queryParams]="{ patientId: patient.id }"
                  class="py-2.5 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-300 text-center transition-all flex items-center justify-center gap-1.5">
                  <span class="material-icons text-[16px] text-primary">description</span> Documentos
                </a>
              </div>
            </div>
          }
        </div>
      }

      <!-- Link Another -->
      @if (patients().length > 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <h3 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span class="material-icons text-primary text-lg">add_link</span> Vincular outro filho
          </h3>
          <div class="flex flex-col sm:flex-row gap-3">
            <input
              [(ngModel)]="accessCode"
              class="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-primary focus:border-transparent uppercase font-mono tracking-wider"
              placeholder="Código de acesso do filho">
            <button
              (click)="linkPatient()"
              [disabled]="!accessCode || linking()"
              class="px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm disabled:opacity-50 transition-all shadow-sm active:scale-95">
              Vincular
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class GuardianDashboardComponent implements OnInit {
  private guardianService = inject(GuardianService);
  private auth = inject(AuthService);

  patients = signal<Paciente[]>([]);
  pendingAnamnese = signal(0);
  upcomingAppointments = signal<Appointment[]>([]);
  recentSessions = signal<SessionRecord[]>([]);
  userName = signal('');
  accessCode = '';
  linking = signal(false);
  linkError = signal('');
  linkSuccess = signal('');

  ngOnInit() {
    const user = this.auth.user();
    if (user) {
      this.userName.set(user.name);
    }
    this.loadDashboard();
  }

  loadDashboard() {
    this.guardianService.getDashboard().subscribe({
      next: (data: any) => {
        this.patients.set(data.patients || []);
        this.pendingAnamnese.set(data.pendingAnamnese || 0);
        if (data.patients?.length > 0 && !localStorage.getItem('guardian_patient_id')) {
          localStorage.setItem('guardian_patient_id', data.patients[0].id);
        }
        this.loadAppointments();
        this.loadSessions();
      }
    });
  }

  loadAppointments() {
    this.guardianService.getAppointmentsList().subscribe({
      next: (res: any) => this.upcomingAppointments.set(res.data || [])
    });
  }

  loadSessions() {
    const patientId = localStorage.getItem('guardian_patient_id');
    if (patientId) {
      this.guardianService.getPatientSessions(patientId).subscribe({
        next: (res: any) => this.recentSessions.set(res.data || [])
      });
    }
  }

  getAvgMetric(field: string): number {
    const sessions = this.recentSessions();
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum, s) => sum + ((s as any)[field] || 0), 0);
    return Math.round(total / sessions.length);
  }

  linkPatient() {
    if (!this.accessCode) return;
    this.linking.set(true);
    this.linkError.set('');
    this.linkSuccess.set('');

    this.guardianService.linkPatient(this.accessCode).subscribe({
      next: (res: any) => {
        this.linkSuccess.set(`Filho "${res.patient.name}" vinculado com sucesso!`);
        this.accessCode = '';
        this.linking.set(false);
        this.loadDashboard();
      },
      error: (err: any) => {
        this.linkError.set(err.error?.error || 'Erro ao vincular paciente');
        this.linking.set(false);
      }
    });
  }
}
