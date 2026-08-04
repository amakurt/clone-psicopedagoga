import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { GuardianService } from '@modules/guardian/services/guardian.service';

@Component({
  selector: 'app-guardian-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-slate-900">
      <!-- Header -->
      <header class="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center gap-3">
              <span class="material-icons text-primary text-3xl">family_restroom</span>
              <div>
                <h1 class="text-lg font-bold text-gray-900 dark:text-white">Portal da Família</h1>
                <p class="text-xs text-gray-500 dark:text-slate-400">Acompanhamento do seu filho</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600 dark:text-slate-300">{{ userName() }}</span>
              <button (click)="logout()" class="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Sair">
                <span class="material-icons">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Patient Selector -->
      @if (patients().length > 1) {
        <div class="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div class="flex gap-2 overflow-x-auto">
              @for (patient of patients(); track patient.id) {
                <button 
                  (click)="selectPatient(patient)"
                  class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                  [class]="selectedPatientId() === patient.id 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'">
                  {{ patient.name }}
                </button>
              }
            </div>
          </div>
        </div>
      }

      <!-- Navigation -->
      <nav class="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex gap-1 overflow-x-auto py-2">
            @for (item of navItems; track item.route) {
              <a [routerLink]="item.route" routerLinkActive="bg-primary/10 text-primary"
                class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 whitespace-nowrap transition-all">
                <span class="material-icons text-lg">{{ item.icon }}</span>
                {{ item.label }}
              </a>
            }
          </div>
        </div>
      </nav>

      <!-- Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class GuardianLayoutComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private guardianService = inject(GuardianService);

  patients = signal<any[]>([]);
  selectedPatientId = signal<string>('');
  userName = signal('');

  navItems = [
    { route: '/guardian', label: 'Início', icon: 'home' },
    { route: '/guardian/evolutions', label: 'Evoluções', icon: 'trending_up' },
    { route: '/guardian/appointments', label: 'Agendamentos', icon: 'event' },
    { route: '/guardian/financial', label: 'Financeiro', icon: 'payments' },
    { route: '/guardian/documents', label: 'Documentos', icon: 'description' },
    { route: '/guardian/chat', label: 'Mensagens', icon: 'chat' },
    { route: '/guardian/settings', label: 'Configurações', icon: 'settings' },
  ];

  ngOnInit() {
    const user = this.auth.user();
    if (user) {
      this.userName.set(user.name);
    }

    const savedPatientId = localStorage.getItem('guardian_patient_id');
    if (savedPatientId) {
      this.selectedPatientId.set(savedPatientId);
    }

    this.loadPatients();
  }

  loadPatients() {
    this.guardianService.getPatients().subscribe({
      next: (res: any) => {
        const patientList = res.data || res || [];
        this.patients.set(patientList);
        if (patientList.length > 0 && !this.selectedPatientId()) {
          this.selectPatient(patientList[0]);
        }
      }
    });
  }

  selectPatient(patient: any) {
    this.selectedPatientId.set(patient.id);
    localStorage.setItem('guardian_patient_id', patient.id);
  }

  logout() {
    this.auth.logout();
  }
}
