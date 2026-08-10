import { Router } from 'express';

// Express 4 não propaga rejeições de handlers async para o errorHandler.
// Este patch envolve cada handler para encaminhar rejeições via next(err),
// garantindo que erros (ex.: 404 de isolamento de tenant) gerem resposta HTTP.

function wrap(fn: any): any {
  return function (this: any, req: any, res: any, next: any) {
    try {
      return Promise.resolve(fn.call(this, req, res, next)).catch(next);
    } catch (err) {
      next(err);
    }
  };
}

if (!(Router as any).__asyncWrapped) {
  (Router as any).__asyncWrapped = true;

  const methods = ['get', 'post', 'put', 'delete', 'patch', 'all', 'use'] as const;
  for (const m of methods) {
    const orig = (Router as any)[m];
    (Router as any)[m] = function (this: any, path: any, ...handlers: any[]) {
      const wrapped = handlers.map((h: any) => (typeof h === 'function' ? wrap(h) : h));
      return orig.call(this, path, ...wrapped);
    };
  }
}