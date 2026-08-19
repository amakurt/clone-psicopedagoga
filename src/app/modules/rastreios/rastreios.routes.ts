import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/rastreios-list.component').then(m => m.RastreiosListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/rastreio-form.component').then(m => m.RastreioFormComponent) },
] as Routes;