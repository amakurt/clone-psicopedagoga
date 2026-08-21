import { Component, signal, OnDestroy, ElementRef, ViewChild } from '@angular/core';
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
  { id: 1, name: 'Caça às Diferenças', category: 'Atenção', difficulty: 1, time: '5 min', ageRange: '4-8', description: 'Encontre diferenças entre duas imagens', type: 'attention' },
  { id: 2, name: 'Sequência de Cores', category: 'Atenção', difficulty: 1, time: '3 min', ageRange: '3-6', description: 'Repita a sequência de cores', type: 'sequence' },
  { id: 3, name: 'Memória Visual', category: 'Atenção', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'Lembre-se dos objetos mostrados', type: 'memory' },
  { id: 4, name: 'Contagem Rápida', category: 'Atenção', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Conte os elementos rapidamente', type: 'attention' },
  { id: 5, name: 'Puzzle de Letras', category: 'Atenção', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Encontre as letras escondidas', type: 'attention' },
  { id: 6, name: 'Jogo da Velha Cognitivo', category: 'Atenção', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'Jogo da velha com desafios', type: 'attention' },
  { id: 7, name: 'Memória de Posições', category: 'Atenção', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Lembre-se das posições', type: 'memory' },
  { id: 8, name: 'Caça Palavras', category: 'Atenção', difficulty: 1, time: '5 min', ageRange: '5-10', description: 'Encontre palavras escondidas', type: 'attention' },
  { id: 9, name: 'Sequência Numérica', category: 'Atenção', difficulty: 2, time: '3 min', ageRange: '5-9', description: 'Complete a sequência', type: 'sequence' },
  { id: 10, name: 'Atenção Dividida', category: 'Atenção', difficulty: 3, time: '5 min', ageRange: '7-12', description: 'Execute duas tarefas ao mesmo tempo', type: 'attention' },
  { id: 11, name: 'Jogo da Memória', category: 'Memória', difficulty: 1, time: '5 min', ageRange: '3-8', description: 'Encontre os pares de cartas', type: 'memory' },
  { id: 12, name: 'Memória de Sequências', category: 'Memória', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'Repita sequências crescentes', type: 'memory' },
  { id: 13, name: 'Lembre-se dos Objetos', category: 'Memória', difficulty: 1, time: '3 min', ageRange: '3-7', description: 'Quais objetos foram mostrados?', type: 'memory' },
  { id: 14, name: 'Memória de Cores', category: 'Memória', difficulty: 1, time: '3 min', ageRange: '3-6', description: 'Lembre-se das cores', type: 'memory' },
  { id: 15, name: 'Pares de Animais', category: 'Memória', difficulty: 1, time: '5 min', ageRange: '3-7', description: 'Encontre os pares de animais', type: 'memory' },
  { id: 16, name: 'Memória de Números', category: 'Memória', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'Lembre-se dos números', type: 'memory' },
  { id: 17, name: 'Jogo da Memória Avançado', category: 'Memória', difficulty: 3, time: '7 min', ageRange: '7-12', description: 'Memória com mais cartas', type: 'memory' },
  { id: 18, name: 'Sequência de Imagens', category: 'Memória', difficulty: 2, time: '5 min', ageRange: '5-9', description: 'Ordene as imagens corretamente', type: 'memory' },
  { id: 19, name: 'Memória de Formas', category: 'Memória', difficulty: 1, time: '3 min', ageRange: '3-6', description: 'Lembre-se das formas', type: 'memory' },
  { id: 20, name: 'Super Memória', category: 'Memória', difficulty: 3, time: '7 min', ageRange: '8-12', description: 'Desafio máximo de memória', type: 'memory' },
  { id: 21, name: 'Organize a Fila', category: 'Funções Executivas', difficulty: 1, time: '5 min', ageRange: '4-8', description: 'Organize elementos na ordem correta', type: 'sequence' },
  { id: 22, name: 'Tombe Switch', category: 'Funções Executivas', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Mude de regra rapidamente', type: 'attention' },
  { id: 23, name: 'Planejamento de Rotas', category: 'Funções Executivas', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Planeje o melhor caminho', type: 'attention' },
  { id: 24, name: 'Classificação de Objetos', category: 'Funções Executivas', difficulty: 1, time: '3 min', ageRange: '3-7', description: 'Separe por categorias', type: 'attention' },
  { id: 25, name: 'Stroop Simples', category: 'Funções Executivas', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Nomeie a cor, não a palavra', type: 'attention' },
  { id: 26, name: 'Sequência de Passos', category: 'Funções Executivas', difficulty: 1, time: '5 min', ageRange: '4-8', description: 'Ordene os passos de uma atividade', type: 'sequence' },
  { id: 27, name: 'Inibir Resposta', category: 'Funções Executivas', difficulty: 3, time: '5 min', ageRange: '7-12', description: 'Não clique no elemento diferente', type: 'attention' },
  { id: 28, name: 'Mental Flexibility', category: 'Funções Executivas', difficulty: 3, time: '5 min', ageRange: '7-12', description: 'Mude entre regras alternadas', type: 'attention' },
  { id: 29, name: 'Controle Inibitório', category: 'Funções Executivas', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Responda apenas quando necessário', type: 'attention' },
  { id: 30, name: 'Memória de Trabalho', category: 'Funções Executivas', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Guarde informações na memória', type: 'memory' },
  { id: 31, name: 'Rimas Divertidas', category: 'Consciência Fonológica', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Encontre palavras que rimam', type: 'phonology' },
  { id: 32, name: 'Sílabas Coloridas', category: 'Consciência Fonológica', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Separe as palavras em sílabas', type: 'phonology' },
  { id: 33, name: 'Sons Iniciais', category: 'Consciência Fonológica', difficulty: 1, time: '3 min', ageRange: '4-6', description: 'Identifique o som inicial', type: 'phonology' },
  { id: 34, name: 'Sons Finais', category: 'Consciência Fonológica', difficulty: 2, time: '3 min', ageRange: '5-8', description: 'Identifique o som final', type: 'phonology' },
  { id: 35, name: 'Contagem de Sílabas', category: 'Consciência Fonológica', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Quantas sílabas tem?', type: 'phonology' },
  { id: 36, name: 'Manipulação de Fonemas', category: 'Consciência Fonológica', difficulty: 2, time: '5 min', ageRange: '5-8', description: 'Troque letras de posição', type: 'phonology' },
  { id: 37, name: 'Jogo de Rimas', category: 'Consciência Fonológica', difficulty: 2, time: '5 min', ageRange: '5-8', description: 'Complete com a rima correta', type: 'phonology' },
  { id: 38, name: 'Segmentação Fonêmica', category: 'Consciência Fonológica', difficulty: 2, time: '5 min', ageRange: '5-9', description: 'Separe em sons individuais', type: 'phonology' },
  { id: 39, name: 'Fusão de Sílabas', category: 'Consciência Fonológica', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Junte sílabas para formar palavras', type: 'phonology' },
  { id: 40, name: 'Consciência Avançada', category: 'Consciência Fonológica', difficulty: 3, time: '5 min', ageRange: '6-10', description: 'Desafio fonológico completo', type: 'phonology' },
  { id: 41, name: 'Soma Divertida', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Resolva somas simples', type: 'math' },
  { id: 42, name: 'Subtração Básica', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '5-8', description: 'Resolva subtrações', type: 'math' },
  { id: 43, name: 'Contagem de Objetos', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '3-6', description: 'Conte os objetos', type: 'math' },
  { id: 44, name: 'Sequência Numérica', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Complete a sequência', type: 'math' },
  { id: 45, name: 'Tabuada Divertida', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '7-10', description: 'Pratique a tabuada', type: 'math' },
  { id: 46, name: 'Problemas de Palavras', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Resolva problemas escritos', type: 'math' },
  { id: 47, name: 'Comparação de Números', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Maior, menor ou igual', type: 'math' },
  { id: 48, name: 'Frações Visuais', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '7-10', description: 'Entenda frações com imagens', type: 'math' },
  { id: 49, name: 'Geometria Básica', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '5-9', description: 'Identifique formas geométricas', type: 'math' },
  { id: 50, name: 'Desafio Matemático', category: 'Matemática', difficulty: 3, time: '7 min', ageRange: '8-12', description: 'Problemas avançados', type: 'math' },
  { id: 51, name: 'Identificação de Emoções', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-8', description: 'Identifique emoções em rostos', type: 'social' },
  { id: 52, name: 'Empatia Visual', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '4-8', description: 'Como a pessoa se sente?', type: 'social' },
  { id: 53, name: 'Situações Sociais', category: 'Socioemocional', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'Escolha a resposta social adequada', type: 'social' },
  { id: 54, name: 'Regulação Emocional', category: 'Socioemocional', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'Pratique técnicas de calma', type: 'social' },
  { id: 55, name: 'Expressão de Sentimentos', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-7', description: 'Como você se sente?', type: 'social' },
  { id: 56, name: 'Resolução de Conflitos', category: 'Socioemocional', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Encontre soluções pacíficas', type: 'social' },
  { id: 57, name: 'Amizade e Cooperação', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-7', description: 'Aprenda sobre amizade', type: 'social' },
  { id: 58, name: 'Controle de Impulsos', category: 'Socioemocional', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'Espere sua vez com paciência', type: 'social' },
  { id: 59, name: 'Gratidão e Bem-Estar', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-8', description: 'Pratique a gratidão', type: 'social' },
  { id: 60, name: 'Autoregulação Avançada', category: 'Socioemocional', difficulty: 3, time: '7 min', ageRange: '7-12', description: 'Desafio socioemocional completo', type: 'social' },
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
      <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4" (click)="closeGame()">
        <div class="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl ring-1 ring-slate-200 dark:ring-slate-800 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          @if (!gameFinished()) {
            <div class="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div class="min-w-0 flex-1">
                <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">{{ currentGame()?.name }}</h3>
                <p class="text-[10px] sm:text-xs text-slate-500">{{ currentGame()?.category }} · {{ currentGame()?.ageRange }} anos</p>
              </div>
              <div class="flex items-center gap-3 sm:gap-4 shrink-0 ml-3">
                <div class="text-center">
                  <p class="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">Tempo</p>
                  <p class="text-base sm:text-lg font-black text-primary">{{ formatTime(gameTimer()) }}</p>
                </div>
                <div class="text-center">
                  <p class="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">Pontos</p>
                  <p class="text-base sm:text-lg font-black text-emerald-600">{{ gameScore() }}</p>
                </div>
                <button class="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" (click)="closeGame()">
                  <span class="material-icons">close</span>
                </button>
              </div>
            </div>
            <div class="p-4 sm:p-6">
              <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 sm:p-6 min-h-[250px] sm:min-h-[300px] flex flex-col items-center justify-center">
                @if (!gameStarted()) {
                  <p class="text-slate-600 dark:text-slate-300 text-center mb-4 sm:mb-6 text-sm sm:text-base px-2">{{ currentGame()?.description }}</p>
                  <button class="px-6 sm:px-8 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm sm:text-base"
                    (click)="initGame()">
                    Iniciar Jogo
                  </button>
                } @else {
                  <canvas #gameCanvas class="rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 w-full max-w-[500px]" style="touch-action: manipulation;"></canvas>
                  <p class="text-xs sm:text-sm text-slate-500 mt-3 text-center px-2">{{ gameInstruction() }}</p>
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

  ngOnDestroy() { this.clearTimers(); this.removeCanvasListeners(); }

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
    const containerWidth = container ? container.clientWidth - 32 : 468;
    const logicalW = Math.min(500, containerWidth);
    const logicalH = Math.round(logicalW * 0.6);
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
      case 'memory': this.setupMemoryGame(canvas, logicalW, logicalH); break;
      case 'math': this.setupMathGame(canvas, logicalW, logicalH); break;
      case 'sequence': this.setupSequenceGame(canvas, logicalW, logicalH); break;
      case 'attention': this.setupAttentionGame(canvas, logicalW, logicalH); break;
      case 'phonology': this.setupPhonologyGame(canvas, logicalW, logicalH); break;
      case 'social': this.setupSocialGame(canvas, logicalW, logicalH); break;
      default: this.setupMemoryGame(canvas, logicalW, logicalH);
    }
  }

  setupMemoryGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    const symbols = ['🍎','🍌','🍇','🍊','🍓','🍋','🥝','🍒'];
    const pairs = symbols.slice(0, 6);
    const cards = [...pairs, ...pairs].sort(() => Math.random() - 0.5);
    this.gameData = { ...this.gameData, cards, flipped: [], matched: [], attempts: 0 };
    const cols = 4, rows = 3;
    const w = W / cols, h = H / rows;
    const cardSize = Math.min(w, h) - 8;
    const fontSize = Math.max(16, Math.min(28, cardSize * 0.5));

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

  setupPhonologyGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    const words = [{word: 'GATO', options: ['GATO','GATA','MATO','RATO']},{word: 'BOLA', options: ['BOLA','BOLSA','MOLA','FOLA']},{word: 'PATO', options: ['PATO','PATA','MATO','RATO']}];
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

  setupSocialGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    const scenarios = [
      { situation: 'Um colega está triste. O que você faz?', options: ['Ignorar','Brincar junto','Chamar atenção','Falar baixo'], correct: 3 },
      { situation: 'Alguém pediu para esperar. O que você faz?', options: ['Esperar','Gritar','Sair','Bater'], correct: 0 },
      { situation: 'Você quer o brinquedo do amigo. O que você faz?', options: ['Pedir emprestado','Tomar','Chorar','Esconder'], correct: 0 },
    ];
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
    this.showGameModal.set(false);
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
