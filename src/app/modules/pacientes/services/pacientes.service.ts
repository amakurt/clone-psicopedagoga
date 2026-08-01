import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
@Injectable({ providedIn: 'root' })
export class PacientesService {
  private api = inject(ApiService);
  list(params?: any) { return this.api.get('/pacientes', params); }
  get(id: string) { return this.api.get(`/pacientes/${id}`); }
  create(data: any) { return this.api.post('/pacientes', data); }
  update(id: string, data: any) { return this.api.put(`/pacientes/${id}`, data); }
  delete(id: string) { return this.api.delete(`/pacientes/${id}`); }
}
