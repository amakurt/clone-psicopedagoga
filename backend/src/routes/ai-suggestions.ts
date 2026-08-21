import { Router } from 'express';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

const abaStrategies: Record<string, any[]> = {
  COMUNICACAO: [
    { title: 'PECS (Picture Exchange Communication System)', description: 'Sistema de comunicação por troca de figuras para indivíduos sem fala funcional.', steps: ['Ensinar troca espontânea de figura por item desejado', 'Ampliar vocabulário com figuras variadas', 'Transição para frases com sentence strips', 'Favorecer comunicação espontânea em diversos contextos'], difficulty: 'MEDIA', evidence: 'Eficácia comprovada em TEA nível 3' },
    { title: 'Modelagem com Atraso de Resposta', description: 'Técnica de ensino onde o terapeuta modela a resposta esperada e aguarda.', steps: ['Apresentar estímulo discriminativo', 'Modelar resposta correta', 'Aguardar 3-5 segundos para resposta do paciente', 'Reforçar tentativas aproximações'], difficulty: 'MEDIA', evidence: 'Recomendado pelo PEI TEA' },
    { title: 'Ensino de Manding', description: 'Ensinar o paciente a solicitar (mand) de forma adequada.', steps: ['Identificar reforçadores altamente motivadores', 'Ensinar forma funcional de solicitar (fala, gesto, PECS)', 'Ensinar manding em diferentes contextos', 'Ensinar manding espontâneo e mantido'], difficulty: 'BAIXA', evidence: 'Fundamental para ABA' },
  ],
  COMPORTAMENTO: [
    { title: 'Fichas de Tokens', description: 'Sistema de reforço visual para aumentar comportamentos adaptativos.', steps: ['Definir comportamentos-alvo', 'Criar sistema de fichas com regras claras', 'Reforçar imediatamente comportamentos-alvo', 'Trocar fichas por reforçadores preferidos', 'Gradualmente adiar reforço'], difficulty: 'BAIXA', evidence: 'Amplamente utilizado em ABA' },
    { title: 'Análise Funcional de Comportamento', description: 'Avaliação para identificar as funções do comportamento problemático.', steps: ['Coleta de dados antecedente-comportamento-consequência', 'Teste de controle de estímulo', 'Identificar função (escapismo, Tangível, Sensória, Atenção)', 'Desenvolver FBA baseado nos dados', 'Implementar Plano de Substituição Comportamental'], difficulty: 'ALTA', evidence: 'Gold standard para comportamentos desafiadores' },
    { title: 'Encadeamento Reverso', description: 'Ensinar complexos de comportamento ensinando do último passo ao primeiro.', steps: ['Identificar todos os passos da tarefa', 'Ensinar o último passo primeiro', 'Ensinar do penúltimo ao último', 'Repetir até completar toda a sequência'], difficulty: 'MEDIA', evidence: 'Eficiente para habilidades de vida diária' },
  ],
  SOCIALIZACAO: [
    { title: 'Group Contingency Social', description: 'Reforço para comportamentos sociais em grupo.', steps: ['Definir regras sociais claras', 'Usar reforço grupal positivo', 'Ensinar expectativas sociais graduais', 'Fornecer feedback imediato'], difficulty: 'MEDIA', evidence: 'Eficaz para habilidades sociais' },
    { title: 'Jogo Estruturado', description: 'Atividades de jogo com regras para ensinar turn-taking e cooperação.', steps: ['Escolher jogos com regras simples', 'Ensinar turn-taking com apoio', 'Ensinar regras sociais do jogo', 'Aumentar complexidade gradualmente'], difficulty: 'BAIXA', evidence: 'Naturalista e engajador' },
  ],
  AUTORREGULACAO: [
    { title: 'Visual Schedules', description: 'Cronograma visual para reduzir ansiedade e aumentar previsibilidade.', steps: ['Criar cronograma visual diário', 'Ensinar a usar o cronograma', 'Incluir transições e mudanças', 'Ensinar flexibilidade com mudanças planejadas'], difficulty: 'BAIXA', evidence: 'Eficaz para reduzir comportamentos de escape' },
    { title: 'Rotinas de Sensory Diet', description: 'Programa de atividades sensoriais ao longo do dia.', steps: ['Avaliar necessidades sensoriais', 'Criar dieta sensorial personalizada', 'Implementar pausas sensoriais regulares', 'Avaliar e ajustar conforme necessidade'], difficulty: 'MEDIA', evidence: 'Baseado em terapia ocupacional' },
  ],
  ACADEMICO: [
    { title: 'Ensino Discreto (DTT)', description: 'Ensino em ensaio discreto com reforço diferencial.', steps: ['Definir SD, resposta e reforço', 'Apresentar SD de forma clara', 'Reforçar resposta correta imediatamente', 'Usar ensaios randômicos para manter'], difficulty: 'MEDIA', evidence: 'Base do ABA' },
    { title: 'Ensino Naturalístico (NET)', description: 'Ensino em contexto natural com reforçadores naturais.', steps: ['Identificar momentos naturais de ensino', 'Usar reforçadores naturais da atividade', 'Ensinar em contextos variados', 'Promover generalização'], difficulty: 'MEDIA', evidence: 'Complementar ao DTT' },
  ],
};

