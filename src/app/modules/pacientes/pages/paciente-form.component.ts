import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PacientesService } from '../services/pacientes.service';
import { ResponsaveisService } from '../../responsaveis/services/responsaveis.service';
import { EscolasService } from '../../escolas/services/escolas.service';
import { AddressFormComponent, Address } from '@core/components/address-form.component';
import { PhoneInputComponent, PhoneNumber } from '@core/components/phone-input.component';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AddressFormComponent, PhoneInputComponent],
  template: `
    <div class="space-y-8 animate-in">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">{{ isEdit ? 'Editar' : 'Novo' }} Paciente</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ isEdit ? 'Atualize os dados do paciente' : 'Preencha os dados para cadastrar' }}</p>
        </div>
        <a routerLink="/app/pacientes" class="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all">
          <span class="material-icons text-lg">arrow_back</span> Voltar
        </a>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <!-- Avatar Header -->
        <div class="p-8 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-4">
            <div class="size-20 rounded-full flex items-center justify-center text-2xl font-bold text-white cursor-pointer relative overflow-hidden shadow-lg"
              [style.background]="getAvatarColor(form.name)">
              @if (avatarPreview()) {
                <img [src]="avatarPreview()" class="w-full h-full object-cover">
              } @else {
                {{ getInitials(form.name) }}
              }
              <label class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <span class="material-icons text-white text-2xl">camera_alt</span>
                <input type="file" accept="image/*" class="hidden" (change)="onAvatarChange($event)">
              </label>
            </div>
            <div>
              <p class="font-bold text-slate-900 dark:text-white">{{ form.name || 'Nome do Paciente' }}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">Foto do perfil</p>
            </div>
          </div>
        </div>

        <div class="p-8">
          <!-- Dados Pessoais -->
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Dados Pessoais</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div class="md:col-span-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nome Completo *</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                [(ngModel)]="form.name" placeholder="Nome completo">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Data de Nascimento</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                type="date" [(ngModel)]="form.birthDate">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Série/Ano</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                [(ngModel)]="form.grade" placeholder="Ex: 3º ano">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</label>
              <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                [(ngModel)]="form.active">
                <option [value]="true">Ativo</option>
                <option [value]="false">Inativo</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Escola</label>
              <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                [(ngModel)]="form.schoolId">
                <option value="">Selecione a escola</option>
                @for (e of escolas(); track e.id) {
                  <option [value]="e.id">{{ e.name }}</option>
                }
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Responsável</label>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                  <input class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                    [(ngModel)]="responsavelSearch" (input)="filterResponsaveis()" placeholder="Buscar responsável..."
                    (focus)="showResponsavelDropdown.set(true)" (blur)="hideResponsavelDropdown()">
                  @if (showResponsavelDropdown() && filteredResponsaveis().length > 0) {
                    <div class="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 rounded-xl shadow-lg border border-slate-200 dark:border-slate-600 max-h-48 overflow-y-auto">
                      @for (r of filteredResponsaveis(); track r.id) {
                        <button type="button" class="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-3"
                          (mousedown)="selectResponsavel(r)">
                          <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span class="material-icons text-primary text-sm">person</span>
                          </div>
                          <div>
                            <p class="text-sm font-medium text-slate-900 dark:text-white">{{ r.name }}</p>
                            <p class="text-xs text-slate-500">{{ r.phones || r.phone || 'Sem telefone' }}</p>
                          </div>
                        </button>
                      }
                    </div>
                  }
                  @if (form.responsavelId) {
                    <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                      (click)="clearResponsavel()">
                      <span class="material-icons text-[18px]">close</span>
                    </button>
                  }
                </div>
                <button type="button" class="px-4 py-3 bg-primary/10 text-primary rounded-2xl hover:bg-primary/20 transition-all flex items-center gap-2"
                  (click)="showNewResponsavelModal.set(true)">
                  <span class="material-icons text-[20px]">add</span>
                  <span class="text-sm font-medium hidden sm:inline">Novo</span>
                </button>
              </div>
              @if (selectedResponsavel()) {
                <div class="mt-2 p-3 bg-primary/5 rounded-xl flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span class="material-icons text-primary">person</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-slate-900 dark:text-white">{{ selectedResponsavel()?.name }}</p>
                    <p class="text-xs text-slate-500">{{ selectedResponsavel()?.relationship }} • {{ selectedResponsavel()?.phones || selectedResponsavel()?.phone }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Documentos -->
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Documentos</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CPF</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                [value]="form.cpf" (input)="formatCPF($event)" placeholder="000.000.000-00" maxlength="14">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">RG</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                [(ngModel)]="form.rg" placeholder="00.000.000-0">
            </div>
          </div>

          <!-- Código de Acesso -->
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Código de Acesso</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Código</label>
              <div class="flex gap-2">
                <input class="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-mono font-bold text-slate-700 dark:text-slate-300"
                  [value]="form.accessCode || 'Será gerado automaticamente'" readonly>
                <button type="button" class="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-all"
                  (click)="generateAccessCode()">
                  <span class="material-icons text-lg">refresh</span>
                </button>
                <button type="button" class="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-all"
                  (click)="copyAccessCode()" title="Copiar código">
                  <span class="material-icons text-lg">content_copy</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Contato -->
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Contato</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <app-phone-input 
                [phone]="form.phone" 
                [isWhatsApp]="form.phoneIsWhatsApp"
                label="Telefone Principal"
                (phoneChange)="onPhoneChange($event, 'phone')">
              </app-phone-input>
            </div>
            <div>
              <app-phone-input 
                [phone]="form.phone2" 
                [isWhatsApp]="form.phone2IsWhatsApp"
                label="Telefone Secundário"
                (phoneChange)="onPhoneChange($event, 'phone2')">
              </app-phone-input>
            </div>
          </div>

          <!-- Endereço -->
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Endereço</h3>
          <div class="mb-8">
            <app-address-form 
              [address]="form.address" 
              label=""
              (addressChange)="onAddressChange($event)">
            </app-address-form>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <a routerLink="/app/pacientes" class="px-6 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancelar</a>
          <button class="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
            (click)="save()" [disabled]="saving()">
            {{ saving() ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Novo Responsável -->
    @if (showNewResponsavelModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="showNewResponsavelModal.set(false)"></div>
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Novo Responsável</h3>
            <button (click)="showNewResponsavelModal.set(false)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
              <input [(ngModel)]="newResponsavel.name" 
                class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                placeholder="Nome completo">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Parentesco</label>
                <select [(ngModel)]="newResponsavel.relationship" 
                  class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary">
                  <option value="">Selecione</option>
                  <option value="Mãe">Mãe</option>
                  <option value="Pai">Pai</option>
                  <option value="Avó/Avô">Avó/Avô</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CPF</label>
                <input [(ngModel)]="newResponsavel.cpf" 
                  class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                  placeholder="000.000.000-00" maxlength="14">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
              <input [(ngModel)]="newResponsavel.phone" 
                class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                placeholder="(00) 00000-0000" maxlength="15">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input [(ngModel)]="newResponsavel.email" type="email"
                class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                placeholder="email@exemplo.com">
            </div>
          </div>
          <div class="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button (click)="showNewResponsavelModal.set(false)" 
              class="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
              Cancelar
            </button>
            <button (click)="createResponsavel()" [disabled]="!newResponsavel.name || savingNewResponsavel()"
              class="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium text-sm disabled:opacity-50 transition-all flex items-center gap-2">
              @if (savingNewResponsavel()) {
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              }
              {{ savingNewResponsavel() ? 'Salvando...' : 'Salvar Responsável' }}
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
export class PacienteFormComponent implements OnInit {
  private service = inject(PacientesService);
  private responsaveisService = inject(ResponsaveisService);
  private escolasService = inject(EscolasService);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  id = '';
  saving = signal(false);
  responsaveis = signal<any[]>([]);
  filteredResponsaveis = signal<any[]>([]);
  escolas = signal<any[]>([]);
  avatarPreview = signal<string | null>(null);
  avatarFile: File | null = null;
  
  responsavelSearch = '';
  showResponsavelDropdown = signal(false);
  showNewResponsavelModal = signal(false);
  savingNewResponsavel = signal(false);
  selectedResponsavel = signal<any>(null);
  
  newResponsavel = {
    name: '',
    relationship: '',
    cpf: '',
    phone: '',
    email: ''
  };

  form: any = {
    name: '', birthDate: '', grade: '', active: true, schoolId: '', responsavelId: '',
    cpf: '', rg: '', accessCode: '', 
    phone: '', phoneIsWhatsApp: false, 
    phone2: '', phone2IsWhatsApp: false,
    address: { cep: '', street: '', neighborhood: '', number: '', complement: '', city: '', state: '' }
  };

  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.id;

    this.responsaveisService.list().subscribe((res: any) => {
      const data = res.data || [];
      this.responsaveis.set(data);
      this.filteredResponsaveis.set(data);
    });
    this.escolasService.list().subscribe((res: any) => this.escolas.set(res.data || []));

    if (this.isEdit) {
      this.service.get(this.id).subscribe((res: any) => {
        this.form = {
          ...res,
          address: res.address || { cep: '', street: '', neighborhood: '', number: '', complement: '', city: '', state: '' }
        };
        if (res.avatar) this.avatarPreview.set(res.avatar);
        if (res.responsavelId && res.responsavel) {
          this.selectedResponsavel.set(res.responsavel);
          this.responsavelSearch = res.responsavel.name;
        }
      });
    } else {
      this.generateAccessCode();
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#06B6D4', '#84CC16'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }

  generateAccessCode() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.form.accessCode = code;
  }

  copyAccessCode() {
    if (this.form.accessCode) {
      navigator.clipboard.writeText(this.form.accessCode);
    }
  }

  formatCPF(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 9) value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (value.length > 6) value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (value.length > 3) value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    this.form.cpf = value;
    input.value = value;
  }

  onPhoneChange(phone: PhoneNumber, field: string) {
    this.form[field] = phone.number;
    this.form[field + 'IsWhatsApp'] = phone.isWhatsApp;
  }

  onAddressChange(address: Address) {
    this.form.address = address;
  }

  filterResponsaveis() {
    const search = this.responsavelSearch.toLowerCase();
    if (!search) {
      this.filteredResponsaveis.set(this.responsaveis());
      return;
    }
    const filtered = this.responsaveis().filter(r => 
      r.name.toLowerCase().includes(search) || 
      r.phones?.includes(search) ||
      r.email?.toLowerCase().includes(search)
    );
    this.filteredResponsaveis.set(filtered);
  }

  selectResponsavel(responsavel: any) {
    this.form.responsavelId = responsavel.id;
    this.selectedResponsavel.set(responsavel);
    this.responsavelSearch = responsavel.name;
    this.showResponsavelDropdown.set(false);
  }

  clearResponsavel() {
    this.form.responsavelId = '';
    this.selectedResponsavel.set(null);
    this.responsavelSearch = '';
  }

  hideResponsavelDropdown() {
    setTimeout(() => this.showResponsavelDropdown.set(false), 200);
  }

  createResponsavel() {
    if (!this.newResponsavel.name) return;
    this.savingNewResponsavel.set(true);

    const data = {
      name: this.newResponsavel.name,
      relationship: this.newResponsavel.relationship,
      cpf: this.newResponsavel.cpf,
      phones: this.newResponsavel.phone,
      email: this.newResponsavel.email
    };

    this.responsaveisService.create(data).subscribe({
      next: (res: any) => {
        this.responsaveis.update(list => [...list, res]);
        this.selectResponsavel(res);
        this.showNewResponsavelModal.set(false);
        this.savingNewResponsavel.set(false);
        this.resetNewResponsavel();
      },
      error: () => {
        this.savingNewResponsavel.set(false);
        alert('Erro ao criar responsável');
      }
    });
  }

  resetNewResponsavel() {
    this.newResponsavel = { name: '', relationship: '', cpf: '', phone: '', email: '' };
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.avatarFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.avatarPreview.set(e.target?.result as string);
      reader.readAsDataURL(input.files[0]);
    }
  }

  save() {
    if (!this.form.name) return alert('Nome é obrigatório');
    this.saving.set(true);

    const formData = new FormData();
    Object.keys(this.form).forEach(key => {
      if (key === 'address') {
        formData.append('address', JSON.stringify(this.form.address));
      } else {
        formData.append(key, this.form[key]);
      }
    });
    if (this.avatarFile) formData.append('avatar', this.avatarFile);

    const obs = this.isEdit ? this.service.update(this.id, formData) : this.service.create(formData);
    obs.subscribe({
      next: () => this.router.navigate(['/app/pacientes']),
      error: () => { this.saving.set(false); alert('Erro ao salvar'); }
    });
  }
}
