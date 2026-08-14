// Aplica a cor de destaque (accent) escolhida em "Configurações → Aparência".
// O tema consome as variáveis --primary/--primary-dark/--primary-light (e
// --primary-rgb para sombras rgba em styles.scss).
// --on-primary é a cor de texto legível sobre superfícies primárias (branco
// para accents escuros, escuro para accents claros) — garante contraste WCAG
// mesmo com accent claro (amber/emerald/pink).

function luminance(hex: string): number {
  const h = normalizeHex(hex);
  const n = parseInt(h, 16);
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLin((n >> 16) & 255) + 0.7152 * toLin((n >> 8) & 255) + 0.0722 * toLin(n & 255);
}

export function onPrimaryColor(hex: string): string {
  return luminance(hex) < 0.35 ? '#FFFFFF' : '#0F172A';
}

function normalizeHex(hex: string): string {
  const h = hex.trim().replace('#', '');
  if (h.length === 3) return h.split('').map(c => c + c).join('');
  return h.padEnd(6, '0').slice(0, 6);
}

export function hexToRgb(hex: string): string {
  const h = normalizeHex(hex);
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function shade(hex: string, factor: number): string {
  const h = normalizeHex(hex);
  const n = parseInt(h, 16);
  return rgbToHex(
    Math.round(((n >> 16) & 255) * factor),
    Math.round(((n >> 8) & 255) * factor),
    Math.round((n & 255) * factor)
  );
}

function mix(hex: string, other: string, ratio: number): string {
  const a = normalizeHex(hex);
  const b = normalizeHex(other);
  const n1 = parseInt(a, 16);
  const n2 = parseInt(b, 16);
  return rgbToHex(
    Math.round((((n1 >> 16) & 255) * (1 - ratio)) + (((n2 >> 16) & 255) * ratio)),
    Math.round((((n1 >> 8) & 255) * (1 - ratio)) + (((n2 >> 8) & 255) * ratio)),
    Math.round(((n1 & 255) * (1 - ratio)) + ((n2 & 255) * ratio))
  );
}

export function applyAccentColor(color: string) {
  const el = document.documentElement;
  el.style.setProperty('--primary', color);
  el.style.setProperty('--primary-rgb', hexToRgb(color));
  el.style.setProperty('--primary-dark', shade(color, 0.8));
  el.style.setProperty('--primary-dark-rgb', hexToRgb(shade(color, 0.8)));
  el.style.setProperty('--primary-light', mix(color, '#ffffff', 0.85));
  el.style.setProperty('--primary-light-rgb', hexToRgb(mix(color, '#ffffff', 0.85)));
  el.style.setProperty('--on-primary', onPrimaryColor(color));
  el.style.setProperty('--on-primary-rgb', hexToRgb(onPrimaryColor(color)));
}