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
    <div class="space-y-6">
      <!-- Welcome -->
      <div class="bg-gradient-to-r from-primary to-teal-600 rounded-2xl p-8 text-white">
        <h2 class="text-2xl font-bold">Olá, {{ userName() }}!</h2>
        <p class="mt-2 opacity-90">Acompanhe o progresso do seu filho</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span class="material-icons text-blue-600 dark:text-blue-400">people</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ patients().length }}</p>
              <p class="text-sm text-gray-500 dark:text-slate-400">Filhos vinculados</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span class="material-icons text-amber-600 dark:text-amber-400">event</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ upcomingAppointments().length }}</p>
              <p class="text-sm text-gray-500 dark:text-slate-400">Próximas sessões</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span class="material-icons text-green-600 dark:text-green-400">trending_up</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ recentSessions().length }}</p>
              <p class="text-sm text-gray-500 dark:text-slate-400">Sessões recentes</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span class="material-icons text-purple-600 dark:text-purple-400">pending</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ pendingAnamnese() }}</p>
              <p class="text-sm text-gray-500 dark:text-slate-400">Anamneses pendentes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Link Patient -->
      @if (patients().length === 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 text-center">
          <span class="material-icons text-6xl text-gray-300 dark:text-slate-600">link</span>
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Vincule seu filho</h3>
          <p class="mt-2 text-gray-500 dark:text-slate-400">Use o código de acesso fornecido pelo profissional</p>
          <div class="mt-6 flex gap-3 max-w-md mx-auto">
            <input
              [(ngModel)]="accessCode"
              class="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ex: ARTHUR-1234">
            <button
              (click)="linkPatient()"
              [disabled]="!accessCode || linking()"
              class="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold disabled:opacity-50 transition-all">
              {{ linking() ? 'Vinculando...' : 'Vincular' }}
            </button>
          </div>
          @if (linkError()) {
            <p class="mt-3 text-red-500 text-sm">{{ linkError() }}</p>
          }
          @if (linkSuccess()) {
            <p class="mt-3 text-green-500 text-sm">{{ linkSuccess() }}</p>
          }
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Upcoming Appointments -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-primary">event</span> Próximos Agendamentos
          </h3>
          @if (upcomingAppointments().length === 0) {
            <p class="text-gray-500 dark:text-slate-400 text-sm text-center py-4">Nenhum agendamento</p>
          } @else {
            <div class="space-y-3">
              @for (apt of upcomingAppointments().slice(0, 4); track apt.id) {
                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                  <div class="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span class="material-icons text-primary text-lg">event</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-bold text-gray-900 dark:text-white">{{ apt.patientName }}</p>
                    <p class="text-xs text-gray-500 dark:text-slate-400">{{ apt.date }} às {{ apt.startTime }}</p>
                  </div>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    [class]="apt.status === 'CONFIRMADO' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">
                    {{ apt.status }}
                  </span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Recent Sessions -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-green-600">trending_up</span> Últimas Sessões
          </h3>
          @if (recentSessions().length === 0) {
            <p class="text-gray-500 dark:text-slate-400 text-sm text-center py-4">Nenhuma sessão compartilhada</p>
          } @else {
            <div class="space-y-3">
              @for (session of recentSessions().slice(0, 4); track session.id) {
                <div class="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-primary">Sessão {{ session.sessionNumber || '—' }}</span>
                    <span class="text-xs text-gray-500">{{ session.date }}</span>
                  </div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white mt-1 line-clamp-2">{{ session.summary }}</p>
                  @if (session.focus || session.engagement || session.skillProgress) {
                    <div class="flex gap-3 mt-2">
                      @if (session.focus) {
                        <span class="text-xs text-gray-500">Foco: <strong class="text-primary">{{ session.focus }}%</strong></span>
                      }
                      @if (session.engagement) {
                        <span class="text-xs text-gray-500">Engajamento: <strong class="text-primary">{{ session.engagement }}%</strong></span>
                      }
                      @if (session.skillProgress) {
                        <span class="text-xs text-gray-500">Progresso: <strong class="text-primary">{{ session.skillProgress }}%</strong></span>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Progress Chart (simplified) -->
      @if (recentSessions().length > 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-purple-600">insights</span> Progresso Recente
          </h3>
          <div class="grid grid-cols-4 gap-4">
            <div class="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <p class="text-3xl font-bold text-primary">{{ getAvgMetric('focus') }}%</p>
              <p class="text-xs text-gray-500 mt-1">Foco Médio</p>
            </div>
            <div class="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <p class="text-3xl font-bold text-green-600">{{ getAvgMetric('engagement') }}%</p>
              <p class="text-xs text-gray-500 mt-1">Engajamento</p>
            </div>
            <div class="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <p class="text-3xl font-bold text-blue-600">{{ getAvgMetric('skillProgress') }}%</p>
              <p class="text-xs text-gray-500 mt-1">Progresso Habilidades</p>
            </div>
            <div class="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <p class="text-3xl font-bold text-amber-600">{{ getAvgMetric('behavior') }}%</p>
              <p class="text-xs text-gray-500 mt-1">Comportamento</p>
            </div>
          </div>
        </div>
      }

      <!-- Patient Cards -->
      @if (patients().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (patient of patients(); track patient.id) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    [style.background]="patient.color || '#007F80'">
                    {{ patient.initials || patient.name.charAt(0) }}
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ patient.name }}</h3>
                    <p class="text-sm text-gray-500 dark:text-slate-400">
                      {{ patient.age ? patient.age + ' anos' : '' }}
                      {{ patient.school ? ' • ' + patient.school.name : '' }}
                    </p>
                  </div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold"
                  [class]="patient.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                  {{ patient.status }}
                </span>
              </div>
              <div class="mt-6 flex gap-3">
                <a [routerLink]="['/app/guardian/evolutions']" [queryParams]="{ patientId: patient.id }"
                  class="flex-1 py-2 px-4 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 text-center transition-all">
                  Evoluções
                </a>
                <a [routerLink]="['/app/guardian/documents']" [queryParams]="{ patientId: patient.id }"
                  class="flex-1 py-2 px-4 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 text-center transition-all">
                  Documentos
                </a>
              </div>
            </div>
          }
        </div>
      }

      <!-- Link Another -->
      @if (patients().length > 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vincular outro filho</h3>
          <div class="flex gap-3">
            <input
              [(ngModel)]="accessCode"
              class="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Código de acesso">
            <button
              (click)="linkPatient()"
              [disabled]="!accessCode || linking()"
              class="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold disabled:opacity-50 transition-all">
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
