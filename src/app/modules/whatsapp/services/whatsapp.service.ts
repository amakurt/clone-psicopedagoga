import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';

export interface WhatsAppConfig {
  apiUrl: string;
  token?: string;
  phoneNumberId?: string;
  hasToken?: boolean;
  aiEnabled?: boolean;
  aiPrompt?: string;
  geminiKey?: string;
  hasGeminiKey?: boolean;
  autoMuteHours?: number;
  webhookSecret?: string;
}

export interface WhatsAppLog {
  id: string;
  patientId: string;
  phone: string;
  message: string;
  status: string;
  sentBy: string;
  createdAt: string;
  paciente?: { id: string; name: string };
}

export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  sender: 'USER' | 'AI' | 'HUMAN';
  message: string;
  createdAt: string;
}

export interface WhatsAppConversation {
  id: string;
  phone: string;
  contactName?: string | null;
  status: 'ACTIVE' | 'MUTED_BY_AGENT' | 'MUTED_BY_HUMAN' | 'CLOSED';
  mutedUntil?: string | null;
  pacienteId?: string | null;
  paciente?: { id: string; name: string; phone?: string } | null;
  lastMessageAt: string;
  createdAt: string;
  messages?: WhatsAppMessage[];
}

@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private api = inject(ApiService);
  private endpoint = '/whatsapp';

  sendReminder(patientId: string, message: string, phone?: string) {
    return this.api.post(`${this.endpoint}/send-reminder`, { patientId, message, phone });
  }

  sendBulk(patientIds: string[], message: string) {
    return this.api.post(`${this.endpoint}/send-bulk`, { patientIds, message });
  }

  getHistory(params?: { patientId?: string; status?: string; page?: number; limit?: number }) {
    return this.api.get<{ data: WhatsAppLog[]; total: number }>(`${this.endpoint}/history`, params);
  }

  getConfig() {
    return this.api.get<{ configured: boolean; config?: Partial<WhatsAppConfig> }>(`${this.endpoint}/config`);
  }

  saveConfig(config: WhatsAppConfig) {
    return this.api.post(`${this.endpoint}/config`, config);
  }

  sendTest(phone: string) {
    return this.api.post(`${this.endpoint}/test`, { phone });
  }

  // --- Gestão de Conversas e Atendimento Online ---
  getConversations(params?: { status?: string; search?: string; page?: number; limit?: number }) {
    return this.api.get<{ data: WhatsAppConversation[]; total: number; page: number; limit: number }>(
      `${this.endpoint}/conversations`,
      params
    );
  }

  getConversationMessages(id: string) {
    return this.api.get<{ conversation: WhatsAppConversation; messages: WhatsAppMessage[] }>(
      `${this.endpoint}/conversations/${id}/messages`
    );
  }

  toggleMute(id: string, mute?: boolean, hours: number = 4) {
    return this.api.post<{ success: boolean; conversation: WhatsAppConversation }>(
      `${this.endpoint}/conversations/${id}/toggle-mute`,
      { mute, hours }
    );
  }

  sendMessage(id: string, message: string) {
    return this.api.post<{ success: boolean; message: WhatsAppMessage }>(
      `${this.endpoint}/conversations/${id}/send`,
      { message }
    );
  }
}
