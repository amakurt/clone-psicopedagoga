import { Routes } from '@angular/router';

export default [
  { path: '', redirectTo: 'assessment', pathMatch: 'full' },
  { path: 'assessment', loadComponent: () => import('./pages/aba-assessment.component').then(m => m.AbaAssessmentComponent) },
  { path: 'assessment/:id', loadComponent: () => import('./pages/aba-assessment.component').then(m => m.AbaAssessmentComponent) },
  { path: 'programs', loadComponent: () => import('./pages/aba-programs.component').then(m => m.AbaProgramsComponent) },
] as Routes;
