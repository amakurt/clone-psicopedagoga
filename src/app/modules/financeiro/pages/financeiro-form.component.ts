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
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white">
              {{ isEdit ? 'Editar' : 'Nova' }} {{ form.type === 'despesa' ? 'Despesa / Conta a Pagar' : 'Transação' }}
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {{ form.type === 'despesa' ? 'Controle de gastos, boletos e contas a pagar da clínica' : 'Registre cobranças e faturamentos clínicos' }}
            </p>
          </div>
          <a routerLink="/app/financeiro" class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <span class="material-icons text-lg">arrow_back</span> Voltar
          </a>
        </div>

        <!-- Form Card -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
          <div class="p-6 sm:p-8 space-y-5">
            <!-- Tipo Selector (Pills) -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tipo de Operação *</label>
              <div class="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button type="button" (click)="form.type = 'receita'"
                  class="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                  [class]="form.type === 'receita' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'">
                  <span class="material-icons text-lg">trending_up</span>
                  Receita (Entrada)
                </button>
                <button type="button" (click)="form.type = 'despesa'"
                  class="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                  [class]="form.type === 'despesa' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'">
                  <span class="material-icons text-lg">trending_down</span>
                  Despesa / Conta a Pagar
                </button>
              </div>
            </div>

            <!-- Se for Despesa: Descrição / Favorecido e Categoria -->
            @if (form.type === 'despesa') {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Descrição / Favorecido *</label>
                  <input type="text" [(ngModel)]="form.description" placeholder="Ex: Aluguel sala 204, Enel Energia..."
                    class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none">
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Categoria da Despesa</label>
                  <select [(ngModel)]="form.category"
                    class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none">
                    <option value="">Selecione uma categoria</option>
                    <option value="ALUGUEL">🏢 Aluguel & Condomínio</option>
                    <option value="ENERGIA_AGUA">⚡ Energia, Água & Gás</option>
                    <option value="INTERNET_TELEFONE">📶 Internet & Telefonia</option>
                    <option value="MATERIAIS">🎨 Materiais Didáticos & Pedagógicos</option>
                    <option value="SOFTWARE">💻 Softwares & Assinaturas</option>
                    <option value="MANUTENCAO">🧹 Limpeza & Manutenção</option>
                    <option value="IMPOSTOS">📋 Impostos & Contabilidade</option>
                    <option value="SALARIOS">💼 Honorários & Salários</option>
                    <option value="OUTROS">📦 Outras Despesas</option>
                  </select>
                </div>
              </div>
            }

            <!-- Se for Receita: Paciente -->
            @if (form.type === 'receita') {
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Paciente *</label>
                <select class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  [(ngModel)]="form.pacienteId">
                  <option value="">Selecione o paciente</option>
                  @for (p of pacientes(); track p.id) {
                    <option [value]="p.id">{{ p.name }}</option>
                  }
                </select>
              </div>
            }

            <!-- Paciente Vinculado Opcional para Despesa -->
            @if (form.type === 'despesa') {
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Paciente Vinculado (Opcional)</label>
                <select class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  [(ngModel)]="form.pacienteId">
                  <option value="">Nenhum (Gasto geral da clínica)</option>
                  @for (p of pacientes(); track p.id) {
                    <option [value]="p.id">{{ p.name }}</option>
                  }
                </select>
                <p class="text-[11px] text-slate-400 mt-1">Preencha apenas se este custo foi adquirido especificamente para o tratamento deste paciente.</p>
              </div>
            }

            <!-- Valor e Status -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Valor (R$) *</label>
                <input class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  type="number" step="0.01" [(ngModel)]="form.value" placeholder="0,00">
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Status *</label>
                <select class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  [(ngModel)]="form.status">
                  <option value="pendente">{{ form.type === 'despesa' ? 'A Pagar (Pendente)' : 'Pendente (A Receber)' }}</option>
                  <option value="pago">Pago (Liquidado)</option>
                  <option value="atrasado">Atrasado / Vencido</option>
                </select>
              </div>
            </div>

            <!-- Datas e Forma de Pagamento -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {{ form.type === 'despesa' ? 'Data de Vencimento' : 'Data da Transação' }} *
                </label>
                <input class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  type="date" [(ngModel)]="form.date">
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Forma de Pagamento</label>
                <select class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  [(ngModel)]="form.paymentMethod">
                  <option value="">Selecione (Opcional)</option>
                  <option value="BOLETO">Boleto Bancário</option>
                  <option value="PIX">PIX</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de Débito</option>
                  <option value="TRANSFERENCIA">Transferência / TED</option>
                  <option value="DINHEIRO">Dinheiro</option>
                </select>
              </div>
            </div>

            <!-- Observações (se for Receita) -->
            @if (form.type === 'receita') {
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Observações / Descrição</label>
                <textarea class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none"
                  rows="3" [(ngModel)]="form.description" placeholder="Anotações opcionais..."></textarea>
              </div>
            }
          </div>

          <!-- Footer Buttons -->
          <div class="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <a routerLink="/app/financeiro" class="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-100 transition-all">
              Cancelar
            </a>
            <button class="px-6 py-2.5 text-sm font-bold text-white rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50"
              [class]="form.type === 'despesa' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'"
              (click)="save()" [disabled]="saving()">
              {{ saving() ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Salvar Transação') }}
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
    pacienteId: '',
    date: new Date().toISOString().substring(0, 10),
    dataVencimento: new Date().toISOString().substring(0, 10),
    value: '',
    type: 'receita',
    status: 'pendente',
    category: '',
    fornecedor: '',
    paymentMethod: '',
    description: ''
  };

  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.id;

    // Check query params (e.g. /app/financeiro/novo?type=despesa)
    const typeParam = this.route.snapshot.queryParams['type'];
    if (typeParam === 'despesa') {
      this.form.type = 'despesa';
    }

    this.api.get('/pacientes').subscribe((res: any) => this.pacientes.set(res.data || []));

    if (this.isEdit) {
      this.api.get(`/financeiro/${this.id}`).subscribe((res: any) => {
        if (res) {
          this.form = {
            ...res,
            date: res.date ? new Date(res.date).toISOString().substring(0, 10) : '',
            dataVencimento: res.dataVencimento ? new Date(res.dataVencimento).toISOString().substring(0, 10) : '',
          };
        }
      });
    }
  }

  save() {
    if (this.form.type === 'receita') {
      if (!this.form.pacienteId) return this.toast.warning('Selecione um paciente para a receita');
    } else {
      if (!this.form.description?.trim()) return this.toast.warning('Informe a descrição ou favorecido da despesa');
    }

    if (!this.form.date) return this.toast.warning('Informe a data');
    if (!this.form.value || Number(this.form.value) <= 0) return this.toast.warning('Informe um valor válido');
    if (!this.form.type) return this.toast.warning('Selecione o tipo');
    if (!this.form.status) return this.toast.warning('Selecione o status');

    const payload = {
      ...this.form,
      fornecedor: this.form.description,
      dataVencimento: this.form.type === 'despesa' ? this.form.date : null,
    };

    this.saving.set(true);
    const obs = this.isEdit ? this.api.put(`/financeiro/${this.id}`, payload) : this.api.post('/financeiro', payload);
    obs.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Transação atualizada com sucesso!' : 'Lançamento registrado com sucesso!');
        this.router.navigate(['/app/financeiro']);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erro ao salvar transação');
      }
    });
  }
}

