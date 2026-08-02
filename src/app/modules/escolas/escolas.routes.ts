import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/escolas-list.component').then(m => m.EscolasListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/escola-form.component').then(m => m.EscolaFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/escola-detail.component').then(m => m.EscolaDetailComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/escola-form.component').then(m => m.EscolaFormComponent) },
] as Routes;
