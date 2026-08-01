import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  user = signal<any>(null);
  isLoggedIn = computed(() => !!this.token);

  constructor(private router: Router) {
    const savedUser = localStorage.getItem(this.userKey);
    if (savedUser) this.user.set(JSON.parse(savedUser));
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(token: string, user: any) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.user.set(user);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(...roles: string[]): boolean {
    const u = this.user();
    return u && roles.includes(u.role);
  }
}
