import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-in p-4"
        (click)="close()">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full mx-auto overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800"
          style="max-width: 440px" (click)="$event.stopPropagation()">

          <div class="p-6 text-center">
            <div class="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
              [class]="resolvedBoxClass">
              <span class="material-icons text-[28px]"
                [class]="resolvedIconClass">
                {{ resolvedIcon }}
              </span>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">{{ title }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{{ message }}</p>
            <ng-content></ng-content>
          </div>

          <div class="p-5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <button class="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              (click)="close()">
              {{ cancelText }}
            </button>
            <button class="flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-md active:scale-95"
              [class]="resolvedButtonClass"
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
  @Input() mode: 'danger' | 'warning' | 'success' | 'primary' = 'primary';
  @Input() icon?: string;

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  get effectiveMode(): 'danger' | 'warning' | 'success' | 'primary' {
    if (this.dangerMode) return 'danger';
    return this.mode;
  }

  get resolvedIcon(): string {
    if (this.icon) return this.icon;
    switch (this.effectiveMode) {
      case 'danger': return 'delete_forever';
      case 'warning': return 'warning_amber';
      case 'success': return 'check_circle';
      default: return 'help_outline';
    }
  }

  get resolvedBoxClass(): string {
    switch (this.effectiveMode) {
      case 'danger': return 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50';
      case 'warning': return 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50';
      case 'success': return 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50';
      default: return 'bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50';
    }
  }

  get resolvedIconClass(): string {
    switch (this.effectiveMode) {
      case 'danger': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-amber-600 dark:text-amber-400';
      case 'success': return 'text-emerald-600 dark:text-emerald-400';
      default: return 'text-primary';
    }
  }

  get resolvedButtonClass(): string {
    switch (this.effectiveMode) {
      case 'danger': return 'bg-red-600 hover:bg-red-700 shadow-red-600/20';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20';
      case 'success': return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20';
      default: return 'bg-primary hover:bg-primary-dark shadow-primary/20';
    }
  }

  close() { this.closed.emit(); }
  confirm() { this.confirmed.emit(); }
}
