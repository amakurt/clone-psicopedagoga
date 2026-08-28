import { Component, inject, OnInit, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GuardianService } from '../services/guardian.service';
import { ChatMessage } from '@core/models';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-guardian-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col flex-1 min-h-0 h-full">
      <!-- Header (Compact on mobile) -->
      <div class="flex items-center justify-between gap-2.5 sm:gap-3 pb-2.5 sm:pb-3 shrink-0">
        <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div class="size-9 sm:size-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <span class="material-icons text-primary text-xl sm:text-2xl">chat</span>
          </div>
          <div class="min-w-0">
            <h2 class="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">Mensagens com a Clínica</h2>
            <p class="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 truncate">Canal direto de comunicação com a equipe</p>
          </div>
        </div>

        <!-- Optional Patient Indicator/Selector if multiple children -->
        @if (patients().length > 1) {
          <div class="flex items-center gap-1.5 shrink-0 bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl">
            @for (p of patients(); track p.id) {
              <button 
                (click)="switchPatient(p.id)"
                class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all truncate max-w-[100px] sm:max-w-[140px]"
                [class]="patientId === p.id 
                  ? 'bg-primary text-on-primary shadow-sm' 
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'">
                {{ p.name }}
              </button>
            }
          </div>
        }
      </div>

      <!-- Chat Box (Fills remaining height) -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm">
        <!-- Messages Container -->
        <div #chatContainer class="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-3 custom-scrollbar" style="-webkit-overflow-scrolling: touch; overscroll-behavior-y: contain; touch-action: pan-y;">
          @if (messages().length === 0) {
            <div class="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6 text-gray-400 dark:text-slate-500">
              <div class="size-12 sm:size-14 rounded-3xl bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center mb-2 sm:mb-3">
                <span class="material-icons text-2xl">forum</span>
              </div>
              <p class="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300">Nenhuma mensagem ainda</p>
              <p class="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 mt-0.5 max-w-xs">Envie uma mensagem abaixo para falar com o profissional responsável.</p>
            </div>
          }
          @for (msg of messages(); track msg.id) {
            <div class="flex" [class.justify-end]="msg.senderId === currentUserId()">
              <div class="max-w-[88%] sm:max-w-md px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl sm:rounded-3xl shadow-sm"
                [class]="msg.senderId === currentUserId() 
                  ? 'bg-primary text-on-primary rounded-br-sm' 
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-sm'">
                <p class="text-[10px] sm:text-[11px] font-bold opacity-80 mb-0.5" *ngIf="msg.senderId !== currentUserId()">{{ msg.senderName }}</p>
                <p class="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">{{ msg.message }}</p>
                <p class="text-[9px] sm:text-[10px] mt-1 opacity-70 text-right">{{ msg.createdAt }}</p>
              </div>
            </div>
          }
        </div>

        <!-- Input Box -->
        <div class="border-t border-gray-100 dark:border-slate-700 p-2.5 sm:p-4 bg-gray-50/50 dark:bg-slate-800/80 shrink-0">
          <div class="flex items-center gap-2 sm:gap-3">
            <input 
              [(ngModel)]="newMessage" 
              (focus)="onInputFocus()"
              (keyup.enter)="sendMessage()"
              class="flex-1 px-3.5 py-2.5 sm:px-4 sm:py-3 border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 text-base sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Digite sua mensagem...">
            <button 
              (click)="sendMessage()" 
              [disabled]="!newMessage.trim()"
              class="size-10 sm:size-12 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-bold disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-primary/20 flex items-center justify-center shrink-0"
              title="Enviar mensagem">
              <span class="material-icons text-lg sm:text-xl">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GuardianChatComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  private guardianService = inject(GuardianService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  messages = signal<ChatMessage[]>([]);
  patients = signal<any[]>([]);
  newMessage = '';
  currentUserId = signal('');
  patientId = '';
  private pollTimer: any;

  ngOnInit() {
    const user = this.auth.user();
    if (user) this.currentUserId.set(user.id);

    this.route.queryParams.subscribe(params => {
      this.patientId = params['patientId'] || localStorage.getItem('guardian_patient_id') || '';
      this.loadMessages();
    });

    this.loadPatients();
    this.pollTimer = setInterval(() => this.loadMessages(false), 6000);
  }

  ngOnDestroy() {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  loadPatients() {
    this.guardianService.getPatients().subscribe({
      next: (res: any) => {
        const list = res.data || res || [];
        this.patients.set(list);
        if (!this.patientId && list.length > 0) {
          this.patientId = list[0].id;
          localStorage.setItem('guardian_patient_id', this.patientId);
          this.loadMessages();
        }
      }
    });
  }

  switchPatient(id: string) {
    this.patientId = id;
    localStorage.setItem('guardian_patient_id', id);
    this.loadMessages();
  }

  loadMessages(autoScroll = true) {
    this.guardianService.getChatMessages(this.patientId || undefined).subscribe({
      next: (res: any) => {
        this.messages.set(res.data || []);
        if (autoScroll) {
          setTimeout(() => this.scrollToBottom(), 100);
        }
      }
    });
  }

  onInputFocus() {
    setTimeout(() => this.scrollToBottom(), 300);
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    this.guardianService.sendChatMessage(this.patientId || undefined, this.newMessage).subscribe({
      next: (msg: any) => {
        this.messages.update(msgs => [...msgs, msg]);
        this.newMessage = '';
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  scrollToBottom() {
    if (this.chatContainer) {
      const el = this.chatContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}


