import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MateriaisService } from '../../modules/biblioteca/services/materiais.service';
import { MaterialTerapeutico } from '../../core/data/materiais-reais.data';

@Component({
  selector: 'app-material-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in">
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <!-- Header -->
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-icons">folder_special</span>
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-900 dark:text-white">Selecionar Materiais Terapêuticos</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Vincule recursos clínicos baseados em evidências à sessão</p>
            </div>
          </div>
          <button (click)="close()" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Search & Filters -->
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input type="text" [(ngModel)]="searchTerm" (input)="applyFilters()"
                placeholder="Buscar por habilidade, tema (ex: rimas, TDAH, fônico, discalculia)..."
                class="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white">
            </div>
            <div class="flex gap-2">
              <select [(ngModel)]="selectedSubcategory" (change)="applyFilters()"
                class="px-3 py-2 bg-white dark:bg-slate-800 rounded-2xl text-xs font-bold ring-1 ring-slate-200 dark:ring-slate-700 text-slate-700 dark:text-slate-300 outline-none">
                <option value="">Todas as categorias</option>
                @for (sub of service.subcategories; track sub) {
                  <option [value]="sub">{{ sub }}</option>
                }
              </select>
              <select [(ngModel)]="selectedAge" (change)="applyFilters()"
                class="px-3 py-2 bg-white dark:bg-slate-800 rounded-2xl text-xs font-bold ring-1 ring-slate-200 dark:ring-slate-700 text-slate-700 dark:text-slate-300 outline-none">
                <option value="">Todas as idades</option>
                <option value="1-4">1-4 anos</option>
                <option value="4-8">4-8 anos</option>
                <option value="5-10">5-10 anos</option>
                <option value="6-12">6-12 anos</option>
                <option value="7-12">7-12 anos</option>
                <option value="8-16">8-16 anos</option>
              </select>
            </div>
          </div>

          <!-- Selection Count and Quick Badges -->
          <div class="flex items-center justify-between text-xs text-slate-500">
            <div class="flex items-center gap-2">
              <span>{{ filteredMaterials().length }} materiais encontrados</span>
              @if (selectedIds().length > 0) {
                <span class="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  {{ selectedIds().length }} selecionado(s)
                </span>
              }
            </div>
            @if (selectedIds().length > 0) {
              <button (click)="clearSelection()" class="text-red-500 hover:underline font-semibold">
                Limpar seleção
              </button>
            }
          </div>
        </div>

        <!-- Materials Grid -->
        <div class="p-6 flex-1 overflow-y-auto max-h-[50vh]">
          @if (filteredMaterials().length === 0) {
            <div class="text-center py-12 text-slate-400">
              <span class="material-icons text-5xl mb-2">find_in_page</span>
              <p class="font-medium">Nenhum material encontrado com os filtros atuais.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (m of filteredMaterials(); track m.id) {
                <div class="relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between"
                  [class]="isSelected(m.id) 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/30 dark:bg-primary/10' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-primary/50'"
                  (click)="toggleSelect(m)">
                  
                  <div>
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <div class="flex items-center gap-2">
                        <div class="size-5 rounded-lg border flex items-center justify-center transition-all"
                          [class]="isSelected(m.id) ? 'bg-primary border-primary text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'">
                          @if (isSelected(m.id)) {
                            <span class="material-icons text-[14px]">check</span>
                          }
                        </div>
                        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          [class]="getSubcategoryBadgeClass(m.subcategory)">
                          {{ m.subcategory }}
                        </span>
                      </div>
                      <span class="text-[10px] font-bold text-slate-400">
                        {{ m.ageRange }} anos
                      </span>
                    </div>

                    <h4 class="font-bold text-sm text-slate-900 dark:text-white leading-tight mb-1">
                      {{ m.name }}
                    </h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {{ m.description }}
                    </p>

                    <!-- Target Skills -->
                    <div class="flex flex-wrap gap-1 mb-3">
                      @for (skill of m.targetSkills.slice(0, 3); track skill) {
                        <span class="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-medium">
                          {{ skill }}
                        </span>
                      }
                      @if (m.targetSkills.length > 3) {
                        <span class="text-[9px] px-1 text-slate-400">+{{ m.targetSkills.length - 3 }}</span>
                      }
                    </div>
                  </div>

                  <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50 text-[11px]">
                    <span class="text-slate-400 flex items-center gap-1">
                      <span class="material-icons text-[14px]">timer</span> {{ m.durationMinutes || 20 }} min
                    </span>
                    <button type="button" class="text-primary hover:underline font-bold flex items-center gap-0.5"
                      (click)="viewDetails(m, $event)">
                      <span class="material-icons text-[14px]">visibility</span> Detalhes
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div class="text-xs text-slate-500">
            <strong>{{ selectedIds().length }}</strong> material(is) selecionado(s)
          </div>
          <div class="flex gap-3">
            <button (click)="close()" class="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-sm font-bold transition-all">
              Cancelar
            </button>
            <button (click)="confirm()" class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl text-sm font-bold shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-2">
              <span class="material-icons text-[18px]">check</span>
              Confirmar e Anexar
            </button>
          </div>
        </div>
      </div>

      <!-- Detail Modal -->
      @if (previewMaterial()) {
        <div class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  [class]="getSubcategoryBadgeClass(previewMaterial()!.subcategory)">
                  {{ previewMaterial()!.subcategory }}
                </span>
                <h3 class="text-lg font-black text-slate-900 dark:text-white mt-1">{{ previewMaterial()!.name }}</h3>
              </div>
              <button (click)="previewMaterial.set(null)" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl">
                <span class="material-icons">close</span>
              </button>
            </div>
            
            <div class="p-6 flex-1 overflow-y-auto space-y-4 text-sm">
              <div>
                <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Descrição Clínica</h4>
                <p class="text-slate-700 dark:text-slate-300">{{ previewMaterial()!.description }}</p>
              </div>

              <div>
                <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">🎯 Habilidades-Alvo</h4>
                <div class="flex flex-wrap gap-1.5">
                  @for (skill of previewMaterial()!.targetSkills; track skill) {
                    <span class="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold">
                      ✓ {{ skill }}
                    </span>
                  }
                </div>
              </div>

              <div>
                <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">📋 Guia de Aplicação</h4>
                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                  {{ previewMaterial()!.applicationGuide }}
                </div>
              </div>

              <div>
                <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">📦 Conteúdo / Folhas</h4>
                <ul class="list-disc pl-5 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  @for (item of previewMaterial()!.contentOutline; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>

              <div class="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                <strong>Referência:</strong> {{ previewMaterial()!.source }}
              </div>
            </div>

            <div class="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <button (click)="service.generateMaterialPdf(previewMaterial()!)" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
                <span class="material-icons text-[16px]">download</span> Baixar PDF de Exemplo
              </button>
              <button (click)="previewMaterial.set(null)" class="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold">
                Fechar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class MaterialPickerModalComponent implements OnInit {
  service = inject(MateriaisService);

  @Input() initialSelectedIds: number[] = [];
  @Output() confirmed = new EventEmitter<MaterialTerapeutico[]>();
  @Output() closed = new EventEmitter<void>();

  searchTerm = '';
  selectedSubcategory = '';
  selectedAge = '';
  selectedIds = signal<number[]>([]);
  filteredMaterials = signal<MaterialTerapeutico[]>([]);
  previewMaterial = signal<MaterialTerapeutico | null>(null);

  ngOnInit() {
    this.selectedIds.set([...(this.initialSelectedIds || [])]);
    this.applyFilters();
  }

  applyFilters() {
    const list = this.service.filter(this.searchTerm, this.selectedSubcategory, this.selectedAge);
    this.filteredMaterials.set(list);
  }

  isSelected(id: number): boolean {
    return this.selectedIds().includes(id);
  }

  toggleSelect(material: MaterialTerapeutico) {
    const current = this.selectedIds();
    if (current.includes(material.id)) {
      this.selectedIds.set(current.filter(id => id !== material.id));
    } else {
      this.selectedIds.set([...current, material.id]);
    }
  }

  clearSelection() {
    this.selectedIds.set([]);
  }

  viewDetails(material: MaterialTerapeutico, event: MouseEvent) {
    event.stopPropagation();
    this.previewMaterial.set(material);
  }

  confirm() {
    const all = this.service.getAll();
    const selected = all.filter(m => this.selectedIds().includes(m.id));
    this.confirmed.emit(selected);
  }

  close() {
    this.closed.emit();
  }

  getSubcategoryBadgeClass(sub: string): string {
    const classes: Record<string, string> = {
      'Atividades de Linguagem': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'Atividades de Leitura e Escrita': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'Atividades de Matemática': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Atividades de Funções Executivas': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      'Atividades Socioemocionais': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      'Atividades de Atenção': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'Protocolos por Diagnóstico': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      'Anamneses Prontas': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
      'Guias para Família': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
      'Guias para Professor': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      'Materiais ABA': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
      'Pacotes de Sessão': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    };
    return classes[sub] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
}
