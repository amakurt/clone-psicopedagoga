import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GuardianService } from '../services/guardian.service';
import { SessionRecord } from '@core/models';

@Component({
  selector: 'app-guardian-evolutions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Evoluções Compartilhadas</h2>
        <p class="text-gray-500 dark:text-slate-400 mt-1">Registros de sessão compartilhados pelo profissional</p>
      </div>

      @if (records().length === 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-gray-200 dark:border-slate-700 text-center">
          <span class="material-icons text-6xl text-gray-300 dark:text-slate-600">trending_up</span>
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Nenhuma evolução compartilhada</h3>
          <p class="mt-2 text-gray-500 dark:text-slate-400">As evoluções compartilhadas pelo profissional aparecerão aqui</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (record of records(); track record.id) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-3">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      Sessão {{ record.sessionNumber || '-' }}
                    </span>
                    <span class="text-sm text-gray-500 dark:text-slate-400">{{ record.date }}</span>
                  </div>
                  <h3 class="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{{ record.summary }}</h3>
                </div>
              </div>

              @if (record.objective) {
                <div class="mt-4">
                  <p class="text-sm font-medium text-gray-500 dark:text-slate-400">Objetivo</p>
                  <p class="text-gray-700 dark:text-slate-300">{{ record.objective }}</p>
                </div>
              }

              @if (record.activities) {
                <div class="mt-4">
                  <p class="text-sm font-medium text-gray-500 dark:text-slate-400">Atividades</p>
                  <p class="text-gray-700 dark:text-slate-300">{{ record.activities }}</p>
                </div>
              }

              @if (record.observations) {
                <div class="mt-4">
                  <p class="text-sm font-medium text-gray-500 dark:text-slate-400">Observações</p>
                  <p class="text-gray-700 dark:text-slate-300">{{ record.observations }}</p>
                </div>
              }

              @if (record.focus || record.engagement || record.skillProgress || record.behavior) {
                <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  @if (record.focus) {
                    <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 text-center">
                      <p class="text-lg font-bold text-primary">{{ record.focus }}%</p>
                      <p class="text-xs text-gray-500">Foco</p>
                    </div>
                  }
                  @if (record.engagement) {
                    <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 text-center">
                      <p class="text-lg font-bold text-primary">{{ record.engagement }}%</p>
                      <p class="text-xs text-gray-500">Engajamento</p>
                    </div>
                  }
                  @if (record.skillProgress) {
                    <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 text-center">
                      <p class="text-lg font-bold text-primary">{{ record.skillProgress }}%</p>
                      <p class="text-xs text-gray-500">Progresso</p>
                    </div>
                  }
                  @if (record.behavior) {
                    <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 text-center">
                      <p class="text-lg font-bold text-primary">{{ record.behavior }}%</p>
                      <p class="text-xs text-gray-500">Comportamento</p>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class GuardianEvolutionsComponent implements OnInit {
  private guardianService = inject(GuardianService);
  private route = inject(ActivatedRoute);

  records = signal<SessionRecord[]>([]);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const patientId = params['patientId'] || localStorage.getItem('guardian_patient_id');
      if (patientId) {
        this.loadEvolutions(patientId);
      }
    });
  }

  loadEvolutions(patientId: string) {
    this.guardianService.getEvolutions(patientId).subscribe({
      next: (res: any) => this.records.set(res.data || [])
    });
  }
}
