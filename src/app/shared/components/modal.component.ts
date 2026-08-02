import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in"
        (click)="close()">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full mx-4 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800"
          [style.max-width]="maxWidth"
          (click)="$event.stopPropagation()">
          
          <!-- Header -->
          @if (title) {
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 class="text-lg font-black text-slate-900 dark:text-white">{{ title }}</h3>
              <button class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                (click)="close()">
                <span class="material-icons">close</span>
              </button>
            </div>
          }

          <!-- Body -->
          <div class="p-6">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          @if (showFooter) {
            <div class="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button class="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                (click)="close()">
                {{ cancelText }}
              </button>
              <button class="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                (click)="confirm()">
                {{ confirmText }}
              </button>
            </div>
          }
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
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() maxWidth = '440px';
  @Input() showFooter = true;
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }

  confirm() {
    this.confirmed.emit();
  }
}
