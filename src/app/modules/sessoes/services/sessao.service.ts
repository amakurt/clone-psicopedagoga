import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
@Injectable({ providedIn: 'root' })
export class SessaoService {
  private api = inject(ApiService);
  list(params?: any) { return this.api.get('/sessoes', params); }
  get(id: string) { return this.api.get(`/sessoes/${id}`); }
  create(data: any) { return this.api.post('/sessoes', data); }
  update(id: string, data: any) { return this.api.put(`/sessoes/${id}`, data); }
  delete(id: string) { return this.api.delete(`/sessoes/${id}`); }
}
