import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/financeiro.component').then(m => m.FinanceiroComponent) },
] as Routes;
