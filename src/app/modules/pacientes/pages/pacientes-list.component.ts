import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PacientesService } from '../services/pacientes.service';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-8 animate-in">
      <!-- Alert for missing access codes -->
      @if (patientsWithoutCodes() > 0) {
        <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex items-center justify-between gap-4 animate-pulse">
          <div class="flex items-center gap-3">
            <div class="size-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <span class="material-icons text-xl">vpn_key</span>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900 dark:text-white">Alunos sem código de acesso</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ patientsWithoutCodes() }} alunos ainda não possuem código para o portal dos pais.</p>
            </div>
          </div>
          <button class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
            (click)="generateAllCodes()" [disabled]="generatingCodes()">
            <span class="material-icons text-sm" [class.animate-spin]="generatingCodes()">refresh</span>
            {{ generatingCodes() ? 'Gerando...' : 'Gerar Códigos Agora' }}
          </button>
        </div>
      }

      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div class="w-full lg:max-w-md">
          <div class="relative group">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
            <input type="text" class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary shadow-sm transition-all outline-none"
              placeholder="Buscar por nome, ID ou responsável..."
              [(ngModel)]="searchTerm" (input)="onSearch()">
          </div>
        </div>
        <div class="flex items-center gap-3 w-full lg:w-auto">
          <select class="flex-1 lg:flex-none px-5 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all outline-none"
            [(ngModel)]="filterStatus" (change)="load()">
            <option value="">Status: Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
          <a routerLink="/app/pacientes/novo"
            class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
            <span class="material-icons text-[18px]">add</span>
            <span>Novo Paciente</span>
          </a>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center p-12 text-slate-400">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        } @else if (items().length === 0) {
          <div class="text-center py-16">
            <span class="material-icons text-6xl text-slate-300">people</span>
            <p class="text-slate-500 mt-4 text-sm">Nenhum paciente encontrado</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Detalhes do Paciente</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Idade</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Instituição</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cód. Acesso</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (p of items(); track p.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="size-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-800"
                          [style.background]="getAvatarColor(p.name)">
                          {{ getInitials(p.name) }}
                        </div>
                        <div>
                          <p class="font-bold text-slate-900 dark:text-white text-sm">{{ p.name }}</p>
                          <p class="text-xs text-slate-500 dark:text-slate-400">{{ p.email || 'Sem email' }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ p.birthDate ? calculateAge(p.birthDate) + ' anos' : '—' }}</td>
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ p.school || '—' }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <code class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300">{{ p.accessCode || '—' }}</code>
                        @if (p.accessCode) {
                          <button class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" (click)="copyAccessCode(p.accessCode)" title="Copiar código">
                            <span class="material-icons text-sm">content_copy</span>
                          </button>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                        [class]="p.active ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'">
                        {{ p.active ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-end gap-1">
                        <a [routerLink]="['/app/pacientes', p.id]" class="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Ver detalhes">
                          <span class="material-icons text-lg">visibility</span>
                        </a>
                        <a [routerLink]="['/app/pacientes', p.id, 'editar']" class="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all" title="Editar">
                          <span class="material-icons text-lg">edit</span>
                        </a>
                        <button class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Excluir" (click)="confirmDelete(p)">
                          <span class="material-icons text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>

    @if (showDeleteModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="showDeleteModal.set(false)">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 ring-1 ring-slate-200 dark:ring-slate-800" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-4 mb-6">
            <div class="size-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
              <span class="material-icons text-red-600 dark:text-red-400 text-2xl">warning</span>
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white">Excluir Paciente</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">Esta ação não pode ser desfeita</p>
            </div>
          </div>
          <p class="text-slate-600 dark:text-slate-400 mb-8">Tem certeza que deseja excluir <strong class="text-slate-900 dark:text-white">{{ pacienteToDelete()?.name }}</strong>?</p>
          <div class="flex justify-end gap-3">
            <button class="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all" (click)="showDeleteModal.set(false)">Cancelar</button>
            <button class="px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20" (click)="deletePaciente()">Excluir</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PacientesListComponent implements OnInit {
  private service = inject(PacientesService);
  items = signal<any[]>([]);
  loading = signal(true);
  searchTerm = '';
  filterStatus = '';
  showDeleteModal = signal(false);
  pacienteToDelete = signal<any>(null);
  patientsWithoutCodes = signal(0);
  generatingCodes = signal(false);
  private timeout: any;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const params: any = {};
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.filterStatus) params.status = this.filterStatus;
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
    const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#06B6D4', '#84CC16'];
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
  }

  confirmDelete(paciente: any) {
    this.pacienteToDelete.set(paciente);
    this.showDeleteModal.set(true);
  }

  deletePaciente() {
    const p = this.pacienteToDelete();
    if (!p) return;
    this.service.delete(p.id).subscribe({
      next: () => { this.showDeleteModal.set(false); this.load(); },
      error: () => alert('Erro ao excluir paciente')
    });
  }
}
