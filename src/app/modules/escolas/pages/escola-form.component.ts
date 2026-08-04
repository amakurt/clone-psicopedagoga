import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EscolasService } from '../services/escolas.service';
import { AddressFormComponent, Address } from '@core/components/address-form.component';
import { PhoneInputComponent, PhoneNumber } from '@core/components/phone-input.component';

@Component({
  selector: 'app-escola-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AddressFormComponent, PhoneInputComponent],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/app/escolas" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <span class="material-icons text-gray-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ isEdit ? 'Editar' : 'Nova' }} Escola</h1>
            <p class="text-sm text-gray-500 dark:text-slate-400">Cadastro de instituição de ensino</p>
          </div>
        </div>
        <button (click)="save()" [disabled]="saving() || !form.name"
          class="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center gap-2">
          <span class="material-icons">save</span>
          {{ saving() ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>

      <!-- Form -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Informações da Escola</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Nome *</label>
            <input [(ngModel)]="form.name" 
              class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Nome da escola">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Níveis de Ensino</label>
            <div class="flex flex-wrap gap-2">
              @for (level of levelOptions; track level.value) {
                <label class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all"
                  [class]="isLevelSelected(level.value) ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300'">
                  <input type="checkbox" [checked]="isLevelSelected(level.value)" (change)="toggleLevel(level.value)" class="hidden">
                  <span class="material-icons text-[16px]">{{ isLevelSelected(level.value) ? 'check_box' : 'check_box_outline_blank' }}</span>
                  {{ level.label }}
                </label>
              }
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Status</label>
            <select [(ngModel)]="form.status" 
              class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              <option value="Ativa">Ativa</option>
              <option value="Inativa">Inativa</option>
            </select>
          </div>
          <div>
            <app-phone-input 
              [phone]="form.phone" 
              [isWhatsApp]="form.phoneIsWhatsApp"
              label="Telefone"
              (phoneChange)="onPhoneChange($event)">
            </app-phone-input>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Email de Contato</label>
            <input [(ngModel)]="form.contactEmail" type="email"
              class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="contato@escola.com">
          </div>
        </div>
      </div>

      <!-- Address -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
        <app-address-form 
          [address]="form.address" 
          label="Endereço da Escola"
          (addressChange)="onAddressChange($event)">
        </app-address-form>
      </div>

      <!-- Notes -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Observações</h3>
        <textarea [(ngModel)]="form.notes" rows="3"
          class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Observações sobre a escola..."></textarea>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class EscolaFormComponent implements OnInit {
  private service = inject(EscolasService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  id = '';
  saving = signal(false);

  levelOptions = [
    { value: 'EDUCACAO_INFANTIL', label: 'Educação Infantil' },
    { value: 'ANOS_INICIAIS', label: 'Anos Iniciais (1º ao 5º)' },
    { value: 'ANOS_FINAIS', label: 'Anos Finais (6º ao 9º)' },
    { value: 'ENSINO_MEDIO', label: 'Ensino Médio' },
    { value: 'SUPERIOR', label: 'Superior' },
    { value: 'PROFISSIONALIZANTE', label: 'Profissionalizante' },
  ];

  form: any = {
    name: '',
    levels: [],
    status: 'Ativa',
    phone: '',
    phoneIsWhatsApp: false,
    contactEmail: '',
    notes: '',
    address: {
      cep: '',
      street: '',
      neighborhood: '',
      number: '',
      complement: '',
      city: '',
      state: ''
    }
  };

  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.id;

    if (this.isEdit) {
      this.service.get(this.id).subscribe((res: any) => {
        let levels: string[] = [];
        if (res.levels) {
          try {
            levels = JSON.parse(res.levels);
          } catch {
            levels = res.levels ? [res.levels] : [];
          }
        }
        this.form = {
          ...this.form,
          ...res,
          levels,
          address: res.address || this.form.address
        };
      });
    }
  }

  isLevelSelected(level: string): boolean {
    return this.form.levels.includes(level);
  }

  toggleLevel(level: string) {
    const index = this.form.levels.indexOf(level);
    if (index === -1) {
      this.form.levels.push(level);
    } else {
      this.form.levels.splice(index, 1);
    }
  }

  onAddressChange(address: Address) {
    this.form.address = address;
  }

  onPhoneChange(phone: PhoneNumber) {
    this.form.phone = phone.number;
    this.form.phoneIsWhatsApp = phone.isWhatsApp;
  }

  save() {
    if (!this.form.name) return;
    this.saving.set(true);

    const data = {
      ...this.form,
      levels: JSON.stringify(this.form.levels),
      cep: this.form.address.cep,
      street: this.form.address.street,
      neighborhood: this.form.address.neighborhood,
      number: this.form.address.number,
      complement: this.form.address.complement,
      city: this.form.address.city,
      state: this.form.address.state,
    };
    delete data.address;

    const obs = this.isEdit ? this.service.update(this.id, data) : this.service.create(data);
    obs.subscribe({
      next: () => this.router.navigate(['/app/escolas']),
      error: () => {
        this.saving.set(false);
        alert('Erro ao salvar escola');
      }
    });
  }
}
