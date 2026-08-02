import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PacientesService } from '../services/pacientes.service';
import { ResponsaveisService } from '../../responsaveis/services/responsaveis.service';
import { EscolasService } from '../../escolas/services/escolas.service';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">{{ isEdit ? 'Editar' : 'Novo' }} Paciente</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ isEdit ? 'Atualize os dados do paciente' : 'Preencha os dados para cadastrar' }}</p>
        </div>
        <a routerLink="/pacientes" class="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all">
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
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Responsável</label>
              <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                [(ngModel)]="form.responsavelId">
                <option value="">Selecione o responsável</option>
                @for (r of responsaveis(); track r.id) {
                  <option [value]="r.id">{{ r.name }}</option>
                }
              </select>
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
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Telefone Principal</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                [value]="form.phone" (input)="formatPhone($event, 'phone')" placeholder="(00) 00000-0000" maxlength="15">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Telefone Secundário</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                [value]="form.phone2" (input)="formatPhone($event, 'phone2')" placeholder="(00) 00000-0000" maxlength="15">
            </div>
          </div>

          <!-- Endereço -->
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Endereço</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CEP</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                [value]="form.address.cep" (input)="formatCEP($event)" placeholder="00000-000" maxlength="9">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rua</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                [(ngModel)]="form.address.street" placeholder="Rua, Avenida...">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bairro</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                [(ngModel)]="form.address.neighborhood" placeholder="Bairro">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Número</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                [(ngModel)]="form.address.number" placeholder="Nº">
            </div>
            <div class="md:col-span-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Complemento</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                [(ngModel)]="form.address.complement" placeholder="Apto, Bloco...">
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <a routerLink="/pacientes" class="px-6 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancelar</a>
          <button class="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
            (click)="save()" [disabled]="saving()">
            {{ saving() ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PacienteFormComponent implements OnInit {
  private service = inject(PacientesService);
  private responsaveisService = inject(ResponsaveisService);
  private escolasService = inject(EscolasService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  id = '';
  saving = signal(false);
  responsaveis = signal<any[]>([]);
  escolas = signal<any[]>([]);
  avatarPreview = signal<string | null>(null);
  avatarFile: File | null = null;

  form: any = {
    name: '', birthDate: '', grade: '', active: true, schoolId: '', responsavelId: '',
    cpf: '', rg: '', accessCode: '', phone: '', phone2: '',
    address: { cep: '', street: '', neighborhood: '', number: '', complement: '' }
  };

  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.id;

    this.responsaveisService.list().subscribe((res: any) => this.responsaveis.set(res.data || []));
    this.escolasService.list().subscribe((res: any) => this.escolas.set(res.data || []));

    if (this.isEdit) {
      this.service.get(this.id).subscribe((res: any) => {
        this.form = {
          ...res,
          address: res.address || { cep: '', street: '', neighborhood: '', number: '', complement: '' }
        };
        if (res.avatar) this.avatarPreview.set(res.avatar);
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

  formatPhone(event: Event, field: string) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 7) value = value.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
    else if (value.length > 2) value = value.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    this.form[field] = value;
    input.value = value;
  }

  formatCEP(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 5) value = value.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    this.form.address.cep = value;
    input.value = value;
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
      next: () => this.router.navigate(['/pacientes']),
      error: () => { this.saving.set(false); alert('Erro ao salvar'); }
    });
  }
}
