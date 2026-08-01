import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
@Injectable({ providedIn: 'root' })
export class AnamneseService {
  private api = inject(ApiService);
  list(params?: any) { return this.api.get('/anamneses', params); }
  get(id: string) { return this.api.get(`/anamneses/${id}`); }
  create(data: any) { return this.api.post('/anamneses', data); }
  update(id: string, data: any) { return this.api.put(`/anamneses/${id}`, data); }
  delete(id: string) { return this.api.delete(`/anamneses/${id}`); }
}
