import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private endpoint = '/users';

  constructor(private api: ApiService) {}

  getAll(params?: any) {
    return this.api.get<User[]>(this.endpoint, params);
  }

  getById(id: string) {
    return this.api.get<User>(`${this.endpoint}/${id}`);
  }

  create(data: Partial<User> & { password?: string }) {
    return this.api.post<User>(this.endpoint, data);
  }

  update(id: string, data: Partial<User>) {
    return this.api.put<User>(`${this.endpoint}/${id}`, data);
  }

  toggleStatus(id: string, active?: boolean) {
    return this.api.patch<User>(`${this.endpoint}/${id}/toggle-status`, { active });
  }

  delete(id: string) {
    return this.api.delete(`${this.endpoint}/${id}`);
  }
}
