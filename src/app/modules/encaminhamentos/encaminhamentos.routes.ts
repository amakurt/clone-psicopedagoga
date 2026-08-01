import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/encaminhamentos-list.component').then(m => m.EncaminhamentosListComponent) },
  { path: ':id', loadComponent: () => import('./pages/encaminhamento-detail.component').then(m => m.EncaminhamentoDetailComponent) },
] as Routes;
