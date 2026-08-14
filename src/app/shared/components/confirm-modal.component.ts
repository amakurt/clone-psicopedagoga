import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in"
        (click)="close()">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full mx-4 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800"
          style="max-width: 420px" (click)="$event.stopPropagation()">

          <div class="p-6 text-center">
            <div class="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4"
              [class]="dangerMode ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'">
              <span class="material-icons text-[28px]"
                [class]="dangerMode ? 'text-red-500' : 'text-amber-500'">
                {{ dangerMode ? 'delete_forever' : 'warning' }}
              </span>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">{{ title }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ message }}</p>
            <ng-content></ng-content>
          </div>

          <div class="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <button class="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              (click)="close()">
              {{ cancelText }}
            </button>
            <button class="flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg"
              [class]="dangerMode ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-primary hover:bg-primary-dark shadow-primary/20'"
              (click)="confirm()">
              {{ confirmText }}
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
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmar ação';
  @Input() message = 'Tem certeza que deseja continuar?';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() dangerMode = false;

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  close() { this.closed.emit(); }
  confirm() { this.confirmed.emit(); }
}
