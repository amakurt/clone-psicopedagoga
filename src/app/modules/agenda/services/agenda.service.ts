import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
@Injectable({ providedIn: 'root' })
export class AgendaService {
  private api = inject(ApiService);
  list(params?: any) { return this.api.get('/appointments', params); }
  get(id: string) { return this.api.get(`/appointments/${id}`); }
  create(data: any) { return this.api.post('/appointments', data); }
  update(id: string, data: any) { return this.api.put(`/appointments/${id}`, data); }
  delete(id: string) { return this.api.delete(`/appointments/${id}`); }
}
