import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
@Injectable({ providedIn: 'root' })
export class EncaminhamentoService {
  private api = inject(ApiService);
  list(params?: any) { return this.api.get('/encaminhamentos', params); }
  get(id: string) { return this.api.get(`/encaminhamentos/${id}`); }
  create(data: any) { return this.api.post('/encaminhamentos', data); }
  update(id: string, data: any) { return this.api.put(`/encaminhamentos/${id}`, data); }
  delete(id: string) { return this.api.delete(`/encaminhamentos/${id}`); }
}
