import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ResponsaveisService } from '../services/responsaveis.service';
import { PhoneInputComponent, PhoneNumber } from '@core/components/phone-input.component';
import { AddressFormComponent, Address } from '@core/components/address-form.component';
import { PacientesService } from '../../pacientes/services/pacientes.service';

@Component({
  selector: 'app-responsavel-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PhoneInputComponent, AddressFormComponent],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/app/responsaveis" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <span class="material-icons text-gray-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ isEdit ? 'Editar' : 'Novo' }} Responsável</h1>
            <p class="text-sm text-gray-500 dark:text-slate-400">Dados do responsável pelo paciente</p>
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
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Dados Pessoais</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Nome *</label>
            <input [(ngModel)]="form.name" 
              class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Nome completo">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Parentesco</label>
            <select [(ngModel)]="form.relationship" 
              class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              <option value="">Selecione</option>
              <option value="Mãe">Mãe</option>
              <option value="Pai">Pai</option>
              <option value="Avó/Avô">Avó/Avô</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">CPF</label>
            <input [(ngModel)]="form.cpf" 
              class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="000.000.000-00" maxlength="14">
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Email</label>
            <input [(ngModel)]="form.email" type="email"
              class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="email@exemplo.com">
          </div>
        </div>
      </div>

      <!-- Pacientes Vinculados -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Pacientes Vinculados</h3>
          <div class="flex gap-2">
            <button type="button" class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
              (click)="showLinkPacienteModal.set(true)">
              <span class="material-icons text-[18px]">link</span>
              <span class="text-sm font-medium">Vincular Existente</span>
            </button>
            <button type="button" class="px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all flex items-center gap-2"
              (click)="showNewPacienteModal.set(true)">
              <span class="material-icons text-[18px]">person_add</span>
              <span class="text-sm font-medium">Novo Paciente</span>
            </button>
          </div>
        </div>

        @if (selectedPacientes().length > 0) {
          <div class="space-y-2">
            @for (p of selectedPacientes(); track p.id) {
              <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span class="material-icons text-primary text-sm">person</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ p.name }}</p>
                  <p class="text-xs text-gray-500">{{ p.grade || 'Sem série' }} • {{ p.phone || 'Sem telefone' }}</p>
                </div>
                <button type="button" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  (click)="removePaciente(p.id)">
                  <span class="material-icons text-[18px]">close</span>
                </button>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-6 bg-gray-50 dark:bg-slate-700 rounded-xl">
            <span class="material-icons text-3xl text-gray-300 dark:text-slate-600">people</span>
            <p class="mt-2 text-sm text-gray-500 dark:text-slate-400">Nenhum paciente vinculado</p>
            <p class="text-xs text-gray-400 dark:text-slate-500">Clique em "Vincular Existente" ou "Novo Paciente"</p>
          </div>
        }
      </div>

      <!-- Phone -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
        <app-phone-input 
          [phone]="form.phone" 
          [isWhatsApp]="form.phoneIsWhatsApp"
          label="Telefone"
          (phoneChange)="onPhoneChange($event)">
        </app-phone-input>
      </div>

      <!-- Address -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
        <app-address-form 
          [address]="form.address" 
          label="Endereço"
          (addressChange)="onAddressChange($event)">
        </app-address-form>
      </div>
    </div>

    <!-- Modal Novo Paciente -->
    @if (showNewPacienteModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="showNewPacienteModal.set(false)"></div>
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Novo Paciente</h3>
            <button (click)="showNewPacienteModal.set(false)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
              <input [(ngModel)]="newPaciente.name" 
                class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                placeholder="Nome completo">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Nascimento</label>
                <input [(ngModel)]="newPaciente.birthDate" type="date"
                  class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Série/Ano</label>
                <input [(ngModel)]="newPaciente.grade" 
                  class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                  placeholder="Ex: 3º ano">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
              <input [(ngModel)]="newPaciente.phone" 
                class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                placeholder="(00) 00000-0000" maxlength="15">
            </div>
          </div>
          <div class="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button (click)="showNewPacienteModal.set(false)" 
              class="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
              Cancelar
            </button>
            <button (click)="createPaciente()" [disabled]="!newPaciente.name || savingNewPaciente()"
              class="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium text-sm disabled:opacity-50 transition-all flex items-center gap-2">
              @if (savingNewPaciente()) {
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              }
              {{ savingNewPaciente() ? 'Salvando...' : 'Salvar Paciente' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Vincular Paciente Existente -->
    @if (showLinkPacienteModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="showLinkPacienteModal.set(false)"></div>
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Vincular Paciente Existente</h3>
            <button (click)="showLinkPacienteModal.set(false)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="p-6">
            <div class="relative mb-4">
              <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input [(ngModel)]="pacienteSearch" (input)="filterPacientes()"
                class="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                placeholder="Buscar por nome, telefone...">
            </div>
            
            @if (filteredPacientes().length > 0) {
              <div class="space-y-2 max-h-64 overflow-y-auto">
                @for (p of filteredPacientes(); track p.id) {
                  <button type="button" class="w-full p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl transition-colors flex items-center gap-3 border border-slate-200 dark:border-slate-600"
                    (click)="linkPaciente(p)">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span class="material-icons text-primary text-sm">person</span>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-slate-900 dark:text-white">{{ p.name }}</p>
                      <p class="text-xs text-slate-500">{{ p.grade || 'Sem série' }} • {{ p.phone || 'Sem telefone' }}</p>
                    </div>
                    <span class="material-icons text-slate-400">add_circle_outline</span>
                  </button>
                }
              </div>
            } @else {
              <div class="text-center py-8">
                <span class="material-icons text-4xl text-slate-300">search_off</span>
                <p class="mt-2 text-sm text-slate-500">{{ pacienteSearch ? 'Nenhum paciente encontrado' : 'Digite para buscar' }}</p>
              </div>
            }
          </div>
          <div class="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button (click)="showLinkPacienteModal.set(false)" 
              class="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
              Fechar
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ResponsavelFormComponent implements OnInit {
  private service = inject(ResponsaveisService);
  private pacientesService = inject(PacientesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  id = '';
  saving = signal(false);
  selectedPacientes = signal<any[]>([]);
  showNewPacienteModal = signal(false);
  savingNewPaciente = signal(false);
  showLinkPacienteModal = signal(false);
  allPacientes = signal<any[]>([]);
  filteredPacientes = signal<any[]>([]);
  pacienteSearch = '';

  newPaciente = {
    name: '',
    birthDate: '',
    grade: '',
    phone: ''
  };

  form: any = {
    name: '',
    relationship: '',
    cpf: '',
    phone: '',
    phoneIsWhatsApp: false,
    email: '',
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

    // Load all patients for linking
    this.pacientesService.list().subscribe((res: any) => {
      const data = res.data || [];
      this.allPacientes.set(data);
      this.filteredPacientes.set(data);
    });

    if (this.isEdit) {
      this.service.get(this.id).subscribe((res: any) => {
        this.form = {
          ...this.form,
          ...res,
          phone: res.phones || res.phone || '',
          address: res.address || this.form.address
        };
        if (res.patients) {
          this.selectedPacientes.set(res.patients);
        }
      });
    }
  }

  onPhoneChange(phone: PhoneNumber) {
    this.form.phone = phone.number;
    this.form.phoneIsWhatsApp = phone.isWhatsApp;
  }

  onAddressChange(address: Address) {
    this.form.address = address;
  }

  removePaciente(id: string) {
    this.selectedPacientes.update(list => list.filter(p => p.id !== id));
  }

  filterPacientes() {
    const search = this.pacienteSearch.toLowerCase();
    if (!search) {
      this.filteredPacientes.set(this.allPacientes());
      return;
    }
    const filtered = this.allPacientes().filter(p => 
      p.name.toLowerCase().includes(search) || 
      p.phone?.includes(search) ||
      p.grade?.toLowerCase().includes(search)
    );
    this.filteredPacientes.set(filtered);
  }

  linkPaciente(paciente: any) {
    // Check if already linked
    if (this.selectedPacientes().some(p => p.id === paciente.id)) {
      alert('Este paciente já está vinculado');
      return;
    }
    this.selectedPacientes.update(list => [...list, paciente]);
    this.showLinkPacienteModal.set(false);
    this.pacienteSearch = '';
  }

  createPaciente() {
    if (!this.newPaciente.name) return;
    this.savingNewPaciente.set(true);

    const data = {
      name: this.newPaciente.name,
      birthDate: this.newPaciente.birthDate,
      grade: this.newPaciente.grade,
      phone: this.newPaciente.phone,
      responsavelId: this.id || null
    };

    this.pacientesService.create(data).subscribe({
      next: (res: any) => {
        this.selectedPacientes.update(list => [...list, res]);
        this.showNewPacienteModal.set(false);
        this.savingNewPaciente.set(false);
        this.resetNewPaciente();
      },
      error: () => {
        this.savingNewPaciente.set(false);
        alert('Erro ao criar paciente');
      }
    });
  }

  resetNewPaciente() {
    this.newPaciente = { name: '', birthDate: '', grade: '', phone: '' };
  }

  save() {
    if (!this.form.name) return;
    this.saving.set(true);

    const pacienteIds = this.selectedPacientes().map(p => p.id);

    const data = {
      ...this.form,
      phones: this.form.phone,
      cep: this.form.address.cep,
      street: this.form.address.street,
      neighborhood: this.form.address.neighborhood,
      number: this.form.address.number,
      complement: this.form.address.complement,
      city: this.form.address.city,
      state: this.form.address.state,
      pacienteIds
    };
    delete data.address;
    delete data.phone;
    delete data.phoneIsWhatsApp;

    const obs = this.isEdit ? this.service.update(this.id, data) : this.service.create(data);
    obs.subscribe({
      next: () => this.router.navigate(['/app/responsaveis']),
      error: () => {
        this.saving.set(false);
        alert('Erro ao salvar responsável');
      }
    });
  }
}
