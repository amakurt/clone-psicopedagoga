import { Component, inject, signal, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DigitalSignatureComponent } from './digital-signature.component';

@Component({
  selector: 'app-signature-modal',
  standalone: true,
  imports: [CommonModule, DigitalSignatureComponent],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in"
        (click)="onBackdropClick($event)">
        <div class="bg-white rounded-3xl shadow-2xl w-full mx-4 overflow-hidden ring-1 ring-slate-200 max-w-lg legacy-card"
          (click)="$event.stopPropagation()">

          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span class="material-icons text-primary">draw</span>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900">{{ title }}</h3>
                <p class="text-xs text-slate-500">{{ subtitle }}</p>
              </div>
            </div>
            <button class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              (click)="close()">
              <span class="material-icons">close</span>
            </button>
          </div>

          <div class="p-6">
            <app-digital-signature
              #signaturePad
              [canvasWidth]="480"
              [canvasHeight]="200"
              (signatureSaved)="onSignatureSaved($event)"
              (cleared)="onCleared()">
            </app-digital-signature>
          </div>

          <div class="p-6 border-t border-slate-100 flex justify-end gap-3">
            <button class="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
              (click)="close()">
              Cancelar
            </button>
            <button class="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
              (click)="confirmSignature()" [disabled]="!signatureData()">
              <span class="material-icons text-[16px]">check_circle</span>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .animate-in { animation: fadeIn 0.2s ease-out; }
  `]
})
export class SignatureModalComponent {
  @ViewChild('signaturePad') signaturePad!: DigitalSignatureComponent;
  @Input() isOpen = false;
  @Input() title = 'Assinar Documento';
  @Input() subtitle = 'Desenhe sua assinatura no campo abaixo';
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<string>();

  signatureData = signal<string | null>(null);

  onSignatureSaved(dataUrl: string) {
    this.signatureData.set(dataUrl);
  }

  onCleared() {
    this.signatureData.set(null);
  }

  confirmSignature() {
    if (this.signatureData()) {
      this.confirmed.emit(this.signatureData()!);
      this.signatureData.set(null);
    }
  }

  close() {
    this.signatureData.set(null);
    if (this.signaturePad) {
      this.signaturePad.clear();
    }
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
