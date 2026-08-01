import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./modules/auth/pages/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'pacientes', loadChildren: () => import('./modules/pacientes/pacientes.routes').then(m => m.default) },
      { path: 'anamnese', loadChildren: () => import('./modules/anamnese/anamnese.routes').then(m => m.default) },
      { path: 'sessoes', loadChildren: () => import('./modules/sessoes/sessoes.routes').then(m => m.default) },
      { path: 'laudos', loadChildren: () => import('./modules/laudos/laudos.routes').then(m => m.default) },
      { path: 'encaminhamentos', loadChildren: () => import('./modules/encaminhamentos/encaminhamentos.routes').then(m => m.default) },
      { path: 'comunicacao', loadChildren: () => import('./modules/comunicacao/comunicacao.routes').then(m => m.default) },
      { path: 'financeiro', loadChildren: () => import('./modules/financeiro/financeiro.routes').then(m => m.default) },
      { path: 'configuracoes', loadChildren: () => import('./modules/configuracoes/configuracoes.routes').then(m => m.default) },
    ]
  }
];