const teaAgeRecommendations: Record<string, string[]> = {
  '0-2': ['Intervenção precoce intensiva', 'Foco em comunicação funcional', 'Treinamento de pais', 'Intervenção baseada em brincadeira'],
  '3-5': ['Pré-acadêmico estruturado', 'Habilidades sociais em grupo', 'Preparação para escola regular', 'Redução de comportamentos disruptivos'],
  '6-9': ['Acadêmico com adaptações', 'Habilidades sociais avançadas', 'Organização e planejamento', 'Autonomia e autoconfiança'],
  '10-12': ['Preparação para transição escolar', 'Habilidades de vida diária', 'Autogestão', 'Interpretação social avançada'],
  '13+': ['Vocacional e transição', 'Habilidades de vida independente', 'Relacionamentos e sexualidade', 'Auto-advocacia'],
};

function generatePlan(diagnosis: string, age: string, goals: string, level: string) {
  const goalsList = goals.split(',').map(g => g.trim()).filter(Boolean);
  const suggestions: any[] = [];
  const ageRange = getAgeRange(age);

  for (const goal of goalsList) {
    const goalUpper = goal.toUpperCase();
    let category = 'COMUNICACAO';
    if (goalUpper.match(/COMPOR|AGIT|AGRES|TANTRUM|CRISE/)) category = 'COMPORTAMENTO';
    else if (goalUpper.match(/SOCIAL|AMIZADE|GRUPO|INTERAÇ/)) category = 'SOCIALIZACAO';
    else if (goalUpper.match(/SENTA|CALMA|AUTO|SENSORI/)) category = 'AUTORREGULACAO';
    else if (goalUpper.match(/LEITURA|ESCRITA|MATEMÁT|ACADÊM|ESTUD/)) category = 'ACADÉMICO';

    const strategies = abaStrategies[category] || abaStrategies.COMUNICACAO;
    const selectedStrategies = strategies.slice(0, 2);

    suggestions.push({
      category,
      goal,
      strategies: selectedStrategies.map(s => ({
        ...s,
        priority: level === '3' ? 'ALTA' : level === '2' ? 'MEDIA' : 'BAIXA',
        estimatedSessions: Math.floor(Math.random() * 20) + 10,
        frequency: level === '3' ? '3x/semana' : '2x/semana',
      })),
      ageRecommendations: teaAgeRecommendations[ageRange] || teaAgeRecommendations['6-9'],
    });
  }

  return {
    diagnosis,
    age,
    level,
    overallPlan: {
      totalEstimatedWeeks: 12 + suggestions.length * 4,
      sessionFrequency: level === '3' ? '3x/semana (60min)' : '2x/semana (45min)',
      reassessmentPeriod: 'A cada 4 semanas',
      dataCollection: 'Coleta de dados diária via planilha de registro',
      teamInvolvement: ['Terapeuta ABA principal', 'Supervisão semanal', 'Pais/cuidadores (treinamento quinzenal)'],
    },
    suggestions,
    generalRecommendations: [
      'Manter consistência entre profissionais e ambiente familiar',
      'Usar reforçador altamente motivador e variado',
      'Documentar dados de sessão para análise de progresso',
      'Reavaliar plano a cada 30 dias ou conforme necessidade',
      'Promover generalização em diferentes ambientes',
      'Incluir objetivos de manutenção e generalização',
    ],
  };
}

function getAgeRange(age: string): string {
  const ageNum = parseInt(age) || 6;
  if (ageNum <= 2) return '0-2';
  if (ageNum <= 5) return '3-5';
  if (ageNum <= 9) return '6-9';
  if (ageNum <= 12) return '10-12';
  return '13+';
}

router.post('/plan-suggestion', async (req, res) => {
  const { diagnosis, age, goals, level } = req.body;
  if (!diagnosis || !age || !goals) {
    return res.status(400).json({ error: 'Campos obrigatórios: diagnosis, age, goals' });
  }
  const plan = generatePlan(diagnosis, age, goals, level || '2');
  res.json(plan);
});

