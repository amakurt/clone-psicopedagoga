export interface MaterialTerapeutico {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  ageRange: string;
  format: 'PDF' | 'DOCX' | 'Fichas' | 'Imprimível';
  favorite?: boolean;
  targetSkills: string[];
  description: string;
  applicationGuide: string;
  contentOutline: string[];
  source: string;
  durationMinutes?: number;
  tags?: string[];
}

export const SUBCATEGORIES_MATERIAIS = [
  'Atividades de Linguagem',
  'Atividades de Leitura e Escrita',
  'Atividades de Matemática',
  'Atividades de Funções Executivas',
  'Atividades Socioemocionais',
  'Atividades de Atenção',
  'Protocolos por Diagnóstico',
  'Anamneses Prontas',
  'Guias para Família',
  'Guias para Professor',
  'Materiais ABA',
  'Pacotes de Sessão',
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  'Atividades de Linguagem': 'blue',
  'Atividades de Leitura e Escrita': 'purple',
  'Atividades de Matemática': 'emerald',
  'Atividades de Funções Executivas': 'amber',
  'Atividades Socioemocionais': 'pink',
  'Atividades de Atenção': 'red',
  'Protocolos por Diagnóstico': 'indigo',
  'Anamneses Prontas': 'cyan',
  'Guias para Família': 'teal',
  'Guias para Professor': 'orange',
  'Materiais ABA': 'violet',
  'Pacotes de Sessão': 'rose',
};

