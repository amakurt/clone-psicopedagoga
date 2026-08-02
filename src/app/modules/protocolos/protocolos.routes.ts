import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/protocolos-list.component').then(m => m.ProtocolosListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/protocolo-form.component').then(m => m.ProtocoloFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/protocolo-detail.component').then(m => m.ProtocoloDetailComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/protocolo-form.component').then(m => m.ProtocoloFormComponent) },
] as Routes;
