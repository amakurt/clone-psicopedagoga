import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PacientesService } from '../services/pacientes.service';
import { ToastService } from '@shared/components/toast.component';
import { ConfirmModalComponent } from '@shared/components/confirm-modal.component';
import { FichaScannerModalComponent, ScanResult } from '@shared/components/ficha-scanner-modal.component';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmModalComponent, FichaScannerModalComponent],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-in">
      <!-- Alerta de alunos sem código de acesso -->
      @if (patientsWithoutCodes() > 0) {
        <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="size-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <span class="material-icons text-xl">vpn_key</span>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900 dark:text-white">Alunos sem código de acesso</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ patientsWithoutCodes() }} aluno(s) ainda não possuem código para o portal dos pais.</p>
            </div>
          </div>
          <button class="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
            (click)="generateAllCodes()" [disabled]="generatingCodes()">
            <span class="material-icons text-sm" [class.animate-spin]="generatingCodes()">refresh</span>
            {{ generatingCodes() ? 'Gerando...' : 'Gerar Códigos Agora' }}
          </button>
        </div>
      }

      <!-- Barra de Busca, Filtros e Ações Principais -->
      <div class="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div class="w-full lg:max-w-md">
          <div class="relative group">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
            <input type="text" class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary shadow-sm transition-all outline-none"
              placeholder="Buscar por nome, CPF ou responsável..."
              [(ngModel)]="searchTerm" (input)="onSearch()">
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <!-- Filtro de Status: Padrão apenas ATIVOS -->
          <select class="flex-1 sm:flex-none px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all outline-none text-slate-700 dark:text-slate-200"
            [(ngModel)]="filterStatus" (change)="load()">
            <option value="active">Status: Apenas Ativos</option>
            <option value="inactive">Status: Inativos</option>
            <option value="">Status: Todos os Pacientes</option>
          </select>

          <!-- Cadastrar por Ficha IA -->
          <button type="button" (click)="showScannerModal.set(true)"
            class="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-teal-600/20 transition-all active:scale-95">
            <span class="material-icons text-[18px]">document_scanner</span>
            <span>Cadastrar com IA</span>
          </button>

          <!-- Novo Paciente -->
          <a routerLink="/app/pacientes/novo"
            class="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
            <span class="material-icons text-[18px]">add</span>
            <span>Novo Paciente</span>
          </a>
        </div>
      </div>

      <!-- Tabela / Cards de Pacientes -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center p-12 text-slate-500">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        } @else if (items().length === 0) {
          <div class="text-center py-16 px-4">
            <span class="material-icons text-6xl text-slate-300 dark:text-slate-700">people</span>
            <p class="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">Nenhum paciente encontrado com o filtro atual</p>
            @if (filterStatus === 'active') {
              <button (click)="filterStatus = ''; load()" class="mt-2 text-xs font-bold text-primary hover:underline">
                Visualizar pacientes inativos ou todos
              </button>
            }
          </div>
        } @else {
          <!-- Desktop & Tablet Table (md and up, com rolagem horizontal touch fluida para iPad) -->
          <div class="hidden md:block overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
            <table class="w-full text-left border-collapse min-w-[840px]">
              <thead>
                <tr class="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Paciente</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Idade</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Instituição</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Portal Pais</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right min-w-[280px]">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (p of items(); track p.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <!-- Paciente -->
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="size-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-800 shrink-0 overflow-hidden"
                          [style.background]="getAvatarColor(p.name)">
                          @if (p.avatarUrl || p.avatar) {
                            <img [src]="p.avatarUrl || p.avatar" class="size-full object-cover">
                          } @else {
                            {{ getInitials(p.name) }}
                          }
                        </div>
                        <div class="min-w-0">
                          <p class="font-bold text-slate-900 dark:text-white text-sm truncate">{{ p.name }}</p>
                          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ p.email || p.responsible?.name || 'Sem contato extra' }}</p>
                        </div>
                      </div>
                    </td>

                    <!-- Idade -->
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {{ p.birthDate ? calculateAge(p.birthDate) + ' anos' : '—' }}
                    </td>

                    <!-- Instituição -->
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <span class="truncate block max-w-[180px]" [title]="p.school?.name || p.school || '—'">
                        {{ p.school?.name || p.school || '—' }}
                      </span>
                    </td>

                    <!-- Código Portal -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-1.5">
                        <code class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          {{ p.accessCode || '—' }}
                        </code>
                        @if (p.accessCode) {
                          <button class="p-1 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-all" (click)="copyAccessCode(p.accessCode)" title="Copiar código">
                            <span class="material-icons text-sm">content_copy</span>
                          </button>
                        }
                      </div>
                    </td>

                    <!-- Status -->
                    <td class="px-6 py-4 text-center whitespace-nowrap">
                      <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                        [class]="p.active ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'">
                        <span class="size-1.5 rounded-full" [class]="p.active ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                        {{ p.active ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>

                    <!-- Ações Completas no Desktop e iPad -->
                    <td class="px-6 py-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5 flex-nowrap">
                        <!-- Visualizar -->
                        <a [routerLink]="['/app/pacientes', p.id]"
                          class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                          title="Ver Perfil e Prontuário">
                          <span class="material-icons text-[15px]">visibility</span>
                          <span>Ver</span>
                        </a>

                        <!-- Editar -->
                        <a [routerLink]="['/app/pacientes', p.id, 'editar']"
                          class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                          title="Editar Cadastro">
                          <span class="material-icons text-[15px]">edit</span>
                          <span>Editar</span>
                        </a>

                        <!-- Ativar / Desativar -->
                        @if (p.active) {
                          <button (click)="confirmToggleStatus(p)"
                            class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                            title="Desativar paciente (preserva prontuários e histórico)">
                            <span class="material-icons text-[15px]">pause_circle</span>
                            <span>Desativar</span>
                          </button>
                        } @else {
                          <button (click)="confirmToggleStatus(p)"
                            class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                            title="Reativar paciente">
                            <span class="material-icons text-[15px]">play_circle</span>
                            <span>Ativar</span>
                          </button>
                        }

                        <!-- Excluir -->
                        <button (click)="confirmDelete(p)"
                          class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/70 dark:border-red-900/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                          title="Excluir paciente">
                          <span class="material-icons text-[15px]">delete</span>
                          <span>Excluir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Cards Mobile (telas menores que md) -->
          <div class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            @for (p of items(); track p.id) {
              <div class="p-4 space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div class="size-11 rounded-full flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0 overflow-hidden"
                      [style.background]="getAvatarColor(p.name)">
                      @if (p.avatarUrl || p.avatar) {
                        <img [src]="p.avatarUrl || p.avatar" class="size-full object-cover">
                      } @else {
                        {{ getInitials(p.name) }}
                      }
                    </div>
                    <div class="min-w-0 flex-1">
                      <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">{{ p.name }}</h4>
                      <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ p.email || 'Sem email' }}</p>
                    </div>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0"
                    [class]="p.active ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'">
                    {{ p.active ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
                  <div>
                    <span class="text-[10px] font-bold text-slate-500 uppercase block">Idade</span>
                    <span class="font-semibold text-slate-800 dark:text-slate-200">{{ p.birthDate ? calculateAge(p.birthDate) + ' anos' : '—' }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-bold text-slate-500 uppercase block">Instituição</span>
                    <span class="font-semibold text-slate-800 dark:text-slate-200 truncate block">{{ p.school?.name || p.school || '—' }}</span>
                  </div>
                  @if (p.accessCode) {
                    <div class="col-span-2 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span class="text-[10px] font-bold text-slate-500 uppercase">Cód. Portal:</span>
                      <div class="flex items-center gap-1.5">
                        <code class="px-2 py-0.5 bg-white dark:bg-slate-700 rounded text-xs font-mono font-bold text-primary">{{ p.accessCode }}</code>
                        <button class="p-1 text-slate-400 hover:text-primary rounded" (click)="copyAccessCode(p.accessCode)">
                          <span class="material-icons text-[14px]">content_copy</span>
                        </button>
                      </div>
                    </div>
                  }
                </div>

                <!-- 4 Ações no Card Mobile / Touch -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <a [routerLink]="['/app/pacientes', p.id]"
                    class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all">
                    <span class="material-icons text-[16px]">visibility</span>
                    <span>Ver</span>
                  </a>
                  <a [routerLink]="['/app/pacientes', p.id, 'editar']"
                    class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all">
                    <span class="material-icons text-[16px]">edit</span>
                    <span>Editar</span>
                  </a>
                  @if (p.active) {
                    <button (click)="confirmToggleStatus(p)"
                      class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/60 rounded-xl text-xs font-bold transition-all">
                      <span class="material-icons text-[16px]">pause_circle</span>
                      <span>Desativar</span>
                    </button>
                  } @else {
                    <button (click)="confirmToggleStatus(p)"
                      class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/60 rounded-xl text-xs font-bold transition-all">
                      <span class="material-icons text-[16px]">play_circle</span>
                      <span>Ativar</span>
                    </button>
                  }
                  <button (click)="confirmDelete(p)"
                    class="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/70 dark:border-red-900/60 rounded-xl text-xs font-bold transition-all">
                    <span class="material-icons text-[16px]">delete</span>
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Modal de Confirmação: Excluir Paciente -->
    <app-confirm-modal
      [isOpen]="showDeleteModal()"
      title="Excluir Paciente Definitivamente"
      [message]="'Tem certeza que deseja excluir o cadastro de ' + (pacienteToDelete()?.name || 'este paciente') + '? Esta ação remove o cadastro de forma permanente.'"
      confirmText="Sim, Excluir Registro"
      [dangerMode]="true"
      (closed)="showDeleteModal.set(false)"
      (confirmed)="deletePaciente()" />

    <!-- Modal de Confirmação: Ativar ou Desativar Paciente -->
    <app-confirm-modal
      [isOpen]="showStatusModal()"
      [title]="pacienteToToggle()?.active ? 'Desativar Paciente' : 'Reativar Paciente'"
      [message]="pacienteToToggle()?.active 
        ? 'Deseja desativar ' + (pacienteToToggle()?.name || 'este paciente') + '? Ele não aparecerá na listagem ativa do dia a dia, mas todo o histórico (prontuários, laudos e sessões) permanecerá 100% seguro.'
        : 'Deseja reativar ' + (pacienteToToggle()?.name || 'este paciente') + '? Ele voltará a aparecer normalmente nos atendimentos e na lista de pacientes ativos.'"
      [confirmText]="pacienteToToggle()?.active ? 'Sim, Desativar' : 'Sim, Reativar'"
      [mode]="pacienteToToggle()?.active ? 'warning' : 'success'"
      [icon]="pacienteToToggle()?.active ? 'pause_circle' : 'play_circle'"
      (closed)="showStatusModal.set(false)"
      (confirmed)="toggleStatusPaciente()" />

    <!-- Modal do Scanner de Ficha IA -->
    @if (showScannerModal()) {
      <app-ficha-scanner-modal
        [title]="'Escanear Ficha para Cadastro'"
        [tipoFicha]="'PACIENTE'"
        (scanned)="onFichaScanned($event)"
        (cancelled)="showScannerModal.set(false)" />
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PacientesListComponent implements OnInit {
  private service = inject(PacientesService);
  private router = inject(Router);
  private toast = inject(ToastService);

  items = signal<any[]>([]);
  loading = signal(true);
  searchTerm = '';
  filterStatus = 'active'; // Padrão: Apenas ativos

  showDeleteModal = signal(false);
  pacienteToDelete = signal<any>(null);

  showStatusModal = signal(false);
  pacienteToToggle = signal<any>(null);

  showScannerModal = signal(false);
  patientsWithoutCodes = signal(0);
  generatingCodes = signal(false);
  private timeout: any;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const params: any = {};
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.filterStatus) {
      params.status = this.filterStatus;
      params.active = this.filterStatus === 'active' ? 'true' : 'false';
    }
    this.service.list(params).subscribe({
      next: (res: any) => {
        const data = res.data || [];
        this.items.set(data);
        this.patientsWithoutCodes.set(data.filter((p: any) => !p.accessCode).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  generateAllCodes() {
    this.generatingCodes.set(true);
    const patientsWithout = this.items().filter(p => !p.accessCode);
    let completed = 0;

    patientsWithout.forEach(p => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      this.service.update(p.id, { accessCode: code }).subscribe({
        next: () => {
          completed++;
          if (completed === patientsWithout.length) {
            this.generatingCodes.set(false);
            this.load();
          }
        },
        error: () => {
          completed++;
          if (completed === patientsWithout.length) {
            this.generatingCodes.set(false);
            this.load();
          }
        }
      });
    });

    if (patientsWithout.length === 0) {
      this.generatingCodes.set(false);
    }
  }

  onSearch() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.load(), 300);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = ['#007F80', '#0284C7', '#059669', '#D97706', '#DC2626', '#475569'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }

  calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  copyAccessCode(code: string) {
    navigator.clipboard.writeText(code);
    this.toast.success('Código copiado para a área de transferência!');
  }

  confirmDelete(paciente: any) {
    this.pacienteToDelete.set(paciente);
    this.showDeleteModal.set(true);
  }

  deletePaciente() {
    const p = this.pacienteToDelete();
    if (!p) return;
    this.service.delete(p.id).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.toast.success('Paciente excluído com sucesso.');
        this.load();
      },
      error: (err: any) => {
        this.showDeleteModal.set(false);
        this.toast.error(err?.error?.error || 'Erro ao excluir paciente');
      }
    });
  }

  confirmToggleStatus(paciente: any) {
    this.pacienteToToggle.set(paciente);
    this.showStatusModal.set(true);
  }

  toggleStatusPaciente() {
    const p = this.pacienteToToggle();
    if (!p) return;
    const nextActive = !p.active;
    this.service.toggleStatus(p.id, nextActive).subscribe({
      next: () => {
        this.showStatusModal.set(false);
        this.toast.success(nextActive ? 'Paciente reativado com sucesso!' : 'Paciente desativado com sucesso! Histórico preservado.');
        this.load();
      },
      error: (err: any) => {
        this.showStatusModal.set(false);
        this.toast.error(err?.error?.error || 'Erro ao alterar status do paciente.');
      }
    });
  }

  onFichaScanned(result: ScanResult) {
    this.showScannerModal.set(false);
    this.service.setScanDraft(result);
    this.router.navigate(['/app/pacientes/novo']);
  }
}
