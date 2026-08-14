import { environment } from '../../../environments/environment';

export function resolveFileUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${environment.apiUrl}${path.replace(/^\/api/, '')}`;
}
