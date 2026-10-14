import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsersService } from '../services/users.service';
import { ToastService } from '@shared/components/toast.component';
import { ImageCropperModalComponent } from '@shared/components/image-cropper-modal.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ImageCropperModalComponent
  ],
  template: `
    <div class="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 animate-in">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <a routerLink="/app/users" class="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all text-slate-600 dark:text-slate-300">
            <span class="material-icons text-xl">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white">
              {{ isEditing ? 'Editar Usuário' : 'Novo Usuário' }}
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {{ isEditing ? 'Atualize as permissões e dados cadastrais do colaborador' : 'Cadastre um novo colaborador na equipe da clínica' }}
            </p>
          </div>
        </div>

        <button 
          (click)="onSubmit()" 
          [disabled]="form.invalid || saving()"
          class="px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95">
          <span class="material-icons text-[18px]">save</span>
          <span>{{ saving() ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar') }}</span>
        </button>
      </div>

      <!-- Card Principal -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        <!-- Foto do Usuário / Colaborador -->
        <div class="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
          <div class="relative group shrink-0">
            <div class="size-24 rounded-full overflow-hidden bg-primary/10 text-primary border-4 border-white dark:border-slate-700 shadow-lg flex items-center justify-center">
              @if (avatarPreview()) {
                <img [src]="avatarPreview()!" alt="Foto do Usuário" class="size-full object-cover">
              } @else {
                <span class="text-3xl font-black">{{ form.get('name')?.value ? getInitials(form.get('name')?.value) : 'U' }}</span>
              }
            </div>
            <label class="absolute bottom-0 right-0 p-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-full cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all"
              title="Escolher foto">
              <span class="material-icons text-[16px]">photo_camera</span>
              <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
            </label>
          </div>

          <div class="flex-1 text-center sm:text-left space-y-1.5">
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">Foto do Perfil / Avatar</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Selecione uma foto profissional para o usuário. Você pode ajustar zoom, recorte circular e enquadramento.
            </p>
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <label class="px-3.5 py-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs">
                <span class="material-icons text-[16px]">upload</span>
                <span>{{ avatarPreview() ? 'Trocar Foto' : 'Adicionar Foto' }}</span>
                <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
              </label>
              @if (avatarPreview()) {
                <button type="button" (click)="openCropperWithCurrent()"
                  class="px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                  <span class="material-icons text-[16px]">crop</span>
                  Ajustar Área & Zoom
                </button>
                <button type="button" (click)="removeAvatar()"
                  class="px-3.5 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                  <span class="material-icons text-[16px]">delete</span>
                  Remover Foto
                </button>
              }
            </div>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <!-- Nome -->
            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nome Completo *</label>
              <input 
                formControlName="name" 
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white"
                placeholder="Ex: Dra. Mariana Costa">
              @if (form.get('name')?.touched && form.get('name')?.invalid) {
                <span class="text-xs text-red-500 mt-1 block">O nome é obrigatório</span>
              }
            </div>

            <!-- Email -->
            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">E-mail de Acesso *</label>
              <input 
                formControlName="email" 
                type="email"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white"
                placeholder="mariana@clinica.com">
              @if (form.get('email')?.touched && form.get('email')?.invalid) {
                <span class="text-xs text-red-500 mt-1 block">Informe um e-mail válido</span>
              }
            </div>

            <!-- Perfil / Role -->
            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Perfil de Acesso *</label>
              <select 
                formControlName="role"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white">
                <option value="GESTOR">Gestor (Acesso Total & Administrativo)</option>
                <option value="PSICOPEDAGOGO">Psicopedagogo (Atendimento Clínico)</option>
                <option value="PROFISSIONAL">Profissional / Terapeuta</option>
                <option value="SECRETARIA">Secretária (Recepção & Agendamentos)</option>
              </select>
            </div>

            <!-- Status Ativo / Inativo -->
            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Status da Conta</label>
              <div class="flex items-center gap-3 h-[46px] px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" formControlName="active" class="sr-only peer">
                  <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                </label>
                <span class="text-sm font-bold" [class]="form.get('active')?.value ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'">
                  {{ form.get('active')?.value ? 'Conta Ativa' : 'Conta Inativa / Bloqueada' }}
                </span>
              </div>
            </div>

            <!-- Senha / Redefinição de Senha -->
            <div class="md:col-span-2 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div class="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                <span class="material-icons text-base">lock</span>
                <span>{{ isEditing ? 'Redefinir Senha de Acesso (Opcional)' : 'Senha de Acesso Inicial *' }}</span>
              </div>
              <input 
                formControlName="password" 
                type="password"
                class="w-full px-4 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-sm font-medium ring-1 ring-amber-200 dark:ring-amber-900/50 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                [placeholder]="isEditing ? 'Digite apenas se desejar alterar a senha atual (mínimo 6 caracteres)' : 'Digite a senha inicial do usuário (mínimo 6 caracteres)'">
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                {{ isEditing ? 'Caso deixe este campo em branco, a senha atual do colaborador permanecerá inalterada.' : 'O colaborador usará esta senha para seu primeiro login na clínica.' }}
              </p>
              @if (form.get('password')?.touched && form.get('password')?.invalid) {
                <span class="text-xs text-red-500 mt-1 block">A senha deve ter no mínimo 6 caracteres</span>
              }
            </div>

            <!-- Telefone -->
            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Telefone / WhatsApp</label>
              <input 
                formControlName="phone" 
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white"
                placeholder="(00) 00000-0000">
            </div>

            <!-- Registro Profissional -->
            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Registro Profissional (ABPp / CRP / CRM)</label>
              <input 
                formControlName="registration" 
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white"
                placeholder="Ex: ABPp 12345/SP">
            </div>

            <!-- Biografia -->
            <div class="md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Biografia / Resumo Profissional</label>
              <textarea 
                formControlName="bio" 
                rows="3"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white resize-none"
                placeholder="Especialidades, formação acadêmica e abordagem clínica..."></textarea>
            </div>

          </div>

          <!-- Bottom Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <a routerLink="/app/users" class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Cancelar
            </a>
            <button 
              type="submit" 
              [disabled]="form.invalid || saving()"
              class="px-7 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95">
              <span class="material-icons text-[18px]">save</span>
              <span>{{ saving() ? 'Salvando...' : (isEditing ? 'Atualizar Usuário' : 'Salvar Usuário') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Recorte e Ajuste de Foto -->
    @if (showCropperModal() && rawImageToCrop()) {
      <app-image-cropper-modal
        [imageSrc]="rawImageToCrop()!"
        title="Ajustar Foto do Usuário"
        (cropped)="onCroppedImage($event)"
        (cancelled)="onCropperCancelled()" />
    }
  `
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  form!: FormGroup;
  isEditing = false;
  userId?: string;
  saving = signal(false);

  avatarPreview = signal<string | null>(null);
  showCropperModal = signal(false);
  rawImageToCrop = signal<string | null>(null);

  getInitials(name?: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.toast.warning('Por favor, selecione um arquivo de imagem válido');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.rawImageToCrop.set(reader.result as string);
      this.showCropperModal.set(true);
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  openCropperWithCurrent() {
    if (this.avatarPreview()) {
      this.rawImageToCrop.set(this.avatarPreview());
      this.showCropperModal.set(true);
    }
  }

  onCroppedImage(croppedDataUrl: string) {
    this.avatarPreview.set(croppedDataUrl);
    this.form.patchValue({ avatarUrl: croppedDataUrl });
    this.showCropperModal.set(false);
    this.toast.success('Foto ajustada!');
  }

  onCropperCancelled() {
    this.showCropperModal.set(false);
    this.rawImageToCrop.set(null);
  }

  removeAvatar() {
    this.avatarPreview.set(null);
    this.form.patchValue({ avatarUrl: null });
    this.toast.info('Foto removida');
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditing = !!this.userId;

    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditing ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)]],
      role: ['PSICOPEDAGOGO', Validators.required],
      active: [true],
      phone: [''],
      registration: [''],
      bio: [''],
      avatarUrl: ['']
    });

    if (this.isEditing && this.userId) {
      this.usersService.getById(this.userId).subscribe({
        next: (user: any) => {
          this.form.patchValue({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'PSICOPEDAGOGO',
            active: user.active !== undefined ? user.active : true,
            phone: user.phone || '',
            registration: user.registration || '',
            bio: user.bio || '',
            avatarUrl: user.avatarUrl || ''
          });
          if (user.avatarUrl) {
            this.avatarPreview.set(user.avatarUrl);
          }
          this.form.get('password')?.setValue('');
          this.form.get('password')?.clearValidators();
          this.form.get('password')?.setValidators([Validators.minLength(6)]);
          this.form.get('password')?.updateValueAndValidity();
        },
        error: () => {
          this.toast.error('Erro ao carregar dados do usuário');
          this.router.navigate(['/app/users']);
        }
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.form.value;

    const payload: any = {
      name: formValue.name,
      email: formValue.email,
      role: formValue.role,
      active: formValue.active,
      phone: formValue.phone || null,
      registration: formValue.registration || null,
      bio: formValue.bio || null,
      avatarUrl: formValue.avatarUrl !== undefined ? formValue.avatarUrl : (this.avatarPreview() || null)
    };

    // Senha: se em edição e preenchida, envia. Se na criação, envia sempre.
    if (this.isEditing) {
      if (formValue.password && formValue.password.trim().length >= 6) {
        payload.password = formValue.password.trim();
      }
      this.usersService.update(this.userId!, payload).subscribe({
        next: () => {
          this.toast.success('Usuário atualizado com sucesso!');
          this.saving.set(false);
          this.router.navigate(['/app/users']);
        },
        error: (err: any) => {
          this.saving.set(false);
          this.toast.error(err?.error?.error || 'Erro ao atualizar usuário');
        }
      });
    } else {
      payload.password = formValue.password;
      this.usersService.create(payload).subscribe({
        next: () => {
          this.toast.success('Usuário criado com sucesso!');
          this.saving.set(false);
          this.router.navigate(['/app/users']);
        },
        error: (err: any) => {
          this.saving.set(false);
          this.toast.error(err?.error?.error || 'Erro ao criar usuário');
        }
      });
    }
  }
}
