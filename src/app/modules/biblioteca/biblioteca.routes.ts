import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/biblioteca-list.component').then(m => m.BibliotecaListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/recurso-form.component').then(m => m.RecursoFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/recurso-detail.component').then(m => m.RecursoDetailComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/recurso-form.component').then(m => m.RecursoFormComponent) },
] as Routes;
