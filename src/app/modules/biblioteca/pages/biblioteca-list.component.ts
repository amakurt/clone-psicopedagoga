import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BibliotecaService } from '../services/biblioteca.service';

@Component({
  selector: 'app-biblioteca-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Biblioteca</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Recursos terapêuticos</p>
        </div>
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all cursor-pointer">
            <span class="material-icons text-lg">upload_file</span> Upload
            <input type="file" class="hidden" (change)="onFileUpload($event)" accept=".pdf,.doc,.docx,.txt,.ppt,.pptx">
          </label>
          <a routerLink="/app/biblioteca/novo"
            class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
            <span class="material-icons text-[18px]">add</span>
            <span>Novo Recurso</span>
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3">
        @for (cat of categories; track cat.value) {
          <button class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            [class]="filterCategory() === cat.value ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50'"
            (click)="filterCategory.set(cat.value); load()">
            {{ cat.label }}
          </button>
        }
      </div>

      <!-- Upload Progress -->
      @if (uploading()) {
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 p-4 rounded-2xl flex items-center gap-3">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span class="text-sm font-medium text-blue-700 dark:text-blue-400">Enviando recurso...</span>
        </div>
      }

      <!-- Grid View -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (r of items(); track r.id) {
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden hover:ring-primary/50 hover:-translate-y-1 transition-all cursor-pointer"
            (click)="viewResource(r)">
            <div class="h-32 flex items-center justify-center"
              [class]="getCategoryBg(r.category)">
              <span class="material-icons text-4xl opacity-50">{{ getCategoryIcon(r.category) }}</span>
            </div>
            <div class="p-5">
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-bold text-slate-900 dark:text-white text-sm">{{ r.name }}</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                  [class]="getCategoryStyle(r.category)">
                  {{ r.category || 'Geral' }}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{{ r.description || 'Sem descrição' }}</p>
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-400">{{ r.ageRange || 'Todas as idades' }}</span>
                <div class="flex gap-1">
                  <a [routerLink]="['/app/biblioteca', r.id, 'editar']" class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" (click)="$event.stopPropagation()">
                    <span class="material-icons text-sm">edit</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      @if (items().length === 0 && !loading()) {
        <div class="text-center py-12">
          <span class="material-icons text-6xl text-slate-300">menu_book</span>
          <p class="text-slate-500 mt-3">Nenhum recurso encontrado</p>
        </div>
      }
    </div>

    @if (showToast()) {
      <div class="fixed bottom-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 animate-in shadow-lg bg-emerald-500 text-white">
        <span class="material-icons">check_circle</span>
        <span class="text-sm font-medium">{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `]
})
export class BibliotecaListComponent implements OnInit {
  private service = inject(BibliotecaService);
  items = signal<any[]>([]);
  loading = signal(true);
  uploading = signal(false);
  filterCategory = signal('');
  showToast = signal(false);
  toastMessage = signal('');

  categories = [
    { value: '', label: 'Todos' },
    { value: 'JOGOS', label: 'Jogos' },
    { value: 'MATERIAIS', label: 'Materiais' },
    { value: 'ATIVIDADES', label: 'Atividades' },
    { value: 'AVALIACAO', label: 'Avaliação' },
  ];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const params: any = {};
    if (this.filterCategory()) params.category = this.filterCategory();

    this.service.list(params).subscribe({
      next: (res: any) => { this.items.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'JOGOS': return 'sports_esports';
      case 'MATERIAIS': return 'inventory_2';
      case 'ATIVIDADES': return 'brush';
      case 'AVALIACAO': return 'assessment';
      default: return 'menu_book';
    }
  }

  getCategoryBg(category: string): string {
    switch (category) {
      case 'JOGOS': return 'bg-purple-100 dark:bg-purple-900/30';
      case 'MATERIAIS': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'ATIVIDADES': return 'bg-amber-100 dark:bg-amber-900/30';
      case 'AVALIACAO': return 'bg-emerald-100 dark:bg-emerald-900/30';
      default: return 'bg-slate-100 dark:bg-slate-800';
    }
  }

  getCategoryStyle(category: string): string {
    switch (category) {
      case 'JOGOS': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'MATERIAIS': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ATIVIDADES': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'AVALIACAO': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  }

  onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    this.uploading.set(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name.replace(/\.[^/.]+$/, ''));
    formData.append('category', 'MATERIAIS');

    this.service.create(formData).subscribe({
      next: () => {
        this.uploading.set(false);
        this.toastMessage.set('Recurso enviado com sucesso!');
        this.showToast.set(true);
        setTimeout(() => this.showToast.set(false), 3000);
        this.load();
      },
      error: () => {
        this.uploading.set(false);
        this.toastMessage.set('Erro ao enviar recurso');
        this.showToast.set(true);
        setTimeout(() => this.showToast.set(false), 3000);
      }
    });

    input.value = '';
  }

  viewResource(r: any) {
    window.location.href = `/biblioteca/${r.id}`;
  }
}
