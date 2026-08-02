import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
@Injectable({ providedIn: 'root' })
export class ResponsaveisService {
  private api = inject(ApiService);
  list(params?: any) { return this.api.get('/responsaveis', params); }
  get(id: string) { return this.api.get(`/responsaveis/${id}`); }
  create(data: any) { return this.api.post('/responsaveis', data); }
  update(id: string, data: any) { return this.api.put(`/responsaveis/${id}`, data); }
  delete(id: string) { return this.api.delete(`/responsaveis/${id}`); }
}
