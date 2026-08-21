import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/evidencias.component').then(m => m.EvidenciasComponent) },
] as Routes;
