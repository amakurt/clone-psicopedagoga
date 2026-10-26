import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'app-global-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dialog.isOpen()) {
      <div
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
        role="dialog"
        aria-modal="true"
        (click)="onBackdropClick()"
      >
        <div
          class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-md overflow-hidden animate-scale-up"
          (click)="$event.stopPropagation()"
        >
          <!-- Top Accent Line -->
          <div class="h-1.5 w-full" [class]="getTopBarClass()"></div>

          <div class="p-6 sm:p-7 text-center">
            <!-- Icon Badge -->
            <div
              class="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
              [class]="getIconBadgeClass()"
            >
              <span class="material-icons text-[28px]">{{ getIcon() }}</span>
            </div>

            <!-- Title -->
            <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              {{ dialog.title() }}
            </h3>

            <!-- Message -->
            <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-center">
              {{ dialog.message() }}
            </p>
          </div>

          <!-- Actions -->
          <div class="p-5 sm:px-7 sm:pb-6 pt-0 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
            @if (dialog.showCancel()) {
              <button
                type="button"
                class="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-750 transition-all active:scale-95"
                (click)="dialog.cancelAction()"
              >
                {{ dialog.cancelText() }}
              </button>
            }

            <button
              type="button"
              class="flex-1 px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
              [class]="getConfirmBtnClass()"
              (click)="dialog.confirmAction()"
            >
              <span>{{ dialog.confirmText() }}</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.94) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .animate-scale-up {
      animation: scaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class GlobalDialogComponent {
  constructor(public dialog: DialogService) {}

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.dialog.isOpen()) {
      if (this.dialog.showCancel()) {
        this.dialog.cancelAction();
      } else {
        this.dialog.confirmAction();
      }
    }
  }

  onBackdropClick() {
    if (this.dialog.showCancel()) {
      this.dialog.cancelAction();
    } else {
      this.dialog.confirmAction();
    }
  }

  getTopBarClass(): string {
    const type = this.dialog.type();
    const danger = this.dialog.dangerMode();
    if (danger || type === 'error') return 'bg-rose-500';
    if (type === 'warning') return 'bg-amber-500';
    if (type === 'success') return 'bg-emerald-500';
    if (type === 'info') return 'bg-sky-500';
    return 'bg-primary';
  }

  getIconBadgeClass(): string {
    const type = this.dialog.type();
    const danger = this.dialog.dangerMode();
    if (danger || type === 'error') {
      return 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40';
    }
    if (type === 'warning') {
      return 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40';
    }
    if (type === 'success') {
      return 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40';
    }
    if (type === 'info') {
      return 'bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900/40';
    }
    return 'bg-primary/10 text-primary border border-primary/20';
  }

  getIcon(): string {
    const type = this.dialog.type();
    const danger = this.dialog.dangerMode();
    if (danger || type === 'error') return 'error_outline';
    if (type === 'warning') return 'warning_amber';
    if (type === 'success') return 'check_circle_outline';
    if (type === 'info') return 'info_outline';
    return danger ? 'delete_sweep' : 'help_outline';
  }

  getConfirmBtnClass(): string {
    const type = this.dialog.type();
    const danger = this.dialog.dangerMode();
    if (danger || type === 'error') {
      return 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25';
    }
    if (type === 'warning') {
      return 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25';
    }
    return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25';
  }
}
