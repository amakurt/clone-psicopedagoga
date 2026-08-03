import { Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/guardian-dashboard.component').then(m => m.GuardianDashboardComponent) },
  { path: 'evolutions', loadComponent: () => import('./pages/guardian-evolutions.component').then(m => m.GuardianEvolutionsComponent) },
  { path: 'financial', loadComponent: () => import('./pages/guardian-financial.component').then(m => m.GuardianFinancialComponent) },
  { path: 'documents', loadComponent: () => import('./pages/guardian-documents.component').then(m => m.GuardianDocumentsComponent) },
  { path: 'chat', loadComponent: () => import('./pages/guardian-chat.component').then(m => m.GuardianChatComponent) },
  { path: 'settings', loadComponent: () => import('./pages/guardian-settings.component').then(m => m.GuardianSettingsComponent) },
];

export default routes;
