import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MateriaisService } from '../services/materiais.service';
import { MaterialTerapeutico } from '@core/data/materiais-reais.data';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-materiais-expandidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-icons">folder_special</span>
            </div>
            <div>
              <h1 class="text-2xl font-black text-slate-900 dark:text-white">Materiais Terapêuticos</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400">Recursos clínicos baseados em evidências (ABPp, Neuropsicologia, ABA e BNCC)</p>
            </div>
          </div>
        </div>
        <div class="relative flex-1 max-w-md w-full">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white shadow-sm"
            placeholder="Buscar por habilidade, tema (ex: rimas, TDAH, fônico, discalculia)..."
            [(ngModel)]="searchTerm" (input)="filterMaterials()">
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <select class="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none shadow-sm"
          [(ngModel)]="filterSubcategory" (change)="filterMaterials()">
          <option value="">Todas as subcategorias</option>
          @for (sub of service.subcategories; track sub) {
            <option [value]="sub">{{ sub }}</option>
          }
        </select>

        <select class="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none shadow-sm"
          [(ngModel)]="filterAge" (change)="filterMaterials()">
          <option value="">Todas as idades</option>
          @for (age of ageRanges; track age) {
            <option [value]="age">{{ age }} anos</option>
          }
        </select>

        <button class="px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
          [class]="showFavoritesOnly() 
            ? 'bg-red-500 text-white shadow-red-500/20' 
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-red-500/50'"
          (click)="showFavoritesOnly.set(!showFavoritesOnly()); filterMaterials()">
          <span class="material-icons text-[16px]">{{ showFavoritesOnly() ? 'favorite' : 'favorite_border' }}</span>
          Favoritos ({{ service.favorites().length }})
        </button>

        <div class="ml-auto text-xs text-slate-500 font-medium">
          Exibindo <strong>{{ filteredMaterials().length }}</strong> recursos
        </div>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        @for (m of filteredMaterials(); track m.id) {
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden hover:ring-primary/50 hover:shadow-lg transition-all flex flex-col justify-between group">
            
            <!-- Card Top Banner -->
            <div>
              <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2"
                [class]="getSubcategoryBg(m.subcategory)">
                <div class="flex items-center gap-2">
                  <span class="material-icons text-xl opacity-70">{{ getSubcategoryIcon(m.subcategory) }}</span>
                  <span class="text-[10px] font-bold uppercase tracking-wider line-clamp-1">
                    {{ m.subcategory }}
                  </span>
                </div>
                <button class="shrink-0 p-1.5 rounded-xl transition-all bg-white/80 dark:bg-slate-800/80 shadow-sm"
                  [class]="m.favorite ? 'text-red-500' : 'text-slate-400 hover:text-red-400'"
                  (click)="toggleFavorite(m)" title="Favoritar">
                  <span class="material-icons text-[16px]">{{ m.favorite ? 'favorite' : 'favorite_border' }}</span>
                </button>
              </div>

              <!-- Card Body -->
              <div class="p-5">
                <div class="flex items-center justify-between gap-2 mb-2">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {{ m.ageRange }} anos
                  </span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {{ m.format }}
                  </span>
                </div>

                <h3 class="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {{ m.name }}
                </h3>

                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                  {{ m.description }}
                </p>

                <!-- Skills Tag List -->
                <div class="flex flex-wrap gap-1 mb-4">
                  @for (skill of m.targetSkills.slice(0, 2); track skill) {
                    <span class="text-[9px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium">
                      {{ skill }}
                    </span>
                  }
                  @if (m.targetSkills.length > 2) {
                    <span class="text-[9px] px-1 text-slate-400 self-center">+{{ m.targetSkills.length - 2 }}</span>
                  }
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="p-4 pt-0 space-y-2 border-t border-slate-50 dark:border-slate-800/50">
              <div class="grid grid-cols-2 gap-2">
                <button (click)="openDetail(m)"
                  class="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1">
                  <span class="material-icons text-[14px]">visibility</span> Ver Guia
                </button>
                <button (click)="downloadMaterial(m)"
                  class="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1">
                  <span class="material-icons text-[14px]">download</span> Baixar PDF
                </button>
              </div>
              <button (click)="openLinkModal(m)"
                class="w-full py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1">
                <span class="material-icons text-[14px]">link</span> Vincular à Sessão
              </button>
            </div>

          </div>
        }
      </div>

      @if (filteredMaterials().length === 0) {
        <div class="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <span class="material-icons text-6xl text-slate-300 dark:text-slate-600 mb-2">folder_off</span>
          <h3 class="font-bold text-slate-700 dark:text-slate-300">Nenhum material encontrado</h3>
          <p class="text-sm text-slate-500 mt-1">Tente ajustar os filtros ou buscar por outros termos.</p>
        </div>
      }

      <!-- Detail Preview Modal -->
      @if (selectedMaterial()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  [class]="getSubcategoryBg(selectedMaterial()!.subcategory)">
                  {{ selectedMaterial()!.subcategory }}
                </span>
                <h2 class="text-lg font-black text-slate-900 dark:text-white mt-2">{{ selectedMaterial()!.name }}</h2>
                <p class="text-xs text-slate-500 mt-0.5">Faixa Etária: {{ selectedMaterial()!.ageRange }} anos | Formato: {{ selectedMaterial()!.format }}</p>
              </div>
              <button (click)="selectedMaterial.set(null)" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl">
                <span class="material-icons">close</span>
              </button>
            </div>

            <div class="p-6 flex-1 overflow-y-auto space-y-5 text-sm">
              <div>
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Descrição Clínica</h4>
                <p class="text-slate-700 dark:text-slate-300 leading-relaxed">{{ selectedMaterial()!.description }}</p>
              </div>

              <div>
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">🎯 Habilidades-Alvo Trabalhadas</h4>
                <div class="flex flex-wrap gap-2">
                  @for (skill of selectedMaterial()!.targetSkills; track skill) {
                    <span class="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold">
                      ✓ {{ skill }}
                    </span>
                  }
                </div>
              </div>

              <div>
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">📋 Guia de Aplicação Passo a Passo</h4>
                <div class="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-slate-700 dark:text-slate-300 text-xs leading-relaxed border border-slate-100 dark:border-slate-700/50">
                  {{ selectedMaterial()!.applicationGuide }}
                </div>
              </div>

              <div>
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">📦 Estrutura do Material</h4>
                <ul class="list-disc pl-5 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  @for (item of selectedMaterial()!.contentOutline; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>

              <div class="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                <strong>Referência e Fundamentação:</strong> {{ selectedMaterial()!.source }}
              </div>
            </div>

            <div class="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <button (click)="openLinkModal(selectedMaterial()!)"
                class="px-5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5">
                <span class="material-icons text-[16px]">link</span> Vincular à Sessão
              </button>
              <div class="flex gap-2">
                <button (click)="selectedMaterial.set(null)"
                  class="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold">
                  Fechar
                </button>
                <button (click)="downloadMaterial(selectedMaterial()!)"
                  class="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
                  <span class="material-icons text-[16px]">download</span> Baixar PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- Link to Session Modal -->
      @if (linkingMaterial()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 w-full max-w-lg overflow-hidden">
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-900 dark:text-white">Vincular à Sessão</h3>
                <p class="text-xs text-slate-500">Selecione o paciente para associar este material</p>
              </div>
              <button (click)="linkingMaterial.set(null)" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl">
                <span class="material-icons">close</span>
              </button>
            </div>

            <div class="p-6 space-y-4">
              <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center gap-3">
                <div class="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span class="material-icons text-base">description</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ linkingMaterial()!.name }}</p>
                  <p class="text-[10px] text-slate-500">{{ linkingMaterial()!.subcategory }}</p>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paciente *</label>
                <select [(ngModel)]="selectedPatientId" (change)="loadPatientSessions()"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 outline-none text-slate-900 dark:text-white">
                  <option value="">Selecione um paciente...</option>
                  @for (p of patients(); track p.id) {
                    <option [value]="p.id">{{ p.name }}</option>
                  }
                </select>
              </div>

              @if (selectedPatientId) {
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sessão Agendada</label>
                  @if (patientSessions().length === 0) {
                    <div class="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-2xl text-xs flex items-center justify-between">
                      <span>Nenhuma sessão futura encontrada.</span>
                      <button (click)="createNewSessionWithMaterial()" class="font-bold underline">Criar Nova Sessão</button>
                    </div>
                  } @else {
                    <select [(ngModel)]="selectedSessionId"
                      class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 outline-none text-slate-900 dark:text-white">
                      <option value="">Selecione a sessão...</option>
                      @for (s of patientSessions(); track s.id) {
                        <option [value]="s.id">{{ s.date | date:'dd/MM/yyyy HH:mm' }} — {{ s.status }}</option>
                      }
                    </select>
                  }
                </div>
              }
            </div>

            <div class="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button (click)="linkingMaterial.set(null)"
                class="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold">
                Cancelar
              </button>
              <button (click)="confirmLink()" [disabled]="!selectedPatientId || savingLink()"
                class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl text-xs font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-1.5">
                <span class="material-icons text-[16px]">check</span>
                {{ savingLink() ? 'Salvando...' : 'Confirmar Vínculo' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  `]
})
export class MateriaisExpandidosComponent implements OnInit {
  service = inject(MateriaisService);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  searchTerm = '';
  filterSubcategory = '';
  filterAge = '';
  ageRanges = ['1-4', '4-8', '5-10', '6-12', '7-12', '8-16', '3-16'];

  filteredMaterials = signal<MaterialTerapeutico[]>([]);
  showFavoritesOnly = signal(false);
  selectedMaterial = signal<MaterialTerapeutico | null>(null);

  // Link to session state
  linkingMaterial = signal<MaterialTerapeutico | null>(null);
  patients = signal<any[]>([]);
  selectedPatientId = '';
  patientSessions = signal<any[]>([]);
  selectedSessionId = '';
  savingLink = signal(false);

  ngOnInit() {
    this.filterMaterials();
    this.api.get('/pacientes').subscribe({
      next: (res: any) => this.patients.set(res.data || res || []),
      error: () => {}
    });
  }

  filterMaterials() {
    const list = this.service.filter(
      this.searchTerm,
      this.filterSubcategory,
      this.filterAge,
      this.showFavoritesOnly()
    );
    this.filteredMaterials.set(list);
  }

  toggleFavorite(m: MaterialTerapeutico) {
    this.service.toggleFavorite(m.id);
    this.filterMaterials();
  }

  downloadMaterial(m: MaterialTerapeutico) {
    this.service.generateMaterialPdf(m);
    this.toast.success(`Download de "${m.name}" gerado com sucesso!`);
  }

  openDetail(m: MaterialTerapeutico) {
    this.selectedMaterial.set(m);
  }

  openLinkModal(m: MaterialTerapeutico) {
    this.linkingMaterial.set(m);
    this.selectedPatientId = '';
    this.selectedSessionId = '';
    this.patientSessions.set([]);
  }

  loadPatientSessions() {
    if (!this.selectedPatientId) {
      this.patientSessions.set([]);
      return;
    }
    this.api.get('/sessoes', { pacienteId: this.selectedPatientId }).subscribe({
      next: (res: any) => {
        const list = res.data || res || [];
        this.patientSessions.set(list);
        if (list.length > 0) this.selectedSessionId = list[0].id;
      },
      error: () => this.patientSessions.set([])
    });
  }

  confirmLink() {
    const mat = this.linkingMaterial();
    if (!mat || !this.selectedPatientId) return;

    this.savingLink.set(true);

    if (this.selectedSessionId) {
      // Fetch session, append material, update
      this.api.get(`/sessoes/${this.selectedSessionId}`).subscribe({
        next: (session: any) => {
          let existingMats: any[] = [];
          try {
            existingMats = session.materials ? JSON.parse(session.materials) : [];
          } catch {
            existingMats = [];
          }
          if (!existingMats.some(m => m.id === mat.id)) {
            existingMats.push({ id: mat.id, name: mat.name, subcategory: mat.subcategory });
          }
          this.api.put(`/sessoes/${this.selectedSessionId}`, { materials: JSON.stringify(existingMats) }).subscribe({
            next: () => {
              this.savingLink.set(false);
              this.linkingMaterial.set(null);
              this.toast.success(`Material "${mat.name}" vinculado à sessão com sucesso!`);
            },
            error: () => {
              this.savingLink.set(false);
              this.toast.error('Erro ao vincular material à sessão');
            }
          });
        },
        error: () => {
          this.savingLink.set(false);
          this.toast.error('Erro ao buscar sessão');
        }
      });
    } else {
      // Create a new session with this material
      const newSession = {
        pacienteId: this.selectedPatientId,
        date: new Date().toISOString(),
        tipo: 'SESSAO',
        status: 'AGENDADA',
        duration: 50,
        psicopedagogoId: 'system',
        materials: JSON.stringify([{ id: mat.id, name: mat.name, subcategory: mat.subcategory }])
      };
      this.api.post('/sessoes', newSession).subscribe({
        next: () => {
          this.savingLink.set(false);
          this.linkingMaterial.set(null);
          this.toast.success(`Nova sessão criada e vinculada a "${mat.name}"!`);
        },
        error: () => {
          this.savingLink.set(false);
          this.toast.error('Erro ao criar sessão');
        }
      });
    }
  }

  createNewSessionWithMaterial() {
    const mat = this.linkingMaterial();
    if (!mat || !this.selectedPatientId) return;
    this.router.navigate(['/app/sessoes/nova'], {
      queryParams: {
        pacienteId: this.selectedPatientId,
        materialId: mat.id
      }
    });
  }

  getSubcategoryIcon(sub: string): string {
    const icons: Record<string, string> = {
      'Atividades de Linguagem': 'record_voice_over',
      'Atividades de Leitura e Escrita': 'menu_book',
      'Atividades de Matemática': 'calculate',
      'Atividades de Funções Executivas': 'psychology',
      'Atividades Socioemocionais': 'favorite',
      'Atividades de Atenção': 'visibility',
      'Protocolos por Diagnóstico': 'biotech',
      'Anamneses Prontas': 'description',
      'Guias para Família': 'family_restroom',
      'Guias para Professor': 'school',
      'Materiais ABA': 'science',
      'Pacotes de Sessão': 'inventory',
    };
    return icons[sub] || 'folder';
  }

  getSubcategoryBg(sub: string): string {
    const bgs: Record<string, string> = {
      'Atividades de Linguagem': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'Atividades de Leitura e Escrita': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'Atividades de Matemática': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Atividades de Funções Executivas': 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      'Atividades Socioemocionais': 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      'Atividades de Atenção': 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'Protocolos por Diagnóstico': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      'Anamneses Prontas': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
      'Guias para Família': 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
      'Guias para Professor': 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      'Materiais ABA': 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
      'Pacotes de Sessão': 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    };
    return bgs[sub] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
}
