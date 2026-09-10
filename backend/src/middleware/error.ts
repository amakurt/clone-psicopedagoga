import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[SERVER ERROR]', err);
  const status = typeof err.status === 'number' ? err.status : 500;
  
  if (status >= 500 && process.env.NODE_ENV === 'production') {
    return res.status(500).json({ error: 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.' });
  }

  const message = err.message || 'Erro interno do servidor';
  res.status(status).json({ error: message });
};