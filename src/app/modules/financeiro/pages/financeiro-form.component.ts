import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-financeiro-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-2xl mx-auto">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ isEdit ? 'Editar' : 'Nova' }} Transação</h1>
            <p class="text-sm text-gray-500 mt-1">{{ isEdit ? 'Atualize os dados da transação' : 'Registre uma nova transação financeira' }}</p>
          </div>
          <a routerLink="/app/financeiro" class="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <span class="material-icons text-lg">arrow_back</span> Voltar
          </a>
        </div>

        <div class="bg-white rounded-2xl shadow-sm">
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
              <select class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                [(ngModel)]="form.pacienteId">
                <option value="">Selecione o paciente</option>
                @for (p of pacientes(); track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="date" [(ngModel)]="form.date">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
                <input class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number" step="0.01" [(ngModel)]="form.value" placeholder="0,00">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [(ngModel)]="form.type">
                  <option value="">Selecione</option>
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [(ngModel)]="form.status">
                  <option value="">Selecione</option>
                  <option value="pago">Pago</option>
                  <option value="pendente">Pendente</option>
                  <option value="atrasado">Atrasado</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3" [(ngModel)]="form.description" placeholder="Descrição da transação..."></textarea>
            </div>
          </div>

          <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
            <a routerLink="/app/financeiro" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancelar</a>
            <button class="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              (click)="save()" [disabled]="saving()">
              {{ saving() ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class FinanceiroFormComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  isEdit = false;
  id = '';
  saving = signal(false);
  pacientes = signal<any[]>([]);

  form: any = {
    pacienteId: '', date: '', value: '', type: '', status: '', description: ''
  };

  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.id;

    this.api.get('/pacientes').subscribe((res: any) => this.pacientes.set(res.data || []));

    if (this.isEdit) {
      this.api.get(`/financeiro/${this.id}`).subscribe((res: any) => this.form = res);
    }
  }

  save() {
    if (!this.form.pacienteId) return this.toast.warning('Selecione um paciente');
    if (!this.form.date) return this.toast.warning('Informe a data');
    if (!this.form.value) return this.toast.warning('Informe o valor');
    if (!this.form.type) return this.toast.warning('Selecione o tipo');
    if (!this.form.status) return this.toast.warning('Selecione o status');

    this.saving.set(true);
    const obs = this.isEdit ? this.api.put(`/financeiro/${this.id}`, this.form) : this.api.post('/financeiro', this.form);
    obs.subscribe({
      next: () => this.router.navigate(['/app/financeiro']),
      error: () => { this.saving.set(false); this.toast.error('Erro ao salvar'); }
    });
  }
}
