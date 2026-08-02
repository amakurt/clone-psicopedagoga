import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
@Injectable({ providedIn: 'root' })
export class BibliotecaService {
  private api = inject(ApiService);
  list(params?: any) { return this.api.get('/library', params); }
  get(id: string) { return this.api.get(`/library/${id}`); }
  create(data: any) { return this.api.post('/library', data); }
  update(id: string, data: any) { return this.api.put(`/library/${id}`, data); }
  delete(id: string) { return this.api.delete(`/library/${id}`); }
}
