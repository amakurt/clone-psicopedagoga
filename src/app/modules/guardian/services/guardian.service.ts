import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Paciente, SessionRecord, Transaction, Document, Appointment, ChatMessage } from '@core/models';

@Injectable({ providedIn: 'root' })
export class GuardianService {
  private api = inject(ApiService);
  private base = '/guardian';

  linkPatient(accessCode: string) {
    return this.api.post<{ patient: { id: string; name: string } }>(`${this.base}/link`, { accessCode });
  }

  getDashboard() {
    return this.api.get<{ patients: Paciente[]; pendingAnamnese: number; upcomingAppointments: number }>(`${this.base}/dashboard`);
  }

  getPatients() {
    return this.api.get<{ data: Paciente[]; total: number }>(`${this.base}/patients`);
  }

  getEvolutions(patientId: string) {
    return this.api.get<{ data: SessionRecord[]; total: number }>(`${this.base}/evolutions/${patientId}`);
  }

  getFinancial(patientId: string) {
    return this.api.get<{ data: Transaction[]; total: number }>(`${this.base}/financial/${patientId}`);
  }

  getDocuments(patientId: string) {
    return this.api.get<{ data: Document[]; total: number }>(`${this.base}/documents/${patientId}`);
  }

  uploadDocument(data: { pacienteId: string; name: string; category?: string; fileUrl?: string; size?: string }) {
    return this.api.post<Document>(`${this.base}/documents`, data);
  }

  getAppointments(patientId: string) {
    return this.api.get<{ data: Appointment[]; total: number }>(`${this.base}/appointments/${patientId}`);
  }

  requestAppointment(data: { pacienteId: string; date: string; startTime: string; endTime: string; notes?: string }) {
    return this.api.post<Appointment>(`${this.base}/appointments`, data);
  }

  updateProfile(name: string) {
    return this.api.put(`${this.base}/profile`, { name });
  }

  getChatMessages(patientId: string) {
    return this.api.get<{ data: ChatMessage[]; total: number }>(`${this.base}/chat/${patientId}`);
  }

  sendChatMessage(pacienteId: string, message: string) {
    return this.api.post<ChatMessage>(`${this.base}/chat`, { pacienteId, message });
  }
}
