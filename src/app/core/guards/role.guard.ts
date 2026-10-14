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

  // SUPERADMIN possui acesso completo e irrestrito a todas as áreas administrativas e clínicas
  if (auth.user()?.role === 'SUPERADMIN') {
    return true;
  }

  // Redirect RESPONSAVEL to guardian portal
  if (auth.user()?.role === 'RESPONSAVEL' && !route.url.some(seg => seg.path === 'guardian')) {
    router.navigate(['/guardian']);
    return false;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = auth.hasRole(...requiredRoles);
    if (!hasRole) {
      const redirectPath = auth.user()?.role === 'RESPONSAVEL' ? '/guardian' : '/app/dashboard';
      router.navigate([redirectPath]);
      return false;
    }
  }

  return true;
};
