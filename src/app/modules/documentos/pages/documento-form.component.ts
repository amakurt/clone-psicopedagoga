import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DocumentosService } from '../services/documentos.service';
import { UploadService, UploadResponse } from '@core/services/upload.service';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';
import { resolveFileUrl } from '@core/utils/file-url';

@Component({
  selector: 'app-documento-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/app/documentos" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <span class="material-icons text-gray-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ isEdit ? 'Editar' : 'Novo' }} Documento</h1>
            <p class="text-sm text-gray-500 dark:text-slate-400">Upload e gerenciamento de documentos</p>
          </div>
        </div>
        <button (click)="save()" [disabled]="saving() || !form.name"
          class="px-6 py-3 bg-primary hover:bg-primary-dark text-on-primary rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center gap-2">
          <span class="material-icons">save</span>
          {{ saving() ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Form -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações do Documento</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Nome *</label>
                <input [(ngModel)]="form.name" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nome do documento">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Categoria</label>
                <select [(ngModel)]="form.category" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                  <option value="GERAL">Geral</option>
                  <option value="RELATORIO">Relatório</option>
                  <option value="ANAMNESE">Anamnese</option>
                  <option value="ESCOLA">Escola</option>
                  <option value="CONSENTIMENTO">Consentimento</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Status</label>
                <select [(ngModel)]="form.status" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                  <option value="RASCUNHO">Rascunho</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="ARQUIVADO">Arquivado</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Paciente</label>
                <select [(ngModel)]="form.pacienteId" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                  <option value="">Nenhum</option>
                  @for (p of patients(); track p.id) {
                    <option [value]="p.id">{{ p.name }}</option>
                  }
                </select>
              </div>
              <div class="flex items-end">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="form.isShared" 
                    class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary">
                  <span class="text-sm text-gray-700 dark:text-slate-300">Compartilhar com responsável</span>
                </label>
              </div>
            </div>
          </div>

          <!-- File Upload -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Arquivo</h3>
            
            @if (!uploadedFile()) {
              <div 
                (click)="fileInput.click()" 
                (dragover)="$event.preventDefault(); dragOver.set(true)"
                (dragleave)="dragOver.set(false)"
                (drop)="$event.preventDefault(); dragOver.set(false); onFileDrop($event)"
                class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                [class]="dragOver() ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-slate-600 hover:border-primary'">
                <span class="material-icons text-5xl text-gray-300 dark:text-slate-600">cloud_upload</span>
                <p class="mt-3 text-gray-600 dark:text-slate-400 font-medium">Arraste um arquivo ou clique para selecionar</p>
                <p class="mt-1 text-sm text-gray-400 dark:text-slate-500">PDF, DOCX, XLSX, JPG, PNG (máx. 10MB)</p>
              </div>
              <input #fileInput type="file" (change)="onFileSelect($event)" 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.csv"
                class="hidden">
            } @else {
              <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                <span class="material-icons text-4xl text-primary">{{ getFileIcon(uploadedFile()!.mimetype) }}</span>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 dark:text-white truncate">{{ uploadedFile()!.originalName }}</p>
                  <p class="text-sm text-gray-500 dark:text-slate-400">{{ uploadService.formatFileSize(uploadedFile()!.size) }}</p>
                </div>
                <button (click)="removeFile()" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            }

            @if (uploading()) {
              <div class="mt-4">
                <div class="flex items-center gap-3">
                  <div class="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-primary rounded-full animate-pulse" style="width: 60%"></div>
                  </div>
                  <span class="text-sm text-gray-500">Enviando...</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Preview -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 sticky top-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
            
            @if (uploadedFile()) {
              <div class="space-y-4">
                <div class="aspect-[3/4] bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center overflow-hidden">
                  @if (isImage(uploadedFile()!.mimetype)) {
                    <img [src]="resolveFileUrl(uploadedFile()!.url)" class="w-full h-full object-contain">
                  } @else {
                    <div class="text-center p-4">
                      <span class="material-icons text-6xl text-gray-300 dark:text-slate-600">{{ getFileIcon(uploadedFile()!.mimetype) }}</span>
                      <p class="mt-2 text-sm text-gray-500">{{ uploadedFile()!.originalName }}</p>
                    </div>
                  }
                </div>
                <a [href]="resolveFileUrl(uploadedFile()!.url)" target="_blank" 
                  class="block w-full py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 text-center transition-all">
                  Abrir em nova aba
                </a>
              </div>
            } @else {
              <div class="aspect-[3/4] bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <p class="text-gray-400 dark:text-slate-500 text-sm">Nenhum arquivo selecionado</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class DocumentoFormComponent implements OnInit {
  private service = inject(DocumentosService);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  uploadService = inject(UploadService);
  private toast = inject(ToastService);

  isEdit = false;
  id = '';
  saving = signal(false);
  uploading = signal(false);
  dragOver = signal(false);
  uploadedFile = signal<UploadResponse | null>(null);
  patients = signal<any[]>([]);

  form: any = {
    name: '',
    pacienteId: '',
    category: 'GERAL',
    status: 'RASCUNHO',
    isShared: false,
    fileUrl: '',
    size: ''
  };

  ngOnInit() {
    this.api.get('/pacientes').subscribe((res: any) => this.patients.set(res.data || []));
    
    this.id = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.id;

    if (this.isEdit) {
      this.service.get(this.id).subscribe((res: any) => {
        this.form = { ...this.form, ...res };
        if (res.fileUrl) {
          this.uploadedFile.set({
            filename: res.fileUrl.split('/').pop() || '',
            originalName: res.name,
            size: parseInt(res.size) || 0,
            mimetype: '',
            url: res.fileUrl
          });
        }
      });
    }
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) this.uploadFile(file);
  }

  onFileDrop(event: DragEvent) {
    const file = event.dataTransfer?.files[0];
    if (file) this.uploadFile(file);
  }

  uploadFile(file: File) {
    this.uploading.set(true);
    this.uploadService.uploadFile(file).subscribe({
      next: (res) => {
        this.uploadedFile.set(res);
        this.form.fileUrl = res.url;
        this.form.size = res.size.toString();
        this.form.name = this.form.name || res.originalName;
        this.uploading.set(false);
      },
      error: () => {
        this.uploading.set(false);
        this.toast.error('Erro ao enviar arquivo');
      }
    });
  }

  removeFile() {
    if (this.uploadedFile()) {
      this.uploadService.deleteFile(this.uploadedFile()!.filename).subscribe();
    }
    this.uploadedFile.set(null);
    this.form.fileUrl = '';
    this.form.size = '';
  }

  isImage(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  getFileIcon(mimetype: string): string {
    if (mimetype.includes('pdf')) return 'picture_as_pdf';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'article';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'table_chart';
    if (mimetype.includes('image')) return 'image';
    return 'insert_drive_file';
  }

  save() {
    if (!this.form.name) return;
    this.saving.set(true);

    const obs = this.isEdit
      ? this.service.update(this.id, this.form)
      : this.service.create(this.form);

    obs.subscribe({
      next: () => this.router.navigate(['/app/documentos']),
      error: () => {
        this.saving.set(false);
        this.toast.error('Erro ao salvar documento');
      }
    });
  }
}
