import { Router } from 'express';
import { authenticate } from '../middleware';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';

const router = Router();
router.use(authenticate);

// --- Clinical Fallback Data (Evidence-Based ABA / TEA / Neuropsicopedagogia) ---
const abaStrategies: Record<string, any[]> = {
  COMUNICACAO: [
    { title: 'PECS (Picture Exchange Communication System)', description: 'Sistema de comunicação por troca de figuras para indivíduos sem fala funcional.', steps: ['Ensinar troca espontânea de figura por item desejado', 'Ampliar vocabulário com figuras variadas', 'Transição para frases com sentence strips', 'Favorecer comunicação espontânea em diversos contextos'], difficulty: 'MEDIA', evidence: 'Eficácia comprovada em TEA nível 3' },
    { title: 'Modelagem com Atraso de Resposta', description: 'Técnica de ensino onde o terapeuta modela a resposta esperada e aguarda.', steps: ['Apresentar estímulo discriminativo', 'Modelar resposta correta', 'Aguardar 3-5 segundos para resposta do paciente', 'Reforçar tentativas aproximações'], difficulty: 'MEDIA', evidence: 'Recomendado pelo PEI TEA' },
    { title: 'Ensino de Manding', description: 'Ensinar o paciente a solicitar (mand) de forma adequada.', steps: ['Identificar reforçadores altamente motivadores', 'Ensinar forma funcional de solicitar (fala, gesto, PECS)', 'Ensinar manding em diferentes contextos', 'Ensinar manding espontâneo e mantido'], difficulty: 'BAIXA', evidence: 'Fundamental para ABA' },
  ],
  COMPORTAMENTO: [
    { title: 'Fichas de Tokens', description: 'Sistema de reforço visual para aumentar comportamentos adaptativos.', steps: ['Definir comportamentos-alvo', 'Criar sistema de fichas com regras claras', 'Reforçar imediatamente comportamentos-alvo', 'Trocar fichas por reforçadores preferidos', 'Gradualmente adiar reforço'], difficulty: 'BAIXA', evidence: 'Amplamente utilizado em ABA' },
    { title: 'Análise Funcional de Comportamento (ABC)', description: 'Avaliação para identificar as funções do comportamento problemático.', steps: ['Coleta de dados antecedente-comportamento-consequência', 'Teste de controle de estímulo', 'Identificar função (escapismo, Tangível, Sensória, Atenção)', 'Desenvolver FBA baseado nos dados', 'Implementar Plano de Substituição Comportamental'], difficulty: 'ALTA', evidence: 'Gold standard para comportamentos desafiadores' },
    { title: 'Encadeamento Reverso', description: 'Ensinar complexos de comportamento ensinando do último passo ao primeiro.', steps: ['Identificar todos os passos da tarefa', 'Ensinar o último passo primeiro', 'Ensinar do penúltimo ao último', 'Repetir até completar toda a sequência'], difficulty: 'MEDIA', evidence: 'Eficiente para habilidades de vida diária' },
  ],
  SOCIALIZACAO: [
    { title: 'Group Contingency Social', description: 'Reforço para comportamentos sociais em grupo.', steps: ['Definir regras sociais claras', 'Usar reforço grupal positivo', 'Ensinar expectativas sociais graduais', 'Fornecer feedback imediato'], difficulty: 'MEDIA', evidence: 'Eficaz para habilidades sociais' },
    { title: 'Jogo Estruturado e Turn-Taking', description: 'Atividades de jogo com regras para ensinar turn-taking e cooperação.', steps: ['Escolher jogos com regras simples', 'Ensinar turn-taking com apoio', 'Ensinar regras sociais do jogo', 'Aumentar complexidade gradualmente'], difficulty: 'BAIXA', evidence: 'Naturalista e engajador' },
  ],
  AUTORREGULACAO: [
    { title: 'Cronograma Visual e Termômetro Emocional', description: 'Rotinas visuais para reduzir ansiedade e aumentar previsibilidade.', steps: ['Criar cronograma visual diário', 'Ensinar a usar o cronograma', 'Incluir transições e mudanças', 'Ensinar flexibilidade com mudanças planejadas'], difficulty: 'BAIXA', evidence: 'Eficaz para reduzir comportamentos de escape' },
    { title: 'Rotinas de Sensory Diet (Dieta Sensorial)', description: 'Programa de atividades sensoriais ao longo do dia.', steps: ['Avaliar necessidades sensoriais', 'Criar dieta sensorial personalizada', 'Implementar pausas sensoriais regulares', 'Avaliar e ajustar conforme necessidade'], difficulty: 'MEDIA', evidence: 'Baseado em terapia ocupacional e neurociência' },
  ],
  ACADEMICO: [
    { title: 'Ensino em Tentativas Discretas (DTT)', description: 'Ensino estruturado em ensaio discreto com reforço diferencial.', steps: ['Definir SD, resposta e reforço', 'Apresentar SD de forma clara', 'Reforçar resposta correta imediatamente', 'Usar ensaios randômicos para manter'], difficulty: 'MEDIA', evidence: 'Base do ABA' },
    { title: 'Ensino em Ambiente Natural (NET)', description: 'Ensino em contexto natural com reforçadores naturais.', steps: ['Identificar momentos naturais de ensino', 'Usar reforçadores naturais da atividade', 'Ensinar em contextos variados', 'Promover generalização'], difficulty: 'MEDIA', evidence: 'Complementar ao DTT' },
  ],
};

