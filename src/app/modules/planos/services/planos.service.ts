import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
@Injectable({ providedIn: 'root' })
export class PlanosService {
  private api = inject(ApiService);
  list(params?: any) { return this.api.get('/intervention-plans', params); }
  get(id: string) { return this.api.get(`/intervention-plans/${id}`); }
  create(data: any) { return this.api.post('/intervention-plans', data); }
  update(id: string, data: any) { return this.api.put(`/intervention-plans/${id}`, data); }
  delete(id: string) { return this.api.delete(`/intervention-plans/${id}`); }
}
