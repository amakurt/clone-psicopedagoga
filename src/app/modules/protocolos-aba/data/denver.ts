export interface DenverItem {
  id: string;
  code: string;
  name: string;
  description: string;
  typicalAge: string;
}

export interface DenverDomain {
  id: string;
  code: string;
  name: string;
  color: string;
  items: DenverItem[];
}

export const DENVER_DOMAINS: DenverDomain[] = [
  {
    id: 'personal_social',
    code: 'PS',
    name: 'Pessoal-Social',
    color: '#EC4899',
    items: [
      { id: 'ps01', code: 'PS01', name: 'Sorriso social', description: 'Sorri em resposta ao sorriso de outra pessoa', typicalAge: '0-2 meses' },
      { id: 'ps02', code: 'PS02', name: 'Olha para rosto', description: 'Olha para o rosto de quem está alimentando', typicalAge: '0-2 meses' },
      { id: 'ps03', code: 'PS03', name: 'Segura cabeça', description: 'Segura a cabeça quando está de bruços', typicalAge: '2-4 meses' },
      { id: 'ps04', code: 'PS04', name: 'Segue com olhos', description: 'Segue objetos em movimento com os olhos', typicalAge: '2-4 meses' },
      { id: 'ps05', code: 'PS05', name: 'Reconhece cuidadores', description: 'Reconhece pessoas familiares', typicalAge: '4-6 meses' },
      { id: 'ps06', code: 'PS06', name: 'Estende braços', description: 'Estende braços para ser pego', typicalAge: '4-6 meses' },
      { id: 'ps07', code: 'PS07', name: 'Joga objetos', description: 'Joga objetos propositalmente', typicalAge: '6-8 meses' },
      { id: 'ps08', code: 'PS08', name: 'Olha para objeto', description: 'Olha para objeto que alguém está apontando', typicalAge: '8-10 meses' },
      { id: 'ps09', code: 'PS09', name: 'Brinca de esconder', description: 'Brinca de cadê/achou (esconde o rosto)', typicalAge: '8-10 meses' },
      { id: 'ps10', code: 'PS10', name: 'Imita tarefas', description: 'Imita tarefas simples (lavar mãos)', typicalAge: '12-15 meses' },
      { id: 'ps11', code: 'PS11', name: 'Ajuda em vestir', description: 'Ajuda a vestir-se estendendo braços e pernas', typicalAge: '12-15 meses' },
      { id: 'ps12', code: 'PS12', name: 'Usa colher', description: 'Usa colher (embora possa derramar)', typicalAge: '15-18 meses' },
      { id: 'ps13', code: 'PS13', name: 'Lava mãos', description: 'Lava e seca as mãos com supervisão', typicalAge: '15-18 meses' },
      { id: 'ps14', code: 'PS14', name: 'Penteia cabelos', description: 'Penteia os próprios cabelos', typicalAge: '18-24 meses' },
      { id: 'ps15', code: 'PS15', name: 'Veste-se sozinho', description: 'Veste-se sozinho completamente', typicalAge: '30-36 meses' },
      { id: 'ps16', code: 'PS16', name: 'Escova dentes', description: 'Escova os dentes com supervisão', typicalAge: '24-30 meses' },
      { id: 'ps17', code: 'PS17', name: 'Compartilha brinquedos', description: 'Compartilha brinquedos com outros', typicalAge: '24-30 meses' },
      { id: 'ps18', code: 'PS18', name: 'Sauda adequadamente', description: 'Dá tchau e acena', typicalAge: '12-15 meses' },
      { id: 'ps19', code: 'PS19', name: 'Mostra objetos', description: 'Mostra objetos de interesse a outras pessoas', typicalAge: '12-15 meses' },
      { id: 'ps20', code: 'PS20', name: 'Interage com pares', description: 'Interage com outras crianças', typicalAge: '24-30 meses' },
    ]
  },
  {
    id: 'fine_motor',
    code: 'FM',
    name: 'Motor Fino',
    color: '#3B82F6',
    items: [
      { id: 'fm01', code: 'FM01', name: 'Olha para mãos', description: 'Olha para as próprias mãos', typicalAge: '0-2 meses' },
      { id: 'fm02', code: 'FM02', name: 'Abre mão', description: 'Abre a mão espontaneamente', typicalAge: '0-2 meses' },
      { id: 'fm03', code: 'FM03', name: 'Pega objeto', description: 'Pega objeto quando oferecido', typicalAge: '2-4 meses' },
      { id: 'fm04', code: 'FM04', name: 'Mão para boca', description: 'Leva as mãos à boca', typicalAge: '2-4 meses' },
      { id: 'fm05', code: 'FM05', name: 'Pega com 2 mãos', description: 'Pega objeto com as duas mãos', typicalAge: '4-6 meses' },
      { id: 'fm06', code: 'FM06', name: 'Transfere objetos', description: 'Transfere objeto de uma mão para outra', typicalAge: '4-6 meses' },
      { id: 'fm07', code: 'FM07', name: 'Bate palmas', description: 'Bate palmas juntando as mãos', typicalAge: '6-8 meses' },
      { id: 'fm08', code: 'FM08', name: 'Pega com pinça', description: 'Pega pequenos objetos com pinça (dedo e polegar)', typicalAge: '8-10 meses' },
      { id: 'fm09', code: 'FM09', name: 'Solta objetos', description: 'Solta objetos propositalmente', typicalAge: '8-10 meses' },
      { id: 'fm10', code: 'FM10', name: 'Empilha 2 blocos', description: 'Empilha 2 blocos', typicalAge: '12-15 meses' },
      { id: 'fm11', code: 'FM11', name: 'Coloca em recipiente', description: 'Coloca objetos dentro de um recipiente', typicalAge: '12-15 meses' },
      { id: 'fm12', code: 'FM12', name: 'Empilha 4 blocos', description: 'Empilha 4 blocos', typicalAge: '15-18 meses' },
      { id: 'fm13', code: 'FM13', name: 'Faz bola de massa', description: 'Faz bola com massa de modelar', typicalAge: '18-24 meses' },
      { id: 'fm14', code: 'FM14', name: 'Usa tesoura', description: 'Usa tesoura (corta papel)', typicalAge: '30-36 meses' },
      { id: 'fm15', code: 'FM15', name: 'Desenha traços', description: 'Faz traços verticais e horizontais', typicalAge: '24-30 meses' },
      { id: 'fm16', code: 'FM16', name: 'Desenha círculo', description: 'Desenha círculo', typicalAge: '30-36 meses' },
      { id: 'fm17', code: 'FM17', name: 'Corta em linha', description: 'Corta ao longo de uma linha', typicalAge: '36-48 meses' },
      { id: 'fm18', code: 'FM18', name: 'Copia cruze', description: 'Copia um cruz (+)', typicalAge: '36-48 meses' },
      { id: 'fm19', code: 'FM19', name: 'Abotoa botões', description: 'Abotoa botões grandes', typicalAge: '36-48 meses' },
      { id: 'fm20', code: 'FM20', name: 'Amarra cadarço', description: 'Amarra cadarço (com modelo)', typicalAge: '48-60 meses' },
    ]
  },
  {
    id: 'gross_motor',
    code: 'GM',
    name: 'Motor Grosso',
    color: '#10B981',
    items: [
      { id: 'gm01', code: 'GM01', name: 'Levanta cabeça', description: 'Levanta a cabeça quando está de bruços', typicalAge: '0-2 meses' },
      { id: 'gm02', code: 'GM02', name: 'Vira de lado', description: 'Vira de costas para barriga (ou vice-versa)', typicalAge: '2-4 meses' },
      { id: 'gm03', code: 'GM03', name: 'Senta sem apoio', description: 'Senta sem apoio das mãos', typicalAge: '6-8 meses' },
      { id: 'gm04', code: 'GM04', name: 'Engatinha', description: 'Engatinha', typicalAge: '8-10 meses' },
      { id: 'gm05', code: 'GM05', name: 'Puxa para ficar em pé', description: 'Puxa para ficar em pé usando móveis', typicalAge: '8-10 meses' },
      { id: 'gm06', code: 'GM06', name: 'Anda com apoio', description: 'Anda segurando em móveis', typicalAge: '10-12 meses' },
      { id: 'gm07', code: 'GM07', name: 'Anda sozinho', description: 'Anda sem ajuda', typicalAge: '12-15 meses' },
      { id: 'gm08', code: 'GM08', name: 'Agacha e levanta', description: 'Agacha e volta a ficar em pé', typicalAge: '12-15 meses' },
      { id: 'gm09', code: 'GM09', name: 'Sobe escadas', description: 'Sobe escadas com apoio (grade)', typicalAge: '15-18 meses' },
      { id: 'gm10', code: 'GM10', name: 'Empurra brinquedo', description: 'Empurra brinquedo ao andar', typicalAge: '12-15 meses' },
      { id: 'gm11', code: 'GM11', name: 'Pula em pé', description: 'Pula no próprio lugar', typicalAge: '18-24 meses' },
      { id: 'gm12', code: 'GM12', name: 'Chuta bola', description: 'Chuta uma bola grande', typicalAge: '18-24 meses' },
      { id: 'gm13', code: 'GM13', name: 'Anda em linha', description: 'Anda em linha reta', typicalAge: '24-30 meses' },
      { id: 'gm14', code: 'GM14', name: 'Sobe escadas alternando', description: 'Sobe escadas alternando pés', typicalAge: '24-30 meses' },
      { id: 'gm15', code: 'GM15', name: 'Pula com 2 pés', description: 'Pula com os dois pés juntos', typicalAge: '30-36 meses' },
      { id: 'gm16', code: 'GM16', name: 'Anda na ponta dos pés', description: 'Anda na ponta dos pés', typicalAge: '30-36 meses' },
      { id: 'gm17', code: 'GM17', name: 'Equilibra em 1 pé', description: 'Equilibra em um pé por 3 segundos', typicalAge: '36-48 meses' },
      { id: 'gm18', code: 'GM18', name: 'Desce escadas alternando', description: 'Desce escadas alternando pés', typicalAge: '36-48 meses' },
      { id: 'gm19', code: 'GM19', name: 'Pula em 1 pé', description: 'Pula em um pé', typicalAge: '48-60 meses' },
      { id: 'gm20', code: 'GM20', name: 'Monta triciclo', description: 'Pedala triciclo', typicalAge: '36-48 meses' },
    ]
  },
  {
    id: 'language',
    code: 'LG',
    name: 'Linguagem',
    color: '#F59E0B',
    items: [
      { id: 'lg01', code: 'LG01', name: 'Chora', description: 'Chora (forma de comunicação)', typicalAge: '0-2 meses' },
      { id: 'lg02', code: 'LG02', name: 'Vocaliza', description: 'Vocaliza (sons prazerosos)', typicalAge: '2-4 meses' },
      { id: 'lg03', code: 'LG03', name: 'Engatinha vocal', description: 'Engatinha (sons de bebê)', typicalAge: '4-6 meses' },
      { id: 'lg04', code: 'LG04', name: 'Mama', description: 'Mama (balbucio repetitivo)', typicalAge: '6-8 meses' },
      { id: 'lg05', code: 'LG05', name: 'Dada', description: 'Dada (balbucio repetitivo)', typicalAge: '6-8 meses' },
      { id: 'lg06', code: 'LG06', name: 'Combinações', description: 'Combinações consoante-vogal (ba, ma)', typicalAge: '8-10 meses' },
      { id: 'lg07', code: 'LG07', name: 'Mama/dada específicos', description: 'Mama/dada com significado específico', typicalAge: '10-12 meses' },
      { id: 'lg08', code: 'LG08', name: '1 palavra', description: '1 palavra (além de mama/dada)', typicalAge: '12-15 meses' },
      { id: 'lg09', code: 'LG09', name: '3 palavras', description: '3 palavras espontâneas', typicalAge: '15-18 meses' },
      { id: 'lg10', code: 'LG10', name: '10 palavras', description: '10 palavras espontâneas', typicalAge: '18-24 meses' },
      { id: 'lg11', code: 'LG11', name: '2 palavras juntas', description: 'Combina 2 palavras ("quer água")', typicalAge: '24-30 meses' },
      { id: 'lg12', code: 'LG12', name: '50+ palavras', description: 'Vocabulário de 50+ palavras', typicalAge: '24-30 meses' },
      { id: 'lg13', code: 'LG13', name: 'Frases de 3 palavras', description: 'Frases de 3+ palavras', typicalAge: '30-36 meses' },
      { id: 'lg14', code: 'LG14', name: 'Faz perguntas', description: 'Faz perguntas simples', typicalAge: '30-36 meses' },
      { id: 'lg15', code: 'LG15', name: 'Conversa', description: 'Mantém conversa sobre temas variados', typicalAge: '36-48 meses' },
      { id: 'lg16', code: 'LG16', name: 'Conta história', description: 'Conta uma história simples', typicalAge: '48-60 meses' },
      { id: 'lg17', code: 'LG17', name: 'Pronomes', description: 'Usa pronomes eu, você, ele corretamente', typicalAge: '36-48 meses' },
      { id: 'lg18', code: 'LG18', name: 'Tempos verbais', description: 'Usa passado e futuro corretamente', typicalAge: '48-60 meses' },
      { id: 'lg19', code: 'LG19', name: 'Articulação clara', description: 'Articula palavras de forma compreensível', typicalAge: '36-48 meses' },
      { id: 'lg20', code: 'LG20', name: 'Frases complexas', description: 'Usa frases com "porque", "quando", "se"', typicalAge: '48-60 meses' },
    ]
  },
  {
    id: 'problem_solving',
    code: 'PS',
    name: 'Resolução de Problemas',
    color: '#8B5CF6',
    items: [
      { id: 'rsp01', code: 'RS01', name: 'Segue objetos', description: 'Segue objetos em movimento com os olhos', typicalAge: '0-2 meses' },
      { id: 'rsp02', code: 'RS02', name: 'Alcança objetos', description: 'Alcança objetos suspensos', typicalAge: '2-4 meses' },
      { id: 'rsp03', code: 'RS03', name: 'Pega objeto pequeno', description: 'Pega objeto pequeno com pinça', typicalAge: '4-6 meses' },
      { id: 'rsp04', code: 'RS04', name: 'Faz cair objeto', description: 'Faz cair objeto propositalmente para ser recolhido', typicalAge: '6-8 meses' },
      { id: 'rsp05', code: 'RS05', name: 'Descobre objeto escondido', description: 'Descobre objeto escondido sob panos', typicalAge: '8-10 meses' },
      { id: 'rsp06', code: 'RS06', name: 'Brinca de esconder', description: 'Encontra pessoa ou objeto escondido', typicalAge: '8-10 meses' },
      { id: 'rsp07', code: 'RS07', name: 'Encaixa em formas', description: 'Encaixa objetos em tabuleiro de formas', typicalAge: '12-15 meses' },
      { id: 'rsp08', code: 'RS08', name: 'Usa instrumento', description: 'Usa instrumento simples (colher, copo)', typicalAge: '12-15 meses' },
      { id: 'rsp09', code: 'RS09', name: 'Empilha e derruba', description: 'Empilha 3+ blocos e derruba propositalmente', typicalAge: '15-18 meses' },
      { id: 'rsp10', code: 'RS10', name: 'Faz bola', description: 'Faz bola com massa de modelar', typicalAge: '15-18 meses' },
      { id: 'rsp11', code: 'RS11', name: 'Encaixa peças', description: 'Encaixa peças de encaixe', typicalAge: '18-24 meses' },
      { id: 'rsp12', code: 'RS12', name: 'Monta quebra-cabeça', description: 'Monta quebra-cabeça de 3-4 peças', typicalAge: '18-24 meses' },
      { id: 'rsp13', code: 'RS13', name: 'Completa puzzles', description: 'Completa puzzles com 3-5 peças', typicalAge: '24-30 meses' },
      { id: 'rsp14', code: 'RS14', name: 'Resolve problemas', description: 'Resolve problemas simples do dia a dia', typicalAge: '24-30 meses' },
      { id: 'rsp15', code: 'RS15', name: 'Usa ferramentas', description: 'Usa ferramentas simples adequadamente', typicalAge: '30-36 meses' },
      { id: 'rsp16', code: 'RS16', name: 'Faz quebra-cabeça', description: 'Monta quebra-cabeça de 6+ peças', typicalAge: '30-36 meses' },
      { id: 'rsp17', code: 'RS17', name: 'Cria soluções', description: 'Cria soluções para problemas simples', typicalAge: '36-48 meses' },
      { id: 'rsp18', code: 'RS18', name: 'Classifica por categoria', description: 'Classifica objetos por categoria', typicalAge: '36-48 meses' },
      { id: 'rsp19', code: 'RS19', name: 'Segue sequências', description: 'Segue sequências de 3 passos', typicalAge: '48-60 meses' },
      { id: 'rsp20', code: 'RS20', name: 'Pensa antes de agir', description: 'Demonstra planejamento antes de agir', typicalAge: '48-60 meses' },
    ]
  }
];

export const DENVER_SCORE_LABELS: Record<number, string> = {
  0: 'Não demonstrado',
  1: 'Em desenvolvimento',
  2: 'Demonstrado',
  3: 'Nível avançado'
};

export const DENVER_TOTAL_ITEMS = DENVER_DOMAINS.reduce((sum, d) => sum + d.items.length, 0);
