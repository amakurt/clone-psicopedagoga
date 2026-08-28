import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GuardianService } from '../services/guardian.service';
import { ApiService } from '@core/services/api.service';
import { Document } from '@core/models';
import { resolveFileUrl } from '@core/utils/file-url';

@Component({
  selector: 'app-guardian-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 sm:space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="size-11 sm:size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <span class="material-icons text-primary text-2xl">description</span>
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Documentos</h2>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Arquivos compartilhados e envio de novos documentos</p>
          </div>
        </div>
        <button (click)="showUpload.set(!showUpload())" 
          class="w-full sm:w-auto px-5 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all active:scale-95">
          <span class="material-icons text-[18px]">upload_file</span>
          {{ showUpload() ? 'Fechar Envio' : 'Enviar Documento' }}
        </button>
      </div>

      <!-- Upload Form -->
      @if (showUpload()) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm animate-in fade-in">
          <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-primary">cloud_upload</span> Novo Documento
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Nome do Arquivo *</label>
              <input [(ngModel)]="newDoc.name" class="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Ex: Avaliação Escolar 2026">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Categoria</label>
              <select [(ngModel)]="newDoc.category" class="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="ESCOLA">Escola</option>
                <option value="GERAL">Geral / Família</option>
                <option value="RELATORIO">Relatório Médico / Externo</option>
              </select>
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">Selecionar Arquivo (PDF, Imagem, Word, etc.)</label>
            <input #fileInput type="file" (change)="onFileSelected($event)" 
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.csv"
              class="w-full text-xs sm:text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer">
            @if (selectedFile()) {
              <p class="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center gap-1">
                <span class="material-icons text-[16px]">check</span> {{ selectedFile()!.name }} ({{ formatSize(selectedFile()!.size) }})
              </p>
            }
          </div>
          <div class="mt-5 flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-100 dark:border-slate-700">
            <button (click)="uploadDocument()" [disabled]="!newDoc.name || !selectedFile() || uploading()"
              class="flex-1 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-md shadow-primary/20 disabled:opacity-50 transition-all active:scale-95">
              {{ uploading() ? 'Enviando documento...' : 'Confirmar Envio' }}
            </button>
            <button (click)="cancelUpload()" class="py-3 px-6 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-2xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-all">
              Cancelar
            </button>
          </div>
        </div>
      }

      @if (documents().length === 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-gray-200 dark:border-slate-700 text-center shadow-sm">
          <div class="size-16 rounded-3xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-gray-400 dark:text-slate-500">
            <span class="material-icons text-3xl">description</span>
          </div>
          <h3 class="mt-4 text-base sm:text-lg font-bold text-gray-900 dark:text-white">Nenhum documento disponível</h3>
          <p class="mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-400">Documentos compartilhados com a família ou enviados por você aparecerão aqui.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          @for (doc of documents(); track doc.id) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div class="flex items-start gap-3">
                  <div class="size-10 sm:size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span class="material-icons text-xl">description</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">{{ doc.name }}</h4>
                    <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{{ doc.category }}</p>
                    <p class="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{{ doc.createdAt }}</p>
                  </div>
                </div>

                <div class="mt-3">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                    [class]="statusClass(doc.status)">
                    {{ statusLabel(doc.status) }}
                  </span>
                </div>

                @if (doc.status === 'RECUSADO' && doc.approvalFeedback) {
                  <div class="mt-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
                    <p class="font-bold mb-0.5">Motivo da recusa:</p>
                    <p>{{ doc.approvalFeedback }}</p>
                  </div>
                }
              </div>

              <div class="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
                @if (doc.fileUrl) {
                  <a [href]="resolveFileUrl(doc.fileUrl)" target="_blank" class="w-full py-2.5 px-4 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-300 text-center transition-all flex items-center justify-center gap-1.5 active:scale-95">
                    <span class="material-icons text-[16px] text-primary">visibility</span> Visualizar / Baixar
                  </a>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class GuardianDocumentsComponent implements OnInit {
  private guardianService = inject(GuardianService);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  resolveFileUrl = resolveFileUrl;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  documents = signal<Document[]>([]);
  showUpload = signal(false);
  uploading = signal(false);
  selectedFile = signal<File | null>(null);
  patientId = '';

  newDoc = {
    name: '',
    category: 'ESCOLA'
  };

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.patientId = params['patientId'] || localStorage.getItem('guardian_patient_id') || '';
      if (this.patientId) {
        this.loadDocuments();
      }
    });
  }

  loadDocuments() {
    this.guardianService.getDocuments(this.patientId).subscribe({
      next: (res: any) => this.documents.set(res.data || [])
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  cancelUpload() {
    this.showUpload.set(false);
    this.selectedFile.set(null);
    this.newDoc = { name: '', category: 'ESCOLA' };
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  statusLabel(status: string): string {
    switch (status?.toUpperCase()) {
      case 'AGUARDANDO_APROVACAO': return 'Aguardando aprovação';
      case 'APROVADO': return 'Aprovado';
      case 'RECUSADO': return 'Recusado';
      default: return status || '—';
    }
  }

  statusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'AGUARDANDO_APROVACAO': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'APROVADO': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'RECUSADO': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  }

  uploadDocument() {
    if (!this.newDoc.name || !this.patientId || !this.selectedFile()) return;
    this.uploading.set(true);

    const formData = new FormData();
    formData.append('file', this.selectedFile()!);

    this.api.post<{ url: string; filename: string; size: number }>('/upload', formData).subscribe({
      next: (uploadRes) => {
        this.guardianService.uploadDocument({
          pacienteId: this.patientId,
          name: this.newDoc.name,
          category: this.newDoc.category,
          fileUrl: uploadRes.url,
          size: String(uploadRes.size)
        }).subscribe({
          next: () => {
            this.uploading.set(false);
            this.showUpload.set(false);
            this.selectedFile.set(null);
            this.newDoc = { name: '', category: 'ESCOLA' };
            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
            }
            this.loadDocuments();
          },
          error: () => this.uploading.set(false)
        });
      },
      error: () => this.uploading.set(false)
    });
  }
}
