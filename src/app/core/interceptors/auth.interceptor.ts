import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  const tenantId = auth.tenantId;
  if (req.url.includes('/api/')) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (tenantId) headers['X-Tenant-Id'] = tenantId;
    if (headers['Authorization'] || headers['X-Tenant-Id']) {
      req = req.clone({ setHeaders: headers });
    }
  }
  return next(req);
};
