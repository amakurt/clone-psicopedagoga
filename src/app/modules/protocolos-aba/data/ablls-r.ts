export interface ABLLSSkill {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface ABLLSDomain {
  id: string;
  code: string;
  name: string;
  color: string;
  skills: ABLLSSkill[];
}

export const ABLLS_R_DOMAINS: ABLLSDomain[] = [
  {
    id: 'a_conduta',
    code: 'A',
    name: 'Conduta Básica',
    color: '#EF4444',
    skills: [
      { id: 'a01', code: 'A01', name: 'Demonstra motivação', description: 'Demonstra motivação para participar de atividades' },
      { id: 'a02', code: 'A02', name: 'Aceita reforço', description: 'Aceita reforço de um adulto sem demonstrar agitação' },
      { id: 'a03', code: 'A03', name: 'Tolerância a instruções', description: 'Tolerância a instruções e expectativas do terapeuta' },
      { id: 'a04', code: 'A04', name: 'Espera sua vez', description: 'Espera sua vez durante atividades estruturadas' },
      { id: 'a05', code: 'A05', name: 'Senta adequadamente', description: 'Senta adequadamente durante as atividades' },
      { id: 'a06', code: 'A06', name: 'Permanece sentado', description: 'Permanece sentado por 3 minutos ou mais' },
      { id: 'a07', code: 'A07', name: 'Responde ao modelo', description: 'Responde corretamente a demonstração de um modelo' },
      { id: 'a08', code: 'A08', name: 'Respeita limites físicos', description: 'Respeita os limites físicos impostos' },
      { id: 'a09', code: 'A09', name: 'Aceita negativa', description: 'Aceita a negativa sem comportamento de desafio' },
      { id: 'a10', code: 'A10', name: 'Demonstra espontaneidade', description: 'Demonstra espontaneidade em atividades propostas' },
      { id: 'a11', code: 'A11', name: 'Tolerância a mudanças', description: 'Tolerância a mudanças de rotina ou ambiente' },
      { id: 'a12', code: 'A12', name: 'Aceita ser ignorado', description: 'Aceita ser ignorado temporariamente' },
      { id: 'a13', code: 'A13', name: 'Demonstra independência', description: 'Demonstra independência em tarefas simples' },
      { id: 'a14', code: 'A14', name: 'Aceita brinquedos variados', description: 'Aceita brinquedos e materiais variados' },
      { id: 'a15', code: 'A15', name: 'Demonstra foco', description: 'Demonstra foco em atividades por pelo menos 5 minutos' },
    ]
  },
  {
    id: 'b_resposta',
    code: 'B',
    name: 'Resposta a Estímulos',
    color: '#F59E0B',
    skills: [
      { id: 'b01', code: 'B01', name: 'Contato visual espontâneo', description: 'Estabelece contato visual espontâneo com os outros' },
      { id: 'b02', code: 'B02', name: 'Resposta ao nome', description: 'Responde ao ser chamado pelo nome' },
      { id: 'b03', code: 'B03', name: 'Segue instruções de 1 passo', description: 'Segue instruções de 1 passo com gestos' },
      { id: 'b04', code: 'B04', name: 'Segue instruções de 1 passo sem gestos', description: 'Segue instruções de 1 passo sem gestos' },
      { id: 'b05', code: 'B05', name: 'Segue instruções de 2 passos', description: 'Segue instruções de 2 passos' },
      { id: 'b06', code: 'B06', name: 'Identifica partes do corpo', description: 'Identifica pelo menos 5 partes do corpo' },
      { id: 'b07', code: 'B07', name: 'Identifica objetos comuns', description: 'Identifica objetos comuns no ambiente' },
      { id: 'b08', code: 'B08', name: 'Identifica figuras', description: 'Identifica figuras de itens comuns' },
      { id: 'b09', code: 'B09', name: 'Responde a perguntas simples', description: 'Responde a perguntas simples sobre si mesmo' },
      { id: 'b10', code: 'B10', name: 'Indica desejos', description: 'Indica desejo apontando ou pegando' },
      { id: 'b11', code: 'B11', name: 'Reconhece familiares', description: 'Reconhece familiares e pessoas próximas' },
      { id: 'b12', code: 'B12', name: 'Reconhece fotos de si', description: 'Reconhece fotos de si mesmo' },
      { id: 'b13', code: 'B13', name: 'Reconhece ambientes', description: 'Reconhece ambientes familiares (escola, casa)' },
      { id: 'b14', code: 'B14', name: 'Responde a "onde"', description: 'Responde a perguntas com "onde"' },
      { id: 'b15', code: 'B15', name: 'Responde a "o quê"', description: 'Responde a perguntas com "o quê"' },
    ]
  },
  {
    id: 'c_linguagem',
    code: 'C',
    name: 'Linguagem Receptiva',
    color: '#3B82F6',
    skills: [
      { id: 'c01', code: 'C01', name: 'Corresponde objetos idênticos', description: 'Corresponde objetos idênticos (3 pares)' },
      { id: 'c02', code: 'C02', name: 'Corresponde figuras idênticas', description: 'Corresponde figuras idênticas (3 pares)' },
      { id: 'c03', code: 'C03', name: 'Classifica por cor', description: 'Classifica objetos por cor (2 cores)' },
      { id: 'c04', code: 'C04', name: 'Classifica por forma', description: 'Classifica objetos por forma (2 formas)' },
      { id: 'c05', code: 'C05', name: 'Classifica por tamanho', description: 'Classifica objetos por tamanho (grande/pequeno)' },
      { id: 'c06', code: 'C06', name: 'Seleciona por cor', description: 'Seleciona objeto por nome da cor' },
      { id: 'c07', code: 'C07', name: 'Seleciona por forma', description: 'Seleciona objeto por nome da forma' },
      { id: 'c08', code: 'C08', name: 'Seleciona por tamanho', description: 'Seleciona objeto por tamanho' },
      { id: 'c09', code: 'C09', name: 'Corresponde cores escritas', description: 'Corresponde palavras de cores às cores correspondentes' },
      { id: 'c10', code: 'C10', name: 'Identifica cores', description: 'Identifica 10 cores diferentes' },
      { id: 'c11', code: 'C11', name: 'Identifica formas', description: 'Identifica 5 formas geométricas' },
      { id: 'c12', code: 'C12', name: 'Corresponde números', description: 'Corresponde números (1-10) aos seus valores' },
      { id: 'c13', code: 'C13', name: 'Identifica números', description: 'Identifica números de 1 a 20' },
      { id: 'c14', code: 'C14', name: 'Corresponde letras', description: 'Corresponde letras maiúsculas e minúsculas' },
      { id: 'c15', code: 'C15', name: 'Identifica letras', description: 'Identifica todas as letras do alfabeto' },
    ]
  },
  {
    id: 'd_linguagem',
    code: 'D',
    name: 'Linguagem Expressiva',
    color: '#8B5CF6',
    skills: [
      { id: 'd01', code: 'D01', name: 'Vocaliza espontaneamente', description: 'Vocaliza espontaneamente para comunicar desejo' },
      { id: 'd02', code: 'D02', name: 'Imita sons vocais', description: 'Imita sons vocais (a, e, i, o, u)' },
      { id: 'd03', code: 'D03', name: 'Imita palavras', description: 'Imita palavras conhecidas' },
      { id: 'd04', code: 'D04', name: 'Nomeia objetos comuns', description: 'Nomeia pelo menos 10 objetos comuns' },
      { id: 'd05', code: 'D05', name: 'Nomeia figuras', description: 'Nomeia figuras de itens comuns' },
      { id: 'd06', code: 'D06', name: 'Nomeia ações', description: 'Nomeia ações (correr, comer, dormir)' },
      { id: 'd07', code: 'D07', name: 'Nomeia cores', description: 'Nomeia pelo menos 5 cores' },
      { id: 'd08', code: 'D08', name: 'Nomeia quantidades', description: 'Nomeia quantidades de objetos (1-5)' },
      { id: 'd09', code: 'D09', name: 'Combinação de palavras', description: 'Combina 2 palavras para comunicar (quer + objeto)' },
      { id: 'd10', code: 'D10', name: 'Frases de 3+ palavras', description: 'Usa frases de 3 ou mais palavras' },
      { id: 'd11', code: 'D11', name: 'Responde a "como você está"', description: 'Responde perguntas sobre como se sente' },
      { id: 'd12', code: 'D12', name: 'Usa pronomes', description: 'Usa pronomes eu, você, ele, ela corretamente' },
      { id: 'd13', code: 'D13', name: 'Faz perguntas', description: 'Faz perguntas com palavras interrogativas' },
      { id: 'd14', code: 'D14', name: 'Conversa por telefone', description: 'Mantém conversa simples por telefone' },
      { id: 'd15', code: 'D15', name: 'Usa linguagem abstrata', description: 'Usa conceitos de tempo e sentimentos' },
    ]
  },
  {
    id: 'e_linguagem',
    code: 'E',
    name: 'Linguagem Vocal',
    color: '#06B6D4',
    skills: [
      { id: 'e01', code: 'E01', name: 'Imita movimentos orais', description: 'Imita movimentos orais (abrir boca, mostrar língua)' },
      { id: 'e02', code: 'E02', name: 'Imita sons isolados', description: 'Imita sons isolados de consoantes (m, p, b)' },
      { id: 'e03', code: 'E03', name: 'Combinações consoante-vogal', description: 'Emite combinações consoante-vogal (ma, pa, ba)' },
      { id: 'e04', code: 'E04', name: 'Palavras de 2 sílabas', description: 'Emite palavras de 2 sílabas (mama, papai)' },
      { id: 'e05', code: 'E05', name: 'Palavras de 3 sílabas', description: 'Emite palavras de 3 sílabas (banana, ballão)' },
      { id: 'e06', code: 'E06', name: 'Frase de 2 palavras', description: 'Emite frases de 2 palavras' },
      { id: 'e07', code: 'E07', name: 'Frase de 3+ palavras', description: 'Emite frases de 3 ou mais palavras' },
      { id: 'e08', code: 'E08', name: 'Conversa espontânea', description: 'Engaja-se em conversa espontânea de 2+ turnos' },
      { id: 'e09', code: 'E09', name: 'Vocabulário de 50+ palavras', description: 'Vocabulário ativo de pelo menos 50 palavras' },
      { id: 'e10', code: 'E10', name: 'Vocabulário de 200+ palavras', description: 'Vocabulário ativo de pelo menos 200 palavras' },
      { id: 'e11', code: 'E11', name: 'Articulação clara', description: 'Articula palavras de forma compreensível' },
      { id: 'e12', code: 'E12', name: 'Início de conversa', description: 'Inicia conversa com outros espontaneamente' },
      { id: 'e13', code: 'E13', name: 'Mantém tópico', description: 'Mantém tópico de conversa por 3+ turnos' },
      { id: 'e14', code: 'E14', name: 'Usa linguagem funcional', description: 'Usa linguagem para pedir, commentar, protestar' },
      { id: 'e15', code: 'E15', name: 'Contato conversacional', description: 'Mantém contato visual durante conversa' },
    ]
  },
  {
    id: 'f_sociais',
    code: 'F',
    name: 'Habilidades Sociais',
    color: '#EC4899',
    skills: [
      { id: 'f01', code: 'F01', name: 'Brinca com objetos de forma funcional', description: 'Brinca com objetos de forma funcional' },
      { id: 'f02', code: 'F02', name: 'Brinca com brinquedos de movimento', description: 'Brinca com brinquedos que giram ou se movem' },
      { id: 'f03', code: 'F03', name: 'Brinca com jogos de encaixe', description: 'Brinca com jogos de encaixe simples' },
      { id: 'f04', code: 'F04', name: 'Brinca com quebra-cabeças', description: 'Monta quebra-cabeças de até 6 peças' },
      { id: 'f05', code: 'F05', name: 'Brinca cooperativamente', description: 'Brinca cooperativamente com um par' },
      { id: 'f06', code: 'F06', name: 'Espera sua vez na brincadeira', description: 'Espera sua vez durante brincadeiras' },
      { id: 'f07', code: 'F07', name: 'Imita ações de brincadeira', description: 'Imita ações de brincadeira de um modelo' },
      { id: 'f08', code: 'F08', name: 'Brinca com fantoches', description: 'Brinca com fantoches ou bonecos' },
      { id: 'f09', code: 'F09', name: 'Participa de brincadeira de grupo', description: 'Participa de brincadeira em grupo de 2+ crianças' },
      { id: 'f10', code: 'F10', name: 'Segura objetos adequadamente', description: 'Segura lápis e utensílios de forma adequada' },
      { id: 'f11', code: 'F11', name: 'Alimenta-se sozinho', description: 'Alimenta-se com colher e garfo' },
      { id: 'f12', code: 'F12', name: 'Bebe em copo', description: 'Bebe em copo sem ajuda' },
      { id: 'f13', code: 'F13', name: 'Veste-se parcialmente', description: 'Veste e retira roupas simples' },
      { id: 'f14', code: 'F14', name: 'Usa banheiro', description: 'Vai ao banheiro com independência' },
      { id: 'f15', code: 'F15', name: 'Lava as mãos', description: 'Lava as mãos com água e sabão' },
    ]
  },
  {
    id: 'g_imitacao',
    code: 'G',
    name: 'Imitação',
    color: '#10B981',
    skills: [
      { id: 'g01', code: 'G01', name: 'Imita movimentos corporais simples', description: 'Imita movimentos simples (bater palmas, acenar)' },
      { id: 'g02', code: 'G02', name: 'Imita movimentos com objetos', description: 'Imita movimentos usando objetos (carregar, bater)' },
      { id: 'g03', code: 'G03', name: 'Imita ações na cara', description: 'Imita ações na cara (abrir boca, apertar nariz)' },
      { id: 'g04', code: 'G04', name: 'Imita movimentos motores grossos', description: 'Imita movimentos motores grossos (pular, sentar)' },
      { id: 'g05', code: 'G05', name: 'Imita sons vocais', description: 'Imita sons vocais em sequência' },
      { id: 'g06', code: 'G06', name: 'Imita palavras simples', description: 'Imita palavras simples de 1-2 sílabas' },
      { id: 'g07', code: 'G07', name: 'Imita frases curtas', description: 'Imita frases de 2-3 palavras' },
      { id: 'g08', code: 'G08', name: 'Imita ações de brincadeira', description: 'Imita ações de brincadeira funcional' },
      { id: 'g09', code: 'G09', name: 'Imita atividades de autocuidado', description: 'Imita atividades de autocuidado (lavar mãos)' },
      { id: 'g10', code: 'G10', name: 'Imita com atraso', description: 'Imita comportamento após atraso de 5 segundos' },
      { id: 'g11', code: 'G11', name: 'Imita comportamento social', description: 'Imita comportamento social (aperto de mão, abraço)' },
      { id: 'g12', code: 'G12', name: 'Imita com múltiplos passos', description: 'Imita sequências de 3+ passos' },
      { id: 'g13', code: 'G13', name: 'Imita em grupo', description: 'Imita comportamento demonstrado em grupo' },
      { id: 'g14', code: 'G14', name: 'Imita uso de utensílios', description: 'Imita uso correto de utensílios (caneta, tesoura)' },
      { id: 'g15', code: 'G15', name: 'Imita ritmo e melodia', description: 'Imita ritmo e melodia de canções' },
    ]
  },
  {
    id: 'h_leitura',
    code: 'H',
    name: 'Leitura',
    color: '#6366F1',
    skills: [
      { id: 'h01', code: 'H01', name: 'Olha para livro', description: 'Olha para imagens de um livro' },
      { id: 'h02', code: 'H02', name: 'Vira páginas', description: 'Vira páginas de um livro uma por uma' },
      { id: 'h03', code: 'H03', name: 'Aponta para imagens', description: 'Aponta para imagens nomeadas em livros' },
      { id: 'h04', code: 'H04', name: 'Corresponde palavra-imagem', description: 'Corresponde palavras impressas a imagens' },
      { id: 'h05', code: 'H05', name: 'Identifica letras', description: 'Identifica letras do alfabeto impressas' },
      { id: 'h06', code: 'H06', name: 'Lê palavras simples', description: 'Lê palavras simples (mamãe, papai, bola)' },
      { id: 'h07', code: 'H07', name: 'Lê frases simples', description: 'Lê frases simples com vocabulário conhecido' },
      { id: 'h08', code: 'H08', name: 'Lê histórias curtas', description: 'Lê histórias curtas com auxílio' },
      { id: 'h09', code: 'H09', name: 'Compreende texto lido', description: 'Responde a perguntas sobre texto lido' },
      { id: 'h10', code: 'H10', name: 'Lê com fluência', description: 'Lê com fluência e entonação adequadas' },
      { id: 'h11', code: 'H11', name: 'Lê para aprender', description: 'Usa leitura para buscar informação' },
      { id: 'h12', code: 'H12', name: 'Escreve palavras simples', description: 'Escreve palavras simples ditadas' },
      { id: 'h13', code: 'H13', name: 'Escreve frases', description: 'Escreve frases simples de 3+ palavras' },
      { id: 'h14', code: 'H14', name: 'Escreve espontaneamente', description: 'Escreve espontaneamente para se comunicar' },
      { id: 'h15', code: 'H15', name: 'Usa pontuação', description: 'Usa pontuação básica (ponto, vírgula)' },
    ]
  },
  {
    id: 'i_matematica',
    code: 'I',
    name: 'Matemática',
    color: '#F97316',
    skills: [
      { id: 'i01', code: 'I01', name: 'Conta objetos', description: 'Conta objetos de 1 a 5' },
      { id: 'i02', code: 'I02', name: 'Conta até 10', description: 'Conta de 1 a 10 em sequência' },
      { id: 'i03', code: 'I03', name: 'Conta até 20', description: 'Conta de 1 a 20 em sequência' },
      { id: 'i04', code: 'I04', name: 'Conta até 50', description: 'Conta de 1 a 50 em sequência' },
      { id: 'i05', code: 'I05', name: 'Conta até 100', description: 'Conta de 1 a 100 em sequência' },
      { id: 'i06', code: 'I06', name: 'Corresponde quantidade-número', description: 'Corresponde quantidade de objetos ao número' },
      { id: 'i07', code: 'I07', name: 'Soma simples', description: 'Realiza soma com auxílio de objetos' },
      { id: 'i08', code: 'I08', name: 'Subtração simples', description: 'Realiza subtração com auxílio de objetos' },
      { id: 'i09', code: 'I09', name: 'Reconhece moedas', description: 'Reconhece valores de moedas comuns' },
      { id: 'i10', code: 'I10', name: 'Sequência numérica', description: 'Completa sequências numéricas simples' },
      { id: 'i11', code: 'I11', name: 'Ordena números', description: 'Ordena números de menor a maior' },
      { id: 'i12', code: 'I12', name: 'Reconhece padrões', description: 'Reconhece padrões simples (ABAB)' },
      { id: 'i13', code: 'I13', name: 'Completa padrões', description: 'Completa padrões simples' },
      { id: 'i14', code: 'I14', name: 'Compara quantidades', description: 'Compara quantidades (mais, menos, igual)' },
      { id: 'i15', code: 'I15', name: 'Mede usando unidades', description: 'Mede usando unidades não padronizadas' },
    ]
  },
  {
    id: 'j_adequacao',
    code: 'J',
    name: 'Adequação Comportamental',
    color: '#14B8A6',
    skills: [
      { id: 'j01', code: 'J01', name: 'Reconhece emoções em fotos', description: 'Reconhece emoções em rostos de fotos' },
      { id: 'j02', code: 'J02', name: 'Reconhece emoções em pessoas', description: 'Reconhece emoções em expressões faciais reais' },
      { id: 'j03', code: 'J03', name: 'Identifica causa de emoções', description: 'Identifica a causa de emoções em histórias' },
      { id: 'j04', code: 'J04', name: 'Expressa emoções verbalmente', description: 'Expressa suas emoções verbalmente' },
      { id: 'j05', code: 'J05', name: 'Lida com frustração', description: 'Lida com frustração sem comportamento disruptivo' },
      { id: 'j06', code: 'J06', name: 'Aceita perdas', description: 'Aceita perder em jogos e competições' },
      { id: 'j07', code: 'J07', name: 'Adapta-se a ambientes', description: 'Adapta-se a diferentes ambientes' },
      { id: 'j08', code: 'J08', name: 'Sauda adequadamente', description: 'Sauda adequadamente (oi, tchau)' },
      { id: 'j09', code: 'J09', name: 'Agradece', description: 'Agradece quando recebe algo' },
      { id: 'j10', code: 'J10', name: 'Pede licença', description: 'Pede licença quando necessário' },
      { id: 'j11', code: 'J11', name: 'Espera sua vez em fila', description: 'Espera sua vez em fila de até 5 pessoas' },
      { id: 'j12', code: 'J12', name: 'Compartilha materiais', description: 'Compartilha materiais com outros' },
      { id: 'j13', code: 'J13', name: 'Respeita turnos na fala', description: 'Respeita turnos na conversa' },
      { id: 'j14', code: 'J14', name: 'Olha para quem fala', description: 'Olha para a pessoa que está falando' },
      { id: 'j15', code: 'J15', name: 'Mantém higiene', description: 'Mantém higiene pessoal básica' },
    ]
  },
  {
    id: 'k_autocuidado',
    code: 'K',
    name: 'Autocuidado',
    color: '#A855F7',
    skills: [
      { id: 'k01', code: 'K01', name: 'Come com garfo', description: 'Come usando garfo' },
      { id: 'k02', code: 'K02', name: 'Come com colher', description: 'Come usando colher sem derramar' },
      { id: 'k03', code: 'K03', name: 'Bebe em copo', description: 'Bebe em copo sem derramar' },
      { id: 'k04', code: 'K04', name: 'Leva alimento à boca', description: 'Leva alimento à boca sem ajuda' },
      { id: 'k05', code: 'K05', name: 'Retira roupa simples', description: 'Retira roupa simples (camiseta, calça)' },
      { id: 'k06', code: 'K06', name: 'Veste roupa simples', description: 'Veste roupa simples com ajuda mínima' },
      { id: 'k07', code: 'K07', name: 'Calça sapatos', description: 'Calça e descala sapatos' },
      { id: 'k08', code: 'K08', name: 'Escova os dentes', description: 'Escova os dentes com supervisão' },
      { id: 'k09', code: 'K09', name: 'Lava as mãos', description: 'Lava as mãos com água e sabão' },
      { id: 'k10', code: 'K10', name: 'Seca as mãos', description: 'Seca as mãos com toalha' },
      { id: 'k11', code: 'K11', name: 'Penteia os cabelos', description: 'Penteia os cabelos' },
      { id: 'k12', code: 'K12', name: 'Usa banheiro', description: 'Usa o banheiro com independência' },
      { id: 'k13', code: 'K13', name: 'Limpa o nariz', description: 'Limpa o nariz com tecido' },
      { id: 'k14', code: 'K14', name: 'Toma banho', description: 'Toma banho com supervisão mínima' },
      { id: 'k15', code: 'K15', name: 'Arruma a cama', description: 'Arruma a cama de forma simples' },
    ]
  },
  {
    id: 'l_motor',
    code: 'L',
    name: 'Habilidades Motoras',
    color: '#22C55E',
    skills: [
      { id: 'l01', code: 'L01', name: 'Senta sem apoio', description: 'Senta no chão sem apoio das mãos' },
      { id: 'l02', code: 'L02', name: 'Fica em pé sem apoio', description: 'Fica em pé sem apoio por 10 segundos' },
      { id: 'l03', code: 'L03', name: 'Anda sem ajuda', description: 'Anda sem ajuda de um adulto' },
      { id: 'l04', code: 'L04', name: 'Sobe escadas', description: 'Sobe escadas com apoio' },
      { id: 'l05', code: 'L05', name: 'Desce escadas', description: 'Desce escadas com apoio' },
      { id: 'l06', code: 'L06', name: 'Pula com os dois pés', description: 'Pula com os dois pés juntos' },
      { id: 'l07', code: 'L07', name: 'Chuta bola', description: 'Chuta bola com os pés' },
      { id: 'l08', code: 'L08', name: 'Joga bola', description: 'Joga bola com as mãos' },
      { id: 'l09', code: 'L09', name: 'Pega objetos', description: 'Pega objetos pequenos com pinça' },
      { id: 'l10', code: 'L10', name: 'Solta objetos', description: 'Solta objetos controladamente' },
      { id: 'l11', code: 'L11', name: 'Empilha blocos', description: 'Empilha 3 ou mais blocos' },
      { id: 'l12', code: 'L12', name: 'Encaixa peças', description: 'Encaixa peças em tabuleiro' },
      { id: 'l13', code: 'L13', name: 'Usa tesoura', description: 'Usa tesoura para cortar papel' },
      { id: 'l14', code: 'L14', name: 'Desenha círculo', description: 'Desenha um círculo com lápis' },
      { id: 'l15', code: 'L15', name: 'Escreve traços', description: 'Escreve traços verticais e horizontais' },
    ]
  }
];

export const ABLLS_SCORE_LABELS: Record<number, string> = {
  0: 'Não iniciado',
  1: 'Em progresso',
  2: 'Adquirido'
};

export const ABLLS_TOTAL_SKILLS = ABLLS_R_DOMAINS.reduce((sum, d) => sum + d.skills.length, 0);
