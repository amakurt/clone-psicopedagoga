import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-solicitacao-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button (click)="router.navigate(['/app/solicitacoes'])"
          class="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <span class="material-icons">arrow_back</span>
        </button>
        <div class="flex-1 min-w-0">
          @if (doc()) {
            <h1 class="text-2xl font-black text-slate-900 dark:text-white truncate">{{ doc().title }}</h1>
            <p class="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              {{ doc().responsible?.name }} · Criado em {{ doc().createdAt | date:'dd/MM/yyyy HH:mm' }}
            </p>
          }
        </div>
        @if (doc()) {
          <span class="px-3 py-1.5 rounded-full text-xs font-bold border shrink-0"
            [class]="badgeCls(doc().status)">
            {{ STATUS[doc().status]?.label || doc().status }}
          </span>
        }
      </div>

      @if (error()) {
        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
          <span class="material-icons text-lg">error</span> {{ error() }}
        </div>
      }
      @if (notice()) {
        <div class="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm flex items-center gap-2">
          <span class="material-icons text-lg">check_circle</span> {{ notice() }}
        </div>
      }

      @if (doc()) {
        @if (doc().description) {
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-5">
            <p class="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{{ doc().description }}</p>
          </div>
        }

        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-5">
          <h2 class="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span class="material-icons text-primary">link</span> Link do formulário
          </h2>
          <div class="flex gap-2">
            <input class="flex-1 px-4 py-2.5 border rounded-xl text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 dark:border-slate-600 outline-none"
              [value]="doc().link" readonly>
            <button class="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
              (click)="copyLink()" title="Copiar link">
              <span class="material-icons text-base align-middle">content_copy</span>
            </button>
          </div>
          @if (doc().status !== 'RESPONDIDO') {
            <button class="mt-3 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
              (click)="resend()" [disabled]="resending()">
              {{ resending() ? 'Enviando...' : 'Reenviar por email / WhatsApp' }}
            </button>
          }
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-icons" [class.text-emerald-500]="doc().status === 'RESPONDIDO'">fact_check</span>
              Respostas
            </h2>
            @if (doc().status === 'RESPONDIDO') {
              <button class="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                (click)="exportPDF()">
                <span class="material-icons text-base align-middle">picture_as_pdf</span> Exportar PDF
              </button>
            }
          </div>

          @if (doc().status !== 'RESPONDIDO') {
            <p class="text-sm text-slate-400 text-center py-8">
              Ainda aguardando o responsável preencher. Compartilhe o link acima.
            </p>
          } @else {
            <div class="divide-y divide-slate-100 dark:divide-slate-700">
              @for (f of doc().template; track f.id) {
                @if (hasAnswer(f.id)) {
                  <div class="py-3">
                    <p class="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">
                      {{ f.label }} @if (f.required) { <span class="text-red-400">*</span> }
                    </p>
                    <p class="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{{ displayAnswer(f) }}</p>
                  </div>
                }
              }
            </div>
          }
        </div>

        <!-- Área de impressão PDF -->
        @if (doc().status === 'RESPONDIDO') {
          <div id="pdf-preview" class="hidden">
            <div style="font-family:Arial,sans-serif;padding:32px;color:#0f172a">
              <h1 style="font-size:20px;font-weight:bold;border-bottom:2px solid #1e1b4b;padding-bottom:12px;margin-bottom:8px">{{ doc().title }}</h1>
              <p style="font-size:12px;color:#64748b;margin:0 0 24px">
                Responsável: {{ doc().responsible?.name }} · Preenchido em {{ doc().submittedAt | date:'dd/MM/yyyy HH:mm' }}
              </p>
              <table style="width:100%;border-collapse:collapse">
                @for (f of doc().template; track f.id) {
                  @if (hasAnswer(f.id)) {
                    <tr>
                      <td style="border:1px solid #e2e8f0;padding:10px 12px;font-size:12px;font-weight:bold;width:40%;background:#f8fafc">{{ f.label }}</td>
                      <td style="border:1px solid #e2e8f0;padding:10px 12px;font-size:12px">{{ displayAnswer(f) }}</td>
                    </tr>
                  }
                }
              </table>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class SolicitacaoDetailComponent implements OnInit {
  private service = inject(SolicitacoesService);
  private route = inject(ActivatedRoute);
  router = inject(Router);

  doc = signal<any>(null);
  resending = signal(false);
  error = signal('');
  notice = signal('');
  STATUS = STATUS_CONFIG;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.service.get(id).subscribe({
      next: (res: any) => this.doc.set({ ...res, template: res.template || [], answers: res.answers || {} }),
      error: () => this.error.set('Não foi possível carregar a solicitação'),
    });
  }

  badgeCls(status: string) {
    return STATUS[status]?.cls || STATUS['PENDENTE'].cls;
  }

  hasAnswer(fieldId: string) {
    const d = this.doc();
    return d?.answers?.[fieldId] !== undefined;
  }

  displayAnswer(f: any) {
    const d = this.doc();
    const value = d?.answers?.[f.id];
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (Array.isArray(value)) return value.join(', ');
    if (value === '' || value === null || value === undefined) return '—';
    return value;
  }

  copyLink() {
    const link = this.doc()?.link;
    if (!link) return;
    navigator.clipboard?.writeText(link);
    this.notice.set('Link copiado!');
    setTimeout(() => this.notice.set(''), 2000);
  }

  resend() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.resending.set(true);
    this.service.resend(id).subscribe({
      next: () => {
        this.notice.set('Reenviado com sucesso!');
        this.resending.set(false);
        setTimeout(() => this.notice.set(''), 3000);
      },
      error: (err: any) => {
        this.error.set(err.error?.error || 'Erro ao reenviar');
        this.resending.set(false);
      },
    });
  }

  exportPDF() {
    const content = document.getElementById('pdf-preview');
    if (!content) return;

    import('html2pdf.js').then(html2pdf => {
      html2pdf.default()
        .set({
          margin: 10,
          filename: `formulario-${this.doc()?.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(content)
        .save();
    });
  }
}
