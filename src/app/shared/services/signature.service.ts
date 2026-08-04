import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';

@Injectable({ providedIn: 'root' })
export class SignatureService {
  private api = inject(ApiService);

  save(data: { imageBase64: string; userId: string; documentType?: string }) {
    return this.api.post('/signatures', data);
  }

  getByUser(userId: string) {
    return this.api.get(`/signatures/user/${userId}`);
  }

  getById(id: string) {
    return this.api.get(`/signatures/${id}`);
  }

  delete(id: string) {
    return this.api.delete(`/signatures/${id}`);
  }
}
