const isBrowser = typeof window !== 'undefined';
const host = isBrowser ? window.location.hostname : 'localhost';

export const environment = {
  production: false,
  apiUrl: `http://${host}:3000/api`
};

