import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GuardianService } from '../services/guardian.service';
import { Paciente } from '@core/models';

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
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <span class="material-icons text-amber-600 dark:text-amber-400">pending</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ pendingAnamnese() }}</p>
              <p class="text-sm text-gray-500 dark:text-slate-400">Anamneses pendentes</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span class="material-icons text-green-600 dark:text-green-400">event</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ upcomingAppointments() }}</p>
              <p class="text-sm text-gray-500 dark:text-slate-400">Próximas sessões</p>
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
                <a [routerLink]="['/guardian/evolutions']" [queryParams]="{ patientId: patient.id }"
                  class="flex-1 py-2 px-4 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 text-center transition-all">
                  Evoluções
                </a>
                <a [routerLink]="['/guardian/documents']" [queryParams]="{ patientId: patient.id }"
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

  patients = signal<Paciente[]>([]);
  pendingAnamnese = signal(0);
  upcomingAppointments = signal(0);
  userName = signal('');
  accessCode = '';
  linking = signal(false);
  linkError = signal('');
  linkSuccess = signal('');

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.guardianService.getDashboard().subscribe({
      next: (data: any) => {
        this.patients.set(data.patients || []);
        this.pendingAnamnese.set(data.pendingAnamnese || 0);
        this.upcomingAppointments.set(data.upcomingAppointments || 0);
        if (data.patients?.length > 0 && !localStorage.getItem('guardian_patient_id')) {
          localStorage.setItem('guardian_patient_id', data.patients[0].id);
        }
      }
    });
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
