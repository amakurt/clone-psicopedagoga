import { Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/users-list.component').then(m => m.UsersListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/user-form.component').then(m => m.UserFormComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/user-form.component').then(m => m.UserFormComponent) }
];

export default routes;
