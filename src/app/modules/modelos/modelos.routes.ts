import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/modelos-documento.component').then(m => m.ModelosDocumentoComponent) },
] as Routes;