export const MATERIAIS_REAIS: MaterialTerapeutico[] = [
  // 1. ATIVIDADES DE LINGUAGEM (Consciência Fonológica, Vocabulário, Sintaxe)
  {
    id: 101,
    name: 'Trilha Fonêmica: Rimas e Aliterações em Jogo',
    category: 'blue',
    subcategory: 'Atividades de Linguagem',
    ageRange: '4-8',
    format: 'PDF',
    targetSkills: ['Consciência Fonológica', 'Percepção Auditiva', 'Identificação de Rimas', 'Aliteração'],
    description: 'Recurso estruturado para estimulação da consciência fonológica através de cartelas lúdicas de pareamento auditivo e visual de palavras rimadas e pares aliterantes.',
    applicationGuide: 'Apresente as cartas ilustradas ao paciente. Peça para ele nomear as figuras e identificar quais palavras terminam com o mesmo som (rima) ou começam com o mesmo fonema (aliteração). Registre acertos espontâneos e com mediação.',
    contentOutline: ['30 Cartas ilustradas de rimas', '20 Fichas de aliteração inicial', 'Folha de registro de acertos e tempo', 'Guia de intervenção fonoaudiológica'],
    source: 'Base Nacional Comum Curricular (BNCC - EF01LP08) / Fonoaudiologia Baseada em Evidências',
    durationMinutes: 20,
    tags: ['rimas', 'aliteração', 'sons', 'linguagem oral', 'educação infantil']
  },
  {
    id: 102,
    name: 'Baralho de Consciência Silábica e Manipulação de Sons',
    category: 'blue',
    subcategory: 'Atividades de Linguagem',
    ageRange: '5-9',
    format: 'PDF',
    targetSkills: ['Segmentação Silábica', 'Adição e Subtração de Sílabas', 'Transposição Silábica'],
    description: 'Atividades práticas de segmentação, contagem e manipulação de sílabas (inversão, omissão e troca de sílabas iniciais e finais).',
    applicationGuide: 'Utilize fichas circulares táteis (tokens) para marcar o número de sílabas pronunciadas. Desafie a criança: "Se tirarmos a primeira sílaba de SAPATO, o que sobra?".',
    contentOutline: ['40 Cartões com apoio concreto', 'Exercícios de contagem palmar e tátil', 'Ficha de síntese e análise fonológica'],
    source: 'Política Nacional de Alfabetização (PNA) / Neuropsicologia Cognitiva',
    durationMinutes: 25,
    tags: ['sílabas', 'segmentação', 'consciência fonológica', 'dislexia']
  },
  {
    id: 103,
    name: 'Painel de Nomeação Rápida e Vocabulário Expressivo',
    category: 'blue',
    subcategory: 'Atividades de Linguagem',
    ageRange: '6-12',
    format: 'PDF',
    targetSkills: ['Nomeação Rápida Automatizada (RAN)', 'Acesso Lexical', 'Ampliação de Vocabulário'],
    description: 'Pranchas de nomeação seriada de cores, objetos comuns, letras e números para treino de velocidade de processamento e recuperação lexical.',
    applicationGuide: 'Cronometre o tempo que o paciente leva para nomear os 50 estímulos da prancha da esquerda para a direita, de cima para baixo. Anote erros e hesitações.',
    contentOutline: ['5 Pranchas RAN padronizadas', 'Tabela de tempos normativos por idade', 'Exercícios de categorização semântica'],
    source: 'Denckla & Rudel / Protocolos de Avaliação da Leitura',
    durationMinutes: 15,
    tags: ['RAN', 'fluência', 'léxico', 'velocidade']
  },
  {
    id: 104,
    name: 'Cartas de Estruturação Frasal e Morfossintaxe',
    category: 'blue',
    subcategory: 'Atividades de Linguagem',
    ageRange: '5-10',
    format: 'PDF',
    targetSkills: ['Estruturação Sintática', 'Uso de Conectivos', 'Concordância Verbal e Nominal'],
    description: 'Fichas coloridas categorizadas por Sujeito (amarelo), Verbo (verde) e Objeto/Complemento (azul) para construção visual e oral de frases.',
    applicationGuide: 'Peça para a criança montar sequências sintáticas ordenando as cores e verbalizando a sentença completa com coerência temporal.',
    contentOutline: ['60 Cartões codificados por cores', 'Prancha de ordenação Sujeito-Verbo-Objeto', 'Exercícios de expansão frasal'],
    source: 'Associação Brasileira de Psicopedagogia (ABPp)',
    durationMinutes: 20,
    tags: ['sintaxe', 'frases', 'gramática funcional', 'TEA']
  },
  {
    id: 105,
    name: 'Guia de Discriminação Auditiva de Pares Mínimos (/p/-/b/, /t/-/d/, /f/-/v/)',
    category: 'blue',
    subcategory: 'Atividades de Linguagem',
    ageRange: '5-11',
    format: 'PDF',
    targetSkills: ['Discriminação Fonêmica de Traço de Sonoridade', 'Percepção Auditiva', 'Prevenção de Trocas Surdas/Sonoras'],
    description: 'Instrumento terapêutico focado na superação de trocas fonológicas na fala e escrita entre consoantes surdas e sonoras.',
    applicationGuide: 'Apresente pares de palavras (ex: PATO / BATO; FACA / VACA). Peça para a criança identificar a vibração das pregas vocais encostando a mão na garganta.',
    contentOutline: ['Tabela de pares mínimos com ilustrações', 'Atividades de treino articulatório', 'Folhas de fixação ortográfica'],
    source: 'Fonoaudiologia Clínica / Tratamento de Desvios Fonológicos',
    durationMinutes: 20,
    tags: ['pares mínimos', 'surdas e sonoras', 'trocas fonológicas', 'disgrafia']
  },

  // 2. ATIVIDADES DE LEITURA E ESCRITA (Alfabetização, Fluência, Compreensão, Ortografia)
  {
    id: 201,
    name: 'Caderno de Leitura Graduada pelo Método Fônico',
    category: 'purple',
    subcategory: 'Atividades de Leitura e Escrita',
    ageRange: '6-10',
    format: 'PDF',
    targetSkills: ['Decodificação Grafofonêmica', 'Leitura de Pseudopalavras', 'Precisão Leitora'],
    description: 'Coleção de textos curtos e listas de palavras com controle estrito de complexidade ortográfica (vogais, sílabas canônicas CV, seguidas de CCV e CVC).',
    applicationGuide: 'Instrua a criança a ler as listas em voz alta. Utilize marcador de linha para evitar saltos. Marque na folha de controle as substituições ou omissões.',
    contentOutline: ['12 Listas de palavras progressivas', '10 Textos decodificáveis com rimas', 'Grelha de acompanhamento de precisão'],
    source: 'Instituto NeuroSaber / Abordagem Multissensorial Fônica',
    durationMinutes: 30,
    tags: ['método fônico', 'decodificação', 'alfabetização', 'leitura']
  },
  {
    id: 202,
    name: 'Fichas de Discriminação Visual de Letras Espelhadas (b, d, p, q)',
    category: 'purple',
    subcategory: 'Atividades de Leitura e Escrita',
    ageRange: '6-9',
    format: 'PDF',
    targetSkills: ['Orientação Espacial', 'Discriminação Visual', 'Orientação Direcional Esquerda-Direita'],
    description: 'Exercícios cinestésicos e visuais de ancoragem para crianças com confusão de lateralidade e espelhamento de grafemas.',
    applicationGuide: 'Utilize a técnica "cama" (bed: mão esquerda b, mão direita d) e exercícios de rastreamento com cores contrastantes para fixação.',
    contentOutline: ['Cartaz mnemônico das mãos b-d', 'Atividades de labirinto e caça-letras', 'Treino motor de traçado com setas direcionais'],
    source: 'Psicopedagogia Clínica / Dificuldades Específicas de Aprendizagem',
    durationMinutes: 20,
    tags: ['espelhamento', 'lateralidade', 'disgrafia', 'letras b d p q']
  },
  {
    id: 203,
    name: 'Treino de Fluência e Velocidade Leitora (PPM - Palavras Por Minuto)',
    category: 'purple',
    subcategory: 'Atividades de Leitura e Escrita',
    ageRange: '7-12',
    format: 'PDF',
    targetSkills: ['Velocidade Leitora', 'Prosódia', 'Automatização da Leitura'],
    description: 'Protocolo de leitura repetida e assistida com textos nivelados por ano escolar para cálculo de PPM e índice de acurácia.',
    applicationGuide: 'Faça a primeira leitura cronometrada em 60 segundos. Calcule PPM = (Palavras Lidas - Erros). Realize a leitura modelada e peça repetição.',
    contentOutline: ['8 Textos calibrados por nível escolar (2º ao 5º ano)', 'Tabela de referência PPM por faixa etária', 'Gráfico de evolução do paciente'],
    source: 'Hasbrouck & Tindal / Avaliação da Fluência de Leitura Oral',
    durationMinutes: 25,
    tags: ['fluência leitora', 'PPM', 'prosódia', 'velocidade']
  },
  {
    id: 204,
    name: 'Pranchas de Produção Textual Guiada: Quem? Onde? O que aconteceu? Como terminou?',
    category: 'purple',
    subcategory: 'Atividades de Leitura e Escrita',
    ageRange: '7-12',
    format: 'PDF',
    targetSkills: ['Coesão e Coerência', 'Estrutura Narrativa', 'Planejamento de Texto'],
    description: 'Organizadores visuais estruturados em 4 blocos para orientar o planejamento e a redação de histórias com início, meio e fim.',
    applicationGuide: 'Antes da escrita livre, ajude o aluno a preencher oralmente cada quadrante do mapa conceitual. Incentive o uso de pontuação correta.',
    contentOutline: ['5 Mapas conceituais de narrativa', 'Banco de conectivos e adjetivos', 'Checklist de autoavaliação da redação'],
    source: 'BNCC - Língua Portuguesa / Produção Textual nos Anos Iniciais',
    durationMinutes: 30,
    tags: ['produção textual', 'redação', 'coesão', 'narrativa']
  },
  {
    id: 205,
    name: 'Laboratório de Ortografia: Regras R/RR, S/SS, Ç, M antes de P e B',
    category: 'purple',
    subcategory: 'Atividades de Leitura e Escrita',
    ageRange: '7-12',
    format: 'PDF',
    targetSkills: ['Consciência Ortográfica', 'Memória Visual Ortográfica', 'Aplicação de Regras Contextuais'],
    description: 'Guia de regras ortográficas com esquemas visuais mnemônicos e atividades de preenchimento contextualizado sem decoreba.',
    applicationGuide: 'Apresente a regra através do contraste sonoro e visual. Peça para o paciente classificar as palavras no quadro correspondente.',
    contentOutline: ['Resumo ilustrado das regras ortográficas', '10 Folhas de atividades práticas contextualizadas', 'Jogo de tabuleiro ortográfico'],
    source: 'Protocolo PRO-ORTOGRAFIA / Salles et al.',
    durationMinutes: 25,
    tags: ['ortografia', 'disortografia', 'regras gramaticais', 'escrita']
  },

  // 3. ATIVIDADES DE MATEMÁTICA E RACIOCÍNIO LÓGICO (Discalculia, Senso Numérico)
  {
    id: 301,
    name: 'Guia de Manipulação do Material Dourado: Sistema Decimal e Trocas',
    category: 'emerald',
    subcategory: 'Atividades de Matemática',
    ageRange: '6-11',
    format: 'PDF',
    targetSkills: ['Valor Posicional (Unidade, Dezena, Centena)', 'Composição Numérica', 'Operações de Adição e Subtração com Troca'],
    description: 'Pranchas de concreto para pictórico e abstrato (CPA) utilizando blocos e placas do Material Dourado.',
    applicationGuide: 'Conduza o paciente a representar números reais no tapete de ordens. Demonstre a regra: "Juntou 10 cubinhos, troca pela barrinha de dezena".',
    contentOutline: ['Tapete de ordens para impressão plastificada', '30 Desafios de composição numérica', 'Passo a passo visual para reagrupamento'],
    source: 'Maria Montessori / Abordagem CPA de Singapura',
    durationMinutes: 30,
    tags: ['material dourado', 'sistema decimal', 'discalculia', 'adição e subtração']
  },
  {
    id: 302,
    name: 'Linha Numérica Terapêutica Interativa (0 a 20 e 0 a 100)',
    category: 'emerald',
    subcategory: 'Atividades de Matemática',
    ageRange: '5-10',
    format: 'PDF',
    targetSkills: ['Magnitude Numérica', 'Estimativa Visual', 'Conceito de Antecessor/Sucessor', 'Cálculo Mental'],
    description: 'Reta numérica visual com marcadores de pulos para visualização espacial de somas, subtrações e estimativa de distâncias numéricas.',
    applicationGuide: 'Peça para a criança posicionar um marcador num valor aproximado em uma reta vazia com apenas 0 e 100 nas extremidades. Avalie a precisão espacial.',
    contentOutline: ['Linhas numéricas graduadas e sem graduação', 'Exercícios de salto na reta (pulos de 2, 5 e 10)', 'Guia de intervenção para senso numérico'],
    source: 'Siegler & Booth / Desenvolvimento do Senso Numérico',
    durationMinutes: 20,
    tags: ['reta numérica', 'senso numérico', 'estimativa', 'discalculia']
  },
  {
    id: 303,
    name: 'Fatos Básicos da Multiplicação: Tabuada Sem Memorização Mecânica',
    category: 'emerald',
    subcategory: 'Atividades de Matemática',
    ageRange: '8-12',
    format: 'PDF',
    targetSkills: ['Compreensão de Adição Repetida', 'Malhas Quadriculadas', 'Propriedade Comutativa'],
    description: 'Atividades de construção visual da tabuada utilizando áreas geométricas retangulares (matrizes de pontos) e decomposição numérica.',
    applicationGuide: 'Mostre que 3 x 4 é a mesma área que 4 x 3 desenhando retângulos em papel milimetrado. Ensine a estratégia de dobros e metades.',
    contentOutline: ['Malha quadriculada para colorir multiplicações', 'Cartões de raciocínio de dobros e decomposições', 'Jogo de batalha naval multiplicativa'],
    source: 'Jo Boaler (Stanford / Youcubed) / Matemática Mental Visual',
    durationMinutes: 25,
    tags: ['multiplicação', 'tabuada', 'matemática visual', 'raciocínio lógico']
  },
  {
    id: 304,
    name: 'Problemas Matemáticos Ilustrados com Suporte Semântico',
    category: 'emerald',
    subcategory: 'Atividades de Matemática',
    ageRange: '7-12',
    format: 'PDF',
    targetSkills: ['Interpretação de Enunciados', 'Tradução Linguística para Expressão Matemática', 'Resolução de Problemas'],
    description: 'Situações-problema estruturadas em 3 passos: 1) O que eu sei? 2) O que preciso descobrir? 3) Qual a conta necessária?',
    applicationGuide: 'Instrua o paciente a sublinhar os dados numéricos de azul e a pergunta de vermelho antes de calcular. Estimule o desenho representativo.',
    contentOutline: ['20 Problemas com organizador gráfico de 3 passos', 'Banco de pistas linguísticas (mais que, menos que, diferença)', 'Folha de resolução guiada'],
    source: 'Polya / Metodologia de Resolução de Problemas',
    durationMinutes: 25,
    tags: ['problemas', 'interpretação', 'cálculo', 'cognição matemática']
  },

  // 4. ATIVIDADES DE FUNÇÕES EXECUTIVAS (Memória de Trabalho, Inibição, Flexibilidade)
  {
    id: 401,
    name: 'Baralho de Controle Inibitório e Flexibilidade Tipo Stroop Lúdico',
    category: 'amber',
    subcategory: 'Atividades de Funções Executivas',
    ageRange: '5-12',
    format: 'PDF',
    targetSkills: ['Controle Inibitório', 'Flexibilidade Cognitiva', 'Atenção Seletiva'],
    description: 'Cartas com estímulos conflitantes (ex: Sol que exige dizer "Noite", animal terrestre que exige dizer "Peixe", palavras de cores impressas em tinta oposta).',
    applicationGuide: 'Apresente a regra: "Quando vir o Sol, você deve dizer NOITE; quando vir a Lua, diga DIA". Na fase 2, inverta as regras rapidamente para exigir flexibilidade.',
    contentOutline: ['48 Cartas de alta qualidade para recortar', 'Ficha de controle de tempo e erros de impulsividade', 'Protocolo de progressão por níveis'],
    source: 'Diamond (2013) / Diamond & Ling - Executive Functions in Child Development',
    durationMinutes: 20,
    tags: ['stroop', 'controle inibitório', 'flexibilidade', 'TDAH']
  },
  {
    id: 402,
    name: 'Treino de Memória Operacional Auditiva e Visual (N-Back Infantil)',
    category: 'amber',
    subcategory: 'Atividades de Funções Executivas',
    ageRange: '6-14',
    format: 'PDF',
    targetSkills: ['Memória de Trabalho Fonológica', 'Memória Visuoespacial', 'Manutenção e Manipulação de Informações'],
    description: 'Exercícios graduados de repetição de sequências diretas e inversas de dígitos, cores, animais e caminhos em matrizes visuais.',
    applicationGuide: 'Fale uma sequência: "2 - 7 - 4". Peça para o paciente repetir de trás para frente ("4 - 7 - 2"). Aumente a extensão conforme o sucesso.',
    contentOutline: ['Tabelas de span direto e inverso padronizadas', 'Pranchas de blocos de Corsi para treino visuoespacial', 'Folha de evolução semanal'],
    source: 'Baddeley & Hitch / Modelo Multicomponente de Memória de Trabalho',
    durationMinutes: 20,
    tags: ['memória de trabalho', 'span', 'Corsi', 'atenção']
  },
  {
    id: 403,
    name: 'Painel de Planejamento e Organização de Metas em 4 Passos',
    category: 'amber',
    subcategory: 'Atividades de Funções Executivas',
    ageRange: '8-16',
    format: 'PDF',
    targetSkills: ['Planejamento Estratégico', 'Metacognição', 'Monitoramento e Autocorreção'],
    description: 'Ferramenta visual de divisão de grandes tarefas em microetapas com estimativa de tempo e checklist de conferência.',
    applicationGuide: 'Ensine o paciente a escolher uma tarefa escolar complexa (ex: fazer um trabalho de ciências) e desmembrar em: 1) Materiais, 2) Pesquisa, 3) Escrita, 4) Revisão.',
    contentOutline: ['Template do Planner Executivo', 'Relógio visual de estimativa de tempo', 'Checklist de autoavaliação metacognitiva'],
    source: 'Dawson & Guare - Smart but Scattered / Intervenção em Funções Executivas',
    durationMinutes: 25,
    tags: ['planejamento', 'metacognição', 'organização escolar', 'TDAH']
  },

  // 5. ATIVIDADES SOCIOEMOCIONAIS E AUTORREGULAÇÃO
  {
    id: 501,
    name: 'Termômetro das Emoções & Kit de Estratégias de Autorregulação',
    category: 'pink',
    subcategory: 'Atividades Socioemocionais',
    ageRange: '4-12',
    format: 'PDF',
    targetSkills: ['Identificação e Nomeação Emocional', 'Autorregulação Emocional', 'Zona de Regulação'],
    description: 'Termômetro visual graduado de 1 (Calmo/Verde) a 5 (Explosão/Vermelho) acompanhado de cartas de estratégias de acalmia (respiração diafragmática, pausa, água).',
    applicationGuide: 'Ajude a criança a localizar em que nível do termômetro ela se encontra no momento e a selecionar no baralho qual estratégia sensorial/cognitiva usará para voltar ao nível 1 ou 2.',
    contentOutline: ['Termômetro ilustrado em alta resolução', '20 Cartas de estratégias de enfrentamento', 'Diário de registro de gatilhos emocionais'],
    source: 'The Zones of Regulation (Kuypers) / Inteligência Emocional na Infância',
    durationMinutes: 20,
    tags: ['emoções', 'autorregulação', 'zonas de regulação', 'ansiedade', 'TEA']
  },
  {
    id: 502,
    name: 'Baralho de Habilidades Sociais: Teoria da Mente e Empatia',
    category: 'pink',
    subcategory: 'Atividades Socioemocionais',
    ageRange: '6-14',
    format: 'PDF',
    targetSkills: ['Teoria da Mente', 'Tomada de Perspectiva', 'Resolução Pacífica de Conflitos'],
    description: 'Cenários ilustrados do cotidiano escolar e familiar para discussão: "O que o colega está sentindo?", "O que você faria no lugar dele?".',
    applicationGuide: 'Apresente a vinheta clínica ilustrada. Pergunte: "Por que o Pedro ficou chateado?". Estimule a criança a pensar em 3 soluções diferentes para a situação.',
    contentOutline: ['36 Cartas de situações sociais reais', 'Guia de mediação para o terapeuta', 'Folha de role-playing (dramatização)'],
    source: 'Del Prette & Del Prette / Psicologia do Desenvolvimento',
    durationMinutes: 25,
    tags: ['habilidades sociais', 'teoria da mente', 'empatia', 'TEA']
  },

  // 6. ATIVIDADES DE ATENÇÃO E CONCENTRAÇÃO
  {
    id: 601,
    name: 'Fichas de Rastreamento Visual, Cancelamento e Atenção Sustentada',
    category: 'red',
    subcategory: 'Atividades de Atenção',
    ageRange: '6-14',
    format: 'PDF',
    targetSkills: ['Atenção Sustentada', 'Atenção Concentrada', 'Rastreio Visual Sistemático'],
    description: 'Testes e treinos de cancelamento de figuras-alvo em matrizes com distratores de alta densidade visual (letras, formas geométricas, símbolos).',
    applicationGuide: 'Instrua o paciente a riscar todos os símbolos-alvo linha por linha sem pular nenhuma, o mais rápido possível durante 2 minutos.',
    contentOutline: ['10 Fichas com densidades crescentes de distratores', 'Gabarito para correção rápida de omissões', 'Gráfico de produtividade e índice de dispersão'],
    source: 'Teste de Atenção Visual (TAV) / Neuropsicologia da Atenção',
    durationMinutes: 15,
    tags: ['atenção concentrada', 'cancelamento', 'rastreio visual', 'TDAH']
  },
  {
    id: 602,
    name: 'Labirintos e Traçados Complexos para Foco e Persistência',
    category: 'red',
    subcategory: 'Atividades de Atenção',
    ageRange: '5-12',
    format: 'PDF',
    targetSkills: ['Planejamento Motor', 'Atenção Sustentada', 'Tolerância à Frustração'],
    description: 'Caderno de labirintos circulares, hexagonais e de dupla rota que exigem pré-visualização do caminho antes do traçado a lápis.',
    applicationGuide: 'Regra de ouro: "Primeiro faça o caminho com os olhos e com o dedo; só use o lápis quando tiver certeza da rota".',
    contentOutline: ['15 Labirintos progressivos de nível 1 a 5', 'Páginas com pontuação e cronometragem', 'Dicas de respiração para foco'],
    source: 'Porteus Mazes / Avaliação Neuropsicopedagógica',
    durationMinutes: 20,
    tags: ['labirintos', 'foco', 'coordenação visomotora', 'persistência']
  },

  // 7. PROTOCOLOS POR DIAGNÓSTICO
  {
    id: 701,
    name: 'Escala de Rastreio SNAP-IV para TDAH (Pais e Professores)',
    category: 'indigo',
    subcategory: 'Protocolos por Diagnóstico',
    ageRange: '6-16',
    format: 'PDF',
    targetSkills: ['Rastreio de Desatenção', 'Rastreio de Hiperatividade/Impulsividade', 'Sintomas Opositores (TOD)'],
    description: 'Questionário normatizado de 18 itens para quantificação dos sintomas de desatenção, hiperatividade e conduta desafiadora com tabela de pontos de corte.',
    applicationGuide: 'Entregue o questionário aos pais e professores. Calcule as médias dos itens 1 a 9 (Desatenção) e 10 a 18 (Hiperatividade). Compare com os escores de corte brasileiros.',
    contentOutline: ['Formulário para Pais', 'Formulário para Professores', 'Tabela de escore e cálculo automatizado', 'Instruções de laudo técnico'],
    source: 'Mattos et al. (2006) / Validação Brasileira da Escala SNAP-IV',
    durationMinutes: 15,
    tags: ['SNAP-IV', 'TDAH', 'rastreio', 'escala', 'escola']
  },
  {
    id: 702,
    name: 'Protocolo M-CHAT-R/F para Rastreio Precoce de Autismo (TEA)',
    category: 'indigo',
    subcategory: 'Protocolos por Diagnóstico',
    ageRange: '1-4',
    format: 'PDF',
    targetSkills: ['Atenção Compartilhada', 'Resposta ao Nome', 'Comunicação Não-Verbal', 'Brincar Simbólico'],
    description: 'Instrumento validado para triagem de risco de Transtorno do Espectro Autista em crianças pequenas com algoritmo de estratificação de risco (Baixo, Moderado, Alto).',
    applicationGuide: 'Aplique as 20 perguntas aos responsáveis. Em caso de risco moderado (3 a 7 pontos), aplique a entrevista de seguimento (Follow-Up) para cada item crítico.',
    contentOutline: ['Questionário M-CHAT-R com 20 itens', 'Fluxograma de pontuação e risco', 'Roteiro de entrevista de seguimento (Follow-Up)', 'Carta de encaminhamento médico'],
    source: 'Robins, Casagrande, Barton & Green (2014) / Tradução Losapio et al.',
    durationMinutes: 20,
    tags: ['M-CHAT', 'autismo', 'TEA', 'rastreio precoce', 'bebês']
  },

  // 8. ANAMNESES PRONTAS
  {
    id: 801,
    name: 'Anamnese Neuropsicopedagógica Completa (Histórico Global de Desenvolvimento)',
    category: 'cyan',
    subcategory: 'Anamneses Prontas',
    ageRange: '3-16',
    format: 'DOCX',
    targetSkills: ['Levantamento Clínico', 'Marcos Motores e de Linguagem', 'Histórico Gestacional', 'Queixa Escolar'],
    description: 'Roteiro exaustivo e humanizado com 8 seções estruturadas para a primeira entrevista com os pais/responsáveis.',
    applicationGuide: 'Realize em ambiente reservado sem a presença da criança. Anote relatos espontâneos nas áreas de sono, alimentação, escolarização e dinâmica familiar.',
    contentOutline: ['Identificação e Queixa Principal', 'Histórico Pré, Peri e Pós-natal', 'Marcos do Neurodesenvolvimento', 'Rotina, Sono e Telas', 'Histórico Escolar'],
    source: 'Associação Brasileira de Psicopedagogia (ABPp) / Código de Ética Profissional',
    durationMinutes: 60,
    tags: ['anamnese', 'primeira sessão', 'avaliação inicial', 'família']
  },
  {
    id: 802,
    name: 'Roteiro de Entrevista com a Equipe Escolar e Professores',
    category: 'cyan',
    subcategory: 'Anamneses Prontas',
    ageRange: '4-16',
    format: 'DOCX',
    targetSkills: ['Avaliação Ecológica Escolar', 'Comportamento em Grupo', 'Rendimento Acadêmico', 'Adaptações Atuais'],
    description: 'Formulário técnico para envio ou entrevista presencial/online com o professor regente, coordenador pedagógico e professor de AEE.',
    applicationGuide: 'Agende reunião com a coordenação pedagógica. Solicite amostras de cadernos e avaliações do aluno para análise comparativa.',
    contentOutline: ['Questionário sobre atenção e ritmo de trabalho em sala', 'Interação com pares no recreio', 'Desempenho em leitura, escrita e matemática', 'Estratégias pedagógicas já testadas'],
    source: 'Diretrizes Nacionais de Educação Especial na Perspectiva Inclusiva (MEC)',
    durationMinutes: 45,
    tags: ['escola', 'professores', 'visita escolar', 'AEE']
  },

  // 9. GUIAS PARA FAMÍLIA
  {
    id: 901,
    name: 'Manual da Rotina Visual Doméstica e Manejo de Telas',
    category: 'teal',
    subcategory: 'Guias para Família',
    ageRange: '3-12',
    format: 'PDF',
    targetSkills: ['Organização da Rotina', 'Higiene do Sono', 'Transições sem Crise', 'Previsibilidade'],
    description: 'Cartilha ilustrada para os pais com modelos de quadros de rotina diária (manhã, tarde, noite) e orientações práticas de limites de telas.',
    applicationGuide: 'Entregue o material na sessão devolutiva ou de orientação familiar. Ensine os pais a montar o quadro visual no quarto da criança com figuras móveis.',
    contentOutline: ['Guia de 10 passos para uma rotina previsível', 'Cartões ilustrados de atividades diárias (escovar dentes, lição, banho)', 'Tabela de tempo de tela saudável por idade'],
    source: 'Sociedade Brasileira de Pediatria (SBP) / Psicologia Comportamental',
    durationMinutes: 30,
    tags: ['rotina familiar', 'pais', 'telas', 'sono', 'orientação']
  },

  // 10. GUIAS PARA PROFESSOR (PEI e Adaptações)
  {
    id: 1001,
    name: 'Guia de Adaptação Curricular e Provas para Alunos com TDAH, Dislexia e TEA (PEI)',
    category: 'orange',
    subcategory: 'Guias para Professor',
    ageRange: '6-16',
    format: 'PDF',
    targetSkills: ['Adaptação de Avaliações', 'Acessibilidade Metodológica', 'Plano de Ensino Individualizado'],
    description: 'Manual técnico para professores com exemplos práticos de como simplificar enunciados, aumentar espaçamento tipográfico e flexibilizar tempo de prova.',
    applicationGuide: 'Compartilhe com a escola do paciente como anexo ao Laudo ou Relatório Psicopedagógico para orientar a elaboração do PEI.',
    contentOutline: ['Checklist de adaptação de provas e tarefas', 'Exemplos comparativos: Prova Tradicional vs Prova Acessível', 'Estratégias de sala de aula por diagnóstico'],
    source: 'MEC / Lei Brasileira de Inclusão (LBI nº 13.146/2015)',
    durationMinutes: 40,
    tags: ['PEI', 'adaptação de provas', 'escola inclusiva', 'LBI', 'professores']
  },

  // 11. MATERIAIS ABA
  {
    id: 1101,
    name: 'Folha de Registro de Tentativas Discretas (DTT) e Ensino Incidental',
    category: 'violet',
    subcategory: 'Materiais ABA',
    ageRange: '2-14',
    format: 'PDF',
    targetSkills: ['Registro de Resposta Independente (+)', 'Nível de Ajuda/Prompt', 'Coleta de Dados de Linha de Base'],
    description: 'Folha de registro padrão para programas de intervenção ABA com cálculo de porcentagem de acertos independentes e critério de domínio.',
    applicationGuide: 'A cada tentativa do programa de ensino, marque: (+) Independente, (P) Prompt/Ajuda Física, (V) Ajuda Verbal, (-) Erro. Calcule % ao final de 10 tentativas.',
    contentOutline: ['Grade de 10 tentativas por alvo', 'Legenda padronizada de níveis de ajuda (Prompts)', 'Gráfico de aquisição de habilidades'],
    source: 'Cooper, Heron & Heward - Applied Behavior Analysis (ABA) / BACB Guidelines',
    durationMinutes: 15,
    tags: ['ABA', 'DTT', 'registro comportamental', 'autismo', 'tentativas discretas']
  },
  {
    id: 1102,
    name: 'Prancha de Economia de Fichas (Token Economy) com Reforçadores Visuais',
    category: 'violet',
    subcategory: 'Materiais ABA',
    ageRange: '3-12',
    format: 'PDF',
    targetSkills: ['Engajamento na Tarefa', 'Autorregulação', 'Aumento de Comportamentos Adequados'],
    description: 'Prancha de 3, 5 e 10 fichas com estrelas e emojis com espaço para cartão do reforçador final escolhido pela criança.',
    applicationGuide: 'Antes de iniciar a tarefa, permita que o paciente escolha seu reforçador (ex: 5 min de jogo). A cada bloco concluído, entregue uma ficha.',
    contentOutline: ['Pranchas de 3, 5 e 10 tokens para recortar e plastificar', 'Banco de 24 cartões de reforçadores visuais', 'Contrato comportamental simples'],
    source: 'Análise do Comportamento Aplicada (ABA) / Modificação Comportamental',
    durationMinutes: 10,
    tags: ['economia de fichas', 'token economy', 'reforço positivo', 'motivação']
  },

  // 12. PACOTES DE SESSÃO ESTRUTURADOS
  {
    id: 1201,
    name: 'Kit Completo: 1ª Sessão de Avaliação Lúdica Estruturada (Quebra-Gelo + Vínculo)',
    category: 'rose',
    subcategory: 'Pacotes de Sessão',
    ageRange: '4-12',
    format: 'PDF',
    targetSkills: ['Estabelecimento de Rapport / Vínculo Terapêutico', 'Observação Lúdica', 'Redução da Ansiedade Inicial'],
    description: 'Plano completo de sessão com roteiro minuto a minuto, caixa lúdica, dinâmicas de apresentação e ficha de observação comportamental inicial.',
    applicationGuide: 'Siga as 4 etapas: 1) Acolhimento e tour pela sala (10 min), 2) Jogo "Quem sou eu?" (15 min), 3) Desenho da família ou livre (15 min), 4) Encerramento e combinado da próxima sessão (10 min).',
    contentOutline: ['Roteiro minuto a minuto da sessão', 'Jogo de cartas Quebra-Gelo "Meus Favoritos"', 'Ficha de observação de postura e contato visual', 'Combinados de consultório ilustrados'],
    source: 'Clínica Psicopedagógica Integrada / Manual de Boas Práticas',
    durationMinutes: 50,
    tags: ['primeira sessão', 'rapport', 'vínculo', 'avaliação lúdica', 'acolhimento']
  },
  {
    id: 1202,
    name: 'Kit Intervenção Intensiva em Dislexia: 4 Sessões Estruturadas',
    category: 'rose',
    subcategory: 'Pacotes de Sessão',
    ageRange: '7-12',
    format: 'PDF',
    targetSkills: ['Consciência Fonêmica', 'Correspondência Grafema-Fonema', 'Fluência em Pseudopalavras', 'Autonomia na Leitura'],
    description: 'Sequência progressiva de 4 sessões completas com planos de aula, materiais de apoio para impressão e metas de aprendizagem claras.',
    applicationGuide: 'Execute 1 sessão por semana conforme o cronograma: Sessão 1 (Vogais e Sons Curtos), Sessão 2 (Dígrafos e Encontros Consonantais), Sessão 3 (Velocidade e Precisão), Sessão 4 (Compreensão com Mapa Mental).',
    contentOutline: ['4 Planos de sessão detalhados', 'Mais de 30 folhas de atividades imprimíveis', 'Checklist de evolução entre sessões'],
    source: 'International Dyslexia Association (IDA) / Abordagem Orton-Gillingham',
    durationMinutes: 50,
    tags: ['dislexia', 'pacote de sessões', 'plano de intervenção', 'alfabetização']
  }
];
