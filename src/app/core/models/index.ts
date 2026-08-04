export interface User {
  id: string;
  name: string;
  email: string;
  role: 'GESTOR' | 'PSICOPEDAGOGO' | 'SECRETARIA' | 'RESPONSAVEL';
  active: boolean;
  avatarUrl?: string;
  phone?: string;
  registration?: string;
  bio?: string;
  clinicName?: string;
  clinicAddress?: string;
  permissions?: Record<string, string[]>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Responsible {
  id: string;
  name: string;
  birthDate?: string;
  relationship: string;
  cpf?: string;
  rg?: string;
  phones?: string;
  email?: string;
  avatarUrl?: string;
  cep?: string;
  street?: string;
  neighborhood?: string;
  number?: string;
  complement?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface School {
  id: string;
  name: string;
  location?: string;
  level?: string;
  contactName?: string;
  contactEmail?: string;
  patientCount: number;
  status: 'Ativa' | 'Inativa' | 'Prospecto';
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Paciente {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  rg?: string;
  birthDate?: string;
  age?: string;
  initials?: string;
  color?: string;
  avatarUrl?: string;
  status: 'ATIVO' | 'INATIVO';
  grade?: string;
  notes?: string;
  active: boolean;
  accessCode?: string;
  cep?: string;
  street?: string;
  neighborhood?: string;
  number?: string;
  complement?: string;
  responsibleId?: string;
  schoolId?: string;
  responsible?: Responsible;
  school?: School;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Prontuario {
  id: string;
  titulo: string;
  conteudo: string;
  pacienteId: string;
  autorId: string;
  paciente?: Paciente;
  autor?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Anamnese {
  id: string;
  pacienteId: string;
  autorId: string;
  status: 'PENDENTE' | 'CONCLUIDO';
  turno?: string;
  telefoneEscola?: string;
  enderecoEscola?: string;
  indicacaoTratamento?: string;
  diagnostico?: string;
  profissaoPai?: string;
  idadePai?: string;
  escolaridadePai?: string;
  profissaoMae?: string;
  idadeMae?: string;
  escolaridadeMae?: string;
  queixaPrincipal?: string;
  historiaQueixa?: string;
  constelacaoFamiliar?: string;
  gestacao?: string;
  parto?: string;
  desenvolvimentoMotor?: string;
  desenvolvimentoLinguagem?: string;
  sono?: string;
  alimentacao?: string;
  medicacoes?: string;
  tratamentosAnteriores?: string;
  historicoEscolar?: string;
  dificuldadesAprendizado?: string;
  interacaoSocial?: string;
  historicoFamiliar?: string;
  observacoesComportamentais?: string;
  historico?: string;
  desenvolvimento?: string;
  comportamento?: string;
  escolaridade?: string;
  familial?: string;
  observacoes?: string;
  paciente?: Paciente;
  autor?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Sessao {
  id: string;
  pacienteId: string;
  psicopedagogoId: string;
  date: Date;
  duration?: number;
  tipo?: string;
  status: 'AGENDADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
  valor?: number;
  observacoes?: string;
  objective?: string;
  summary?: string;
  activities?: string;
  instruments?: string;
  sharedWithGuardian: boolean;
  startTime?: string;
  endTime?: string;
  paciente?: Paciente;
  psicopedagogo?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Laudo {
  id: string;
  titulo: string;
  type: 'LAUDO' | 'PARECER' | 'RELATORIO';
  content: string;
  status: 'RASCUNHO' | 'FINALIZADO' | 'ARQUIVADO';
  pacienteId: string;
  autorId: string;
  paciente?: Paciente;
  autor?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Encaminhamento {
  id: string;
  pacienteId: string;
  deUserId: string;
  paraUserId?: string;
  motivo: string;
  resposta?: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO';
  paciente?: Paciente;
  deUser?: User;
  paraUser?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Comunicacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'AVISO' | 'MENSAGEM' | 'ALERTA';
  autorId?: string;
  autor?: User;
  createdAt?: Date;
}

export interface FinanceiroSessao {
  id: string;
  pacienteId: string;
  sessaoId?: string;
  valor: number;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';
  tipo?: string;
  description?: string;
  category?: string;
  dataPagamento?: Date;
  paciente?: Paciente;
  sessao?: Sessao;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'document' | 'evolution' | 'payment' | 'appointment' | 'message';
  read: boolean;
  createdAt?: Date;
}

export interface Document {
  id: string;
  name: string;
  pacienteId?: string;
  size?: string;
  status: 'RASCUNHO' | 'ATIVO' | 'ARQUIVADO';
  category: 'GERAL' | 'RELATORIO' | 'ANAMNESE' | 'ESCOLA' | 'CONSENTIMENTO';
  uploadedBy: 'professional' | 'guardian';
  fileUrl?: string;
  isShared: boolean;
  signedAt?: string;
  guardianSignedAt?: string;
  autorId?: string;
  paciente?: Paciente;
  autor?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Appointment {
  id: string;
  pacienteId: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'AVALIACAO' | 'INTERVENCAO' | 'DEVOLUTIVA' | 'OUTRO';
  status: 'CONFIRMADO' | 'PENDENTE' | 'CANCELADO' | 'REALIZADO';
  notes?: string;
  color?: string;
  autorId?: string;
  paciente?: Paciente;
  autor?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LibraryResource {
  id: string;
  name: string;
  description: string;
  ageRange?: string;
  category: string;
  icon?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Transaction {
  id: string;
  patientName: string;
  patientId?: string;
  date: string;
  value: string;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';
  type: 'RECEITA' | 'DESPESA';
  description?: string;
  category?: string;
  avatarUrl?: string;
  paymentUrl?: string;
  paymentMethod?: 'pix' | 'card' | 'boleto' | 'dinheiro';
  professionalId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SessionRecord {
  id: string;
  pacienteId: string;
  professionalId?: string;
  professionalName?: string;
  sessionNumber?: number;
  date: string;
  objective?: string;
  summary: string;
  activities: string;
  instruments?: string;
  observations: string;
  sharedWithGuardian: boolean;
  startTime?: string;
  endTime?: string;
  focus?: number;
  engagement?: number;
  skillProgress?: number;
  behavior?: number;
  paciente?: Paciente;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProtocolEvaluation {
  id: string;
  pacienteId: string;
  professionalId: string;
  date: string;
  evaluations: string;
  totalEvaluations: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  paciente?: Paciente;
  profissional?: User;
  createdAt?: Date;
}

export interface InterventionPlan {
  id: string;
  pacienteId: string;
  professionalId: string;
  date: string;
  step1?: string;
  step2?: string;
  step3?: string;
  sessionCount: number;
  sessionValue?: string;
  totalValue?: string;
  frequency?: string;
  duration?: string;
  status: 'RASCUNHO' | 'FINALIZADO';
  paciente?: Paciente;
  profissional?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  pacienteId: string;
  paciente?: Paciente;
  createdAt?: Date;
}
