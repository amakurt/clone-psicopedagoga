import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';

@Injectable({ providedIn: 'root' })
export class RastreioService {
  private api = inject(ApiService);

  list(params?: any) {
    return this.api.get('/screenings', params);
  }

  get(id: string) {
    return this.api.get(`/screenings/${id}`);
  }

  instruments() {
    return this.api.get('/screenings/instruments');
  }

  instrumentDef(code: string) {
    return this.api.get(`/screenings/instruments/${code}`);
  }

  create(data: any) {
    return this.api.post('/screenings', data);
  }

  update(id: string, data: any) {
    return this.api.put(`/screenings/${id}`, data);
  }

  delete(id: string) {
    return this.api.delete(`/screenings/${id}`);
  }

  hide(id: string, hidden: boolean) {
    return this.api.patch(`/screenings/${id}/hide`, { hidden });
  }

  hideAll(hidden: boolean) {
    return this.api.patch('/screenings/hide-all', { hidden });
  }
}