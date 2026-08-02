import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
@Injectable({ providedIn: 'root' })
export class EvolucoesService {
  private api = inject(ApiService);
  list(params?: any) { return this.api.get('/session-records', params); }
  get(id: string) { return this.api.get(`/session-records/${id}`); }
  create(data: any) { return this.api.post('/session-records', data); }
  update(id: string, data: any) { return this.api.put(`/session-records/${id}`, data); }
  delete(id: string) { return this.api.delete(`/session-records/${id}`); }
}
