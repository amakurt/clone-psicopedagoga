import { Router } from 'express';
import prisma from '../lib/prisma';
import { scoped } from '../lib/tenant';
import { authenticate } from '../middleware';

const router = Router();
router.use(authenticate);

// Protocol TEA data - 5 categories × 4 subcategories × 10 items = 200 items
const protocolData = {
  categories: [
    {
      id: 'comunicativas',
      name: 'Habilidades Comunicativas',
      icon: 'record_voice_over',
      color: '#3B82F6',
      subcategories: [
        {
          id: 'contato_visual',
          name: 'Contato Visual',
          items: [
            'A criança olha na direção de um adulto quando chamada pelo nome',
            'Quando chamada pelo nome, vira o rosto para outra pessoa por pelo menos 1 segundo',
            'Durante uma interação, vira o rosto em direção a outra pessoa por aproximadamente 3 segundos',
            'Olha em direção a outra pessoa que está com itens reforçadores à mostra',
            'Olha na direção de um par quando engajada em alguma brincadeira',
            'Olha na direção de outra pessoa à distância de 3 metros',
            'Olha na direção de outra pessoa à distância de 5 metros',
            'Olha na direção de um par, que está à distância de 5 metros, enquanto engajada em alguma brincadeira',
            'Olha na direção de mais de uma pessoa (duas pessoas chamam a criança alternadamente)',
            'Olha na direção de mais de uma pessoa alternadamente, quando engajada em alguma brincadeira'
          ]
        },
        {
          id: 'comunicacao_alternativa',
          name: 'Comunicação Alternativa',
          items: [
            'Estende a mão para pegar o que deseja',
            'Aponta para o que deseja, tocando o dedo no objeto',
            'Aponta a uma distância de aproximadamente 30 centímetros',
            'Aponta espontaneamente para mostrar algo ou fazer pedidos',
            'Faz gestos para se comunicar (aponta, "sim", "não", "tchau", senta, bebe)',
            'Consegue utilizar figuras/fotos para fazer pedidos',
            'Utiliza comunicação por figuras, selecionando corretamente a figura correspondente ao pedido',
            'Seleciona uma figura correta e a entrega para um adulto, que está a 5 metros de distância',
            'Expressa verbos por meio das figuras ("quero", "posso", "está doendo")',
            'Expressa sentimentos por meio das figuras ("sinto-me triste/alegre")'
          ]
        },
        {
          id: 'linguagem_expressiva',
          name: 'Linguagem Expressiva',
          items: [
            'Emite algum som com sentido comunicativo',
            'Emite sons direcionados quando quer alguma coisa',
            'Consegue imitar sons',
            'Emite 10 sons diferentes',
            'Pede por seus objetos e atividades favoritas',
            'Nomeia pessoas familiares',
            'Nomeia figuras',
            'Nomeia objetos',
            'Completa trechos de músicas conhecidas',
            'Faz perguntas e se envolve em conversas simples'
          ]
        },
        {
          id: 'linguagem_receptiva',
          name: 'Linguagem Receptiva',
          items: [
            'Segue instruções de 1 passo',
            'Segue instruções de 2 passos',
            'Segue sequências de instruções de 3 passos',
            'Identifica partes do corpo humano',
            'Identifica pessoas familiares',
            'Identifica pelo menos 10 figuras do seu cotidiano',
            'Identifica pelo menos 10 objetos presentes no seu dia a dia',
            'Responde perguntas simples ("O que você quer?")',
            'Responde duas perguntas simples ("Qual cor você quer e o que você quer beber?")',
            'Responde perguntas complexas ("Qual é o seu time?", "Qual é a sua cor preferida?")'
          ]
        }
      ]
    },
    {
      id: 'sociais',
      name: 'Habilidades Sociais e Comportamentais',
      icon: 'groups',
      color: '#8B5CF6',
      subcategories: [
        {
          id: 'resposta_emocional',
          name: 'Resposta Emocional',
          items: [
            'Identifica emoções básicas diante de figuras (alegria, medo, raiva e tristeza)',
            'Nomeia emoções básicas diante de figuras (alegria, medo, raiva e tristeza)',
            'Identifica emoções que uma outra pessoa está demonstrando',
            'Imita emoções que outra pessoa está demonstrando',
            'Nomeia suas próprias emoções (alegria, medo, raiva e tristeza)',
            'Determina a causa de emoções, diante cenas de desenhos animados',
            'Identifica a causa das suas emoções, após episódios que eliciaram essas respostas',
            'Consegue reconhecer dez diferentes emoções e associar as situações do cotidiano',
            'Diferencia a intensidade das emoções em: baixa, média e alta',
            'Apresenta resposta emocional e conduta esperada em intensidade adequada à situação'
          ]
        },
        {
          id: 'imitacao',
          name: 'Imitação',
          items: [
            'Apresenta comportamento imitativo de movimentos motores (levantar, sentar, bater as mãos)',
            'Consegue imitar comportamentos simples com o uso de objetos',
            'Imita movimentos fonoarticulatórios',
            'Imita comportamentos de coordenação motora grossa (pular, dançar, correr)',
            'Imita comportamentos simples (bater palmas e emitir sons isolados)',
            'Consegue imitar 3 tarefas simples em sequência',
            'Aprende comportamentos básicos de autocuidado por observação',
            'Aprende brincadeiras e esportes iniciais adequadamente',
            'Imita comportamentos complexos de outra pessoa, relacionados a afazeres do dia a dia',
            'Aprende novos comportamentos sem ser, especificamente, ensinada a fazê-los'
          ]
        },
        {
          id: 'tolerancia',
          name: 'Tolerância',
          items: [
            'Permanece sentada por pelo menos 1 minuto com reforçador',
            'Permanece sentada por pelo menos 3 minutos com reforçador',
            'Permanece sentada por pelo menos 10 minutos com reforçador',
            'Consegue aguardar pelo menos 30 segundos para receber algo que deseja',
            'Aguarda, sem resistência, por pelo menos 1 minuto por algo que está esperando',
            'Aguarda sentada por pelo menos 3 minutos sem resistência, sem uso de reforçador',
            'Realiza as refeições sentada',
            'Consegue aguardar a sua vez na fila por pelo menos 5 minutos',
            'Consegue participar efetivamente de brincadeira em grupo, aguardando sua vez',
            'Lida bem com derrotas e com o término das atividades prazerosas'
          ]
        },
        {
          id: 'brincar',
          name: 'Brincar',
          items: [
            'Engaja-se em brincadeiras corporais (cadê/achou, cócegas)',
            'Manuseia e brinca corretamente com brinquedos giratórios ou de movimento',
            'Brinca com jogos de encaixe simples',
            'Brinca com quebra-cabeças de até 4 peças',
            'Brinca cooperativamente, ajudando o par a completar a atividade',
            'Brinca alternando turnos (minha vez/sua vez)',
            'Usa os brinquedos do playground de forma correta',
            'Manuseia fantoches e bonecos',
            'Engaja-se em brincadeiras de casa, com criação de personagens',
            'Presta atenção em histórias contadas, mesmo que curtas e com uso de materiais concretos'
          ]
        }
      ]
    },
    {
      id: 'motoras',
      name: 'Habilidades Motoras',
      icon: 'accessibility_new',
      color: '#10B981',
      subcategories: [
        {
          id: 'motor_global',
          name: 'Motor Global',
          items: [
            'Senta no chão sem o apoio das mãos',
            'Diante de uma cadeira tamanho adulto, puxa-a (ou sobe) e senta',
            'Sobe escadas sem ajuda física de um adulto',
            'Pega objetos no chão, inclinando o corpo sem se desequilibrar',
            'Desce escadas sem ajuda',
            'Pula com os dois pés juntos (no mesmo local)',
            'Impulsiona-se em um balanço com independência',
            'Pula de uma altura de 20 centímetros',
            'Dá cambalhota para frente',
            'Equilibra-se em um pé só, por 6 segundos'
          ]
        },
        {
          id: 'motor_fino',
          name: 'Motor Fino',
          items: [
            'Coloca objetos pequenos dentro de um recipiente',
            'Forma uma bola com uma massa de modelar',
            'Usa preensão de pinça para pegar objetos',
            'Bate palmas',
            'Coloca 3 aros em uma pequena estaca',
            'Vira trincos e maçanetas para abrir portas',
            'Dobra um papel ao meio, mesmo que imitando um adulto',
            'Abre garrafas com tampa de rosca',
            'Consegue colocar 5 pregadores em um cordão',
            'Usando tesoura sem ponta, corta uma folha A4 ao meio'
          ]
        },
        {
          id: 'interacao_objetos',
          name: 'Interação com Objetos',
          items: [
            'Vira páginas de um livro',
            'Puxa bonecos ou outro brinquedo ao andar',
            'Constrói uma torre com 4 blocos de montar',
            'Utilizando um martelo de brinquedo, prega 5 pinos em seus encaixes',
            'Monta um quebra-cabeça de 3 peças',
            'Pedala um triciclo por no mínimo 3 metros',
            'Utilizando um lápis, traça os pontilhados do desenho na folha',
            'Une três pedaços de massa de modelar',
            'Pedala um triciclo fazendo curvas',
            'Fecha garrafas com tampa de rosca'
          ]
        },
        {
          id: 'interacao_bola',
          name: 'Interação com Bola',
          items: [
            'Rola uma bola, imitando um adulto',
            'Pega a bola do chão e levanta com o uso das duas mãos',
            'Joga a bola com as duas mãos a uma distância de 2 metros do par',
            'Chuta uma bola grande que está imóvel a uma distância de 2 metros',
            'Chuta a bola quando ela está rolando devagar em sua direção',
            'Agarra a bola com ambas as mãos quando ela é jogada em sua direção',
            'Corre e brinca com a bola em movimento',
            'Chuta a bola firmemente e demonstrando domínio para a direção que deseja',
            'Arremessa uma bola em uma cesta, com ambas as mãos',
            'Chuta a bola na direção de um gol posicionado a uma distância de 7 metros'
          ]
        }
      ]
    },
    {
      id: 'funcionais',
      name: 'Habilidades Funcionais',
      icon: 'self_improvement',
      color: '#F59E0B',
      subcategories: [
        {
          id: 'higiene_pessoal',
          name: 'Higiene Pessoal',
          items: [
            'Escova os dentes, mesmo que com ajuda física',
            'Lava as mãos (somente com água) antes das refeições, com independência',
            'Usa sabonete de forma apropriada para lavar as mãos, sem necessidade de ajuda',
            'Escova os dentes, ainda necessitando de instruções e modelo',
            'Penteia os cabelos com independência',
            'Seca-se, após o banho, com independência',
            'Escova os dentes ao menos 3 vezes ao dia, sem necessidade de ajuda',
            'Realiza higiene íntima durante o banho, com independência',
            'Lava todas as partes do corpo durante o banho, com independência',
            'Toma banho sozinha, incluindo abrir/fechar o chuveiro, despir-se, passar sabão e xampu, enxaguar-se, secar-se e vestir suas roupas'
          ]
        },
        {
          id: 'vestuario',
          name: 'Vestuário',
          items: [
            'Retira a calça sozinha',
            'Retira a camisa sem necessidade de ajuda',
            'Ajuda a colocar a calça, levantando os pés e puxando a roupa',
            'Ajuda a colocar a camisa, esticando os braços e puxando a roupa',
            'Coloca o sapato com independência',
            'Coloca a meia com independência',
            'Abotoa e desabotoa a camisa sem necessidade de ajuda',
            'Amarra o cadarço sem necessidade de ajuda',
            'Veste a parte inferior (calça, bermuda, saia) sozinha',
            'Veste a parte superior (camisa, camiseta, blusa) sem ajuda'
          ]
        },
        {
          id: 'uso_banheiro',
          name: 'Uso de Banheiro',
          items: [
            'Demonstra incômodo ao fazer xixi/cocô na roupa/fralda',
            'Retira a roupa/fralda para fazer xixi/cocô',
            'Faz xixi no troninho quando colocada por um adulto',
            'Avisa ao adulto a necessidade de fazer xixi',
            'Não faz xixi na cama',
            'Faz cocô no troninho quando colocada por um adulto',
            'Avisa ao adulto sobre a necessidade de fazer cocô',
            'Tem a iniciativa de ir ao banheiro para fazer xixi e o realiza sozinha',
            'Tem a iniciativa de ir ao banheiro para fazer cocô e o realiza sozinha',
            'Faz xixi e cocô sozinha e depois realiza a higiene pessoal'
          ]
        },
        {
          id: 'alimentacao',
          name: 'Alimentação',
          items: [
            'Possui ao menos 10 diferentes alimentos em sua dieta',
            'Alimenta-se de sólidos, mesmo que apresente dieta extremamente limitada',
            'Realiza ao menos 1 refeição no dia, ainda que tenha variabilidade alimentar restrita',
            'Realiza ao menos 2 refeições por dia',
            'Realiza ao menos 4 refeições por dia, mesmo com forte preferência por alimentos específicos',
            'Come alimentos variáveis, mesmo que dê preferência a marcas específicas',
            'Aceita comidas que diferem em textura e cor das comidas usuais',
            'Aceita comidas de múltiplas cores e texturas',
            'Experimenta novos alimentos',
            'Apresenta dieta equilibrada e balanceada'
          ]
        }
      ]
    },
    {
      id: 'cognitivas',
      name: 'Habilidades Cognitivas',
      icon: 'psychology',
      color: '#EF4444',
      subcategories: [
        {
          id: 'atencao_conjunta',
          name: 'Atenção Conjunta',
          items: [
            'Olha para um objeto apresentado a 30 centímetros de distância',
            'Segue um ponto em deslocamento (ou objeto em movimento) a 30 centímetros de distância',
            'Mantém pelo menos alguns segundos de atenção nas brincadeiras propostas',
            'Demonstra interesse por um brinquedo/objeto em posse de outra pessoa',
            'Quando um par abandona a atividade/brincadeira, a criança convida-o para retornar',
            'Segue instruções simples durante brincadeiras',
            'Aguarda a resposta do falante, durante pelo menos 30 segundos, sem se dispersar',
            'Mostra ao par algo que viu, aconteceu ou fez',
            'Junta-se à outra pessoa por iniciativa própria',
            'Permanece engajada, sob instruções dadas a um grupo, durante 10 minutos'
          ]
        },
        {
          id: 'comportamento_exploratorio',
          name: 'Comportamento Exploratório',
          items: [
            'Deixa cair e apanha um objeto',
            'Descobre um objeto escondido sob um recipiente',
            'Vira as páginas de um livro para encontrar uma imagem nomeada',
            'Nota e solicita por um item que está faltando para prosseguir em um jogo',
            'Abre recipientes fechados para ver o que há dentro',
            'Brinca com uma caixa de areia por no mínimo 3 minutos',
            'Engaja-se em brincadeiras com tinta, usando os pés e as mãos',
            'Explora massinha de modelar por no mínimo 3 minutos',
            'Repete um movimento com um brinquedo de ação e reação',
            'Constrói algo com no mínimo 3 blocos de montar'
          ]
        },
        {
          id: 'combinacoes',
          name: 'Combinações',
          items: [
            'Emparelha figuras idênticas quando apresentados 3 pares de figuras',
            'Combina objetos semelhantes quando apresentados 3 pares de objetos',
            'Combina objetos a suas figuras correspondentes quando apresentadas 3 figuras e 3 objetos',
            'Emparelha objetos com a mesma textura (feltros, pelúcias, madeiras)',
            'Emparelha 3 cores',
            'Emparelha formas geométricas a suas respectivas figuras',
            'Combina objetos que se relacionam entre si',
            'Combina itens por categorias',
            'Combina palavras escritas a suas imagens correspondentes',
            'Identifica palavras simples escritas e ditadas por um adulto'
          ]
        },
        {
          id: 'uso_lapis',
          name: 'Uso do Lápis',
          items: [
            'Copia uma linha vertical ou horizontal, imitando um adulto',
            'Copia uma linha diagonal, imitando um adulto',
            'Desenha um círculo (imitando ou com um modelo à vista)',
            'Desenha um quadrado com o uso do lápis (imitando ou com um modelo à vista)',
            'Desenha um triângulo quando solicitado (imitando ou com um modelo à vista)',
            'Pinta um desenho com poucos detalhes, mesmo não respeitando os limites',
            'Desenha, copiando o que o adulto está desenhando, por no mínimo 3 minutos',
            'Pinta um desenho com poucos detalhes, respeitando seus limites',
            'Realiza desenhos simples e reconhecíveis',
            'Escreve o seu nome, imitando um adulto ou com um modelo à vista'
          ]
        }
      ]
    }
  ]
};

