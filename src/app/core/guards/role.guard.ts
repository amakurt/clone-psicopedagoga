import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const requiredRoles = route.data['roles'] as string[];
  
  if (!auth.token) {
    router.navigate(['/login']);
    return false;
  }

  // Redirect RESPONSAVEL to guardian portal
  if (auth.hasRole('RESPONSAVEL') && !route.url.some(seg => seg.path === 'guardian')) {
    router.navigate(['/guardian']);
    return false;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = auth.hasRole(...requiredRoles);
    if (!hasRole) {
      const redirectPath = auth.hasRole('RESPONSAVEL') ? '/guardian' : '/app/dashboard';
      router.navigate([redirectPath]);
      return false;
    }
  }

  return true;
};
