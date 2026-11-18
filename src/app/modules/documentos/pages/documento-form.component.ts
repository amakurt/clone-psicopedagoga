import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DocumentosService } from '../services/documentos.service';
import { UploadService, UploadResponse } from '@core/services/upload.service';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';
import { resolveFileUrl } from '@core/utils/file-url';
import { ClinicalDocEditorComponent } from '@shared/components/clinical-doc-editor/clinical-doc-editor.component';
import { FichaScannerModalComponent, ScanResult } from '@shared/components/ficha-scanner-modal.component';

@Component({
  selector: 'app-documento-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ClinicalDocEditorComponent, FichaScannerModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <a routerLink="/app/documentos" class="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <span class="material-icons text-slate-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ isEdit ? 'Editar' : 'Novo' }} Documento</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">Upload, digitalização inteligente e edição in-app A4</p>
          </div>
        </div>

        <div class="flex items-center gap-3 self-start sm:self-auto">
          <!-- Botão Escanear com Câmera -->
          <button type="button" (click)="openScanner()"
            class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 active:scale-95">
            <span class="material-icons text-[18px]">document_scanner</span>
            <span>Escanear / Câmera</span>
          </button>

          <!-- Botão Salvar -->
          <button (click)="save()" [disabled]="saving() || !form.name"
            class="px-6 py-2.5 bg-primary hover:bg-primary-dark text-on-primary rounded-xl font-bold text-sm disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95">
            <span class="material-icons text-[18px]">save</span>
            {{ saving() ? 'Salvando...' : 'Salvar Documento' }}
          </button>
        </div>
      </div>

      <!-- Grid: Metadados + Arquivo -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Form de Metadados -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Informações do Documento</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nome do Documento *</label>
                <input [(ngModel)]="form.name" 
                  class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
                  placeholder="Ex: Parecer Técnico, Declaração, Relatório Escolar...">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Categoria</label>
                <select [(ngModel)]="form.category" 
                  class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium">
                  <option value="GERAL">Geral</option>
                  <option value="RELATORIO">Relatório</option>
                  <option value="ANAMNESE">Anamnese</option>
                  <option value="ESCOLA">Escola</option>
                  <option value="CONSENTIMENTO">Consentimento</option>
                  <option value="DECLARACAO">Declaração</option>
                  <option value="PARECER">Parecer</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                <select [(ngModel)]="form.status" 
                  class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium">
                  <option value="RASCUNHO">Rascunho</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="ARQUIVADO">Arquivado</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Paciente Vinculado</label>
                <select [(ngModel)]="form.pacienteId" 
                  class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium">
                  <option value="">Nenhum (Documento geral / Institucional)</option>
                  @for (p of patients(); track p.id) {
                    <option [value]="p.id">{{ p.name }}</option>
                  }
                </select>
              </div>
              <div class="flex items-end">
                <label class="flex items-center gap-3 cursor-pointer py-3">
                  <input type="checkbox" [(ngModel)]="form.isShared" 
                    class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary">
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Compartilhar com responsável</span>
                </label>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Breve Descrição / Resumo</label>
                <input [(ngModel)]="form.description" 
                  class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  placeholder="Resumo das observações ou finalidade do documento">
              </div>
            </div>
          </div>

          <!-- File Upload & Scanner -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Arquivo Original (Garantia Documental)</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">O arquivo original permanece preservado para consulta e valor jurídico</p>
              </div>
              <button type="button" (click)="openScanner()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all">
                <span class="material-icons text-[16px]">camera_alt</span>
                Escanear com Câmera
              </button>
            </div>
            
            @if (!uploadedFile()) {
              <div 
                (click)="fileInput.click()" 
                (dragover)="$event.preventDefault(); dragOver.set(true)"
                (dragleave)="dragOver.set(false)"
                (drop)="$event.preventDefault(); dragOver.set(false); onFileDrop($event)"
                class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                [class]="dragOver() ? 'border-primary bg-primary/5' : 'border-slate-300 dark:border-slate-600 hover:border-primary'">
                <span class="material-icons text-5xl text-slate-300 dark:text-slate-600">cloud_upload</span>
                <p class="mt-3 text-slate-600 dark:text-slate-400 font-medium">Arraste um arquivo ou clique para selecionar</p>
                <p class="mt-1 text-sm text-slate-400 dark:text-slate-500">PDF, DOCX, XLSX, JPG, PNG (máx. 15MB)</p>
              </div>
              <input #fileInput type="file" (change)="onFileSelect($event)" 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.csv"
                class="hidden">
            } @else {
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-4 min-w-0">
                  <span class="material-icons text-4xl text-primary">{{ getFileIcon(uploadedFile()!.mimetype || uploadedFile()!.url) }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-slate-900 dark:text-white truncate">{{ uploadedFile()!.originalName }}</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                      {{ uploadedFile()!.size ? uploadService.formatFileSize(uploadedFile()!.size) : 'Arquivo anexado' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <!-- Botão Extrair Texto OCR se arquivo for imagem/PDF -->
                  <button type="button" (click)="extractTextFromUploaded()" [disabled]="extractingOcr()"
                    class="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-bold hover:bg-teal-100 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    title="Extrair texto do arquivo e injetar no Editor A4">
                    <span class="material-icons text-[16px]">{{ extractingOcr() ? 'hourglass_empty' : 'auto_awesome' }}</span>
                    {{ extractingOcr() ? 'Extraindo texto...' : 'Extrair para Editor A4 (OCR)' }}
                  </button>

                  <button (click)="removeFile()" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Remover anexo">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </div>
            }

            @if (uploading()) {
              <div class="mt-4">
                <div class="flex items-center gap-3">
                  <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-primary rounded-full animate-pulse" style="width: 60%"></div>
                  </div>
                  <span class="text-sm text-slate-500">Enviando arquivo...</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Preview Lateral -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 sticky top-4 space-y-4">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Anexo Visual</h3>
            
            @if (uploadedFile()) {
              <div class="space-y-4">
                <div class="aspect-[3/4] bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                  @if (isImage(uploadedFile()!.mimetype || uploadedFile()!.url)) {
                    <img [src]="resolveFileUrl(uploadedFile()!.url)" class="w-full h-full object-contain">
                  } @else {
                    <div class="text-center p-4">
                      <span class="material-icons text-6xl text-slate-300 dark:text-slate-600">{{ getFileIcon(uploadedFile()!.mimetype || uploadedFile()!.url) }}</span>
                      <p class="mt-2 text-sm text-slate-500 font-medium truncate">{{ uploadedFile()!.originalName }}</p>
                    </div>
                  }
                </div>
                <a [href]="resolveFileUrl(uploadedFile()!.url)" target="_blank" 
                  class="block w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 text-center transition-all">
                  Abrir anexo original
                </a>
              </div>
            } @else {
              <div class="aspect-[3/4] bg-slate-100 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center p-4 text-center border border-dashed border-slate-300 dark:border-slate-600">
                <span class="material-icons text-4xl text-slate-300 dark:text-slate-500 mb-2">attachment</span>
                <p class="text-slate-400 dark:text-slate-500 text-xs">Nenhum anexo original carregado</p>
                <button type="button" (click)="openScanner()"
                  class="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  Fotografar com a câmera
                </button>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Editor Clínico Visual A4 (In-App Editing) -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <span class="material-icons">edit_note</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Editor Clínico A4 (Edição In-App)</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Altere textos, formate declarações, relatórios e laudos com papel timbrado, tags inteligentes e impressão oficial
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button type="button" (click)="openScanner()"
              class="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5">
              <span class="material-icons text-[16px] text-emerald-600 dark:text-emerald-400">document_scanner</span>
              Digitalizar outro documento
            </button>
          </div>
        </div>

        <!-- Componente Oficial de Edição A4 -->
        <app-clinical-doc-editor
          [content]="form.content || ''"
          [paciente]="getSelectedPatient()"
          (contentChange)="form.content = $event">
        </app-clinical-doc-editor>
      </div>
    </div>

    <!-- Modal de Escaneamento OCR -->
    @if (showScannerModal()) {
      <app-ficha-scanner-modal
        tipoFicha="DOCUMENTO"
        subtitle="Fotografe documentos, relatórios, pareceres ou declarações para extrair texto automaticamente para o editor A4"
        (scanComplete)="onScanComplete($event)"
        (closeModal)="showScannerModal.set(false)">
      </app-ficha-scanner-modal>
    }
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

  resolveFileUrl = resolveFileUrl;

  isEdit = false;
  id = '';
  saving = signal(false);
  uploading = signal(false);
  extractingOcr = signal(false);
  dragOver = signal(false);
  showScannerModal = signal(false);
  uploadedFile = signal<UploadResponse | null>(null);
  currentRawFile: File | null = null;
  patients = signal<any[]>([]);

  form: any = {
    name: '',
    description: '',
    content: '',
    pacienteId: '',
    category: 'GERAL',
    status: 'ATIVO',
    isShared: false,
    fileUrl: '',
    size: ''
  };

  ngOnInit() {
    this.api.get('/pacientes').subscribe((res: any) => {
      this.patients.set(res.data || []);
      // Após carregar os pacientes, checa se há documento escaneado em cache
      this.checkScannedDocCache();
    });
    
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

  checkScannedDocCache() {
    if (this.isEdit) return;
    const cached = sessionStorage.getItem('scanned_doc');
    if (cached) {
      try {
        const result: ScanResult = JSON.parse(cached);
        this.applyScanResult(result);
      } catch (err) {
        console.error('Erro ao ler cache de documento digitalizado:', err);
      } finally {
        sessionStorage.removeItem('scanned_doc');
      }
    }
  }

  getSelectedPatient(): any {
    if (!this.form.pacienteId) return null;
    return this.patients().find(p => p.id === this.form.pacienteId) || null;
  }

  openScanner() {
    this.showScannerModal.set(true);
  }

  onScanComplete(result: ScanResult) {
    this.showScannerModal.set(false);
    this.applyScanResult(result);
  }

  applyScanResult(result: ScanResult) {
    if (result.documento) {
      if (result.documento.titulo && !this.form.name) {
        this.form.name = result.documento.titulo;
      } else if (!this.form.name) {
        this.form.name = 'Documento Digitalizado ' + new Date().toLocaleDateString('pt-BR');
      }

      if (result.documento.categoria) {
        this.form.category = result.documento.categoria;
      }

      if (result.documento.resumo) {
        this.form.description = result.documento.resumo;
      }

      if (result.documento.textoFormatadoHtml) {
        this.form.content = result.documento.textoFormatadoHtml;
      } else if (result.rawText) {
        this.form.content = '<p>' + result.rawText.replace(/\n/g, '<br>') + '</p>';
      }

      // Tenta vincular o paciente automaticamente pelo nome extraído
      if (result.documento.pacienteNome && this.patients().length > 0) {
        const query = result.documento.pacienteNome.toLowerCase().trim();
        const matched = this.patients().find(p => p.name.toLowerCase().includes(query) || query.includes(p.name.toLowerCase()));
        if (matched) {
          this.form.pacienteId = matched.id;
        }
      }
    } else if (result.rawText) {
      this.form.content = '<p>' + result.rawText.replace(/\n/g, '<br>') + '</p>';
      if (!this.form.name) {
        this.form.name = 'Documento Digitalizado ' + new Date().toLocaleDateString('pt-BR');
      }
    }

    // Se houve foto capturada, anexa como original
    if (result.images && result.images.length > 0) {
      const firstImage = result.images[0];
      this.form.fileUrl = firstImage;
      this.uploadedFile.set({
        filename: 'scan.jpg',
        originalName: this.form.name ? `${this.form.name}.jpg` : 'Documento_Digitalizado.jpg',
        size: 0,
        mimetype: 'image/jpeg',
        url: firstImage
      });
    }

    this.toast.success('Documento processado! Conteúdo carregado no Editor A4.');
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.currentRawFile = file;
      this.uploadFile(file);
    }
  }

  onFileDrop(event: DragEvent) {
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.currentRawFile = file;
      this.uploadFile(file);
    }
  }

  uploadFile(file: File) {
    this.uploading.set(true);
    this.uploadService.uploadFile(file).subscribe({
      next: (res) => {
        this.uploadedFile.set(res);
        this.form.fileUrl = res.url;
        this.form.size = res.size.toString();
        this.form.name = this.form.name || res.originalName.replace(/\.[^/.]+$/, '');
        this.uploading.set(false);
      },
      error: () => {
        this.uploading.set(false);
        this.toast.error('Erro ao enviar arquivo');
      }
    });
  }

  extractTextFromUploaded() {
    if (!this.currentRawFile && !this.uploadedFile()) {
      this.toast.error('Nenhum arquivo disponível para extração');
      return;
    }

    this.extractingOcr.set(true);

    if (this.currentRawFile) {
      const formData = new FormData();
      formData.append('file', this.currentRawFile);
      formData.append('tipoFicha', 'DOCUMENTO');

      this.api.post('/ai-ocr/scan', formData).subscribe({
        next: (res: any) => {
          this.extractingOcr.set(false);
          const data = res?.data;
          if (data) {
            this.applyScanResult(data);
          } else {
            this.toast.info('Texto extraído com sucesso.');
          }
        },
        error: (err: any) => {
          this.extractingOcr.set(false);
          this.toast.error(err?.error?.error || 'Erro ao extrair texto do arquivo.');
        }
      });
    } else {
      // Se não temos o objeto File cru em memória mas temos a URL
      this.openScanner();
      this.extractingOcr.set(false);
    }
  }

  removeFile() {
    if (this.uploadedFile()) {
      this.uploadService.deleteFile(this.uploadedFile()!.filename).subscribe();
    }
    this.uploadedFile.set(null);
    this.currentRawFile = null;
    this.form.fileUrl = '';
    this.form.size = '';
  }

  isImage(mimetypeOrUrl: string): boolean {
    return (mimetypeOrUrl || '').startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(mimetypeOrUrl || '');
  }

  getFileIcon(mimetypeOrUrl: string): string {
    const str = (mimetypeOrUrl || '').toLowerCase();
    if (str.includes('pdf')) return 'picture_as_pdf';
    if (str.includes('word') || str.includes('document') || str.includes('.doc')) return 'article';
    if (str.includes('excel') || str.includes('spreadsheet') || str.includes('.xls')) return 'table_chart';
    if (str.includes('image') || /\.(jpg|jpeg|png|webp)$/i.test(str)) return 'image';
    return 'insert_drive_file';
  }

  save() {
    if (!this.form.name) return;
    this.saving.set(true);

    const obs = this.isEdit
      ? this.service.update(this.id, this.form)
      : this.service.create(this.form);

    obs.subscribe({
      next: () => {
        this.toast.success('Documento salvo com sucesso!');
        this.router.navigate(['/app/documentos']);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erro ao salvar documento');
      }
    });
  }
}
