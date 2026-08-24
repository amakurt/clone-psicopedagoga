import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SessaoService } from '../services/sessao.service';
import { MateriaisService } from '../../biblioteca/services/materiais.service';
import { MaterialTerapeutico } from '@core/data/materiais-reais.data';

@Component({
  selector: 'app-sessao-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page max-w-4xl mx-auto space-y-6 animate-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              [class]="getStatusBadgeClass(item()?.status)">
              {{ item()?.status || 'AGENDADA' }}
            </span>
            <span class="text-xs text-slate-400">ID: {{ id }}</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {{ item()?.paciente?.name || 'Sessão Clínica' }}
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ item()?.date | date:'dd/MM/yyyy HH:mm' }} · Duração: {{ item()?.duration ? item()?.duration + ' min' : '50 min' }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <a routerLink="/app/sessoes" class="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl transition-all">
            <span class="material-icons text-xl">arrow_back</span>
          </a>
          <a [routerLink]="['/app/sessoes', id, 'editar']" class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all flex items-center gap-2">
            <span class="material-icons text-lg">edit</span>
            Editar
          </a>
        </div>
      </div>

      @if (item()) {
        <!-- Content Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- General Info Card -->
          <div class="md:col-span-2 space-y-6">
            
            <!-- Dados Clínicos -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6 space-y-4">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span class="material-icons text-primary text-base">event_note</span>
                Informações do Atendimento
              </h3>
              
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <p class="text-[10px] font-bold text-slate-400 uppercase">Tipo</p>
                  <p class="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{{ item()?.tipo || 'Sessão' }}</p>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <p class="text-[10px] font-bold text-slate-400 uppercase">Valor</p>
                  <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{{ item()?.valor | currency:'BRL' }}</p>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <p class="text-[10px] font-bold text-slate-400 uppercase">Profissional</p>
                  <p class="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{{ item()?.psicopedagogo?.name || 'Terapeuta' }}</p>
                </div>
              </div>

              @if (item()?.objective) {
                <div class="p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20">
                  <p class="text-xs font-bold text-primary uppercase tracking-wider mb-1">🎯 Objetivo Principal</p>
                  <p class="text-sm text-slate-800 dark:text-slate-200">{{ item()?.objective }}</p>
                </div>
              }

              @if (item()?.observacoes) {
                <div>
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Observações</p>
                  <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{{ item()?.observacoes }}</p>
                </div>
              }
            </div>

            <!-- Materiais Terapêuticos Utilizados -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6 space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="material-icons text-primary text-base">folder_special</span>
                  Materiais Terapêuticos Vinculados ({{ materialsList().length }})
                </h3>
                <a routerLink="/app/materiais" class="text-xs text-primary font-bold hover:underline">
                  Explorar Catálogo
                </a>
              </div>

              @if (materialsList().length === 0) {
                <div class="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-xs">
                  <span class="material-icons text-3xl opacity-50 mb-1">menu_book</span>
                  <p>Nenhum material terapêutico foi vinculado a esta sessão.</p>
                </div>
              } @else {
                <div class="space-y-3">
                  @for (mat of materialsList(); track mat.id) {
                    <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div class="min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {{ mat.subcategory }}
                          </span>
                          <span class="text-[10px] text-slate-400">{{ mat.ageRange }} anos</span>
                        </div>
                        <h4 class="font-bold text-sm text-slate-900 dark:text-white mt-1">{{ mat.name }}</h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{{ mat.description }}</p>
                      </div>
                      <div class="flex items-center gap-2 shrink-0">
                        <button (click)="openMaterialGuide(mat)"
                          class="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1">
                          <span class="material-icons text-[14px]">visibility</span> Guia
                        </button>
                        <button (click)="downloadMaterialPdf(mat)"
                          class="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1">
                          <span class="material-icons text-[14px]">download</span> PDF
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

          </div>

          <!-- Side Actions / Patient Profile -->
          <div class="space-y-6">
            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6 space-y-4">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Ações Rápidas</h3>
              <div class="space-y-2">
                <a [routerLink]="['/app/documentos-clinicos/diario']" [queryParams]="{ pacienteId: item()?.pacienteId, date: item()?.date?.slice(0, 10) }"
                  class="w-full p-3 bg-slate-50 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all flex items-center gap-2">
                  <span class="material-icons text-base">edit_note</span>
                  Registrar no Diário de Sessão
                </a>
                <a routerLink="/app/session-planner"
                  class="w-full p-3 bg-slate-50 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all flex items-center gap-2">
                  <span class="material-icons text-base">timer</span>
                  Abrir no Planner com Cronômetro
                </a>
                <a [routerLink]="['/app/evolucoes/nova']" [queryParams]="{ pacienteId: item()?.pacienteId }"
                  class="w-full p-3 bg-slate-50 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all flex items-center gap-2">
                  <span class="material-icons text-base">show_chart</span>
                  Criar Evolução Clínica
                </a>
              </div>
            </div>
          </div>

        </div>
      }

      <!-- Material Detail Modal -->
      @if (viewingMaterial()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {{ viewingMaterial()!.subcategory }}
                </span>
                <h3 class="text-lg font-black text-slate-900 dark:text-white mt-1">{{ viewingMaterial()!.name }}</h3>
              </div>
              <button (click)="viewingMaterial.set(null)" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl">
                <span class="material-icons">close</span>
              </button>
            </div>
            
            <div class="p-6 flex-1 overflow-y-auto space-y-4 text-sm">
              <div>
                <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Descrição Clínica</h4>
                <p class="text-slate-700 dark:text-slate-300">{{ viewingMaterial()!.description }}</p>
              </div>

              <div>
                <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">🎯 Habilidades-Alvo</h4>
                <div class="flex flex-wrap gap-1.5">
                  @for (skill of viewingMaterial()!.targetSkills; track skill) {
                    <span class="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold">
                      ✓ {{ skill }}
                    </span>
                  }
                </div>
              </div>

              <div>
                <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">📋 Guia de Aplicação Passo a Passo</h4>
                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                  {{ viewingMaterial()!.applicationGuide }}
                </div>
              </div>

              <div class="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                <strong>Fonte / Referência:</strong> {{ viewingMaterial()!.source }}
              </div>
            </div>

            <div class="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <button (click)="downloadMaterialPdf(viewingMaterial()!)" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
                <span class="material-icons text-[16px]">download</span> Baixar PDF
              </button>
              <button (click)="viewingMaterial.set(null)" class="px-5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold">
                Fechar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `:host { display: block; }
     .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }`
  ]
})
export class SessaoDetailComponent implements OnInit {
  private service = inject(SessaoService);
  private route = inject(ActivatedRoute);
  private materiaisService = inject(MateriaisService);

  id = '';
  item = signal<any>(null);
  materialsList = signal<MaterialTerapeutico[]>([]);
  viewingMaterial = signal<MaterialTerapeutico | null>(null);

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.service.get(this.id).subscribe((res: any) => {
      this.item.set(res);
      if (res?.materials) {
        try {
          const parsed = JSON.parse(res.materials);
          if (Array.isArray(parsed)) {
            const full = parsed.map(p => this.materiaisService.getById(p.id) || p);
            this.materialsList.set(full);
          }
        } catch {
          this.materialsList.set([]);
        }
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      'AGENDADA': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'EM_ANDAMENTO': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'CONCLUIDA': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'CANCELADA': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
    };
    return classes[status] || 'bg-slate-100 text-slate-800';
  }

  openMaterialGuide(m: MaterialTerapeutico) {
    this.viewingMaterial.set(m);
  }

  downloadMaterialPdf(m: MaterialTerapeutico) {
    const pName = this.item()?.paciente?.name;
    this.materiaisService.generateMaterialPdf(m, pName);
  }
}
