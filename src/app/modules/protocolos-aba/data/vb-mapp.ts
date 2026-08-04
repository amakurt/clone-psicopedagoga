export interface VBMAPPMilestone {
  id: string;
  code: string;
  name: string;
  description: string;
  ageRange: string;
}

export interface VBMAPPDomain {
  id: string;
  code: string;
  name: string;
  color: string;
  milestones: VBMAPPMilestone[];
}

export const VB_MAPP_DOMAINS: VBMAPPDomain[] = [
  {
    id: 'mand',
    code: 'M',
    name: 'Mand (Solicitação)',
    color: '#EF4444',
    milestones: [
      { id: 'm01', code: 'M1', name: 'Reforço funcional', description: 'Obtém reforço funcional por meios não-verbais', ageRange: '0-18 meses' },
      { id: 'm02', code: 'M2', name: 'Solicita com gesto', description: 'Solicita itens/atividades com gestos', ageRange: '0-18 meses' },
      { id: 'm03', code: 'M3', name: 'Solicita com apontar', description: 'Solicita apontando para itens/atividades desejados', ageRange: '12-24 meses' },
      { id: 'm04', code: 'M4', name: 'Mand com palavra', description: 'Mand com palavra isolada para itens/atividades', ageRange: '12-24 meses' },
      { id: 'm05', code: 'M5', name: 'Mand com frase', description: 'Mand com frase de 2+ palavras', ageRange: '24-36 meses' },
      { id: 'm06', code: 'M6', name: 'Solicita ausência', description: 'Manda para que algo seja removido', ageRange: '24-36 meses' },
      { id: 'm07', code: 'M7', name: 'Responde a perguntas', description: 'Manda para obter informação (pergunta)', ageRange: '36-48 meses' },
      { id: 'm08', code: 'M8', name: 'Mand espontâneo', description: 'Mand espontâneo sem dica', ageRange: '24-36 meses' },
      { id: 'm09', code: 'M9', name: 'Mand para 3+ pessoas', description: 'Manda para pelo menos 3 pessoas diferentes', ageRange: '36-48 meses' },
      { id: 'm10', code: 'M10', name: 'Mand variado', description: 'Usa vocabulário variado em mands', ageRange: '48-60 meses' },
      { id: 'm11', code: 'M11', name: 'Mand com frase completa', description: 'Manda com frases completas de 3+ palavras', ageRange: '48-60 meses' },
      { id: 'm12', code: 'M12', name: 'Mand social', description: 'Manda por atenção e interação social', ageRange: '36-48 meses' },
      { id: 'm13', code: 'M13', name: 'Mand para obter ajuda', description: 'Manda para obter ajuda quando precisa', ageRange: '36-48 meses' },
      { id: 'm14', code: 'M14', name: 'Mand para mostrar', description: 'Manda para mostrar algo a outra pessoa', ageRange: '48-60 meses' },
      { id: 'm15', code: 'M15', name: 'Mand negação', description: 'Manda expressando negação ("não quero")', ageRange: '24-36 meses' },
    ]
  },
  {
    id: 'echo',
    code: 'E',
    name: 'Echoic (Ecolalia)',
    color: '#F59E0B',
    milestones: [
      { id: 'e01', code: 'E1', name: 'Eco de sons', description: 'Ecoa sons vocais não verbais', ageRange: '0-12 meses' },
      { id: 'e02', code: 'E2', name: 'Eco de sílabas', description: 'Ecoa sílabas (ma, pa, ba)', ageRange: '12-24 meses' },
      { id: 'e03', code: 'E3', name: 'Eco de palavras', description: 'Ecoa palavras isoladas', ageRange: '12-24 meses' },
      { id: 'e04', code: 'E4', name: 'Eco de 2 palavras', description: 'Ecoa frases de 2 palavras', ageRange: '24-36 meses' },
      { id: 'e05', code: 'E5', name: 'Eco de frases', description: 'Ecoa frases de 3+ palavras', ageRange: '36-48 meses' },
      { id: 'e06', code: 'E6', name: 'Eco de frases longas', description: 'Ecoa frases de 4+ palavras', ageRange: '48-60 meses' },
      { id: 'e07', code: 'E7', name: 'Eco de perguntas', description: 'Ecoa perguntas com entonação adequada', ageRange: '36-48 meses' },
      { id: 'e08', code: 'E8', name: 'Eco de números', description: 'Ecoa números de 1 a 10', ageRange: '24-36 meses' },
      { id: 'e09', code: 'E9', name: 'Eco de cores', description: 'Ecoa nomes de cores', ageRange: '36-48 meses' },
      { id: 'e10', code: 'E10', name: 'Eco com variação', description: 'Ecoa com variação de entonação', ageRange: '48-60 meses' },
      { id: 'e11', code: 'E11', name: 'Eco de letras', description: 'Ecoa letras do alfabeto', ageRange: '36-48 meses' },
      { id: 'e12', code: 'E12', name: 'Eco de sílabas complexas', description: 'Ecoa sílabas com consoantes complexas', ageRange: '24-36 meses' },
      { id: 'e13', code: 'E13', name: 'Eco de palavras longas', description: 'Ecoa palavras de 3+ sílabas', ageRange: '48-60 meses' },
      { id: 'e14', code: 'E14', name: 'Eco de canções', description: 'Ecoa trechos de canções', ageRange: '36-48 meses' },
      { id: 'e15', code: 'E15', name: 'Eco funcional', description: 'Usa eco para comunicar necessidade', ageRange: '24-36 meses' },
    ]
  },
  {
    id: 'tact',
    code: 'T',
    name: 'Tact (Naming)',
    color: '#3B82F6',
    milestones: [
      { id: 't01', code: 'T1', name: 'Tato de objetos', description: 'Tato de objetos comuns presentes', ageRange: '12-24 meses' },
      { id: 't02', code: 'T2', name: 'Tato de figuras', description: 'Tato de figuras de itens comuns', ageRange: '18-30 meses' },
      { id: 't03', code: 'T3', name: 'Tato de ações', description: 'Tato de ações representadas em figuras', ageRange: '24-36 meses' },
      { id: 't04', code: 'T4', name: 'Tato de cores', description: 'Tato de 5+ cores', ageRange: '30-42 meses' },
      { id: 't05', code: 'T5', name: 'Tato de formas', description: 'Tato de 3+ formas geométricas', ageRange: '30-42 meses' },
      { id: 't06', code: 'T6', name: 'Tato de quantidades', description: 'Tato de quantidades (1-5)', ageRange: '36-48 meses' },
      { id: 't07', code: 'T7', name: 'Tato de emoções', description: 'Tato de emoções em fotos/figuras', ageRange: '36-48 meses' },
      { id: 't08', code: 'T8', name: 'Tato de familiares', description: 'Tato de membros da família', ageRange: '18-30 meses' },
      { id: 't09', code: 'T9', name: 'Tato de animais', description: 'Tato de 10+ animais', ageRange: '24-36 meses' },
      { id: 't10', code: 'T10', name: 'Tato de alimentos', description: 'Tato de 10+ alimentos', ageRange: '24-36 meses' },
      { id: 't11', code: 'T11', name: 'Tato de partes do corpo', description: 'Tato de 10+ partes do corpo', ageRange: '18-30 meses' },
      { id: 't12', code: 'T12', name: 'Tato de vestuário', description: 'Tato de peças de vestuário', ageRange: '24-36 meses' },
      { id: 't13', code: 'T13', name: 'Tato de veículos', description: 'Tato de veículos comuns', ageRange: '24-36 meses' },
      { id: 't14', code: 'T14', name: 'Tato de profissões', description: 'Tato de profissões', ageRange: '36-48 meses' },
      { id: 't15', code: 'T15', name: 'Tato espontâneo', description: 'Tato espontâneo sem ser questionado', ageRange: '30-42 meses' },
    ]
  },
  {
    id: 'listener',
    code: 'L',
    name: 'Listener (Receptivo)',
    color: '#8B5CF6',
    milestones: [
      { id: 'l01', code: 'L1', name: 'Reage a voz', description: 'Reage à voz de cuidador', ageRange: '0-6 meses' },
      { id: 'l02', code: 'L2', name: 'Reage ao nome', description: 'Reage quando chamado pelo nome', ageRange: '6-12 meses' },
      { id: 'l03', code: 'L3', name: 'Segue objeto', description: 'Segue objeto em movimento com os olhos', ageRange: '0-6 meses' },
      { id: 'l04', code: 'L4', name: 'Aponta para corpo', description: 'Aponta para partes do corpo quando solicitado', ageRange: '12-24 meses' },
      { id: 'l05', code: 'L5', name: 'Toca objeto', description: 'Toca objeto nomeado', ageRange: '12-24 meses' },
      { id: 'l06', code: 'L6', name: 'Seleciona objeto', description: 'Seleciona objeto de entre 2 opções', ageRange: '12-24 meses' },
      { id: 'l07', code: 'L7', name: 'Seleciona de 3', description: 'Seleciona objeto de entre 3 opções', ageRange: '18-30 meses' },
      { id: 'l08', code: 'L8', name: 'Seleciona de 5', description: 'Seleciona objeto de entre 5 opções', ageRange: '24-36 meses' },
      { id: 'l09', code: 'L9', name: 'Seleciona de 10', description: 'Seleciona objeto de entre 10 opções', ageRange: '36-48 meses' },
      { id: 'l10', code: 'L10', name: 'Segue instruções de 1', description: 'Segue instruções de 1 passo', ageRange: '12-24 meses' },
      { id: 'l11', code: 'L11', name: 'Segue instruções de 2', description: 'Segue instruções de 2 passos', ageRange: '24-36 meses' },
      { id: 'l12', code: 'L12', name: 'Segue instruções de 3', description: 'Segue instruções de 3 passos', ageRange: '36-48 meses' },
      { id: 'l13', code: 'L13', name: 'Responde a "onde"', description: 'Responde a perguntas "onde está?"', ageRange: '24-36 meses' },
      { id: 'l14', code: 'L14', name: 'Responde a "quem"', description: 'Responde a perguntas "quem é?"', ageRange: '36-48 meses' },
      { id: 'l15', code: 'L15', name: 'Responde a "o quê"', description: 'Responde a perguntas "o quê?"', ageRange: '36-48 meses' },
    ]
  },
  {
    id: 'social',
    code: 'S',
    name: 'Social',
    color: '#EC4899',
    milestones: [
      { id: 's01', code: 'S1', name: 'Sorriso social', description: 'Sorri em resposta a interação social', ageRange: '0-6 meses' },
      { id: 's02', code: 'S2', name: 'Contato visual', description: 'Estabelece contato visual durante interação', ageRange: '0-12 meses' },
      { id: 's03', code: 'S3', name: 'Responding ao social', description: 'Responde a interação social de adultos', ageRange: '6-12 meses' },
      { id: 's04', code: 'S4', name: 'Joint attention', description: 'Partilha atenção com um adulto sobre um objeto', ageRange: '12-24 meses' },
      { id: 's05', code: 'S5', name: 'Resposta social', description: 'Responde a interação de pares', ageRange: '24-36 meses' },
      { id: 's06', code: 'S6', name: 'Inicia interação', description: 'Inicia interação social com pares', ageRange: '24-36 meses' },
      { id: 's07', code: 'S7', name: 'Brincadeira paralela', description: 'Engaja-se em brincadeira paralela', ageRange: '18-30 meses' },
      { id: 's08', code: 'S8', name: 'Brincadeira cooperativa', description: 'Brinca cooperativamente com um par', ageRange: '36-48 meses' },
      { id: 's09', code: 'S9', name: 'Turnos na brincadeira', description: 'Mantém turnos em brincadeiras', ageRange: '36-48 meses' },
      { id: 's10', code: 'S10', name: 'Imitação social', description: 'Imita comportamento social de pares', ageRange: '24-36 meses' },
      { id: 's11', code: 'S11', name: 'Respeita limites', description: 'Respeita limites físicos pessoais', ageRange: '36-48 meses' },
      { id: 's12', code: 'S12', name: 'Espera sua vez', description: 'Espera sua vez em atividades de grupo', ageRange: '36-48 meses' },
      { id: 's13', code: 'S13', name: 'Olha para quem fala', description: 'Olha para a pessoa que está falando', ageRange: '24-36 meses' },
      { id: 's14', code: 'S14', name: 'Sauda adequadamente', description: 'Sauda adequadamente (oi, tchau)', ageRange: '24-36 meses' },
      { id: 's15', code: 'S15', name: 'Interação em grupo', description: 'Participa de atividades em grupo', ageRange: '48-60 meses' },
    ]
  },
  {
    id: 'play',
    code: 'P',
    name: 'Play (Brincadeira)',
    color: '#06B6D4',
    milestones: [
      { id: 'p01', code: 'P1', name: 'Explora objetos', description: 'Explora objetos de forma sensorial', ageRange: '0-12 meses' },
      { id: 'p02', code: 'P2', name: 'Brinca com movimento', description: 'Brinca com brinquedos de movimento', ageRange: '6-18 meses' },
      { id: 'p03', code: 'P3', name: 'Brinca funcionalmente', description: 'Usa brinquedos de forma funcional', ageRange: '12-24 meses' },
      { id: 'p04', code: 'P4', name: 'Encaixa peças', description: 'Encaixa peças simples em tabuleiro', ageRange: '18-30 meses' },
      { id: 'p05', code: 'P5', name: 'Monta torre', description: 'Monta torre de 4+ blocos', ageRange: '18-30 meses' },
      { id: 'p06', code: 'P6', name: 'Quebra-cabeça simples', description: 'Monta quebra-cabeças de 3-4 peças', ageRange: '24-36 meses' },
      { id: 'p07', code: 'P7', name: 'Brincadeira simbólica', description: 'Brinca com brinquedos de forma simbólica (boneca dorme)', ageRange: '24-36 meses' },
      { id: 'p08', code: 'P8', name: 'Brincadeira de papéis', description: 'Engaja-se em brincadeiras de papéis (casinha)', ageRange: '36-48 meses' },
      { id: 'p09', code: 'P9', name: 'Brincadeira de regras', description: 'Brinca de jogos com regras simples', ageRange: '48-60 meses' },
      { id: 'p10', code: 'P10', name: 'Brincadeira imaginária', description: 'Cria cenários de brincadeira imaginária', ageRange: '36-48 meses' },
      { id: 'p11', code: 'P11', name: 'Constrói estruturas', description: 'Constrói estruturas com blocos de montar', ageRange: '24-36 meses' },
      { id: 'p12', code: 'P12', name: 'Brinca com areia', description: 'Brinca com areia ou massa de modelar', ageRange: '18-30 meses' },
      { id: 'p13', code: 'P13', name: 'Brinca na água', description: 'Brinca em atividades com água', ageRange: '12-24 meses' },
      { id: 'p14', code: 'P14', name: 'Desenha livremente', description: 'Desenha livremente com giz ou lápis', ageRange: '24-36 meses' },
      { id: 'p15', code: 'P15', name: 'Pinta figuras', description: 'Pinta figuras com apoio', ageRange: '36-48 meses' },
    ]
  },
  {
    id: 'lrffc',
    code: 'LRFFC',
    name: 'Linguagem Receptiva Avançada',
    color: '#10B981',
    milestones: [
      { id: 'lr01', code: 'LR1', name: 'Identifica por function', description: 'Identifica itens por sua função', ageRange: '36-48 meses' },
      { id: 'lr02', code: 'LR2', name: 'Identifica por categoria', description: 'Identifica itens por categoria', ageRange: '36-48 meses' },
      { id: 'lr03', code: 'LR3', name: 'Identifica por属性', description: 'Identifica itens por atributo (cor, forma, tamanho)', ageRange: '30-42 meses' },
      { id: 'lr04', code: 'LR4', name: 'Corresponde objeto-foto', description: 'Corresponde objeto real à sua foto', ageRange: '18-30 meses' },
      { id: 'lr05', code: 'LR5', name: 'Seleciona não-existente', description: 'Seleciona item não presente na imagem', ageRange: '36-48 meses' },
      { id: 'lr06', code: 'LR6', name: 'Identifica parte-todo', description: 'Identifica partes de um todo', ageRange: '36-48 meses' },
      { id: 'lr07', code: 'LR7', name: 'Diferencia mesma/diferente', description: 'Diferencia itens iguais e diferentes', ageRange: '30-42 meses' },
      { id: 'lr08', code: 'LR8', name: 'Responde a冷蔵', description: 'Responde a perguntas "onde você encontra?"', ageRange: '36-48 meses' },
      { id: 'lr09', code: 'LR9', name: 'Responde a function', description: 'Responde "para que serve?"', ageRange: '48-60 meses' },
      { id: 'lr10', code: 'LR10', name: 'Responde a category', description: 'Responde "que tipo de coisa é?"', ageRange: '48-60 meses' },
      { id: 'lr11', code: 'LR11', name: 'Responde a made of', description: 'Responde "do que é feito?"', ageRange: '48-60 meses' },
      { id: 'lr12', code: 'LR12', name: 'Responde a can be found', description: 'Responde "onde pode ser encontrado?"', ageRange: '48-60 meses' },
      { id: 'lr13', code: 'LR13', name: 'Identifica por som', description: 'Identifica itens por som', ageRange: '36-48 meses' },
      { id: 'lr14', code: 'LR14', name: 'Identifica por cheiro', description: 'Identifica itens por cheiro', ageRange: '36-48 meses' },
      { id: 'lr15', code: 'LR15', name: 'Compreende conceitos abstratos', description: 'Compreende conceitos de tempo e quantidades', ageRange: '48-60 meses' },
    ]
  }
];

export const VB_MAPP_SCORE_LABELS: Record<number, string> = {
  0: 'Não demonstrado',
  1: 'Em desenvolvimento',
  2: 'Adquirido',
  3: 'Nível avançado'
};

export const VB_MAPP_TOTAL_MILESTONES = VB_MAPP_DOMAINS.reduce((sum, d) => sum + d.milestones.length, 0);
