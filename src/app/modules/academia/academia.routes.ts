import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/academia.component').then(m => m.AcademiaComponent) },
] as Routes;
