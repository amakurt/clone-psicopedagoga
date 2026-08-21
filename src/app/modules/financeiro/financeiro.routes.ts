import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/financeiro-list.component').then(m => m.FinanceiroListComponent) },
  { path: 'nfse', loadComponent: () => import('./pages/nfse.component').then(m => m.NfseComponent) },
  { path: 'novo', loadComponent: () => import('./pages/financeiro-form.component').then(m => m.FinanceiroFormComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/financeiro-form.component').then(m => m.FinanceiroFormComponent) },
  { path: 'dre', loadChildren: () => import('./financeiro-dre.routes').then(m => m.default) },
] as Routes;
