import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ToastComponent } from '../../shared/components/toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ToastComponent],
  template: `
    <div class="flex h-screen overflow-hidden" [class.dark]="isDarkMode()">
      <aside class="shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col transition-all duration-300 ease-in-out relative"
        [class.w-64]="sidebarOpen()"
        [class.w-20]="!sidebarOpen()">

        <button class="absolute -right-3 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 text-slate-400 hover:text-primary transition-colors shadow-sm z-50"
          (click)="toggleSidebar()">
          <span class="material-icons text-[14px]">{{ sidebarOpen() ? 'chevron_left' : 'chevron_right' }}</span>
        </button>

        <div class="p-6 flex items-center gap-3" [class.justify-center]="!sidebarOpen()" [class.px-4]="!sidebarOpen()">
          <div class="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
            <span class="material-icons text-[24px]">dashboard</span>
          </div>
          <div class="overflow-hidden transition-all duration-300" [class.w-0]="!sidebarOpen()" [class.opacity-0]="!sidebarOpen()" [class.w-auto]="sidebarOpen()" [class.opacity-100]="sidebarOpen()">
            <h1 class="text-slate-900 dark:text-white text-base font-bold leading-tight whitespace-nowrap">EduPsych Pro</h1>
            <p class="text-primary text-xs font-semibold tracking-wide uppercase whitespace-nowrap">Gestão</p>
          </div>
        </div>

        <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          @for (item of navItems; track item.id) {
            <a [routerLink]="item.route"
               routerLinkActive="bg-primary/10 text-primary"
               class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative"
               [class.justify-center]="!sidebarOpen()"
               [class.text-slate-600]="true"
               [class.dark:text-slate-400]="true"
               [title]="item.label">
              <span class="material-icons text-[20px] shrink-0">{{ item.icon }}</span>
              <span class="text-sm whitespace-nowrap overflow-hidden transition-all duration-300 font-semibold"
                [class.w-0]="!sidebarOpen()" [class.opacity-0]="!sidebarOpen()"
                [class.w-auto]="sidebarOpen()" [class.opacity-100]="sidebarOpen()">
                {{ item.label }}
              </span>
              @if (item.count() > 0) {
                <span class="absolute flex items-center justify-center bg-red-500 text-white text-[8px] font-black rounded-full transition-all"
                  [class.right-3]="sidebarOpen()" [class.min-w-[14px]]="sidebarOpen()" [class.h-[14px]]="sidebarOpen()" [class.px-1]="sidebarOpen()"
                  [class.top-1.5]="!sidebarOpen()" [class.right-1.5]="!sidebarOpen()" [class.size-2]="!sidebarOpen()">
                  {{ sidebarOpen() ? item.count() : '' }}
                </span>
              }
            </a>
          }

          <div class="pt-4 pb-2 px-3" [class.opacity-0]="!sidebarOpen()">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Administrativo</p>
          </div>

          <a routerLink="/app/configuracoes"
             routerLinkActive="bg-primary/10 text-primary"
             class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group"
             [class.justify-center]="!sidebarOpen()"
             [class.text-slate-600]="true"
             [class.dark:text-slate-400]="true"
             title="Configurações">
            <span class="material-icons text-[20px] shrink-0">settings</span>
            <span class="text-sm whitespace-nowrap overflow-hidden transition-all duration-300 font-semibold"
              [class.w-0]="!sidebarOpen()" [class.opacity-0]="!sidebarOpen()"
              [class.w-auto]="sidebarOpen()" [class.opacity-100]="sidebarOpen()">
              Configurações
            </span>
          </a>
        </nav>

        <div class="p-4 border-t border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
            [class.justify-center]="!sidebarOpen()">
            <div class="size-9 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
              @if (auth.user()?.avatarUrl) {
                <img [src]="auth.user()?.avatarUrl" class="size-full object-cover">
              } @else {
                <span class="material-icons text-slate-300 text-xl">person</span>
              }
            </div>
            <div class="flex-1 min-w-0 transition-all duration-300" [class.w-0]="!sidebarOpen()" [class.opacity-0]="!sidebarOpen()" [class.w-auto]="sidebarOpen()" [class.opacity-100]="sidebarOpen()">
              <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ auth.user()?.name || 'Usuário' }}</p>
              <p class="text-[10px] text-slate-500 truncate">{{ auth.user()?.role || 'Profissional' }}</p>
            </div>
          </div>

          <button class="w-full mt-2 flex items-center gap-3 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
            [class.justify-center]="!sidebarOpen()"
            (click)="auth.logout()"
            title="Sair">
            <span class="material-icons text-[18px]">logout</span>
            <span class="text-xs font-bold whitespace-nowrap overflow-hidden transition-all duration-300"
              [class.w-0]="!sidebarOpen()" [class.opacity-0]="!sidebarOpen()"
              [class.w-auto]="sidebarOpen()" [class.opacity-100]="sidebarOpen()">
              Sair do Sistema
            </span>
          </button>
        </div>
      </aside>

      <main class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#eff2f6] dark:bg-[#19212e] transition-colors duration-200">
        <header class="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white">{{ currentPageTitle() }}</h2>
          </div>
          <div class="flex items-center gap-3">
            <div class="relative">
              <button class="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 hover:text-primary transition-all relative">
                <span class="material-icons text-xl">notifications</span>
                @if (notifCount() > 0) {
                  <span class="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                    {{ notifCount() }}
                  </span>
                }
              </button>
            </div>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div class="max-w-[1400px] mx-auto">
            <router-outlet />
          </div>
        </div>
      </main>
    </div>
    <app-toast />
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
  `]
})
export class MainLayoutComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  sidebarOpen = signal(true);
  isDarkMode = signal(false);
  notifCount = signal(0);

  navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: '/app/dashboard', count: signal(0) },
    { id: 'pacientes', label: 'Pacientes', icon: 'people', route: '/app/pacientes', count: signal(0) },
    { id: 'evolucoes', label: 'Evoluções', icon: 'show_chart', route: '/app/evolucoes', count: signal(0) },
    { id: 'responsaveis', label: 'Responsáveis', icon: 'person_add', route: '/app/responsaveis', count: signal(0) },
    { id: 'escolas', label: 'Escolas', icon: 'school', route: '/app/escolas', count: signal(0) },
    { id: 'agenda', label: 'Agenda', icon: 'calendar_month', route: '/app/agenda', count: signal(0) },
    { id: 'sala-espera', label: 'Sala de Espera', icon: 'event_seat', route: '/app/agenda/sala-espera', count: signal(0) },
    { id: 'tv-sala', label: 'Painel TV', icon: 'tv', route: '/app/agenda/tv', count: signal(0) },
    { id: 'financeiro', label: 'Financeiro', icon: 'account_balance_wallet', route: '/app/financeiro', count: signal(0) },
    { id: 'nfse', label: 'NFS-e', icon: 'receipt_long', route: '/app/financeiro/nfse', count: signal(0) },
    { id: 'documentos', label: 'Documentos', icon: 'folder_open', route: '/app/documentos', count: signal(0) },
    { id: 'documentos-clinicos', label: 'Docs Clínicos', icon: 'note', route: '/app/documentos-clinicos', count: signal(0) },
    { id: 'biblioteca', label: 'Biblioteca', icon: 'menu_book', route: '/app/biblioteca', count: signal(0) },
    { id: 'protocolos', label: 'Protocolos', icon: 'fact_check', route: '/app/protocolos', count: signal(0) },
    { id: 'protocolos-aba', label: 'Protocolos ABA', icon: 'psychology', route: '/app/protocolos-aba', count: signal(0) },
    { id: 'planos', label: 'Planos', icon: 'description', route: '/app/planos', count: signal(0) },
    { id: 'planos-ia', label: 'Plano IA', icon: 'auto_awesome', route: '/app/planos/ia', count: signal(0) },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'chat', route: '/app/whatsapp', count: signal(0) },
    { id: 'solicitacoes', label: 'Solicitações', icon: 'assignment_turned_in', route: '/app/solicitacoes', count: signal(0) },
    { id: 'lgpd', label: 'LGPD', icon: 'gpp_good', route: '/app/lgpd', count: signal(0) },
  ];

  currentPageTitle = signal('Dashboard');

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode.set(savedTheme === 'dark');
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    }

    localStorage.setItem('sidebar_open', 'true');
    this.sidebarOpen.set(true);

    this.router.events.subscribe(() => {
      this.updatePageTitle();
    });
    this.updatePageTitle();
    this.loadCounts();
  }

  updatePageTitle() {
    const path = this.router.url.split('?')[0].split('/')[1] || 'dashboard';
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      pacientes: 'Pacientes',
      evolucoes: 'Evoluções',
      responsaveis: 'Responsáveis',
      escolas: 'Escolas',
      agenda: 'Agenda',
      'sala-espera': 'Sala de Espera',
      financeiro: 'Financeiro',
      nfse: 'NFS-e',
      documentos: 'Documentos',
      'documentos-clinicos': 'Documentos Clínicos',
      biblioteca: 'Biblioteca',
      protocolos: 'Protocolos',
      'protocolos-aba': 'Protocolos ABA',
      planos: 'Planos',
      'planos-ia': 'Plano IA',
      configuracoes: 'Configurações',
      whatsapp: 'WhatsApp',
      solicitacoes: 'Solicitações',
      lgpd: 'LGPD',
    };
    this.currentPageTitle.set(titles[path] || 'Dashboard');
  }

  loadCounts() {
    this.api.get('/appointments', { status: 'PENDENTE' }).subscribe({
      next: (res: any) => this.navItems.find(i => i.id === 'agenda')?.count.set(res.total || 0),
      error: () => {}
    });
    this.api.get('/notifications', { read: 'false' }).subscribe({
      next: (res: any) => this.notifCount.set(res.total || 0),
      error: () => {}
    });
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
    localStorage.setItem('sidebar_open', String(this.sidebarOpen()));
  }

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
    localStorage.setItem('theme', this.isDarkMode() ? 'dark' : 'light');
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
