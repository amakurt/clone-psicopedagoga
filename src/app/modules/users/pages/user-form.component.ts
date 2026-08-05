import { Component, OnInit } from '@angular/core';
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
    MatIconModule
  ],
  template: `
    <div class="p-6">
      <div class="flex items-center gap-4 mb-6">
        <a mat-icon-button routerLink="/app/users">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
          {{ isEditing ? 'Editar Usuário' : 'Novo Usuário' }}
        </h1>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div class="col-span-2 flex gap-4">
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
  `
})
export class UserFormComponent implements OnInit {
  form!: FormGroup;
  isEditing = false;
  userId?: string;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditing ? [] : [Validators.required, Validators.minLength(6)]],
      role: ['SECRETARIA', Validators.required],
      phone: [''],
      registration: [''],
      bio: ['']
    });

    this.userId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.userId) {
      this.isEditing = true;
      this.usersService.getById(this.userId).subscribe(user => {
        this.form.patchValue(user);
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const data = this.form.value;
      if (this.isEditing && this.userId) {
        delete data.password;
        this.usersService.update(this.userId, data).subscribe(() => {
          this.router.navigate(['/app/users']);
        });
      } else {
        this.usersService.create(data).subscribe(() => {
          this.router.navigate(['/app/users']);
        });
      }
    }
  }
}
