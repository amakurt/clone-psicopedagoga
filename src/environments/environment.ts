const isBrowser = typeof window !== 'undefined';
const isDevPort = isBrowser && window.location.port === '4200';

export const environment = {
  production: false,
  apiUrl: isDevPort ? `http://${window.location.hostname}:3000/api` : '/api'
};

