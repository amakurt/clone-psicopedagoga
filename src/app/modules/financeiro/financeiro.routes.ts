import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/financeiro-list.component').then(m => m.FinanceiroListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/financeiro-form.component').then(m => m.FinanceiroFormComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/financeiro-form.component').then(m => m.FinanceiroFormComponent) },
] as Routes;