const teaAgeRecommendations: Record<string, string[]> = {
  '0-2': ['Intervenção precoce intensiva', 'Foco em comunicação funcional', 'Treinamento de pais', 'Intervenção baseada em brincadeira'],
  '3-5': ['Pré-acadêmico estruturado', 'Habilidades sociais em grupo', 'Preparação para escola regular', 'Redução de comportamentos disruptivos'],
  '6-9': ['Acadêmico com adaptações', 'Habilidades sociais avançadas', 'Organização e planejamento', 'Autonomia e autoconfiança'],
  '10-12': ['Preparação para transição escolar', 'Habilidades de vida diária', 'Autogestão', 'Interpretação social avançada'],
  '13+': ['Vocacional e transição', 'Habilidades de vida independente', 'Relacionamentos e sexualidade', 'Auto-advocacia'],
};

function getAgeRange(age: string): string {
  const ageNum = parseInt(age) || 6;
  if (ageNum <= 2) return '0-2';
  if (ageNum <= 5) return '3-5';
  if (ageNum <= 9) return '6-9';
  if (ageNum <= 12) return '10-12';
  return '13+';
}

function generateLocalPlan(diagnosis: string, age: string, goals: string, level: string) {
  const goalsList = goals.split(',').map(g => g.trim()).filter(Boolean);
  const suggestions: any[] = [];
  const ageRange = getAgeRange(age);

  for (const goal of goalsList) {
    const goalUpper = goal.toUpperCase();
    let category = 'COMUNICACAO';
    if (goalUpper.match(/COMPOR|AGIT|AGRES|TANTRUM|CRISE|FALA/)) category = 'COMPORTAMENTO';
    else if (goalUpper.match(/SOCIAL|AMIZADE|GRUPO|INTERAÇ/)) category = 'SOCIALIZACAO';
    else if (goalUpper.match(/SENTA|CALMA|AUTO|SENSORI|EMOC/)) category = 'AUTORREGULACAO';
    else if (goalUpper.match(/LEITURA|ESCRITA|MATEMÁT|ACADÊM|ESTUD|FÔNICO/)) category = 'ACADEMICO';

    const strategies = abaStrategies[category] || abaStrategies.COMUNICACAO;
    const selectedStrategies = strategies.slice(0, 2);

    suggestions.push({
      category,
      goal,
      strategies: selectedStrategies.map(s => ({
        ...s,
        priority: level === '3' ? 'ALTA' : level === '2' ? 'MEDIA' : 'BAIXA',
        estimatedSessions: Math.floor(Math.random() * 15) + 10,
        frequency: level === '3' ? '3x/semana' : '2x/semana',
      })),
      ageRecommendations: teaAgeRecommendations[ageRange] || teaAgeRecommendations['6-9'],
    });
  }

  return {
    diagnosis,
    age,
    level,
    aiProvider: 'clinical-engine',
    overallPlan: {
      totalEstimatedWeeks: 12 + suggestions.length * 4,
      sessionFrequency: level === '3' ? '3x/semana (60min)' : '2x/semana (50min)',
      reassessmentPeriod: 'A cada 4 semanas',
      dataCollection: 'Coleta de dados de sessão via diário e registros DTT/ABC',
      teamInvolvement: ['Terapeuta / Psicopedagogo principal', 'Supervisão clínica', 'Pais/cuidadores (orientação quinzenal)'],
    },
    suggestions,
    generalRecommendations: [
      'Manter consistência e rotina visual entre o consultório e o ambiente familiar',
      'Usar reforçadores positivos altamente motivadores e variados',
      'Documentar os dados de cada sessão para acompanhamento da curva de aprendizagem',
      'Reavaliar as metas do plano a cada 30 dias ou conforme necessidade',
      'Promover generalização das habilidades em diferentes ambientes (casa e escola)',
    ],
  };
}

