import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Transaction } from '@core/models';

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private api = inject(ApiService);
  private endpoint = '/transactions';

  getAll() {
    return this.api.get<Transaction[]>(this.endpoint);
  }

  getById(id: string) {
    return this.api.get<Transaction>(`${this.endpoint}/${id}`);
  }

  create(data: Partial<Transaction>) {
    return this.api.post<Transaction>(this.endpoint, data);
  }

  update(id: string, data: Partial<Transaction>) {
    return this.api.put<Transaction>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string) {
    return this.api.delete(`${this.endpoint}/${id}`);
  }
}
