import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/agenda-list.component').then(m => m.AgendaListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/agenda-form.component').then(m => m.AgendaFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/agenda-detail.component').then(m => m.AgendaDetailComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/agenda-form.component').then(m => m.AgendaFormComponent) },
] as Routes;
