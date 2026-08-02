import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/planos-list.component').then(m => m.PlanosListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/plano-form.component').then(m => m.PlanoFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/plano-detail.component').then(m => m.PlanoDetailComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/plano-form.component').then(m => m.PlanoFormComponent) },
] as Routes;
