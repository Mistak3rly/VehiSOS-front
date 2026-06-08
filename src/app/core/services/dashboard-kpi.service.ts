import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardKPIResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class DashboardKpiService {
  private readonly BASE = `${environment.apiUrl}/api/v1/kpis`;

  constructor(private http: HttpClient) {}

  getDashboardKPIs(filters?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    tenant_id?: number;
    zona_id?: string;
    tipo_incidente?: string;
    estado_incidente?: string;
  }): Observable<DashboardKPIResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.fecha_inicio) {
        params = params.set('fecha_inicio', filters.fecha_inicio);
      }
      if (filters.fecha_fin) {
        params = params.set('fecha_fin', filters.fecha_fin);
      }
      if (filters.tenant_id !== undefined && filters.tenant_id !== null) {
        params = params.set('tenant_id', filters.tenant_id.toString());
      }
      if (filters.zona_id) {
        params = params.set('zona_id', filters.zona_id);
      }
      if (filters.tipo_incidente) {
        params = params.set('tipo_incidente', filters.tipo_incidente);
      }
      if (filters.estado_incidente) {
        params = params.set('estado_incidente', filters.estado_incidente);
      }
    }
    return this.http.get<DashboardKPIResponse>(`${this.BASE}/dashboard`, { params });
  }
}
