import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';
import { MateriaisService } from '../../biblioteca/services/materiais.service';
import { MaterialPickerModalComponent } from '@shared/components/material-picker-modal.component';
import { MaterialTerapeutico } from '@core/data/materiais-reais.data';

@Component({
  selector: 'app-session-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialPickerModalComponent],
  template: `
    <div class="space-y-6 animate-in">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white">Planner de Sessões</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Ciclo de intervenção com cronômetro por fase e materiais terapêuticos integrados</p>
      </div>

      <!-- Generator Form -->
      @if (!cycle()) {
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-8">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span class="material-icons text-primary">auto_awesome</span>
            Gerar Ciclo de Sessões Personalizado
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nome do Paciente *</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                [(ngModel)]="form.patientName" placeholder="Ex: Theo Mendes Rocha">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Frequência</label>
              <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                [(ngModel)]="form.frequency">
                <option value="1x">1x por semana</option>
                <option value="2x">2x por semana</option>
                <option value="3x">3x por semana</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Total de Sessões</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                type="number" min="4" max="48" [(ngModel)]="form.totalSessions">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Objetivos Terapêuticos (separados por vírgula) *</label>
              <textarea class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none resize-none text-slate-900 dark:text-white"
                rows="2" [(ngModel)]="form.goalsRaw" placeholder="Ex: Consciência fonológica, Rimas, Memória de trabalho, Foco atencional"></textarea>
            </div>
          </div>

          <!-- Materiais Sugeridos para o Ciclo -->
          @if (suggestedMaterials().length > 0) {
            <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <span class="material-icons text-emerald-500 text-sm">recommend</span>
                Materiais Terapêuticos Recomendados para este Plano
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                @for (m of suggestedMaterials(); track m.id) {
                  <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ m.name }}</p>
                      <p class="text-[10px] text-slate-500">{{ m.subcategory }} · {{ m.ageRange }} anos</p>
                    </div>
                    <button type="button" (click)="materiaisService.generateMaterialPdf(m)"
                      class="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-bold shrink-0 flex items-center gap-1">
                      <span class="material-icons text-[12px]">download</span> PDF
                    </button>
                  </div>
                }
              </div>
            </div>
          }

          <div class="mt-6 flex justify-end gap-3">
            <button (click)="updateSuggestedMaterials()" type="button"
              class="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm">
              Sugerir Materiais
            </button>
            <button (click)="generateCycle()" [disabled]="loading() || !form.patientName || !form.goalsRaw"
              class="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50">
              @if (loading()) {
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Gerando...
              } @else {
                <span class="material-icons text-[18px]">auto_awesome</span>
                Gerar Ciclo de Sessões
              }
            </button>
          </div>
        </div>
      }

      <!-- Active Session with Timer & Materials -->
      @if (activeSession()) {
        <div class="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <span class="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                Sessão em Andamento
              </span>
              <h2 class="text-xl font-bold mt-1">{{ activeSession()!.title }}</h2>
              <p class="text-slate-400 text-sm">Sessão {{ activeSession()!.sessionNumber }} de {{ cycle()!.sessions.length }} · Paciente: {{ cycle()!.cycle.patientName }}</p>
            </div>
            <div class="text-right">
              <div class="text-4xl font-mono font-black text-emerald-400">{{ formatTime(elapsedSeconds()) }}</div>
              <p class="text-xs text-slate-400 mt-1">Tempo Total Decorrido</p>
            </div>
          </div>

          <!-- Phase Progress Bar Buttons -->
          <div class="flex gap-2">
            @for (phase of activeSession()!.phases; track phase.name) {
              <button class="flex-1 rounded-2xl p-3 text-center transition-all"
                [ngClass]="{
                  'bg-emerald-500/20 ring-2 ring-emerald-400': phase.name === currentPhase(),
                  'bg-white/10': phase.name !== currentPhase() && phase.status !== 'CONCLUIDO',
                  'bg-emerald-500/10 ring-1 ring-emerald-500/30': phase.status === 'CONCLUIDO'
                }"
                (click)="setCurrentPhase(phase.name)">
                <span class="material-icons text-lg"
                  [class]="phase.status === 'CONCLUIDO' ? 'text-emerald-400' : phase.name === currentPhase() ? 'text-white' : 'text-slate-400'">
                  {{ phase.status === 'CONCLUIDO' ? 'check_circle' : phase.icon }}
                </span>
                <p class="text-[10px] font-bold mt-1"
                  [class]="phase.name === currentPhase() ? 'text-white' : 'text-slate-400'">
                  {{ phase.label }}
                </p>
              </button>
            }
          </div>

          <!-- Current Phase Detail -->
          @if (getCurrentPhaseData()) {
            <div class="bg-white/5 rounded-2xl p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg font-bold flex items-center gap-2">
                    <span class="material-icons">{{ getCurrentPhaseData()!.icon }}</span>
                    {{ getCurrentPhaseData()!.label }}
                  </h3>
                  <p class="text-sm text-slate-400">{{ getCurrentPhaseData()!.description }}</p>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-mono font-bold text-white">{{ formatTime(phaseElapsed()) }}</div>
                  <p class="text-xs text-slate-400">Meta: {{ getCurrentPhaseData()!.durationMinutes }}min</p>
                </div>
              </div>

              <!-- Phase Timer Bar -->
              <div class="w-full bg-slate-700 rounded-full h-2.5 mb-5">
                <div class="h-2.5 rounded-full transition-all duration-1000"
                  [ngClass]="phaseElapsed() >= getCurrentPhaseData()!.durationMinutes * 60 ? 'bg-emerald-500' : 'bg-primary'"
                  [style.width.%]="Math.min(100, (phaseElapsed() / (getCurrentPhaseData()!.durationMinutes * 60)) * 100)">
                </div>
              </div>

              <!-- Timer Controls -->
              <div class="flex flex-wrap gap-3">
                @if (timerStatus() === 'PAUSED' || timerStatus() === 'IDLE') {
                  <button (click)="startTimer()" class="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20">
                    <span class="material-icons">play_arrow</span> Iniciar Fase
                  </button>
                } @else if (timerStatus() === 'RUNNING') {
                  <button (click)="pauseTimer()" class="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 rounded-xl font-bold text-sm transition-all">
                    <span class="material-icons">pause</span> Pausar
                  </button>
                }
                <button (click)="completePhase()" class="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-bold text-sm transition-all"
                  [disabled]="timerStatus() === 'IDLE' && phaseElapsed() === 0">
                  <span class="material-icons">check</span> Concluir Fase
                </button>
                <button (click)="skipPhase()" class="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all" title="Pular para próxima fase">
                  <span class="material-icons">skip_next</span>
                </button>
              </div>
            </div>
          }

          <!-- Materiais Terapêuticos da Sessão Ativa -->
          <div class="bg-white/5 rounded-2xl p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span class="material-icons text-primary text-base">folder_special</span>
                Materiais Terapêuticos desta Sessão ({{ activeSessionMaterials().length }})
              </h4>
              <button (click)="showPicker.set(true)"
                class="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1">
                <span class="material-icons text-[14px]">add</span> Adicionar Material
              </button>
            </div>

            @if (activeSessionMaterials().length === 0) {
              <p class="text-xs text-slate-400">Nenhum material anexado. Clique em "Adicionar Material" para selecionar da biblioteca.</p>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                @for (mat of activeSessionMaterials(); track mat.id) {
                  <div class="p-3 bg-white/10 rounded-xl flex items-center justify-between gap-2">
                    <div class="min-w-0">
                      <p class="text-xs font-bold truncate text-white">{{ mat.name }}</p>
                      <p class="text-[10px] text-slate-400">{{ mat.subcategory }} · {{ mat.ageRange }} anos</p>
                    </div>
                    <button (click)="materiaisService.generateMaterialPdf(mat, cycle()?.cycle?.patientName)" title="Baixar PDF"
                      class="p-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-all shrink-0">
                      <span class="material-icons text-[14px]">download</span>
                    </button>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Phase Notes -->
          <div class="bg-white/5 rounded-2xl p-4">
            <label class="text-xs font-bold text-slate-400 uppercase mb-2 block">Anotações Clínicas desta Fase</label>
            <textarea class="w-full bg-white/10 border-none rounded-xl text-sm p-3 text-white placeholder-slate-500 resize-none focus:ring-2 focus:ring-primary outline-none"
              rows="2" [(ngModel)]="phaseNotes" placeholder="Observações sobre desempenho, foco e mediação..."></textarea>
          </div>
        </div>
      }

      <!-- Cycle Overview -->
      @if (cycle()) {
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6 space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-icons text-primary">calendar_month</span>
              Ciclo de Sessões — {{ cycle()!.cycle.patientName }}
            </h3>
            <button (click)="cycle.set(null); activeSession.set(null)" class="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-white font-semibold">
              Gerar Novo Ciclo
            </button>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-center">
              <p class="text-2xl font-black text-primary">{{ cycle()!.sessions.length }}</p>
              <p class="text-xs text-slate-500">Total Sessões</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-center">
              <p class="text-2xl font-black text-emerald-600">{{ cycle()!.cycle.frequency }}</p>
              <p class="text-xs text-slate-500">Frequência</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-center">
              <p class="text-2xl font-black text-amber-600">{{ cycle()!.cycle.estimatedWeeks }}</p>
              <p class="text-xs text-slate-500">Semanas Est.</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-center">
              <p class="text-2xl font-black text-purple-600">5</p>
              <p class="text-xs text-slate-500">Fases/Sessão</p>
            </div>
          </div>

          <!-- Session List -->
          <div class="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            @for (s of cycle()!.sessions; track s.sessionNumber) {
              <div class="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer ring-1 ring-slate-100 dark:ring-slate-800"
                [class]="activeSession()?.sessionNumber === s.sessionNumber ? 'bg-primary/5 ring-2 ring-primary/40' : ''"
                (click)="startSession(s)">
                <div class="size-9 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0"
                  [ngClass]="s.status === 'CONCLUIDA' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : s.status === 'EM_ANDAMENTO' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'">
                  {{ s.sessionNumber }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ s.title }}</p>
                  <p class="text-xs text-slate-500">{{ s.totalDuration }}min · 5 Fases Clínicas</p>
                </div>
                <button class="px-4 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all">
                  {{ activeSession()?.sessionNumber === s.sessionNumber ? 'Em Execução' : 'Iniciar' }}
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Material Picker Modal -->
      @if (showPicker()) {
        <app-material-picker-modal
          [initialSelectedIds]="getActiveSessionMaterialIds()"
          (confirmed)="onMaterialsSelected($event)"
          (closed)="showPicker.set(false)">
        </app-material-picker-modal>
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class SessionPlannerComponent implements OnDestroy {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  materiaisService = inject(MateriaisService);
  Math = Math;

  loading = signal(false);
  cycle = signal<any>(null);
  activeSession = signal<any>(null);
  currentPhase = signal('AQUECIMENTO');
  timerStatus = signal<'IDLE' | 'RUNNING' | 'PAUSED'>('IDLE');
  elapsedSeconds = signal(0);
  phaseElapsed = signal(0);
  phaseNotes = '';

  suggestedMaterials = signal<MaterialTerapeutico[]>([]);
  activeSessionMaterials = signal<MaterialTerapeutico[]>([]);
  showPicker = signal(false);

  private timerInterval: any = null;
  private phaseStart = 0;

  form = { patientName: '', frequency: '2x', totalSessions: 12, goalsRaw: '' };

  updateSuggestedMaterials() {
    if (!this.form.goalsRaw) return;
    const goals = this.form.goalsRaw.split(',').map(g => g.trim()).filter(Boolean);
    const suggested = this.materiaisService.suggestForObjectives(goals);
    this.suggestedMaterials.set(suggested);
  }

  generateCycle() {
    if (!this.form.patientName || !this.form.goalsRaw) return;
    this.loading.set(true);
    const objectives = this.form.goalsRaw.split(',').map(g => g.trim()).filter(Boolean);
    this.updateSuggestedMaterials();

    this.api.post('/session-planner/generate-cycle', {
      patientName: this.form.patientName,
      objectives,
      frequency: this.form.frequency,
      totalSessions: this.form.totalSessions,
    }).subscribe({
      next: (res: any) => {
        this.cycle.set(res);
        this.loading.set(false);
        this.toast.success('Ciclo gerado com sucesso!');
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao gerar ciclo');
      }
    });
  }

  startSession(session: any) {
    this.activeSession.set({
      ...session,
      phases: session.phases.map((p: any) => ({ ...p, status: 'PENDENTE' }))
    });
    this.currentPhase.set('AQUECIMENTO');
    this.elapsedSeconds.set(0);
    this.phaseElapsed.set(0);
    this.timerStatus.set('IDLE');
    this.phaseNotes = '';
    this.clearTimer();

    // Default session materials to suggestions if not empty
    if (this.suggestedMaterials().length > 0) {
      this.activeSessionMaterials.set([...this.suggestedMaterials()]);
    } else {
      this.activeSessionMaterials.set(this.materiaisService.getAll().slice(0, 3));
    }
  }

  getActiveSessionMaterialIds(): number[] {
    return this.activeSessionMaterials().map(m => m.id);
  }

  onMaterialsSelected(mats: MaterialTerapeutico[]) {
    this.activeSessionMaterials.set(mats);
    this.showPicker.set(false);
    this.toast.success('Materiais atualizados para esta sessão!');
  }

  setCurrentPhase(name: string) {
    this.currentPhase.set(name);
    this.phaseElapsed.set(0);
    this.phaseNotes = '';
  }

  getCurrentPhaseData(): any {
    const s = this.activeSession();
    if (!s) return null;
    return s.phases.find((p: any) => p.name === this.currentPhase());
  }

  startTimer() {
    this.timerStatus.set('RUNNING');
    this.phaseStart = Date.now();
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.set(this.elapsedSeconds() + 1);
      this.phaseElapsed.set(this.phaseElapsed() + 1);
    }, 1000);
  }

  pauseTimer() {
    this.timerStatus.set('PAUSED');
    this.clearTimer();
  }

  completePhase() {
    const s = this.activeSession();
    if (!s) return;
    const idx = s.phases.findIndex((p: any) => p.name === this.currentPhase());
    if (idx >= 0) {
      s.phases[idx].status = 'CONCLUIDO';
      s.phases[idx].completedAt = new Date().toISOString();
      s.phases[idx].notes = this.phaseNotes;
      this.activeSession.set({ ...s });
    }
    this.timerStatus.set('IDLE');
    this.clearTimer();
    this.toast.success(`Fase ${this.currentPhase()} concluída!`);
    const nextIdx = idx + 1;
    if (nextIdx < s.phases.length) {
      this.currentPhase.set(s.phases[nextIdx].name);
      this.phaseElapsed.set(0);
      this.phaseNotes = '';
    } else {
      this.toast.success('Sessão concluída com sucesso!');
    }
  }

  skipPhase() {
    const s = this.activeSession();
    if (!s) return;
    const idx = s.phases.findIndex((p: any) => p.name === this.currentPhase());
    if (idx >= 0 && idx + 1 < s.phases.length) {
      this.currentPhase.set(s.phases[idx + 1].name);
      this.phaseElapsed.set(0);
      this.phaseNotes = '';
    }
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  ngOnDestroy() {
    this.clearTimer();
  }
}
