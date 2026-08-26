import { Component, inject, signal, OnInit, OnDestroy, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { applyAccentColor } from '../../core/utils/theme';
import { ToastComponent } from '../../shared/components/toast.component';
import { NotificationDropdownComponent } from '../../shared/components/notification-dropdown.component';
import { ChatFloatingComponent } from '../../shared/components/chat-floating.component';

type NavItem = {
  id: string;
  label: string;
  icon: string;
  route?: string;
  count?: WritableSignal<number>;
  children?: NavItem[];
  profile?: boolean;
  action?: string;
};

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ToastComponent, NotificationDropdownComponent, ChatFloatingComponent],
  template: `
    <div class="flex h-screen overflow-hidden" [class.dark]="isDarkMode()">
      
      <!-- Backdrop móvel para tela pequena (< lg) -->
      @if (mobileSidebarOpen()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          (click)="mobileSidebarOpen.set(false)"></div>
      }

      <!-- Sidebar / Drawer Lateral -->
      <aside 
        class="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] lg:static lg:z-auto shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none"
        [class.-translate-x-full]="!mobileSidebarOpen()"
        [class.translate-x-0]="mobileSidebarOpen()"
        [class.lg:translate-x-0]="true"
        [class.lg:w-64]="sidebarOpen()"
        [class.lg:w-20]="!sidebarOpen()">

        <!-- Botão Desktop de Recolher / Expandir Sidebar -->
        <button class="hidden lg:flex absolute -right-3 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 text-slate-500 hover:text-primary transition-colors shadow-sm z-50 items-center justify-center"
          (click)="toggleSidebar()" title="Recolher / Expandir menu">
          <span class="material-icons text-[14px]">{{ sidebarOpen() ? 'chevron_left' : 'chevron_right' }}</span>
        </button>

        <!-- Topo da Sidebar (Logo + Botão Fechar no Mobile) -->
        <div class="p-4 sm:p-6 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 lg:border-b-0"
          [class.lg:justify-center]="!sidebarOpen()" [class.lg:px-4]="!sidebarOpen()">
          <div class="flex items-center gap-3">
            <div class="size-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/20 shrink-0">
              <span class="material-icons text-[24px]">dashboard</span>
            </div>
            <div class="overflow-hidden transition-all duration-300" 
              [class.lg:w-0]="!sidebarOpen()" [class.lg:opacity-0]="!sidebarOpen()" 
              [class.lg:w-auto]="sidebarOpen()" [class.lg:opacity-100]="sidebarOpen()">
              <h1 class="text-slate-900 dark:text-white text-base font-bold leading-tight whitespace-nowrap">EduPsych Pro</h1>
              <p class="text-primary text-xs font-semibold tracking-wide uppercase whitespace-nowrap">Gestão Clínica</p>
            </div>
          </div>

          <!-- Botão Fechar (apenas mobile) -->
          <button (click)="mobileSidebarOpen.set(false)" 
            class="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Fechar menu">
            <span class="material-icons text-xl">close</span>
          </button>
        </div>

        <!-- Links de Navegação -->
        <nav class="flex-1 px-3 sm:px-4 py-3 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          @for (item of navItems; track item.id) {
            @if (item.children?.length) {
              <div>
                <button (click)="toggleMenu(item.id)"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative"
                  [class.lg:justify-center]="!sidebarOpen()"
                  [class.text-primary]="isGroupActive(item.id)"
                  [class.text-slate-600]="!isGroupActive(item.id)"
                  [class.dark:text-slate-400]="!isGroupActive(item.id)"
                  [title]="item.label">
                  <span class="material-icons text-[20px] shrink-0">{{ item.icon }}</span>
                  <span class="text-sm whitespace-nowrap overflow-hidden transition-all duration-300 font-semibold text-left flex-1"
                    [class.lg:w-0]="!sidebarOpen()" [class.lg:opacity-0]="!sidebarOpen()"
                    [class.lg:w-auto]="sidebarOpen()" [class.lg:opacity-100]="sidebarOpen()">
                    {{ item.label }}
                  </span>
                  <span class="material-icons text-[18px] transition-transform duration-300 shrink-0"
                    [class.lg:hidden]="!sidebarOpen()"
                    [class.rotate-180]="isExpanded(item.id)">expand_more</span>
                </button>
                @if (isExpanded(item.id) && (mobileSidebarOpen() || sidebarOpen())) {
                  <div class="ml-3 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                    @for (child of item.children; track child.id) {
                      @if (child.profile) {
                        <div class="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-1">
                          <div class="size-9 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                            @if (auth.user()?.avatarUrl) {
                              <img [src]="auth.user()?.avatarUrl" class="size-full object-cover">
                            } @else {
                              <span class="material-icons text-slate-600 text-xl">person</span>
                            }
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ auth.user()?.name || 'Usuário' }}</p>
                            <p class="text-[10px] text-slate-500 truncate">{{ auth.user()?.role || 'Profissional' }}</p>
                          </div>
                        </div>
                      } @else if (child.action) {
                        <button (click)="handleChildAction(child)"
                          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                          [title]="child.label">
                          <span class="material-icons text-[18px] shrink-0">{{ child.icon }}</span>
                          <span class="text-[13px] whitespace-nowrap overflow-hidden font-medium">{{ child.label }}</span>
                        </button>
                      } @else {
                        <a [routerLink]="child.route"
                           (click)="onLinkClick()"
                           routerLinkActive="bg-primary/10 text-primary font-bold"
                           [routerLinkActiveOptions]="{ exact: true }"
                           class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                           [title]="child.label">
                          <span class="material-icons text-[18px] shrink-0">{{ child.icon }}</span>
                          <span class="text-[13px] whitespace-nowrap overflow-hidden font-medium">{{ child.label }}</span>
                        </a>
                      }
                    }
                  </div>
                }
              </div>
            } @else {
              <a [routerLink]="item.route"
                 (click)="onLinkClick()"
                 routerLinkActive="bg-primary/10 text-primary font-bold"
                 class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                 [class.lg:justify-center]="!sidebarOpen()"
                 [title]="item.label">
                <span class="material-icons text-[20px] shrink-0">{{ item.icon }}</span>
                <span class="text-sm whitespace-nowrap overflow-hidden transition-all duration-300 font-semibold"
                  [class.lg:w-0]="!sidebarOpen()" [class.lg:opacity-0]="!sidebarOpen()"
                  [class.lg:w-auto]="sidebarOpen()" [class.lg:opacity-100]="sidebarOpen()">
                  {{ item.label }}
                </span>
                @if (item.count && item.count() > 0) {
                  <span class="absolute flex items-center justify-center bg-red-600 text-white text-[9px] font-black rounded-full transition-all right-3 min-w-[16px] h-[16px] px-1"
                    [class.lg:right-3]="sidebarOpen()" [class.lg:min-w-[16px]]="sidebarOpen()" [class.lg:h-[16px]]="sidebarOpen()"
                    [class.lg:top-1.5]="!sidebarOpen()" [class.lg:right-1.5]="!sidebarOpen()" [class.lg:size-2.5]="!sidebarOpen()" [class.lg:p-0]="!sidebarOpen()">
                    <span [class.lg:hidden]="!sidebarOpen()">{{ item.count() }}</span>
                  </span>
                }
              </a>
            }
          }
        </nav>
      </aside>

      <!-- Conteúdo Principal -->
      <main class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#eff2f6] dark:bg-[#19212e] transition-colors duration-200">
        
        <!-- Header Superior -->
        <header class="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 lg:px-8 shrink-0 z-30">
          
          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <!-- Botão Hamburger no Mobile -->
            <button (click)="mobileSidebarOpen.set(true)"
              class="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
              title="Abrir menu">
              <span class="material-icons text-2xl">menu</span>
            </button>

            <!-- Breadcrumb dinâmico -->
            <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
              <span class="hidden sm:flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium">
                <span class="material-icons text-[15px]">home</span>
                <span>EduPsych</span>
                <span class="text-slate-300 dark:text-slate-700 ml-1">/</span>
              </span>
              <span class="text-slate-800 dark:text-slate-200 font-bold tracking-wide truncate">{{ currentPageTitle() }}</span>
            </div>
          </div>

          <!-- Ações do Header -->
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">
            @if (auth.tenants().length > 1) {
              <div class="relative">
                <button class="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-all max-w-[130px] sm:max-w-[200px]"
                  (click)="tenantOpen.set(!tenantOpen())" title="Trocar de clínica">
                  <div class="size-5 sm:size-6 rounded-md bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                    @if (auth.tenant()?.logoUrl) {
                      <img [src]="auth.tenant()?.logoUrl" class="size-full object-cover">
                    } @else {
                      <span class="material-icons text-[13px] sm:text-[14px] text-primary">domain</span>
                    }
                  </div>
                  <span class="text-xs font-bold truncate">{{ auth.tenant()?.name || 'Clínica' }}</span>
                  <span class="material-icons text-[16px] shrink-0">arrow_drop_down</span>
                </button>
                @if (tenantOpen()) {
                  <div class="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 p-2">
                    @for (tenant of auth.tenants(); track tenant.id) {
                      <button
                        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                        [class]="tenant.id === auth.tenant()?.id
                          ? 'bg-primary/10 text-primary'
                          : (tenant.status === 'BLOQUEADO'
                            ? 'opacity-50 cursor-not-allowed'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700')"
                        [disabled]="tenant.status === 'BLOQUEADO' || switching()"
                        (click)="switchTenant(tenant)">
                        <div class="size-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                          @if (tenant.logoUrl) {
                            <img [src]="tenant.logoUrl" class="size-full object-cover">
                          } @else {
                            <span class="material-icons text-[16px] text-primary">domain</span>
                          }
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-xs font-bold truncate">{{ tenant.name }}</p>
                          <p class="text-[10px] opacity-70">{{ tenant.role }} · {{ tenant.status === 'BLOQUEADO' ? 'bloqueada' : tenant.plan }}</p>
                        </div>
                        @if (tenant.id === auth.tenant()?.id) {
                          <span class="material-icons text-[16px]">check_circle</span>
                        }
                      </button>
                    }
                  </div>
                }
              </div>
            }

            <!-- Notificações -->
            <div class="relative">
              <button class="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 hover:text-primary transition-all relative flex items-center justify-center"
                (click)="toggleNotifications()" title="Notificações">
                <span class="material-icons text-xl">notifications</span>
                @if (notifCount() > 0) {
                  <span class="absolute -top-1 -right-1 size-5 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                    {{ notifCount() > 99 ? '99+' : notifCount() }}
                  </span>
                }
              </button>
              @if (notifOpen()) {
                <app-notification-dropdown [isOpen]="notifOpen()" (closed)="toggleNotifications()" (countChanged)="loadCounts()" />
                <div class="fixed inset-0 z-40" (click)="notifOpen.set(false)"></div>
              }
            </div>
          </div>
        </header>

        <!-- Área de Conteúdo com padding adaptativo -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div class="max-w-[1400px] mx-auto w-full">
            <router-outlet />
          </div>
        </div>
      </main>
    </div>
    <app-toast />
    <app-chat-floating />
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  sidebarOpen = signal(true);
  mobileSidebarOpen = signal(false);
  isDarkMode = signal(false);
  notifCount = signal(0);
  notifOpen = signal(false);
  tenantOpen = signal(false);
  switching = signal(false);
  private notifTimer: any;
  private menuOpen = signal(new Set<string>());

  navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: '/app/dashboard', count: signal(0) },
    { id: 'pacientes', label: 'Pacientes', icon: 'people', route: '/app/pacientes', count: signal(0) },
    { id: 'evolucoes', label: 'Evoluções', icon: 'show_chart', route: '/app/evolucoes', count: signal(0) },
    { id: 'responsaveis', label: 'Responsáveis', icon: 'person_add', route: '/app/responsaveis', count: signal(0) },
    { id: 'escolas', label: 'Escolas', icon: 'school', route: '/app/escolas', count: signal(0) },
    { id: 'agenda', label: 'Agenda', icon: 'calendar_month', route: '/app/agenda', count: signal(0) },
    { id: 'sala-espera', label: 'Sala de Espera', icon: 'event_seat', route: '/app/agenda/sala-espera', count: signal(0) },
    { id: 'tv-sala', label: 'Painel TV', icon: 'tv', route: '/app/agenda/tv', count: signal(0) },
    {
      id: 'financeiro', label: 'Financeiro', icon: 'account_balance_wallet',
      children: [
        { id: 'fin-main', label: 'Financeiro', icon: 'account_balance_wallet', route: '/app/financeiro' },
        { id: 'nfse', label: 'NFS-e', icon: 'receipt_long', route: '/app/financeiro/nfse' },
        { id: 'fin-dre', label: 'DRE', icon: 'assessment', route: '/app/financeiro/dre' },
      ],
    },
    {
      id: 'documentos', label: 'Documentos', icon: 'folder_open',
      children: [
        { id: 'doc-arquivos', label: 'Arquivos', icon: 'folder', route: '/app/documentos' },
        { id: 'doc-diario', label: 'Diário de Sessões', icon: 'edit_note', route: '/app/documentos-clinicos/diario' },
        { id: 'doc-frequencia', label: 'Frequência', icon: 'checklist', route: '/app/documentos-clinicos/frequencia' },
        { id: 'doc-plano', label: 'Plano de Intervenção', icon: 'assignment', route: '/app/documentos-clinicos/plano' },
        { id: 'doc-biblioteca', label: 'Biblioteca', icon: 'menu_book', route: '/app/biblioteca' },
        { id: 'doc-laudos', label: 'Laudos', icon: 'description', route: '/app/laudos' },
        { id: 'doc-solicitacoes', label: 'Solicitações', icon: 'assignment_turned_in', route: '/app/solicitacoes' },
        { id: 'doc-encaminhamentos', label: 'Encaminhamentos', icon: 'forward', route: '/app/encaminhamentos' },
        { id: 'doc-lgpd', label: 'LGPD', icon: 'gpp_good', route: '/app/lgpd' },
      ],
    },
    {
      id: 'protocolos', label: 'Protocolos', icon: 'fact_check',
      children: [
        { id: 'proto-tea', label: 'Protocolo TEA', icon: 'fact_check', route: '/app/protocolos' },
        { id: 'proto-aba-assessment', label: 'Avaliação ABA', icon: 'psychology', route: '/app/protocolos-aba/assessment' },
        { id: 'proto-aba-programs', label: 'Programas ABA', icon: 'list_alt', route: '/app/protocolos-aba/programs' },
        { id: 'proto-rastreios', label: 'Rastreios', icon: 'biotech', route: '/app/rastreios' },
      ],
    },
    { id: 'planos', label: 'Planos', icon: 'description', route: '/app/planos', count: signal(0) },
    { id: 'planos-ia', label: 'Plano IA', icon: 'auto_awesome', route: '/app/planos/ia', count: signal(0) },
    { id: 'session-planner', label: 'Planner Sessoes', icon: 'timer', route: '/app/session-planner', count: signal(0) },
    { id: 'evidencias', label: 'Evidencias', icon: 'menu_book', route: '/app/evidencias', count: signal(0) },
    { id: 'acordos', label: 'Acordos', icon: 'handshake', route: '/app/acordos', count: signal(0) },
    { id: 'modelos', label: 'Modelos', icon: 'description', route: '/app/modelos', count: signal(0) },
    { id: 'jogos', label: 'Jogos', icon: 'sports_esports', route: '/app/jogos', count: signal(0) },
    { id: 'materiais', label: 'Materiais', icon: 'folder_special', route: '/app/materiais', count: signal(0) },
    { id: 'academia', label: 'Academia', icon: 'school', route: '/app/academia', count: signal(0) },
    { id: 'kit-docente', label: 'Kit Docente', icon: 'co_present', route: '/app/kit-docente', count: signal(0) },
    { id: 'comunidade', label: 'Comunidade', icon: 'forum', route: '/app/comunidade', count: signal(0) },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'chat', route: '/app/whatsapp', count: signal(0) },
    { id: 'plano', label: 'Plano e Assinatura', icon: 'credit_card', route: '/app/plano', count: signal(0) },
    {
      id: 'configuracoes', label: 'Configurações', icon: 'settings',
      children: [
        { id: 'cfg-user', label: '', icon: '', profile: true },
        { id: 'cfg-perfil', label: 'Meu Perfil', icon: 'person', route: '/app/configuracoes' },
        { id: 'cfg-sair', label: 'Sair do Sistema', icon: 'logout', action: 'logout' },
      ],
    },
  ];

  currentPageTitle = signal('Dashboard');

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

  onLinkClick() {
    this.mobileSidebarOpen.set(false);
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode.set(savedTheme === 'dark');
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    }

    const savedColor = localStorage.getItem('accentColor');
    if (savedColor) applyAccentColor(savedColor);

    const savedSidebar = localStorage.getItem('sidebar_open');
    if (savedSidebar !== null) {
      this.sidebarOpen.set(savedSidebar === 'true');
    }

    this.router.events.subscribe(() => {
      this.mobileSidebarOpen.set(false);
      this.updatePageTitle();
    });
    this.updatePageTitle();
    this.loadCounts();
    this.notifTimer = setInterval(() => this.loadCounts(), 10000);
  }

  ngOnDestroy() {
    if (this.notifTimer) clearInterval(this.notifTimer);
  }

  updatePageTitle() {
    const segs = this.router.url.split('?')[0].split('/').filter(Boolean);
    const path = segs[1] || 'dashboard';
    const sub = segs[2];
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
      laudos: 'Laudos',
      protocolos: 'Protocolos',
      'protocolos-aba': 'Protocolos ABA',
      rastreios: 'Rastreios',
      planos: 'Planos',
      'planos-ia': 'Plano IA',
      'session-planner': 'Planner Sessoes',
      configuracoes: 'Configurações',
      evidencias: 'Evidências',
      acordos: 'Acordos',
      modelos: 'Modelos de Documentos',
      jogos: 'Jogos Cognitivos',
      materiais: 'Materiais Terapêuticos',
      whatsapp: 'WhatsApp',
      solicitacoes: 'Solicitações',
      plano: 'Plano e Assinatura',
      lgpd: 'LGPD',
      encaminhamentos: 'Encaminhamentos',
      dre: 'DRE Financeiro',
    };
    let title = titles[path] || 'Dashboard';
    if (path === 'documentos-clinicos' && sub) {
      title = ({ diario: 'Diário de Sessões', frequencia: 'Frequência', plano: 'Plano de Intervenção' } as Record<string, string>)[sub] || title;
    }
    if (path === 'protocolos-aba' && sub) {
      title = ({ assessment: 'Avaliação ABA', programs: 'Programas ABA' } as Record<string, string>)[sub] || title;
    }
    if (path === 'financeiro' && sub) {
      title = ({ dre: 'DRE Financeiro', nfse: 'NFS-e' } as Record<string, string>)[sub] || title;
    }
    if (path === 'rastreios' && sub) {
      title = ({ novo: 'Novo Rastreio' } as Record<string, string>)[sub] || title;
    }
    this.currentPageTitle.set(title);
    this.syncExpandedMenus();
  }

  loadCounts() {
    this.api.get('/appointments', { status: 'PENDENTE' }).subscribe({
      next: (res: any) => this.navItems.find(i => i.id === 'agenda')?.count?.set(res.total || 0),
      error: () => {}
    });
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

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
    localStorage.setItem('sidebar_open', String(this.sidebarOpen()));
  }

  isExpanded(id: string): boolean {
    return this.menuOpen().has(id);
  }

  toggleMenu(id: string) {
    this.menuOpen.update(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  isGroupActive(id: string): boolean {
    const item = this.navItems.find(i => i.id === id);
    if (!item?.children) return false;
    return item.children.some(c => this.router.url.split('?')[0].startsWith(c.route || '/__none__'));
  }

  private syncExpandedMenus() {
    const url = this.router.url.split('?')[0];
    this.menuOpen.update(s => {
      const next = new Set(s);
      this.navItems.forEach(item => {
        const inside = item.children?.some(c => c.route && url.startsWith(c.route));
        if (inside) next.add(item.id);
      });
      return next;
    });
  }

  handleChildAction(child: NavItem) {
    if (child.action === 'logout') this.auth.logout();
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
