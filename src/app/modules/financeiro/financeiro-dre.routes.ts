import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/financeiro-dre.component').then(m => m.FinanceiroDreComponent) },
] as Routes;
