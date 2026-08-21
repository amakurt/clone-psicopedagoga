import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/comunidade.component').then(m => m.ComunidadeComponent) },
] as Routes;
