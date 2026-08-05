import { Component, Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {
  message = signal('');
  type = signal<ToastType>('success');
  visible = signal(false);
  private timeout: any;

  show(message: string, type: ToastType = 'success', duration = 3000) {
    clearTimeout(this.timeout);
    this.message.set(message);
    this.type.set(type);
    this.visible.set(true);
    this.timeout = setTimeout(() => this.visible.set(false), duration);
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error', 4000); }
  warning(message: string) { this.show(message, 'warning', 4000); }
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toast.visible()) {
      <div class="fixed bottom-6 right-6 z-[100] animate-toast-in">
        <div class="flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-medium text-sm"
          [class]="getClasses()">
          <span class="material-icons text-[20px]">{{ getIcon() }}</span>
          <span>{{ toast.message() }}</span>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-toast-in { animation: toastIn 0.3s ease-out; }
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
