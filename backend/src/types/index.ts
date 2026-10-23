import { Request } from 'express';
import passport from 'passport';

export type Role = 'GESTOR' | 'PSICOPEDAGOGO' | 'SECRETARIA' | 'RESPONSAVEL';

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  logoUrl?: string | null;
  colors?: string | null;
  phone?: string | null;
  email?: string | null;
  cnpj?: string | null;
  address?: any;
}

declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      role: string;
      tenantId?: string;
      tenantRole?: string;
      tenant?: TenantInfo;
      avatarUrl?: string | null;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: Express.User;
}
