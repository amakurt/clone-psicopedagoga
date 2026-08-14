import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError(err => {
      if (err.status === 401 && !req.url.includes('/auth/')) {
        sessionStorage.clear();
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_tenants');
        localStorage.removeItem('auth_tenant');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
