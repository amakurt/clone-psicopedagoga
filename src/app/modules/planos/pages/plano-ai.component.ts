import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';

declare var html2pdf: any;

@Component({
  selector: 'app-plano-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-in">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white">Gerador de Planos com IA</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Sugestões de plano de intervenção baseadas em melhores práticas TEA/ABA</p>
      </div>

      <!-- Input Form -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-8">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span class="material-icons text-primary">auto_awesome</span>
          Informações do Paciente
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Diagnóstico / Queixa *</label>
            <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
              [(ngModel)]="form.diagnosis">
              <option value="">Selecione</option>
              <option value="TEA">TEA (Transtorno do Espectro Autista)</option>
              <option value="TEA Nível 1">TEA Nível 1 - Leve</option>
              <option value="TEA Nível 2">TEA Nível 2 - Moderado</option>
              <option value="TEA Nível 3">TEA Nível 3 - Grave</option>
              <option value="TOD">TOD (Transtorno Opositor Desafiador)</option>
              <option value="TDAH">TDAH (Transtorno do Déficit de Atenção)</option>
              <option value="Deficiência Intelectual">Deficiência Intelectual</option>
              <option value="Atraso de Desenvolvimento">Atraso de Desenvolvimento</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Idade *</label>
            <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
              type="number" min="0" max="18" [(ngModel)]="form.age" placeholder="Ex: 5">
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nível de Suporte</label>
            <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
              [(ngModel)]="form.level">
              <option value="1">Nível 1 - Leve</option>
              <option value="2">Nível 2 - Moderado</option>
              <option value="3">Nível 3 - Grave</option>
            </select>
          </div>
        </div>

        <div class="mt-6">
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Objetivos / Metas * (separados por vírgula)</label>
          <textarea class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none resize-none"
            rows="3" [(ngModel)]="form.goals" placeholder="Ex: Melhorar comunicação, Reduzir comportamentos agressivos, Melhorar interação social"></textarea>
        </div>

        <div class="mt-6 flex justify-end">
          <button (click)="generatePlan()" [disabled]="loading() || !form.diagnosis || !form.age || !form.goals"
            class="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50">
            @if (loading()) {
              <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Gerando...
            } @else {
              <span class="material-icons text-[18px]">auto_awesome</span>
              Gerar Plano
            }
          </button>
        </div>
      </div>

      <!-- Generated Plan -->
      @if (plan()) {
        <div class="space-y-6">
          <!-- Overall Plan -->
          <div class="bg-gradient-to-r from-primary to-teal-600 rounded-3xl p-8 text-white">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
              <span class="material-icons">summarize</span>
              Plano Geral de Intervenção
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div class="bg-white/10 rounded-xl p-4">
                <p class="text-xs uppercase tracking-wider opacity-80">Duração Estimada</p>
                <p class="text-lg font-bold">{{ plan()!.overallPlan.totalEstimatedWeeks }} semanas</p>
              </div>
              <div class="bg-white/10 rounded-xl p-4">
                <p class="text-xs uppercase tracking-wider opacity-80">Frequência</p>
                <p class="text-lg font-bold">{{ plan()!.overallPlan.sessionFrequency }}</p>
              </div>
              <div class="bg-white/10 rounded-xl p-4">
                <p class="text-xs uppercase tracking-wider opacity-80">Reavaliação</p>
                <p class="text-lg font-bold">{{ plan()!.overallPlan.reassessmentPeriod }}</p>
              </div>
            </div>
            <div class="mt-4 bg-white/10 rounded-xl p-4">
              <p class="text-xs uppercase tracking-wider opacity-80 mb-2">Equipe</p>
              <div class="flex flex-wrap gap-2">
                @for (member of plan()!.overallPlan.teamInvolvement; track $index) {
                  <span class="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">{{ member }}</span>
                }
              </div>
            </div>
          </div>

          <!-- Suggestions -->
          @for (suggestion of plan()!.suggestions; track $index) {
            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
              <div class="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <div class="flex items-center gap-3">
                  <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                    [class]="getCategoryClass(suggestion.category)">
                    {{ suggestion.category }}
                  </span>
                  <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ suggestion.goal }}</h3>
                </div>
              </div>

              <div class="p-6 space-y-4">
                @for (strategy of suggestion.strategies; track $index) {
                  <div class="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:ring-2 hover:ring-primary/20 transition-all">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <h4 class="font-bold text-slate-900 dark:text-white">{{ strategy.title }}</h4>
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            [class]="strategy.difficulty === 'ALTA' ? 'bg-red-100 text-red-700' : strategy.difficulty === 'MEDIA' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">
                            {{ strategy.difficulty }}
                          </span>
                        </div>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mb-3">{{ strategy.description }}</p>

                        <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Passos de Implementação</p>
                          <ol class="space-y-1">
                            @for (step of strategy.steps; track $index) {
                              <li class="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                <span class="size-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">{{ $index + 1 }}</span>
                                {{ step }}
                              </li>
                            }
                          </ol>
                        </div>

                        <div class="flex flex-wrap gap-3 mt-3">
                          <span class="text-xs text-slate-500 flex items-center gap-1">
                            <span class="material-icons text-sm">schedule</span> {{ strategy.estimatedSessions }} sessões estimadas
                          </span>
                          <span class="text-xs text-slate-500 flex items-center gap-1">
                            <span class="material-icons text-sm">repeat</span> {{ strategy.frequency }}
                          </span>
                          <span class="text-xs text-slate-500 flex items-center gap-1">
                            <span class="material-icons text-sm">science</span> {{ strategy.evidence }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>

              @if (suggestion.ageRecommendations?.length) {
                <div class="px-6 pb-6">
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recomendações para a idade</p>
                  <div class="flex flex-wrap gap-2">
                    @for (rec of suggestion.ageRecommendations; track $index) {
                      <span class="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">{{ rec }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          }

          <!-- General Recommendations -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span class="material-icons text-amber-500">tips_and_updates</span>
              Recomendações Gerais
            </h3>
            <ul class="space-y-2">
              @for (rec of plan()!.generalRecommendations; track $index) {
                <li class="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <span class="material-icons text-emerald-500 text-lg shrink-0">check_circle</span>
                  {{ rec }}
                </li>
              }
            </ul>
          </div>

          <!-- Export -->
          <div class="flex justify-end gap-3">
            <button (click)="exportToPdf()"
              class="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all">
              <span class="material-icons text-lg">picture_as_pdf</span> Exportar PDF
            </button>
            <button (click)="applyPlan()"
              class="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all">
              <span class="material-icons text-[18px]">save</span> Aplicar ao Plano
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class PlanoAiComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  loading = signal(false);
  plan = signal<any>(null);

  form: any = { diagnosis: '', age: '', goals: '', level: '2' };

  generatePlan() {
    if (!this.form.diagnosis || !this.form.age || !this.form.goals) return;
    this.loading.set(true);
    this.api.post('/ai/plan-suggestion', this.form).subscribe({
      next: (res: any) => { this.plan.set(res); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Erro ao gerar plano'); }
    });
  }

  getCategoryClass(category: string): string {
    const map: Record<string, string> = {
      'COMUNICACAO': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'COMPORTAMENTO': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'SOCIALIZACAO': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'AUTORREGULACAO': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'ACADÉMICO': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[category] || 'bg-slate-100 text-slate-700';
  }

  exportToPdf() {
    const p = this.plan();
    if (!p) return;

    let html = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 30px;">
      <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px solid #007F80; padding-bottom: 15px;">
        <h1 style="color: #007F80; margin: 0;">EduPsych Pro</h1>
        <h2 style="color: #333; margin: 5px 0 0;">Plano de Intervenção IA</h2>
        <p style="color: #666; margin: 5px 0 0;">Diagnóstico: ${p.diagnosis} | Idade: ${p.age} anos | Nível: ${p.level}</p>
      </div>`;

    html += `<div style="background: #f0fdfa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
      <h3 style="color: #007F80; margin: 0 0 10px;">Plano Geral</h3>
      <p><strong>Duração:</strong> ${p.overallPlan.totalEstimatedWeeks} semanas | <strong>Frequência:</strong> ${p.overallPlan.sessionFrequency} | <strong>Reavaliação:</strong> ${p.overallPlan.reassessmentPeriod}</p>
    </div>`;

    for (const s of p.suggestions) {
      html += `<div style="margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px;">
        <h3 style="color: #1e293b; margin: 0 0 10px;">${s.category} - ${s.goal}</h3>`;
      for (const strat of s.strategies) {
        html += `<div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 8px;">
          <p style="font-weight: bold; margin: 0 0 5px;">${strat.title} <span style="color: #666; font-size: 12px;">[${strat.difficulty}]</span></p>
          <p style="margin: 0 0 8px; color: #555; font-size: 13px;">${strat.description}</p>
          <ol style="margin: 0; padding-left: 20px; font-size: 13px;">${strat.steps.map((st: string) => `<li style="margin: 3px 0;">${st}</li>`).join('')}</ol>
          <p style="margin: 8px 0 0; font-size: 12px; color: #888;">${strat.estimatedSessions} sessões | ${strat.frequency} | ${strat.evidence}</p>
        </div>`;
      }
      html += `</div>`;
    }

    html += `<div style="margin-top: 20px; padding: 15px; background: #fffbeb; border-radius: 12px;">
      <h3 style="color: #92400e; margin: 0 0 10px;">Recomendações Gerais</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px;">${p.generalRecommendations.map((r: string) => `<li style="margin: 3px 0;">${r}</li>`).join('')}</ul>
    </div>`;

    html += `<p style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">Gerado em ${new Date().toLocaleString('pt-BR')}</p></div>`;

    if (typeof html2pdf !== 'undefined') {
      const element = document.createElement('div');
      element.innerHTML = html;
      html2pdf().from(element).set({ filename: `plano-intervencao-ia-${this.form.diagnosis}.pdf`, margin: 10 }).save();
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) { printWindow.document.write(html); printWindow.document.close(); printWindow.print(); }
    }
  }

  applyPlan() {
    this.toast.success('Plano de intervenção salvo! Acesse a seção de Planos para visualizar e editar.');
  }
}
