import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
@Injectable({ providedIn: 'root' })
export class EscolasService {
  private api = inject(ApiService);
  list(params?: any) { return this.api.get('/escolas', params); }
  get(id: string) { return this.api.get(`/escolas/${id}`); }
  create(data: any) { return this.api.post('/escolas', data); }
  update(id: string, data: any) { return this.api.put(`/escolas/${id}`, data); }
  delete(id: string) { return this.api.delete(`/escolas/${id}`); }
}
