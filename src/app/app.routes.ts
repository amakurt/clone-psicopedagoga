import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./modules/landing/landing-page.component').then(m => m.LandingPageComponent) },
  { path: 'login', loadComponent: () => import('./modules/auth/pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'auth/verify', loadComponent: () => import('./modules/auth/pages/verify/verify-account.component').then(m => m.VerifyAccountComponent) },
  { path: 'auth/recuperar-senha', loadComponent: () => import('./modules/auth/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'auth/callback', loadComponent: () => import('./modules/auth/pages/callback/auth-callback.component').then(m => m.AuthCallbackComponent) },
  { path: 'auth/select-clinic', loadComponent: () => import('./modules/auth/pages/select-clinic/select-clinic.component').then(m => m.SelectClinicComponent) },
  { path: 'formulario/:token', loadComponent: () => import('./modules/formulario/formulario.component').then(m => m.PublicFormComponent) },
  {
    path: 'app',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'pacientes', loadChildren: () => import('./modules/pacientes/pacientes.routes').then(m => m.default) },
      { path: 'anamnese', loadChildren: () => import('./modules/anamnese/anamnese.routes').then(m => m.default) },
      { path: 'sessoes', loadChildren: () => import('./modules/sessoes/sessoes.routes').then(m => m.default) },
      { path: 'laudos', loadChildren: () => import('./modules/laudos/laudos.routes').then(m => m.default) },
      { 
        path: 'encaminhamentos', 
        loadChildren: () => import('./modules/encaminhamentos/encaminhamentos.routes').then(m => m.default),
        canActivate: [roleGuard],
        data: { roles: ['GESTOR', 'PSICOPEDAGOGO'] }
      },
      { path: 'comunicacao', loadChildren: () => import('./modules/comunicacao/comunicacao.routes').then(m => m.default) },
      { 
        path: 'financeiro', 
        loadChildren: () => import('./modules/financeiro/financeiro.routes').then(m => m.default),
        canActivate: [roleGuard],
        data: { roles: ['GESTOR', 'SECRETARIA'] }
      },
      { path: 'configuracoes', loadChildren: () => import('./modules/configuracoes/configuracoes.routes').then(m => m.default) },
      { path: 'evolucoes', loadChildren: () => import('./modules/evolucoes/evolucoes.routes').then(m => m.default) },
      { path: 'lgpd', loadChildren: () => import('./modules/lgpd/lgpd.routes').then(m => m.default) },
      { 
        path: 'responsaveis', 
        loadChildren: () => import('./modules/responsaveis/responsaveis.routes').then(m => m.default),
        canActivate: [roleGuard],
        data: { roles: ['GESTOR', 'PSICOPEDAGOGO'] }
      },
      { 
        path: 'escolas', 
        loadChildren: () => import('./modules/escolas/escolas.routes').then(m => m.default),
        canActivate: [roleGuard],
        data: { roles: ['GESTOR'] }
      },
      { path: 'agenda', loadChildren: () => import('./modules/agenda/agenda.routes').then(m => m.default) },
      { path: 'documentos', loadChildren: () => import('./modules/documentos/documentos.routes').then(m => m.default) },
      { path: 'biblioteca', loadChildren: () => import('./modules/biblioteca/biblioteca.routes').then(m => m.default) },
      { path: 'protocolos', loadChildren: () => import('./modules/protocolos/protocolos.routes').then(m => m.default) },
      { path: 'protocolos-aba', loadChildren: () => import('./modules/protocolos-aba/protocolos-aba.routes').then(m => m.default) },
      { path: 'rastreios', loadChildren: () => import('./modules/rastreios/rastreios.routes').then(m => m.default) },
      { path: 'session-planner', loadComponent: () => import('./modules/session-planner/pages/session-planner.component').then(m => m.SessionPlannerComponent) },
      { path: 'evidencias', loadChildren: () => import('./modules/evidencias/evidencias.routes').then(m => m.default) },
      { path: 'acordos', loadChildren: () => import('./modules/acordos/acordos.routes').then(m => m.default) },
      { path: 'modelos', loadChildren: () => import('./modules/modelos/modelos.routes').then(m => m.default) },
      { path: 'jogos', loadChildren: () => import('./modules/jogos/jogos.routes').then(m => m.default) },
      { path: 'materiais', loadComponent: () => import('./modules/biblioteca/pages/materiais-expandidos.component').then(m => m.MateriaisExpandidosComponent) },
      { path: 'academia', loadChildren: () => import('./modules/academia/academia.routes').then(m => m.default) },
      { path: 'kit-docente', loadChildren: () => import('./modules/kit-docente/kit-docente.routes').then(m => m.default) },
      { path: 'comunidade', loadChildren: () => import('./modules/comunidade/comunidade.routes').then(m => m.default) },
      { path: 'planos', loadChildren: () => import('./modules/planos/planos.routes').then(m => m.default) },
      { path: 'documentos-clinicos', loadChildren: () => import('./modules/documentos-clinicos/documentos-clinicos.routes').then(m => m.default) },
      { path: 'whatsapp', loadChildren: () => import('./modules/whatsapp/whatsapp.routes').then(m => m.default) },
      { path: 'plano', loadChildren: () => import('./modules/billing/billing.routes').then(m => m.default) },
      { path: 'solicitacoes', loadChildren: () => import('./modules/solicitacoes/solicitacoes.routes').then(m => m.default) },
      { 
        path: 'users', 
        loadChildren: () => import('./modules/users/users.routes').then(m => m.default),
        canActivate: [roleGuard],
        data: { roles: ['GESTOR'] }
      },
    ]
  },
  {
    path: 'guardian',
    loadComponent: () => import('./layout/guardian-layout/guardian-layout.component').then(m => m.GuardianLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['RESPONSAVEL'] },
    loadChildren: () => import('./modules/guardian/guardian.routes').then(m => m.default)
  },
  { path: '**', redirectTo: '' }
];
