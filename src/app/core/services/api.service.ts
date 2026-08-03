import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T = any>(path: string, params?: any) {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<T>(`${this.baseUrl}${path}`, { params: httpParams });
  }

  post<T = any>(path: string, body: any) {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  put<T = any>(path: string, body: any) {
    return this.http.put<T>(`${this.baseUrl}${path}`, body);
  }

  delete<T = any>(path: string) {
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }
}
