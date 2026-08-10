import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { scoped } from './lib/tenant';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('123456', 10);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'clinica-principal' },
    update: {},
    create: { name: 'Clínica Principal', slug: 'clinica-principal' },
  });
  const db = scoped(prisma, tenant.id);

  // Usuários
  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@edupsych.com' },
    update: { password: hash },
    create: {
      name: 'Dra. Sarah Miller',
      email: 'sarah@edupsych.com',
      password: hash,
      role: 'GESTOR',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { password: hash },
    create: {
      name: 'Admin Teste',
      email: 'admin@test.com',
      password: hash,
      role: 'GESTOR',
    },
  });

  // Profissionais adicionais
  const profAna = await prisma.user.upsert({
    where: { email: 'ana@edupsych.com' },
    update: {},
    create: {
      name: 'Ana Carolina Silva',
      email: 'ana@edupsych.com',
      password: hash,
      role: 'PROFISSIONAL',
      phone: '(11) 98765-1111',
    },
  });

  const profCarlos = await prisma.user.upsert({
    where: { email: 'carlos@edupsych.com' },
    update: {},
    create: {
      name: 'Carlos Eduardo Santos',
      email: 'carlos@edupsych.com',
      password: hash,
      role: 'PROFISSIONAL',
      phone: '(11) 98765-2222',
    },
  });

  const profMaria = await prisma.user.upsert({
    where: { email: 'maria@edupsych.com' },
    update: {},
    create: {
      name: 'Maria José Ferreira',
      email: 'maria@edupsych.com',
      password: hash,
      role: 'PROFISSIONAL',
      phone: '(11) 98765-3333',
    },
  });

  // 5 Responsáveis (nomes únicos)
  const resp1 = await db.responsible.create({
    data: {
      name: 'Renata Carvalho Lima',
      relationship: 'Mãe',
      cpf: '123.456.789-01',
      phones: '(11) 97654-1001',
      email: 'renata.lima@email.com',
      cep: '01310-100',
      street: 'Av. Paulista',
      neighborhood: 'Bela Vista',
      number: '1000',
      complement: 'Apto 101',
    },
  });

  const resp2 = await db.responsible.create({
    data: {
      name: 'Marcos Ribeiro Costa',
      relationship: 'Pai',
      cpf: '234.567.890-12',
      phones: '(11) 96543-2002',
      email: 'marcos.costa@email.com',
      cep: '04547-000',
      street: 'Rua Funchal',
      neighborhood: 'Vila Olímpia',
      number: '250',
      complement: 'Sala 302',
    },
  });

  const resp3 = await db.responsible.create({
    data: {
      name: 'Patricia Mendes Rocha',
      relationship: 'Mãe',
      cpf: '345.678.901-23',
      phones: '(11) 95432-3003',
      email: 'patricia.rocha@email.com',
      cep: '05711-000',
      street: 'Rua Vitória',
      neighborhood: 'Jardim Paulista',
      number: '180',
      complement: 'Casa',
    },
  });

  const resp4 = await db.responsible.create({
    data: {
      name: 'Fernando Gomes Barros',
      relationship: 'Pai',
      cpf: '456.789.012-34',
      phones: '(11) 94321-4004',
      email: 'fernando.barros@email.com',
      cep: '06600-000',
      street: 'Rua XV de Novembro',
      neighborhood: 'Centro',
      number: '500',
      complement: 'Conjunto 12',
    },
  });

  const resp5 = await db.responsible.create({
    data: {
      name: 'Adriana Nunes Pinto',
      relationship: 'Mãe',
      cpf: '567.890.123-45',
      phones: '(11) 93210-5005',
      email: 'adriana.pinto@email.com',
      cep: '08010-000',
      street: 'Rua Barão de Itapetininga',
      neighborhood: 'República',
      number: '350',
      complement: 'Apto 42',
    },
  });

  // 5 Pacientes (nomes únicos)
  const paciente1 = await db.paciente.create({
    data: {
      name: 'Gabriel Carvalho Lima',
      cpf: '111.222.333-11',
      birthDate: '2015-06-20',
      age: '11 anos',
      grade: '5º ano Fundamental',
      phone: '(11) 97654-1001',
      status: 'ATIVO',
      responsibleId: resp1.id,
      cep: '01310-100',
      street: 'Av. Paulista',
      neighborhood: 'Bela Vista',
      number: '1000',
      complement: 'Apto 101',
    },
  });

  const paciente2 = await db.paciente.create({
    data: {
      name: 'Helena Ribeiro Costa',
      cpf: '222.333.444-22',
      birthDate: '2019-02-14',
      age: '7 anos',
      grade: '2º ano Fundamental',
      phone: '(11) 96543-2002',
      status: 'ATIVO',
      responsibleId: resp2.id,
      cep: '04547-000',
      street: 'Rua Funchal',
      neighborhood: 'Vila Olímpia',
      number: '250',
      complement: 'Sala 302',
    },
  });

  const paciente3 = await db.paciente.create({
    data: {
      name: 'Theo Mendes Rocha',
      cpf: '333.444.555-33',
      birthDate: '2016-09-05',
      age: '9 anos',
      grade: '4º ano Fundamental',
      phone: '(11) 95432-3003',
      status: 'ATIVO',
      responsibleId: resp3.id,
      cep: '05711-000',
      street: 'Rua Vitória',
      neighborhood: 'Jardim Paulista',
      number: '180',
    },
  });

  const paciente4 = await db.paciente.create({
    data: {
      name: 'Manuela Gomes Barros',
      cpf: '444.555.666-44',
      birthDate: '2018-04-12',
      age: '8 anos',
      grade: '3º ano Fundamental',
      phone: '(11) 94321-4004',
      status: 'ATIVO',
      responsibleId: resp4.id,
      cep: '06600-000',
      street: 'Rua XV de Novembro',
      neighborhood: 'Centro',
      number: '500',
      complement: 'Conjunto 12',
    },
  });

  const paciente5 = await db.paciente.create({
    data: {
      name: 'Davi Nunes Pinto',
      cpf: '555.666.777-55',
      birthDate: '2014-08-28',
      age: '12 anos',
      grade: '6º ano Fundamental',
      phone: '(11) 93210-5005',
      status: 'ATIVO',
      responsibleId: resp5.id,
      cep: '08010-000',
      street: 'Rua Barão de Itapetininga',
      neighborhood: 'República',
      number: '350',
      complement: 'Apto 42',
    },
  });

  // Escolas
  const escola1 = await db.school.create({
    data: {
      name: 'Escola Municipal Monteiro Lobato',
      levels: 'Anos Iniciais',
      cep: '01310-100',
      street: 'Rua Augusta',
      neighborhood: 'Consolação',
      number: '1500',
      city: 'São Paulo',
      state: 'SP',
      phone: '(11) 3256-7890',
      contactName: 'Coord. Helena Souza',
      contactEmail: 'helena.souza@escola.sp.gov.br',
    },
  });

  const escola2 = await db.school.create({
    data: {
      name: 'Colégio Estadual Machado de Assis',
      levels: 'Anos Finais',
      cep: '04547-000',
      street: 'Av. Brigadeiro Faria Lima',
      neighborhood: 'Itaim Bibi',
      number: '800',
      city: 'São Paulo',
      state: 'SP',
      phone: '(11) 3030-1234',
      contactName: 'Diretor Roberto Alves',
      contactEmail: 'r.alves@colégio.sp.gov.br',
    },
  });

  // Vincular escolas
  await db.paciente.update({ where: { id: paciente1.id }, data: { schoolId: escola1.id } });
  await db.paciente.update({ where: { id: paciente2.id }, data: { schoolId: escola1.id } });
  await db.paciente.update({ where: { id: paciente3.id }, data: { schoolId: escola2.id } });
  await db.paciente.update({ where: { id: paciente4.id }, data: { schoolId: escola1.id } });
  await db.paciente.update({ where: { id: paciente5.id }, data: { schoolId: escola2.id } });

  // Protocolos TEA (avaliações)
  const evaluations = {
    'COMUNICACAO_verbal': 3,
    'COMUNICACAO_nao_verbal': 2,
    'COMUNICACAO_alternativa': 4,
    'INTERACAO_social': 2,
    'INTERACAO_emocional': 3,
    'INTERACAO_pares': 1,
    'COMPORTAMENTO_autorregulacao': 3,
    'COMPORTAMENTO_sensivel': 2,
    'COMPORTAMENTO_repetitivo': 4,
    'APRENDIZAGZO_academico': 3,
    'APRENDIZAGZO_funcional': 2,
    'APRENDIZAGZO_adaptativo': 3,
    'MOTOR_grosso': 4,
    'MOTOR_fino': 3,
    'AUTONOMIA_cuidados': 2,
    'AUTONOMIA_alimentacao': 3,
    'AUTONOMIA_higiene': 4,
    'COGNICAO_atencao': 3,
    'COGNICAO_memoria': 2,
    'COGNICAO_resolucao': 3,
  };

  await db.protocolEvaluation.create({
    data: {
      pacienteId: paciente1.id,
      professionalId: sarah.id,
      date: '2026-07-15',
      evaluations: JSON.stringify(evaluations),
      totalEvaluations: 20,
      averageScore: 2.8,
      maxScore: 4,
      minScore: 1,
    },
  });

  await db.protocolEvaluation.create({
    data: {
      pacienteId: paciente2.id,
      professionalId: sarah.id,
      date: '2026-07-20',
      evaluations: JSON.stringify({
        ...evaluations,
        COMUNICACAO_verbal: 4,
        INTERACAO_social: 3,
        APRENDIZAGZO_academico: 4,
      }),
      totalEvaluations: 20,
      averageScore: 3.1,
      maxScore: 4,
      minScore: 1,
    },
  });

  // Planos de Intervenção
  await db.interventionPlan.create({
    data: {
      pacienteId: paciente1.id,
      professionalId: sarah.id,
      date: '2026-07-25',
      step1: JSON.stringify({
        diagnostic: 'TEA nível 1 de suporte',
        difficulties: 'Comunicação social, interação com pares',
        strengths: 'Memória de longo prazo, interesse por música',
      }),
      step2: JSON.stringify({
        skills: ['Comunicação verbal funcional', 'Interação social em grupo', 'Autorregulação emocional'],
        priorities: ['Alta', 'Média', 'Alta'],
      }),
      step3: JSON.stringify({
        activities: ['Sessões de fala 2x/semana', 'Grupo social 1x/semana', 'Treino de habilidades sociais'],
        schedule: 'Segunda, Quarta e Sexta',
      }),
      sessionCount: 24,
      sessionValue: 'R$ 180,00',
      totalValue: 'R$ 4.320,00',
      frequency: '3x por semana',
      duration: '50 minutos',
      status: 'APROVADO',
    },
  });

  await db.interventionPlan.create({
    data: {
      pacienteId: paciente3.id,
      professionalId: profAna.id,
      date: '2026-08-01',
      step1: JSON.stringify({
        diagnostic: 'TEA nível 2 de suporte',
        difficulties: 'Linguagem expressiva, flexibilidade cognitiva',
        strengths: 'Habilidades visuais, interesse por números',
      }),
      step2: JSON.stringify({
        skills: ['Expansão de vocabulário', 'Sequenciamento de atividades', 'Controle de comportamento'],
        priorities: ['Alta', 'Alta', 'Média'],
      }),
      step3: JSON.stringify({
        activities: ['Terapia ABA 4x/semana', 'Fonoaudiologia 2x/semana', 'Psicopedagogia 1x/semana'],
        schedule: 'Segunda a Sexta',
      }),
      sessionCount: 32,
      sessionValue: 'R$ 150,00',
      totalValue: 'R$ 4.800,00',
      frequency: '4x por semana',
      duration: '45 minutos',
      status: 'EM_ANDAMENTO',
    },
  });

  // Sessões
  const sessao1 = await db.sessao.create({
    data: {
      pacienteId: paciente1.id,
      psicopedagogoId: sarah.id,
      date: new Date('2026-08-01T10:00:00'),
      duration: 50,
      tipo: 'TERAPEUTICA',
      status: 'CONCLUIDA',
      valor: 180,
      objective: 'Trabalhar comunicação verbal funcional',
      summary: 'Sessão produtiva. Gabriel apresentou melhora na formulação de frases simples.',
      activities: 'Atividades de role-play com situações do dia a dia',
      instruments: 'Cartões de comunicação, jogos de interação',
    },
  });

  await db.sessao.create({
    data: {
      pacienteId: paciente1.id,
      psicopedagogoId: sarah.id,
      date: new Date('2026-08-04T10:00:00'),
      duration: 50,
      tipo: 'TERAPEUTICA',
      status: 'AGENDADA',
      valor: 180,
      objective: 'Continuar trabalho de interação social',
    },
  });

  await db.sessao.create({
    data: {
      pacienteId: paciente2.id,
      psicopedagogoId: sarah.id,
      date: new Date('2026-08-02T14:00:00'),
      duration: 45,
      tipo: 'AVALIACAO',
      status: 'CONCLUIDA',
      valor: 200,
      objective: 'Avaliação de linguagem e comunicação',
      summary: 'Helena demonstrou vocabulário adequado para idade.',
    },
  });

  await db.sessao.create({
    data: {
      pacienteId: paciente3.id,
      psicopedagogoId: profAna.id,
      date: new Date('2026-08-03T09:00:00'),
      duration: 45,
      tipo: 'TERAPEUTICA',
      status: 'CONCLUIDA',
      valor: 150,
      objective: 'Sessão ABA - trabalho de sequenciamento',
      summary: 'Theo completou 8 de 10 tarefas com sucesso.',
    },
  });

  // Financeiro
  await db.financeiroSessao.create({
    data: {
      pacienteId: paciente1.id,
      sessaoId: sessao1.id,
      valor: 180,
      status: 'PAGO',
      tipo: 'SESSAO',
      description: 'Sessão terapêutica - 01/08/2026',
      category: 'Terapia',
      dataPagamento: new Date('2026-08-01'),
    },
  });

  await db.financeiroSessao.create({
    data: {
      pacienteId: paciente2.id,
      valor: 200,
      status: 'PENDENTE',
      tipo: 'SESSAO',
      description: 'Avaliação - 02/08/2026',
      category: 'Avaliação',
    },
  });

  // Documentos Clínicos - Diário de Sessões
  await db.sessionDiary.create({
    data: {
      pacienteId: paciente1.id,
      sessionNumber: 15,
      date: '2026-08-01',
      professionalName: 'Dra. Sarah Miller',
      objective: 'Comunicação verbal funcional',
      instruments: 'Cartões PECS, jogos de mesa',
      studentBehavior: 'Colaborativo, atento às instruções',
      activities: 'Produção de frases simples com apoio visual',
      observations: 'Melhora significativa na articulação',
    },
  });

  await db.sessionDiary.create({
    data: {
      pacienteId: paciente3.id,
      sessionNumber: 22,
      date: '2026-08-03',
      professionalName: 'Ana Carolina Silva',
      objective: 'Sequenciamento de atividades',
      instruments: 'Tutoriais visuais, cronômetro',
      studentBehavior: 'Hiperfoco em atividades preferidas',
      activities: 'Sequências de 4 etapas com apoio',
      observations: 'Necessita reforço positivo frequente',
    },
  });

  // Fichas de Frequência
  await db.frequencySheet.create({
    data: {
      pacienteId: paciente1.id,
      date: '2026-08-01',
      entryTime: '10:00',
      exitTime: '10:50',
      activities: 'Comunicação verbal, interação social',
      instruments: 'Cartões, jogos',
      observations: 'Participação ativa',
      guardianSignature: 'Renata Carvalho Lima',
    },
  });

  // Protocolos ABA
  await db.aBAAssessment.create({
    data: {
      patientId: paciente1.id,
      professionalId: sarah.id,
      protocolType: 'ABLLS-R',
      evaluations: JSON.stringify({
        'A_Imitacao': 4,
        'B_Receptivo': 3,
        'B_expressivo': 4,
        'C_tocar_objetos': 5,
        'D_verbos': 3,
        'E_adjetivos': 4,
        'F_pronomes': 2,
        'G_frases': 3,
        'H_estruturas': 4,
        'I_funcional': 5,
      }),
      totalScore: 35,
      domainScores: JSON.stringify({
        linguagem: 35,
        social: 28,
        cognitivo: 40,
      }),
      notes: 'Avanço significativo em imitação e estruturas',
    },
  });

  await db.aBAAssessment.create({
    data: {
      patientId: paciente3.id,
      professionalId: profAna.id,
      protocolType: 'VB-MAPP',
      evaluations: JSON.stringify({
        'mand_5_7': 8,
        'tact_5_7': 6,
        'intraverbal_5_7': 4,
        'listener_5_7': 7,
        'LP_5_7': 5,
        'social_5_7': 3,
      }),
      totalScore: 33,
      domainScores: JSON.stringify({
        comunicacao: 30,
        social: 22,
        funcionamento: 35,
      }),
      notes: 'Foco em habilidades intraverbais',
    },
  });

  // Programas ABA
  const programa1 = await db.aBAProgram.create({
    data: {
      patientId: paciente1.id,
      professionalId: sarah.id,
      targetBehavior: 'Aumentar vocabulário expressivo',
      interventionStrategy: 'Discrição de estímulo com reforço positivo',
      dataCollectionMethod: 'ABC Data',
      status: 'ATIVO',
      startDate: new Date('2026-07-01'),
      notes: 'Foco em substantivos e verbos comuns',
    },
  });

  await db.aBAProgram.create({
    data: {
      patientId: paciente3.id,
      professionalId: profAna.id,
      targetBehavior: 'Melhorar interação social com pares',
      interventionStrategy: 'Treino de habilidades sociais em grupo',
      dataCollectionMethod: 'Frequency Count',
      status: 'ATIVO',
      startDate: new Date('2026-07-15'),
      notes: 'Trabalhar esperar vez e compartilhar materiais',
    },
  });

  // Pontos de dados ABA
  await db.aBADataPoint.create({
    data: {
      programId: programa1.id,
      date: new Date('2026-08-01'),
      value: 8,
      note: '8 de 10 tentativas corretas',
    },
  });

  await db.aBADataPoint.create({
    data: {
      programId: programa1.id,
      date: new Date('2026-08-03'),
      value: 9,
      note: '9 de 10 tentativas corretas',
    },
  });

  // Convênios/Consentimentos (LGPD)
  await db.consentLog.create({
    data: {
      patientId: paciente1.id,
      responsibleId: resp1.id,
      consentType: 'TRATAMENTO_DADOS',
      status: 'APROVADO',
      details: 'Consentimento para tratamento de dados pessoais e de saúde',
      ipAddress: '192.168.1.100',
    },
  });

  await db.consentLog.create({
    data: {
      patientId: paciente2.id,
      responsibleId: resp2.id,
      consentType: 'COMPARTILHAMENTO_PROFISSIONAIS',
      status: 'APROVADO',
      details: 'Consentimento para compartilhamento entre profissionais da equipe',
      ipAddress: '192.168.1.101',
    },
  });

  // NFS-e
  await db.nfse.create({
    data: {
      number: 1001,
      patientId: paciente1.id,
      professionalId: sarah.id,
      description: 'Sessões de terapia - Julho/2026',
      value: 720,
      taxRate: 5,
      taxValue: 36,
      totalValue: 684,
      status: 'EMITIDA',
      issuedAt: new Date('2026-08-01'),
      notes: '12 sessões a R$ 60,00 cada',
    },
  });

  await db.nfse.create({
    data: {
      number: 1002,
      patientId: paciente3.id,
      professionalId: profAna.id,
      description: 'Sessões ABA - Julho/2026',
      value: 2400,
      taxRate: 5,
      taxValue: 120,
      totalValue: 2280,
      status: 'PENDENTE',
      notes: '16 sessões a R$ 150,00 cada',
    },
  });

  // Documentos
  await db.document.create({
    data: {
      name: 'Laudo Gabriel Lima - Julho 2026',
      pacienteId: paciente1.id,
      size: '1.2 MB',
      status: 'ASSINADO',
      category: 'LAUDOS',
      uploadedBy: 'professional',
      autorId: sarah.id,
    },
  });

  await db.document.create({
    data: {
      name: 'Relatório ABA Theo - Agosto 2026',
      pacienteId: paciente3.id,
      size: '850 KB',
      status: 'RASCUNHO',
      category: 'RELATORIOS',
      uploadedBy: 'professional',
      autorId: profAna.id,
    },
  });

  console.log('✅ Seed concluído!');
  console.log('📋 Dados criados:');
  console.log('   - 5 usuários (2 gestores + 3 profissionais)');
  console.log('   - 5 responsáveis');
  console.log('   - 5 pacientes');
  console.log('   - 2 escolas');
  console.log('   - 2 protocolos TEA');
  console.log('   - 2 planos de intervenção');
  console.log('   - 4 sessões');
  console.log('   - 2 financeiros');
  console.log('   - 2 diários de sessão');
  console.log('   - 1 ficha de frequência');
  console.log('   - 2 protocolos ABA');
  console.log('   - 2 programas ABA');
  console.log('   - 2 pontos de dados ABA');
  console.log('   - 2 consentimentos LGPD');
  console.log('   - 2 NFS-e');
  console.log('   - 2 documentos');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
