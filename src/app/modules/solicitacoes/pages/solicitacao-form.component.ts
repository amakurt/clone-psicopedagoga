import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SolicitacoesService } from '../services/solicitacoes.service';
import { ApiService } from '@core/services/api.service';

let fieldCounter = 1;

const FIELD_TYPES = [
  { type: 'text', label: 'Texto', icon: 'short_text' },
  { type: 'textarea', label: 'Texto longo', icon: 'notes' },
  { type: 'number', label: 'Número', icon: 'pin' },
  { type: 'date', label: 'Data', icon: 'event' },
  { type: 'select', label: 'Lista suspensa', icon: 'arrow_drop_down_circle' },
  { type: 'radio', label: 'Escolha única', icon: 'radio_button_checked' },
  { type: 'checkbox', label: 'Caixa de seleção', icon: 'check_box' },
];

@Component({
  selector: 'app-solicitacao-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button (click)="router.navigate(['/app/solicitacoes'])" class="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <span class="material-icons">arrow_back</span>
        </button>
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Nova Solicitação</h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Monte o formulário que o responsável vai preencher</p>
        </div>
      </div>

      @if (error()) {
        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
          <span class="material-icons text-lg">error</span> {{ error() }}
        </div>
      }

      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Título do formulário *</label>
            <input class="w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600"
              [(ngModel)]="title" name="title" placeholder="Ex.: Questionário de Anamnese, Autorização, Rotina...">
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mensagem para o responsável</label>
            <textarea class="w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600"
              [(ngModel)]="description" name="description" rows="2" placeholder="Instruções para o preenchimento"></textarea>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Responsável *</label>
            <select class="w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600"
              [(ngModel)]="responsibleId" name="responsibleId">
              <option value="">Selecione...</option>
              @for (r of responsaveis(); track r.id) {
                <option [value]="r.id">{{ r.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Paciente (opcional)</label>
            <select class="w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600"
              [(ngModel)]="patientId" name="patientId">
              <option value="">Selecione...</option>
              @for (p of pacientes(); track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Prazo de validade</label>
            <input class="w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600"
              type="date" [(ngModel)]="dueDate" name="dueDate">
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Enviar link por</label>
            <select class="w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600"
              [(ngModel)]="sendVia" name="sendVia">
              <option value="LINK">Só gerar link</option>
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-slate-900 dark:text-white">Campos do formulário</h2>
          <span class="text-xs text-slate-400">{{ fields().length }} campo(s)</span>
        </div>

        @if (fields().length === 0) {
          <p class="text-sm text-slate-400 text-center py-8">Nenhum campo adicionado ainda</p>
        }

        <div class="space-y-3">
          @for (f of fields(); track f.id; let i = $index) {
            <div class="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <span class="material-icons text-slate-400">{{ iconOf(f.type) }}</span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <input class="flex-1 px-3 py-1.5 border rounded-lg text-sm font-semibold outline-none bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    [(ngModel)]="f.label" [ngModelOptions]="{standalone: true}" placeholder="Pergunta">
                  <select class="px-2 py-1.5 border rounded-lg text-xs outline-none bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    [(ngModel)]="f.type" [ngModelOptions]="{standalone: true}" (ngModelChange)="onTypeChange(f)">
                    @for (t of FIELD_TYPES; track t.type) { <option [value]="t.type">{{ t.label }}</option> }
                  </select>
                  <button class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    (click)="toggleRequired(f)" [title]="f.required ? 'Obrigatório' : 'Opcional'">
                    <span class="material-icons text-base" [class.text-red-500]="f.required">star</span>
                  </button>
                  <button class="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    (click)="removeField(i)">
                    <span class="material-icons text-base">delete</span>
                  </button>
                </div>
                @if (f.type === 'select' || f.type === 'radio') {
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    @for (opt of f.options; track $index) {
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs">
                        {{ opt }}
                        <button (click)="removeOption(f, $index)" class="text-slate-400 hover:text-red-500">✕</button>
                      </span>
                    }
                    <input class="w-36 px-2 py-1 border rounded-lg text-xs outline-none bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600"
                      [ngModel]="f.newOption" (keydown.enter)="addOption(f); $event.preventDefault()" (blur)="addOption(f)"
                      [ngModelOptions]="{standalone: true}" placeholder="+ opção e Enter">
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          @for (t of FIELD_TYPES; track t.type) {
            <button class="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary transition-all"
              (click)="addField(t.type)">
              <span class="material-icons text-base">{{ t.icon }}</span> {{ t.label }}
            </button>
          }
        </div>
      </div>

      <div class="flex gap-3">
        <button class="flex-1 py-3.5 bg-primary hover:opacity-90 text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
          [disabled]="saving()" (click)="save()">
          {{ saving() ? 'Criando...' : 'Criar Solicitação' }}
        </button>
      </div>
    </div>
  `,
})
export class SolicitacaoFormComponent implements OnInit {
  private service = inject(SolicitacoesService);
  private api = inject(ApiService);
  router = inject(Router);

  title = '';
  description = '';
  responsibleId = '';
  patientId = '';
  dueDate = '';
  sendVia = 'LINK';
  fields = signal<any[]>([]);
  responsaveis = signal<any[]>([]);
  pacientes = signal<any[]>([]);
  saving = signal(false);
  error = signal('');
  FIELD_TYPES = FIELD_TYPES;

  ngOnInit() {
    this.api.get('/responsaveis').subscribe({
      next: (res: any) => { const list = res.data || res || []; this.responsaveis.set(list); },
      error: () => {},
    });
    this.api.get('/pacientes', { limit: 500 }).subscribe({
      next: (res: any) => { const list = res.data || res || []; this.pacientes.set(list); },
      error: () => {},
    });
  }

  iconOf(type: string) {
    return FIELD_TYPES.find(t => t.type === type)?.icon || 'short_text';
  }

  addField(type: string) {
    this.fields.update(fs => [...fs, { id: `f${fieldCounter++}`, type, label: '', required: false, options: type === 'select' || type === 'radio' ? [] : undefined, newOption: '' }]);
  }

  removeField(i: number) {
    this.fields.update(fs => fs.filter((_, idx) => idx !== i));
  }

  toggleRequired(f: any) {
    f.required = !f.required;
  }

  onTypeChange(f: any) {
    if ((f.type === 'select' || f.type === 'radio') && !f.options) f.options = [];
  }

  addOption(f: any) {
    const val = (f.newOption || '').trim();
    if (val && !f.options.includes(val)) {
      f.options.push(val);
    }
    f.newOption = '';
  }

  removeOption(f: any, i: number) {
    f.options.splice(i, 1);
  }

  save() {
    this.error.set('');
    if (!this.title.trim()) { this.error.set('Informe o título do formulário'); return; }
    if (!this.responsibleId) { this.error.set('Selecione o responsável'); return; }
    const cleanFields = this.fields().filter(f => f.label.trim());
    if (cleanFields.length === 0) { this.error.set('Adicione pelo menos um campo com pergunta'); return; }

    this.saving.set(true);
    this.service.create({
      title: this.title.trim(),
      description: this.description.trim(),
      responsibleId: this.responsibleId,
      patientId: this.patientId || undefined,
      dueDate: this.dueDate || undefined,
      sendVia: this.sendVia,
      fields: cleanFields.map(f => ({
        id: f.id,
        type: f.type,
        label: f.label.trim(),
        required: !!f.required,
        options: f.options?.length ? f.options : undefined,
      })),
    }).subscribe({
      next: (res: any) => {
        const id = res.doc?.id;
        this.router.navigate([id ? '/app/solicitacoes/' + id : '/app/solicitacoes']);
      },
      error: (err: any) => {
        this.error.set(err.error?.error || 'Erro ao criar solicitação');
        this.saving.set(false);
      },
    });
  }
}
