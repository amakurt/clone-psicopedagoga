import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@env/environment';

@Component({
  selector: 'app-public-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#007F80] p-6 flex items-center justify-center">
      <div class="bg-white rounded-[20px] shadow-2xl w-full max-w-xl overflow-hidden my-8 legacy-card">
        @if (loading()) {
          <div class="p-12 text-center">
            <p class="text-slate-400 text-sm">Carregando formulário...</p>
          </div>
        } @else if (error()) {
          <div class="p-12 text-center">
            <div class="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
              <span class="material-icons text-red-500 text-3xl">error_outline</span>
            </div>
            <h2 class="text-xl font-black text-slate-900">Formulário indisponível</h2>
            <p class="text-sm text-slate-500 mt-2">{{ error() }}</p>
          </div>
        } @else if (submitted()) {
          <div class="p-12 text-center">
            <div class="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <span class="material-icons text-emerald-500 text-3xl">check_circle</span>
            </div>
            <h2 class="text-xl font-black text-slate-900">Formulário enviado!</h2>
            <p class="text-sm text-slate-500 mt-2">Obrigado por responder. Suas informações foram enviadas com sucesso.</p>
          </div>
        } @else {
          <div class="p-8">
            <div class="flex items-center gap-3 mb-1">
              <span class="material-icons text-primary text-3xl">psychology</span>
              <span class="text-xs font-bold uppercase tracking-widest text-slate-400">EduPsych Pro</span>
            </div>
            <h1 class="text-2xl font-black text-slate-900 mt-2">{{ form()?.title }}</h1>
            @if (form()?.description) {
              <p class="text-sm text-slate-500 mt-2 whitespace-pre-wrap">{{ form()?.description }}</p>
            }
            @if (form()?.responsibleName) {
              <p class="text-xs text-slate-400 mt-3">Solicitado para: <strong>{{ form()?.responsibleName }}</strong></p>
            }
            @if (form()?.dueDate) {
              <p class="text-xs text-slate-400 mt-1">Prazo: {{ form()?.dueDate | date:'dd/MM/yyyy' }}</p>
            }
          </div>

          <div class="px-8 pb-8">
            @if (formError()) {
              <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{{ formError() }}</div>
            }
            <form (ngSubmit)="submit()">
              @for (f of form()?.fields || []; track f.id) {
                <div class="mb-5">
                  <label class="block text-sm font-semibold text-slate-700 mb-1.5">
                    {{ f.label }} @if (f.required) { <span class="text-red-500">*</span> }
                  </label>

                  <!-- text -->
                  @if (f.type === 'text') {
                    <input class="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:border-primary"
                      [(ngModel)]="answers[f.id]" [ngModelOptions]="{standalone: true}" type="text">
                  }
                  <!-- number -->
                  @if (f.type === 'number') {
                    <input class="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:border-primary"
                      [(ngModel)]="answers[f.id]" [ngModelOptions]="{standalone: true}" type="number">
                  }
                  <!-- date -->
                  @if (f.type === 'date') {
                    <input class="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:border-primary"
                      [(ngModel)]="answers[f.id]" [ngModelOptions]="{standalone: true}" type="date">
                  }
                  <!-- textarea -->
                  @if (f.type === 'textarea') {
                    <textarea class="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:border-primary"
                      [(ngModel)]="answers[f.id]" [ngModelOptions]="{standalone: true}" rows="3"></textarea>
                  }
                  <!-- select -->
                  @if (f.type === 'select') {
                    <select class="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:border-primary bg-white"
                      [(ngModel)]="answers[f.id]" [ngModelOptions]="{standalone: true}">
                      <option value="">Selecione...</option>
                      @for (opt of f.options || []; track $index) { <option [value]="opt">{{ opt }}</option> }
                    </select>
                  }
                  <!-- radio -->
                  @if (f.type === 'radio') {
                    <div class="space-y-2">
                      @for (opt of f.options || []; track $index) {
                        <label class="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="radio" [name]="f.id" [value]="opt"
                            [checked]="answers[f.id] === opt"
                            (change)="answers[f.id] = opt" class="accent-[#1E1B4B]">
                          {{ opt }}
                        </label>
                      }
                    </div>
                  }
                  <!-- checkbox -->
                  @if (f.type === 'checkbox') {
                    <label class="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" [(ngModel)]="answers[f.id]" [ngModelOptions]="{standalone: true}" class="rounded accent-[#1E1B4B]">
                      Marcar
                    </label>
                  }
                </div>
              }

              <button class="w-full py-3.5 bg-primary hover:opacity-90 text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
                type="submit" [disabled]="sending()">
                {{ sending() ? 'Enviando...' : 'Enviar Formulário' }}
              </button>
            </form>
          </div>
        }
      </div>
    </div>
  `,
})
export class PublicFormComponent implements OnInit {
  private route = inject(ActivatedRoute);

  form = signal<any>(null);
  answers: Record<string, any> = {};
  loading = signal(true);
  sending = signal(false);
  submitted = signal(false);
  error = signal('');
  formError = signal('');

  private token = '';

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    fetch(`${environment.apiUrl}/document-requests/public/${this.token}`)
      .then(res => res.json().then((d: any) => ({ ok: res.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.error || 'Formulário não encontrado');
        this.form.set(d);
        this.loading.set(false);
      })
      .catch(err => {
        this.error.set(err.message || 'Formulário indisponível');
        this.loading.set(false);
      });
  }

  submit() {
    this.formError.set('');
    const required = (this.form()?.fields || []).filter((f: any) => f.required);
    for (const f of required) {
      const v = this.answers[f.id];
      if (v === undefined || v === '' || v === null) {
        this.formError.set(`Preencha o campo obrigatório: ${f.label}`);
        return;
      }
    }

    this.sending.set(true);
    fetch(`${environment.apiUrl}/document-requests/public/${this.token}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: this.answers }),
    })
      .then(res => res.json().then((d: any) => ({ ok: res.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.error || 'Erro ao enviar');
        this.sending.set(false);
        this.submitted.set(true);
      })
      .catch(err => {
        this.formError.set(err.message || 'Erro ao enviar formulário');
        this.sending.set(false);
      });
  }
}