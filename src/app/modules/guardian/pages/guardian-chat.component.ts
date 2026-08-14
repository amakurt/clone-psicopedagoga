import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
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
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Mensagens</h2>
        <p class="text-gray-500 dark:text-slate-400 mt-1">Chat com o profissional</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col" style="height: 500px;">
        <!-- Messages -->
        <div #chatContainer class="flex-1 overflow-y-auto p-4 space-y-4">
          @if (messages().length === 0) {
            <div class="flex items-center justify-center h-full text-gray-400">
              <p>Nenhuma mensagem ainda</p>
            </div>
          }
          @for (msg of messages(); track msg.id) {
            <div class="flex" [class.justify-end]="msg.senderId === currentUserId()">
              <div class="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl"
                [class]="msg.senderId === currentUserId() 
                  ? 'bg-primary text-on-primary rounded-br-md' 
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-md'">
                <p class="text-sm font-medium" *ngIf="msg.senderId !== currentUserId()">{{ msg.senderName }}</p>
                <p class="text-sm">{{ msg.message }}</p>
                <p class="text-xs mt-1 opacity-70">{{ msg.createdAt }}</p>
              </div>
            </div>
          }
        </div>

        <!-- Input -->
        <div class="border-t border-gray-200 dark:border-slate-700 p-4">
          <div class="flex gap-3">
            <input 
              [(ngModel)]="newMessage" 
              (keyup.enter)="sendMessage()"
              class="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Digite sua mensagem...">
            <button 
              (click)="sendMessage()" 
              [disabled]="!newMessage.trim()"
              class="px-6 py-3 bg-primary hover:bg-primary-dark text-on-primary rounded-xl font-semibold disabled:opacity-50 transition-all">
              <span class="material-icons">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GuardianChatComponent implements OnInit {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  private guardianService = inject(GuardianService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  messages = signal<ChatMessage[]>([]);
  newMessage = '';
  currentUserId = signal('');
  patientId = '';

  ngOnInit() {
    const user = this.auth.user();
    if (user) this.currentUserId.set(user.id);

    this.route.queryParams.subscribe(params => {
      this.patientId = params['patientId'] || localStorage.getItem('guardian_patient_id') || '';
      if (this.patientId) {
        this.loadMessages();
      }
    });
  }

  loadMessages() {
    this.guardianService.getChatMessages(this.patientId).subscribe({
      next: (res: any) => {
        this.messages.set(res.data || []);
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.patientId) return;

    this.guardianService.sendChatMessage(this.patientId, this.newMessage).subscribe({
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
