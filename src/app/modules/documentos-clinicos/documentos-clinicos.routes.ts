import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/documentos-clinicos-list.component').then(m => m.DocumentosClinicosListComponent) },
  { path: 'diario', loadComponent: () => import('./pages/diario-sessao.component').then(m => m.DiarioSessaoComponent) },
  { path: 'frequencia', loadComponent: () => import('./pages/frequencia-form.component').then(m => m.FrequenciaFormComponent) },
  { path: 'plano', loadComponent: () => import('./pages/plano-intervencao-doc.component').then(m => m.PlanoIntervencaoDocComponent) },
] as Routes;
