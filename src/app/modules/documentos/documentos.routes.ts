import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/documentos-list.component').then(m => m.DocumentosListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/documento-form.component').then(m => m.DocumentoFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/documento-detail.component').then(m => m.DocumentoDetailComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/documento-form.component').then(m => m.DocumentoFormComponent) },
] as Routes;
