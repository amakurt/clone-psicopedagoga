import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/jogos.component').then(m => m.JogosComponent) },
] as Routes;
