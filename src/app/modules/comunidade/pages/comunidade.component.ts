import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  votes: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  date: string;
  votes: number;
  comments: Comment[];
  userVote: 'up' | 'down' | null;
}

const CATEGORIES = ['Casos Clinicos', 'Duvidas Tecnicas', 'Materiais Compartilhados', 'Experiencias', 'Novidades'];

const SEED_POSTS: Post[] = [
  { id: 1, title: 'Caso clinico: Crianca TEA Nivel 2 com regressao apos internacao hospitalar',
    content: 'Atendo um menino de 6 anos, TEA Nivel 2, que apos 3 dias de internacao por pneumonia voltou a fazer xixi na cama (que ja havia superado aos 4) e esta apresentando crises de chao muito intensas na escola. A mae esta desesperada. Alguem ja passou por regressao pos-internacao? Como orientar a familia?',
    category: 'Casos Clinicos', tags: ['TEA', 'regressao', 'internacao', 'orientacao-familiar'], author: 'Dra. Camila Ferreira — CRP 06/123456',
    date: '2026-08-20', votes: 47, userVote: null,
    comments: [
      { id: 1, author: 'Prof. Ricardo Mendes — CRP 04/234567', content: 'Ja atendi caso muito similar. A regressao pos-estresse hospitalar e comum em TEA. O que funcionou: 1) Rotina visual com agenda de fotos, 2) Temporizador para transicoes, 3) Foco em atividades sensoriais calmantes nos primeiros 15min. Levou 3 semanas para estabilizar.', date: '2026-08-20', votes: 23 },
      { id: 2, author: 'Ana Beatriz Souza — CRP 13/345678', content: 'Importante considerar que a internacao quebrou a rotina — que e a ancora do TEA. Nao e regressao, e resposta ao trauma. Recomendo protocolo de estabilizacao: 1 semana so com atividades preferidas, sem demandas. Depois ir reintroduzindo gradualmente.', date: '2026-08-20', votes: 18 },
      { id: 3, author: 'Dr. Fernando Lima — CRM 12345', content: 'Do ponto de vista medico, avaliar se pode haver dor residual ou efeito de medicacao. Diclofenaco e prednisona podem causar irritabilidade. Solicitar retorno ao pediatra.', date: '2026-08-21', votes: 11 },
      { id: 4, author: 'Juliana Reis — Pedagoga', content: 'Na escola, sugerir que o professor diminua as exigencias por 2 semanas e mantenha contato diario com a familia via WhatsApp (mensagem curta com 1 positivo do dia).', date: '2026-08-21', votes: 9 },
    ] },
  { id: 2, title: 'Duvida: SNAP-IV dando falso positivo em crianca bilingue',
    content: 'Tenho um paciente de 7 anos, filhos de pais brasileiros que moram na Italia. Fala portugues em casa e italiano na escola. O SNAP-IV que os pais preencheram deu 9 nos criterios de desatencao, mas quando observo na sessao ele demonstra atencao adequada para atividades de interesse. Como interpretar?',
    category: 'Duvidas Tecnicas', tags: ['SNAP-IV', 'bilingue', 'desatencao', 'diagnostico-diferencial'], author: 'Mariana Oliveira — CRP 07/456789',
    date: '2026-08-19', votes: 38, userVote: null,
    comments: [
      { id: 5, author: 'Prof. Eduardo Santos — CRP 02/567890', content: 'O SNAP-IV normatizado e para criancas monolingues. Em bilingues, a transferencia linguistica pode gerar falso positivo. Sugestao: aplicar o SNAP-IV separadamente para cada ambiente (escola italiano, casa portugues) e comparar.', date: '2026-08-19', votes: 22 },
      { id: 6, author: 'Dra. Priscila Costa — Neuropsicologa', content: 'Bilingues podem apresentar lag na automaticidade lexical sem ter TDAH. Faca avaliacao neuropsicologica complementar: Trail Making, Stroop, Wisconsin. Se as funcoes executivas estiverem ok, provavelmente e o bilinguismo.', date: '2026-08-20', votes: 19 },
    ] },
  { id: 3, title: 'Material: Fichas de rotina visual para criancas TEA (tema juraassico)',
    content: 'Criei 20 fichas de rotina visual com tema de dinossauros para criancas de 3-6 anos TEA. Cada ficha tem ilustracao, icone de atividade e pictograma. Funciona com Velcro no quadro. Arquivo em PDF pronto para imprimir em A5.',
    category: 'Materiais Compartilhados', tags: ['TEA', 'rotina-visual', 'material-terapeutico', 'infantil'], author: 'Patricia Nunes — Terapeuta Ocupacional',
    date: '2026-08-18', votes: 89, userVote: null,
    comments: [
      { id: 7, author: 'Renata Campos', content: 'MARAVILHOSO! Meu paciente de 4 anos ama dinossauros. Vou usar na segunda. Obrigada por compartilhar!', date: '2026-08-18', votes: 14 },
      { id: 8, author: 'Lucas Andrade — Psicopedagogo', content: 'Material excepcional. Sugestao: criar uma versao para adolescentes com tema de jogos eletronicos? Muitos dos meus pacientes de 10-12 anos recusam fichas de bebe.', date: '2026-08-19', votes: 21 },
      { id: 9, author: 'Patricia Nunes', content: 'Estou trabalhando numa versao gamer com temas de Minecraft e Roblox! Sai na proxima semana.', date: '2026-08-19', votes: 17 },
      { id: 10, author: 'Amanda Ribeiro — Escola', content: 'Como professora, agradeco demais. Usar material tematico faz total diferenca na adesao.', date: '2026-08-20', votes: 8 },
    ] },
  { id: 4, title: 'Experiencia: Implementacao de ABA em escola municipal — resultados apos 18 meses',
    content: 'Em 2025, comecamos um projeto piloto de ABA em 3 salas de aula do Ensino Fundamental I de uma escola municipal em SP. Treinamos 12 professores, criamos 45 programas de ensino individualizados e implementamos sistema de fichas token para 28 alunos com TEA.\n\nResultados:\n- 72% reducao em comportamentos disruptivos\n- 89% dos alunos atingiram pelo menos 2 objetivos do PEI\n- Professores relatam 65% menos estresse\n- 3 alunos foram remanejados para sala comum por tempo integral\n\nO maior desafio nao foi tecnico — foi cultural. Professores achavam que dar atencao especial era mimar.',
    category: 'Experiencias', tags: ['ABA', 'escola-publica', 'inclusao', 'formacao-professores'], author: 'Equipe TEA Sao Paulo — Projeto Incluir',
    date: '2026-08-15', votes: 156, userVote: null,
    comments: [
      { id: 11, author: 'Marcos Vieira — Secretario de Educacao', content: 'Excelente relato! Será que posso usar dados anonimizados para apresentar a Secretaria?', date: '2026-08-15', votes: 12 },
      { id: 12, author: 'Fernanda Almeida — Professora', content: 'Como professora de sala comum, o que mais me ajudou foi o check-in diario de 5 minutos com o terapeuta antes da aula.', date: '2026-08-16', votes: 28 },
      { id: 13, author: 'Dr. Andre Teixeira — Psiquiatra', content: 'Dados impressionantes. Gostaria de publicar em periodico. Podemos conversar sobre protocolo de pesquisa?', date: '2026-08-16', votes: 15 },
    ] },
  { id: 5, title: 'Duvida: Laudo para escola pedindo definitivo — o que fazer?',
    content: 'A escola de um paciente TDAH solicitou um laudo com diagnostico definitivo para liberar adaptacoes. Expliquei que psicopedagogo nao emite diagnostico medico, mas a escola insiste. A mae esta pressionando. Como voces lidam com esse tipo de solicitacao sem colocar em risco profissional?',
    category: 'Duvidas Tecnicas', tags: ['laudo', 'TDAH', 'etica-profissional', 'adaptacoes-escolares'], author: 'Thais Albuquerque — CRP 09/678901',
    date: '2026-08-17', votes: 72, userVote: null,
    comments: [
      { id: 16, author: 'Dr. Paulo Ricardo — Advogado Sanitarista', content: 'NUNCA emitir diagnostico definitivo. Use: Hipotese clinica compativel com quadro de TDAH, recomendando avaliacao neurologica para confirmacao. Art. 8 da Resolucao CFP 06/2019.', date: '2026-08-17', votes: 45 },
      { id: 17, author: 'Renata Freitas — Coordenadora Pedagogica', content: 'Como gestora escolar, posso dizer que o laudo com hipotese clinica e aceito sim pela rede. O que a escola precisa e de um documento que embase as adaptacoes.', date: '2026-08-18', votes: 31 },
    ] },
  { id: 6, title: 'Novidade: Atualizacao do sistema — Blindagem LGPD e PEI com IA',
    content: 'Pessoal, o sistema recebeu atualizacao importante!\n\n1. Auditoria LGPD: Antes de enviar um laudo, clique em Auditar LGPD e o sistema verifica CPF exposto, diagnostico fechado, linguagem arriscada.\n\n2. PEI com IA: Na aba Plano IA, o botao Gerar PEI cria um plano completo com 4 fases.\n\n3. Planner de Sessoes: Cronometro por fase da sessao.\n\nTestem e deem feedback!',
    category: 'Novidades', tags: ['atualizacao', 'LGPD', 'PEI', 'IA', 'sistema'], author: 'Suporte EduPsych',
    date: '2026-08-21', votes: 34, userVote: null,
    comments: [
      { id: 19, author: 'Marcos Silva', content: 'A auditoria LGPD e genial! Testei com um laudo antigo e pegou 3 problemas que eu nao tinha percebido.', date: '2026-08-21', votes: 12 },
      { id: 20, author: 'Camila Rodrigues', content: 'O PEI com IA salvou meu fim de semana! Gerei o plano em 2 minutos e so refinei.', date: '2026-08-21', votes: 18 },
    ] },
  { id: 7, title: 'Caso clinico: Adolescente com dislexia severa e autoestima zerada',
    content: 'Menina de 13 anos, dislexia severa (score 2 no SADE), QI 98 (WISC V). Le no nivel do 2o ano. Esta no 8o ano em escola particular com matricula inclusiva mas sem adaptacao nenhuma. Apresenta sintomas depressivos, isolamento social e disse que prefere morrer que ir pra escola.\n\nPreciso de orientacao urgente: 1) Como fazer a devolutiva sem destruir a familia? 2) Quais adaptacoes urgentes posso sugerir? 3) Alguem indica material de autoestima para dislexicos adolescentes?',
    category: 'Casos Clinicos', tags: ['dislexia', 'adolescente', 'autoestima', 'devolutiva', 'urgencia'], author: 'Dra. Beatriz Santos — CRP 05/789012',
    date: '2026-08-16', votes: 93, userVote: null,
    comments: [
      { id: 21, author: 'Prof. Claudia Mendes — CRP 01/890123', content: '1) Devolutiva: nunca comece pelo deficit. Comece pelo perfil cognitivo forte (QI 98 = inteligencia adequada). Depois apresente a dislexia como seu cerebro processa letras de forma diferente. 2) Adaptacoes URGENTES: provas oralizadas, material digital com fonte OpenDyslexic, tempo extra 50%. 3) Material: O Menino que Descobriu Outra Vez o Mundo.', date: '2026-08-16', votes: 67 },
      { id: 22, author: 'Dra. Renata Vieira — Psicologa Clinica', content: 'Os sintomas depressivos sao serios. Avaliar risco de autolesao com Columbia Suicide Severity Rating Scale. Se confirmado, encaminhamento psiquiatrico urgente.', date: '2026-08-17', votes: 52 },
      { id: 23, author: 'Fernanda Costa — Educadora Social', content: 'O programa Apoia Social da Prefeitura de SP tem atendimento psicologico gratuito para adolescentes. Posso passar o contato.', date: '2026-08-17', votes: 14 },
    ] },
  { id: 8, title: 'Duvida: Como avaliar funcoes executivas em criancas de 4 anos?',
    content: 'Tenho um paciente de 4 anos com suspeita de TDAH. Pais e professores relatam dificuldades de organizacao, esquecimentos e impulsividade. Mas todas as escalas validadas para TDAH sao a partir de 6 anos. Como voces avaliam funcoes executivas nessa faixa etaria? Existe alguma escala ou protocolo adaptado?',
    category: 'Duvidas Tecnicas', tags: ['funcoes-executivas', 'TDAH', 'avaliacao', 'pré-escolar'], author: 'Pedro Henrique Almeida — CRP 11/112233',
    date: '2026-08-14', votes: 41, userVote: null,
    comments: [
      { id: 24, author: 'Dra. Carla Ruaro — Neuropsicologa', content: 'Use a bateria BRIEF-P (Behavior Rating Inventory of Executive Function — Preschool). E validada para 2-5 anos. Tambem o Five Digit Test adaptado e observacao estruturada em brincadeiras dirigidas.', date: '2026-08-14', votes: 29 },
      { id: 25, author: 'Prof. Lucas Teixeira', content: 'Na pratica, observo: 1) Capacidade de esperar a vez em jogos, 2) Seguimento de instrucoes com 2 etapas, 3) Mudanca de atividade sem crises. Registro em ficha de observacao por 2 semanas.', date: '2026-08-15', votes: 18 },
    ] },
  { id: 9, title: 'Material: Planilha de coleta de dados ABA automatizada',
    content: 'Criei uma planilha Excel que calcula automaticamente a taxa de aquisicao, o percentual de acerto e gera grafico de tendencia para programas DTT. Funciona para qualquer tipo de dado: % de acerto, frequencia comportamental e latencia. Template com 5 programas preenchidos como exemplo.',
    category: 'Materiais Compartilhados', tags: ['ABA', 'coleta-de-dados', 'DTT', 'planilha', 'automacao'], author: 'Ricardo Barros — Analista de Comportamento',
    date: '2026-08-13', votes: 64, userVote: null,
    comments: [
      { id: 26, author: 'Vanessa Lima', content: 'EXATAMENTE o que eu precisava! Estava fazendo na mao. Obrigada!', date: '2026-08-13', votes: 11 },
      { id: 27, author: 'Ricardo Barros', content: 'Link de download: [simulado]. Qualquer duvida sobre como usar, me chamem.', date: '2026-08-13', votes: 7 },
    ] },
  { id: 10, title: 'Experiencia: 3 anos atendendo pelo SUS — como sobreviver e fazer diferenca',
    content: 'Faz 3 anos que atendo pelo CAPSi. Quero compartilhar o que aprendi:\n\n1) O encaminhamento sempre chega atrasado — a crianca ja tem 2 anos de atraso quando chega\n2) Lista de espera de 6 meses — use esse tempo para orientar a familia por telefone\n3) Material caro nao existe aqui — adapte com papel, caneta e criatividade\n4) Documentacao e excessiva — mas e sua protecao juridica\n5) O maiorfeito que voce faz e ensinar os pais\n\nNao e facil, mas e onde voce faz mais diferenca.',
    category: 'Experiencias', tags: ['SUS', 'CAPSi', 'saude-publica', 'realidade-brasileira'], author: 'Dra. Juliana Nascimento — CRP 08/334455',
    date: '2026-08-12', votes: 127, userVote: null,
    comments: [
      { id: 28, author: 'Marcos Oliveira — Psicopedagogo SUS', content: 'Realidade identica a minha. O ponto 5 e o mais importante. Pais bem orientados fazem mais que 10 sessoes.', date: '2026-08-12', votes: 34 },
      { id: 29, author: 'Ana Carolina Silva — Estagiaria', content: 'Obrigada pelo relato sincero. Estou entrando no CAPSi e estava com medo. Isso me deu perspectiva real.', date: '2026-08-13', votes: 19 },
    ] },
];

