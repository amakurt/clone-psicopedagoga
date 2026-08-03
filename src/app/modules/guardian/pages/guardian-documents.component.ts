import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GuardianService } from '../services/guardian.service';
import { Document } from '@core/models';

@Component({
  selector: 'app-guardian-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Documentos</h2>
          <p class="text-gray-500 dark:text-slate-400 mt-1">Documentos compartilhados e envio de novos</p>
        </div>
        <button (click)="showUpload.set(!showUpload())" 
          class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold flex items-center gap-2 transition-all">
          <span class="material-icons">upload</span>
          Enviar Documento
        </button>
      </div>

      <!-- Upload Form -->
      @if (showUpload()) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Novo Documento</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nome</label>
              <input [(ngModel)]="newDoc.name" class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white" placeholder="Nome do documento">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Categoria</label>
              <select [(ngModel)]="newDoc.category" class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                <option value="ESCOLA">Escola</option>
                <option value="GERAL">Geral</option>
                <option value="RELATORIO">Relatório</option>
              </select>
            </div>
          </div>
          <div class="mt-4 flex gap-3">
            <button (click)="uploadDocument()" [disabled]="!newDoc.name || uploading()"
              class="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold disabled:opacity-50 transition-all">
              {{ uploading() ? 'Enviando...' : 'Enviar' }}
            </button>
            <button (click)="showUpload.set(false)" class="px-6 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-semibold">
              Cancelar
            </button>
          </div>
        </div>
      }

      @if (documents().length === 0) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-gray-200 dark:border-slate-700 text-center">
          <span class="material-icons text-6xl text-gray-300 dark:text-slate-600">description</span>
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Nenhum documento</h3>
          <p class="mt-2 text-gray-500 dark:text-slate-400">Documentos compartilhados aparecerão aqui</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (doc of documents(); track doc.id) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span class="material-icons text-primary">description</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-gray-900 dark:text-white truncate">{{ doc.name }}</h4>
                  <p class="text-sm text-gray-500 dark:text-slate-400">{{ doc.category }}</p>
                  <p class="text-xs text-gray-400 dark:text-slate-500 mt-1">{{ doc.createdAt }}</p>
                </div>
              </div>
              <div class="mt-4 flex gap-2">
                @if (doc.fileUrl) {
                  <a [href]="doc.fileUrl" target="_blank" class="flex-1 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 text-center transition-all">
                    Abrir
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
  private route = inject(ActivatedRoute);

  documents = signal<Document[]>([]);
  showUpload = signal(false);
  uploading = signal(false);
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

  uploadDocument() {
    if (!this.newDoc.name || !this.patientId) return;
    this.uploading.set(true);

    this.guardianService.uploadDocument({
      pacienteId: this.patientId,
      name: this.newDoc.name,
      category: this.newDoc.category
    }).subscribe({
      next: () => {
        this.uploading.set(false);
        this.showUpload.set(false);
        this.newDoc = { name: '', category: 'ESCOLA' };
        this.loadDocuments();
      },
      error: () => this.uploading.set(false)
    });
  }
}
