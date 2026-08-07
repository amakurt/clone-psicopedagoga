import { Component, inject, signal, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { GuardianService } from '@modules/guardian/services/guardian.service';
import { ChatMessage } from '@core/models';

interface ChatConversation {
  pacienteId: string;
  patientName: string;
  patientInitials: string;
  patientColor: string;
  unreadCount: number;
  lastMessage: string;
  lastSenderName: string;
  lastAt: string;
}

@Component({
  selector: 'app-chat-floating',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="fixed bottom-6 right-6 z-[60]">
      <!-- Floating button -->
      @if (!isOpen()) {
        <button (click)="toggleOpen()"
          class="relative size-14 rounded-full bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/30 flex items-center justify-center transition-all hover:scale-105">
          <span class="material-icons text-2xl">chat</span>
          @if (totalUnread() > 0) {
            <span class="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {{ totalUnread() > 99 ? '99+' : totalUnread() }}
            </span>
          }
        </button>
      }

      <!-- Window -->
      @if (isOpen()) {
        <div class="absolute bottom-0 right-0 w-[380px] h-[520px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden flex flex-col chat-rise">
          <!-- Header -->
          <div class="p-4 bg-primary text-white flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <span class="material-icons">chat</span>
              <div>
                <p class="font-bold text-sm leading-tight">{{ isGuardian() ? 'Chat com a Equipe' : 'Chat com a Família' }}</p>
                <p class="text-[10px] opacity-80">{{ isGuardian() ? 'Fale com a equipe da clínica' : 'Responda aos responsáveis' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              @if (isGuardian()) {
                <a [routerLink]="'/guardian/chat'"
                  class="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="Abrir página completa">
                  <span class="material-icons text-lg">open_in_new</span>
                </a>
              }
              <button (click)="toggleOpen()" class="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="Fechar">
                <span class="material-icons text-lg">close</span>
              </button>
            </div>
          </div>

          <!-- Conversation list -->
          @if (selectedConversation() === null) {
            <div class="flex-1 overflow-y-auto custom-scrollbar">
              @if (loading()) {
                <div class="h-full flex items-center justify-center text-slate-400">
                  <span class="material-icons animate-spin">autorenew</span>
                </div>
              } @else if (conversations().length === 0) {
                <div class="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
                  <span class="material-icons text-5xl">forum</span>
                  <p class="text-sm">Nenhuma conversa ainda</p>
                  @if (!isGuardian()) {
                    <p class="text-xs text-center px-6">As mensagens dos responsáveis aparecerão aqui quando eles escreverem no portal.</p>
                  }
                </div>
              }
              @for (conversation of conversations(); track conversation.pacienteId) {
                <button (click)="openConversation(conversation)"
                  class="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-100 dark:border-slate-800">
                  <div class="size-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    [style.background]="conversation.patientColor">
                    {{ conversation.patientInitials }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="font-bold text-sm text-slate-900 dark:text-white truncate">{{ conversation.patientName }}</p>
                      @if (conversation.lastAt) {
                        <span class="text-[10px] text-slate-400 ml-2 shrink-0">{{ formatTime(conversation.lastAt) }}</span>
                      }
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                      @if (conversation.lastMessage) {
                        <span class="font-medium">{{ conversation.lastSenderName }}:</span> {{ conversation.lastMessage }}
                      }
                    </p>
                  </div>
                  @if (conversation.unreadCount > 0) {
                    <span class="size-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                      {{ conversation.unreadCount }}
                    </span>
                  }
                </button>
              }
            </div>
          }

          <!-- Thread -->
          @if (isOpen() && selectedConversation() !== null) {
            <div class="flex-1 flex flex-col overflow-hidden">
              <!-- Thread header -->
              <div class="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <button (click)="backToList()" class="size-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500" title="Voltar">
                  <span class="material-icons text-lg">arrow_back</span>
                </button>
                <div class="size-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                  [style.background]="selectedConversation()!.patientColor">
                  {{ selectedConversation()!.patientInitials }}
                </div>
                <p class="font-bold text-sm text-slate-900 dark:text-white truncate">{{ selectedConversation()!.patientName }}</p>
              </div>

              <!-- Messages -->
              <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                @if (messages().length === 0) {
                  <div class="h-full flex items-center justify-center text-slate-400 text-sm">
                    <p>Sem mensagens ainda — digite abaixo para começar.</p>
                  </div>
                }
                @for (msg of messages(); track msg.id) {
                  <div class="flex" [class.justify-end]="isMine(msg)">
                    <div class="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-snug"
                      [class]="isMine(msg)
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-md'">
                      <p class="text-xs font-semibold mb-1" *ngIf="!isMine(msg)">{{ msg.senderName }}</p>
                      <p class="whitespace-pre-wrap break-words">{{ msg.message }}</p>
                      <p class="text-[10px] mt-1 opacity-70">{{ formatTime(msg.createdAt) }}</p>
                    </div>
                  </div>
                }
              </div>

              <!-- Input -->
              <div class="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <div class="flex gap-2">
                  <input
                    [(ngModel)]="newMessage"
                    (keyup.enter)="send()"
                    class="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    placeholder="Digite sua mensagem...">
                  <button (click)="send()" [disabled]="!newMessage.trim()"
                    class="size-11 bg-primary hover:bg-primary-dark text-white rounded-xl flex items-center justify-center disabled:opacity-40 transition-all shrink-0">
                    <span class="material-icons text-lg">send</span>
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Footer -->
          @if (isGuardian() && conversations().length > 0 && selectedConversation() === null) {
            <div class="p-3 border-t border-slate-100 dark:border-slate-800 text-center shrink-0">
              <a [routerLink]="'/guardian/chat'" class="text-xs text-primary font-semibold hover:underline">
                Abrir página de mensagens
              </a>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
    @keyframes chatRise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .chat-rise { animation: chatRise 0.2s ease-out; }
  `]
})
export class ChatFloatingComponent implements OnInit, OnDestroy {
  @Input() guardian = false;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  private api = inject(ApiService);
  private auth = inject(AuthService);
  private guardianService = inject(GuardianService);
  private router = inject(Router);

  isGuardianSignal = signal(false);
  conversations = signal<ChatConversation[]>([]);
  selectedConversation = signal<ChatConversation | null>(null);
  messages = signal<ChatMessage[]>([]);
  totalUnread = signal(0);
  isOpenSignal = signal(false);
  loading = signal(false);
  sending = signal(false);
  newMessage = '';
  currentUserId = signal('');
  private pollTimer: any;

  ngOnInit() {
    const user = this.auth.user();
    if (user) this.currentUserId.set(user.id);
    this.refresh();
    this.pollTimer = setInterval(() => this.refresh(), 8000);
  }

  ngOnDestroy() {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  isOpen() { return this.isOpenSignal(); }
  isGuardian() { return this.guardian; }

  toggleOpen() {
    this.isOpenSignal.update(v => !v);
    if (this.isOpenSignal()) this.refresh();
  }

  close() {
    this.isOpenSignal.set(false);
  }

  refresh() {
    if (this.isGuardian()) {
      this.guardianService.getChatUnreadCount().subscribe({
        next: (res: any) => this.totalUnread.set(res.count || 0)
      });
      this.loadGuardianConversations();
    } else {
      this.loadStaffConversations();
    }
  }

  loadStaffConversations() {
    this.api.get('/chat/conversations').subscribe({
      next: (res: any) => {
        const list: ChatConversation[] = res.data || [];
        this.conversations.set(list);
        const unread = list.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        this.totalUnread.set(unread);
        if (this.selectedConversation() && this.isOpenSignal()) {
          this.reloadThread();
        }
      },
      error: () => {}
    });
  }

  loadGuardianConversations() {
    this.guardianService.getPatients().subscribe({
      next: (res: any) => {
        const patients = (res.data || res || []);
        const list: ChatConversation[] = patients.map((p: any) => ({
          pacienteId: p.id,
          patientName: p.name,
          patientInitials: p.initials || p.name.slice(0, 2).toUpperCase(),
          patientColor: p.color || '#007F80',
          unreadCount: 0,
          lastMessage: '',
          lastSenderName: '',
          lastAt: '',
        }));
        this.conversations.set(list);
      },
      error: () => {}
    });
  }

  openConversation(conversation: ChatConversation) {
    this.selectedConversation.set(conversation);
    if (this.isGuardian()) {
      this.reloadThread();
    } else {
      // Marca a conversa como lida e carrega as mensagens
      this.api.post(`/chat/conversations/${conversation.pacienteId}/read`, {}).subscribe({});
      this.api.get('/chat', { pacienteId: conversation.pacienteId }).subscribe({
        next: (res: any) => {
          this.messages.set(res.data || []);
          this.refresh();
          setTimeout(() => this.scrollToBottom(), 50);
        }
      });
    }
  }

  reloadThread() {
    const c = this.selectedConversation();
    if (!c) return;
    if (this.isGuardian()) {
      this.guardianService.getChatMessages(c.pacienteId).subscribe({
        next: (res: any) => {
          this.messages.set(res.data || []);
          setTimeout(() => this.scrollToBottom(), 50);
        }
      });
    }
  }

  backToList() {
    this.selectedConversation.set(null);
    this.messages.set([]);
    this.refresh();
  }

  isMine(msg: ChatMessage): boolean {
    if (this.isGuardian()) {
      return msg.senderRole === 'RESPONSAVEL' || msg.senderId === this.currentUserId();
    }
    return msg.senderRole === 'STAFF' || msg.senderId === this.currentUserId();
  }

  send() {
    const conversation = this.selectedConversation();
    if (!conversation || !this.newMessage.trim() || this.sending()) return;

    this.sending.set(true);
    const text = this.newMessage.trim();
    const obs = this.isGuardian()
      ? this.guardianService.sendChatMessage(conversation.pacienteId, text)
      : this.api.post('/chat/send', { pacienteId: conversation.pacienteId, message: text });

    obs.subscribe({
      next: (msg: any) => {
        this.messages.update(msgs => [...msgs, msg]);
        this.newMessage = '';
        this.sending.set(false);
        setTimeout(() => this.scrollToBottom(), 50);
        this.refresh();
      },
      error: () => { this.sending.set(false); }
    });
  }

  scrollToBottom() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }

  formatTime(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }
}