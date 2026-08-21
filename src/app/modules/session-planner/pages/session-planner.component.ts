import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-session-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-in">
      <div>
        <h1 class="text-2xl font-black text-slate-900">Planner de Sessoes</h1>
        <p class="text-sm text-slate-500 mt-1">Ciclo de intervencao com cronometro por fase</p>
      </div>

      <!-- Generator Form -->
      @if (!cycle()) {
        <div class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 p-8">
          <h2 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span class="material-icons text-primary">auto_awesome</span>
            Gerar Ciclo de Sessoes
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Nome do Paciente *</label>
              <input class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-primary outline-none"
                [(ngModel)]="form.patientName" placeholder="Ex: Theo Mendes Rocha">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Frequencia</label>
              <select class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-primary outline-none"
                [(ngModel)]="form.frequency">
                <option value="2x">2x por semana</option>
                <option value="3x">3x por semana</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Total de Sessoes</label>
              <input class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-primary outline-none"
                type="number" min="4" max="48" [(ngModel)]="form.totalSessions">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-bold text-slate-700 mb-2">Objetivos (separados por virgula) *</label>
              <textarea class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-primary outline-none resize-none"
                rows="2" [(ngModel)]="form.goalsRaw" placeholder="Ex: Melhorar manding, Reduzir comportamento de escape, Turn-taking"></textarea>
            </div>
          </div>
          <div class="mt-6 flex justify-end">
            <button (click)="generateCycle()" [disabled]="loading() || !form.patientName || !form.goalsRaw"
              class="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-95 disabled:opacity-50">
              @if (loading()) {
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Gerando...
              } @else {
                <span class="material-icons text-[18px]">auto_awesome</span>
                Gerar Ciclo
              }
            </button>
          </div>
        </div>
      }

      <!-- Active Session with Timer -->
      @if (activeSession()) {
        <div class="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold">{{ activeSession()!.title }}</h2>
              <p class="text-slate-400 text-sm">Sessao {{ activeSession()!.sessionNumber }} de {{ cycle()!.sessions.length }}</p>
            </div>
            <div class="text-right">
              <div class="text-4xl font-mono font-black text-emerald-400">{{ formatTime(elapsedSeconds()) }}</div>
              <p class="text-xs text-slate-400 mt-1">Tempo decorrido</p>
            </div>
          </div>

          <!-- Phase Progress -->
          <div class="flex gap-2 mb-6">
            @for (phase of activeSession()!.phases; track phase.name) {
              <button class="flex-1 rounded-xl p-3 text-center transition-all"
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
            <div class="bg-white/5 rounded-2xl p-6 mb-6">
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
              <div class="w-full bg-slate-700 rounded-full h-2 mb-4">
                <div class="h-2 rounded-full transition-all duration-1000"
                  [ngClass]="phaseElapsed() >= getCurrentPhaseData()!.durationMinutes * 60 ? 'bg-emerald-500' : 'bg-primary'"
                  [style.width.%]="Math.min(100, (phaseElapsed() / (getCurrentPhaseData()!.durationMinutes * 60)) * 100)">
                </div>
              </div>

              <!-- Timer Controls -->
              <div class="flex gap-3">
                @if (timerStatus() === 'PAUSED') {
                  <button (click)="startTimer()" class="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-sm transition-all">
                    <span class="material-icons">play_arrow</span> Iniciar
                  </button>
                } @else if (timerStatus() === 'RUNNING') {
                  <button (click)="pauseTimer()" class="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 rounded-xl font-bold text-sm transition-all">
                    <span class="material-icons">pause</span> Pausar
                  </button>
                }
                <button (click)="completePhase()" class="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-bold text-sm transition-all"
                  [disabled]="timerStatus() === 'IDLE'">
                  <span class="material-icons">check</span> Concluir Fase
                </button>
                <button (click)="skipPhase()" class="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all">
                  <span class="material-icons">skip_next</span>
                </button>
              </div>
            </div>
          }

          <!-- Phase Notes -->
          <div class="bg-white/5 rounded-2xl p-4">
            <label class="text-xs font-bold text-slate-400 uppercase mb-2 block">Notas da Fase</label>
            <textarea class="w-full bg-white/10 border-none rounded-xl text-sm p-3 text-white placeholder-slate-500 resize-none focus:ring-2 focus:ring-primary outline-none"
              rows="2" [(ngModel)]="phaseNotes" placeholder="Observacoes sobre esta fase..."></textarea>
          </div>
        </div>
      }

      <!-- Cycle Overview -->
      @if (cycle()) {
        <div class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span class="material-icons text-primary">calendar_month</span>
              Ciclo de Sessoes
            </h3>
            <button (click)="cycle.set(null); activeSession.set(null)" class="text-sm text-slate-500 hover:text-slate-700 font-semibold">Novo ciclo</button>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div class="bg-slate-50 rounded-xl p-3 text-center">
              <p class="text-2xl font-black text-primary">{{ cycle()!.sessions.length }}</p>
              <p class="text-xs text-slate-500">Sessoes</p>
            </div>
            <div class="bg-slate-50 rounded-xl p-3 text-center">
              <p class="text-2xl font-black text-emerald-600">{{ cycle()!.cycle.frequency }}</p>
              <p class="text-xs text-slate-500">Frequencia</p>
            </div>
            <div class="bg-slate-50 rounded-xl p-3 text-center">
              <p class="text-2xl font-black text-amber-600">{{ cycle()!.cycle.estimatedWeeks }}</p>
              <p class="text-xs text-slate-500">Semanas</p>
            </div>
            <div class="bg-slate-50 rounded-xl p-3 text-center">
              <p class="text-2xl font-black text-purple-600">5</p>
              <p class="text-xs text-slate-500">Fases/Sessao</p>
            </div>
          </div>

          <!-- Session List -->
          <div class="space-y-2 max-h-[400px] overflow-y-auto">
            @for (s of cycle()!.sessions; track s.sessionNumber) {
              <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                [class]="activeSession()?.sessionNumber === s.sessionNumber ? 'bg-primary/5 ring-1 ring-primary/20' : ''"
                (click)="startSession(s)">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  [ngClass]="s.status === 'CONCLUIDA' ? 'bg-emerald-100 text-emerald-700' : s.status === 'EM_ANDAMENTO' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'">
                  {{ s.sessionNumber }}
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-slate-900">{{ s.title }}</p>
                  <p class="text-xs text-slate-500">{{ s.totalDuration }}min total</p>
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  [ngClass]="s.status === 'CONCLUIDA' ? 'bg-emerald-100 text-emerald-700' : s.status === 'EM_ANDAMENTO' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'">
                  {{ s.status }}
                </span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class SessionPlannerComponent implements OnDestroy {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  Math = Math;

  loading = signal(false);
  cycle = signal<any>(null);
  activeSession = signal<any>(null);
  currentPhase = signal('AQUECIMENTO');
  timerStatus = signal<'IDLE' | 'RUNNING' | 'PAUSED'>('IDLE');
  elapsedSeconds = signal(0);
  phaseElapsed = signal(0);
  phaseNotes = '';

  private timerInterval: any = null;
  private phaseStart = 0;

  form = { patientName: '', frequency: '2x', totalSessions: 12, goalsRaw: '' };

  generateCycle() {
    if (!this.form.patientName || !this.form.goalsRaw) return;
    this.loading.set(true);
    const objectives = this.form.goalsRaw.split(',').map(g => g.trim()).filter(Boolean);
    this.api.post('/session-planner/generate-cycle', {
      patientName: this.form.patientName,
      objectives,
      frequency: this.form.frequency,
      totalSessions: this.form.totalSessions,
    }).subscribe({
      next: (res: any) => { this.cycle.set(res); this.loading.set(false); this.toast.success('Ciclo gerado!'); },
      error: () => { this.loading.set(false); this.toast.error('Erro ao gerar ciclo'); }
    });
  }

  startSession(session: any) {
    this.activeSession.set({ ...session, phases: session.phases.map((p: any) => ({ ...p, status: 'PENDENTE' })) });
    this.currentPhase.set('AQUECIMENTO');
    this.elapsedSeconds.set(0);
    this.phaseElapsed.set(0);
    this.timerStatus.set('IDLE');
    this.phaseNotes = '';
    this.clearTimer();
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
    this.toast.success(`Fase ${this.currentPhase()} concluida!`);
    const nextIdx = idx + 1;
    if (nextIdx < s.phases.length) {
      this.currentPhase.set(s.phases[nextIdx].name);
      this.phaseElapsed.set(0);
      this.phaseNotes = '';
    } else {
      this.toast.success('Sessao concluida!');
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
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
  }

  ngOnDestroy() { this.clearTimer(); }
}
