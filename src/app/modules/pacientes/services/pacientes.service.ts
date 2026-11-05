import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '@core/services/api.service';

@Injectable({ providedIn: 'root' })
export class PacientesService {
  private api = inject(ApiService);
  private scanDraft = signal<any | null>(null);

  setScanDraft(draft: any) {
    this.scanDraft.set(draft);
  }

  consumeScanDraft(): any | null {
    const draft = this.scanDraft();
    this.scanDraft.set(null);
    return draft;
  }

  list(params?: any) { return this.api.get('/pacientes', params); }
  get(id: string) { return this.api.get(`/pacientes/${id}`); }
  create(data: any) { return this.api.post('/pacientes', data); }
  update(id: string, data: any) { return this.api.put(`/pacientes/${id}`, data); }
  toggleStatus(id: string, active?: boolean) { return this.api.patch(`/pacientes/${id}/toggle-status`, { active }); }
  delete(id: string) { return this.api.delete(`/pacientes/${id}`); }
}
