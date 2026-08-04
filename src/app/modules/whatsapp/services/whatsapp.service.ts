import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';

export interface WhatsAppConfig {
  apiUrl: string;
  token: string;
  phoneNumberId?: string;
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
}
