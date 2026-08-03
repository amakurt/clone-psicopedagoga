import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Comunicacao } from '@core/models';

@Injectable({ providedIn: 'root' })
export class ComunicacaoService {
  private api = inject(ApiService);
  private endpoint = '/comunicacao';

  getAll() {
    return this.api.get<Comunicacao[]>(this.endpoint);
  }

  getById(id: string) {
    return this.api.get<Comunicacao>(`${this.endpoint}/${id}`);
  }

  create(data: Partial<Comunicacao>) {
    return this.api.post<Comunicacao>(this.endpoint, data);
  }

  delete(id: string) {
    return this.api.delete(`${this.endpoint}/${id}`);
  }
}
