import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/comunicacao.component').then(m => m.ComunicacaoComponent) },
] as Routes;
