import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Material {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  ageRange: string;
  format: string;
  favorite: boolean;
}

const SUBCATEGORIES = [
  'Atividades de Linguagem', 'Atividades de Leitura e Escrita', 'Atividades de Matemática',
  'Atividades de Funções Executivas', 'Atividades Socioemocionais', 'Atividades de Atenção',
  'Protocolos por Diagnóstico', 'Anamneses Prontas', 'Guias para Família',
  'Guias para Professor', 'Materiais ABA', 'Pacotes de Sessão',
];

const COUNTS = [20, 20, 20, 20, 20, 15, 20, 15, 15, 15, 15, 15];

function generateMaterials(): Material[] {
  const materials: Material[] = [];
  let id = 1;
  const formats = ['PDF', 'DOCX'];
  const ages = ['3-6', '4-8', '5-10', '6-12', '3-12', '7-12'];
  const categoryColors: Record<string, string> = {
    'Atividades de Linguagem': 'blue', 'Atividades de Leitura e Escrita': 'purple',
    'Atividades de Matemática': 'emerald', 'Atividades de Funções Executivas': 'amber',
    'Atividades Socioemocionais': 'pink', 'Atividades de Atenção': 'red',
    'Protocolos por Diagnóstico': 'indigo', 'Anamneses Prontas': 'cyan',
    'Guias para Família': 'teal', 'Guias para Professor': 'orange',
    'Materiais ABA': 'violet', 'Pacotes de Sessão': 'rose',
  };
  SUBCATEGORIES.forEach((sub, i) => {
    for (let j = 1; j <= COUNTS[i]; j++) {
      materials.push({
        id: id++, name: `${sub} #${j}`, category: categoryColors[sub] || 'slate',
        subcategory: sub, ageRange: ages[j % ages.length], format: formats[j % 2], favorite: false,
      });
    }
  });
  return materials;
}

const ALL_MATERIALS = generateMaterials();

