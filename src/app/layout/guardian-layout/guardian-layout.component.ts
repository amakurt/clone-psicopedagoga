import { Component, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
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
    <div class="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      <!-- Mobile Drawer Backdrop -->
      @if (mobileMenuOpen()) {
        <div 
          class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 animate-in fade-in"
          (click)="closeMobileMenu()">
        </div>
      }

      <!-- Mobile Drawer Sidebar -->
      <aside 
        class="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col shadow-2xl transition-transform duration-300 ease-out lg:hidden"
        [class.translate-x-0]="mobileMenuOpen()"
        [class.-translate-x-full]="!mobileMenuOpen()">
        
        <!-- Drawer Header -->
        <div class="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-icons text-2xl">family_restroom</span>
            </div>
            <div>
              <h2 class="font-bold text-sm text-gray-900 dark:text-white leading-tight">Portal da Família</h2>
              <p class="text-[11px] text-gray-500 dark:text-slate-400">EduPsych Pro</p>
            </div>
          </div>
          <button (click)="closeMobileMenu()" class="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <span class="material-icons text-xl">close</span>
          </button>
        </div>

        <!-- User info inside drawer -->
        <div class="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-sm shadow-sm">
              {{ (userName() || 'R').charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ userName() }}</p>
              <p class="text-xs text-gray-500 dark:text-slate-400 truncate">{{ auth.user()?.email || 'Responsável' }}</p>
            </div>
          </div>

          <!-- Multi-tenant switcher inside drawer -->
          @if (auth.tenants().length > 1) {
            <div class="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
              <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">Clínica Atual</p>
              <div class="space-y-1">
                @for (tenant of auth.tenants(); track tenant.id) {
                  <button
                    class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left"
                    [class]="tenant.id === auth.tenant()?.id
                      ? 'bg-primary/10 text-primary font-bold'
                      : (tenant.status === 'BLOQUEADO' ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800')"
                    [disabled]="tenant.status === 'BLOQUEADO' || switching()"
                    (click)="switchTenant(tenant)">
                    <span class="material-icons text-[16px] text-primary">domain</span>
                    <span class="truncate flex-1">{{ tenant.name }}</span>
                    @if (tenant.id === auth.tenant()?.id) {
                      <span class="material-icons text-[16px] text-primary">check_circle</span>
                    }
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <!-- Drawer Navigation links -->
        <nav class="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 px-3 py-1">Navegação</p>
          @for (item of navItems; track item.route) {
            <a [routerLink]="item.route" 
               (click)="closeMobileMenu()"
               routerLinkActive="bg-primary/10 text-primary font-bold"
               [routerLinkActiveOptions]="{ exact: item.route === '/guardian' }"
               class="flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all">
              <span class="material-icons text-[20px]">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <!-- Drawer Footer -->
        <div class="p-4 border-t border-gray-100 dark:border-slate-800">
          <button (click)="logout()" class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
            <span class="material-icons text-[18px]">logout</span> Sair da Conta
          </button>
        </div>
      </aside>

      <!-- Main Header -->
      <header class="sticky top-0 z-30 bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-sm border-b border-gray-200 dark:border-slate-700 transition-all">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-14 sm:h-16 gap-2">
            <!-- Left: Mobile Menu Button & Brand -->
            <div class="flex items-center gap-2 sm:gap-3">
              <button 
                (click)="toggleMobileMenu()" 
                class="lg:hidden p-2 -ml-1 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                title="Abrir Menu">
                <span class="material-icons text-2xl">menu</span>
              </button>

              <div class="flex items-center gap-2 sm:gap-3">
                <div class="size-9 sm:size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span class="material-icons text-xl sm:text-2xl">family_restroom</span>
                </div>
                <div class="min-w-0">
                  <h1 class="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">Portal da Família</h1>
                  <p class="hidden sm:block text-xs text-gray-500 dark:text-slate-400 truncate">Acompanhamento do seu filho</p>
                </div>
              </div>
            </div>

            <!-- Right: Clinic Switcher, Notifications, Profile & Logout -->
            <div class="flex items-center gap-1.5 sm:gap-3">
              @if (auth.tenants().length > 1) {
                <div class="relative">
                  <button class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-gray-600 dark:text-slate-300 transition-all max-w-[140px] sm:max-w-[200px]"
                    (click)="tenantOpen.set(!tenantOpen())" title="Trocar de clínica">
                    <span class="material-icons text-primary text-base sm:text-lg">domain</span>
                    <span class="text-xs font-bold truncate">{{ auth.tenant()?.name || 'Clínica' }}</span>
                  </button>
                  @if (tenantOpen()) {
                    <div class="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 p-2">
                      @for (tenant of auth.tenants(); track tenant.id) {
                        <button
                          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                          [class]="tenant.id === auth.tenant()?.id
                            ? 'bg-primary/10 text-primary font-bold'
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

              <span class="hidden md:inline text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-300 max-w-[120px] truncate">
                {{ userName() }}
              </span>

              <!-- Notification Bell -->
              <div class="relative">
                <button class="p-2 sm:p-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-gray-500 dark:text-slate-300 hover:text-primary transition-all relative"
                  (click)="toggleNotifications()" title="Notificações">
                  <span class="material-icons text-xl sm:text-2xl">notifications</span>
                  @if (notifCount() > 0) {
                    <span class="absolute -top-1 -right-1 size-4 sm:size-5 bg-red-500 text-white text-[8px] sm:text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                      {{ notifCount() > 99 ? '99+' : notifCount() }}
                    </span>
                  }
                </button>
                @if (notifOpen()) {
                  <app-notification-dropdown [isOpen]="notifOpen()" (closed)="toggleNotifications()" (countChanged)="loadCounts()" />
                  <div class="fixed inset-0 z-40" (click)="notifOpen.set(false)"></div>
                }
              </div>

              <!-- Logout -->
              <button (click)="logout()" class="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all" title="Sair">
                <span class="material-icons text-xl sm:text-2xl">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Patient Selector Pills -->
      @if (patients().length > 1) {
        <div class="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
          <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
            <div class="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1" style="-webkit-overflow-scrolling: touch;">
              <span class="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider shrink-0 pr-1 flex items-center gap-1">
                <span class="material-icons text-[14px]">face</span> Filho:
              </span>
              @for (patient of patients(); track patient.id) {
                <button 
                  (click)="selectPatient(patient)"
                  class="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
                  [class]="selectedPatientId() === patient.id 
                    ? 'bg-primary text-on-primary shadow-sm shadow-primary/20 scale-100' 
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'">
                  <span class="size-2 rounded-full" [class]="selectedPatientId() === patient.id ? 'bg-white' : 'bg-primary'"></span>
                  {{ patient.name }}
                </button>
              }
            </div>
          </div>
        </div>
      }

      <!-- Desktop Navigation Bar -->
      <nav class="hidden lg:block bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex gap-1 overflow-x-auto py-2 custom-scrollbar">
            @for (item of navItems; track item.route) {
              <a [routerLink]="item.route" 
                 routerLinkActive="bg-primary/10 text-primary font-bold shadow-sm"
                 [routerLinkActiveOptions]="{ exact: item.route === '/guardian' }"
                 class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 whitespace-nowrap transition-all">
                <span class="material-icons text-lg">{{ item.icon }}</span>
                {{ item.label }}
              </a>
            }
          </div>
        </div>
      </nav>

      <!-- Main Content Area with padding adjusted for mobile bottom bar -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-20 sm:pb-24 lg:pb-8">
        <router-outlet></router-outlet>
      </main>

      <!-- Mobile Bottom Navigation Bar (Fixed) -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-gray-200 dark:border-slate-800 px-2 py-1 shadow-lg">
        <div class="flex items-center justify-around">
          <a routerLink="/guardian" 
             routerLinkActive="text-primary font-bold" 
             [routerLinkActiveOptions]="{ exact: true }"
             class="flex flex-col items-center py-1 px-2 rounded-xl text-gray-500 dark:text-slate-400 hover:text-primary transition-all active:scale-95">
            <span class="material-icons text-2xl">home</span>
            <span class="text-[10px] mt-0.5">Início</span>
          </a>

          <a routerLink="/guardian/appointments" 
             routerLinkActive="text-primary font-bold"
             class="flex flex-col items-center py-1 px-2 rounded-xl text-gray-500 dark:text-slate-400 hover:text-primary transition-all active:scale-95">
            <span class="material-icons text-2xl">event</span>
            <span class="text-[10px] mt-0.5">Agenda</span>
          </a>

          <a routerLink="/guardian/financial" 
             routerLinkActive="text-primary font-bold"
             class="flex flex-col items-center py-1 px-2 rounded-xl text-gray-500 dark:text-slate-400 hover:text-primary transition-all active:scale-95">
            <span class="material-icons text-2xl">payments</span>
            <span class="text-[10px] mt-0.5">Cobranças</span>
          </a>

          <a routerLink="/guardian/chat" 
             routerLinkActive="text-primary font-bold"
             class="flex flex-col items-center py-1 px-2 rounded-xl text-gray-500 dark:text-slate-400 hover:text-primary transition-all active:scale-95">
            <span class="material-icons text-2xl">chat</span>
            <span class="text-[10px] mt-0.5">Chat</span>
          </a>

          <button 
             (click)="toggleMobileMenu()" 
             class="flex flex-col items-center py-1 px-2 rounded-xl text-gray-500 dark:text-slate-400 hover:text-primary transition-all active:scale-95"
             title="Mais opções">
            <span class="material-icons text-2xl">menu</span>
            <span class="text-[10px] mt-0.5">Mais</span>
          </button>
        </div>
      </nav>
    </div>
    @if (!isChatRoute()) {
      <app-chat-floating [guardian]="true" />
    }
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
  mobileMenuOpen = signal(false);
  isChatRoute = signal(false);
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

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 1024 && this.mobileMenuOpen()) {
      this.mobileMenuOpen.set(false);
    }
  }

  ngOnInit() {
    const user = this.auth.user();
    if (user) {
      this.userName.set(user.name);
    }

    const savedPatientId = localStorage.getItem('guardian_patient_id');
    if (savedPatientId) {
      this.selectedPatientId.set(savedPatientId);
    }

    this.isChatRoute.set(this.router.url.includes('/guardian/chat'));

    this.loadPatients();
    this.loadCounts();
    this.notifTimer = setInterval(() => this.loadCounts(), 15000);

    // Auto-close mobile drawer on route change & track chat route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.mobileMenuOpen.set(false);
      this.isChatRoute.set(event.urlAfterRedirects?.includes('/guardian/chat') || this.router.url.includes('/guardian/chat'));
    });
  }

  ngOnDestroy() {
    if (this.notifTimer) clearInterval(this.notifTimer);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
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
