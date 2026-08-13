import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LaudoService } from '../services/laudo.service';

@Component({
  selector: 'app-laudo-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-[900px] legacy-page">
      <div class="flex justify-between items-start mb-5">
        <div>
          <h1 class="text-2xl font-bold m-0">{{ item()?.titulo }}</h1>
          <p class="text-sm text-slate-500 mt-1">{{ item()?.paciente?.name }} — {{ item()?.createdAt | date:'dd/MM/yyyy' }}</p>
        </div>
        <div class="flex gap-2">
          <a routerLink="/app/laudos" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 no-underline">
            <span class="material-icons text-[18px]">arrow_back</span>
          </a>
          <a [routerLink]="['/app/laudos', id, 'editar']" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark no-underline">
            <span class="material-icons text-[18px]">edit</span>
          </a>
        </div>
      </div>

      @if (item()) {
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 legacy-card">
          <div class="p-6">
            <div class="flex gap-4 items-center mb-5 pb-4 border-b border-slate-200 text-sm text-slate-600">
              @if (item()?.status === 'ASSINADO') {
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  <span class="material-icons text-[14px]">verified</span>
                  Assinado digitalmente
                </span>
              } @else {
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  [class]="item()?.status === 'RASCUNHO' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">
                  {{ item()?.status }}
                </span>
              }
              <span>Por: {{ item()?.autor?.name }}</span>
            </div>
            <div class="text-[15px] leading-relaxed whitespace-pre-wrap text-slate-800">{{ item()?.content }}</div>

            @if (item()?.status === 'ASSINADO' && item()?.signatureImage) {
              <div class="mt-6 pt-5 border-t border-slate-200">
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Assinatura Digital</p>
                <div class="inline-block p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <img [src]="item()?.signatureImage" alt="Assinatura" class="max-h-20">
                </div>
                @if (item()?.signedAt) {
                  <p class="text-xs text-slate-400 mt-2">
                    Assinado em {{ item()?.signedAt | date:'dd/MM/yyyy HH:mm' }}
                  </p>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class LaudoDetailComponent implements OnInit {
  private service = inject(LaudoService);
  private route = inject(ActivatedRoute);
  id = '';
  item = signal<any>(null);

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.service.get(this.id).subscribe((res: any) => this.item.set(res));
  }
}
