import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/evolucoes-list.component').then(m => m.EvolucoesListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/evolucao-form.component').then(m => m.EvolucaoFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/evolucao-detail.component').then(m => m.EvolucaoDetailComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/evolucao-form.component').then(m => m.EvolucaoFormComponent) },
] as Routes;
