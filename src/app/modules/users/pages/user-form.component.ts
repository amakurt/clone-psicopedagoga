import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
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
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    ImageCropperModalComponent
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex items-center gap-4 mb-6">
        <a mat-icon-button routerLink="/app/users">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
          {{ isEditing ? 'Editar Usuário' : 'Novo Usuário' }}
        </h1>
      </div>

      <mat-card class="!rounded-3xl !border !border-slate-200 dark:!border-slate-700 !shadow-sm">
        <mat-card-content class="!p-6 sm:!p-8">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <!-- Foto do Usuário / Colaborador -->
            <div class="col-span-2 mb-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-5">
              <div class="relative group shrink-0">
                <div class="size-20 sm:size-24 rounded-full overflow-hidden bg-primary/10 text-primary border-2 border-primary/20 shadow-inner flex items-center justify-center">
                  @if (avatarPreview()) {
                    <img [src]="avatarPreview()!" alt="Foto do Usuário" class="size-full object-cover">
                  } @else {
                    <span class="text-2xl font-black">{{ form.get('name')?.value ? getInitials(form.get('name')?.value) : 'U' }}</span>
                  }
                </div>
                <label class="absolute bottom-0 right-0 p-2 bg-primary hover:bg-primary/90 text-on-primary rounded-full cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all"
                  title="Escolher foto">
                  <span class="material-icons text-[16px]">photo_camera</span>
                  <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
                </label>
              </div>

              <div class="flex-1 text-center sm:text-left space-y-1.5">
                <h4 class="text-sm font-bold text-slate-800 dark:text-white">Foto do Perfil / Avatar</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Selecione uma foto para o usuário. Você pode ajustar zoom, recorte circular e enquadramento.
                </p>
                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <label class="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs">
                    <span class="material-icons text-[16px]">upload</span>
                    <span>{{ avatarPreview() ? 'Trocar Foto' : 'Adicionar Foto' }}</span>
                    <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
                  </label>
                  @if (avatarPreview()) {
                    <button type="button" (click)="openCropperWithCurrent()"
                      class="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                      <span class="material-icons text-[16px]">crop</span>
                      Ajustar Área & Zoom
                    </button>
                    <button type="button" (click)="removeAvatar()"
                      class="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                      <span class="material-icons text-[16px]">delete</span>
                      Remover Foto
                    </button>
                  }
                </div>
              </div>
            </div>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nome</mat-label>
              <input matInput formControlName="name">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full" *ngIf="!isEditing">
              <mat-label>Senha</mat-label>
              <input matInput formControlName="password" type="password">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Perfil</mat-label>
              <mat-select formControlName="role">
                <mat-option value="GESTOR">Gestor</mat-option>
                <mat-option value="PSICOPEDAGOGO">Psicopedagogo</mat-option>
                <mat-option value="SECRETARIA">Secretária</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Telefone</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Registro Profissional</mat-label>
              <input matInput formControlName="registration">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full col-span-2">
              <mat-label>Biografia</mat-label>
              <textarea matInput formControlName="bio" rows="3"></textarea>
            </mat-form-field>

            <div class="col-span-2 flex gap-4 pt-2">
              <button mat-raised-button color="primary" type="submit" [disabled]="!form.valid">
                <mat-icon>save</mat-icon>
                {{ isEditing ? 'Atualizar' : 'Salvar' }}
              </button>
              <a mat-raised-button routerLink="/app/users">Cancelar</a>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
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
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditing ? [] : [Validators.required, Validators.minLength(6)]],
      role: ['SECRETARIA', Validators.required],
      phone: [''],
      registration: [''],
      bio: [''],
      avatarUrl: ['']
    });

    this.userId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.userId) {
      this.isEditing = true;
      this.usersService.getById(this.userId).subscribe(user => {
        this.form.patchValue(user);
        if (user.avatarUrl) {
          this.avatarPreview.set(user.avatarUrl);
        }
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const data = {
        ...this.form.value,
        avatarUrl: this.form.value.avatarUrl !== undefined ? this.form.value.avatarUrl : (this.avatarPreview() || null)
      };
      if (this.isEditing && this.userId) {
        delete data.password;
        this.usersService.update(this.userId, data).subscribe({
          next: () => {
            this.toast.success('Usuário atualizado com sucesso!');
            this.router.navigate(['/app/users']);
          },
          error: () => this.toast.error('Erro ao atualizar usuário')
        });
      } else {
        this.usersService.create(data).subscribe({
          next: () => {
            this.toast.success('Usuário criado com sucesso!');
            this.router.navigate(['/app/users']);
          },
          error: () => this.toast.error('Erro ao criar usuário')
        });
      }
    }
  }
}
