import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get(path: string, params?: any) {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.baseUrl}${path}`, { params: httpParams });
  }

  post(path: string, body: any) {
    return this.http.post(`${this.baseUrl}${path}`, body);
  }

  put(path: string, body: any) {
    return this.http.put(`${this.baseUrl}${path}`, body);
  }

  delete(path: string) {
    return this.http.delete(`${this.baseUrl}${path}`);
  }
}
