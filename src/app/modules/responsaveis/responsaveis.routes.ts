import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/responsaveis-list.component').then(m => m.ResponsaveisListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/responsavel-form.component').then(m => m.ResponsavelFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/responsavel-detail.component').then(m => m.ResponsavelDetailComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/responsavel-form.component').then(m => m.ResponsavelFormComponent) },
] as Routes;
