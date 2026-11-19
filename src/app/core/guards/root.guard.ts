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

  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash || '';

  // 1. Se tiver parâmetro de preview ou âncora de planos/landing, sempre exibe a Landing Page
  if (
    searchParams.has('preview') ||
    searchParams.has('landing') ||
    searchParams.has('planos') ||
    hash.includes('planos') ||
    hash.includes('sobre') ||
    hash.includes('recursos')
  ) {
    return true;
  }

  // 2. Detecta se está no subdomínio da aplicação (app.edupsychpro.tech ou sistema.*)
  const host = window.location.hostname.toLowerCase();
  const isAppDomain = host.startsWith('app.') || host.startsWith('sistema.');

  // Se estiver explicitamente no subdomínio do App (app.edupsychpro.tech):
  if (isAppDomain) {
    if (auth.token) {
      if (auth.user()?.role === 'SUPERADMIN') {
        router.navigate(['/master']);
      } else {
        router.navigate(['/app/dashboard']);
      }
    } else {
      router.navigate(['/login']);
    }
    return false;
  }

  // 3. Se for no site principal mas o usuário já estiver logado (e não for preview explícito):
  if (auth.token) {
    if (auth.user()?.role === 'SUPERADMIN') {
      router.navigate(['/master']);
    } else {
      router.navigate(['/app/dashboard']);
    }
    return false;
  }

  // 4. Visitante no site institucional (edupsychpro.tech / localhost): exibe a Landing Page de Vendas
  return true;
};

