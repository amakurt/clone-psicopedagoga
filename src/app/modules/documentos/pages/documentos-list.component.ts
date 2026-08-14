import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentosService } from '../services/documentos.service';
import { UploadService } from '@core/services/upload.service';
import { ConfirmModalComponent } from '@shared/components/confirm-modal.component';

@Component({
  selector: 'app-documentos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmModalComponent],
  template: `
    <div class="space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Documentos</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Documentos dos pacientes</p>
        </div>
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all cursor-pointer">
            <span class="material-icons text-lg">upload_file</span> Upload
            <input type="file" class="hidden" (change)="onFileUpload($event)" accept=".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.csv">
          </label>
          <a routerLink="/app/documentos/novo"
            class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
            <span class="material-icons text-[18px]">add</span>
            <span>Novo Documento</span>
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3">
        @for (cat of categories; track cat.value) {
          <button class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            [class]="filterCategory() === cat.value ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50'"
            (click)="filterCategory.set(cat.value); load()">
            {{ cat.label }}
          </button>
        }
      </div>

      <!-- Upload Progress -->
      @if (uploading()) {
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 p-4 rounded-2xl flex items-center gap-3">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span class="text-sm font-medium text-blue-700 dark:text-blue-400">Enviando arquivo...</span>
        </div>
      }

      <!-- Table -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800">
          <div class="relative max-w-md">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
            <input class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Buscar documento..." [(ngModel)]="searchTerm" (input)="onSearch()">
          </div>
        </div>

        <div class="p-6">
          @if (loading()) {
            <div class="flex items-center justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          } @else if (items().length === 0) {
            <div class="text-center py-12">
              <span class="material-icons text-6xl text-slate-300">folder_open</span>
              <p class="text-slate-500 mt-3">Nenhum documento encontrado</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Documento</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Paciente</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Categoria</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
                    <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (d of items(); track d.id) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="size-10 rounded-xl flex items-center justify-center"
                            [class]="getFileStyle(d)">
                            <span class="material-icons text-lg">{{ getFileIcon(d) }}</span>
                          </div>
                          <div>
                            <p class="text-sm font-bold text-slate-900 dark:text-white">{{ d.name }}</p>
                            <p class="text-xs text-slate-500">{{ getFileType(d) }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ d.paciente?.name || '—' }}</td>
                      <td class="px-6 py-4">
                        <span class="text-xs font-bold text-slate-500">{{ d.category || 'Geral' }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                          [class]="getStatusClass(d.status)">
                          {{ d.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ d.createdAt | date:'dd/MM/yyyy' }}</td>
                      <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-1">
                          <button class="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all" title="Baixar" (click)="downloadDocument(d)">
                            <span class="material-icons text-lg">download</span>
                          </button>
                          <button class="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all" title="Assinar" (click)="openSignModal(d)">
                            <span class="material-icons text-lg">draw</span>
                          </button>
                          <button class="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all" title="Compartilhar com pais" (click)="openShareModal(d)">
                            <span class="material-icons text-lg">share</span>
                          </button>
                          <a [routerLink]="['/app/documentos', d.id, 'editar']" class="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all" title="Editar">
                            <span class="material-icons text-lg">edit</span>
                          </a>
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
    </div>

    <app-confirm-modal
      [isOpen]="showSignModal()"
      title="Assinar Documento"
      message="Tem certeza que deseja assinar este documento?"
      confirmText="Assinar"
      [dangerMode]="false"
      (closed)="showSignModal.set(false)"
      (confirmed)="executeSign()">
    </app-confirm-modal>

    <app-confirm-modal
      [isOpen]="showShareModal()"
      title="Compartilhar Documento"
      message="Tem certeza que deseja compartilhar este documento com o responsável?"
      confirmText="Compartilhar"
      [dangerMode]="false"
      (closed)="showShareModal.set(false)"
      (confirmed)="executeShare()">
    </app-confirm-modal>

    @if (showToast()) {
      <div class="fixed bottom-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 animate-in shadow-lg"
        [class]="toastType() === 'success' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'">
        <span class="material-icons">{{ toastType() === 'success' ? 'check_circle' : 'info' }}</span>
        <span class="text-sm font-medium">{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class DocumentosListComponent implements OnInit {
  private service = inject(DocumentosService);
  private uploadService = inject(UploadService);
  items = signal<any[]>([]);
  loading = signal(true);
  uploading = signal(false);
  searchTerm = '';
  filterCategory = signal('');
  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal('info');
  showSignModal = signal(false);
  docToSign = signal<any>(null);
  showShareModal = signal(false);
  docToShare = signal<any>(null);
  private timeout: any;

  categories = [
    { value: '', label: 'Todos' },
    { value: 'RELATORIO', label: 'Relatórios' },
    { value: 'ANAMNESE', label: 'Anamnese' },
    { value: 'FEEDBACK', label: 'Feedback' },
    { value: 'CONSENTIMENTO', label: 'Consentimentos' },
  ];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const params: any = {};
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.filterCategory()) params.category = this.filterCategory();

    this.service.list(params).subscribe({
      next: (res: any) => { this.items.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.load(), 300);
  }

  getFileIcon(doc: any): string {
    if (doc.fileUrl) {
      const ext = doc.fileUrl.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') return 'picture_as_pdf';
      if (['doc', 'docx'].includes(ext || '')) return 'article';
      if (['xls', 'xlsx'].includes(ext || '')) return 'table_chart';
      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
      if (ext === 'csv') return 'table_chart';
    }
    switch (doc.category) {
      case 'RELATORIO': return 'description';
      case 'ANAMNESE': return 'assignment';
      case 'FEEDBACK': return 'feedback';
      case 'CONSENTIMENTO': return 'gavel';
      default: return 'insert_drive_file';
    }
  }

  getFileType(doc: any): string {
    if (doc.fileUrl) {
      const ext = doc.fileUrl.split('.').pop()?.toUpperCase();
      return ext || 'FILE';
    }
    return doc.type || 'FILE';
  }

  getFileStyle(doc: any): string {
    if (doc.fileUrl) {
      const ext = doc.fileUrl.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      if (['doc', 'docx'].includes(ext || '')) return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      if (['xls', 'xlsx'].includes(ext || '')) return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    }
    return this.getCategoryStyle(doc.category);
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'RELATORIO': return 'description';
      case 'ANAMNESE': return 'assignment';
      case 'FEEDBACK': return 'feedback';
      case 'CONSENTIMENTO': return 'gavel';
      default: return 'insert_drive_file';
    }
  }

  getCategoryStyle(category: string): string {
    switch (category) {
      case 'RELATORIO': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ANAMNESE': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'FEEDBACK': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'CONSENTIMENTO': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PRONTO': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'RASCUNHO': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'PENDENTE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  }

  onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    this.uploading.set(true);

    this.uploadService.uploadFile(file).subscribe({
      next: (res) => {
        this.service.create({
          name: file.name,
          category: 'RELATORIO',
          status: 'RASCUNHO',
          fileUrl: res.url,
          size: res.size.toString()
        }).subscribe({
          next: () => {
            this.uploading.set(false);
            this.showNotification('Documento enviado com sucesso!', 'success');
            this.load();
          },
          error: () => {
            this.uploading.set(false);
            this.showNotification('Erro ao salvar documento', 'error');
          }
        });
      },
      error: () => {
        this.uploading.set(false);
        this.showNotification('Erro ao enviar arquivo', 'error');
      }
    });

    input.value = '';
  }

  downloadDocument(doc: any) {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    } else {
      this.showNotification('Arquivo não disponível para download', 'info');
    }
  }

  openSignModal(doc: any) {
    this.docToSign.set(doc);
    this.showSignModal.set(true);
  }

  executeSign() {
    const doc = this.docToSign();
    this.showSignModal.set(false);
    if (doc) {
      this.service.update(doc.id, { status: 'PRONTO', signedAt: new Date().toISOString() }).subscribe({
        next: () => {
          this.showNotification('Documento assinado com sucesso!', 'success');
          this.load();
        },
        error: () => this.showNotification('Erro ao assinar documento', 'error')
      });
    }
  }

  openShareModal(doc: any) {
    this.docToShare.set(doc);
    this.showShareModal.set(true);
  }

  executeShare() {
    const doc = this.docToShare();
    this.showShareModal.set(false);
    if (doc) {
      this.service.update(doc.id, { isShared: true }).subscribe({
        next: () => {
          this.showNotification('Documento compartilhado com sucesso!', 'success');
          this.load();
        },
        error: () => this.showNotification('Erro ao compartilhar documento', 'error')
      });
    }
  }

  showNotification(message: string, type: string) {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