// Get protocol data
router.get('/protocol-data', (req, res) => {
  res.json(protocolData);
});

// Calculate stats from evaluations
router.get('/protocol-stats/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const evaluation = await db.protocolEvaluation.findUnique({
    where: { id: req.params.id }
  });

  if (!evaluation) {
    return res.status(404).json({ error: 'Avaliação não encontrada' });
  }

  const evals = JSON.parse(evaluation.evaluations || '{}');
  
  const categoryStats = protocolData.categories.map(cat => {
    let totalScore = 0;
    let maxPossible = 0;
    let itemsEvaluated = 0;

    cat.subcategories.forEach(sub => {
      sub.items.forEach((_, idx) => {
        const key = `${cat.id}_${sub.id}_${idx}`;
        const score = evals[key] || 0;
        totalScore += score;
        maxPossible += 2;
        if (evals[key] !== undefined) itemsEvaluated++;
      });
    });

    return {
      id: cat.id,
      name: cat.name,
      color: cat.color,
      score: totalScore,
      maxScore: maxPossible,
      percentage: maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0,
      itemsEvaluated
    };
  });

  const totalScore = categoryStats.reduce((sum, c) => sum + c.score, 0);
  const totalMax = categoryStats.reduce((sum, c) => sum + c.maxScore, 0);

  res.json({
    evaluationId: evaluation.id,
    date: evaluation.date,
    categories: categoryStats,
    totalScore,
    totalMax,
    overallPercentage: totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0
  });
});

// Existing CRUD routes
router.get('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const { pacienteId } = req.query;
  const where: any = {};
  if (pacienteId) where.pacienteId = pacienteId;
  const evaluations = await db.protocolEvaluation.findMany({ where, orderBy: { date: 'desc' }, include: { paciente: true, profissional: true } });
  res.json({ data: evaluations, total: evaluations.length });
});

router.get('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  if (req.params.id === 'protocol-data' || req.params.id === 'protocol-stats') return;
  const evaluation = await db.protocolEvaluation.findUnique({ where: { id: req.params.id }, include: { paciente: true, profissional: true } });
  if (!evaluation) return res.status(404).json({ error: 'Avaliação de protocolo não encontrada' });
  res.json(evaluation);
});

router.post('/', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const evaluation = await db.protocolEvaluation.create({ data: req.body });
  res.status(201).json(evaluation);
});

router.put('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  const evaluation = await db.protocolEvaluation.update({ where: { id: req.params.id }, data: req.body });
  res.json(evaluation);
});

router.delete('/:id', async (req, res) => {
  const db = scoped(prisma, req.user?.tenantId);
  await db.protocolEvaluation.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
