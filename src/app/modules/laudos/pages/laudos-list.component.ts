import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LaudoService } from '../services/laudo.service';

@Component({
  selector: 'app-laudos-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-[1200px] legacy-page">
      <div class="flex justify-between items-start mb-5">
        <div>
          <h1 class="text-2xl font-bold m-0">Laudos</h1>
          <p class="text-sm text-slate-500 mt-1">Laudos e pareceres</p>
        </div>
        <a routerLink="/app/laudos/novo" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm no-underline">
          <span class="material-icons text-[18px]">add</span>
          Novo
        </a>
      </div>

      @if (loading()) {
        <div class="text-center py-10 text-slate-500">Carregando...</div>
      } @else if (items().length === 0) {
        <div class="text-center py-10">
          <span class="material-icons text-[48px] text-slate-300">description</span>
          <p class="text-slate-500 mt-2">Nenhum laudo encontrado</p>
        </div>
      } @else {
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 legacy-card">
          <div class="p-4">
            <table class="w-full border-collapse">
              <thead>
                <tr>
                  <th class="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                  <th class="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Paciente</th>
                  <th class="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Título</th>
                  <th class="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                  <th class="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th class="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (l of items(); track l.id) {
                  <tr class="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td class="px-3 py-3 text-sm text-slate-600">{{ l.createdAt | date:'dd/MM/yyyy' }}</td>
                    <td class="px-3 py-3 text-sm font-semibold text-slate-900">{{ l.paciente?.name }}</td>
                    <td class="px-3 py-3 text-sm text-slate-700">{{ l.titulo }}</td>
                    <td class="px-3 py-3 text-sm text-slate-600">{{ l.type }}</td>
                    <td class="px-3 py-3">
                      @if (l.status === 'ASSINADO') {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                          <span class="material-icons text-[12px]">verified</span>
                          Assinado
                        </span>
                      } @else {
                        <span class="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold"
                          [class]="l.status === 'RASCUNHO' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'">
                          {{ l.status }}
                        </span>
                      }
                    </td>
                    <td class="px-3 py-3">
                      <div class="flex gap-1">
                        <a [routerLink]="['/app/laudos', l.id]" class="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
                          <span class="material-icons text-[16px]">visibility</span>
                        </a>
                        <a [routerLink]="['/app/laudos', l.id, 'editar']" class="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
                          <span class="material-icons text-[16px]">edit</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class LaudosListComponent implements OnInit {
  private service = inject(LaudoService);
  items = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.service.list().subscribe({
      next: (res: any) => {
        this.items.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
