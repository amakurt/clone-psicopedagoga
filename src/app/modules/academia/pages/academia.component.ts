import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DecisionChoice {
  text: string;
  outcome: 'correct' | 'partial' | 'incorrect';
  explanation: string;
}

interface DecisionPoint {
  question: string;
  scenario: string;
  choices: DecisionChoice[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface ClinicalCase {
  id: number;
  title: string;
  icon: string;
  color: string;
  description: string;
  difficulty: number;
  steps: DecisionPoint[];
  quiz: QuizQuestion[];
}

const CASES_DATA: ClinicalCase[] = [
  {
    id: 1, title: 'Atraso de Linguagem - 4 anos', icon: 'child_care', color: 'blue',
    description: 'Criança de 4 anos encaminhada por atraso no desenvolvimento de linguagem',
    difficulty: 2,
    steps: [
      { question: 'Primeira abordagem', scenario: 'A mãe relata que o filho de 4 anos fala apenas palavras isoladas. Na avaliação inicial, o que você faz?',
        choices: [
          { text: 'Aplicar teste formal de linguagem imediatamente', outcome: 'partial', explanation: 'Testes formais são importantes, mas a anamnese detalhada deve preceder a avaliação formal para contextualizar os resultados.' },
          { text: 'Realizar anamnese completa e observação lúdica', outcome: 'correct', explanation: 'Excelente! A anamnese com história do desenvolvimento e observação em contexto natural fornece dados fundamentais para planejar a avaliação.' },
          { text: 'Encaminhar diretamente para fonoaudiólogo', outcome: 'incorrect', explanation: 'O encaminhamento prematuro sem avaliação psicopedagógica pode perder informações cruciais sobre o perfil da criança.' }
        ] },
      { question: 'Investigação do histórico', scenario: 'Na anamnese, você descobre que a criança usa tablet 4h/dia e tem pouco contato verbal com adultos. Qual sua hipótese?',
        choices: [
          { text: 'TEA - Transtorno do Espectro Autista', outcome: 'partial', explanation: 'Embora o uso excessivo de telas possa mascarar sintomas de TEA, é necessário avaliar outros indicadores antes de levantar essa hipótese.' },
          { text: 'Atraso de linguagem por falta de estímulo ambiental', outcome: 'correct', explanation: 'Correto! A privação de estímulo linguístico é uma causa comum de atraso de linguagem expressiva.' },
          { text: 'Deficiência intelectual', outcome: 'incorrect', explanation: 'Não há dados suficientes para essa hipótese. É importante investigar o contexto ambiental antes.' }
        ] },
      { question: 'Planejamento da intervenção', scenario: 'Após confirmar atraso de linguagem por privação ambiental, qual plano você monta?',
        choices: [
          { text: 'Plano focado apenas em exercícios de fala', outcome: 'partial', explanation: 'Exercícios de fala são úteis, mas um plano eficaz deve incluir orientação familiar.' },
          { text: 'Intervenção familiar + estimulação em ambiente natural', outcome: 'correct', explanation: 'Perfeito! A intervenção deve ser ecológica, trabalhando com a família.' },
          { text: 'Escola regular com acompanhamento itinerante', outcome: 'incorrect', explanation: 'A criança precisa de intervenção direta antes da inclusão escolar.' }
        ] },
      { question: 'Acompanhamento', scenario: 'Após 3 meses, a criança progressou, mas ainda usa frases de 2-3 palavras. O que fazer?',
        choices: [
          { text: 'Aumentar a intensidade da terapia para 5x/semana', outcome: 'partial', explanation: 'É mais importante verificar se a família está implementando as orientações no dia a dia.' },
          { text: 'Reavaliar e ajustar metas com base no progresso', outcome: 'correct', explanation: 'A reavaliação periódica permite ajustar o plano terapêutico de forma personalizada.' },
          { text: 'Manter o mesmo plano por mais 3 meses', outcome: 'incorrect', explanation: 'Planos devem ser dinâmicos e ajustados com base no progresso observado.' }
        ] },
    ],
    quiz: [
      { question: 'Qual a idade ideal para rastreamento de linguagem?', options: ['2 anos', '3 anos', '4 anos', '5 anos'], correct: 0 },
      { question: 'Qual é o principal fator de risco ambiental?', options: ['Baixa renda', 'Uso excessivo de telas', 'Escola particular', 'Alimentação'], correct: 1 },
      { question: 'A anamnese deve anteceder a avaliação formal?', options: ['Sim, sempre', 'Não, apenas em casos graves', 'Depende da idade', 'Apenas se pais solicitarem'], correct: 0 },
    ]
  },
  {
    id: 2, title: 'Dificuldades de Leitura', icon: 'menu_book', color: 'purple',
    description: 'Adolescente de 12 anos com dificuldades persistentes de leitura',
    difficulty: 3,
    steps: [
      { question: 'Avaliação inicial', scenario: 'Um adolescente de 12 anos tem notas baixas em matérias que exigem leitura. O que investiga primeiro?',
        choices: [
          { text: 'Aplicar teste de QI', outcome: 'incorrect', explanation: 'O teste de QI não é o primeiro passo. É crucial investigar habilidades de leitura específicas.' },
          { text: 'Avaliar consciência fonológica e decoding', outcome: 'correct', explanation: 'Excelente! Permite identificar dislexia ou outras dificuldades específicas de leitura.' },
          { text: 'Entrevistar professores sobre comportamento', outcome: 'partial', explanation: 'Importante, mas deve ser complementar à avaliação clínica direta.' }
        ] },
      { question: 'Diagnóstico diferencial', scenario: 'Os testes indicam boa compreensão oral, mas decoding muito lento e erros de omissão. Qual hipótese?',
        choices: [
          { text: 'Deficiência intelectual', outcome: 'incorrect', explanation: 'A boa compreensão oral contraindica deficiência intelectual.' },
          { text: 'Dislexia', outcome: 'correct', explanation: 'O padrão de dificuldade de decoding com boa compreensão oral é característico da dislexia.' },
          { text: 'Problemas de visão', outcome: 'partial', explanation: 'Devem ser descartados, mas o padrão é mais consistente com dificuldade fonológica.' }
        ] },
      { question: 'Intervenção pedagógica', scenario: 'Com diagnóstico de dislexia, qual abordagem você sugere?',
        choices: [
          { text: 'Repetência para amadurecer', outcome: 'incorrect', explanation: 'A repetência não resolve dificuldades de aprendizagem.' },
          { text: 'Programa de intervenção fônica estruturado', outcome: 'correct', explanation: 'Intervenções fônicas multimodais são a base do tratamento da dislexia.' },
          { text: 'Apenas adaptações como mais tempo nas provas', outcome: 'partial', explanation: 'Adaptações são necessárias, mas insuficientes sem intervenção direta.' }
        ] },
      { question: 'Acompanhamento', scenario: 'O adolescente apresenta baixa autoestima e recusa-se a ler em voz alta. Como integrar?',
        choices: [
          { text: 'Apenas encaminhar para psicólogo', outcome: 'partial', explanation: 'O trabalho deve ser integrado com a intervenção pedagógica.' },
          { text: 'Trabalho integrado: leitora + autoestima + mediação escolar', outcome: 'correct', explanation: 'A abordagem integrada é essencial para resultados efetivos.' },
          { text: 'Focar apenas na parte acadêmica', outcome: 'incorrect', explanation: 'Ignorar o componente emocional pode prejudicar a adesão ao tratamento.' }
        ] },
    ],
    quiz: [
      { question: 'Qual o principal indicador de dislexia?', options: ['QI baixo', 'Dificuldade de decoding com compreensão oral preservada', 'Problemas de visão', 'Falta de motivação'], correct: 1 },
      { question: 'A intervenção fônica é eficaz para dislexia?', options: ['Sim, é o padrão-ouro', 'Não há evidências', 'Apenas para crianças pequenas', 'Apenas com medicamento'], correct: 0 },
      { question: 'Repetência é indicada para dislexia?', options: ['Sim, sempre', 'Nunca', 'Apenas no ensino fundamental', 'Depende da escola'], correct: 1 },
    ]
  },
  {
    id: 3, title: 'TEA Nível 1 - Transição Escolar', icon: 'psychology', color: 'teal',
    description: 'Criança TEA Nível 1 em processo de transição para educação regular',
    difficulty: 3,
    steps: [
      { question: 'Preparação da escola', scenario: 'Uma criança de 7 anos com TEA Nível 1 será matriculada em escola regular. O que você faz?',
        choices: [
          { text: 'Enviar relatório e aguardar', outcome: 'incorrect', explanation: 'A escola precisa de orientação prática e acompanhamento.' },
          { text: 'Reunião com equipe pedagógica + formação sobre TEA', outcome: 'correct', explanation: 'A sensibilização e formação da equipe são essenciais.' },
          { text: 'Exigir sala de recursos exclusiva', outcome: 'partial', explanation: 'A inclusão depende mais da adaptação do ambiente regular.' }
        ] },
      { question: 'Plano Educacional Individualizado', scenario: 'A escola pede o PEI. Quais elementos são essenciais?',
        choices: [
          { text: 'Metas acadêmicas apenas', outcome: 'incorrect', explanation: 'O PEI deve contemplar habilidades sociais, comunicação e autorregulação.' },
          { text: 'Metas acadêmicas + sociais + adaptações + estratégia de crise', outcome: 'correct', explanation: 'Um PEI completo inclui múltiplas dimensões e estratégias práticas.' },
          { text: 'Cópia de outro PEI', outcome: 'incorrect', explanation: 'Cada criança TEA é única. O PEI deve ser individualizado.' }
        ] },
      { question: 'Gestão de comportamento', scenario: 'A criança teve crise sensorial no intervalo. Como orientar?',
        choices: [
          { text: 'Isolá-la até se acalmar', outcome: 'incorrect', explanation: 'O isolamento pode aumentar a ansiedade.' },
          { text: 'Espaço de regulação sensorial + rotina visual', outcome: 'correct', explanation: 'Recursos visuais e espaço calmo ajudam a se autorregular.' },
          { text: 'Retirar da escola temporariamente', outcome: 'partial', explanation: 'A ausência prolongada dificulta a adaptação.' }
        ] },
      { question: 'Relação família-escola', scenario: 'A mãe quer acompanhar aula todos os dias. Como mediar?',
        choices: [
          { text: 'Permanência na sala', outcome: 'incorrect', explanation: 'Pode gerar dependência e dificultar socialização.' },
          { text: 'Protocolo de comunicação + visitas planejadas', outcome: 'correct', explanation: 'Comunicação estruturada é mais eficaz e sustentável.' },
          { text: 'Proibir contato', outcome: 'incorrect', explanation: 'A parceria família-escola é fundamental.' }
        ] },
    ],
    quiz: [
      { question: 'O que é PEI?', options: ['Plano Educacional Individualizado', 'Programa Especial de Inclusão', 'Protocolo de Ensino Inclusivo', 'Plano de Estudos Integrado'], correct: 0 },
      { question: 'Principal desafio na inclusão TEA?', options: ['Falta de vagas', 'Sensibilização da equipe escolar', 'Custo do transporte', 'Material didático'], correct: 1 },
      { question: 'Crise sensorial: o que fazer?', options: ['Isolar', 'Espaço seguro e estratégias de regulação', 'Chamar pais', 'Ignorar'], correct: 1 },
    ]
  },
  {
    id: 4, title: 'TDAH e Baixo Rendimento', icon: 'flash_on', color: 'amber',
    description: 'Aluno de 9 anos com TDAH apresentando baixo rendimento',
    difficulty: 2,
    steps: [
      { question: 'Avaliação do rendimento', scenario: 'O aluno sabe o conteúdo individualmente, mas tem notas baixas. O que isso sugere?',
        choices: [
          { text: 'Deficiência intelectual', outcome: 'incorrect', explanation: 'Ele demonstra conhecimento individualmente, então não é limitação cognitiva.' },
          { text: 'Baixo rendimento é consequência do TDAH', outcome: 'correct', explanation: 'O TDAH impacta organização, persistência e atenção sustentada.' },
          { text: 'Falta de motivação', outcome: 'partial', explanation: 'O problema central é neurológico, não apenas motivacional.' }
        ] },
      { question: 'Adaptações escolares', scenario: 'Qual conjunto de adaptações você recomenda?',
        choices: [
          { text: 'Apenas mais tempo nas provas', outcome: 'partial', explanation: 'Útil, mas insuficiente. Adaptações devem ser multifacetadas.' },
          { text: 'Tempo extra + sala separada + instruções passo a passo + breaks', outcome: 'correct', explanation: 'Adaptações multifacetadas são mais eficazes para TDAH.' },
          { text: 'Transferência para escola especial', outcome: 'incorrect', explanation: 'Alunos com TDAH podem ser incluídos em escolas regulares.' }
        ] },
      { question: 'Medicação e escola', scenario: 'A escola reluta em aceitar a medicação do aluno. Como orientar?',
        choices: [
          { text: 'A escola não deve se envolver', outcome: 'incorrect', explanation: 'Ela deve estar ciente dos efeitos e colaborar.' },
          { text: 'Orientar sobre efeitos + rotina de observação', outcome: 'correct', explanation: 'A colaboração família-escola sobre medicação é importante.' },
          { text: 'Exigir que professores leiam o laudo', outcome: 'partial', explanation: 'Sensibilização é mais eficaz que imposição.' }
        ] },
      { question: 'Habilidades executivas', scenario: 'O aluno tem dificuldade com organização. Qual intervenção?',
        choices: [
          { text: 'Punir por não entregar tarefas', outcome: 'incorrect', explanation: 'Punições não resolvem dificuldades executivas.' },
          { text: 'Ensinar estratégias com apoio visual e rotinas', outcome: 'correct', explanation: 'Estratégias ensinadas sistematicamente com suporte visual são eficazes.' },
          { text: 'Dispensar de entregar tarefas', outcome: 'incorrect', explanation: 'Eximir completamente pode impedir o desenvolvimento de habilidades.' }
        ] },
    ],
    quiz: [
      { question: 'O TDAH afeta apenas a atenção?', options: ['Sim', 'Não, também funções executivas e autorregulação', 'Não afeta rendimento', 'Apenas em crianças'], correct: 1 },
      { question: 'Adaptações para TDAH?', options: ['Sim, multifacetadas', 'Não, adaptação à escola', 'Apenas nas provas', 'Só com medicação'], correct: 0 },
      { question: 'Dificuldades executivas: melhor abordagem?', options: ['Punição', 'Ensino explícito de estratégias', 'Ignorar', 'Transferir'], correct: 1 },
    ]
  },
  {
    id: 5, title: 'Dificuldades Matemáticas', icon: 'calculate', color: 'emerald',
    description: 'Criança de 8 anos com dificuldades significativas em matemática',
    difficulty: 2,
    steps: [
      { question: 'Avaliação do perfil', scenario: 'Criança de 8 anos tem dificuldade com cálculos, mas lê bem. O que investiga?',
        choices: [
          { text: 'Habilidades de linguagem', outcome: 'incorrect', explanation: 'A linguagem está preservada. O foco deve ser nas habilidades numéricas.' },
          { text: 'Raciocínio lógico-matemático e consciência numérica', outcome: 'correct', explanation: 'A investigação deve focar habilidades matemáticas específicas.' },
          { text: 'Motivação para a disciplina', outcome: 'partial', explanation: 'Primeiro é necessário entender a dificuldade técnica.' }
        ] },
      { question: 'Diagnóstico diferencial', scenario: 'Confunde operações, dificuldade com tabuada e valor posicional. Qual hipótese?',
        choices: [
          { text: 'Discalculia', outcome: 'correct', explanation: 'Dificuldades com conceitos numéricos básicos e valor posicional são indicadores.' },
          { text: 'Deficiência intelectual', outcome: 'incorrect', explanation: 'A criança lê bem, indicando déficit específico numérico.' },
          { text: 'Falta de prática em casa', outcome: 'partial', explanation: 'O padrão sugere condição neuropsicológica específica.' }
        ] },
      { question: 'Intervenção', scenario: 'Com diagnóstico de discalculia, qual abordagem?',
        choices: [
          { text: 'Repetição mecânica de cálculos', outcome: 'incorrect', explanation: 'Repetição sem compreensão não resolve.' },
          { text: 'Material manipulativo + representação visual', outcome: 'correct', explanation: 'A abordagem concreto-visual é fundamental para discalculia.' },
          { text: 'Apenas uso de calculadora', outcome: 'incorrect', explanation: 'Não substitui o ensino de conceitos numéricos.' }
        ] },
      { question: 'Transversalidade', scenario: 'Tem dificuldade com tempo e dinheiro também. Como integrar?',
        choices: [
          { text: 'Tratar apenas matemática formal', outcome: 'incorrect', explanation: 'Noções de tempo e dinheiro são essenciais na vida funcional.' },
          { text: 'Incluir vida funcional no plano', outcome: 'correct', explanation: 'A intervenção deve contemplar habilidades matemáticas funcionais.' },
          { text: 'Deixar para a escola', outcome: 'partial', explanation: 'A intervenção clínica deve antecipar e complementar.' }
        ] },
    ],
    quiz: [
      { question: 'O que é discalculia?', options: ['Dificuldade geral', 'Dificuldade específica com números', 'Falta de motivação', 'Problema de visão'], correct: 1 },
      { question: 'Material indicado para discalculia?', options: ['Apostila', 'Material manipulativo e concreto', 'Calculadora', 'Videoaulas'], correct: 1 },
      { question: 'Discalculia afeta apenas a escola?', options: ['Sim', 'Não, também vida funcional', 'Apenas no médio', 'Apenas em TEA'], correct: 1 },
    ]
  },
  {
    id: 6, title: 'Comportamento Opositor', icon: 'gavel', color: 'red',
    description: 'Adolescente de 14 anos com padrão opositor e desafiador',
    difficulty: 3,
    steps: [
      { question: 'Abordagem inicial', scenario: 'Adolescente trazido por desobediência crônica, responde com grosseria. Como inicia?',
        choices: [
          { text: 'Entrevistar apenas os pais', outcome: 'partial', explanation: 'É essencial ouvir o adolescente para entender seu lado.' },
          { text: 'Entrevista individual + entrevista familiar', outcome: 'correct', explanation: 'Entender contexto familiar e perspectiva do adolescente é fundamental.' },
          { text: 'Testes de personalidade imediatamente', outcome: 'incorrect', explanation: 'A entrevista clínica deve preceder a avaliação formal.' }
        ] },
      { question: 'Investigação', scenario: 'O adolescente revela divórcio dos pais há 6 meses. Qual hipótese?',
        choices: [
          { text: 'Transtorno Opositor Desafiador', outcome: 'partial', explanation: 'É necessário avaliar se é reação ao estresse ou padrão persistente.' },
          { text: 'Reação adaptativa ao estresse do divórcio', outcome: 'correct', explanation: 'O timing coincide com a mudança familiar.' },
          { text: 'Transtorno de Conduta', outcome: 'incorrect', explanation: 'Não há comportamentos antissociais graves.' }
        ] },
      { question: 'Plano de intervenção', scenario: 'Qual plano monta considerando o contexto familiar?',
        choices: [
          { text: 'Terapia individual focada em habilidades sociais', outcome: 'partial', explanation: 'Sem trabalhar a dinâmica familiar, os resultados serão limitados.' },
          { text: 'Intervenção familiar + mediação + encaminhamento escolar', outcome: 'correct', explanation: 'A abordagem sistêmica é a mais eficaz.' },
          { text: 'Medicação para controle de impulsividade', outcome: 'incorrect', explanation: 'Não há indicação sem avaliação de transtorno concomitante.' }
        ] },
      { question: 'Mediação escolar', scenario: 'O adolescente reage com agressividade verbal a provocações. Como orientar?',
        choices: [
          { text: 'Suspensão imediata', outcome: 'incorrect', explanation: 'Punição sem compreensão pode aumentar a revolta.' },
          { text: 'Mediação + estratégias de regulação + acompanhamento', outcome: 'correct', explanation: 'Mediação combinada com regulação emocional é mais eficaz.' },
          { text: 'Ignorar até amadurecer', outcome: 'incorrect', explanation: 'Pode fortalecer o padrão e prejudicar relacionamentos.' }
        ] },
    ],
    quiz: [
      { question: 'TOD é diferente de rebeldia?', options: ['Sim, padrão persistente e grave', 'Não, é a mesma coisa', 'Apenas se durar 1 mês', 'Apenas com agressão física'], correct: 0 },
      { question: 'Fator mais relevante?', options: ['QI', 'Contexto familiar e evento estressor', 'Tipo de escola', 'Número de amigos'], correct: 1 },
      { question: 'Abordagem sistêmica é indicada?', options: ['Sim, sempre em TOD', 'Não, apenas individual', 'Apenas para crianças', 'Apenas com medicação'], correct: 0 },
    ]
  },
  {
    id: 7, title: 'Deficiência Intelectual Leve', icon: 'accessibility_new', color: 'indigo',
    description: 'Criança de 10 anos com deficiência intelectual leve em escola regular',
    difficulty: 2,
    steps: [
      { question: 'Avaliação cognitiva', scenario: 'Criança com dificuldades em todas as áreas. QI entre 55-69. O que faz?',
        choices: [
          { text: 'Encaminhar para escola especial', outcome: 'incorrect', explanation: 'DI leve não é indicativa de exclusão da escola regular.' },
          { text: 'Elaborar plano de adequação curricular', outcome: 'correct', explanation: 'O currículo deve ser adaptado às capacidades da criança.' },
          { text: 'Repetir até amadurecer', outcome: 'incorrect', explanation: 'A repetição não aumenta o nível cognitivo.' }
        ] },
      { question: 'Metas realistas', scenario: 'Quais metas são adequadas?',
        choices: [
          { text: 'Mesmas metas com mais tempo', outcome: 'incorrect', explanation: 'Expectativas inadequadas geram frustração.' },
          { text: 'Metas em habilidades funcionais e vida independente', outcome: 'correct', explanation: 'Habilidades funcionais e preparação para vida adulta são prioridade.' },
          { text: 'Apenas atividades recreativas', outcome: 'incorrect', explanation: 'Crianças com DI leve podem ter acesso a currículo adaptado.' }
        ] },
      { question: 'Inclusão social', scenario: 'A criança é excluída nas brincadeiras. Como promover socialização?',
        choices: [
          { text: 'Forçar interações', outcome: 'incorrect', explanation: 'Pode causar rejeição e trauma.' },
          { text: 'Atividades cooperativas + ensino de habilidades sociais', outcome: 'correct', explanation: 'Estruturas cooperativas e ensino explícito são eficazes.' },
          { text: 'Sala separada', outcome: 'incorrect', explanation: 'Isolamento prejudica socialização.' }
        ] },
      { question: 'Transição para vida adulta', scenario: 'Como começar a planejar o futuro?',
        choices: [
          { text: 'Esperar terminar fundamental', outcome: 'incorrect', explanation: 'A transição deve ser planejada gradualmente desde cedo.' },
          { text: 'Planejamento de transição precoce', outcome: 'correct', explanation: 'Planejamento precoce inclui exploração vocacional e habilidades de vida.' },
          { text: 'Depois dos 18 anos', outcome: 'incorrect', explanation: 'Quanto mais precoce, melhor a preparação.' }
        ] },
    ],
    quiz: [
      { question: 'QI 55-69 indica?', options: ['DI leve', 'DI moderada', 'Limbo de normalidade', 'Atraso de desenvolvimento'], correct: 0 },
      { question: 'DI leve em escola regular?', options: ['Sim, com adaptações', 'Não, escolas especiais', 'Apenas fundamental', 'QI acima de 60'], correct: 0 },
      { question: 'Prioridade para DI leve?', options: ['Conteúdo avançado', 'Habilidades funcionais', 'Apenas recreação', 'Apenas leitura'], correct: 1 },
    ]
  },
  {
    id: 8, title: 'Transtorno Coordenação Motora', icon: 'directions_run', color: 'cyan',
    description: 'Criança de 7 anos com dificuldades de coordenação motora (DCM)',
    difficulty: 2,
    steps: [
      { question: 'Identificação', scenario: 'Criança cai frequentemente, dificuldade com botões, evita atividades físicas. Pais dizem que é preguiçosa. O que pensa?',
        choices: [
          { text: 'Falta de disciplina', outcome: 'incorrect', explanation: 'A dificuldade motora não é preguiça. É condição neurológica.' },
          { text: 'Sinais de DCM', outcome: 'correct', explanation: 'Os sinais são compatíveis com DCM. Avaliação formal é necessária.' },
          { text: 'Falta de atividade física', outcome: 'partial', explanation: 'O problema é neurológico, não apenas ambiental.' }
        ] },
      { question: 'Impacto escolar', scenario: 'Dificuldade com escrita manual e é lenta nas atividades. Como auxiliar?',
        choices: [
          { text: 'Eximir de escrita', outcome: 'incorrect', explanation: 'Devem ser oferecidas adaptações, não eliminação.' },
          { text: 'Tecnologia auxiliar + tempo extra + atividades alternativas', outcome: 'correct', explanation: 'Adaptações que mantêm acesso ao currículo são ideais.' },
          { text: 'Repetir ano até melhorar', outcome: 'incorrect', explanation: 'DCM não se resolve com repetição.' }
        ] },
      { question: 'Intervenção terapêutica', scenario: 'Qual abordagem recomenda?',
        choices: [
          { text: 'Apenas fisioterapia', outcome: 'partial', explanation: 'O trabalho multidisciplinar é mais eficaz.' },
          { text: 'Terapia ocupacional + psicomotricidade + atividade física adaptada', outcome: 'correct', explanation: 'Abordagem multidisciplinar é o padrão-ouro para DCM.' },
          { text: 'Não precisa de intervenção', outcome: 'incorrect', explanation: 'DCM não se resolve espontaneamente.' }
        ] },
      { question: 'Impacto emocional', scenario: 'A criança diz que é burra. Como trabalhar?',
        choices: [
          { text: 'Dizer que não é burra', outcome: 'partial', explanation: 'É preciso trabalhar a autoestima de forma estruturada.' },
          { text: 'Psicoterapia + autoestima + atividades de sucesso', outcome: 'correct', explanation: 'Intervenção emocional com experiências de sucesso é essencial.' },
          { text: 'Ignorar, é fase', outcome: 'incorrect', explanation: 'Autoestima negativa pode consolidar-se.' }
        ] },
    ],
    quiz: [
      { question: 'DCM é preguiça?', options: ['Não, condição neurológica', 'Sim, falta motivação', 'Apenas em obesos', 'Apenas em meninos'], correct: 0 },
      { question: 'Profissional essencial?', options: ['Pediatra', 'Terapeuta ocupacional', 'Professor', 'Psicólogo'], correct: 1 },
      { question: 'Impacto emocional deve ser trabalhado?', options: ['Sim, sempre', 'Não, irrelevante', 'Apenas com agressão', 'Apenas adolescência'], correct: 0 },
    ]
  }
];

@Component({
  selector: 'app-academia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-in">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Academia iPsy</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Escolha sua Aventura - Casos Clinicos Interativos</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-center px-4 py-2 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800">
            <p class="text-[10px] font-bold text-slate-500 uppercase">Casos Resolvidos</p>
            <p class="text-2xl font-black text-primary">{{ completedCount() }}/{{ totalCases }}</p>
          </div>
          <div class="text-center px-4 py-2 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800">
            <p class="text-[10px] font-bold text-slate-500 uppercase">Pontuacao Total</p>
            <p class="text-2xl font-black text-emerald-600">{{ totalScore() }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (c of cases; track c.id) {
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden hover:ring-primary/50 hover:-translate-y-1 transition-all">
            <div class="h-28 flex items-center justify-center" [class]="getColorBg(c.color)">
              <span class="material-icons text-4xl opacity-60">{{ c.icon }}</span>
            </div>
            <div class="p-4">
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-bold text-slate-900 dark:text-white text-sm leading-tight">{{ c.title }}</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0" [class]="getColorStyle(c.color)">
                  Caso {{ c.id }}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">{{ c.description }}</p>
              <div class="flex items-center gap-2 mb-3">
                @for (star of [1,2,3]; track star) {
                  <span class="material-icons text-[14px]"
                    [class]="star <= c.difficulty ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'">star</span>
                }
                <span class="text-[10px] text-slate-500 ml-1">{{ c.steps.length }} decisoes</span>
                <span class="text-[10px] text-slate-500"> {{ c.quiz.length }} questoes</span>
              </div>
              @if (isCaseCompleted(c.id)) {
                <div class="flex items-center gap-2 mb-3 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <span class="material-icons text-emerald-600 text-sm">check_circle</span>
                  <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400">Pontuacao: {{ getCaseScore(c.id) }}</span>
                </div>
              }
              <button class="w-full py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold transition-all active:scale-95"
                (click)="startCase(c)">
                <span class="material-icons text-[14px] align-middle mr-1">{{ isCaseCompleted(c.id) ? 'replay' : 'play_arrow' }}</span>
                {{ isCaseCompleted(c.id) ? 'Refazer' : 'Iniciar' }}
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    @if (showCaseModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="closeCase()">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl mx-4 ring-1 ring-slate-200 dark:ring-slate-800 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          @if (!caseFinished()) {
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">{{ activeCase()?.title }}</h3>
                <p class="text-xs text-slate-500">Decisao {{ currentStep() + 1 }}/{{ activeCase()?.steps?.length }}</p>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-center">
                  <p class="text-[10px] font-bold text-slate-500 uppercase">Pontos</p>
                  <p class="text-lg font-black text-emerald-600">{{ caseScore() }}</p>
                </div>
                <button class="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" (click)="closeCase()">
                  <span class="material-icons">close</span>
                </button>
              </div>
            </div>
            <div class="p-6">
              @if (activeCase()?.steps && currentStep() < (activeCase()?.steps?.length || 0)) {
                <div class="mb-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="material-icons text-primary text-sm">psychology</span>
                    <h4 class="font-bold text-slate-900 dark:text-white text-sm">{{ activeCase()!.steps[currentStep()].question }}</h4>
                  </div>
                  <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
                    <p class="text-sm text-slate-700 dark:text-slate-300">{{ activeCase()!.steps[currentStep()].scenario }}</p>
                  </div>
                </div>
                @if (!showExplanation()) {
                  <div class="space-y-3">
                    @for (choice of activeCase()!.steps[currentStep()].choices; track $index) {
                      <button class="w-full text-left p-4 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-primary/50 hover:bg-primary/5 transition-all"
                        (click)="makeChoice($index)">
                        <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ choice.text }}</p>
                      </button>
                    }
                  </div>
                } @else {
                  <div class="p-4 rounded-2xl" [class]="getExplanationBg(lastOutcome())">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="material-icons" [class]="getExplanationIconClass(lastOutcome())">{{ getExplanationIcon(lastOutcome()) }}</span>
                      <h4 class="font-bold text-sm" [class]="getExplanationTextClass(lastOutcome())">{{ getExplanationTitle(lastOutcome()) }}</h4>
                    </div>
                    <p class="text-sm text-slate-700 dark:text-slate-300">{{ lastExplanation() }}</p>
                    <button class="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold transition-all"
                      (click)="nextStep()">
                      {{ currentStep() < (activeCase()?.steps?.length || 0) - 1 ? 'Proxima Decisao' : 'Ver Resultado' }}
                    </button>
                  </div>
                }
              }
              <div class="mt-4 flex gap-1">
                @for (step of activeCase()?.steps || []; track $index) {
                  <div class="h-1.5 flex-1 rounded-full" [class]="$index < currentStep() ? 'bg-primary' : ($index === currentStep() ? 'bg-primary/50' : 'bg-slate-200 dark:bg-slate-700')"></div>
                }
              </div>
            </div>
          } @else {
            <div class="p-8">
              <div class="text-center mb-6">
                <div class="size-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="material-icons text-emerald-600 dark:text-emerald-400 text-4xl">emoji_events</span>
                </div>
                <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2">Caso Concluido!</h3>
                <p class="text-slate-500 dark:text-slate-400">{{ activeCase()?.title }}</p>
              </div>
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
                  <p class="text-[10px] font-bold text-slate-500 uppercase">Pontuacao</p>
                  <p class="text-3xl font-black text-emerald-600">{{ caseScore() }}</p>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
                  <p class="text-[10px] font-bold text-slate-500 uppercase">Decisoes Corretas</p>
                  <p class="text-3xl font-black text-primary">{{ correctDecisions() }}/{{ activeCase()?.steps?.length }}</p>
                </div>
              </div>
              <div class="mb-6">
                <h4 class="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span class="material-icons text-primary text-sm">quiz</span> Quiz Final
                </h4>
                @for (q of activeCase()?.quiz || []; track q.question; let qi = $index) {
                  <div class="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p class="text-sm font-bold text-slate-900 dark:text-white mb-2">{{ qi + 1 }}. {{ q.question }}</p>
                    <div class="space-y-2">
                      @for (opt of q.options; track opt; let ai = $index) {
                        <button class="w-full text-left p-3 rounded-xl text-xs transition-all"
                          [class]="getQuizAnswerClass(qi, ai)"
                          (click)="answerQuiz(qi, ai)">
                          {{ opt }}
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
              <div class="flex gap-3 justify-center">
                <button class="px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 transition-all"
                  (click)="startCase(activeCase()!)">
                  Refazer Caso
                </button>
                <button class="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl font-bold text-sm transition-all"
                  (click)="closeCase()">
                  Voltar
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class AcademiaComponent implements OnInit {
  cases = CASES_DATA;
  totalCases = CASES_DATA.length;

  showCaseModal = signal(false);
  activeCase = signal<ClinicalCase | null>(null);
  currentStep = signal(0);
  caseScore = signal(0);
  correctDecisions = signal(0);
  caseFinished = signal(false);
  showExplanation = signal(false);
  lastOutcome = signal<'correct' | 'partial' | 'incorrect'>('correct');
  lastExplanation = signal('');

  scores: Record<number, number> = {};
  completed: Record<number, boolean> = {};
  quizAnswers: Record<number, number> = {};

  completedCount = computed(() => Object.values(this.completed).filter(Boolean).length);
  totalScore = computed(() => Object.values(this.scores).reduce((a, b) => a + b, 0));

  ngOnInit() {
    this.scores = JSON.parse(localStorage.getItem('academia_scores') || '{}');
    this.completed = JSON.parse(localStorage.getItem('academia_completed') || '{}');
  }

  isCaseCompleted(id: number): boolean { return !!this.completed[id]; }
  getCaseScore(id: number): number { return this.scores[id] || 0; }

  getColorBg(color: string): string {
    const bgs: Record<string, string> = {
      blue: 'bg-blue-100 dark:bg-blue-900/30', purple: 'bg-purple-100 dark:bg-purple-900/30',
      teal: 'bg-teal-100 dark:bg-teal-900/30', amber: 'bg-amber-100 dark:bg-amber-900/30',
      emerald: 'bg-emerald-100 dark:bg-emerald-900/30', red: 'bg-red-100 dark:bg-red-900/30',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30', cyan: 'bg-cyan-100 dark:bg-cyan-900/30',
    };
    return bgs[color] || 'bg-slate-100 dark:bg-slate-800';
  }

  getColorStyle(color: string): string {
    const s: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    };
    return s[color] || 'bg-slate-100 text-slate-700';
  }

  startCase(c: ClinicalCase) {
    this.activeCase.set(c);
    this.currentStep.set(0);
    this.caseScore.set(0);
    this.correctDecisions.set(0);
    this.caseFinished.set(false);
    this.showExplanation.set(false);
    this.quizAnswers = {};
    this.showCaseModal.set(true);
  }

  makeChoice(index: number) {
    const c = this.activeCase();
    if (!c) return;
    const choice = c.steps[this.currentStep()].choices[index];
    this.lastOutcome.set(choice.outcome);
    this.lastExplanation.set(choice.explanation);
    if (choice.outcome === 'correct') {
      this.caseScore.update(s => s + 25);
      this.correctDecisions.update(s => s + 1);
    } else if (choice.outcome === 'partial') {
      this.caseScore.update(s => s + 10);
    }
    this.showExplanation.set(true);
  }

  nextStep() {
    const c = this.activeCase();
    if (!c) return;
    this.showExplanation.set(false);
    if (this.currentStep() < c.steps.length - 1) {
      this.currentStep.update(s => s + 1);
    } else {
      this.caseFinished.set(true);
      this.saveProgress();
    }
  }

  saveProgress() {
    const c = this.activeCase();
    if (!c) return;
    this.scores[c.id] = this.caseScore();
    this.completed[c.id] = true;
    localStorage.setItem('academia_scores', JSON.stringify(this.scores));
    localStorage.setItem('academia_completed', JSON.stringify(this.completed));
  }

  answerQuiz(qIndex: number, aIndex: number) {
    this.quizAnswers[qIndex] = aIndex;
  }

  getQuizAnswerClass(qIndex: number, aIndex: number): string {
    const q = this.activeCase()?.quiz[qIndex];
    if (!q) return 'bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700';
    const answered = this.quizAnswers[qIndex] !== undefined;
    if (!answered) return 'bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-primary/50 cursor-pointer';
    if (aIndex === q.correct) return 'bg-emerald-100 dark:bg-emerald-900/30 ring-1 ring-emerald-300 text-emerald-700 dark:text-emerald-400 font-bold';
    if (aIndex === this.quizAnswers[qIndex]) return 'bg-red-100 dark:bg-red-900/30 ring-1 ring-red-300 text-red-700 dark:text-red-400';
    return 'bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 opacity-50';
  }

  getExplanationBg(outcome: string): string {
    return outcome === 'correct' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
           outcome === 'partial' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20';
  }
  getExplanationIcon(outcome: string): string {
    return outcome === 'correct' ? 'check_circle' : outcome === 'partial' ? 'info' : 'cancel';
  }
  getExplanationIconClass(outcome: string): string {
    return outcome === 'correct' ? 'text-emerald-600' : outcome === 'partial' ? 'text-amber-600' : 'text-red-600';
  }
  getExplanationTitle(outcome: string): string {
    return outcome === 'correct' ? 'Excelente escolha!' : outcome === 'partial' ? 'Parcialmente correto' : 'Resposta incorreta';
  }
  getExplanationTextClass(outcome: string): string {
    return outcome === 'correct' ? 'text-emerald-700 dark:text-emerald-400' :
           outcome === 'partial' ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400';
  }

  closeCase() {
    this.showCaseModal.set(false);
    this.activeCase.set(null);
  }
}
