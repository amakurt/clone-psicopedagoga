import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ApiService } from '@core/services/api.service';
import { GuardianService } from '@modules/guardian/services/guardian.service';
import { ChatFloatingComponent } from '@shared/components/chat-floating.component';
import { NotificationDropdownComponent } from '@shared/components/notification-dropdown.component';

@Component({
  selector: 'app-guardian-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ChatFloatingComponent, NotificationDropdownComponent],
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
              @if (auth.tenants().length > 1) {
                <div class="relative">
                  <button class="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-gray-600 dark:text-slate-300 transition-all max-w-[200px]"
                    (click)="tenantOpen.set(!tenantOpen())" title="Trocar de clínica">
                    <span class="material-icons text-primary text-lg">domain</span>
                    <span class="text-xs font-bold truncate">{{ auth.tenant()?.name || 'Clínica' }}</span>
                  </button>
                  @if (tenantOpen()) {
                    <div class="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 p-2">
                      @for (tenant of auth.tenants(); track tenant.id) {
                        <button
                          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                          [class]="tenant.id === auth.tenant()?.id
                            ? 'bg-primary/10 text-primary'
                            : (tenant.status === 'BLOQUEADO'
                              ? 'opacity-50 cursor-not-allowed'
                              : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700')"
                          [disabled]="tenant.status === 'BLOQUEADO' || switching()"
                          (click)="switchTenant(tenant)">
                          <span class="material-icons text-[16px] text-primary">domain</span>
                          <span class="text-xs font-bold truncate">{{ tenant.name }}</span>
                          @if (tenant.id === auth.tenant()?.id) {
                            <span class="material-icons text-[16px] ml-auto">check_circle</span>
                          }
                        </button>
                      }
                    </div>
                  }
                </div>
              }
              <span class="text-sm text-gray-600 dark:text-slate-300">{{ userName() }}</span>
              <div class="relative">
                <button class="p-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-gray-500 dark:text-slate-300 hover:text-primary transition-all relative"
                  (click)="toggleNotifications()" title="Notificações">
                  <span class="material-icons">notifications</span>
                  @if (notifCount() > 0) {
                    <span class="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                      {{ notifCount() > 99 ? '99+' : notifCount() }}
                    </span>
                  }
                </button>
                @if (notifOpen()) {
                  <app-notification-dropdown [isOpen]="notifOpen()" (closed)="toggleNotifications()" (countChanged)="loadCounts()" />
                  <div class="fixed inset-0 z-40" (click)="notifOpen.set(false)"></div>
                }
              </div>
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
    <app-chat-floating [guardian]="true" />
  `
})
export class GuardianLayoutComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private router = inject(Router);
  private guardianService = inject(GuardianService);
  private api = inject(ApiService);

  patients = signal<any[]>([]);
  selectedPatientId = signal<string>('');
  userName = signal('');
  notifCount = signal(0);
  notifOpen = signal(false);
  tenantOpen = signal(false);
  switching = signal(false);
  private notifTimer: any;

  navItems = [
    { route: '/guardian', label: 'Início', icon: 'home' },
    { route: '/guardian/evolutions', label: 'Evoluções', icon: 'trending_up' },
    { route: '/guardian/appointments', label: 'Agendamentos', icon: 'event' },
    { route: '/guardian/financial', label: 'Cobranças', icon: 'payments' },
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
    this.loadCounts();
    this.notifTimer = setInterval(() => this.loadCounts(), 15000);
  }

  ngOnDestroy() {
    if (this.notifTimer) clearInterval(this.notifTimer);
  }

  loadCounts() {
    this.api.get('/notifications', { read: 'false' }).subscribe({
      next: (res: any) => this.notifCount.set(res.total || 0),
      error: () => {}
    });
  }

  toggleNotifications() {
    if (this.notifOpen()) {
      this.notifOpen.set(false);
      this.loadCounts();
    } else {
      this.notifOpen.set(true);
    }
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

  switchTenant(tenant: any) {
    if (tenant.status === 'BLOQUEADO' || tenant.id === this.auth.tenant()?.id) {
      this.tenantOpen.set(false);
      return;
    }
    this.switching.set(true);
    this.auth
      .selectTenant(tenant.id)
      .then(() => window.location.reload())
      .catch(() => {
        this.switching.set(false);
        this.tenantOpen.set(false);
      });
  }

  logout() {
    this.auth.logout();
  }
}
