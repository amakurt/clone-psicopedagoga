import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';

declare var html2pdf: any;

@Component({
  selector: 'app-plano-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/planos" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <span class="material-icons text-gray-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ isEdit ? 'Editar' : 'Novo' }} Plano de Intervenção</h1>
            <p class="text-sm text-gray-500 dark:text-slate-400">Proposta de tratamento e orçamento</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button (click)="exportPdf()" [disabled]="!selectedPatientId"
            class="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-semibold flex items-center gap-2 transition-all">
            <span class="material-icons">picture_as_pdf</span>
            Exportar PDF
          </button>
          <button (click)="save()" [disabled]="saving() || !selectedPatientId"
            class="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center gap-2">
            <span class="material-icons">save</span>
            {{ saving() ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <!-- Patient Selection -->
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
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Data</label>
            <input type="date" [(ngModel)]="planDate" class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Status</label>
            <select [(ngModel)]="status" class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              <option value="RASCUNHO">Rascunho</option>
              <option value="FINALIZADO">Finalizado</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Steps Navigation -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div class="flex border-b border-gray-200 dark:border-slate-700">
          @for (step of steps; track step.num) {
            <button (click)="currentStep.set(step.num)"
              class="flex-1 py-4 text-sm font-semibold transition-all relative"
              [class]="currentStep() === step.num 
                ? 'text-primary bg-primary/5' 
                : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'">
              <span class="flex items-center justify-center gap-2">
                <span class="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                  [class]="currentStep() === step.num ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-400'">
                  {{ step.num }}
                </span>
                {{ step.label }}
              </span>
              @if (currentStep() === step.num) {
                <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
              }
            </button>
          }
        </div>

        <div class="p-6">
          <!-- Step 1: Avaliação/Anamnese -->
          @if (currentStep() === 1) {
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Avaliação / Anamnese</h3>
                <p class="text-sm text-gray-500 dark:text-slate-400 mb-6">Descreva o quadro geral do paciente e motivo da intervenção</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Diagnóstico / Queixa Principal</label>
                <textarea [(ngModel)]="step1" rows="4" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Descreva o diagnóstico ou queixa principal do paciente..."></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Observações Clínicas</label>
                <textarea [(ngModel)]="step1Notes" rows="3" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Informações complementares relevantes..."></textarea>
              </div>
            </div>
          }

          <!-- Step 2: Habilidades Desenvolvidas -->
          @if (currentStep() === 2) {
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Habilidades Desenvolvidas</h3>
                <p class="text-sm text-gray-500 dark:text-slate-400 mb-6">Descreva as habilidades que serão trabalhadas na intervenção</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Habilidades Alvo</label>
                <textarea [(ngModel)]="step2" rows="6" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Liste as habilidades que serão desenvolvidas:&#10;- Habilidade 1&#10;- Habilidade 2&#10;- Habilidade 3"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Critérios de Sucesso</label>
                <textarea [(ngModel)]="step2Criteria" rows="3" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Como o progresso será avaliado..."></textarea>
              </div>
            </div>
          }

          <!-- Step 3: Roteiro de Atendimento -->
          @if (currentStep() === 3) {
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Roteiro de Atendimento</h3>
                <p class="text-sm text-gray-500 dark:text-slate-400 mb-6">Planejamento detalhado das sessões</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Estratégias e Atividades</label>
                <textarea [(ngModel)]="step3" rows="6" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Descreva as estratégias e atividades para cada sessão..."></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Materiais Necessários</label>
                <textarea [(ngModel)]="step3Materials" rows="3" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Lista de materiais para as sessões..."></textarea>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Financial Data -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Dados Financeiros</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Nº de Sessões</label>
            <input type="number" [(ngModel)]="sessionCount" (ngModelChange)="calculateTotal()" min="1"
              class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Valor por Sessão (R$)</label>
            <input type="number" [(ngModel)]="sessionValue" (ngModelChange)="calculateTotal()" min="0" step="0.01"
              class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Frequência</label>
            <select [(ngModel)]="frequency" class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              <option value="1x por semana">1x por semana</option>
              <option value="2x por semana">2x por semana</option>
              <option value="3x por semana">3x por semana</option>
              <option value="Diário">Diário</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Duração da Sessão</label>
            <select [(ngModel)]="duration" class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              <option value="30 min">30 minutos</option>
              <option value="45 min">45 minutos</option>
              <option value="60 min">60 minutos</option>
              <option value="90 min">90 minutos</option>
            </select>
          </div>
        </div>

        <!-- Total Preview -->
        <div class="mt-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-slate-400">Valor Total do Tratamento</span>
            <span class="text-2xl font-bold text-primary">R$ {{ totalValue().toFixed(2) }}</span>
          </div>
          <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">
            {{ sessionCount }} sessões × R$ {{ (sessionValue || 0).toFixed(2) }} = R$ {{ totalValue().toFixed(2) }}
          </p>
        </div>
      </div>

      <!-- PDF Preview Template (hidden) -->
      <div #pdfTemplate class="hidden">
        <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; border-bottom: 3px solid #007F80; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #007F80; margin: 0; font-size: 24px;">PLANO DE INTERVENÇÃO</h1>
            <p style="color: #666; margin: 5px 0 0;">EduPsych Pro - Sistema de Gestão Psicopedagógica</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>Paciente:</strong> {{ getPatientName() }}</p>
            <p><strong>Data:</strong> {{ planDate }}</p>
            <p><strong>Status:</strong> {{ status }}</p>
          </div>

          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h2 style="color: #007F80; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">1. AVALIAÇÃO / ANAMNESE</h2>
            <p style="white-space: pre-wrap;">{{ step1 || 'Não preenchido' }}</p>
            @if (step1Notes) {
              <p style="margin-top: 10px; white-space: pre-wrap;"><em>{{ step1Notes }}</em></p>
            }
          </div>

          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h2 style="color: #007F80; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">2. HABILIDADES DESENVOLVIDAS</h2>
            <p style="white-space: pre-wrap;">{{ step2 || 'Não preenchido' }}</p>
            @if (step2Criteria) {
              <p style="margin-top: 10px;"><strong>Critérios de Sucesso:</strong> {{ step2Criteria }}</p>
            }
          </div>

          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h2 style="color: #007F80; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">3. ROTEIRO DE ATENDIMENTO</h2>
            <p style="white-space: pre-wrap;">{{ step3 || 'Não preenchido' }}</p>
            @if (step3Materials) {
              <p style="margin-top: 10px;"><strong>Materiais:</strong> {{ step3Materials }}</p>
            }
          </div>

          <div style="margin-bottom: 20px; background: #f5f5f5; padding: 15px; border-radius: 8px;">
            <h2 style="color: #007F80; font-size: 16px; margin-top: 0;">DADOS FINANCEIROS</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0;">Nº de Sessões:</td><td style="text-align: right;">{{ sessionCount }}</td></tr>
              <tr><td style="padding: 5px 0;">Valor por Sessão:</td><td style="text-align: right;">R$ {{ (sessionValue || 0).toFixed(2) }}</td></tr>
              <tr><td style="padding: 5px 0;">Frequência:</td><td style="text-align: right;">{{ frequency }}</td></tr>
              <tr><td style="padding: 5px 0;">Duração:</td><td style="text-align: right;">{{ duration }}</td></tr>
              <tr style="border-top: 2px solid #007F80;"><td style="padding: 10px 0; font-weight: bold; font-size: 16px;">VALOR TOTAL:</td><td style="text-align: right; font-weight: bold; font-size: 16px; color: #007F80;">R$ {{ totalValue().toFixed(2) }}</td></tr>
            </table>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px;">
            <p>Documento gerado por EduPsych Pro</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .hidden { position: absolute; left: -9999px; top: -9999px; }
  `]
})
export class PlanoFormComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @ViewChild('pdfTemplate') pdfTemplate!: ElementRef;

  patients = signal<any[]>([]);
  isEdit = false;
  planId = '';
  saving = signal(false);
  currentStep = signal(1);

  selectedPatientId = '';
  planDate = new Date().toISOString().split('T')[0];
  status = 'RASCUNHO';

  step1 = '';
  step1Notes = '';
  step2 = '';
  step2Criteria = '';
  step3 = '';
  step3Materials = '';

  sessionCount = 12;
  sessionValue = 0;
  frequency = '2x por semana';
  duration = '50 min';

  steps = [
    { num: 1, label: 'Avaliação' },
    { num: 2, label: 'Habilidades' },
    { num: 3, label: 'Roteiro' }
  ];

  ngOnInit() {
    this.api.get('/pacientes').subscribe((res: any) => this.patients.set(res.data || []));
    
    this.planId = this.route.snapshot.paramMap.get('id') || '';
    this.isEdit = !!this.planId;

    if (this.isEdit) {
      this.api.get(`/intervention-plans/${this.planId}`).subscribe((res: any) => {
        this.selectedPatientId = res.pacienteId || '';
        this.planDate = res.date || '';
        this.status = res.status || 'RASCUNHO';
        this.step1 = res.step1 || '';
        this.step2 = res.step2 || '';
        this.step3 = res.step3 || '';
        this.sessionCount = res.sessionCount || 0;
        this.sessionValue = parseFloat(res.sessionValue) || 0;
        this.frequency = res.frequency || '2x por semana';
        this.duration = res.duration || '50 min';
      });
    }
  }

  calculateTotal() {
    // totalValue is computed dynamically
  }

  totalValue(): number {
    return (this.sessionCount || 0) * (this.sessionValue || 0);
  }

  getPatientName(): string {
    const p = this.patients().find((p: any) => p.id === this.selectedPatientId);
    return p?.name || 'Não selecionado';
  }

  save() {
    if (!this.selectedPatientId) return;
    this.saving.set(true);

    const data = {
      pacienteId: this.selectedPatientId,
      professionalId: '',
      date: this.planDate,
      step1: this.step1,
      step2: this.step2,
      step3: this.step3,
      sessionCount: this.sessionCount,
      sessionValue: this.sessionValue.toString(),
      totalValue: this.totalValue().toString(),
      frequency: this.frequency,
      duration: this.duration,
      status: this.status
    };

    const req = this.isEdit
      ? this.api.put(`/intervention-plans/${this.planId}`, data)
      : this.api.post('/intervention-plans', data);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/planos']);
      },
      error: () => {
        this.saving.set(false);
        alert('Erro ao salvar plano');
      }
    });
  }

  exportPdf() {
    const element = this.pdfTemplate?.nativeElement;
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `plano_intervencao_${this.getPatientName().replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  }
}
