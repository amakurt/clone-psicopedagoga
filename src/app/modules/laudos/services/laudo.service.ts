import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
@Injectable({ providedIn: 'root' })
export class LaudoService {
  private api = inject(ApiService);
  list(params?: any) { return this.api.get('/laudos', params); }
  get(id: string) { return this.api.get(`/laudos/${id}`); }
  create(data: any) { return this.api.post('/laudos', data); }
  update(id: string, data: any) { return this.api.put(`/laudos/${id}`, data); }
  delete(id: string) { return this.api.delete(`/laudos/${id}`); }
}
