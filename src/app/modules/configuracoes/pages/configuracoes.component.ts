import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ApiService } from '@core/services/api.service';
import { applyAccentColor } from '@core/utils/theme';
import { AddressFormComponent, Address } from '@core/components/address-form.component';
import { PhoneInputComponent, PhoneNumber } from '@core/components/phone-input.component';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AddressFormComponent, PhoneInputComponent],
  template: `
    <div class="space-y-8 animate-in">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white">Configurações</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerenciar seu perfil e preferências</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        @for (tab of tabs; track tab.id) {
          <button class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            [class]="activeTab() === tab.id ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
            (click)="activeTab.set(tab.id)">
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Profile Tab -->
      @if (activeTab() === 'perfil') {
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
          <div class="p-8 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-4">
              <div class="size-20 rounded-full flex items-center justify-center text-2xl font-bold text-white cursor-pointer relative overflow-hidden shadow-lg"
                [style.background]="getAvatarColor(profileForm.name)">
                @if (avatarPreview()) {
                  <img [src]="avatarPreview()" class="w-full h-full object-cover">
                } @else {
                  {{ getInitials(profileForm.name) }}
                }
                <label class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <span class="material-icons text-white text-2xl">camera_alt</span>
                  <input type="file" accept="image/*" class="hidden" (change)="onAvatarChange($event)">
                </label>
              </div>
              <div>
                <p class="font-bold text-slate-900 dark:text-white">{{ profileForm.name || 'Seu Nome' }}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ profileForm.email || 'seu@email.com' }}</p>
              </div>
            </div>
          </div>

          <div class="p-8">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Informações Pessoais</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nome Completo</label>
                <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                  [(ngModel)]="profileForm.name" placeholder="Seu nome">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</label>
                <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                  [(ngModel)]="profileForm.email" placeholder="seu@email.com" type="email">
              </div>
              <div>
                <app-phone-input 
                  [phone]="profileForm.phone" 
                  [isWhatsApp]="profileForm.phoneIsWhatsApp"
                  label="Telefone"
                  (phoneChange)="onProfilePhoneChange($event)">
                </app-phone-input>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registro Profissional</label>
                <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                  [(ngModel)]="profileForm.registration" placeholder="CRP, CREF etc.">
              </div>
              <div class="md:col-span-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bio</label>
                <textarea class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all min-h-[80px] resize-y"
                  [(ngModel)]="profileForm.bio" placeholder="Conte um pouco sobre você..."></textarea>
              </div>
            </div>
          </div>

          <div class="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button class="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95"
              (click)="saveProfile()">
              Salvar Alterações
            </button>
          </div>
        </div>
      }

      <!-- Security Tab -->
      <!-- Recebimento Tab -->
      @if (activeTab() === 'recebimento') {
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
          <div class="p-8">
            <div class="flex items-center gap-3 mb-2">
              <span class="material-icons text-primary text-2xl">qr_code_2</span>
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recebimento via PIX</h3>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Configure sua chave PIX para gerar cobranças para os responsáveis. O sistema monta o QR Code e o código
              "copia e cola" automaticamente a partir desta chave — sem custo de gateway.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tipo de Chave</label>
                <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                  [(ngModel)]="pixForm.pixKeyType">
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="PHONE">Telefone</option>
                  <option value="RANDOM">Chave aleatória</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Chave PIX</label>
                <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                  [(ngModel)]="pixForm.pixKey" [placeholder]="pixForm.pixKeyType === 'PHONE' ? 'Ex.: 85988014049 (com DDD)' : pixForm.pixKeyType === 'RANDOM' ? 'Ex.: a1b2c3d4-e5f6-...' : 'Ex.: seuemail@email.com ou 12345678901'" [attr.maxlength]="pixForm.pixKeyType === 'RANDOM' ? 36 : undefined">
              </div>
            </div>

            <div class="p-4 mb-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs text-slate-500 dark:text-slate-400">
              @if (pixForm.pixKeyType === 'PHONE') {
                <p><span class="material-icons text-[16px] align-text-bottom text-primary">smartphone</span> Informe o número com DDD, sem espaços ou traços (ex.: 85988014049). O sistema adiciona o +55 automaticamente, conforme o padrão do Banco Central.</p>
              } @else if (pixForm.pixKeyType === 'EMAIL') {
                <p><span class="material-icons text-[16px] align-text-bottom text-primary">alternate_email</span> Use o e-mail exatamente como cadastrado no seu banco (tudo em minúsculas).</p>
              } @else if (pixForm.pixKeyType === 'RANDOM') {
                <p><span class="material-icons text-[16px] align-text-bottom text-primary">key</span> Copie a chave aleatória (EVP) exatamente como aparece no app do seu banco.</p>
              } @else {
                <p><span class="material-icons text-[16px] align-text-bottom text-primary">badge</span> Apenas os números, sem pontos ou traços (ex.: 12345678901).</p>
              }
            </div>

            <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-start gap-3 text-xs text-amber-700 dark:text-amber-300">
              <span class="material-icons text-[18px] shrink-0">info</span>
              <p>A chave deve estar <b>cadastrada no seu banco</b> — o app do banco do pagador consulta o DICT do Banco Central e recusa o QR Code se a chave não existir. Cada profissional da clínica tem a sua própria chave — as cobranças que você gerar apontam para ela.</p>
            </div>
          </div>

          <div class="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button class="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95"
              (click)="savePix()">
              Salvar Chave PIX
            </button>
          </div>
        </div>
      }

      @if (activeTab() === 'seguranca') {
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
          <div class="p-8">
            <div class="flex items-center gap-3 mb-6">
              <span class="material-icons text-primary text-2xl">{{ hasPassword() ? 'lock' : 'lock_open' }}</span>
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {{ hasPassword() ? 'Alterar Senha' : 'Definir Senha' }}
              </h3>
            </div>
            @if (!hasPassword()) {
              <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Sua conta foi criada com o Google e não possui senha. Defina uma para poder entrar com email e senha.
              </p>
            }
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              @if (hasPassword()) {
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Senha Atual</label>
                  <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                    type="password" [(ngModel)]="passwordForm.current" placeholder="Digite sua senha atual">
                </div>
                <div></div>
              }
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nova Senha</label>
                <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                  type="password" [(ngModel)]="passwordForm.newPassword" placeholder="Digite a nova senha">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Confirmar Nova Senha</label>
                <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                  type="password" [(ngModel)]="passwordForm.confirm" placeholder="Confirme a nova senha">
              </div>
            </div>
          </div>

          <div class="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button class="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95"
              (click)="changePassword()">
              {{ hasPassword() ? 'Alterar Senha' : 'Definir Senha' }}
            </button>
          </div>
        </div>
      }

      <!-- Clinic Tab -->
      @if (activeTab() === 'clinica') {
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
          <div class="p-8">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Dados da Clínica</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div class="md:col-span-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nome da Clínica</label>
                <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                  [(ngModel)]="clinicForm.name" placeholder="Nome da clínica">
              </div>
            </div>

            <app-address-form 
              [address]="clinicForm.address" 
              label="Endereço da Clínica"
              (addressChange)="onClinicAddressChange($event)">
            </app-address-form>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <app-phone-input 
                  [phone]="clinicForm.phone" 
                  [isWhatsApp]="clinicForm.phoneIsWhatsApp"
                  label="Telefone da Clínica"
                  (phoneChange)="onClinicPhoneChange($event)">
                </app-phone-input>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</label>
                <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                  [(ngModel)]="clinicForm.email" placeholder="contato@clinica.com" type="email">
              </div>
            </div>
          </div>

          <div class="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button class="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95"
              (click)="saveClinic()">
              Salvar Clínica
            </button>
          </div>
        </div>
      }

      <!-- Notifications Tab -->
      @if (activeTab() === 'notificacoes') {
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
          <div class="p-8">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Preferências de Notificação</h3>
            <div class="space-y-4">
              @for (option of notificationOptions; track option.id) {
                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <div>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">{{ option.label }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ option.description }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" [checked]="option.enabled" (change)="option.enabled = !option.enabled">
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              }
            </div>
          </div>

          <div class="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button class="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95"
              (click)="saveNotifications()">
              Salvar Preferências
            </button>
          </div>
        </div>
      }

      <!-- Aparência Tab -->
      @if (activeTab() === 'aparencia') {
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
          <div class="p-8">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Aparência</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              @for (theme of themes; track theme.id) {
                <button class="relative flex flex-col items-center gap-3 p-6 rounded-2xl ring-2 transition-all hover:scale-[1.02]"
                  [class]="currentTheme() === theme.id
                    ? 'ring-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'ring-slate-200 dark:ring-slate-700 hover:ring-slate-300 dark:hover:ring-slate-600 bg-slate-50 dark:bg-slate-800'"
                  (click)="setTheme(theme.id)">
                  @if (currentTheme() === theme.id) {
                    <div class="absolute top-3 right-3">
                      <span class="material-icons text-primary text-lg">check_circle</span>
                    </div>
                  }
                  <div class="size-16 rounded-2xl flex items-center justify-center"
                    [class]="currentTheme() === theme.id ? 'bg-primary/10' : 'bg-slate-200 dark:bg-slate-700'">
                    <span class="material-icons text-3xl"
                      [class]="currentTheme() === theme.id ? 'text-primary' : 'text-slate-400 dark:text-slate-500'">
                      {{ theme.icon }}
                    </span>
                  </div>
                  <div class="text-center">
                    <p class="font-bold text-sm"
                      [class]="currentTheme() === theme.id ? 'text-primary' : 'text-slate-900 dark:text-white'">
                      {{ theme.label }}
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ theme.description }}</p>
                  </div>
                </button>
              }
            </div>
          </div>

          <!-- Simulação de cores -->
          <div class="p-8 border-t border-slate-100 dark:border-slate-800">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Cores do Tema</h3>
            <div class="flex flex-wrap gap-3">
              <button class="w-10 h-10 rounded-full ring-2 ring-offset-2 transition-all hover:scale-110"
                style="background: #6366f1"
                [class]="accentColor() === '#6366f1' ? 'ring-indigo-500 ring-offset-white dark:ring-offset-slate-900' : 'ring-transparent'"
                (click)="setAccentColor('#6366f1')"></button>
              <button class="w-10 h-10 rounded-full ring-2 ring-offset-2 transition-all hover:scale-110"
                style="background: #8b5cf6"
                [class]="accentColor() === '#8b5cf6' ? 'ring-violet-500 ring-offset-white dark:ring-offset-slate-900' : 'ring-transparent'"
                (click)="setAccentColor('#8b5cf6')"></button>
              <button class="w-10 h-10 rounded-full ring-2 ring-offset-2 transition-all hover:scale-110"
                style="background: #ec4899"
                [class]="accentColor() === '#ec4899' ? 'ring-pink-500 ring-offset-white dark:ring-offset-slate-900' : 'ring-transparent'"
                (click)="setAccentColor('#ec4899')"></button>
              <button class="w-10 h-10 rounded-full ring-2 ring-offset-2 transition-all hover:scale-110"
                style="background: #10b981"
                [class]="accentColor() === '#10b981' ? 'ring-emerald-500 ring-offset-white dark:ring-offset-slate-900' : 'ring-transparent'"
                (click)="setAccentColor('#10b981')"></button>
              <button class="w-10 h-10 rounded-full ring-2 ring-offset-2 transition-all hover:scale-110"
                style="background: #f59e0b"
                [class]="accentColor() === '#f59e0b' ? 'ring-amber-500 ring-offset-white dark:ring-offset-slate-900' : 'ring-transparent'"
                (click)="setAccentColor('#f59e0b')"></button>
              <button class="w-10 h-10 rounded-full ring-2 ring-offset-2 transition-all hover:scale-110"
                style="background: #ef4444"
                [class]="accentColor() === '#ef4444' ? 'ring-red-500 ring-offset-white dark:ring-offset-slate-900' : 'ring-transparent'"
                (click)="setAccentColor('#ef4444')"></button>
            </div>
          </div>

          <div class="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button class="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95"
              (click)="saveAppearance()">
              Salvar Aparência
            </button>
          </div>
        </div>
      }

      <!-- Disponibilidade Tab -->
      @if (activeTab() === 'disponibilidade') {
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
          <div class="p-8">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Horários Disponíveis</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure os dias e horários em que você atende. Desative um horário sem precisar excluí-lo.</p>
              </div>
              <button class="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95"
                (click)="addAvailability()">
                + Novo Horário
              </button>
            </div>

            @if (availabilities().length === 0) {
              <div class="p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span class="material-icons text-5xl text-slate-300 dark:text-slate-600">schedule</span>
                <p class="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum horário configurado</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Clique em "+ Novo Horário" para começar</p>
              </div>
            } @else {
              <div class="space-y-2">
                @for (av of availabilities(); track av.id) {
                  <div class="flex items-center gap-4 p-4 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 transition-all"
                    [class]="av.active ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-slate-50/50 dark:bg-slate-800/20 opacity-60'">
                    <div class="size-11 rounded-xl flex items-center justify-center shrink-0"
                      [class]="av.active ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'">
                      <span class="material-icons text-xl">{{ av.active ? 'event_available' : 'event_busy' }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-bold text-sm text-slate-900 dark:text-white">{{ dayNames[av.dayOfWeek] }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ av.startTime }} — {{ av.endTime }}</p>
                    </div>
                    <label class="flex items-center cursor-pointer select-none" title="Ativo/Inativo">
                      <span class="text-xs font-semibold mr-2 text-slate-500">{{ av.active ? 'Ativo' : 'Inativo' }}</span>
                      <div class="relative">
                        <input type="checkbox" class="peer sr-only" [checked]="av.active" (change)="toggleAvailability(av)">
                        <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer-checked:bg-primary transition-colors"></div>
                        <div class="absolute top-0.5 left-0.5 size-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                      </div>
                    </label>
                    <button class="size-9 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-all flex items-center justify-center shrink-0" title="Excluir"
                      (click)="deleteAvailability(av)">
                      <span class="material-icons text-lg">delete</span>
                    </button>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Form de novo horário -->
          @if (showAvailabilityForm()) {
            <div class="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Novo Horário</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dia da Semana *</label>
                  <select class="w-full px-4 py-3 bg-white dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                    [(ngModel)]="availabilityForm.dayOfWeek">
                    @for (d of dayNames; track $index) {
                      <option [value]="$index">{{ d }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Início *</label>
                  <input type="time" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                    [(ngModel)]="availabilityForm.startTime">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fim *</label>
                  <input type="time" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border-none rounded-2xl text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                    [(ngModel)]="availabilityForm.endTime">
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button class="px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                  (click)="showAvailabilityForm.set(false)">Cancelar</button>
                <button class="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm transition-all active:scale-95"
                  (click)="saveAvailability()" [disabled]="savingAvailability()">
                  {{ savingAvailability() ? 'Salvando...' : 'Salvar Horário' }}
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Danger Zone -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-red-200 dark:ring-red-900/30 overflow-hidden">
        <div class="p-8">
          <h3 class="text-sm font-black text-red-600 uppercase tracking-widest mb-2">Zona de Perigo</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Ações irreversíveis da conta</p>
          <div class="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl">
            <div>
              <p class="text-sm font-bold text-slate-900 dark:text-white">Sair do Sistema</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Encerrar sua sessão atual</p>
            </div>
            <button class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all"
              (click)="auth.logout()">
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>

    @if (showToast()) {
      <div class="fixed bottom-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 animate-in shadow-lg bg-emerald-500 text-white">
        <span class="material-icons">check_circle</span>
        <span class="text-sm font-medium">{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ConfiguracoesComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private toast = inject(ToastService);

  activeTab = signal<'perfil' | 'seguranca' | 'clinica' | 'notificacoes' | 'aparencia' | 'disponibilidade' | 'recebimento'>('perfil');
  avatarPreview = signal<string | null>(null);
  showToast = signal(false);
  toastMessage = signal('');
  currentTheme = signal<string>(localStorage.getItem('theme') || 'light');
  hasPassword = signal(true);
  availabilities = signal<any[]>([]);
  showAvailabilityForm = signal(false);
  savingAvailability = signal(false);
  availabilityForm: any = { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' };
  dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  tabs = [
    { id: 'perfil' as const, label: 'Perfil' },
    { id: 'seguranca' as const, label: 'Segurança' },
    { id: 'clinica' as const, label: 'Clínica' },
    { id: 'notificacoes' as const, label: 'Notificações' },
    { id: 'disponibilidade' as const, label: 'Disponibilidade' },
    { id: 'recebimento' as const, label: 'Recebimento' },
    { id: 'aparencia' as const, label: 'Aparência' },
  ];

  themes = [
    { id: 'light', label: 'Claro', icon: 'light_mode', description: 'Tema claro para ambientes bem iluminados' },
    { id: 'dark', label: 'Escuro', icon: 'dark_mode', description: 'Tema escuro para reduzir cansaço visual' },
    { id: 'system', label: 'Sistema', icon: 'contrast', description: 'Segue a preferência do seu sistema operacional' },
  ];

  accentColor = signal(localStorage.getItem('accentColor') || '#6366f1');

  profileForm = { name: '', email: '', phone: '', phoneIsWhatsApp: false, registration: '', bio: '' };
  pixForm = { pixKey: '', pixKeyType: 'EMAIL' };
  passwordForm = { current: '', newPassword: '', confirm: '' };
  clinicForm: any = { 
    name: '', 
    phone: '', 
    phoneIsWhatsApp: false,
    email: '',
    address: { cep: '', street: '', neighborhood: '', number: '', complement: '', city: '', state: '' }
  };

  notificationOptions = [
    { id: 'email', label: 'Notificações por Email', description: 'Receber alertas importantes por email', enabled: true },
    { id: 'sessao', label: 'Lembrete de Sessões', description: 'Notificar antes das sessões agendadas', enabled: true },
    { id: 'pagamento', label: 'Alertas de Pagamento', description: 'Notificar sobre pagamentos pendentes', enabled: true },
    { id: 'documento', label: 'Novos Documentos', description: 'Notificar quando novos documentos forem adicionados', enabled: false },
  ];

  ngOnInit() {
    const user = this.auth.user();
    if (user) {
      this.profileForm = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        phoneIsWhatsApp: user.phoneIsWhatsApp || false,
        registration: user.registration || '',
        bio: user.bio || '',
      };
      this.hasPassword.set(user.hasPassword !== false);
      if (user.avatarUrl) this.avatarPreview.set(user.avatarUrl);
      if (user.pixKey) this.pixForm.pixKey = user.pixKey;
      if (user.pixKeyType) this.pixForm.pixKeyType = user.pixKeyType;
    }

    this.loadAvailabilities();

    const savedClinic = localStorage.getItem('clinic_config');
    if (savedClinic) {
      const parsed = JSON.parse(savedClinic);
      this.clinicForm = {
        ...this.clinicForm,
        ...parsed,
        address: parsed.address || this.clinicForm.address
      };
    }

    this.applyTheme(this.currentTheme());
    const savedColor = localStorage.getItem('accentColor');
    if (savedColor) {
      this.accentColor.set(savedColor);
      applyAccentColor(savedColor);
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

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => this.avatarPreview.set(e.target?.result as string);
      reader.readAsDataURL(input.files[0]);
    }
  }

  onClinicAddressChange(address: Address) {
    this.clinicForm.address = address;
  }

  onProfilePhoneChange(phone: PhoneNumber) {
    this.profileForm.phone = phone.number;
    this.profileForm.phoneIsWhatsApp = phone.isWhatsApp;
  }

  onClinicPhoneChange(phone: PhoneNumber) {
    this.clinicForm.phone = phone.number;
    this.clinicForm.phoneIsWhatsApp = phone.isWhatsApp;
  }

  saveProfile() {
    this.api.put('/auth/profile', this.profileForm).subscribe({
      next: (res: any) => {
        this.showNotification('Perfil atualizado com sucesso!');
        if (res?.user) this.auth.updateUser(res.user);
      },
      error: () => this.showNotification('Perfil atualizado (modo local)')
    });
  }

  savePix() {
    if (!this.pixForm.pixKey.trim()) {
      this.toast.warning('Digite sua chave PIX');
      return;
    }
    this.api.put('/auth/profile', this.pixForm).subscribe({
      next: (res: any) => {
        if (res?.user) this.auth.updateUser(res.user);
        this.showNotification('Chave PIX salva com sucesso!');
      },
      error: () => this.toast.error('Erro ao salvar chave PIX')
    });
  }

  changePassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirm) {
      this.toast.warning('As senhas não conferem');
      return;
    }
    if (this.hasPassword() && !this.passwordForm.current) {
      this.toast.warning('Digite a senha atual');
      return;
    }
    if (!this.passwordForm.newPassword) {
      this.toast.warning('Digite a nova senha');
      return;
    }
    const payload: any = { newPassword: this.passwordForm.newPassword };
    if (this.hasPassword()) payload.current = this.passwordForm.current;
    this.api.put('/auth/password', payload).subscribe({
      next: () => {
        this.showNotification('Senha alterada com sucesso!');
        this.passwordForm = { current: '', newPassword: '', confirm: '' };
        this.hasPassword.set(true);
      },
      error: () => this.toast.error('Erro ao alterar senha')
    });
  }

  saveClinic() {
    localStorage.setItem('clinic_config', JSON.stringify(this.clinicForm));
    this.showNotification('Dados da clínica salvos!');
  }

  saveNotifications() {
    localStorage.setItem('notification_prefs', JSON.stringify(this.notificationOptions));
    this.showNotification('Preferências salvas!');
  }

  setTheme(themeId: string) {
    this.currentTheme.set(themeId);
    this.applyTheme(themeId);
  }

  applyTheme(theme: string) {
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      html.classList.add(theme);
    }
  }

  setAccentColor(color: string) {
    this.accentColor.set(color);
    applyAccentColor(color);
  }

  saveAppearance() {
    localStorage.setItem('theme', this.currentTheme());
    localStorage.setItem('accentColor', this.accentColor());
    this.toast.success('Aparência salva com sucesso');
  }

  loadAvailabilities() {
    this.api.get('/availability').subscribe({
      next: (res: any) => this.availabilities.set(res.data || []),
      error: () => {}
    });
  }

  addAvailability() {
    this.availabilityForm = { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' };
    this.showAvailabilityForm.set(true);
  }

  saveAvailability() {
    if (!this.availabilityForm.dayOfWeek || !this.availabilityForm.startTime || !this.availabilityForm.endTime) {
      this.toast.warning('Preencha dia, início e fim');
      return;
    }
    this.savingAvailability.set(true);
    this.api.post('/availability', this.availabilityForm).subscribe({
      next: () => {
        this.savingAvailability.set(false);
        this.showAvailabilityForm.set(false);
        this.toast.success('Horário adicionado com sucesso');
        this.loadAvailabilities();
      },
      error: (err: any) => {
        this.savingAvailability.set(false);
        this.toast.error(err?.error?.error || 'Erro ao adicionar horário');
      }
    });
  }

  toggleAvailability(av: any) {
    this.api.put(`/availability/${av.id}`, {
      dayOfWeek: av.dayOfWeek,
      startTime: av.startTime,
      endTime: av.endTime,
      active: !av.active,
    }).subscribe({
      next: () => this.loadAvailabilities(),
      error: () => this.toast.error('Erro ao atualizar horário')
    });
  }

  deleteAvailability(av: any) {
    this.api.delete(`/availability/${av.id}`).subscribe({
      next: () => {
        this.toast.success('Horário excluído');
        this.loadAvailabilities();
      },
      error: () => this.toast.error('Erro ao excluir horário')
    });
  }

  showNotification(message: string) {
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