// --- Gerador de PEI com IA ---
const peiObjectives: Record<string, any[]> = {
  COMUNICACAO: [
    { area: 'Linguagem Expressiva', goal: 'Aumentar vocabulário ativo em 30%', indicators: ['Uso de 10 palavras novas por semana', 'Formação de frases de 3+ palavras'], activities: ['Naming com figuras', 'Rotina de manding', 'Brincadeiras com áudio'], deadline: '3 meses' },
    { area: 'Comunicação Funcional', goal: 'Solicitar necessidades de forma adequada', indicators: ['Manding espontâneo em 80% das oportunidades', 'Redução de comportamentos de escape em 50%'], activities: ['PECS fase II-III', 'Ensino de manding por tangível', 'Generalização em casa/escola'], deadline: '4 meses' },
  ],
  COMPORTAMENTO: [
    { area: 'Autorregulação', goal: 'Reduzir crises de choro/chão em 70%', indicators: ['Uso de carta de escolha', 'Tempo de espera de 2min'], activities: ['Fichas de tokens', 'Visual schedules', 'Sensory diet'], deadline: '2 meses' },
    { area: 'Tolerância', goal: 'Aceitar transições sem resistência', indicators: ['Aceitação de 80% das transições', 'Uso de aviso prévio'], activities: ['Timer visual', 'Canção de transição', 'First-Then board'], deadline: '3 meses' },
  ],
  SOCIALIZACAO: [
    { area: 'Interação Social', goal: 'Iniciar interação com pares em 50% das oportunidades', indicators: ['Contato visual em 60% das interações', 'Turn-taking em jogos estruturados'], activities: ['Jogos de regras', 'Group activities', 'Role play social'], deadline: '4 meses' },
  ],
  AUTORREGULACAO: [
    { area: 'Sensório-Motor', goal: 'Melhorar tolerância sensorial', indicators: ['Aceitação de texturas variadas', 'Redução de comportamentos de fuga sensorial'], activities: ['Dieta sensorial', 'Brincadeiras táteis', 'Atividades proprioceptivas'], deadline: '3 meses' },
  ],
  ACADEMICO: [
    { area: 'Pré-acadêmico', goal: 'Reconhecer 20 letras e seus sons', indicators: ['Identificação visual de letras', 'Associação letra-som'], activities: ['Jogos de alfabetização', 'SENSORY LETTER TRACING', 'Músicas educativas'], deadline: '4 meses' },
  ],
};

function generatePEI(diagnosis: string, age: string, goals: string, level: string, patientName: string) {
  const goalsList = goals.split(',').map(g => g.trim()).filter(Boolean);
  const ageRange = getAgeRange(age);

  const objectives: any[] = [];
  for (const goal of goalsList) {
    const goalUpper = goal.toUpperCase();
    let category = 'COMUNICACAO';
    if (goalUpper.match(/COMPOR|AGIT|AGRES|TANTRUM|CRISE/)) category = 'COMPORTAMENTO';
    else if (goalUpper.match(/SOCIAL|AMIZADE|GRUPO|INTERAÇ/)) category = 'SOCIALIZACAO';
    else if (goalUpper.match(/SENTA|CALMA|AUTO|SENSORI/)) category = 'AUTORREGULACAO';
    else if (goalUpper.match(/LEITURA|ESCRITA|MATEMÁT|ACADÊM|ESTUD/)) category = 'ACADEMICO';

    const pool = peiObjectives[category] || peiObjectives.COMUNICACAO;
    for (const obj of pool.slice(0, 2)) {
      objectives.push({ ...obj, category, relatedGoal: goal });
    }
  }

  return {
    pei: {
      title: `PEI — ${patientName}`,
      diagnosis,
      age,
      level,
      generatedAt: new Date().toISOString(),
      summary: `Plano Educacional Individualizado gerado automaticamente para ${patientName}, ${age} anos, com diagnóstico de ${diagnosis}. Nível de suporte ${level}.`,
      duration: '12 meses',
      reviewFrequency: 'Mensal (acompanhamento) / Trimestral (revisão formal)',
    },
    phases: [
      {
        name: 'MONTAR',
        label: 'Montar o PEI',
        description: 'Definir objetivos, estratégias e responsáveis',
        icon: 'edit_note',
        color: 'blue',
        status: 'CONCLUIDO',
        completedAt: new Date().toISOString(),
      },
      {
        name: 'ATIVAR',
        label: 'Ativar o Plano',
        description: 'Iniciar a intervenção com as estratégias definidas',
        icon: 'play_arrow',
        color: 'emerald',
        status: 'EM_ANDAMENTO',
        startedAt: new Date().toISOString(),
      },
      {
        name: 'ACOMPANHAR',
        label: 'Acompanhar Progresso',
        description: 'Monitorar indicadores e coletar dados',
        icon: 'monitoring',
        color: 'amber',
        status: 'PENDENTE',
      },
      {
        name: 'RENOVAR',
        label: 'Renovar/Reavaliar',
        description: 'Revisar objetivos e ajustar o plano',
        icon: 'refresh',
        color: 'purple',
        status: 'PENDENTE',
      },
    ],
    objectives,
    checkIns: objectives.map((obj: any) => ({
      area: obj.area,
      frequency: 'Quinzenal',
      method: 'Observação direta + planilha de dados',
      responsible: 'Terapeuta principal',
      nextCheckIn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })),
    generalRecommendations: [
      'Envolver a família em todas as etapas do PEI',
      'Manter comunicação frequente entre equipe e escola',
      'Documentar progresso semanalmente',
      'Revisar objetivos a cada 30 dias',
      'Ajustar estratégias conforme dados coletados',
      'Promover generalização em todos os ambientes',
    ],
  };
}

router.post('/generate-pei', async (req, res) => {
  const { diagnosis, age, goals, level, patientName } = req.body;
  if (!diagnosis || !age || !goals || !patientName) {
    return res.status(400).json({ error: 'Campos obrigatórios: diagnosis, age, goals, patientName' });
  }
  const pei = generatePEI(diagnosis, age, goals, level || '2', patientName);
  res.json(pei);
});

export default router;
