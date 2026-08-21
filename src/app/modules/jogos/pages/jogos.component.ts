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
    <div class="space-y-8 animate-in">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">60 Jogos Cognitivos</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Atividades interativas para estimulação cognitiva</p>
        </div>
        <div class="relative flex-1 max-w-md">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
          <input class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="Buscar jogo..." [(ngModel)]="searchTerm" (input)="filterGames()">
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        @for (cat of categories; track cat) {
          <button class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            [class]="filterCategory() === cat ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50'"
            (click)="filterCategory.set(cat); filterGames()">
            {{ cat || 'Todos' }}
          </button>
        }
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (jogo of filteredGames(); track jogo.id) {
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden hover:ring-primary/50 hover:-translate-y-1 transition-all">
            <div class="h-28 flex items-center justify-center" [class]="getCategoryBg(jogo.category)">
              <span class="material-icons text-4xl opacity-60">{{ getCategoryIcon(jogo.category) }}</span>
            </div>
            <div class="p-4">
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-bold text-slate-900 dark:text-white text-sm leading-tight">{{ jogo.name }}</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0" [class]="getCategoryStyle(jogo.category)">
                  {{ jogo.category.split(' ')[0] }}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">{{ jogo.description }}</p>
              <div class="flex items-center gap-2 mb-3">
                @for (star of [1,2,3]; track star) {
                  <span class="material-icons text-[14px]"
                    [class]="star <= jogo.difficulty ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'">star</span>
                }
                <span class="text-[10px] text-slate-500 ml-1">{{ jogo.time }}</span>
                <span class="text-[10px] text-slate-500">· {{ jogo.ageRange }} anos</span>
              </div>
              <button class="w-full py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold transition-all active:scale-95"
                (click)="startGame(jogo)">
                <span class="material-icons text-[14px] align-middle mr-1">play_arrow</span> Jogar
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
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="closeGame()">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl mx-4 ring-1 ring-slate-200 dark:ring-slate-800 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          @if (!gameFinished()) {
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">{{ currentGame()?.name }}</h3>
                <p class="text-xs text-slate-500">{{ currentGame()?.category }} · {{ currentGame()?.ageRange }} anos</p>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-center">
                  <p class="text-[10px] font-bold text-slate-500 uppercase">Tempo</p>
                  <p class="text-lg font-black text-primary">{{ formatTime(gameTimer()) }}</p>
                </div>
                <div class="text-center">
                  <p class="text-[10px] font-bold text-slate-500 uppercase">Pontos</p>
                  <p class="text-lg font-black text-emerald-600">{{ gameScore() }}</p>
                </div>
                <button class="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" (click)="closeGame()">
                  <span class="material-icons">close</span>
                </button>
              </div>
            </div>
            <div class="p-6">
              <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 min-h-[300px] flex flex-col items-center justify-center">
                @if (!gameStarted()) {
                  <p class="text-slate-600 dark:text-slate-300 text-center mb-6">{{ currentGame()?.description }}</p>
                  <button class="px-8 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                    (click)="initGame()">
                    Iniciar Jogo
                  </button>
                } @else {
                  <canvas #gameCanvas width="500" height="300" class="rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700"></canvas>
                  <p class="text-sm text-slate-500 mt-3">{{ gameInstruction() }}</p>
                }
              </div>
            </div>
          } @else {
            <div class="p-8 text-center">
              <div class="size-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="material-icons text-emerald-600 dark:text-emerald-400 text-4xl">emoji_events</span>
              </div>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2">Parabéns!</h3>
              <p class="text-slate-500 dark:text-slate-400 mb-6">{{ currentGame()?.name }}</p>
              <div class="grid grid-cols-2 gap-4 mb-8">
                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p class="text-[10px] font-bold text-slate-500 uppercase">Pontuação</p>
                  <p class="text-3xl font-black text-emerald-600">{{ gameScore() }}</p>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p class="text-[10px] font-bold text-slate-500 uppercase">Tempo</p>
                  <p class="text-3xl font-black text-primary">{{ formatTime(gameTimer()) }}</p>
                </div>
              </div>
              @if (getHighScore(currentGame()?.id || 0)) {
                <p class="text-xs text-slate-500 mb-4">Recorde: {{ getHighScore(currentGame()?.id || 0) }} pontos</p>
              }
              <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 text-left mb-6">
                <div class="flex items-center gap-2 mb-4">
                  <span class="material-icons text-blue-600 dark:text-blue-400">psychology</span>
                  <h4 class="font-bold text-blue-900 dark:text-blue-300">Reflexão Clínica</h4>
                </div>
                @for (q of clinicalQuestions(); track $index) {
                  <div class="mb-3">
                    <p class="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">{{ $index + 1 }}. {{ q }}</p>
                    <textarea class="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl text-sm ring-1 ring-blue-200 dark:ring-blue-800 focus:ring-2 focus:ring-primary outline-none resize-none"
                      rows="2" placeholder="Observação clínica..."></textarea>
                  </div>
                }
              </div>
              <div class="flex gap-3 justify-center">
                <button class="px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 transition-all"
                  (click)="startGame(currentGame()!)">
                  Jogar Novamente
                </button>
                <button class="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl font-bold text-sm transition-all"
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

  ngOnDestroy() { this.clearTimers(); }

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
    setTimeout(() => this.setupCanvas(), 100);
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
    this.canvasCtx = canvas.getContext('2d');
    const jogo = this.currentGame();
    if (!jogo || !this.canvasCtx) return;
    switch (jogo.type) {
      case 'memory': this.setupMemoryGame(canvas); break;
      case 'math': this.setupMathGame(canvas); break;
      case 'sequence': this.setupSequenceGame(canvas); break;
      case 'attention': this.setupAttentionGame(canvas); break;
      case 'phonology': this.setupPhonologyGame(canvas); break;
      case 'social': this.setupSocialGame(canvas); break;
      default: this.setupMemoryGame(canvas);
    }
  }

  setupMemoryGame(canvas: HTMLCanvasElement) {
    const ctx = this.canvasCtx!;
    const symbols = ['🍎','🍌','🍇','🍊','🍓','🍋','🥝','🍒'];
    const pairs = symbols.slice(0, 6);
    const cards = [...pairs, ...pairs].sort(() => Math.random() - 0.5);
    this.gameData = { cards, flipped: [], matched: [], attempts: 0 };
    const cols = 4, rows = 3;
    const w = canvas.width / cols, h = canvas.height / rows;

    this.gameInstruction.set('Encontre os pares de cartas');

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
          ctx.font = '28px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#1e293b';
          ctx.fillText(sym, x + w / 2, y + h / 2);
        }
      });
    };

    draw();

    canvas.onclick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const col = Math.floor((e.clientX - rect.left) / (canvas.width / cols));
      const row = Math.floor((e.clientY - rect.top) / (canvas.height / rows));
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
    };
  }

  setupMathGame(canvas: HTMLCanvasElement) {
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

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(`${a} ${op} ${b} = ?`, 250, 60);

      ctx.font = 'bold 40px sans-serif';
      ctx.fillText(input || '_', 250, 130);

      const bw = 70, bh = 50, startX = 60, startY = 170;
      buttons.forEach((btn, i) => {
        const x = startX + (i % 4) * (bw + 15);
        const y = startY + Math.floor(i / 4) * (bh + 10);
        ctx.fillStyle = btn === 'OK' ? '#007f80' : '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(x, y, bw, bh, 8);
        ctx.fill();
        ctx.fillStyle = btn === 'OK' ? '#fff' : '#1e293b';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn, x + bw / 2, y + bh / 2);
      });

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Acertos: ${correct}/${total}`, 250, 290);
    };

    newQuestion();

    canvas.onclick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height);
      const bw = 70, bh = 50, startX = 60, startY = 170;
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
    };
  }

  setupSequenceGame(canvas: HTMLCanvasElement) {
    const ctx = this.canvasCtx!;
    const colors = ['#ef4444','#3b82f6','#22c55e','#eab308','#a855f7'];
    const sequence = Array.from({length: 5}, () => Math.floor(Math.random() * colors.length));
    let userSequence: number[] = [];
    let showingSequence = true;
    let round = 1;

    this.gameInstruction.set('Memorize e repita a sequência de cores');

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
        const x = (i % 5) * 100;
        ctx.fillStyle = colors[sequence[i]];
        ctx.beginPath();
        ctx.roundRect(x + 10, 120, 80, 80, 12);
        ctx.fill();
        i++;
      }, 600);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(i * 100 + 10, 120, 80, 80, 12);
        ctx.fill();
      }
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Rodada ${round} · Acertos: ${userSequence.filter((v,i) => v === sequence[i]).length}/5`, 250, 260);
    };

    draw();
    showSequence();

    canvas.onclick = (e: MouseEvent) => {
      if (showingSequence) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const col = Math.floor(mx / 100);
      if (col < 0 || col >= 5) return;
      userSequence.push(col);

      ctx.fillStyle = colors[col];
      ctx.beginPath();
      ctx.roundRect(col * 100 + 10, 120, 80, 80, 12);
      ctx.fill();

      if (userSequence.length === sequence.length) {
        const correct = userSequence.filter((v,i) => v === sequence[i]).length;
        this.gameScore.update(s => s + correct * 5);
        if (correct === 5 && round < 3) {
          round++;
          sequence.push(Math.floor(Math.random() * colors.length));
          userSequence = [];
          setTimeout(() => showSequence(), 500);
        } else {
          this.finishGame();
        }
      }
    };
  }

  setupAttentionGame(canvas: HTMLCanvasElement) {
    const ctx = this.canvasCtx!;
    let clicked = 0, missed = 0, targetIdx = -1;
    const totalTargets = 10;

    const newRound = () => {
      if (clicked + missed >= totalTargets) { this.finishGame(); return; }
      const shapes = Array.from({length: 8}, (_, i) => ({x: Math.random() * 440 + 30, y: Math.random() * 220 + 30, isTarget: false}));
      targetIdx = Math.floor(Math.random() * shapes.length);
      shapes[targetIdx].isTarget = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      shapes.forEach((s, i) => {
        ctx.fillStyle = s.isTarget ? '#3b82f6' : '#e2e8f0';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 22, 0, Math.PI * 2);
        ctx.fill();
        if (s.isTarget) {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', s.x, s.y);
        }
      });
      this.gameInstruction.set(`Clique na estrela azul! (${clicked + clicked}/${totalTargets})`);
      canvas.onclick = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
        const my = (e.clientY - rect.top) * (canvas.height / rect.height);
        shapes.forEach((s, i) => {
          const dist = Math.sqrt((mx - s.x) ** 2 + (my - s.y) ** 2);
          if (dist < 25) {
            if (s.isTarget) { clicked++; this.gameScore.update(s => s + 10); }
            else { missed++; }
            canvas.onclick = null;
            setTimeout(newRound, 300);
          }
        });
      };
    };

    newRound();
  }

  setupPhonologyGame(canvas: HTMLCanvasElement) {
    const ctx = this.canvasCtx!;
    const words = [{word: 'GATO', options: ['GATO','GATA','MATO','RATO']},{word: 'BOLA', options: ['BOLA','BOLSA','MOLA','FOLA']},{word: 'PATO', options: ['PATO','PATA','MATO','RATO']}];
    let currentIdx = 0, correct = 0;

    const drawQuestion = () => {
      if (currentIdx >= words.length) { this.finishGame(); return; }
      const q = words[currentIdx];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Qual é a palavra correta?', 250, 50);
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`_${'_'.repeat(q.word.length - 2)}_`, 250, 100);

      q.options.forEach((opt, i) => {
        const x = 40 + (i % 2) * 230, y = 140 + Math.floor(i / 2) * 70;
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(x, y, 200, 50, 10);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(opt, x + 100, y + 30);
      });

      this.gameInstruction.set(`Pergunta ${currentIdx + 1}/${words.length} · Acertos: ${correct}`);

      canvas.onclick = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
        const my = (e.clientY - rect.top) * (canvas.height / rect.height);
        q.options.forEach((_, i) => {
          const x = 40 + (i % 2) * 230, y = 140 + Math.floor(i / 2) * 70;
          if (mx >= x && mx <= x + 200 && my >= y && my <= y + 50) {
            if (q.options[i] === q.word) { correct++; this.gameScore.update(s => s + 10); }
            canvas.onclick = null;
            currentIdx++;
            setTimeout(drawQuestion, 400);
          }
        });
      };
    };

    drawQuestion();
  }

  setupSocialGame(canvas: HTMLCanvasElement) {
    const ctx = this.canvasCtx!;
    const scenarios = [
      { situation: 'Um colega está triste. O que você faz?', options: ['Ignorar','Brincar junto','Chamar atenção','Falar baixo'], correct: 3 },
      { situation: 'Alguém pediu para esperar. O que você faz?', options: ['Esperar','Gritar','Sair','Bater'], correct: 0 },
      { situation: 'Você quer o brinquedo do amigo. O que você faz?', options: ['Pedir emprestado','Tomar','Chorar','Esconder'], correct: 0 },
    ];
    let currentIdx = 0, correct = 0;

    const drawScenario = () => {
      if (currentIdx >= scenarios.length) { this.finishGame(); return; }
      const s = scenarios[currentIdx];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(s.situation, 250, 50);

      s.options.forEach((opt, i) => {
        const x = 40 + (i % 2) * 230, y = 100 + Math.floor(i / 2) * 80;
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(x, y, 200, 60, 10);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(opt, x + 100, y + 35);
      });

      this.gameInstruction.set(`Cenário ${currentIdx + 1}/${scenarios.length}`);

      canvas.onclick = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
        const my = (e.clientY - rect.top) * (canvas.height / rect.height);
        s.options.forEach((_, i) => {
          const x = 40 + (i % 2) * 230, y = 100 + Math.floor(i / 2) * 80;
          if (mx >= x && mx <= x + 200 && my >= y && my <= y + 60) {
            if (i === s.correct) { correct++; this.gameScore.update(s => s + 10); }
            canvas.onclick = null;
            currentIdx++;
            setTimeout(drawScenario, 400);
          }
        });
      };
    };

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
