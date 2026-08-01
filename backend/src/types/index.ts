import { Request } from 'express';

export type Role = 'GESTOR' | 'PSICOPEDAGOGO' | 'SECRETARIA';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: Role;
    schoolId?: string;
  };
}