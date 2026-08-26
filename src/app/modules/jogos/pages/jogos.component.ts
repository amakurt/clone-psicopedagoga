import { Component, signal, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Jogo {
  id: number;
  name: string;
  category: string;
  difficulty: number;
  time: string;
  ageRange: string;
  description: string;
  type: string;
}

const JOGOS_DATA: Jogo[] = [
  { id: 1, name: 'Caça à Estrela', category: 'Atenção', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Encontre a estrela azul entre os círculos cinza', type: 'attention' },
  { id: 2, name: 'Contagem Rápida', category: 'Atenção', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Toque nos frutos aparecendo na tela o mais rápido possível', type: 'tap' },
  { id: 3, name: 'Stroop Simples', category: 'Atenção', difficulty: 2, time: '3 min', ageRange: '6-10', description: 'Diga a cor da tinta, ignore a palavra escrita', type: 'stroop' },
  { id: 4, name: 'Atenção Dividida', category: 'Atenção', difficulty: 3, time: '5 min', ageRange: '8-12', description: 'Toque nos círculos azuis e ignore os vermelhos ao mesmo tempo', type: 'tap' },
  { id: 5, name: 'Inibir Resposta', category: 'Atenção', difficulty: 2, time: '3 min', ageRange: '6-10', description: 'Toque apenas nos quadrados — nunca nos círculos', type: 'tap' },
  { id: 6, name: 'Rastreamento Visual', category: 'Atenção', difficulty: 2, time: '3 min', ageRange: '5-9', description: 'Siga a estrela com o olhar e toque nela quando parar', type: 'tap' },
  { id: 7, name: 'Memória de Cores', category: 'Atenção', difficulty: 1, time: '3 min', ageRange: '3-6', description: 'Lembre-se das cores mostradas e repita a sequência', type: 'sequence' },
  { id: 8, name: 'Sequência Numérica', category: 'Atenção', difficulty: 2, time: '3 min', ageRange: '5-9', description: 'Complete a sequência de números na ordem correta', type: 'sequence' },
  { id: 9, name: 'Memória de Posições', category: 'Atenção', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Lembre-se de onde cada emoji estava escondido', type: 'memory' },
  { id: 10, name: 'Caça Palavras', category: 'Atenção', difficulty: 3, time: '5 min', ageRange: '7-12', description: 'Encontre as letras que formam a palavra escondida', type: 'attention' },

  { id: 11, name: 'Jogo da Memória', category: 'Memória', difficulty: 1, time: '5 min', ageRange: '3-8', description: 'Encontre os pares de frutas virando as cartas', type: 'memory', },
  { id: 12, name: 'Memória de Animais', category: 'Memória', difficulty: 1, time: '5 min', ageRange: '3-7', description: 'Encontre os pares de animais escondidos', type: 'memory' },
  { id: 13, name: 'Memória de Números', category: 'Memória', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'Lembre-se dos números e encontre os pares', type: 'memory' },
  { id: 14, name: 'Memória de Formas', category: 'Memória', difficulty: 1, time: '3 min', ageRange: '3-6', description: 'Encontre as formas geométricas iguais', type: 'memory' },
  { id: 15, name: 'Super Memória', category: 'Memória', difficulty: 3, time: '7 min', ageRange: '8-12', description: 'Grade 4x4 com 8 pares — desafio máximo', type: 'memory' },
  { id: 16, name: 'Memória de Sequências', category: 'Memória', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'Repita sequências de cores cada vez maiores', type: 'sequence' },
  { id: 17, name: 'Lembre-se dos Objetos', category: 'Memória', difficulty: 1, time: '3 min', ageRange: '3-7', description: 'Quais objetos foram mostrados? Toque nos que lembra', type: 'tap' },
  { id: 18, name: 'Memória Visual', category: 'Memória', difficulty: 2, time: '5 min', ageRange: '5-9', description: 'Veja a imagem e encontre ela entre as opções', type: 'tap' },
  { id: 19, name: 'Pares de Emojis', category: 'Memória', difficulty: 1, time: '5 min', ageRange: '3-7', description: 'Encontre os pares de emojis iguais', type: 'memory' },
  { id: 20, name: 'Memória de Trabalho', category: 'Memória', difficulty: 3, time: '5 min', ageRange: '7-12', description: 'Guarde 5 números na memória e repita ao contrário', type: 'tap' },

  { id: 21, name: 'Organize a Fila', category: 'Funções Executivas', difficulty: 1, time: '5 min', ageRange: '4-8', description: 'Organize os números de 1 a 6 na ordem correta', type: 'sequence' },
  { id: 22, name: 'Mude de Regra', category: 'Funções Executivas', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Às vezes clique no círculo, às vezes no quadrado — a regra muda!', type: 'tap' },
  { id: 23, name: 'Stroop Avançado', category: 'Funções Executivas', difficulty: 3, time: '5 min', ageRange: '8-12', description: 'Cores aparecem escritas em cores diferentes — responda rápido!', type: 'stroop' },
  { id: 24, name: 'Classificação', category: 'Funções Executivas', difficulty: 1, time: '3 min', ageRange: '3-7', description: 'Toque apenas nos animais — ignore os objetos', type: 'tap' },
  { id: 25, name: 'Sequência de Passos', category: 'Funções Executivas', difficulty: 1, time: '5 min', ageRange: '4-8', description: 'Ordene os passos de escovar os dentes na sequência certa', type: 'sequence' },
  { id: 26, name: 'Controle de Impulsos', category: 'Funções Executivas', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Toque quando o semáforo ficar verde — espere o sinal!', type: 'tap' },
  { id: 27, name: 'Flexibilidade Mental', category: 'Funções Executivas', difficulty: 3, time: '5 min', ageRange: '7-12', description: 'Alternar entre contar vogais e consoantes sem errar', type: 'tap' },
  { id: 28, name: 'Tombe Switch', category: 'Funções Executivas', difficulty: 3, time: '5 min', ageRange: '8-12', description: 'Mude entre regras: às vezes cor, às vezes forma', type: 'tap' },
  { id: 29, name: 'Planejamento', category: 'Funções Executivas', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Encontre o caminho mais curto entre os pontos', type: 'tap' },
  { id: 30, name: 'Memória Operacional', category: 'Funções Executivas', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Guarde o número e Some +3 — teste de memória de trabalho', type: 'tap' },

  { id: 31, name: 'Rimas Básicas', category: 'Consciência Fonológica', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Qual palavra rima com "SOLA"? Toque na resposta', type: 'phonology' },
  { id: 32, name: 'Sílabas', category: 'Consciência Fonológica', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Separe a palavra em sílabas: CA-SA = 2 sílabas', type: 'phonology' },
  { id: 33, name: 'Som Inicial', category: 'Consciência Fonológica', difficulty: 1, time: '3 min', ageRange: '4-6', description: 'Qual letra começa "MAÇÃ"? Toque na letra correta', type: 'phonology' },
  { id: 34, name: 'Som Final', category: 'Consciência Fonológica', difficulty: 2, time: '3 min', ageRange: '5-8', description: 'Qual letra termina "SOL"? Toque na resposta', type: 'phonology' },
  { id: 35, name: 'Contagem de Sílabas', category: 'Consciência Fonológica', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Quantas sílabas tem "BOR-BO-CHA"? Toque no número', type: 'phonology' },
  { id: 36, name: 'Troca de Letras', category: 'Consciência Fonológica', difficulty: 2, time: '5 min', ageRange: '5-8', description: 'Troque o M de "MATO" por R — qual palavra fica?', type: 'phonology' },
  { id: 37, name: 'Complete a Rima', category: 'Consciência Fonológica', difficulty: 2, time: '5 min', ageRange: '5-8', description: '"Peixe ___" — qual palavra completa a rima?', type: 'phonology' },
  { id: 38, name: 'Fonemas', category: 'Consciência Fonológica', difficulty: 2, time: '5 min', ageRange: '5-9', description: 'Separe "SOL" em sons individuais: S-O-L', type: 'phonology' },
  { id: 39, name: 'Junte Sílabas', category: 'Consciência Fonológica', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'CA + SO = ? Toque na palavra formada', type: 'phonology' },
  { id: 40, name: 'Fonologia Avançada', category: 'Consciência Fonológica', difficulty: 3, time: '5 min', ageRange: '6-10', description: 'Misto: rimas, sílabas e sons — desafio completo', type: 'phonology' },

  { id: 41, name: 'Soma Simples', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Resolva somas de números de 1 a 20', type: 'math' },
  { id: 42, name: 'Subtração', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '5-8', description: 'Resolva subtrações simples com resultados positivos', type: 'math' },
  { id: 43, name: 'Comparação', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Maior, menor ou igual? Toque no símbolo correto', type: 'compare' },
  { id: 44, name: 'Contagem de Objetos', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '3-6', description: 'Conte quantos frutos aparecem na tela', type: 'tap' },
  { id: 45, name: 'Tabuada', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '7-10', description: 'Pratique multiplicações de 1 a 10', type: 'math' },
  { id: 46, name: 'Problemas', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Resolva problemas escritos com operações simples', type: 'math' },
  { id: 47, name: 'Sequência Crescente', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Organize os números na ordem crescente', type: 'sequence' },
  { id: 48, name: 'Frações Visuais', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '7-10', description: 'Qual fração representa a pizza colorida?', type: 'tap' },
  { id: 49, name: 'Formas Geométricas', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '5-9', description: 'Identifique: círculo, quadrado, triângulo, retângulo', type: 'tap' },
  { id: 50, name: 'Desafio Matemático', category: 'Matemática', difficulty: 3, time: '7 min', ageRange: '8-12', description: 'Misto: somas, subtrações e multiplicações difíceis', type: 'math' },

  { id: 51, name: 'Emoções no Rosto', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-8', description: 'Identifique se a pessoa está feliz, triste ou com raiva', type: 'social' },
  { id: 52, name: 'Empatia', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '4-8', description: 'Como a pessoa se sente? Escolha a resposta certa', type: 'social' },
  { id: 53, name: 'Situações Sociais', category: 'Socioemocional', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'O que fazer quando alguém está triste na escola?', type: 'social' },
  { id: 54, name: 'Respiração', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-8', description: 'Siga o balão: inspire quando crescer, expire quando diminuir', type: 'tap' },
  { id: 55, name: 'Expressão de Sentimentos', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-7', description: 'Como VOCÊ se sente agora? Toque na emoção', type: 'social' },
  { id: 56, name: 'Resolução de Conflitos', category: 'Socioemocional', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Dois amigos brigaram pelo brinquedo — qual a solução pacífica?', type: 'social' },
  { id: 57, name: 'Cooperação', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-7', description: 'Aprenda sobre trabalhar junto e ajudar os amigos', type: 'social' },
  { id: 58, name: 'Paciência', category: 'Socioemocional', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'Espere a vez sem interromper — exercício de paciência', type: 'tap' },
  { id: 59, name: 'Gratidão', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-8', description: 'Pense em 3 coisas pelas quais você é grato hoje', type: 'social' },
  { id: 60, name: 'Autoconhecimento', category: 'Socioemocional', difficulty: 3, time: '7 min', ageRange: '7-12', description: 'Misto: emoções, conflitos e regulação — desafio completo', type: 'social' },
];

@Component({
  selector: 'app-jogos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-in">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">60 Jogos Cognitivos</h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Atividades interativas para estimulação cognitiva</p>
        </div>
        <div class="relative w-full sm:max-w-md">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
          <input class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="Buscar jogo..." [(ngModel)]="searchTerm" (input)="filterGames()">
        </div>
      </div>

      <div class="flex flex-wrap gap-2 sm:gap-3">
        @for (cat of categories; track cat) {
          <button class="px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all"
            [class]="filterCategory() === cat ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50'"
            (click)="filterCategory.set(cat); filterGames()">
            {{ cat || 'Todos' }}
          </button>
        }
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        @for (jogo of filteredGames(); track jogo.id) {
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden hover:ring-primary/50 hover:-translate-y-1 transition-all">
            <div class="h-20 sm:h-28 flex items-center justify-center" [class]="getCategoryBg(jogo.category)">
              <span class="material-icons text-3xl sm:text-4xl opacity-60">{{ getCategoryIcon(jogo.category) }}</span>
            </div>
            <div class="p-3 sm:p-4">
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-tight">{{ jogo.name }}</h3>
                <span class="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shrink-0" [class]="getCategoryStyle(jogo.category)">
                  {{ jogo.category.split(' ')[0] }}
                </span>
              </div>
              <p class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{{ jogo.description }}</p>
              <div class="flex items-center gap-1 sm:gap-2 mb-3">
                @for (star of [1,2,3]; track star) {
                  <span class="material-icons text-[12px] sm:text-[14px]"
                    [class]="star <= jogo.difficulty ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'">star</span>
                }
                <span class="text-[9px] sm:text-[10px] text-slate-500 ml-1">{{ jogo.time }}</span>
                <span class="text-[9px] sm:text-[10px] text-slate-500">· {{ jogo.ageRange }} anos</span>
              </div>
              <button class="w-full py-2 sm:py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-[10px] sm:text-xs font-bold transition-all active:scale-95"
                (click)="startGame(jogo)">
                <span class="material-icons text-[12px] sm:text-[14px] align-middle mr-1">play_arrow</span> Jogar
              </button>
            </div>
          </div>
        }
      </div>

      @if (filteredGames().length === 0) {
        <div class="text-center py-12">
          <span class="material-icons text-6xl text-slate-300">sports_esports</span>
          <p class="text-slate-500 mt-3">Nenhum jogo encontrado</p>
        </div>
      }
    </div>

    @if (showGameModal()) {
      <!-- Overlay de bloqueio para modo retrato em dispositivos móveis -->
      @if (isPortraitMobile()) {
        <div class="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white select-none animate-in">
          <div class="size-20 rounded-3xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center mb-6 animate-bounce shadow-lg shadow-primary/20">
            <span class="material-icons text-5xl">screen_rotation</span>
          </div>
          <h3 class="text-2xl font-black mb-2 text-white">Gire seu aparelho</h3>
          <p class="text-slate-300 text-sm max-w-xs mb-8 leading-relaxed">
            Para garantir a precisão e a usabilidade dos testes e jogos cognitivos, por favor <strong class="text-white">vire o celular na horizontal (modo paisagem)</strong>.
          </p>
          <button (click)="closeGame()" class="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all active:scale-95">
            Cancelar e Fechar
          </button>
        </div>
      }

      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4" (click)="closeGame()">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full sm:max-w-2xl ring-1 ring-slate-200 dark:ring-slate-800 max-h-[96vh] overflow-y-auto" (click)="$event.stopPropagation()">
          @if (!gameFinished()) {
            <div class="p-3 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div class="min-w-0 flex-1">
                <h3 class="text-sm sm:text-lg font-black text-slate-900 dark:text-white truncate">{{ currentGame()?.name }}</h3>
                <p class="text-[10px] sm:text-xs text-slate-500">{{ currentGame()?.category }} · {{ currentGame()?.ageRange }} anos</p>
              </div>
              <div class="flex items-center gap-3 sm:gap-4 shrink-0 ml-3">
                <div class="text-center">
                  <p class="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">Tempo</p>
                  <p class="text-sm sm:text-lg font-black text-primary">{{ formatTime(gameTimer()) }}</p>
                </div>
                <div class="text-center">
                  <p class="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">Pontos</p>
                  <p class="text-sm sm:text-lg font-black text-emerald-600">{{ gameScore() }}</p>
                </div>
                <button class="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" (click)="closeGame()">
                  <span class="material-icons">close</span>
                </button>
              </div>
            </div>
            <div class="p-3 sm:p-6">
              <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 sm:p-6 min-h-[220px] sm:min-h-[300px] flex flex-col items-center justify-center">
                @if (!gameStarted()) {
                  <p class="text-slate-600 dark:text-slate-300 text-center mb-4 sm:mb-6 text-sm sm:text-base px-2">{{ currentGame()?.description }}</p>
                  <button class="px-6 sm:px-8 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm sm:text-base"
                    (click)="initGame()">
                    Iniciar Jogo
                  </button>
                } @else {
                  <canvas #gameCanvas class="rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 max-w-[500px]" style="touch-action: manipulation;"></canvas>
                  <p class="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3 text-center px-2">{{ gameInstruction() }}</p>
                }
              </div>
            </div>
          } @else {
            <div class="p-6 sm:p-8 text-center">
              <div class="size-16 sm:size-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="material-icons text-emerald-600 dark:text-emerald-400 text-3xl sm:text-4xl">emoji_events</span>
              </div>
              <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">Parabéns!</h3>
              <p class="text-sm sm:text-slate-500 dark:text-slate-400 mb-6">{{ currentGame()?.name }}</p>
              <div class="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div class="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p class="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">Pontuação</p>
                  <p class="text-2xl sm:text-3xl font-black text-emerald-600">{{ gameScore() }}</p>
                </div>
                <div class="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p class="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">Tempo</p>
                  <p class="text-2xl sm:text-3xl font-black text-primary">{{ formatTime(gameTimer()) }}</p>
                </div>
              </div>
              @if (getHighScore(currentGame()?.id || 0)) {
                <p class="text-xs text-slate-500 mb-4">Recorde: {{ getHighScore(currentGame()?.id || 0) }} pontos</p>
              }
              <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 sm:p-6 text-left mb-6">
                <div class="flex items-center gap-2 mb-4">
                  <span class="material-icons text-blue-600 dark:text-blue-400">psychology</span>
                  <h4 class="font-bold text-blue-900 dark:text-blue-300 text-sm">Reflexão Clínica</h4>
                </div>
                @for (q of clinicalQuestions(); track $index) {
                  <div class="mb-3">
                    <p class="text-xs sm:text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">{{ $index + 1 }}. {{ q }}</p>
                    <textarea class="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl text-sm ring-1 ring-blue-200 dark:ring-blue-800 focus:ring-2 focus:ring-primary outline-none resize-none"
                      rows="2" placeholder="Observação clínica..."></textarea>
                  </div>
                }
              </div>
              <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <button class="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 transition-all"
                  (click)="startGame(currentGame()!)">
                  Jogar Novamente
                </button>
                <button class="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl font-bold text-sm transition-all"
                  (click)="closeGame()">
                  Fechar
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
export class JogosComponent implements OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  searchTerm = '';
  filterCategory = signal('');
  categories = ['', 'Atenção', 'Memória', 'Funções Executivas', 'Consciência Fonológica', 'Matemática', 'Socioemocional'];
  allGames = JOGOS_DATA;
  filteredGames = signal<Jogo[]>(JOGOS_DATA);
  showGameModal = signal(false);
  isPortraitMobile = signal(false);
  currentGame = signal<Jogo | null>(null);
  gameStarted = signal(false);
  gameFinished = signal(false);
  gameScore = signal(0);
  gameTimer = signal(0);
  gameInstruction = signal('');
  clinicalQuestions = signal<string[]>([]);

  private timerInterval: any;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private gameData: any = {};
  private canvasClickHandler: ((e: MouseEvent) => void) | null = null;
  private canvasTouchHandler: ((e: TouchEvent) => void) | null = null;

  @HostListener('window:resize')
  @HostListener('window:orientationchange')
  onWindowResize() {
    this.checkOrientation();
    if (this.showGameModal() && this.gameStarted() && !this.isPortraitMobile()) {
      setTimeout(() => this.setupCanvas(), 100);
    }
  }

  ngOnDestroy() { 
    this.clearTimers(); 
    this.removeCanvasListeners(); 
    this.unlockOrientation();
  }

  async lockOrientation() {
    try {
      if (screen.orientation && 'lock' in screen.orientation) {
        await (screen.orientation as any).lock('landscape');
      }
    } catch {
      // Ignora silenciosamente em navegadores como iOS Safari onde orientation.lock() é restrito
    }
  }

  unlockOrientation() {
    try {
      if (screen.orientation && 'unlock' in screen.orientation) {
        screen.orientation.unlock();
      }
    } catch {}
  }

  checkOrientation() {
    if (!this.showGameModal()) {
      this.isPortraitMobile.set(false);
      return;
    }
    // Considera tela móvel e checa se a altura é maior que a largura (modo retrato)
    const isMobile = window.innerWidth <= 900 || window.innerHeight <= 600 || ('ontouchstart' in window);
    const isPortrait = window.innerHeight > window.innerWidth;
    this.isPortraitMobile.set(isMobile && isPortrait);
  }

  removeCanvasListeners() {
    const canvas = this.canvasRef?.nativeElement;
    if (canvas && this.canvasClickHandler) {
      canvas.removeEventListener('click', this.canvasClickHandler);
      canvas.removeEventListener('touchend', this.canvasTouchHandler!);
      this.canvasClickHandler = null;
      this.canvasTouchHandler = null;
    }
  }

  getPointerPos(canvas: HTMLCanvasElement, clientX: number, clientY: number): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  setCanvasHandler(canvas: HTMLCanvasElement, handler: (x: number, y: number) => void) {
    this.removeCanvasListeners();
    this.canvasClickHandler = (e: MouseEvent) => {
      e.preventDefault();
      const pos = this.getPointerPos(canvas, e.clientX, e.clientY);
      handler(pos.x, pos.y);
    };
    this.canvasTouchHandler = (e: TouchEvent) => {
      e.preventDefault();
      if (e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        const pos = this.getPointerPos(canvas, t.clientX, t.clientY);
        handler(pos.x, pos.y);
      }
    };
    canvas.addEventListener('click', this.canvasClickHandler);
    canvas.addEventListener('touchend', this.canvasTouchHandler);
  }

  filterGames() {
    const term = this.searchTerm.toLowerCase();
    const cat = this.filterCategory();
    this.filteredGames.set(
      this.allGames.filter(g => {
        const matchSearch = !term || g.name.toLowerCase().includes(term) || g.category.toLowerCase().includes(term) || g.description.toLowerCase().includes(term);
        const matchCat = !cat || g.category === cat;
        return matchSearch && matchCat;
      })
    );
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'Atenção': 'visibility', 'Memória': 'memory', 'Funções Executivas': 'psychology',
      'Consciência Fonológica': 'record_voice_over', 'Matemática': 'calculate', 'Socioemocional': 'favorite',
    };
    return icons[category] || 'sports_esports';
  }

  getCategoryBg(category: string): string {
    const bgs: Record<string, string> = {
      'Atenção': 'bg-amber-100 dark:bg-amber-900/30', 'Memória': 'bg-purple-100 dark:bg-purple-900/30',
      'Funções Executivas': 'bg-blue-100 dark:bg-blue-900/30', 'Consciência Fonológica': 'bg-pink-100 dark:bg-pink-900/30',
      'Matemática': 'bg-emerald-100 dark:bg-emerald-900/30', 'Socioemocional': 'bg-red-100 dark:bg-red-900/30',
    };
    return bgs[category] || 'bg-slate-100 dark:bg-slate-800';
  }

  getCategoryStyle(category: string): string {
    const styles: Record<string, string> = {
      'Atenção': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'Memória': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Funções Executivas': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Consciência Fonológica': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      'Matemática': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'Socioemocional': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[category] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  getHighScore(gameId: number): number {
    const scores = JSON.parse(localStorage.getItem('jogos_scores') || '{}');
    return scores[gameId] || 0;
  }

  saveHighScore(gameId: number, score: number) {
    const scores = JSON.parse(localStorage.getItem('jogos_scores') || '{}');
    if (!scores[gameId] || score > scores[gameId]) {
      scores[gameId] = score;
      localStorage.setItem('jogos_scores', JSON.stringify(scores));
    }
  }

  startGame(jogo: Jogo) {
    this.closeGame();
    setTimeout(() => {
      this.currentGame.set(jogo);
      this.gameScore.set(0);
      this.gameTimer.set(0);
      this.gameStarted.set(false);
      this.gameFinished.set(false);
      this.showGameModal.set(true);
      this.clinicalQuestions.set(this.getClinicalQuestions(jogo.category));
      this.lockOrientation();
      this.checkOrientation();
    }, 50);
  }

  initGame() {
    this.gameStarted.set(true);
    this.startTimer();
    setTimeout(() => this.setupCanvas(), 150);
  }

  startTimer() {
    this.clearTimers();
    this.timerInterval = setInterval(() => {
      this.gameTimer.update(t => t + 1);
    }, 1000);
  }

  clearTimers() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  setupCanvas() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const container = canvas.parentElement;
    const containerWidth = container ? container.clientWidth - 24 : 468;
    const maxAvailableH = window.innerHeight ? Math.max(180, window.innerHeight - 220) : 300;
    let logicalW = Math.min(500, containerWidth);
    let logicalH = Math.round(logicalW * 0.6);
    if (logicalH > maxAvailableH) {
      logicalH = maxAvailableH;
      logicalW = Math.round(logicalH / 0.6);
    }
    const dpr = window.devicePixelRatio || 1;

    canvas.width = logicalW * dpr;
    canvas.height = logicalH * dpr;
    canvas.style.width = logicalW + 'px';
    canvas.style.height = logicalH + 'px';

    this.canvasCtx = canvas.getContext('2d');
    if (this.canvasCtx) {
      this.canvasCtx.scale(dpr, dpr);
    }

    this.gameData.logicalW = logicalW;
    this.gameData.logicalH = logicalH;
    this.gameData.dpr = dpr;

    this.removeCanvasListeners();

    const jogo = this.currentGame();
    if (!jogo || !this.canvasCtx) return;
    switch (jogo.type) {
      case 'memory': this.setupMemoryGame(canvas, logicalW, logicalH, jogo.id); break;
      case 'math': this.setupMathGame(canvas, logicalW, logicalH); break;
      case 'sequence': this.setupSequenceGame(canvas, logicalW, logicalH); break;
      case 'attention': this.setupAttentionGame(canvas, logicalW, logicalH); break;
      case 'phonology': this.setupPhonologyGame(canvas, logicalW, logicalH, jogo.id); break;
      case 'social': this.setupSocialGame(canvas, logicalW, logicalH, jogo.id); break;
      case 'stroop': this.setupStroopGame(canvas, logicalW, logicalH); break;
      case 'tap': this.setupTapGame(canvas, logicalW, logicalH, jogo.id); break;
      case 'compare': this.setupCompareGame(canvas, logicalW, logicalH); break;
      default: this.setupMemoryGame(canvas, logicalW, logicalH, jogo.id);
    }
  }

  setupMemoryGame(canvas: HTMLCanvasElement, W: number, H: number, gameId: number) {
    const ctx = this.canvasCtx!;
    const EMOJI_SETS: Record<number, string[]> = {
      1: ['🍎','🍌','🍇','🍊','🍓','🍋','🥝','🍒'],
      11: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼'],
      12: ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣'],
      13: ['🔴','🔵','🟢','🟡','🟣','🟠','⚫','⚪'],
      14: ['⬛','⬜','🔴','🔵','🟢','🟡','🟣','🟠'],
      15: ['🍎','🍌','🍇','🍊','🍓','🍋','🥝','🍒'],
      19: ['😀','😎','🤩','🥳','😴','🤔','😢','😡'],
      9: ['⭐','🌙','☀️','🌈','❄️','🔥','💧','🌸'],
    };
    const set = EMOJI_SETS[gameId] || EMOJI_SETS[1];
    const numPairs = gameId === 15 ? 8 : 6;
    const pairs = set.slice(0, numPairs);
    const cards = [...pairs, ...pairs].sort(() => Math.random() - 0.5);
    const cols = numPairs <= 6 ? 4 : 4;
    const rows = numPairs <= 6 ? 3 : 4;
    this.gameData = { ...this.gameData, cards, flipped: [], matched: [], attempts: 0 };
    const w = W / cols, h = H / rows;
    const fontSize = Math.max(16, Math.min(28, Math.min(w, h) * 0.5));

    this.gameInstruction.set('Encontre os pares de cartas');

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      cards.forEach((sym: string, i: number) => {
        const x = (i % cols) * w, y = Math.floor(i / cols) * h;
        const isFlipped = this.gameData.flipped.includes(i) || this.gameData.matched.includes(i);
        ctx.fillStyle = isFlipped ? '#f0fdf4' : '#e2e8f0';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 8);
        ctx.fill();
        ctx.stroke();
        if (isFlipped) {
          ctx.font = `${fontSize}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#1e293b';
          ctx.fillText(sym, x + w / 2, y + h / 2);
        }
      });
    };

    draw();

    this.setCanvasHandler(canvas, (mx, my) => {
      const col = Math.floor(mx / w);
      const row = Math.floor(my / h);
      const idx = row * cols + col;
      if (idx < 0 || idx >= cards.length || this.gameData.flipped.includes(idx) || this.gameData.matched.includes(idx)) return;
      if (this.gameData.flipped.length >= 2) return;

      this.gameData.flipped.push(idx);
      draw();

      if (this.gameData.flipped.length === 2) {
        this.gameData.attempts++;
        const [a, b] = this.gameData.flipped;
        if (cards[a] === cards[b]) {
          this.gameData.matched.push(a, b);
          this.gameScore.update(s => s + 10);
          this.gameData.flipped = [];
          draw();
          if (this.gameData.matched.length === cards.length) {
            this.gameScore.update(s => s + Math.max(0, 50 - this.gameData.attempts * 2));
            this.finishGame();
          }
        } else {
          setTimeout(() => { this.gameData.flipped = []; draw(); }, 800);
        }
      }
    });
  }

  setupMathGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    let correct = 0, total = 0, a = 0, b = 0, op = '+', answer = 0;
    const buttons = ['0','1','2','3','4','5','6','7','8','9','⌫','OK'];
    let input = '';

    const newQuestion = () => {
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      op = Math.random() > 0.5 ? '+' : '-';
      if (op === '-' && a < b) [a, b] = [b, a];
      answer = op === '+' ? a + b : a - b;
      input = '';
      total++;
      this.gameInstruction.set(`Resolva: ${a} ${op} ${b}`);
      draw();
    };

    const bw = Math.min(70, (W - 120) / 4), bh = Math.min(50, bw * 0.7);
    const startX = (W - (bw * 4 + 15 * 3)) / 2;
    const startY = H * 0.55;
    const questionFontSize = Math.max(24, Math.min(36, W * 0.07));
    const inputFontSize = Math.max(28, Math.min(40, W * 0.08));
    const btnFontSize = Math.max(14, Math.min(18, bw * 0.26));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.font = `bold ${questionFontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(`${a} ${op} ${b} = ?`, W / 2, H * 0.18);

      ctx.font = `bold ${inputFontSize}px sans-serif`;
      ctx.fillText(input || '_', W / 2, H * 0.38);

      buttons.forEach((btn, i) => {
        const x = startX + (i % 4) * (bw + 15);
        const y = startY + Math.floor(i / 4) * (bh + 10);
        ctx.fillStyle = btn === 'OK' ? '#007f80' : '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(x, y, bw, bh, 8);
        ctx.fill();
        ctx.fillStyle = btn === 'OK' ? '#fff' : '#1e293b';
        ctx.font = `bold ${btnFontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn, x + bw / 2, y + bh / 2);
      });

      ctx.fillStyle = '#94a3b8';
      ctx.font = `${Math.max(11, Math.min(14, W * 0.028))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`Acertos: ${correct}/${total}`, W / 2, H - 15);
    };

    newQuestion();

    this.setCanvasHandler(canvas, (mx, my) => {
      buttons.forEach((btn, i) => {
        const x = startX + (i % 4) * (bw + 15);
        const y = startY + Math.floor(i / 4) * (bh + 10);
        if (mx >= x && mx <= x + bw && my >= y && my <= y + bh) {
          if (btn === '⌫') { input = input.slice(0, -1); draw(); }
          else if (btn === 'OK') {
            if (parseInt(input) === answer) { correct++; this.gameScore.update(s => s + 10); }
            if (total >= 8) this.finishGame(); else newQuestion();
          } else { input += btn; draw(); }
        }
      });
    });
  }

  setupSequenceGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    const colors = ['#ef4444','#3b82f6','#22c55e','#eab308','#a855f7'];
    const numColors = 5;
    const sequence = Array.from({length: 5}, () => Math.floor(Math.random() * numColors));
    let userSequence: number[] = [];
    let showingSequence = true;
    let round = 1;

    this.gameInstruction.set('Memorize e repita a sequência de cores');

    const cellW = (W - 20) / numColors;
    const cellH = Math.min(cellW, H * 0.4);
    const cellY = (H - cellH) / 2;
    const cellR = Math.min(12, cellW * 0.15);
    const fontSize = Math.max(11, Math.min(14, W * 0.028));

    const showSequence = () => {
      showingSequence = true;
      let i = 0;
      const interval = setInterval(() => {
        if (i >= sequence.length) {
          clearInterval(interval);
          showingSequence = false;
          this.gameInstruction.set('Agora repita a sequência!');
          draw();
          return;
        }
        draw();
        const x = 10 + i * cellW;
        ctx.fillStyle = colors[sequence[i]];
        ctx.beginPath();
        ctx.roundRect(x + 4, cellY, cellW - 8, cellH, cellR);
        ctx.fill();
        i++;
      }, 600);
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < numColors; i++) {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(10 + i * cellW + 4, cellY, cellW - 8, cellH, cellR);
        ctx.fill();
      }
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`Rodada ${round} · Acertos: ${userSequence.filter((v,i) => v === sequence[i]).length}/5`, W / 2, H - 15);
    };

    draw();
    showSequence();

    this.setCanvasHandler(canvas, (mx) => {
      if (showingSequence) return;
      const col = Math.floor((mx - 10) / cellW);
      if (col < 0 || col >= numColors) return;
      userSequence.push(col);

      ctx.fillStyle = colors[col];
      ctx.beginPath();
      ctx.roundRect(10 + col * cellW + 4, cellY, cellW - 8, cellH, cellR);
      ctx.fill();

      if (userSequence.length === sequence.length) {
        const correct = userSequence.filter((v,i) => v === sequence[i]).length;
        this.gameScore.update(s => s + correct * 5);
        if (correct === 5 && round < 3) {
          round++;
          sequence.push(Math.floor(Math.random() * numColors));
          userSequence = [];
          setTimeout(() => showSequence(), 500);
        } else {
          this.finishGame();
        }
      }
    });
  }

  setupAttentionGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    let clicked = 0, missed = 0, targetIdx = -1;
    let shapes: Array<{x: number, y: number, isTarget: boolean}> = [];
    const totalTargets = 10;
    const radius = Math.max(16, Math.min(22, W * 0.044));

    const newRound = () => {
      if (clicked + missed >= totalTargets) { this.finishGame(); return; }
      shapes = Array.from({length: 8}, () => ({x: Math.random() * (W - radius * 4) + radius * 2, y: Math.random() * (H - radius * 4) + radius * 2, isTarget: false}));
      targetIdx = Math.floor(Math.random() * shapes.length);
      shapes[targetIdx].isTarget = true;
      ctx.clearRect(0, 0, W, H);
      shapes.forEach((s) => {
        ctx.fillStyle = s.isTarget ? '#3b82f6' : '#e2e8f0';
        ctx.beginPath();
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.fill();
        if (s.isTarget) {
          ctx.fillStyle = '#fff';
          ctx.font = `bold ${Math.max(12, radius * 0.7)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', s.x, s.y);
        }
      });
      this.gameInstruction.set(`Clique na estrela azul! (${clicked}/${totalTargets})`);
    };

    this.setCanvasHandler(canvas, (mx, my) => {
      for (const s of shapes) {
        const dist = Math.sqrt((mx - s.x) ** 2 + (my - s.y) ** 2);
        if (dist < radius + 5) {
          if (s.isTarget) { clicked++; this.gameScore.update(s => s + 10); }
          else { missed++; }
          setTimeout(newRound, 300);
          break;
        }
      }
    });

    newRound();
  }

  setupPhonologyGame(canvas: HTMLCanvasElement, W: number, H: number, gameId: number) {
    const ctx = this.canvasCtx!;
    const WORD_SETS: Record<number, Array<{word: string, options: string[]}>> = {
      31: [{word:'SOLA',options:['SOLA','MOLA','BOLA','FOLA']},{word:'CARO',options:['CARO','CAVO','CARRO','CASA']},{word:'PATO',options:['PATO','PATA','MATO','RATO']}],
      32: [{word:'CA-SA',options:['CA-SA','CASA','CA-SA','CAS-A']},{word:'BO-LA',options:['BO-LA','BOLA','BO-LA','BOL-A']},{word:'PA-TO',options:['PA-TO','PATO','PA-TO','PAT-O']}],
      33: [{word:'MAÇÃ',options:['M','A','Ã','Ç']},{word:'BOLA',options:['B','O','L','A']},{word:'SOL',options:['S','O','L','Z']}],
      34: [{word:'SOL',options:['L','O','S','Z']},{word:'PÉ',options:['É','P','E','X']},{word:'MAR',options:['R','A','M','L']}],
      35: [{word:'BOR-BO-CHA',options:['1','2','3','4']},{word:'CA-SA',options:['1','2','3','4']},{word:'A-NA-RA-NA',options:['1','2','3','4']}],
      36: [{word:'MATO→?',options:['RATO','MATO','BATO','SATO']},{word:'CASA→?',options:['CASA','CANA','CASA','CATA']},{word:'BOLA→?',options:['BOLA','TOLA','BOLA','BONA']}],
      37: [{word:'Peixe ___',options:['DENTE','AZUL','MOLHO','VERDE']},{word:'Amor ___',options:['TEMPO','DOURADO','COR','ÁGUA']},{word:'Copo ___',options:['D\'ÁGUA','GRANDE','MESA','AZUL']}],
      38: [{word:'SOL',options:['S-O-L','S-O','SOL','S-L-O']},{word:'CASA',options:['C-A-S-A','C-AS-A','CA-S-A','CASA']},{word:'PATO',options:['P-A-T-O','PA-T-O','PATO','P-A-TO']}],
      39: [{word:'CA+SO',options:['CASSO','CASO','CAÇO','CASSO']},{word:'BO+LA',options:['BOLHA','BOLA','BOALA','BOLHA']},{word:'PA+TO',options:['PACTO','PATO','PATTO','PACTO']}],
      40: [{word:'P_J_TO',options:['PAJETO','PIJITO','PAJOTO','PAJETO']},{word:'M__R',options:['MOR','MAR','MUR','MER']},{word:'C_S_',options:['CASA','CISO','CUSA','COSA']}],
    };
    const words = WORD_SETS[gameId] || WORD_SETS[31];
    let currentIdx = 0, correct = 0;

    const btnW = Math.min(200, (W - 100) / 2);
    const btnH = Math.min(50, btnW * 0.25);
    const gap = 16;
    const totalGridW = btnW * 2 + gap;
    const startX = (W - totalGridW) / 2;
    const startY = H * 0.3;
    const questionFontSize = Math.max(18, Math.min(28, W * 0.056));
    const wordFontSize = Math.max(24, Math.min(36, W * 0.072));
    const optFontSize = Math.max(13, Math.min(18, btnW * 0.09));

    const drawQuestion = () => {
      if (currentIdx >= words.length) { this.finishGame(); return; }
      const q = words[currentIdx];
      ctx.clearRect(0, 0, W, H);
      ctx.font = `bold ${questionFontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Qual é a palavra correta?', W / 2, H * 0.14);
      ctx.font = `bold ${wordFontSize}px sans-serif`;
      ctx.fillText(`_${'_'.repeat(q.word.length - 2)}_`, W / 2, H * 0.24);

      q.options.forEach((opt, i) => {
        const x = startX + (i % 2) * (btnW + gap);
        const y = startY + Math.floor(i / 2) * (btnH + 12);
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(x, y, btnW, btnH, 10);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.font = `bold ${optFontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(opt, x + btnW / 2, y + btnH / 2 + 2);
      });

      this.gameInstruction.set(`Pergunta ${currentIdx + 1}/${words.length} · Acertos: ${correct}`);
    };

    this.setCanvasHandler(canvas, (mx, my) => {
      const q = words[currentIdx];
      if (!q) return;
      q.options.forEach((_, i) => {
        const x = startX + (i % 2) * (btnW + gap);
        const y = startY + Math.floor(i / 2) * (btnH + 12);
        if (mx >= x && mx <= x + btnW && my >= y && my <= y + btnH) {
          if (q.options[i] === q.word) { correct++; this.gameScore.update(s => s + 10); }
          currentIdx++;
          setTimeout(drawQuestion, 400);
        }
      });
    });

    drawQuestion();
  }

  setupSocialGame(canvas: HTMLCanvasElement, W: number, H: number, gameId: number) {
    const ctx = this.canvasCtx!;
    const SCENARIOS: Record<number, Array<{situation: string, options: string[], correct: number}>> = {
      51: [
        {situation:'A menina está sorrindo. Ela está...',options:['Feliz','Triste','Com raiva','Com medo'],correct:0},
        {situation:'O menino está chorando. Ele está...',options:['Feliz','Triste','Com raiva','Animado'],correct:1},
        {situation:'A pessoa está com a testa franzida. Ela está...',options:['Feliz','Triste','Com raiva','Surpresa'],correct:2},
      ],
      52: [
        {situation:'Seu amigo caiu e se machucou. O que ele sente?',options:['Feliz','Triste','Com raiva','Animado'],correct:1},
        {situation:'Ganhou um presente. Como se sente?',options:['Triste','Com raiva','Feliz','Com medo'],correct:2},
        {situation:'Está sozinho no parque. Como se sente?',options:['Feliz','Triste','Animado','Com raiva'],correct:1},
      ],
      53: [
        {situation:'Um colega está chorando no intervalo. O que você faz?',options:['Ignorar','Chamar e perguntar se precisa de ajuda','Rir','Chamar outros para rir'],correct:1},
        {situation:'Alguém pegou seu brinquedo sem pedir. O que você faz?',options:['Bater','Falar que ficou triste e pedir de volta','Gritar','Esfregar no chão'],correct:1},
        {situation:'Um colega novo chegou e está sozinho. O que você faz?',options:['Ignorar','Chamar para brincar junto','Falar que ele não pode','Chamar de estranho'],correct:1},
      ],
      55: [
        {situation:'Como você se sente agora?',options:['Feliz','Triste','Com raiva','Cansado'],correct:0},
        {situation:'O que te faz sentir bem?',options:['Brincar com amigos','Brigar','Ficar sozinho','Não dormir'],correct:0},
        {situation:'Quando estou triste, eu...',options:['Choro e fico sozinho','Peço ajuda a alguém de confiança','Brigo com todo mundo','Fico com raiva'],correct:1},
      ],
      56: [
        {situation:'Dois amigos brigaram por um brinquedo. Qual a melhor solução?',options:['Brigar também','Conversar e combinar de dividir','Chamar um adulto para punir','Ignorar e ir embora'],correct:1},
        {situation:'Seu colega falou algo feio. O que você faz?',options:['Falar algo feio de volta','Conversar e dizer que machucou','Bater','Chorar sem fazer nada'],correct:1},
        {situation:'Você ficou com raiva do amigo. O que fazer?',options:['Bater','Esperar esfriar e conversar','Não falar mais com ele','Quebrar algo dele'],correct:1},
      ],
      57: [
        {situation:'Seu amigo precisa de ajuda com a lição. O que você faz?',options:['Recusar','Ajudar com paciência','Rir dele','Chamar o professor para castigar'],correct:1},
        {situation:'Vocês estão jogando e alguém perdeu. O que fazer?',options:['Zombar','Incentivar e oferecer para jogar de novo','Ir embora','Não mais jogar com essa pessoa'],correct:1},
        {situation:'Um colega compartilhou o lanche. O que você faz?',options:['Comer sem agradecer','Agradecer e compartilhar o seu também','Falar que não gosta','Guardar tudo para si'],correct:1},
      ],
      59: [
        {situation:'Pense em algo bom que aconteceu hoje. Qual é?',options:['Acordar cedo','Brincar com amigos','Ir dormir tarde','Comer chocolate'],correct:1},
        {situation:'O que você agradece na sua família?',options:['Nada','Que eles cuidam de você','Que eles são perfeitos','Que eles dão tudo que você quer'],correct:1},
        {situation:'Agradecer ajuda a...',options:['Ninguém','As pessoas que te ajudam','Só quem você gosta','Só quem te dá presentes'],correct:1},
      ],
      60: [
        {situation:'Você ficou com raiva. O que fazer primeiro?',options:['Bater','Respirar fundo e contar até 10','Gritar','Sair correndo'],correct:1},
        {situation:'Está com medo de uma coisa nova. O que fazer?',options:['Não fazer nada','Pedir ajuda e tentar aos poucos','Chorar','Fingir que não existe'],correct:1},
        {situation:'Perdeu um jogo e ficou triste. O que fazer?',options:['Quebrar o jogo','Aceitar que perdeu e tentar de novo','Culpar os outros','Não jogar mais'],correct:1},
      ],
    };
    const scenarios = SCENARIOS[gameId] || SCENARIOS[51];
    let currentIdx = 0, correct = 0;

    const btnW = Math.min(200, (W - 100) / 2);
    const btnH = Math.min(55, btnW * 0.275);
    const gap = 14;
    const totalGridW = btnW * 2 + gap;
    const startX = (W - totalGridW) / 2;
    const startY = H * 0.32;
    const sitFontSize = Math.max(14, Math.min(20, W * 0.04));
    const optFontSize = Math.max(12, Math.min(15, btnW * 0.075));

    const drawScenario = () => {
      if (currentIdx >= scenarios.length) { this.finishGame(); return; }
      const s = scenarios[currentIdx];
      ctx.clearRect(0, 0, W, H);
      ctx.font = `bold ${sitFontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1e293b';
      const words = s.situation.split(' ');
      let line = '';
      let y = H * 0.12;
      words.forEach(w => {
        const test = line + w + ' ';
        if (ctx.measureText(test).width > W - 40) {
          ctx.fillText(line.trim(), W / 2, y);
          line = w + ' ';
          y += sitFontSize + 6;
        } else {
          line = test;
        }
      });
      ctx.fillText(line.trim(), W / 2, y);

      s.options.forEach((opt, i) => {
        const x = startX + (i % 2) * (btnW + gap);
        const yB = startY + Math.floor(i / 2) * (btnH + 12);
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(x, yB, btnW, btnH, 10);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.font = `${optFontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(opt, x + btnW / 2, yB + btnH / 2 + 2);
      });

      this.gameInstruction.set(`Cenário ${currentIdx + 1}/${scenarios.length}`);
    };

    this.setCanvasHandler(canvas, (mx, my) => {
      const s = scenarios[currentIdx];
      if (!s) return;
      s.options.forEach((_, i) => {
        const x = startX + (i % 2) * (btnW + gap);
        const yB = startY + Math.floor(i / 2) * (btnH + 12);
        if (mx >= x && mx <= x + btnW && my >= yB && my <= yB + btnH) {
          if (i === s.correct) { correct++; this.gameScore.update(s => s + 10); }
          currentIdx++;
          setTimeout(drawScenario, 400);
        }
      });
    });

    drawScenario();
  }

  setupStroopGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    const colors = ['#ef4444','#3b82f6','#22c55e','#eab308','#a855f7'];
    const colorNames = ['VERMELHO','AZUL','VERDE','AMARELO','ROXO'];
    let correct = 0, total = 0;

    const showQuestion = () => {
      if (total >= 10) { this.finishGame(); return; }
      const wordIdx = Math.floor(Math.random() * colorNames.length);
      let colorIdx = Math.floor(Math.random() * colors.length);
      while (colorIdx === wordIdx) colorIdx = Math.floor(Math.random() * colors.length);
      total++;
      ctx.clearRect(0, 0, W, H);
      const qFontSize = Math.max(16, Math.min(24, W * 0.048));
      ctx.font = `bold ${qFontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Qual é a COR da tinta?', W / 2, H * 0.15);
      const wordFontSize = Math.max(32, Math.min(52, W * 0.1));
      ctx.font = `bold ${wordFontSize}px sans-serif`;
      ctx.fillStyle = colors[colorIdx];
      ctx.fillText(colorNames[wordIdx], W / 2, H * 0.38);
      const bw = Math.min(90, (W - 60) / colors.length), bh = 50;
      const startX = (W - colors.length * (bw + 10)) / 2;
      const startY = H * 0.55;
      colors.forEach((c, i) => {
        const x = startX + i * (bw + 10);
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.roundRect(x, startY, bw, bh, 10);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.max(10, Math.min(13, bw * 0.16))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(colorNames[i].slice(0, 5), x + bw / 2, startY + bh / 2);
      });
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${Math.max(11, Math.min(14, W * 0.028))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`Acertos: ${correct}/${total}`, W / 2, H - 15);
      this.gameInstruction.set(`Toque na COR da tinta — não na palavra! (${total}/10)`);
      const answerColor = colors[colorIdx];
      this.setCanvasHandler(canvas, (mx, my) => {
        colors.forEach((c, i) => {
          const x = startX + i * (bw + 10);
          if (mx >= x && mx <= x + bw && my >= startY && my <= startY + bh) {
            if (c === answerColor) { correct++; this.gameScore.update(s => s + 10); }
            setTimeout(showQuestion, 300);
          }
        });
      });
    };
    showQuestion();
  }

  setupTapGame(canvas: HTMLCanvasElement, W: number, H: number, gameId: number) {
    const ctx = this.canvasCtx!;
    const TAP_CONFIGS: Record<number, {items: string[], count: number, instruction: string, speed: number}> = {
      2:  {items:['🍎','🍌','🍇','🍊','🍓'], count:15, instruction:'Toque nos frutos que aparecem!', speed:1200},
      4:  {items:['🔵','🔴'], count:20, instruction:'Toque nos AZUIS, ignore os VERMELHOS!', speed:800},
      5:  {items:['⬜','🔴','🟢','🔵'], count:15, instruction:'Toque nos QUADRADOS — nunca nos círculos!', speed:1000},
      6:  {items:['⭐'], count:10, instruction:'Toque na estrela quando ela parar de se mover!', speed:600},
      17: {items:['📱','🎒','📖','✏️','🎨'], count:10, instruction:'Quais objetos apareceram? Toque nos que lembra!', speed:1500},
      18: {items:['🐱','🐶','🐰','🦊','🐻'], count:12, instruction:'Encontre o animal que apareceu no centro!', speed:1000},
      20: {items:['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'], count:8, instruction:'Guarde os números e repita ao contrário!', speed:1500},
      22: {items:['🔵','🔴'], count:16, instruction:'Toque no CÍRCULO quando vir ▲, no QUADRADO quando vir ●', speed:900},
      24: {items:['🐶','🐱','🐰','📦','⚽','📚'], count:15, instruction:'Toque nos ANIMAIS — ignore os objetos!', speed:900},
      26: {items:['🟢','🟡','🔴'], count:12, instruction:'Toque quando ficar VERDE — espere o sinal!', speed:1200},
      27: {items:['A','E','I','O','U'], count:14, instruction:'Toque nas VOGAIS — ignore as consoantes!', speed:800},
      28: {items:['🔴','🔵'], count:16, instruction:'Toque no AZUL quando ver 🔴, no VERMELHO quando ver 🔵', speed:800},
      29: {items:['⭐','🏁'], count:10, instruction:'Encontre o caminho: toque na estrela, depois na bandeira!', speed:1000},
      30: {items:['+3'], count:8, instruction:'Guarde o número e some 3!', speed:2000},
      44: {items:['🍎','🍌','🍇','🍊','🍓','🍋'], count:10, instruction:'Conte quantos frutos aparecem!', speed:1500},
      48: {items:['🍕','🍰','🧁','🍩'], count:10, instruction:'Toque na fração correta — 1/2 ou 1/4?', speed:1500},
      49: {items:['⬛','⬜','🔺','🔴'], count:12, instruction:'Identifique a forma: círculo, quadrado ou triângulo!', speed:1200},
      54: {items:['🫁'], count:8, instruction:'Inspire (toque quando crescer)... Expire (quando diminuir)', speed:2000},
      58: {items:['⏳'], count:6, instruction:'Espere... espere... toque quando aparecer o sinal!', speed:3000},
    };
    const config = TAP_CONFIGS[gameId] || TAP_CONFIGS[2];
    let spawned = 0, hit = 0;
    const itemFontSize = Math.max(24, Math.min(40, W * 0.08));

    const spawnItem = () => {
      if (spawned >= config.count) { this.finishGame(); return; }
      const symbol = config.items[Math.floor(Math.random() * config.items.length)];
      const x = Math.random() * (W - 60) + 30;
      const y = Math.random() * (H - 80) + 30;
      spawned++;
      ctx.clearRect(0, 0, W, H);
      ctx.font = `${itemFontSize}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(symbol, x, y);
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${Math.max(11, Math.min(14, W * 0.028))}px sans-serif`;
      ctx.fillText(`${spawned}/${config.count} · Acertos: ${hit}`, W / 2, H - 15);
      this.gameInstruction.set(config.instruction);
      this.setCanvasHandler(canvas, (mx, my) => {
        const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
        if (dist < 40) {
          hit++;
          this.gameScore.update(s => s + 10);
          setTimeout(spawnItem, 200);
        }
      });
    };
    spawnItem();
  }

  setupCompareGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    let correct = 0, total = 0;
    const btnW = Math.min(80, (W - 80) / 3), bh = 55;
    const symbols = ['<', '=', '>'];
    const labels = ['<', '=', '>'];

    const showQuestion = () => {
      if (total >= 8) { this.finishGame(); return; }
      const a = Math.floor(Math.random() * 20) + 1;
      let b = Math.floor(Math.random() * 20) + 1;
      while (b === a) b = Math.floor(Math.random() * 20) + 1;
      total++;
      const correctSym = a > b ? '>' : a < b ? '<' : '=';
      ctx.clearRect(0, 0, W, H);
      const numFont = Math.max(28, Math.min(44, W * 0.088));
      ctx.font = `bold ${numFont}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(`${a}  ?  ${b}`, W / 2, H * 0.3);
      const startX = (W - 3 * (btnW + 15)) / 2;
      const startY = H * 0.5;
      symbols.forEach((sym, i) => {
        const x = startX + i * (btnW + 15);
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(x, startY, btnW, bh, 12);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.font = `bold ${Math.max(24, Math.min(36, btnW * 0.45))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[i], x + btnW / 2, startY + bh / 2);
      });
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${Math.max(11, Math.min(14, W * 0.028))}px sans-serif`;
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'center';
      ctx.fillText(`Acertos: ${correct}/${total}`, W / 2, H - 15);
      this.gameInstruction.set(`Qual símbolo completa? (${total}/8)`);
      this.setCanvasHandler(canvas, (mx, my) => {
        symbols.forEach((sym, i) => {
          const x = startX + i * (btnW + 15);
          if (mx >= x && mx <= x + btnW && my >= startY && my <= startY + bh) {
            if (sym === correctSym) { correct++; this.gameScore.update(s => s + 10); }
            setTimeout(showQuestion, 300);
          }
        });
      });
    };
    showQuestion();
  }

  finishGame() {
    this.clearTimers();
    const jogo = this.currentGame();
    if (jogo) this.saveHighScore(jogo.id, this.gameScore());
    this.gameStarted.set(false);
    this.gameFinished.set(true);
  }

  closeGame() {
    this.clearTimers();
    this.removeCanvasListeners();
    this.unlockOrientation();
    this.showGameModal.set(false);
    this.isPortraitMobile.set(false);
    this.currentGame.set(null);
    this.gameStarted.set(false);
    this.gameFinished.set(false);
  }

  getClinicalQuestions(category: string): string[] {
    const questions: Record<string, string[]> = {
      'Atenção': ['Como o paciente se saiu na tarefa de atenção visual?', 'Houve dificuldade em manter o foco?', 'Observações sobre tempo de reação?'],
      'Memória': ['O paciente conseguiu reter as informações?', 'Houve dificuldade em reconhecer padrões?', 'Observações sobre estratégia de memorização?'],
      'Funções Executivas': ['Como o paciente se saiu na organização das tarefas?', 'Houve dificuldade em inibir respostas?', 'Observações sobre flexibilidade mental?'],
      'Consciência Fonológica': ['O paciente identificou sons corretamente?', 'Houve dificuldade com sílabas ou rimas?', 'Observações sobre consciência fonológica?'],
      'Matemática': ['O paciente resolveu as operações?', 'Houve dificuldade com cálculos específicos?', 'Observações sobre raciocínio lógico?'],
      'Socioemocional': ['O paciente identificou as emoções corretamente?', 'Houve dificuldade em situações sociais?', 'Observações sobre empatia e regulação?'],
    };
    return questions[category] || questions['Atenção'];
  }
}
