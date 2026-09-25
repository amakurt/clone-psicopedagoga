import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const superAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.token) {
    router.navigate(['/login']);
    return false;
  }

  if (auth.user()?.role !== 'SUPERADMIN') {
    router.navigate(['/app/dashboard']);
    return false;
  }

  return true;
};
