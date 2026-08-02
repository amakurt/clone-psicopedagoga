import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
@Injectable({ providedIn: 'root' })
export class DocumentosService {
  private api = inject(ApiService);
  list(params?: any) { return this.api.get('/documentos', params); }
  get(id: string) { return this.api.get(`/documentos/${id}`); }
  create(data: any) { return this.api.post('/documentos', data); }
  update(id: string, data: any) { return this.api.put(`/documentos/${id}`, data); }
  delete(id: string) { return this.api.delete(`/documentos/${id}`); }
}
