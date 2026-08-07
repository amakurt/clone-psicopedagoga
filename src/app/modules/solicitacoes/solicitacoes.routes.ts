import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/solicitacoes-list.component').then(m => m.SolicitacoesListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/solicitacao-form.component').then(m => m.SolicitacaoFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/solicitacao-detail.component').then(m => m.SolicitacaoDetailComponent) },
] as Routes;
