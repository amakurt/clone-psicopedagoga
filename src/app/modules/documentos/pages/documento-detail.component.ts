import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DocumentosService } from '../services/documentos.service';
import { UploadService } from '@core/services/upload.service';
import { resolveFileUrl } from '@core/utils/file-url';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-documento-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <a routerLink="/app/documentos" class="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <span class="material-icons text-slate-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ item()?.name }}</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ item()?.paciente?.name || 'Documento Geral' }} — Criado em {{ item()?.createdAt | date:'dd/MM/yyyy' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 self-start sm:self-auto">
          @if (item()?.content) {
            <button (click)="printA4()" 
              class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
              title="Imprimir folha A4 em papel limpo ou timbrado">
              <span class="material-icons text-[18px]">print</span>
              <span>Imprimir A4</span>
            </button>
          }

          <a [routerLink]="['/app/documentos', id, 'editar']" 
            class="px-5 py-2.5 bg-primary hover:bg-primary-dark text-on-primary rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
            <span class="material-icons text-[18px]">edit_note</span>
            <span>Editar no Editor A4</span>
          </a>
        </div>
      </div>

      @if (item()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content (A4 & Texto) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Conteúdo Clínico A4 -->
            @if (item()?.content) {
              <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                  <div class="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-sm uppercase tracking-wider">
                    <span class="material-icons text-[20px]">description</span>
                    Documento Clínico Oficial (Versão de Trabalho A4)
                  </div>

                  <button (click)="printA4()" 
                    class="text-xs text-slate-500 hover:text-primary font-semibold flex items-center gap-1 transition-colors">
                    <span class="material-icons text-[16px]">print</span>
                    Imprimir página
                  </button>
                </div>

                <!-- Printable A4 Area Container -->
                <div #printableArea class="a4-document-preview bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm">
                  <!-- Header timbrado se paciente existir -->
                  @if (item()?.paciente) {
                    <div class="mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3 text-xs text-slate-500">
                      <div>
                        <span class="block text-[10px] uppercase font-bold text-slate-400">Paciente</span>
                        <strong class="text-sm font-bold text-slate-900 dark:text-white">{{ item()?.paciente?.name }}</strong>
                      </div>
                      <div class="text-right">
                        <span class="block text-[10px] uppercase font-bold text-slate-400">Data</span>
                        <span class="font-medium text-slate-700 dark:text-slate-300">{{ item()?.createdAt | date:'dd/MM/yyyy' }}</span>
                      </div>
                    </div>
                  }

                  <!-- Document HTML Body -->
                  <div class="a4-html-content leading-relaxed" [innerHTML]="item()?.content"></div>
                </div>
              </div>
            }

            <!-- Descrição / Resumo -->
            @if (item()?.description) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <span class="material-icons text-slate-400 text-[18px]">info</span>
                  Descrição / Resumo
                </h3>
                <p class="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{{ item()?.description }}</p>
              </div>
            }

            <!-- Arquivo Original Anexo (Garantia Documental) -->
            @if (item()?.fileUrl) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span class="material-icons text-slate-400 text-[18px]">attach_file</span>
                      Arquivo Original Anexado
                    </h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Preservado como garantia jurídica e comprovação documental</p>
                  </div>
                </div>

                <div class="aspect-[3/4] max-h-[450px] bg-slate-100 dark:bg-slate-700/60 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                  @if (isImage(item()?.fileUrl)) {
                    <img [src]="resolveFileUrl(item()?.fileUrl)" class="w-full h-full object-contain">
                  } @else {
                    <div class="text-center p-6">
                      <span class="material-icons text-7xl text-slate-300 dark:text-slate-600">{{ getFileIcon(item()?.fileUrl) }}</span>
                      <p class="mt-4 text-sm text-slate-600 dark:text-slate-300 font-semibold">{{ item()?.name }}</p>
                    </div>
                  }
                </div>

                <div class="flex flex-wrap gap-3">
                  <a [href]="resolveFileUrl(item()?.fileUrl)" target="_blank" 
                    class="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-on-primary rounded-xl font-bold text-xs text-center transition-all flex items-center justify-center gap-2 shadow-sm">
                    <span class="material-icons text-[16px]">open_in_new</span>
                    Abrir em nova aba
                  </a>
                  <a [href]="resolveFileUrl(item()?.fileUrl)" download 
                    class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 text-center transition-all flex items-center justify-center gap-2">
                    <span class="material-icons text-[16px]">download</span>
                    Baixar Original
                  </a>
                </div>
              </div>
            }
          </div>

          <!-- Sidebar de Informações -->
          <div class="lg:col-span-1">
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 sticky top-4 space-y-6">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Detalhes do Documento</h3>

              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-slate-500 dark:text-slate-400">Status</span>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                    [class]="getStatusClass(item()?.status)">
                    {{ item()?.status || 'Ativo' }}
                  </span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-slate-500 dark:text-slate-400">Categoria</span>
                  <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ item()?.category || 'Geral' }}</span>
                </div>

                @if (item()?.paciente) {
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-slate-500 dark:text-slate-400">Paciente</span>
                    <a [routerLink]="['/app/pacientes', item()?.paciente?.id]" 
                      class="text-sm font-bold text-primary hover:underline">
                      {{ item()?.paciente?.name }}
                    </a>
                  </div>
                }

                @if (item()?.size) {
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-slate-500 dark:text-slate-400">Tamanho do Anexo</span>
                    <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ uploadService.formatFileSize(parseInt(item()?.size)) }}</span>
                  </div>
                }

                <div class="flex justify-between items-center">
                  <span class="text-sm text-slate-500 dark:text-slate-400">Data de Criação</span>
                  <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ item()?.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-slate-500 dark:text-slate-400">Última Modificação</span>
                  <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ item()?.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>

                @if (item()?.isShared) {
                  <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span class="material-icons text-[18px]">group</span>
                    <span class="text-xs font-bold">Compartilhado com os responsáveis</span>
                  </div>
                }
              </div>

              <!-- Ações Rápidas -->
              <div class="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
                <a [routerLink]="['/app/documentos', id, 'editar']" 
                  class="w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                  <span class="material-icons text-[16px]">edit</span>
                  Editar Metadados & Conteúdo
                </a>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .a4-html-content :deep(h1), .a4-html-content :deep(h2) {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      margin-top: 1.25rem;
      margin-bottom: 0.5rem;
    }
    .a4-html-content :deep(h3) {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      margin-top: 1rem;
      margin-bottom: 0.25rem;
    }
    .a4-html-content :deep(p) {
      margin-bottom: 0.75rem;
      line-height: 1.6;
    }
    .a4-html-content :deep(ul) {
      list-style-type: disc;
      padding-left: 1.5rem;
      margin-bottom: 0.75rem;
    }
    .a4-html-content :deep(ol) {
      list-style-type: decimal;
      padding-left: 1.5rem;
      margin-bottom: 0.75rem;
    }
    .a4-html-content :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    .a4-html-content :deep(table, th, td) {
      border: 1px solid #cbd5e1;
      padding: 6px 12px;
    }
    .a4-html-content :deep(th) {
      background-color: #f1f5f9;
      font-weight: bold;
    }
  `]
})
export class DocumentoDetailComponent implements OnInit {
  private service = inject(DocumentosService);
  private route = inject(ActivatedRoute);
  uploadService = inject(UploadService);
  private auth = inject(AuthService);

  @ViewChild('printableArea') printableArea!: ElementRef<HTMLDivElement>;

  resolveFileUrl = resolveFileUrl;

  id = '';
  item = signal<any>(null);

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.service.get(this.id).subscribe((res: any) => this.item.set(res));
  }

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url || '');
  }

  getFileIcon(url: string): string {
    const ext = url?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'picture_as_pdf';
    if (['doc', 'docx'].includes(ext || '')) return 'article';
    if (['xls', 'xlsx'].includes(ext || '')) return 'table_chart';
    return 'insert_drive_file';
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ATIVO':
      case 'PRONTO':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'RASCUNHO':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'ARQUIVADO':
        return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  }

  parseInt(value: string): number {
    return parseInt(value) || 0;
  }

  printA4() {
    const content = this.item()?.content;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      window.print();
      return;
    }

    const docName = this.item()?.name || 'Documento Clínico';
    const pacienteName = this.item()?.paciente?.name || '';
    const tenant: any = this.auth.tenant();
    const clinicName = tenant?.name || 'Clínica Especializada';

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <title>${docName}${pacienteName ? ' - ' + pacienteName : ''}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 18mm 16mm 18mm 16mm;
            }
            body {
              font-family: 'Plus Jakarta Sans', Arial, sans-serif;
              color: #1e293b;
              background: #fff;
              margin: 0;
              padding: 0;
              line-height: 1.5;
              font-size: 13px;
            }
            .header-timbre {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .clinic-title {
              font-size: 16px;
              font-weight: 800;
              text-transform: uppercase;
              color: #0f172a;
            }
            .patient-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 10px 14px;
              margin-bottom: 18px;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
            }
            h1, h2 {
              font-size: 15px;
              font-weight: 800;
              color: #0f172a;
              margin-top: 16px;
              margin-bottom: 6px;
              text-transform: uppercase;
            }
            h3, h4 {
              font-size: 13px;
              font-weight: 700;
              color: #334155;
              margin-top: 12px;
              margin-bottom: 4px;
            }
            p { margin: 0 0 8px 0; text-align: justify; }
            ul, ol { margin: 4px 0 10px 20px; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; }
            table, th, td { border: 1px solid #cbd5e1; padding: 6px 10px; }
            th { background-color: #f1f5f9; font-weight: bold; }
            .footer-info {
              margin-top: 30px;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
              font-size: 10px;
              color: #64748b;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header-timbre">
            <div>
              <div class="clinic-title">${clinicName}</div>
              <div style="font-size:11px;color:#64748b">Documento Clínico e Psicopedagógico</div>
            </div>
            <div style="text-align:right;font-size:11px;color:#64748b">
              Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>

          ${pacienteName ? `
            <div class="patient-box">
              <div><strong>Paciente:</strong> ${pacienteName}</div>
              <div><strong>Documento:</strong> ${docName}</div>
            </div>
          ` : ''}

          <div class="document-content">
            ${content}
          </div>

          <div class="footer-info">
            Documento emitido pelo sistema EduPsych Pro • Centro Clínico
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
