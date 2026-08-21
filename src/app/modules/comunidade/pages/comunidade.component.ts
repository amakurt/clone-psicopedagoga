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
  { id: 1, title: 'Caso clinico: Criança com atraso de linguagem e uso excessivo de telas',
    content: 'Atendi uma criança de 4 anos que fala apenas 5 palavras. Os pais relatam que ela passa 4h/dia no tablet. Alguém ja trabalhou com caso similar? Quais estrategias de orientação familiar vocês usaram?',
    category: 'Casos Clinicos', tags: ['linguagem', 'telas', 'orientacao-familiar'], author: 'Dra. Marina Costa',
    date: '2025-08-18', votes: 24, userVote: null,
    comments: [
      { id: 1, author: 'Prof. Lucas', content: 'Tive caso similar. O que funcionou foi criar uma rotina visual de usos de telas e propor brincadeiras interativas com os pais.', date: '2025-08-18', votes: 8 },
      { id: 2, author: 'Ana Psicopedagoga', content: 'Recomendo o protocolo de orientação familiar do CAF (Circle of Security). Funciona muito bem para pais com baixa compreensão.', date: '2025-08-19', votes: 5 },
    ] },
  { id: 2, title: 'Material: Mapa mental para trabalhar funções executivas',
    content: 'Criei um mapa mental interativo para trabalhar planejamento e organização com alunos de 8-12 anos. Compartilho o link para download. Qualquer feedback é bem-vindo!',
    category: 'Materiais Compartilhados', tags: ['funcoes-executivas', 'material-digital', 'planejamento'], author: 'Carlos Educativo',
    date: '2025-08-17', votes: 31, userVote: null,
    comments: [
      { id: 3, author: 'Fernanda', content: 'Adorei! Vou usar na próxima semana com meu grupo de TDAH. Obrigada por compartilhar!', date: '2025-08-17', votes: 3 },
    ] },
  { id: 3, title: 'Dúvida: Como trabalhar motivação em adolescentes com TOD?',
    content: 'Tenho um adolescente de 14 anos com TOD que se recusa a participar das atividades. Ja tive abordagens lúdicas, reforço positivo, mas nada funciona. Alguma sugestão?',
    category: 'Duvidas Tecnicas', tags: ['TOD', 'adolescente', 'motivacao'], author: 'Patricia Lima',
    date: '2025-08-16', votes: 18, userVote: null,
    comments: [
      { id: 4, author: 'Dr. Rafael', content: 'Tente entender o que esta por tras da recusa. Frequentemente é medo de falhar ou baixa autoestima. Abordagem motivacional entrevista pode ajudar.', date: '2025-08-16', votes: 12 },
      { id: 5, author: 'Juliana', content: 'Funcionou comigo usar projetos de interesse dele, mesmo que não sejam academicos. Construiu ponte para outras atividades.', date: '2025-08-17', votes: 7 },
    ] },
  { id: 4, title: 'Experiência: Primeiro ano implementando ABA na escola',
    content: 'Compartilho nossa experiencia de implementar principios ABA em escola publica. Foram 12 meses de muito aprendizado. Os resultados foram surpreendentes: redução de 60% em comportamentos problema.',
    category: 'Experiencias', tags: ['ABA', 'escola-publica', 'inclusao'], author: 'Equipe TEA SP',
    date: '2025-08-15', votes: 42, userVote: null,
    comments: [
      { id: 6, author: 'Marta', content: 'Incrivel! Vocês tiveram resistência dos professores no início? Como superaram?', date: '2025-08-15', votes: 4 },
      { id: 7, author: 'Equipe TEA SP', content: 'Sim, houve resistência. O que ajudou foram as sessões de formação continua e os pequenos resultados rapidos que mostramos.', date: '2025-08-15', votes: 9 },
    ] },
  { id: 5, title: 'Novidade: Nova atualização do sistema de protocolos TEA',
    content: 'O sistema recebeu atualização importante: agora inclui protocolos baseados em evidências para diferentes niveis de suporte TEA. Confiram na aba Protocolos!',
    category: 'Novidades', tags: ['TEA', 'protocolos', 'atualizacao'], author: 'Suporte EduPsych',
    date: '2025-08-20', votes: 15, userVote: null,
    comments: [] },
];

