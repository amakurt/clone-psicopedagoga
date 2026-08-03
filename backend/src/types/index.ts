import { Request } from 'express';
import passport from 'passport';

export type Role = 'GESTOR' | 'PSICOPEDAGOGO' | 'SECRETARIA' | 'RESPONSAVEL';

declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      role: string;
      avatarUrl?: string | null;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: Express.User;
}
