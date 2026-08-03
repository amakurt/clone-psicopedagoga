import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Address {
  cep: string;
  street: string;
  neighborhood: string;
  number: string;
  complement: string;
  city: string;
  state: string;
}

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <h4 class="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
        {{ label }}
      </h4>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- CEP -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">CEP</label>
          <div class="flex gap-2">
            <input 
              [ngModel]="address.cep" 
              (ngModelChange)="onCEPChange($event)"
              class="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="00000-000" 
              maxlength="9"
              [disabled]="loadingCEP()">
            <button 
              (click)="lookupCEP()" 
              [disabled]="loadingCEP() || address.cep.length < 8"
              class="px-4 py-3 bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 rounded-xl transition-all disabled:opacity-50">
              <span class="material-icons text-[20px]" [class.animate-spin]="loadingCEP()">search</span>
            </button>
          </div>
          @if (cepError()) {
            <p class="mt-1 text-xs text-red-500">{{ cepError() }}</p>
          }
        </div>

        <!-- Rua -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Rua / Logradouro</label>
          <input 
            [ngModel]="address.street" 
            (ngModelChange)="updateField('street', $event)"
            class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Rua, Avenida, Travessa...">
        </div>

        <!-- Bairro -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Bairro</label>
          <input 
            [ngModel]="address.neighborhood" 
            (ngModelChange)="updateField('neighborhood', $event)"
            class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Bairro">
        </div>

        <!-- Número -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Número</label>
          <input 
            [ngModel]="address.number" 
            (ngModelChange)="updateField('number', $event)"
            class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Nº">
        </div>

        <!-- Complemento -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Complemento</label>
          <input 
            [ngModel]="address.complement" 
            (ngModelChange)="updateField('complement', $event)"
            class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Apto, Bloco, Sala...">
        </div>

        <!-- Cidade -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Cidade</label>
          <input 
            [ngModel]="address.city" 
            (ngModelChange)="updateField('city', $event)"
            class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Cidade">
        </div>

        <!-- Estado -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Estado</label>
          <select 
            [ngModel]="address.state" 
            (ngModelChange)="updateField('state', $event)"
            class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent">
            <option value="">Selecione</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>
      </div>
    </div>
  `
})
export class AddressFormComponent {
  @Input() address: Address = { cep: '', street: '', neighborhood: '', number: '', complement: '', city: '', state: '' };
  @Input() label = 'Endereço';
  @Output() addressChange = new EventEmitter<Address>();

  loadingCEP = signal(false);
  cepError = signal('');

  constructor(private http: HttpClient) {}

  onCEPChange(value: string) {
    const formatted = this.formatCEP(value);
    this.updateField('cep', formatted);
    
    if (formatted.length === 9) {
      this.lookupCEP();
    }
  }

  formatCEP(value: string): string {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  }

  lookupCEP() {
    const cep = this.address.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      this.cepError.set('CEP deve ter 8 dígitos');
      return;
    }

    this.loadingCEP.set(true);
    this.cepError.set('');

    this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`)
      .subscribe({
        next: (data) => {
          if (data.erro) {
            this.cepError.set('CEP não encontrado');
          } else {
            this.addressChange.emit({
              ...this.address,
              street: data.logradouro || this.address.street,
              neighborhood: data.bairro || this.address.neighborhood,
              city: data.localidade || this.address.city,
              state: data.uf || this.address.state,
            });
          }
          this.loadingCEP.set(false);
        },
        error: () => {
          this.cepError.set('Erro ao buscar CEP');
          this.loadingCEP.set(false);
        }
      });
  }

  updateField(field: keyof Address, value: string) {
    this.addressChange.emit({
      ...this.address,
      [field]: value
    });
  }
}