// --- LLM Providers Calling Helper (Google Gemini / OpenAI) ---
async function callGemini(prompt: string, apiKey: string): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(rawText);
}

// --- 1. Endpoint: Patient Context Helper ---
router.get('/patient-context/:patientId', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const patient = await db.paciente.findUnique({
    where: { id: req.params.patientId },
    include: {
      anamneses: { orderBy: { createdAt: 'desc' }, take: 1 },
      sessoes: { orderBy: { date: 'desc' }, take: 3 }
    }
  });

  if (!patient) {
    return res.status(404).json({ error: 'Paciente não encontrado' });
  }

  // Calculate age if birthDate exists
  let calculatedAge = '';
  if (patient.birthDate) {
    const diff = Date.now() - new Date(patient.birthDate).getTime();
    const ageDate = new Date(diff);
    calculatedAge = String(Math.abs(ageDate.getUTCFullYear() - 1970));
  }

  const anamnese = patient.anamneses?.[0];
  const lastSession = patient.sessoes?.[0];

  res.json({
    patientId: patient.id,
    patientName: patient.name,
    age: calculatedAge || '7',
    diagnosis: patient.diagnosis || anamnese?.queixaPrincipal || 'TEA',
    goals: anamnese?.objetivoGeral || 'Estimulação da linguagem, Consciência fonológica, Foco atencional',
    anamneseNotes: anamnese?.queixaPrincipal || '',
    recentSessionNotes: lastSession?.observacoes || ''
  });
});

