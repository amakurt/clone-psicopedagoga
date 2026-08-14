import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SolicitacoesService } from '../services/solicitacoes.service';

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  PENDENTE: { label: 'Aguardando', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
  RESPONDIDO: { label: 'Respondido', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  EXPIRADO: { label: 'Expirado', cls: 'bg-red-50 text-red-600 border-red-200' },
  CANCELADO: { label: 'Cancelado', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

type StatusKey = 'PENDENTE' | 'RESPONDIDO' | 'EXPIRADO' | 'CANCELADO';
const STATUS = STATUS_CONFIG;

@Component({
  selector: 'app-solicitacoes-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Solicitações</h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Formulários enviados para responsáveis preencherem online</p>
        </div>
        <a routerLink="/app/solicitacoes/novo" class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:opacity-90 transition-all">
          <span class="material-icons text-lg">add</span> Nova Solicitação
        </a>
      </div>

      <div class="flex gap-2 mb-5">
        @for (f of filters; track f.key) {
          <button class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
            [class]="statusFilter() === f.key ? 'bg-primary text-on-primary border-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'"
            (click)="statusFilter.set(f.key); load()">
            {{ f.label }}
          </button>
        }
      </div>

      @if (loading()) {
        <p class="text-slate-500 text-sm">Carregando...</p>
      } @else if (items().length === 0) {
        <div class="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span class="material-icons text-5xl text-slate-300">assignment_turned_in</span>
          <p class="mt-3 text-slate-500 dark:text-slate-400 text-sm">Nenhuma solicitação {{ statusFilter() !== 'TODAS' ? 'neste status' : '' }}</p>
        </div>
      } @else {
        <div class="grid gap-4">
          @for (s of items(); track s.id) {
            <a [routerLink]="['/app/solicitacoes', s.id]"
              class="block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg hover:border-primary/40 transition-all">
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    [class]="s.status === 'RESPONDIDO' ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'">
                    <span class="material-icons">{{ s.status === 'RESPONDIDO' ? 'task_alt' : 'send' }}</span>
                  </div>
                  <div class="min-w-0">
                    <h3 class="font-bold text-slate-900 dark:text-white truncate">{{ s.title }}</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {{ s.responsible?.name }} <ng-container *ngIf="s.paciente?.name">· {{ s.paciente.name }}</ng-container>
                      · {{ s.createdAt | date:'dd/MM/yyyy HH:mm' }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  @if (s.status === 'RESPONDIDO') {
                    <span class="text-xs font-bold text-emerald-600">{{ s.submittedAt | date:'dd/MM HH:mm' }}</span>
                  }
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-bold border" [class]="badgeCls(s.status)">
                    {{ STATUS[s.status]?.label || s.status }}
                  </span>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class SolicitacoesListComponent implements OnInit {
  private service = inject(SolicitacoesService);
  items = signal<any[]>([]);
  loading = signal(true);
  statusFilter = signal('TODAS');
  STATUS = STATUS;

  filters = [
    { key: 'TODAS', label: 'Todas' },
    { key: 'PENDENTE', label: 'Aguardando' },
    { key: 'RESPONDIDO', label: 'Respondidas' },
    { key: 'EXPIRADO', label: 'Expiradas' },
  ];

  ngOnInit() { this.load(); }

  badgeCls(status: string) {
    return STATUS[status]?.cls || STATUS['PENDENTE'].cls;
  }

  load() {
    this.loading.set(true);
    const params: any = {};
    if (this.statusFilter() !== 'TODAS') params.status = this.statusFilter();
    this.service.list(params).subscribe({
      next: (res: any) => { this.items.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
