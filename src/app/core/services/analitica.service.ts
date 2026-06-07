import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DatosMapa, KPIGlobal, KPITaller, ReporteOperativo, ResumenAsistenciaRead,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AnaliticaService {
  private readonly BASE = `${environment.apiUrl}/api/v1/analitica`;

  constructor(private http: HttpClient) {}

  // CU-026
  kpiGlobal(): Observable<KPIGlobal> {
    return this.http.get<KPIGlobal>(`${this.BASE}/kpi/global`);
  }

  kpiTaller(): Observable<KPITaller> {
    return this.http.get<KPITaller>(`${this.BASE}/kpi/taller`);
  }

  // CU-027
  rendimientoTecnicos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE}/rendimiento/tecnicos`);
  }

  rendimientoTalleres(tenantId?: number): Observable<any[]> {
    const params = tenantId ? new HttpParams().set('tenant_id', tenantId) : undefined;
    return this.http.get<any[]>(`${this.BASE}/rendimiento/talleres`, { params });
  }

  // CU-028
  datosMapa(tenantId?: number): Observable<DatosMapa> {
    const params = tenantId ? new HttpParams().set('tenant_id', tenantId) : undefined;
    return this.http.get<DatosMapa>(`${this.BASE}/mapa/incidentes`, { params });
  }

  // CU-029
  reporteOperativoJson(filtros?: any): Observable<ReporteOperativo> {
    return this.http.get<ReporteOperativo>(`${this.BASE}/reportes/operativo/json`, { params: filtros });
  }

  reporteFinancieroJson(filtros?: any): Observable<ReporteOperativo> {
    return this.http.get<ReporteOperativo>(`${this.BASE}/reportes/financiero/json`, { params: filtros });
  }

  descargarExcelOperativo(filtros?: any): Observable<Blob> {
    return this.http.get(`${this.BASE}/reportes/operativo/excel`, {
      responseType: 'blob', params: filtros,
    });
  }

  descargarExcelFinanciero(filtros?: any): Observable<Blob> {
    return this.http.get(`${this.BASE}/reportes/financiero/excel`, {
      responseType: 'blob', params: filtros,
    });
  }

  descargarPdfOperativo(filtros?: any): Observable<Blob> {
    return this.http.get(`${this.BASE}/reportes/operativo/pdf`, {
      responseType: 'blob', params: filtros,
    });
  }

  descargarPdfFinanciero(filtros?: any): Observable<Blob> {
    return this.http.get(`${this.BASE}/reportes/financiero/pdf`, {
      responseType: 'blob', params: filtros,
    });
  }

  // CU-030
  getResumen(incidenteId: number): Observable<ResumenAsistenciaRead> {
    return this.http.get<ResumenAsistenciaRead>(`${this.BASE}/resumen/${incidenteId}`);
  }

  generarResumen(incidenteId: number): Observable<ResumenAsistenciaRead> {
    return this.http.post<ResumenAsistenciaRead>(`${this.BASE}/resumen/${incidenteId}/generar`, {});
  }
}