// --- 2. Endpoint: Plan Suggestion (Gemini / LLM with Clinical Fallback) ---
router.post('/plan-suggestion', async (req, res) => {
  const { diagnosis, age, goals, level, patientName } = req.body;
  if (!diagnosis || !age || !goals) {
    return res.status(400).json({ error: 'Campos obrigatórios: diagnosis, age, goals' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const prompt = `
Você é um especialista sênior em Neuropsicopedagogia, Terapia ABA e Educação Inclusiva.
Gere um Plano Geral de Intervenção Estruturado com base nos seguintes dados:
- Paciente: ${patientName || 'Paciente'}
- Diagnóstico: ${diagnosis}
- Idade: ${age} anos
- Nível de Suporte: ${level || '2'}
- Objetivos/Metas informadas: ${goals}

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "diagnosis": "${diagnosis}",
  "age": "${age}",
  "level": "${level || '2'}",
  "aiProvider": "gemini",
  "overallPlan": {
    "totalEstimatedWeeks": 16,
    "sessionFrequency": "2x/semana (50min)",
    "reassessmentPeriod": "A cada 4 semanas",
    "dataCollection": "Coleta de dados via diário de sessão e fichas de registro",
    "teamInvolvement": ["Psicopedagogo principal", "Supervisão clínica", "Pais e Cuidadores"]
  },
  "suggestions": [
    {
      "category": "COMUNICACAO | COMPORTAMENTO | SOCIALIZACAO | AUTORREGULACAO | ACADEMICO",
      "goal": "Descrição da meta SMART",
      "strategies": [
        {
          "title": "Nome da técnica clínica (ex: PECS, DTT, Rimas)",
          "description": "Explicação técnica clara",
          "steps": ["Passo 1", "Passo 2", "Passo 3"],
          "difficulty": "BAIXA | MEDIA | ALTA",
          "evidence": "Evidência científica ou referência",
          "priority": "ALTA | MEDIA",
          "estimatedSessions": 12,
          "frequency": "2x/semana"
        }
      ],
      "ageRecommendations": ["Recomendação 1", "Recomendação 2"]
    }
  ],
  "generalRecommendations": ["Recomendação 1", "Recomendação 2", "Recomendação 3"]
}
`;
      const plan = await callGemini(prompt, geminiKey);
      return res.json(plan);
    } catch (err: any) {
      console.warn('Gemini API failed, falling back to clinical engine:', err.message);
    }
  }

  // Fallback to internal clinical rule engine
  const plan = generateLocalPlan(diagnosis, age, goals, level || '2');
  res.json(plan);
});

// --- 3. Endpoint: PEI Generator ---
const peiObjectives: Record<string, any[]> = {
  COMUNICACAO: [
    { area: 'Linguagem Expressiva', goal: 'Aumentar vocabulário ativo e comunicação funcional', indicators: ['Uso de novas palavras e sentenças nas sessões', 'Formação de frases de 3+ palavras'], activities: ['Trilha fonêmica com figuras', 'Rotina de solicitação funcional', 'Jogos de nomeação rápida'], deadline: '3 meses' },
    { area: 'Comunicação Funcional', goal: 'Solicitar necessidades e itens desejados sem frustração', indicators: ['Iniciativa espontânea em 80% das oportunidades', 'Redução de comportamentos de fuga em 50%'], activities: ['PECS / Comunicação Aumentativa', 'Treino em ambiente natural', 'Generalização em casa e escola'], deadline: '4 meses' },
  ],
  COMPORTAMENTO: [
    { area: 'Autorregulação', goal: 'Reduzir crises de agitação e aumentar tempo de foco', indicators: ['Uso de cartas de escolha e termômetro emocional', 'Tempo de permanência em tarefa de 15+ min'], activities: ['Fichas de tokens', 'Quadro de rotina visual', 'Pausas regulatórias'], deadline: '2 meses' },
    { area: 'Tolerância e Flexibilidade', goal: 'Aceitar transições de atividades sem resistência', indicators: ['Aceitação de 80% das transições com aviso prévio', 'Uso de cronômetro visual'], activities: ['Timer visual', 'Quadro Primeiro-Depois', 'Previsibilidade de mudanças'], deadline: '3 meses' },
  ],
  SOCIALIZACAO: [
    { area: 'Interação Social', goal: 'Iniciar e manter interação com pares e terapeutas', indicators: ['Contato visual adequado em 70% das interações', 'Respeito ao turn-taking (sua vez / minha vez)'], activities: ['Jogos cooperativos com regras', 'Dramatização de situações sociais', 'Brincadeira compartilhada'], deadline: '4 meses' },
  ],
  AUTORREGULACAO: [
    { area: 'Sensório-Motor e Emoções', goal: 'Reconhecer estados de alerta e aplicar estratégias de acalmia', indicators: ['Identificação no termômetro das emoções', 'Redução de sobrecarga sensorial'], activities: ['Estratégias de respiração e relaxamento', 'Atividades proprioceptivas', 'Ambiente adaptado'], deadline: '3 meses' },
  ],
  ACADEMICO: [
    { area: 'Habilidades Pré-Acadêmicas / Acadêmicas', goal: 'Desenvolver consciência fonológica e senso numérico', indicators: ['Identificação de rimas e sons iniciais', 'Reconhecimento de quantidades com apoio concreto'], activities: ['Método fônico multissensorial', 'Material dourado e linha numérica', 'Jogos de correspondência grafema-fonema'], deadline: '4 meses' },
  ],
};

function generateLocalPEI(diagnosis: string, age: string, goals: string, level: string, patientName: string) {
  const goalsList = goals.split(',').map(g => g.trim()).filter(Boolean);
  const objectives: any[] = [];

  for (const goal of goalsList) {
    const goalUpper = goal.toUpperCase();
    let category = 'COMUNICACAO';
    if (goalUpper.match(/COMPOR|AGIT|AGRES|TANTRUM|CRISE/)) category = 'COMPORTAMENTO';
    else if (goalUpper.match(/SOCIAL|AMIZADE|GRUPO|INTERAÇ/)) category = 'SOCIALIZACAO';
    else if (goalUpper.match(/SENTA|CALMA|AUTO|SENSORI|EMOC/)) category = 'AUTORREGULACAO';
    else if (goalUpper.match(/LEITURA|ESCRITA|MATEMÁT|ACADÊM|ESTUD|FÔNICO/)) category = 'ACADEMICO';

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
      aiProvider: 'clinical-engine',
      generatedAt: new Date().toISOString(),
      summary: `Plano Educacional Individualizado gerado para ${patientName}, ${age} anos, com diagnóstico de ${diagnosis}. Nível de suporte ${level}.`,
      duration: '12 meses',
      reviewFrequency: 'Mensal (acompanhamento contínuo) / Trimestral (revisão formal das metas)',
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
      method: 'Observação direta + registro de sessão',
      responsible: 'Psicopedagogo / Terapeuta Principal',
      nextCheckIn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })),
    generalRecommendations: [
      'Envolver a família e a escola em todas as etapas de execução do PEI',
      'Manter canal de comunicação frequente entre o terapeuta e os professores de sala regular/AEE',
      'Documentar o progresso semanalmente para validação de dados clínicos',
      'Revisar objetivos formalmente a cada trimestre',
      'Ajustar estratégias conforme as respostas do paciente aos estímulos',
    ],
  };
}

