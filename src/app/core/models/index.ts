export interface User {
  id: string;
  name: string;
  email: string;
  role: 'GESTOR' | 'PSICOPEDAGOGO' | 'SECRETARIA';
  active: boolean;
  createdAt: Date;
}

export interface Paciente {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  guardianName?: string;
  guardianPhone?: string;
  school?: string;
  grade?: string;
  notes?: string;
  active: boolean;
}

export interface Sessao {
  id: string;
  pacienteId: string;
  psicopedagogoId: string;
  date: Date;
  duration?: number;
  tipo?: string;
  status: string;
  valor?: number;
  observacoes?: string;
}

export interface Laudo {
  id: string;
  titulo: string;
  type: string;
  content: string;
  status: string;
  pacienteId: string;
  autorId: string;
}
