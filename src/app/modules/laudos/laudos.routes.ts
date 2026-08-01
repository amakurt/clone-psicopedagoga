import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/laudos-list.component').then(m => m.LaudosListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/laudo-form.component').then(m => m.LaudoFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/laudo-detail.component').then(m => m.LaudoDetailComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/laudo-form.component').then(m => m.LaudoFormComponent) },
] as Routes;
