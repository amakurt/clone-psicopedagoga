import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { Chart, registerables } from 'chart.js';
import { ToastService } from '@shared/components/toast.component';

Chart.register(...registerables);

interface Subcategory {
  id: string;
  name: string;
  items: string[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: Subcategory[];
}

@Component({
  selector: 'app-protocolo-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/app/protocolos" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <span class="material-icons text-gray-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Protocolo TEA</h1>
            <p class="text-sm text-gray-500 dark:text-slate-400">Avaliação de Habilidades Essenciais</p>
          </div>
        </div>
        <button (click)="save()" [disabled]="saving() || !selectedPatientId()"
          class="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center gap-2">
          <span class="material-icons">save</span>
          {{ saving() ? 'Salvando...' : 'Salvar Avaliação' }}
        </button>
      </div>

      <!-- Patient & Date Selection -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Paciente *</label>
            <select [(ngModel)]="selectedPatientId" class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              <option value="">Selecione um paciente</option>
              @for (p of patients(); track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Data da Avaliação</label>
            <input type="date" [(ngModel)]="evaluationDate" class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Buscar Habilidade</label>
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="filterItems()" placeholder="Buscar..."
              class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
          </div>
        </div>
      </div>

      <!-- Global Summary Panel -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Overall Score -->
          <div class="flex flex-col items-center justify-center">
            <div class="relative w-28 h-28 mb-3">
              <svg class="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="#e5e7eb" stroke-width="10" fill="none" class="dark:stroke-slate-700" />
                <circle cx="60" cy="60" r="50" stroke="#007F80" stroke-width="10" fill="none"
                  stroke-linecap="round" [attr.stroke-dasharray]="getOverallDash()" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-black text-primary">{{ overallPercentage() }}%</span>
                <span class="text-[9px] text-gray-400 uppercase tracking-wider">Geral</span>
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-slate-400">{{ totalScore() }}/{{ totalMax() }} pontos</p>
          </div>

          <!-- Radar Chart Global -->
          <div class="lg:col-span-1">
            <canvas #globalRadarChart width="280" height="280"></canvas>
          </div>

          <!-- Category Indicators -->
          <div class="space-y-2">
            @for (cat of categories(); track cat.id) {
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" [style.background]="cat.color"></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-0.5">
                    <span class="text-xs font-medium text-gray-700 dark:text-slate-300 truncate">{{ cat.name.replace('Habilidades ', '') }}</span>
                    <span class="text-xs font-bold ml-2" [style.color]="cat.color">{{ getCategoryPercent(cat) }}%</span>
                  </div>
                  <div class="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" [style.width.%]="getCategoryPercent(cat)" [style.background]="cat.color"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Categories Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden sticky top-4">
            <div class="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 class="font-semibold text-gray-900 dark:text-white">Categorias</h3>
            </div>
            <div class="p-2">
              @for (cat of categories(); track cat.id) {
                <button (click)="selectCategory(cat)"
                  class="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  [class]="selectedCategory()?.id === cat.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-slate-700'">
                  <span class="material-icons" [style.color]="cat.icon === selectedCategory()?.id ? cat.color : ''">{{ cat.icon }}</span>
                  <div class="flex-1">
                    <p class="text-sm font-medium" [class]="selectedCategory()?.id === cat.id ? 'text-primary' : 'text-gray-900 dark:text-white'">{{ cat.name }}</p>
                    <p class="text-xs text-gray-500">{{ getCategoryScore(cat) }}/{{ getCategoryMax(cat) }}</p>
                  </div>
                  <span class="text-xs font-bold" [style.color]="cat.color">{{ getCategoryPercent(cat) }}%</span>
                </button>
              }
            </div>

            <!-- Overall Stats -->
            <div class="p-4 border-t border-gray-200 dark:border-slate-700">
              <div class="text-center">
                <p class="text-3xl font-bold text-primary">{{ overallPercentage() }}%</p>
                <p class="text-sm text-gray-500 dark:text-slate-400">Pontuação Geral</p>
                <p class="text-xs text-gray-400 mt-1">{{ totalScore() }}/{{ totalMax() }} pontos</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          @if (selectedCategory()) {
            <!-- Radar Chart -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gráfico de Radar</h3>
              <div class="flex justify-center">
                <canvas #radarChart width="400" height="400"></canvas>
              </div>
            </div>

            <!-- Subcategories -->
            @for (sub of selectedCategory()!.subcategories; track sub.id) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div class="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <h4 class="font-semibold text-gray-900 dark:text-white">{{ sub.name }}</h4>
                  <span class="px-3 py-1 rounded-full text-sm font-bold" 
                    [style.background]="selectedCategory()!.color + '20'" 
                    [style.color]="selectedCategory()!.color">
                    {{ getSubcategoryScore(sub) }}/20
                  </span>
                </div>
                <div class="divide-y divide-gray-100 dark:divide-slate-700">
                  @for (item of sub.items; track $index; let i = $index) {
                    @if (!searchTerm || item.toLowerCase().includes(searchTerm.toLowerCase())) {
                      <div class="px-4 py-3 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <span class="text-sm font-medium text-gray-500 dark:text-slate-400 w-8">{{ i + 1 }}</span>
                        <p class="flex-1 text-sm text-gray-700 dark:text-slate-300">{{ item }}</p>
                        <div class="flex gap-1">
                          @for (score of [0, 1, 2]; track score) {
                            <button (click)="setScore(selectedCategory()!.id, sub.id, i, score)"
                              class="w-10 h-10 rounded-lg font-bold text-sm transition-all"
                              [class]="getScore(selectedCategory()!.id, sub.id, i) === score 
                                ? getScoreButtonClass(score) 
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200'">
                              {{ score }}
                            </button>
                          }
                        </div>
                      </div>
                    }
                  }
                </div>
              </div>
            }
          } @else {
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-gray-200 dark:border-slate-700 text-center">
              <span class="material-icons text-6xl text-gray-300 dark:text-slate-600">touch_app</span>
              <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Selecione uma categoria</h3>
              <p class="mt-2 text-gray-500 dark:text-slate-400">Escolha uma categoria ao lado para iniciar a avaliação</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ProtocoloFormComponent implements OnInit {
  @ViewChild('radarChart') radarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('globalRadarChart') globalRadarChartRef!: ElementRef<HTMLCanvasElement>;

  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  patients = signal<any[]>([]);
  categories = signal<Category[]>([]);
  selectedCategory = signal<Category | null>(null);
  selectedPatientId = signal('');
  evaluationDate = new Date().toISOString().split('T')[0];
  searchTerm = '';
  saving = signal(false);

  evaluations = signal<Record<string, number>>({});
  private chart: Chart | null = null;

  isEdit = false;
  evaluationId = '';

  ngOnInit() {
    this.evaluationId = this.route.snapshot.paramMap.get('id') || '';
    this.isEdit = !!this.evaluationId;

    this.api.get('/pacientes').subscribe((res: any) => {
      this.patients.set(res.data || []);

      this.api.get('/protocol-evaluations/protocol-data').subscribe((res: any) => {
        this.categories.set(res.categories || []);

        if (this.isEdit) {
          this.loadEvaluation();
        } else if (res.categories?.length > 0) {
          this.selectCategory(res.categories[0]);
        }
      });
    });
  }

  loadEvaluation() {
    this.api.get(`/protocol-evaluations/${this.evaluationId}`).subscribe({
      next: (res: any) => {
        this.selectedPatientId.set(res.pacienteId || '');
        this.evaluationDate = res.date || new Date().toISOString().split('T')[0];

        if (res.evaluations) {
          try {
            this.evaluations.set(JSON.parse(res.evaluations));
          } catch {
            this.evaluations.set({});
          }
        }

        if (this.categories().length > 0) {
          this.selectCategory(this.categories()[0]);
        }
      },
      error: () => {
        this.toast.error('Avaliação não encontrada');
        this.router.navigate(['/app/protocolos']);
      }
    });
  }

  selectCategory(cat: Category) {
    this.selectedCategory.set(cat);
    setTimeout(() => {
      this.updateChart();
      this.updateGlobalChart();
    }, 100);
  }

  getScore(catId: string, subId: string, itemIdx: number): number {
    return this.evaluations()[`${catId}_${subId}_${itemIdx}`] ?? -1;
  }

  setScore(catId: string, subId: string, itemIdx: number, score: number) {
    const key = `${catId}_${subId}_${itemIdx}`;
    this.evaluations.update(evals => ({ ...evals, [key]: score }));
    this.updateChart();
    this.updateGlobalChart();
  }

  getScoreButtonClass(score: number): string {
    switch (score) {
      case 0: return 'bg-red-100 text-red-700 ring-2 ring-red-300';
      case 1: return 'bg-amber-100 text-amber-700 ring-2 ring-amber-300';
      case 2: return 'bg-green-100 text-green-700 ring-2 ring-green-300';
      default: return '';
    }
  }

  getCategoryScore(cat: Category): number {
    let score = 0;
    const evals = this.evaluations();
    cat.subcategories.forEach(sub => {
      sub.items.forEach((_, idx) => {
        score += evals[`${cat.id}_${sub.id}_${idx}`] || 0;
      });
    });
    return score;
  }

  getCategoryMax(cat: Category): number {
    return cat.subcategories.length * 10 * 2;
  }

  getCategoryPercent(cat: Category): number {
    const max = this.getCategoryMax(cat);
    return max > 0 ? Math.round((this.getCategoryScore(cat) / max) * 100) : 0;
  }

  getSubcategoryScore(sub: Subcategory): number {
    const cat = this.selectedCategory();
    if (!cat) return 0;
    let score = 0;
    const evals = this.evaluations();
    sub.items.forEach((_, idx) => {
      score += evals[`${cat.id}_${sub.id}_${idx}`] || 0;
    });
    return score;
  }

  totalScore(): number {
    return Object.values(this.evaluations()).reduce((sum, v) => sum + v, 0);
  }

  totalMax(): number {
    return this.categories().reduce((sum, cat) => sum + this.getCategoryMax(cat), 0);
  }

  overallPercentage(): number {
    const max = this.totalMax();
    return max > 0 ? Math.round((this.totalScore() / max) * 100) : 0;
  }

  getOverallDash(): string {
    const pct = this.overallPercentage();
    const circumference = 2 * Math.PI * 50;
    const filled = (pct / 100) * circumference;
    return `${filled} ${circumference}`;
  }

  filterItems() {
    // Reactive filtering happens via template
  }

  private globalChart: Chart | null = null;

  updateGlobalChart() {
    if (!this.globalRadarChartRef || this.categories().length === 0) return;
    if (this.globalChart) this.globalChart.destroy();

    const cats = this.categories();

    this.globalChart = new Chart(this.globalRadarChartRef.nativeElement, {
      type: 'radar',
      data: {
        labels: cats.map(c => c.name.replace('Habilidades ', '').replace('Habilidades Funcionais', 'Funcionais')),
        datasets: [{
          label: 'Geral',
          data: cats.map(c => this.getCategoryPercent(c)),
          backgroundColor: 'rgba(0, 127, 128, 0.15)',
          borderColor: '#007F80',
          borderWidth: 2,
          pointBackgroundColor: cats.map(c => c.color),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 25, display: false },
            grid: { color: '#e5e7eb' },
            pointLabels: { font: { size: 10, weight: 'bold' }, color: '#64748b' }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  updateChart() {
    if (!this.radarChartRef || !this.selectedCategory()) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const cat = this.selectedCategory()!;
    const labels = cat.subcategories.map(s => s.name);
    const data = cat.subcategories.map(s => {
      const score = this.getSubcategoryScore(s);
      return Math.round((score / 20) * 100);
    });

    this.chart = new Chart(this.radarChartRef.nativeElement, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: cat.name,
          data,
          backgroundColor: cat.color + '30',
          borderColor: cat.color,
          borderWidth: 2,
          pointBackgroundColor: cat.color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20, display: false },
            grid: { color: '#e5e7eb' },
            pointLabels: { font: { size: 12 } }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  save() {
    if (!this.selectedPatientId()) return;
    this.saving.set(true);

    const evals = this.evaluations();
    const data = {
      pacienteId: this.selectedPatientId(),
      professionalId: this.auth.user()?.id || '',
      date: this.evaluationDate,
      evaluations: JSON.stringify(evals),
      totalEvaluations: Object.keys(evals).length,
      averageScore: this.overallPercentage(),
      maxScore: this.totalMax(),
      minScore: 0
    };

    const req = this.route.snapshot.paramMap.get('id')
      ? this.api.put(`/protocol-evaluations/${this.route.snapshot.paramMap.get('id')}`, data)
      : this.api.post('/protocol-evaluations', data);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/app/protocolos']);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erro ao salvar avaliação');
      }
    });
  }
}
