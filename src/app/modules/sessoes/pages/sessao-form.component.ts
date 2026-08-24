import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SessaoService } from '../services/sessao.service';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';
import { MaterialPickerModalComponent } from '@shared/components/material-picker-modal.component';
import { MateriaisService } from '../../biblioteca/services/materiais.service';
import { MaterialTerapeutico } from '@core/data/materiais-reais.data';

@Component({
  selector: 'app-sessao-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MaterialPickerModalComponent],
  template: `
    <div class="page max-w-4xl mx-auto space-y-6 animate-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">{{ isEdit ? 'Editar' : 'Nova' }} Sessão</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">Agende e planeje os recursos da sessão clínica</p>
        </div>
        <a routerLink="/app/sessoes" class="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl transition-all">
          <span class="material-icons text-xl">arrow_back</span>
        </a>
      </div>

      <!-- Main Form Card -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-8 space-y-6">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Paciente -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paciente *</label>
            <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white"
              [(ngModel)]="form.pacienteId">
              <option value="">Selecione o paciente</option>
              @for (p of pacientes(); track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>

          <!-- Data/Hora -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data e Hora *</label>
            <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white"
              type="datetime-local" [(ngModel)]="form.date">
          </div>

          <!-- Tipo -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Atendimento</label>
            <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white"
              [(ngModel)]="form.tipo">
              <option value="">Selecione o tipo</option>
              <option value="AVALIACAO">Avaliação Diagnóstica</option>
              <option value="SESSAO">Sessão de Intervenção</option>
              <option value="REUNIAO">Reunião / Orientação Familiar</option>
              <option value="ENCAMINHAMENTO">Devolutiva / Encaminhamento</option>
            </select>
          </div>

          <!-- Duração e Valor -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duração (min)</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white"
                type="number" [(ngModel)]="form.duration">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor (R$)</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white"
                type="number" step="0.01" [(ngModel)]="form.valor">
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status da Sessão</label>
            <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white"
              [(ngModel)]="form.status">
              <option value="AGENDADA">Agendada</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          <!-- Objetivo -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Objetivo Principal</label>
            <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white"
              [(ngModel)]="form.objective" placeholder="Ex: Estimulação da consciência fonêmica e rimas">
          </div>
        </div>

        <!-- Seção: Materiais Terapêuticos Vinculados -->
        <div class="pt-6 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="material-icons text-primary text-xl">folder_special</span>
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Materiais Terapêuticos Vinculados</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Recursos clínicos preparados para este atendimento</p>
              </div>
            </div>
            <button type="button" (click)="showPicker.set(true)"
              class="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
              <span class="material-icons text-[16px]">add</span>
              Selecionar Materiais
            </button>
          </div>

          <!-- Lista de Materiais Selecionados -->
          @if (selectedMaterials().length === 0) {
            <div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-400 text-xs">
              <span class="material-icons text-3xl mb-1 opacity-50">auto_stories</span>
              <p>Nenhum material terapêutico anexado a esta sessão ainda.</p>
              <button type="button" (click)="showPicker.set(true)" class="mt-2 text-primary font-bold hover:underline">
                Navegar pelo catálogo de materiais
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              @for (mat of selectedMaterials(); track mat.id) {
                <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {{ mat.subcategory }}
                    </span>
                    <h4 class="font-bold text-xs text-slate-900 dark:text-white mt-1 truncate">{{ mat.name }}</h4>
                    <p class="text-[10px] text-slate-500 mt-0.5">{{ mat.ageRange }} anos · {{ mat.format }}</p>
                  </div>
                  <div class="flex items-center gap-1">
                    <button type="button" (click)="materiaisService.generateMaterialPdf(mat)" title="Baixar PDF"
                      class="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                      <span class="material-icons text-sm">download</span>
                    </button>
                    <button type="button" (click)="removeMaterial(mat.id)" title="Remover"
                      class="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                      <span class="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Observações -->
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Observações / Anotações</label>
          <textarea class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white resize-y"
            rows="3" [(ngModel)]="form.observacoes" placeholder="Observações clínicas ou combinados prévios..."></textarea>
        </div>

        <!-- Actions -->
        <div class="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <a routerLink="/app/sessoes" class="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm transition-all">
            Cancelar
          </a>
          <button class="px-8 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
            (click)="save()" [disabled]="saving()">
            <span class="material-icons text-[18px]">save</span>
            {{ saving() ? 'Salvando...' : 'Salvar Sessão' }}
          </button>
        </div>

      </div>

      <!-- Material Picker Modal -->
      @if (showPicker()) {
        <app-material-picker-modal
          [initialSelectedIds]="getSelectedIds()"
          (confirmed)="onMaterialsConfirmed($event)"
          (closed)="showPicker.set(false)">
        </app-material-picker-modal>
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class SessaoFormComponent implements OnInit {
  private service = inject(SessaoService);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  materiaisService = inject(MateriaisService);

  isEdit = false;
  id = '';
  saving = signal(false);
  pacientes = signal<any[]>([]);
  showPicker = signal(false);
  selectedMaterials = signal<MaterialTerapeutico[]>([]);

  form: any = {
    pacienteId: '',
    date: '',
    tipo: 'SESSAO',
    duration: 50,
    valor: '',
    status: 'AGENDADA',
    objective: '',
    observacoes: '',
    materials: ''
  };

  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.id;

    // Check query params if directed from Materials catalog
    const qPatientId = this.route.snapshot.queryParams['pacienteId'];
    const qMaterialId = this.route.snapshot.queryParams['materialId'];

    if (qPatientId) this.form.pacienteId = qPatientId;
    if (qMaterialId) {
      const mat = this.materiaisService.getById(qMaterialId);
      if (mat) this.selectedMaterials.set([mat]);
    }

    this.api.get('/pacientes').subscribe((res: any) => this.pacientes.set(res.data || res || []));

    if (this.isEdit) {
      this.service.get(this.id).subscribe({
        next: (res: any) => {
          this.form = res;
          this.form.date = res.date ? new Date(res.date).toISOString().slice(0, 16) : '';
          if (res.materials) {
            try {
              const parsed = JSON.parse(res.materials);
              if (Array.isArray(parsed)) {
                // Enrich with full material objects if available
                const enriched = parsed.map((p: any) => this.materiaisService.getById(p.id) || p);
                this.selectedMaterials.set(enriched);
              }
            } catch {
              this.selectedMaterials.set([]);
            }
          }
        }
      });
    }
  }

  getSelectedIds(): number[] {
    return this.selectedMaterials().map(m => m.id);
  }

  onMaterialsConfirmed(mats: MaterialTerapeutico[]) {
    this.selectedMaterials.set(mats);
    this.showPicker.set(false);
  }

  removeMaterial(id: number) {
    this.selectedMaterials.set(this.selectedMaterials().filter(m => m.id !== id));
  }

  save() {
    if (!this.form.pacienteId || !this.form.date) return this.toast.warning('Preencha paciente e data');
    this.saving.set(true);
    this.form.psicopedagogoId = 'system';

    // Serialize materials
    this.form.materials = JSON.stringify(this.selectedMaterials().map(m => ({
      id: m.id,
      name: m.name,
      subcategory: m.subcategory,
      ageRange: m.ageRange,
      format: m.format
    })));

    const obs = this.isEdit ? this.service.update(this.id, this.form) : this.service.create(this.form);
    obs.subscribe({
      next: () => {
        this.toast.success('Sessão salva com sucesso!');
        this.router.navigate(['/app/sessoes']);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erro ao salvar sessão');
      }
    });
  }
}
