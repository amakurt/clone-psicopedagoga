import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/consent-log.component').then(m => m.ConsentLogComponent) },
  { path: 'novo', loadComponent: () => import('./pages/consent-form.component').then(m => m.ConsentFormComponent) },
] as Routes;
