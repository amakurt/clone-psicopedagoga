import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/anamnese-list.component').then(m => m.AnamneseListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/anamnese-form.component').then(m => m.AnamneseFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/anamnese-detail.component').then(m => m.AnamneseDetailComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/anamnese-form.component').then(m => m.AnamneseFormComponent) },
] as Routes;
