import { Routes } from '@angular/router';
export default [
  { path: '', loadComponent: () => import('./pages/pacientes-list.component').then(m => m.PacientesListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/paciente-form.component').then(m => m.PacienteFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/paciente-detail.component').then(m => m.PacienteDetailComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/paciente-form.component').then(m => m.PacienteFormComponent) },
  { path: ':id/prontuario', loadComponent: () => import('./pages/prontuario.component').then(m => m.ProntuarioComponent) },
] as Routes;