router.post('/generate-pei', async (req, res) => {
  const { diagnosis, age, goals, level, patientName } = req.body;
  if (!diagnosis || !age || !goals || !patientName) {
    return res.status(400).json({ error: 'Campos obrigatórios: diagnosis, age, goals, patientName' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const prompt = `
Você é um especialista em PEI (Plano Educacional Individualizado) e Educação Especial Inclusiva.
Gere um PEI estruturado para:
- Aluno/Paciente: ${patientName}
- Diagnóstico: ${diagnosis}
- Idade: ${age} anos
- Nível de Suporte: ${level || '2'}
- Metas principais: ${goals}

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "pei": {
    "title": "PEI — ${patientName}",
    "diagnosis": "${diagnosis}",
    "age": "${age}",
    "level": "${level || '2'}",
    "aiProvider": "gemini",
    "generatedAt": "${new Date().toISOString()}",
    "summary": "Resumo clínico detalhado",
    "duration": "12 meses",
    "reviewFrequency": "Mensal / Trimestral"
  },
  "phases": [
    { "name": "MONTAR", "label": "Montar o PEI", "description": "Definição de objetivos", "icon": "edit_note", "color": "blue", "status": "CONCLUIDO" },
    { "name": "ATIVAR", "label": "Ativar o Plano", "description": "Início da intervenção", "icon": "play_arrow", "color": "emerald", "status": "EM_ANDAMENTO" },
    { "name": "ACOMPANHAR", "label": "Acompanhar Progresso", "description": "Monitoramento", "icon": "monitoring", "color": "amber", "status": "PENDENTE" },
    { "name": "RENOVAR", "label": "Renovar/Reavaliar", "description": "Revisão periódica", "icon": "refresh", "color": "purple", "status": "PENDENTE" }
  ],
  "objectives": [
    {
      "area": "Linguagem / Comportamento / Acadêmico / etc",
      "goal": "Meta SMART clara",
      "indicators": ["Indicador 1", "Indicador 2"],
      "activities": ["Atividade 1", "Atividade 2"],
      "deadline": "3 meses",
      "category": "COMUNICACAO | COMPORTAMENTO | SOCIALIZACAO | AUTORREGULACAO | ACADEMICO"
    }
  ],
  "checkIns": [
    {
      "area": "Área",
      "frequency": "Quinzenal",
      "method": "Observação e registro de dados",
      "responsible": "Terapeuta e Professor AEE",
      "nextCheckIn": "${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}"
    }
  ],
  "generalRecommendations": ["Recomendação 1", "Recomendação 2"]
}
`;
      const pei = await callGemini(prompt, geminiKey);
      return res.json(pei);
    } catch (err: any) {
      console.warn('Gemini PEI Generation failed, falling back to clinical engine:', err.message);
    }
  }

  const pei = generateLocalPEI(diagnosis, age, goals, level || '2', patientName);
  res.json(pei);
});

// --- 4. Endpoint: Save Generated Plan Directly to Patient Record ---
router.post('/save-to-record', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { pacienteId, planData, title, frequency, sessionCount } = req.body;

  if (!pacienteId || !planData) {
    return res.status(400).json({ error: 'Campos obrigatórios: pacienteId, planData' });
  }

  const plan = await db.interventionPlan.create({
    data: {
      pacienteId,
      professionalId: req.user?.id || 'system',
      date: new Date().toISOString().split('T')[0],
      step1: JSON.stringify(planData),
      step2: title || 'Plano de Intervenção gerado com IA',
      step3: planData.generalRecommendations ? planData.generalRecommendations.join('\n') : '',
      sessionCount: sessionCount || 12,
      frequency: frequency || '2x/semana',
      duration: '50min',
      status: 'ATIVO',
      phase: 'ATIVAR',
    }
  });

  res.status(201).json({
    success: true,
    message: 'Plano de intervenção salvo com sucesso no prontuário do paciente!',
    plan
  });
});

export default router;
