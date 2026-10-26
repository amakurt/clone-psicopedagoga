const isBrowser = typeof window !== 'undefined';
const isDevLocal = isBrowser && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.port === '4200' ||
  window.location.hostname.endsWith('.local')
);

export const environment = {
  production: false,
  apiUrl: isDevLocal ? `http://${window.location.hostname}:3000/api` : '/api'
};