@Component({
  selector: 'app-materiais-expandidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-in">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">247 Materiais Terapêuticos</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Biblioteca completa de recursos clínicos</p>
        </div>
        <div class="relative flex-1 max-w-md">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
          <input class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="Buscar material..." [(ngModel)]="searchTerm" (input)="filterMaterials()">
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3">
        <select class="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none"
          [(ngModel)]="filterSubcategory" (change)="filterMaterials()">
          <option value="">Todas as subcategorias</option>
          @for (sub of subcategories; track sub) {
            <option [value]="sub">{{ sub }}</option>
          }
        </select>
        <select class="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none"
          [(ngModel)]="filterAge" (change)="filterMaterials()">
          <option value="">Todas as idades</option>
          @for (age of ageRanges; track age) {
            <option [value]="age">{{ age }} anos</option>
          }
        </select>
        <button class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
          [class]="showFavoritesOnly() ? 'bg-red-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-red-500/50'"
          (click)="showFavoritesOnly.set(!showFavoritesOnly()); filterMaterials()">
          <span class="material-icons text-[14px] align-middle mr-1">{{ showFavoritesOnly() ? 'favorite' : 'favorite_border' }}</span>
          Favoritos
        </button>
      </div>

      <!-- Stats -->
      <div class="flex items-center gap-4 text-xs text-slate-500">
        <span>{{ filteredMaterials().length }} materiais encontrados</span>
        <span>·</span>
        <span>{{ favoritesCount() }} favoritos</span>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (m of filteredMaterials(); track m.id) {
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden hover:ring-primary/50 hover:-translate-y-1 transition-all">
            <div class="h-24 flex items-center justify-center" [class]="getSubcategoryBg(m.subcategory)">
              <span class="material-icons text-3xl opacity-50">{{ getSubcategoryIcon(m.subcategory) }}</span>
            </div>
            <div class="p-4">
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-bold text-slate-900 dark:text-white text-sm leading-tight line-clamp-2">{{ m.name }}</h3>
                <button class="shrink-0 p-1 rounded-lg transition-all"
                  [class]="m.favorite ? 'text-red-500' : 'text-slate-400 hover:text-red-400'"
                  (click)="toggleFavorite(m)">
                  <span class="material-icons text-[18px]">{{ m.favorite ? 'favorite' : 'favorite_border' }}</span>
                </button>
              </div>
              <p class="text-[10px] text-slate-500 mb-1 truncate">{{ m.subcategory }}</p>
              <div class="flex items-center gap-2 mb-3">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {{ m.ageRange }} anos
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  [class]="m.format === 'PDF' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'">
                  {{ m.format }}
                </span>
              </div>
              <button class="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-on-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                (click)="downloadMaterial(m)">
                <span class="material-icons text-[14px]">download</span> Baixar
              </button>
            </div>
          </div>
        }
      </div>

      @if (filteredMaterials().length === 0) {
        <div class="text-center py-12">
          <span class="material-icons text-6xl text-slate-300">folder_off</span>
          <p class="text-slate-500 mt-3">Nenhum material encontrado</p>
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
export class MateriaisExpandidosComponent implements OnInit {
  searchTerm = '';
  filterSubcategory = '';
  filterAge = '';
  subcategories = SUBCATEGORIES;
  ageRanges = ['3-6', '4-8', '5-10', '6-12', '7-12'];
  allMaterials = ALL_MATERIALS;
  filteredMaterials = signal<Material[]>(ALL_MATERIALS);
  showFavoritesOnly = signal(false);
  favoritesCount = signal(0);
  showToast = signal(false);
  toastMessage = signal('');

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    const favIds = JSON.parse(localStorage.getItem('materiais_favorites') || '[]');
    this.allMaterials.forEach(m => m.favorite = favIds.includes(m.id));
    this.favoritesCount.set(this.allMaterials.filter(m => m.favorite).length);
  }

  filterMaterials() {
    const term = this.searchTerm.toLowerCase();
    const sub = this.filterSubcategory;
    const age = this.filterAge;
    const favOnly = this.showFavoritesOnly();
    this.filteredMaterials.set(
      this.allMaterials.filter(m => {
        const matchSearch = !term || m.name.toLowerCase().includes(term) || m.subcategory.toLowerCase().includes(term);
        const matchSub = !sub || m.subcategory === sub;
        const matchAge = !age || m.ageRange === age;
        const matchFav = !favOnly || m.favorite;
        return matchSearch && matchSub && matchAge && matchFav;
      })
    );
  }

  toggleFavorite(m: Material) {
    m.favorite = !m.favorite;
    const favIds = this.allMaterials.filter(m => m.favorite).map(m => m.id);
    localStorage.setItem('materiais_favorites', JSON.stringify(favIds));
    this.favoritesCount.set(favIds.length);
    this.filterMaterials();
  }

  downloadMaterial(m: Material) {
    this.toastMessage.set(`Download de "${m.name}" iniciado!`);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }

  getSubcategoryIcon(sub: string): string {
    const icons: Record<string, string> = {
      'Atividades de Linguagem': 'record_voice_over', 'Atividades de Leitura e Escrita': 'menu_book',
      'Atividades de Matemática': 'calculate', 'Atividades de Funções Executivas': 'psychology',
      'Atividades Socioemocionais': 'favorite', 'Atividades de Atenção': 'visibility',
      'Protocolos por Diagnóstico': 'biotech', 'Anamneses Prontas': 'description',
      'Guias para Família': 'family_restroom', 'Guias para Professor': 'school',
      'Materiais ABA': 'science', 'Pacotes de Sessão': 'inventory',
    };
    return icons[sub] || 'folder';
  }

  getSubcategoryBg(sub: string): string {
    const bgs: Record<string, string> = {
      'Atividades de Linguagem': 'bg-blue-100 dark:bg-blue-900/30',
      'Atividades de Leitura e Escrita': 'bg-purple-100 dark:bg-purple-900/30',
      'Atividades de Matemática': 'bg-emerald-100 dark:bg-emerald-900/30',
      'Atividades de Funções Executivas': 'bg-amber-100 dark:bg-amber-900/30',
      'Atividades Socioemocionais': 'bg-pink-100 dark:bg-pink-900/30',
      'Atividades de Atenção': 'bg-red-100 dark:bg-red-900/30',
      'Protocolos por Diagnóstico': 'bg-indigo-100 dark:bg-indigo-900/30',
      'Anamneses Prontas': 'bg-cyan-100 dark:bg-cyan-900/30',
      'Guias para Família': 'bg-teal-100 dark:bg-teal-900/30',
      'Guias para Professor': 'bg-orange-100 dark:bg-orange-900/30',
      'Materiais ABA': 'bg-violet-100 dark:bg-violet-900/30',
      'Pacotes de Sessão': 'bg-rose-100 dark:bg-rose-900/30',
    };
    return bgs[sub] || 'bg-slate-100 dark:bg-slate-800';
  }
}
