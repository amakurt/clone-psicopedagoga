import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/sessoes-list.component').then(m => m.SessoesListComponent) },
  { path: 'nova', loadComponent: () => import('./pages/sessao-form.component').then(m => m.SessaoFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/sessao-detail.component').then(m => m.SessaoDetailComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/sessao-form.component').then(m => m.SessaoFormComponent) },
] as Routes;
