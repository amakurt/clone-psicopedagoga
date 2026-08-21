import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/kit-docente.component').then(m => m.KitDocenteComponent) },
] as Routes;
