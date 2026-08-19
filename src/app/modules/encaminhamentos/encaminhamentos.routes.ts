import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/encaminhamentos-list.component').then(m => m.EncaminhamentosListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/encaminhamento-form.component').then(m => m.EncaminhamentoFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/encaminhamento-detail.component').then(m => m.EncaminhamentoDetailComponent) },
] as Routes;