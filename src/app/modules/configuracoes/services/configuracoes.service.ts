import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { User } from '@core/models';

@Injectable({ providedIn: 'root' })
export class ConfiguracoesService {
  private api = inject(ApiService);
  private endpoint = '/users';

  getProfile(userId: string) {
    return this.api.get<User>(`${this.endpoint}/${userId}`);
  }

  updateProfile(userId: string, data: Partial<User>) {
    return this.api.put<User>(`${this.endpoint}/${userId}`, data);
  }

  changePassword(userId: string, currentPassword: string, newPassword: string) {
    return this.api.put(`${this.endpoint}/${userId}/password`, { currentPassword, newPassword });
  }
}