@Component({
  selector: 'app-comunidade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-in">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900">Comunidade</h1>
          <p class="text-sm text-slate-500 mt-1">Forum de discussao entre profissionais — compartilhe casos, materiais e experiencias</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative flex-1 max-w-md">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
            <input class="w-full pl-12 pr-4 py-3 bg-white rounded-2xl text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Buscar posts..." [(ngModel)]="searchTerm" (input)="filterPosts()">
          </div>
          <button class="px-4 py-3 bg-primary text-on-primary rounded-2xl text-xs font-bold transition-all"
            (click)="showNewPostModal.set(true)">
            <span class="material-icons text-[14px] align-middle mr-1">add</span> Novo Post
          </button>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button class="px-4 py-2 rounded-xl text-xs font-bold transition-all"
          [class]="activeCategory() === '' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-primary/50'"
          (click)="activeCategory.set(''); filterPosts()">
          Todos
        </button>
        @for (cat of categories; track cat) {
          <button class="px-4 py-2 rounded-xl text-xs font-bold transition-all"
            [class]="activeCategory() === cat ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-primary/50'"
            (click)="activeCategory.set(cat); filterPosts()">
            {{ cat }}
          </button>
        }
      </div>

      <div class="flex gap-6">
        <div class="flex-1 space-y-4">
          @for (post of filteredPosts(); track post.id) {
            <div class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5 hover:ring-primary/30 transition-all">
              <div class="flex gap-4">
                <div class="flex flex-col items-center gap-1 shrink-0">
                  <button class="p-1 rounded-lg transition-all hover:bg-emerald-50"
                    [class]="post.userVote === 'up' ? 'text-emerald-600' : 'text-slate-400'"
                    (click)="vote(post.id, 'up')">
                    <span class="material-icons text-lg">arrow_upward</span>
                  </button>
                  <span class="text-sm font-black" [class]="post.votes > 0 ? 'text-emerald-600' : 'text-slate-400'">{{ post.votes }}</span>
                  <button class="p-1 rounded-lg transition-all hover:bg-red-50"
                    [class]="post.userVote === 'down' ? 'text-red-600' : 'text-slate-400'"
                    (click)="vote(post.id, 'down')">
                    <span class="material-icons text-lg">arrow_downward</span>
                  </button>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" [class]="getCategoryStyle(post.category)">{{ post.category }}</span>
                    @for (tag of post.tags; track tag) {
                      <span class="text-[10px] text-slate-400">#{{ tag }}</span>
                    }
                  </div>
                  <h3 class="font-bold text-slate-900 text-sm mb-2 cursor-pointer hover:text-primary transition-colors"
                    (click)="openPost(post)">{{ post.title }}</h3>
                  <p class="text-xs text-slate-500 mb-3 line-clamp-2">{{ post.content }}</p>
                  <div class="flex items-center gap-4 text-[10px] text-slate-500">
                    <span class="flex items-center gap-1">
                      <span class="material-icons text-[12px]">person</span> {{ post.author }}
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="material-icons text-[12px]">schedule</span> {{ post.date }}
                    </span>
                    <button class="flex items-center gap-1 hover:text-primary transition-colors" (click)="openPost(post)">
                      <span class="material-icons text-[12px]">chat_bubble_outline</span> {{ post.comments.length }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
          @if (filteredPosts().length === 0) {
            <div class="text-center py-12">
              <span class="material-icons text-6xl text-slate-300">forum</span>
              <p class="text-slate-500 mt-3">Nenhum post encontrado</p>
            </div>
          }
        </div>

        <div class="w-80 shrink-0 hidden lg:block space-y-4">
          <div class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5">
            <h3 class="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <span class="material-icons text-amber-500 text-sm">local_fire_department</span>
              Mais Discutidas
            </h3>
            <div class="space-y-3">
              @for (post of topPosts(); track post.id) {
                <div class="flex gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all" (click)="openPost(post)">
                  <span class="text-lg font-black text-primary/30">{{ post.votes }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-slate-900 truncate">{{ post.title }}</p>
                    <p class="text-[10px] text-slate-500">{{ post.comments.length }} comentarios</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5">
            <h3 class="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <span class="material-icons text-primary text-sm">person</span>
              Meu Perfil
            </h3>
            <div class="flex items-center gap-3 mb-4">
              <div class="size-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span class="material-icons text-primary text-xl">person</span>
              </div>
              <div>
                <p class="text-sm font-bold text-slate-900">Dra. Sarah Miller</p>
                <p class="text-[10px] text-slate-500">Psicopedagoga — CRP 06/999999</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-center">
              <div class="p-2 bg-slate-50 rounded-xl">
                <p class="text-lg font-black text-primary">{{ userPostCount() }}</p>
                <p class="text-[10px] text-slate-500">Posts</p>
              </div>
              <div class="p-2 bg-slate-50 rounded-xl">
                <p class="text-lg font-black text-emerald-600">{{ userTotalVotes() }}</p>
                <p class="text-[10px] text-slate-500">Votos</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5">
            <h3 class="font-bold text-slate-900 text-sm mb-3">Tags Populares</h3>
            <div class="flex flex-wrap gap-2">
              @for (tag of popularTags(); track tag) {
                <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold cursor-pointer hover:bg-primary/10 hover:text-primary transition-all">
                  #{{ tag }}
                </span>
              }
            </div>
          </div>
        </div>
      </div>
    </div>

    @if (selectedPost()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="selectedPost.set(null)">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 ring-1 ring-slate-200 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" [class]="getCategoryStyle(selectedPost()!.category)">{{ selectedPost()!.category }}</span>
            </div>
            <button class="p-2 text-slate-500" (click)="selectedPost.set(null)">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="p-6">
            <div class="flex gap-4 mb-6">
              <div class="flex flex-col items-center gap-1 shrink-0">
                <button class="p-1 rounded-lg transition-all hover:bg-emerald-50"
                  [class]="selectedPost()!.userVote === 'up' ? 'text-emerald-600' : 'text-slate-400'"
                  (click)="vote(selectedPost()!.id, 'up')">
                  <span class="material-icons text-lg">arrow_upward</span>
                </button>
                <span class="text-sm font-black">{{ selectedPost()!.votes }}</span>
                <button class="p-1 rounded-lg transition-all hover:bg-red-50"
                  [class]="selectedPost()!.userVote === 'down' ? 'text-red-600' : 'text-slate-400'"
                  (click)="vote(selectedPost()!.id, 'down')">
                  <span class="material-icons text-lg">arrow_downward</span>
                </button>
              </div>
              <div>
                <h2 class="text-lg font-black text-slate-900 mb-2">{{ selectedPost()!.title }}</h2>
                <div class="flex items-center gap-3 text-[10px] text-slate-500 mb-4">
                  <span>{{ selectedPost()!.author }}</span>
                  <span>{{ selectedPost()!.date }}</span>
                </div>
                <p class="text-sm text-slate-700 whitespace-pre-line">{{ selectedPost()!.content }}</p>
                <div class="flex gap-2 mt-3">
                  @for (tag of selectedPost()!.tags; track tag) {
                    <span class="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px]">#{{ tag }}</span>
                  }
                </div>
              </div>
            </div>

            <div class="border-t border-slate-100 pt-4">
              <h4 class="font-bold text-slate-900 text-sm mb-4">{{ selectedPost()!.comments.length }} Comentarios</h4>
              <div class="space-y-4 mb-4">
                @for (comment of selectedPost()!.comments; track comment.id) {
                  <div class="flex gap-3">
                    <div class="size-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                      <span class="material-icons text-slate-500 text-sm">person</span>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-bold text-slate-900">{{ comment.author }}</span>
                        <span class="text-[10px] text-slate-500">{{ comment.date }}</span>
                      </div>
                      <p class="text-xs text-slate-700">{{ comment.content }}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <button class="text-[10px] text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-1">
                          <span class="material-icons text-[10px]">thumb_up</span> {{ comment.votes }}
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
              <div class="flex gap-3">
                <div class="size-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <span class="material-icons text-primary text-sm">person</span>
                </div>
                <div class="flex-1">
                  <textarea class="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-primary outline-none resize-none"
                    rows="2" placeholder="Escreva um comentario..." [(ngModel)]="newComment"></textarea>
                  <button class="mt-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold transition-all"
                    (click)="addComment()">
                    Comentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    @if (showNewPostModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="showNewPostModal.set(false)">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 ring-1 ring-slate-200" (click)="$event.stopPropagation()">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 class="font-bold text-slate-900">Novo Post</h3>
            <button class="p-2 text-slate-500" (click)="showNewPostModal.set(false)">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Titulo</label>
              <input class="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-sm ring-1 ring-slate-200" placeholder="Titulo do post" [(ngModel)]="newPostTitle">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
              <div class="flex flex-wrap gap-2">
                @for (cat of categories; track cat) {
                  <button class="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                    [class]="newPostCategory() === cat ? 'bg-primary text-on-primary' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'"
                    (click)="newPostCategory.set(cat)">
                    {{ cat }}
                  </button>
                }
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Tags (separadas por virgula)</label>
              <input class="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-sm ring-1 ring-slate-200" placeholder="tag1, tag2, tag3" [(ngModel)]="newPostTags">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Conteudo</label>
              <textarea class="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-sm ring-1 ring-slate-200 resize-none" rows="5"
                placeholder="Escreva seu post..." [(ngModel)]="newPostContent"></textarea>
            </div>
            <button class="w-full py-3 bg-primary text-on-primary rounded-xl text-xs font-bold transition-all" (click)="createPost()">
              <span class="material-icons text-[14px] align-middle mr-1">publish</span> Publicar
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class ComunidadeComponent {
  categories = CATEGORIES;

  searchTerm = '';
  activeCategory = signal('');
  posts = [...SEED_POSTS];
  filteredPosts = signal<Post[]>(SEED_POSTS);
  selectedPost = signal<Post | null>(null);
  showNewPostModal = signal(false);
  newComment = '';
  newPostTitle = '';
  newPostContent = '';
  newPostTags = '';
  newPostCategory = signal('');

  topPosts = computed(() => [...this.posts].sort((a, b) => b.votes - a.votes).slice(0, 5));
  userPostCount = computed(() => this.posts.filter(p => p.author === 'Dra. Sarah Miller').length);
  userTotalVotes = computed(() => this.posts.filter(p => p.author === 'Dra. Sarah Miller').reduce((sum, p) => sum + p.votes, 0));

  popularTags = computed(() => {
    const tags: Record<string, number> = {};
    this.posts.forEach(p => p.tags.forEach(t => tags[t] = (tags[t] || 0) + 1));
    return Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 8).map(t => t[0]);
  });

  filterPosts() {
    const term = this.searchTerm.toLowerCase();
    const cat = this.activeCategory();
    this.filteredPosts.set(
      this.posts.filter(p => {
        const matchSearch = !term || p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term) || p.tags.some(t => t.includes(term));
        const matchCat = !cat || p.category === cat;
        return matchSearch && matchCat;
      })
    );
  }

  getCategoryStyle(cat: string): string {
    const styles: Record<string, string> = {
      'Casos Clinicos': 'bg-blue-100 text-blue-700',
      'Duvidas Tecnicas': 'bg-amber-100 text-amber-700',
      'Materiais Compartilhados': 'bg-emerald-100 text-emerald-700',
      'Experiencias': 'bg-purple-100 text-purple-700',
      'Novidades': 'bg-cyan-100 text-cyan-700',
    };
    return styles[cat] || 'bg-slate-100 text-slate-700';
  }

  vote(postId: number, direction: 'up' | 'down') {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;
    if (post.userVote === direction) {
      post.votes += direction === 'up' ? -1 : 1;
      post.userVote = null;
    } else {
      if (post.userVote) post.votes += post.userVote === 'up' ? -1 : 1;
      post.votes += direction === 'up' ? 1 : -1;
      post.userVote = direction;
    }
    this.filterPosts();
  }

  openPost(post: Post) {
    this.selectedPost.set(post);
    this.newComment = '';
  }

  addComment() {
    const post = this.selectedPost();
    if (!post || !this.newComment.trim()) return;
    post.comments.push({
      id: Date.now(),
      author: 'Dra. Sarah Miller',
      content: this.newComment.trim(),
      date: new Date().toISOString().split('T')[0],
      votes: 0
    });
    this.newComment = '';
  }

  createPost() {
    if (!this.newPostTitle.trim() || !this.newPostContent.trim()) return;
    const tags = this.newPostTags.split(',').map(t => t.trim()).filter(Boolean);
    this.posts.unshift({
      id: Date.now(),
      title: this.newPostTitle.trim(),
      content: this.newPostContent.trim(),
      category: this.newPostCategory() || this.categories[0],
      tags,
      author: 'Dra. Sarah Miller',
      date: new Date().toISOString().split('T')[0],
      votes: 0,
      comments: [],
      userVote: null
    });
    this.newPostTitle = '';
    this.newPostContent = '';
    this.newPostTags = '';
    this.newPostCategory.set('');
    this.showNewPostModal.set(false);
    this.filterPosts();
  }
}
