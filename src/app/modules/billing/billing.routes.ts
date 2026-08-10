import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/plano/plano.component').then(m => m.PlanoComponent) },
] as Routes;