@Component({
  selector: 'app-comunidade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-in">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Comunidade</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Forum de discussao e compartilhamento</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative flex-1 max-w-md">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
            <input class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
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
          [class]="activeCategory() === '' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50'"
          (click)="activeCategory.set(''); filterPosts()">
          Todos
        </button>
        @for (cat of categories; track cat) {
          <button class="px-4 py-2 rounded-xl text-xs font-bold transition-all"
            [class]="activeCategory() === cat ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50'"
            (click)="activeCategory.set(cat); filterPosts()">
            {{ cat }}
          </button>
        }
      </div>

      <div class="flex gap-6">
        <div class="flex-1 space-y-4">
          @for (post of filteredPosts(); track post.id) {
            <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-5 hover:ring-primary/30 transition-all">
              <div class="flex gap-4">
                <div class="flex flex-col items-center gap-1 shrink-0">
                  <button class="p-1 rounded-lg transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    [class]="post.userVote === 'up' ? 'text-emerald-600' : 'text-slate-400'"
                    (click)="vote(post.id, 'up')">
                    <span class="material-icons text-lg">arrow_upward</span>
                  </button>
                  <span class="text-sm font-black" [class]="post.votes > 0 ? 'text-emerald-600' : 'text-slate-400'">{{ post.votes }}</span>
                  <button class="p-1 rounded-lg transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
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
                  <h3 class="font-bold text-slate-900 dark:text-white text-sm mb-2 cursor-pointer hover:text-primary transition-colors"
                    (click)="openPost(post)">{{ post.title }}</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{{ post.content }}</p>
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
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-5">
            <h3 class="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
              <span class="material-icons text-amber-500 text-sm">local_fire_department</span>
              Mais Discutidas
            </h3>
            <div class="space-y-3">
              @for (post of topPosts(); track post.id) {
                <div class="flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-all" (click)="openPost(post)">
                  <span class="text-lg font-black text-primary/30">{{ post.votes }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ post.title }}</p>
                    <p class="text-[10px] text-slate-500">{{ post.comments.length }} comentarios</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-5">
            <h3 class="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
              <span class="material-icons text-primary text-sm">person</span>
              Meu Perfil
            </h3>
            <div class="flex items-center gap-3 mb-4">
              <div class="size-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span class="material-icons text-primary text-xl">person</span>
              </div>
              <div>
                <p class="text-sm font-bold text-slate-900 dark:text-white">Usuario Atual</p>
                <p class="text-[10px] text-slate-500">Psicopedagoga</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-center">
              <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p class="text-lg font-black text-primary">{{ userPostCount() }}</p>
                <p class="text-[10px] text-slate-500">Posts</p>
              </div>
              <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p class="text-lg font-black text-emerald-600">{{ userTotalVotes() }}</p>
                <p class="text-[10px] text-slate-500">Votos</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-5">
            <h3 class="font-bold text-slate-900 dark:text-white text-sm mb-3">Tags Populares</h3>
            <div class="flex flex-wrap gap-2">
              @for (tag of popularTags(); track tag) {
                <span class="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[10px] font-bold cursor-pointer hover:bg-primary/10 hover:text-primary transition-all">
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
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl mx-4 ring-1 ring-slate-200 dark:ring-slate-800 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
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
                <button class="p-1 rounded-lg transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  [class]="selectedPost()!.userVote === 'up' ? 'text-emerald-600' : 'text-slate-400'"
                  (click)="vote(selectedPost()!.id, 'up')">
                  <span class="material-icons text-lg">arrow_upward</span>
                </button>
                <span class="text-sm font-black">{{ selectedPost()!.votes }}</span>
                <button class="p-1 rounded-lg transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
                  [class]="selectedPost()!.userVote === 'down' ? 'text-red-600' : 'text-slate-400'"
                  (click)="vote(selectedPost()!.id, 'down')">
                  <span class="material-icons text-lg">arrow_downward</span>
                </button>
              </div>
              <div>
                <h2 class="text-lg font-black text-slate-900 dark:text-white mb-2">{{ selectedPost()!.title }}</h2>
                <div class="flex items-center gap-3 text-[10px] text-slate-500 mb-4">
                  <span>{{ selectedPost()!.author }}</span>
                  <span>{{ selectedPost()!.date }}</span>
                </div>
                <p class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{{ selectedPost()!.content }}</p>
                <div class="flex gap-2 mt-3">
                  @for (tag of selectedPost()!.tags; track tag) {
                    <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[10px]">#{{ tag }}</span>
                  }
                </div>
              </div>
            </div>

            <div class="border-t border-slate-100 dark:border-slate-800 pt-4">
              <h4 class="font-bold text-slate-900 dark:text-white text-sm mb-4">{{ selectedPost()!.comments.length }} Comentarios</h4>
              <div class="space-y-4 mb-4">
                @for (comment of selectedPost()!.comments; track comment.id) {
                  <div class="flex gap-3">
                    <div class="size-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center shrink-0">
                      <span class="material-icons text-slate-500 text-sm">person</span>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-bold text-slate-900 dark:text-white">{{ comment.author }}</span>
                        <span class="text-[10px] text-slate-500">{{ comment.date }}</span>
                      </div>
                      <p class="text-xs text-slate-700 dark:text-slate-300">{{ comment.content }}</p>
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
                  <textarea class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none resize-none"
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
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg mx-4 ring-1 ring-slate-200 dark:ring-slate-800" (click)="$event.stopPropagation()">
          <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 class="font-bold text-slate-900 dark:text-white">Novo Post</h3>
            <button class="p-2 text-slate-500" (click)="showNewPostModal.set(false)">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Titulo</label>
              <input class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700" placeholder="Titulo do post" [(ngModel)]="newPostTitle">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
              <div class="flex flex-wrap gap-2">
                @for (cat of categories; track cat) {
                  <button class="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                    [class]="newPostCategory() === cat ? 'bg-primary text-on-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 ring-1 ring-slate-200 dark:ring-slate-700'"
                    (click)="newPostCategory.set(cat)">
                    {{ cat }}
                  </button>
                }
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tags (separadas por virgula)</label>
              <input class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700" placeholder="tag1, tag2, tag3" [(ngModel)]="newPostTags">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Conteudo</label>
              <textarea class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 resize-none" rows="5"
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
  userPostCount = computed(() => this.posts.filter(p => p.author === 'Usuario Atual').length);
  userTotalVotes = computed(() => this.posts.filter(p => p.author === 'Usuario Atual').reduce((sum, p) => sum + p.votes, 0));

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
      'Casos Clinicos': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Duvidas Tecnicas': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'Materiais Compartilhados': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'Experiencias': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Novidades': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
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
      author: 'Usuario Atual',
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
      author: 'Usuario Atual',
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
