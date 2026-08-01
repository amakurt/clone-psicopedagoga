import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/configuracoes.component').then(m => m.ConfiguracoesComponent) },
] as Routes;
