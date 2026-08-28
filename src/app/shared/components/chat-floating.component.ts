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
    <div class="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[60]">
      <!-- Floating button -->
      @if (!isOpen()) {
        <button (click)="toggleOpen()"
          class="relative size-12 sm:size-14 rounded-full bg-primary hover:bg-primary-dark text-on-primary shadow-xl shadow-primary/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95">
          <span class="material-icons text-xl sm:text-2xl">chat</span>
          @if (totalUnread() > 0) {
            <span class="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {{ totalUnread() > 99 ? '99+' : totalUnread() }}
            </span>
          }
        </button>
      }

      <!-- Window -->
      @if (isOpen()) {
        <div class="fixed inset-x-3 bottom-20 top-20 sm:top-auto sm:inset-x-auto sm:absolute sm:bottom-0 sm:right-0 sm:w-[380px] sm:h-[520px] max-w-[calc(100vw-1.5rem)] max-h-[calc(100dvh-120px)] sm:max-h-none bg-white dark:bg-slate-900 rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden flex flex-col chat-rise z-[60]">
          <!-- Header -->
          <div class="p-3.5 sm:p-4 bg-primary text-on-primary flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2.5 sm:gap-3">
              <span class="material-icons text-xl sm:text-2xl">chat</span>
              <div>
                <p class="font-bold text-xs sm:text-sm leading-tight">{{ isGuardian() ? 'Chat com a Equipe' : 'Chat com a Família' }}</p>
                <p class="text-[10px] opacity-80">{{ isGuardian() ? 'Fale com a equipe da clínica' : 'Responda aos responsáveis' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              @if (isGuardian()) {
                <a [routerLink]="'/guardian/chat'"
                  (click)="close()"
                  class="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="Abrir página completa">
                  <span class="material-icons text-lg">open_in_new</span>
                </a>
              }
              <button (click)="toggleOpen()" class="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="Fechar">
                <span class="material-icons text-lg">close</span>
              </button>
            </div>
          </div>

          <!-- Conversation list (Only shown for Staff) -->
          @if (!isGuardian() && selectedConversation() === null) {
            <div class="flex-1 overflow-y-auto custom-scrollbar">
              @if (loading()) {
                <div class="h-full flex items-center justify-center text-slate-500">
                  <span class="material-icons animate-spin">autorenew</span>
                </div>
              } @else if (conversations().length === 0) {
                <div class="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-500 gap-2">
                  <span class="material-icons text-5xl">forum</span>
                  <p class="text-sm">Nenhuma conversa ainda</p>
                  <p class="text-xs text-center px-6">As mensagens dos responsáveis aparecerão aqui quando eles escreverem no portal.</p>
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
                        <span class="text-[10px] text-slate-500 ml-2 shrink-0">{{ formatTime(conversation.lastAt) }}</span>
                      }
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                      @if (conversation.lastMessage) {
                        <span class="font-medium">{{ conversation.lastSenderName }}:</span> {{ conversation.lastMessage }}
                      }
                    </p>
                  </div>
                  @if (conversation.unreadCount > 0) {
                    <span class="size-5 bg-primary text-on-primary text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                      {{ conversation.unreadCount }}
                    </span>
                  }
                </button>
              }
            </div>
          }

          <!-- Thread (Always shown for Guardian, or for Staff when a conversation is selected) -->
          @if (isOpen() && (isGuardian() || selectedConversation() !== null)) {
            <div class="flex-1 flex flex-col overflow-hidden">
              <!-- Thread header -->
              <div class="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-primary/10 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div class="flex items-center gap-2 min-w-0">
                  @if (!isGuardian()) {
                    <button (click)="backToList()" class="size-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300" title="Voltar">
                      <span class="material-icons text-lg">arrow_back</span>
                    </button>
                    <div class="size-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                      [style.background]="selectedConversation()?.patientColor || '#007F80'">
                      {{ selectedConversation()?.patientInitials || 'P' }}
                    </div>
                    <p class="font-bold text-sm text-slate-900 dark:text-white truncate">{{ selectedConversation()?.patientName }}</p>
                  } @else {
                    <div class="size-8 rounded-2xl bg-primary text-on-primary flex items-center justify-center text-xs font-bold shrink-0">
                      <span class="material-icons text-sm">support_agent</span>
                    </div>
                    <div class="min-w-0">
                      <p class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">Mensagens Diretas</p>
                      <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Equipe da Clínica</p>
                    </div>
                  }
                </div>

                <!-- Child selector in header if guardian has > 1 child -->
                @if (isGuardian() && conversations().length > 1) {
                  <div class="flex items-center gap-1 shrink-0">
                    @for (conv of conversations(); track conv.pacienteId) {
                      <button 
                        (click)="openConversation(conv)"
                        class="px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all truncate max-w-[80px]"
                        [class]="selectedConversation()?.pacienteId === conv.pacienteId 
                          ? 'bg-primary text-on-primary' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'">
                        {{ conv.patientName }}
                      </button>
                    }
                  </div>
                }
              </div>

              <!-- Messages -->
              <div #scrollContainer class="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
                @if (messages().length === 0) {
                  <div class="h-full flex items-center justify-center text-slate-500 text-sm">
                    <p>Sem mensagens ainda — digite abaixo para começar.</p>
                  </div>
                }
                @for (msg of messages(); track msg.id) {
                  <div class="flex" [class.justify-end]="isMine(msg)">
                    <div class="max-w-[85%] sm:max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-snug"
                      [class]="isMine(msg)
                        ? 'bg-primary text-on-primary rounded-br-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-md'">
                      <p class="text-[11px] font-semibold mb-1" *ngIf="!isMine(msg)">{{ msg.senderName }}</p>
                      <p class="whitespace-pre-wrap break-words">{{ msg.message }}</p>
                      <p class="text-[9px] sm:text-[10px] mt-1 opacity-70 text-right">{{ formatTime(msg.createdAt) }}</p>
                    </div>
                  </div>
                }
              </div>

              <!-- Input -->
              <div class="p-2.5 sm:p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
                <div class="flex gap-2">
                  <input
                    [(ngModel)]="newMessage"
                    (focus)="onInputFocus()"
                    (keyup.enter)="send()"
                    class="flex-1 px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent text-base sm:text-sm"
                    placeholder="Digite sua mensagem...">
                  <button (click)="send()" [disabled]="!newMessage.trim()"
                    class="size-11 bg-primary hover:bg-primary-dark text-on-primary rounded-xl flex items-center justify-center disabled:opacity-40 transition-all shrink-0 active:scale-95"
                    title="Enviar">
                    <span class="material-icons text-lg">send</span>
                  </button>
                </div>
              </div>
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

        // Se for responsável, abre direto na conversa com a clínica
        if (this.isGuardian()) {
          if (!this.selectedConversation()) {
            const savedId = localStorage.getItem('guardian_patient_id');
            const target = list.find(c => c.pacienteId === savedId) || list[0] || {
              pacienteId: '',
              patientName: 'Clínica',
              patientInitials: 'C',
              patientColor: '#007F80',
              unreadCount: 0,
              lastMessage: '',
              lastSenderName: '',
              lastAt: ''
            };
            this.openConversation(target);
          } else if (this.isOpenSignal()) {
            this.reloadThread();
          }
        }
      },
      error: () => {
        if (this.isGuardian() && !this.selectedConversation()) {
          this.reloadThread();
        }
      }
    });
  }

  openConversation(conversation: ChatConversation) {
    this.selectedConversation.set(conversation);
    this.reloadThread();
    if (!this.isGuardian()) {
      this.api.post(`/chat/conversations/${conversation.pacienteId}/read`, {}).subscribe({});
    }
  }

  reloadThread() {
    const c = this.selectedConversation();
    if (this.isGuardian()) {
      const pId = c?.pacienteId || undefined;
      this.guardianService.getChatMessages(pId).subscribe({
        next: (res: any) => {
          this.messages.set(res.data || []);
          setTimeout(() => this.scrollToBottom(), 50);
        }
      });
    } else if (c) {
      this.api.post(`/chat/conversations/${c.pacienteId}/read`, {}).subscribe({});
      this.api.get('/chat', { pacienteId: c.pacienteId }).subscribe({
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

  onInputFocus() {
    setTimeout(() => this.scrollToBottom(), 300);
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