import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DocumentosService } from '../services/documentos.service';
import { UploadService } from '@core/services/upload.service';
import { resolveFileUrl } from '@core/utils/file-url';

@Component({
  selector: 'app-documento-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/app/documentos" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <span class="material-icons text-gray-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ item()?.name }}</h1>
            <p class="text-sm text-gray-500 dark:text-slate-400">
              {{ item()?.paciente?.name || 'Sem paciente' }} — {{ item()?.createdAt | date:'dd/MM/yyyy' }}
            </p>
          </div>
        </div>
        <a [routerLink]="['/app/documentos', id, 'editar']" 
          class="px-5 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-semibold flex items-center gap-2 transition-all">
          <span class="material-icons text-[18px]">edit</span>
          Editar
        </a>
      </div>

      @if (item()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- File Preview -->
            @if (item()?.fileUrl) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Arquivo</h3>
                <div class="aspect-[3/4] bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center overflow-hidden">
                  @if (isImage(item()?.fileUrl)) {
                    <img [src]="resolveFileUrl(item()?.fileUrl)" class="w-full h-full object-contain">
                  } @else {
                    <div class="text-center p-4">
                      <span class="material-icons text-7xl text-gray-300 dark:text-slate-600">{{ getFileIcon(item()?.fileUrl) }}</span>
                      <p class="mt-4 text-sm text-gray-500 dark:text-slate-400">{{ item()?.name }}</p>
                    </div>
                  }
                </div>
                <div class="flex gap-2 mt-4">
                  <a [href]="resolveFileUrl(item()?.fileUrl)" target="_blank" 
                    class="flex-1 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-semibold text-sm text-center transition-all flex items-center justify-center gap-2">
                    <span class="material-icons text-[18px]">open_in_new</span>
                    Abrir em nova aba
                  </a>
                  <a [href]="resolveFileUrl(item()?.fileUrl)" download 
                    class="flex-1 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl font-semibold text-sm text-gray-700 dark:text-slate-300 text-center transition-all flex items-center justify-center gap-2">
                    <span class="material-icons text-[18px]">download</span>
                    Baixar
                  </a>
                </div>
              </div>
            }

            <!-- Description -->
            @if (item()?.description) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Descrição</h3>
                <p class="text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{{ item()?.description }}</p>
              </div>
            }

            <!-- Content -->
            @if (item()?.content) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conteúdo</h3>
                <p class="text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{{ item()?.content }}</p>
              </div>
            }
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 sticky top-4 space-y-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Informações</h3>

              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500 dark:text-slate-400">Status</span>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                    [class]="getStatusClass(item()?.status)">
                    {{ item()?.status }}
                  </span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500 dark:text-slate-400">Categoria</span>
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ item()?.category || 'Geral' }}</span>
                </div>

                @if (item()?.size) {
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500 dark:text-slate-400">Tamanho</span>
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ uploadService.formatFileSize(parseInt(item()?.size)) }}</span>
                  </div>
                }

                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500 dark:text-slate-400">Criado em</span>
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ item()?.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500 dark:text-slate-400">Última atualização</span>
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ item()?.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>

                @if (item()?.isShared) {
                  <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <span class="material-icons text-[18px]">group</span>
                    <span class="text-sm font-medium">Compartilhado com responsável</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class DocumentoDetailComponent implements OnInit {
  private service = inject(DocumentosService);
  private route = inject(ActivatedRoute);
  uploadService = inject(UploadService);

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
      case 'PRONTO': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'RASCUNHO': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'PENDENTE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  }

  parseInt(value: string): number {
    return parseInt(value) || 0;
  }
}
