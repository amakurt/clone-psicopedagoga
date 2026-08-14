import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EscolasService } from '../services/escolas.service';

@Component({
  selector: 'app-escolas-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Escolas</h1>
          <p class="text-sm text-gray-500 dark:text-slate-400 mt-1">Cadastro de instituições de ensino</p>
        </div>
        <a routerLink="/app/escolas/novo"
          class="px-5 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-semibold flex items-center gap-2 transition-all">
          <span class="material-icons">add</span>
          Nova Escola
        </a>
      </div>

      <!-- List -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        } @else if (items().length === 0) {
          <div class="text-center py-12">
            <span class="material-icons text-5xl text-gray-300 dark:text-slate-600">school</span>
            <p class="mt-3 text-gray-500 dark:text-slate-400">Nenhuma escola cadastrada</p>
          </div>
        } @else {
          <div class="divide-y divide-gray-100 dark:divide-slate-700">
            @for (e of items(); track e.id) {
              <div class="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span class="material-icons text-primary">school</span>
                    </div>
                    <div>
                      <a [routerLink]="['/app/escolas', e.id]" class="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors">
                        {{ e.name }}
                      </a>
                      <div class="flex flex-wrap gap-1 mt-1">
                        @for (level of getLevels(e); track level) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300">
                            {{ getLevelLabel(level) }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-right hidden sm:block">
                      <p class="text-sm text-gray-500 dark:text-slate-400">{{ e.patients?.length || e.patientCount || 0 }} pacientes</p>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
                        [class]="e.status === 'Ativa' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">
                        {{ e.status }}
                      </span>
                    </div>
                    <div class="flex items-center gap-1">
                      <a [routerLink]="['/app/escolas', e.id]" 
                        class="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                        <span class="material-icons text-[20px]">visibility</span>
                      </a>
                      <a [routerLink]="['/app/escolas', e.id, 'editar']" 
                        class="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all">
                        <span class="material-icons text-[20px]">edit</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class EscolasListComponent implements OnInit {
  private service = inject(EscolasService);
  items = signal<any[]>([]);
  loading = signal(true);

  private levelMap: Record<string, string> = {
    'EDUCACAO_INFANTIL': 'Educação Infantil',
    'ANOS_INICIAIS': 'Anos Iniciais',
    'ANOS_FINAIS': 'Anos Finais',
    'ENSINO_MEDIO': 'Ensino Médio',
    'SUPERIOR': 'Superior',
    'PROFISSIONALIZANTE': 'Profissionalizante',
  };

  ngOnInit() {
    this.service.list().subscribe({
      next: (res: any) => {
        this.items.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getLevels(school: any): string[] {
    if (!school.levels) return [];
    try {
      return JSON.parse(school.levels);
    } catch {
      return school.levels ? [school.levels] : [];
    }
  }

  getLevelLabel(level: string): string {
    return this.levelMap[level] || level;
  }
}
