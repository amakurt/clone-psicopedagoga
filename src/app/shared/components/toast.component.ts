import { Component, Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {
  message = signal('');
  type = signal<ToastType>('success');
  state = signal<'hidden' | 'entering' | 'visible' | 'leaving'>('hidden');
  progress = signal(0);
  private timeout: any;
  private hideTimeout: any;
  private progressInterval: any;

  show(message: string, type: ToastType = 'success', duration = 3500) {
    clearTimeout(this.timeout);
    clearTimeout(this.hideTimeout);
    clearInterval(this.progressInterval);
    this.message.set(message);
    this.type.set(type);
    this.progress.set(100);
    this.state.set('entering');
    setTimeout(() => {
      this.state.set('visible');
      const startTime = Date.now();
      this.progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        this.progress.set(Math.max(0, 100 - (elapsed / duration) * 100));
      }, 30);
    }, 600);
    this.timeout = setTimeout(() => {
      clearInterval(this.progressInterval);
      this.state.set('leaving');
      this.hideTimeout = setTimeout(() => this.state.set('hidden'), 500);
    }, duration);
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error', 4500); }
  warning(message: string) { this.show(message, 'warning', 4500); }
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toast.state() !== 'hidden') {
      <div class="fixed bottom-6 right-6 z-[100]"
           [class.animate-toast-in]="toast.state() === 'entering' || toast.state() === 'visible'"
           [class.animate-toast-out]="toast.state() === 'leaving'">
        <div class="relative overflow-hidden flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-medium text-sm"
          [class]="getClasses()">
          <div class="absolute top-0 left-0 h-[3px] rounded-full transition-none"
               [style.width.%]="toast.progress()"
               [style.background]="getBarColor()">
          </div>
          <span class="material-icons text-[20px]">{{ getIcon() }}</span>
          <span>{{ toast.message() }}</span>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes toastIn {
      0% { opacity: 0; transform: translateY(30px) scale(0.9); }
      60% { opacity: 1; transform: translateY(-4px) scale(1.02); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes toastOut {
      0% { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(30px) scale(0.9); }
    }
    .animate-toast-in { animation: toastIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
    .animate-toast-out { animation: toastOut 0.5s cubic-bezier(0.55, 0, 1, 0.45) forwards; }
  `]
})
export class ToastComponent {
  constructor(public toast: ToastService) {}

  getClasses(): string {
    switch (this.toast.type()) {
      case 'success': return 'bg-emerald-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-emerald-500';
    }
  }

  getBarColor(): string {
    switch (this.toast.type()) {
      case 'success': return '#065f46';
      case 'error': return '#7f1d1d';
      case 'warning': return '#78350f';
      case 'info': return '#1e3a5f';
      default: return '#065f46';
    }
  }

  getIcon(): string {
    switch (this.toast.type()) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'check_circle';
    }
  }
}
