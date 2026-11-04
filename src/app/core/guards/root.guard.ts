import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guarda da Rota Raiz ('')
 * 
 * Regras de Redirecionamento Inteligente para Aplicativo Mobile / PWA / Web Clip:
 * 1. PWA Standalone (adicionado à Tela de Início no iPhone/Android):
 *    - Se autenticado -> /app/dashboard
 *    - Se não autenticado -> /login
 * 2. Subdomínio da Aplicação (ex: app.edupsychpro.tech ou sistema.*):
 *    - Se autenticado -> /app/dashboard
 *    - Se não autenticado -> /login
 * 3. Domínio Principal de Marketing (edupsychpro.tech):
 *    - Se autenticado -> /app/dashboard
 *    - Se visitante anônimo -> exibe a Landing Page institucional normalmente.
 */
export const rootGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isBrowser = typeof window !== 'undefined';
  if (!isBrowser) return true;

  // 1. Detecta se está em modo PWA Standalone (Tela de Início iOS Safari / Android)
  const isIosStandalone = Boolean((window.navigator as any)?.standalone);
  const isDisplayStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  const isPwa = isIosStandalone || isDisplayStandalone;

  // 2. Detecta se está no subdomínio da aplicação (app.edupsychpro.tech)
  const host = window.location.hostname.toLowerCase();
  const isAppDomain = host.startsWith('app.') || host.startsWith('sistema.');

  // Se for aplicativo instalado na Tela de Início ou subdomínio do App:
  if (isPwa || isAppDomain) {
    if (auth.token) {
      if (auth.user()?.role === 'SUPERADMIN') {
        router.navigate(['/master']);
      } else {
        router.navigate(['/app/dashboard']);
      }
    } else {
      router.navigate(['/login']);
    }
    return false; // Interrompe o carregamento da Landing Page
  }

  // 3. Se for no site principal mas o usuário já estiver logado (e não for preview explícito):
  const searchParams = new URLSearchParams(window.location.search);
  if (auth.token && !searchParams.has('preview')) {
    if (auth.user()?.role === 'SUPERADMIN') {
      router.navigate(['/master']);
    } else {
      router.navigate(['/app/dashboard']);
    }
    return false;
  }

  // Visitante comum no site institucional: exibe a Landing Page
  return true;
};
