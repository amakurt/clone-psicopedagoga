import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/whatsapp-config.component').then(m => m.WhatsAppComponent) },
] as Routes;
