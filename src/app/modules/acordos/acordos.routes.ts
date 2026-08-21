import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/acordos.component').then(m => m.AcordosComponent) },
] as Routes;
