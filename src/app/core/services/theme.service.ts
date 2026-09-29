import { Injectable, signal, effect } from '@angular/core';
import { applyAccentColor } from '../utils/theme';

export type AppTheme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  private readonly ACCENT_KEY = 'accentColor';

  theme = signal<AppTheme>('light');
  isDarkMode = signal<boolean>(false);
  accentColor = signal<string>('#007F80');

  private mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // 1. Carregar tema salvo
    const savedTheme = (localStorage.getItem(this.THEME_KEY) as AppTheme) || 'light';
    this.theme.set(savedTheme);

    // 2. Carregar cor de destaque salva
    const savedAccent = localStorage.getItem(this.ACCENT_KEY) || '#007F80';
    this.accentColor.set(savedAccent);
    applyAccentColor(savedAccent);

    // 3. Aplicar tema inicial
    this.updateThemeState(savedTheme);

    // 4. Listener para mudanças no sistema operacional
    if (this.mediaQuery) {
      this.mediaQuery.addEventListener('change', (e) => {
        if (this.theme() === 'system') {
          this.applyToDOM(e.matches);
        }
      });
    }
  }

  setTheme(theme: AppTheme) {
    this.theme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.updateThemeState(theme);
  }

  toggleDarkMode() {
    const nextTheme: AppTheme = this.isDarkMode() ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setAccentColor(color: string) {
    this.accentColor.set(color);
    localStorage.setItem(this.ACCENT_KEY, color);
    applyAccentColor(color);
  }

  private updateThemeState(theme: AppTheme) {
    let isDark = false;
    if (theme === 'dark') {
      isDark = true;
    } else if (theme === 'system') {
      isDark = this.mediaQuery ? this.mediaQuery.matches : false;
    } else {
      isDark = false;
    }

    this.applyToDOM(isDark);
  }

  private applyToDOM(isDark: boolean) {
    this.isDarkMode.set(isDark);
    const html = document.documentElement;

    if (isDark) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
    }
  }
}
