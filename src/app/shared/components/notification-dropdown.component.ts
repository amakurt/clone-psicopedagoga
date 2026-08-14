import { Component, inject, signal, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="absolute right-0 top-14 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden z-50 animate-in">
        <!-- Header -->
        <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 class="font-bold text-slate-900 dark:text-white text-sm">Notificações</h3>
          @if (notifications().length > 0) {
            <button class="text-xs text-primary font-semibold hover:underline" (click)="markAllRead()">
              Marcar todas como lidas
            </button>
          }
        </div>

        <!-- List -->
        <div class="max-h-80 overflow-y-auto">
          @if (notifications().length === 0) {
            <div class="p-8 text-center">
              <span class="material-icons text-4xl text-slate-300">notifications_none</span>
              <p class="text-sm text-slate-500 mt-2">Nenhuma notificação</p>
            </div>
          } @else {
            @for (notif of notifications(); track notif.id) {
              <div class="p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                [class]="!notif.read ? 'bg-primary/5' : ''"
                (click)="markAsRead(notif)">
                <div class="flex items-start gap-3">
                  <div class="size-8 rounded-full flex items-center justify-center shrink-0"
                    [class]="getNotifColor(notif.type)">
                    <span class="material-icons text-sm">{{ getNotifIcon(notif.type) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ notif.title }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{{ notif.message }}</p>
                    <p class="text-[10px] text-slate-500 mt-1">{{ formatTime(notif.createdAt) }}</p>
                  </div>
                  @if (!notif.read) {
                    <div class="size-2 bg-primary rounded-full shrink-0 mt-2"></div>
                  }
                </div>
              </div>
            }
          }
        </div>

        <!-- Footer -->
        @if (notifications().length > 0) {
          <div class="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button class="text-xs text-primary font-semibold hover:underline" (click)="clearAll()">
              Limpar todas
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; position: relative; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    .animate-in { animation: fadeIn 0.2s ease-out; }
  `]
})
export class NotificationDropdownComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() countChanged = new EventEmitter<void>();
  
  private api = inject(ApiService);
  notifications = signal<any[]>([]);

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.api.get('/notifications').subscribe({
      next: (res: any) => {
        this.notifications.set((res.data || []).slice(0, 10));
      },
      error: () => {}
    });
  }

  getNotifIcon(type: string): string {
    if (type?.includes('paciente') || type?.includes('Paciente')) return 'person_add';
    if (type?.includes('documento') || type?.includes('Documento')) return 'description';
    if (type?.includes('sessao') || type?.includes('Sessão') || type?.includes('evolucao')) return 'check_circle';
    if (type?.includes('pagamento') || type?.includes('Pagamento') || type?.includes('Financeiro')) return 'payments';
    if (type?.includes('agendamento') || type?.includes('Agendamento')) return 'calendar_month';
    if (type?.includes('mensagem') || type?.includes('mensagem') || type?.toLowerCase().startsWith('message')) return 'chat';
    return 'notifications';
  }

  getNotifColor(type: string): string {
    if (type?.includes('paciente') || type?.includes('Paciente')) return 'bg-blue-100 text-blue-600';
    if (type?.includes('documento') || type?.includes('Documento')) return 'bg-amber-100 text-amber-600';
    if (type?.includes('sessao') || type?.includes('Sessão') || type?.includes('evolucao')) return 'bg-green-100 text-green-600';
    if (type?.includes('pagamento') || type?.includes('Pagamento') || type?.includes('Financeiro')) return 'bg-purple-100 text-purple-600';
    if (type?.includes('agendamento') || type?.includes('Agendamento')) return 'bg-cyan-100 text-cyan-600';
    if (type?.includes('mensagem') || type?.toLowerCase().startsWith('message')) return 'bg-indigo-100 text-indigo-600';
    return 'bg-slate-100 text-slate-600';
  }

  formatTime(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  markAsRead(notif: any) {
    if (!notif.read) {
      this.api.put(`/notifications/${notif.id}`, { read: true }).subscribe({
        next: () => {
          this.notifications.update(nots => nots.map(n => n.id === notif.id ? { ...n, read: true } : n));
          this.countChanged.emit();
        },
        error: () => {}
      });
    }
  }

  markAllRead() {
    this.api.put('/notifications/mark-all-read', {}).subscribe({
      next: () => {
        this.notifications.update(nots => nots.map(n => ({ ...n, read: true })));
        this.countChanged.emit();
      },
      error: () => {
        this.notifications.update(nots => nots.map(n => ({ ...n, read: true })));
        this.countChanged.emit();
      }
    });
  }

  clearAll() {
    this.notifications.set([]);
    this.closed.emit();
  }
}
