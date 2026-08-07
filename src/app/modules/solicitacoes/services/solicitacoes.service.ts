import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';

@Injectable({ providedIn: 'root' })
export class SolicitacoesService {
  private api = inject(ApiService);

  list(params?: any) { return this.api.get('/document-requests', params); }
  get(id: string) { return this.api.get(`/document-requests/${id}`); }
  create(data: any) { return this.api.post('/document-requests', data); }
  delete(id: string) { return this.api.delete(`/document-requests/${id}`); }
  resend(id: string) { return this.api.post(`/document-requests/${id}/resend`, {}); }
}
