import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
@Injectable({ providedIn: 'root' })
export class ProtocolosService {
  private api = inject(ApiService);
  list(params?: any) { return this.api.get('/protocol-evaluations', params); }
  get(id: string) { return this.api.get(`/protocol-evaluations/${id}`); }
  create(data: any) { return this.api.post('/protocol-evaluations', data); }
  update(id: string, data: any) { return this.api.put(`/protocol-evaluations/${id}`, data); }
  delete(id: string) { return this.api.delete(`/protocol-evaluations/${id}`); }
}
