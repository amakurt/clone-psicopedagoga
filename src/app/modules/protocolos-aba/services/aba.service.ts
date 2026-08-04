import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';

@Injectable({ providedIn: 'root' })
export class AbaService {
  private api = inject(ApiService);

  // Assessments
  listAssessments(params?: any) { return this.api.get('/aba/assessments', params); }
  getAssessment(id: string) { return this.api.get(`/aba/assessments/${id}`); }
  createAssessment(data: any) { return this.api.post('/aba/assessments', data); }
  updateAssessment(id: string, data: any) { return this.api.put(`/aba/assessments/${id}`, data); }
  deleteAssessment(id: string) { return this.api.delete(`/aba/assessments/${id}`); }

  // Programs
  listPrograms(params?: any) { return this.api.get('/aba/programs', params); }
  getProgram(id: string) { return this.api.get(`/aba/programs/${id}`); }
  createProgram(data: any) { return this.api.post('/aba/programs', data); }
  updateProgram(id: string, data: any) { return this.api.put(`/aba/programs/${id}`, data); }
  deleteProgram(id: string) { return this.api.delete(`/aba/programs/${id}`); }

  // Data Points
  addDataPoint(programId: string, data: any) { return this.api.post(`/aba/programs/${programId}/data`, data); }
  listDataPoints(programId: string) { return this.api.get(`/aba/programs/${programId}/data`); }
  deleteDataPoint(id: string) { return this.api.delete(`/aba/data/${id}`); }
}
