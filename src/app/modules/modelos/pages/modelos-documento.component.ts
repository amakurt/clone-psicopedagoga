import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DOC_TEMPLATES, DOC_CATEGORIES, DocTemplate } from '@core/data/doc-templates.data';
import { ClinicalDocEditorComponent } from '@shared/components/clinical-doc-editor/clinical-doc-editor.component';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-modelos-documento',
  standalone: true,
  imports: [CommonModule, FormsModule, ClinicalDocEditorComponent],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">37 Modelos de Documentos Clínicos</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Templates profissionais categorizados e prontos para uso em laudos, pareceres e relatórios
          </p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="relative">
        <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white shadow-sm"
          [(ngModel)]="searchTerm" (ngModelChange)="filterItems()" placeholder="Buscar modelos por nome, diagnóstico ou categoria...">
      </div>

      <!-- Category Filter Pills -->
      <div class="flex flex-wrap gap-2">
        <button (click)="filterCategory.set(''); filterItems()"
          class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          [class]="filterCategory() === '' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50'">
          Todos ({{ totalCount }})
        </button>
        @for (cat of categories; track cat.value) {
          <button (click)="filterCategory.set(cat.value); filterItems()"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            [class]="filterCategory() === cat.value ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50'">
            {{ cat.label }} ({{ cat.count }})
          </button>
        }
      </div>

      <!-- Grid of Templates -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (item of filteredItems(); track item.id) {
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden hover:ring-primary/40 hover:-translate-y-1 hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div class="h-24 flex items-center justify-center transition-transform group-hover:scale-105" [class]="getCategoryBg(item.category)">
                <span class="material-icons text-3xl opacity-70">{{ getCategoryIcon(item.category) }}</span>
              </div>
              <div class="p-5">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <h3 class="font-bold text-slate-900 dark:text-white text-sm leading-snug group-hover:text-primary transition-colors">
                    {{ item.name }}
                  </h3>
                  <button (click)="toggleFavorite(item.id)"
                    class="p-1 rounded-lg transition-all shrink-0"
                    [class]="item.favorite ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'">
                    <span class="material-icons text-lg">{{ item.favorite ? 'star' : 'star_border' }}</span>
                  </button>
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-2.5"
                  [class]="getCategoryStyle(item.category)">
                  {{ item.category }}
                </span>
                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {{ item.description }}
                </p>
              </div>
            </div>

            <div class="p-5 pt-0 flex gap-2">
              <button (click)="useTemplate(item)"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95">
                <span class="material-icons text-sm">edit_note</span> Visualizar & Editar
              </button>
              <button (click)="createLaudoFromTemplate(item)"
                class="flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-all"
                title="Criar Laudo com este Modelo">
                <span class="material-icons text-sm">send</span>
              </button>
            </div>
          </div>
        }
      </div>

      @if (filteredItems().length === 0) {
        <div class="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <span class="material-icons text-6xl text-slate-300 dark:text-slate-600">search_off</span>
          <p class="text-slate-500 font-semibold mt-3">Nenhum modelo encontrado para sua busca</p>
        </div>
      }

      <!-- Interactive A4 Editor Modal -->
      @if (editingTemplate()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="editingTemplate.set(null)"></div>
          <div class="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[94vh] overflow-hidden flex flex-col z-10 animate-in border border-slate-200 dark:border-slate-800">
            
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span class="material-icons">description</span>
                </div>
                <div>
                  <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ editingTemplate()!.name }}</h2>
                  <p class="text-xs text-slate-500">Editor Visual A4 • Categoria {{ editingTemplate()!.category }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button (click)="createLaudoFromTemplate(editingTemplate()!)"
                  class="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-bold text-xs transition-all shadow-md active:scale-95">
                  <span class="material-icons text-sm">assignment</span>
                  Criar Laudo com este Modelo
                </button>
                <button (click)="editingTemplate.set(null)" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <span class="material-icons">close</span>
                </button>
              </div>
            </div>

            <!-- Modal Content (Clinical A4 Document Editor) -->
            <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 dark:bg-slate-950/60">
              <app-clinical-doc-editor
                [content]="editContent"
                (contentChange)="editContent = $event">
              </app-clinical-doc-editor>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ModelosDocumentoComponent {
  private router = inject(Router);
  private toast = inject(ToastService);

  searchTerm = '';
  filterCategory = signal('');
  editingTemplate = signal<DocTemplate | null>(null);
  editContent = '';

  categories = DOC_CATEGORIES;
  totalCount = DOC_TEMPLATES.length;
  private allItems: DocTemplate[] = DOC_TEMPLATES;

  filteredItems = signal<DocTemplate[]>(this.allItems);

  filterItems() {
    const term = this.searchTerm.toLowerCase().trim();
    const cat = this.filterCategory();
    this.filteredItems.set(
      this.allItems.filter(item => {
        const catMatch = !cat || item.category === cat;
        const searchMatch = !term ||
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term);
        return catMatch && searchMatch;
      })
    );
  }

  toggleFavorite(id: string) {
    const item = this.allItems.find(i => i.id === id);
    if (item) {
      item.favorite = !item.favorite;
      this.filterItems();
    }
  }

  useTemplate(item: DocTemplate) {
    this.editingTemplate.set(item);
    this.editContent = item.content;
  }

  createLaudoFromTemplate(item: DocTemplate) {
    sessionStorage.setItem('template_title', item.name);
    sessionStorage.setItem('template_content', this.editContent || item.content);
    this.editingTemplate.set(null);
    this.toast.info(`Modelo "${item.name}" transferido para o novo laudo.`);
    this.router.navigate(['/app/laudos/novo']);
  }

  getCategoryIcon(cat: string): string {
    const icons: Record<string, string> = {
      'Diagnóstico': 'medical_services',
      'Avaliação': 'assessment',
      'Intervenção': 'handyman',
      'Escolar': 'school',
      'Jurídico': 'gavel',
      'Família': 'family_restroom',
      'Financeiro': 'payments'
    };
    return icons[cat] || 'description';
  }

  getCategoryBg(cat: string): string {
    const bgs: Record<string, string> = {
      'Diagnóstico': 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
      'Avaliação': 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      'Intervenção': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      'Escolar': 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
      'Jurídico': 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
      'Família': 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400',
      'Financeiro': 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400'
    };
    return bgs[cat] || 'bg-slate-50 dark:bg-slate-800 text-slate-600';
  }

  getCategoryStyle(cat: string): string {
    const styles: Record<string, string> = {
      'Diagnóstico': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Avaliação': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Intervenção': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'Escolar': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'Jurídico': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Família': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      'Financeiro': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
    };
    return styles[cat] || 'bg-slate-100 text-slate-700';
  }
}
