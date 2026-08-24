import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { escapeHtml } from '@core/utils/escape';
import { ToastService } from '@shared/components/toast.component';
import { MateriaisService } from '../../biblioteca/services/materiais.service';
import { MaterialTerapeutico } from '@core/data/materiais-reais.data';

declare var html2pdf: any;

@Component({
  selector: 'app-plano-ai',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-2xl bg-gradient-to-tr from-primary to-primary-dark flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span class="material-icons text-xl">auto_awesome</span>
            </div>
            <div>
              <h1 class="text-2xl font-black text-slate-900 dark:text-white">Gerador de Planos com IA</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400">Elaboração de Planos de Intervenção e PEI baseados em evidências (ABA, TEA, BNCC e Neurociência)</p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-sm">
            <span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            IA Ativa
          </span>
          <a routerLink="/app/planos" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs transition-all flex items-center gap-1">
            <span class="material-icons text-[16px]">list</span> Ver Planos
          </a>
        </div>
      </div>

      <!-- Input Form Card -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="material-icons text-primary">person</span>
            Dados do Paciente & Diagnóstico
          </h2>
          <span class="text-xs text-slate-400">Preencha ou selecione um paciente para carregar dados automaticamente</span>
        </div>

        <!-- Paciente Selector -->
        <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700/50 flex flex-col sm:flex-row items-center gap-3">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
            <span class="material-icons text-primary text-lg">folder_shared</span>
            Carregar de Paciente Cadastrado:
          </div>
          <select [(ngModel)]="selectedPatientId" (change)="onPatientSelect()"
            class="flex-1 w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-none rounded-xl text-xs font-bold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white">
            <option value="">Selecione para preencher histórico e idade automaticamente...</option>
            @for (p of patients(); track p.id) {
              <option [value]="p.id">{{ p.name }} ({{ p.diagnosis || 'Sem diagnóstico' }})</option>
            }
          </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Nome do Paciente -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome do Paciente / Aluno *</label>
            <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
              [(ngModel)]="form.patientName" placeholder="Ex: Theo Mendes Rocha">
          </div>

          <!-- Diagnóstico -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Diagnóstico / Queixa *</label>
            <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
              [(ngModel)]="form.diagnosis">
              <option value="">Selecione...</option>
              <option value="TEA">TEA (Espectro Autista)</option>
              <option value="TEA Nível 1">TEA Nível 1 (Leve)</option>
              <option value="TEA Nível 2">TEA Nível 2 (Moderado)</option>
              <option value="TEA Nível 3">TEA Nível 3 (Grave)</option>
              <option value="TDAH">TDAH (Desatenção / Hiperatividade)</option>
              <option value="Dislexia">Dislexia do Desenvolvimento</option>
              <option value="Discalculia">Discalculia do Desenvolvimento</option>
              <option value="TOD">TOD (Transtorno Opositor Desafiador)</option>
              <option value="Atraso de Linguagem">Atraso Global / Linguagem</option>
              <option value="Dificuldade de Aprendizagem">Dificuldade de Aprendizagem Geral</option>
            </select>
          </div>

          <!-- Idade e Nível -->
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Idade *</label>
              <input class="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                type="number" min="1" max="18" [(ngModel)]="form.age" placeholder="7">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Suporte</label>
              <select class="w-full px-2 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                [(ngModel)]="form.level">
                <option value="1">Nível 1</option>
                <option value="2">Nível 2</option>
                <option value="3">Nível 3</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Objetivos / Queixas -->
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Objetivos Terapêuticos e Metas Principais * (separados por vírgula)
          </label>
          <textarea class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none resize-none text-slate-900 dark:text-white"
            rows="3" [(ngModel)]="form.goals"
            placeholder="Ex: Estimulação de rimas e consciência fonológica, Reduzir comportamentos de fuga, Aumentar tempo de foco para 20min, Memória de trabalho"></textarea>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button (click)="generatePEI()" [disabled]="loading() || !form.diagnosis || !form.age || !form.goals || !form.patientName"
            class="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50">
            @if (loading() && currentAction === 'PEI') {
              <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Gerando PEI...
            } @else {
              <span class="material-icons text-[18px]">school</span>
              Gerar PEI Estruturado
            }
          </button>

          <button (click)="generatePlan()" [disabled]="loading() || !form.diagnosis || !form.age || !form.goals"
            class="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50">
            @if (loading() && currentAction === 'PLAN') {
              <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Gerando Plano com IA...
            } @else {
              <span class="material-icons text-[18px]">auto_awesome</span>
              Gerar Plano de Intervenção
            }
          </button>
        </div>
      </div>

      <!-- Generated Plano Geral de Intervenção -->
      @if (plan()) {
        <div class="space-y-6 animate-in">
          
          <!-- Plano Header Card -->
          <div class="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl space-y-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                  Plano Clínico Gerado por IA
                </span>
                <h2 class="text-2xl font-black mt-2">Plano de Intervenção — {{ form.patientName || 'Paciente' }}</h2>
                <p class="text-xs text-slate-400 mt-1">Diagnóstico: {{ plan()!.diagnosis }} · Idade: {{ plan()!.age }} anos · Suporte Nível {{ plan()!.level }}</p>
              </div>

              <div class="flex flex-wrap gap-2">
                <button (click)="saveToPatientRecord(plan())" [disabled]="savingPlan()"
                  class="px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 active:scale-95">
                  <span class="material-icons text-base">save</span>
                  {{ savingPlan() ? 'Salvando...' : 'Salvar no Prontuário' }}
                </button>
                <button (click)="exportPlanPdf()"
                  class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5">
                  <span class="material-icons text-base">picture_as_pdf</span>
                  Exportar PDF
                </button>
              </div>
            </div>

            <!-- Overview Metrics Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div class="bg-white/10 rounded-2xl p-4 text-center">
                <p class="text-xs text-slate-400">Duração Total</p>
                <p class="text-xl font-bold mt-1">{{ plan()!.overallPlan.totalEstimatedWeeks }} Semanas</p>
              </div>
              <div class="bg-white/10 rounded-2xl p-4 text-center">
                <p class="text-xs text-slate-400">Frequência</p>
                <p class="text-xl font-bold mt-1 text-emerald-400">{{ plan()!.overallPlan.sessionFrequency }}</p>
              </div>
              <div class="bg-white/10 rounded-2xl p-4 text-center">
                <p class="text-xs text-slate-400">Reavaliação</p>
                <p class="text-xl font-bold mt-1 text-amber-400">{{ plan()!.overallPlan.reassessmentPeriod }}</p>
              </div>
              <div class="bg-white/10 rounded-2xl p-4 text-center">
                <p class="text-xs text-slate-400">Metas SMART</p>
                <p class="text-xl font-bold mt-1 text-purple-400">{{ plan()!.suggestions.length }}</p>
              </div>
            </div>
          </div>

          <!-- Materiais Terapêuticos Sugeridos para o Plano -->
          @if (suggestedMaterials().length > 0) {
            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6 space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="material-icons text-primary">folder_special</span>
                  Recursos e Materiais Terapêuticos Recomendados para este Plano
                </h3>
                <a routerLink="/app/materiais" class="text-xs text-primary font-bold hover:underline">
                  Ver Catálogo Completo
                </a>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                @for (mat of suggestedMaterials(); track mat.id) {
                  <div class="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 flex flex-col justify-between gap-3">
                    <div>
                      <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {{ mat.subcategory }}
                      </span>
                      <h4 class="font-bold text-xs text-slate-900 dark:text-white mt-1.5">{{ mat.name }}</h4>
                      <p class="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{{ mat.description }}</p>
                    </div>
                    <div class="flex justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                      <button (click)="materiaisService.generateMaterialPdf(mat, form.patientName)"
                        class="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                        <span class="material-icons text-[14px]">download</span> Baixar PDF
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Suggestions by Area -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-icons text-primary">psychology</span>
              Estratégias de Intervenção por Meta
            </h3>

            @for (sug of plan()!.suggestions; track sug.goal) {
              <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6 space-y-4">
                <div class="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary">
                      {{ sug.category }}
                    </span>
                    <h4 class="font-bold text-base text-slate-900 dark:text-white mt-1">🎯 {{ sug.goal }}</h4>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (strat of sug.strategies; track strat.title) {
                    <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 space-y-3">
                      <div class="flex items-start justify-between gap-2">
                        <h5 class="font-bold text-sm text-slate-900 dark:text-white">{{ strat.title }}</h5>
                        <span class="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          [ngClass]="strat.difficulty === 'ALTA' ? 'bg-red-100 text-red-700' : strat.difficulty === 'MEDIA' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">
                          {{ strat.difficulty }}
                        </span>
                      </div>
                      <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{{ strat.description }}</p>

                      <!-- Steps -->
                      <div>
                        <p class="text-[10px] font-bold uppercase text-slate-400 mb-1">Passos de Aplicação:</p>
                        <ul class="list-decimal pl-4 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                          @for (step of strat.steps; track step) {
                            <li>{{ step }}</li>
                          }
                        </ul>
                      </div>

                      <div class="text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
                        <span><strong>Evidência:</strong> {{ strat.evidence }}</span>
                        <span>{{ strat.estimatedSessions || 12 }} sessões</span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Recommendations -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6 space-y-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-icons text-amber-500">lightbulb</span>
              Diretrizes Gerais e Orientações à Equipe
            </h3>
            <ul class="list-disc pl-5 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
              @for (rec of plan()!.generalRecommendations; track rec) {
                <li>{{ rec }}</li>
              }
            </ul>
          </div>

        </div>
      }

      <!-- Generated PEI -->
      @if (pei()) {
        <div class="space-y-6 animate-in">
          
          <div class="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-8 text-white shadow-2xl space-y-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PEI — Plano Educacional Individualizado
                </span>
                <h2 class="text-2xl font-black mt-2">{{ pei()!.pei.title }}</h2>
                <p class="text-xs text-slate-400 mt-1">{{ pei()!.pei.summary }}</p>
              </div>

              <div class="flex gap-2">
                <button (click)="saveToPatientRecord(pei())" [disabled]="savingPlan()"
                  class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 active:scale-95">
                  <span class="material-icons text-base">save</span>
                  {{ savingPlan() ? 'Salvando...' : 'Salvar no Prontuário' }}
                </button>
                <button (click)="exportPeiPdf()"
                  class="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5">
                  <span class="material-icons text-base">picture_as_pdf</span>
                  Exportar PDF
                </button>
              </div>
            </div>

            <!-- Trilho 4 Fases do PEI -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              @for (phase of pei()!.phases; track phase.name) {
                <div class="p-4 rounded-2xl border transition-all"
                  [ngClass]="phase.status === 'CONCLUIDO' ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200' : phase.status === 'EM_ANDAMENTO' ? 'bg-primary/20 border-primary/40 text-white' : 'bg-white/5 border-white/10 text-slate-400'">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="material-icons text-sm">{{ phase.icon }}</span>
                    <span class="font-bold text-xs">{{ phase.label }}</span>
                  </div>
                  <p class="text-[10px] opacity-80">{{ phase.description }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Metas SMART do PEI -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6 space-y-4">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-icons text-primary">fact_check</span>
              Metas e Objetivos Pedagógicos / Comportamentais
            </h3>

            <div class="space-y-3">
              @for (obj of pei()!.objectives; track obj.goal) {
                <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 space-y-2">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {{ obj.area }}
                      </span>
                      <h4 class="font-bold text-sm text-slate-900 dark:text-white mt-1">{{ obj.goal }}</h4>
                    </div>
                    <span class="text-[10px] font-bold text-slate-400 shrink-0">Prazo: {{ obj.deadline }}</span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                    <div>
                      <p class="font-bold text-slate-500 text-[10px] uppercase">Indicadores de Sucesso:</p>
                      <ul class="list-disc pl-4 text-slate-600 dark:text-slate-300 space-y-0.5 mt-1">
                        @for (ind of obj.indicators; track ind) {
                          <li>{{ ind }}</li>
                        }
                      </ul>
                    </div>
                    <div>
                      <p class="font-bold text-slate-500 text-[10px] uppercase">Atividades & Estratégias:</p>
                      <ul class="list-disc pl-4 text-slate-600 dark:text-slate-300 space-y-0.5 mt-1">
                        @for (act of obj.activities; track act) {
                          <li>{{ act }}</li>
                        }
                      </ul>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: block; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `]
})
export class PlanoAiComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);
  materiaisService = inject(MateriaisService);

  loading = signal(false);
  currentAction = 'PLAN';
  plan = signal<any>(null);
  pei = signal<any>(null);
  savingPlan = signal(false);

  patients = signal<any[]>([]);
  selectedPatientId = '';
  suggestedMaterials = signal<MaterialTerapeutico[]>([]);

  form = {
    patientName: '',
    diagnosis: '',
    age: '',
    level: '2',
    goals: ''
  };

  ngOnInit() {
    this.api.get('/pacientes').subscribe({
      next: (res: any) => this.patients.set(res.data || res || []),
      error: () => {}
    });
  }

  onPatientSelect() {
    if (!this.selectedPatientId) return;

    this.api.get(`/ai-suggestions/patient-context/${this.selectedPatientId}`).subscribe({
      next: (ctx: any) => {
        this.form.patientName = ctx.patientName || '';
        this.form.age = ctx.age || '7';
        this.form.diagnosis = ctx.diagnosis || 'TEA';
        this.form.goals = ctx.goals || '';
        this.toast.success(`Dados de ${ctx.patientName} carregados!`);
      },
      error: () => this.toast.error('Erro ao carregar dados do paciente')
    });
  }

  generatePlan() {
    if (!this.form.diagnosis || !this.form.age || !this.form.goals) return;
    this.loading.set(true);
    this.currentAction = 'PLAN';
    this.pei.set(null);

    // Update suggested therapeutic materials
    const goalsList = this.form.goals.split(',').map(g => g.trim()).filter(Boolean);
    this.suggestedMaterials.set(this.materiaisService.suggestForObjectives(goalsList));

    this.api.post('/ai-suggestions/plan-suggestion', {
      ...this.form,
      patientName: this.form.patientName
    }).subscribe({
      next: (res: any) => {
        this.plan.set(res);
        this.loading.set(false);
        this.toast.success('Plano de Intervenção gerado com IA!');
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao gerar plano');
      }
    });
  }

  generatePEI() {
    if (!this.form.diagnosis || !this.form.age || !this.form.goals) return;
    this.loading.set(true);
    this.currentAction = 'PEI';
    this.plan.set(null);

    const pName = this.form.patientName || 'Paciente';

    this.api.post('/ai-suggestions/generate-pei', {
      ...this.form,
      patientName: pName
    }).subscribe({
      next: (res: any) => {
        this.pei.set(res);
        this.loading.set(false);
        this.toast.success('PEI Estruturado gerado com IA!');
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao gerar PEI');
      }
    });
  }

  saveToPatientRecord(data: any) {
    let pId = this.selectedPatientId;
    if (!pId) {
      const match = this.patients().find(p => p.name.toLowerCase() === this.form.patientName.toLowerCase());
      if (match) pId = match.id;
    }

    if (!pId) {
      return this.toast.warning('Selecione ou vincule a um paciente cadastrado para salvar no prontuário.');
    }

    this.savingPlan.set(true);

    this.api.post('/ai-suggestions/save-to-record', {
      pacienteId: pId,
      planData: data,
      title: data.pei ? data.pei.title : `Plano de Intervenção — ${this.form.patientName}`,
      frequency: data.overallPlan?.sessionFrequency || '2x/semana',
      sessionCount: 16
    }).subscribe({
      next: (res: any) => {
        this.savingPlan.set(false);
        this.toast.success('Plano gravado com sucesso no prontuário do paciente!');
      },
      error: () => {
        this.savingPlan.set(false);
        this.toast.error('Erro ao salvar plano no banco de dados');
      }
    });
  }

  exportPlanPdf() {
    const p = this.plan();
    if (!p) return;

    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <html>
        <head>
          <title>Plano de Intervenção - ${this.form.patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; font-size: 13px; }
            h1 { font-size: 20px; color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
            h2 { font-size: 15px; color: #0f172a; margin-top: 20px; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-bottom: 15px; }
            .strat { background: #fafafa; border-left: 4px solid #3b82f6; padding: 10px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>PLANO DE INTERVENÇÃO CLÍNICA</h1>
          <div class="box">
            <strong>Paciente:</strong> ${this.form.patientName} &nbsp;|&nbsp; 
            <strong>Diagnóstico:</strong> ${p.diagnosis} &nbsp;|&nbsp; 
            <strong>Idade:</strong> ${p.age} anos &nbsp;|&nbsp;
            <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}
          </div>
          <h2>1. Diretrizes Gerais</h2>
          <p><strong>Frequência:</strong> ${p.overallPlan.sessionFrequency} &nbsp;|&nbsp; <strong>Estimativa:</strong> ${p.overallPlan.totalEstimatedWeeks} semanas</p>
          <p><strong>Reavaliação:</strong> ${p.overallPlan.reassessmentPeriod}</p>
          
          <h2>2. Estratégias por Meta</h2>
          ${p.suggestions.map((sug: any) => `
            <div class="strat">
              <h3 style="margin:0 0 4px 0; font-size: 13px; color: #1e40af;">🎯 Meta: ${sug.goal} (${sug.category})</h3>
              ${sug.strategies.map((st: any) => `
                <p><strong>${st.title}</strong> (${st.difficulty}): ${st.description}</p>
                <ul>${st.steps.map((stp: string) => `<li>${stp}</li>`).join('')}</ul>
              `).join('')}
            </div>
          `).join('')}
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 500);
  }

  exportPeiPdf() {
    const peiData = this.pei();
    if (!peiData) return;

    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <html>
        <head>
          <title>PEI - ${peiData.pei.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; font-size: 13px; }
            h1 { font-size: 20px; color: #047857; border-bottom: 2px solid #10b981; padding-bottom: 8px; }
            .box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px; margin-bottom: 15px; }
            .meta { background: #fafafa; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>PLANO EDUCACIONAL INDIVIDUALIZADO (PEI)</h1>
          <div class="box">
            <strong>${peiData.pei.title}</strong><br>
            <span>${peiData.pei.summary}</span>
          </div>
          <h2>Objetivos e Metas SMART</h2>
          ${peiData.objectives.map((obj: any) => `
            <div class="meta">
              <h3 style="margin: 0 0 4px 0; font-size: 13px; color: #065f46;">${obj.area}: ${obj.goal} (Prazo: ${obj.deadline})</h3>
              <p><strong>Indicadores:</strong> ${obj.indicators.join('; ')}</p>
              <p><strong>Atividades:</strong> ${obj.activities.join('; ')}</p>
            </div>
          `).join('')}
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 500);
  }
}
