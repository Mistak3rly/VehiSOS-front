import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ServicioSaaSCreate, ServicioSaaSUpdate, ServicioSaaSRead,
  CoberturaSaaSCreate, CoberturaSaaSUpdate, CoberturaSaaSRead,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class TallerSaasService {
  private readonly BASE = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  // ── Servicios ────────────────────────────────
  listServicios(): Observable<ServicioSaaSRead[]> {
    return this.http.get<ServicioSaaSRead[]>(`${this.BASE}/servicios`);
  }

  createServicio(payload: ServicioSaaSCreate): Observable<ServicioSaaSRead> {
    return this.http.post<ServicioSaaSRead>(`${this.BASE}/servicios`, payload);
  }

  updateServicio(id: number, payload: ServicioSaaSUpdate): Observable<ServicioSaaSRead> {
    return this.http.put<ServicioSaaSRead>(`${this.BASE}/servicios/${id}`, payload);
  }

  deleteServicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/servicios/${id}`);
  }

  // ── Coberturas ───────────────────────────────
  listCoberturas(): Observable<CoberturaSaaSRead[]> {
    return this.http.get<CoberturaSaaSRead[]>(`${this.BASE}/coberturas`);
  }

  createCobertura(payload: CoberturaSaaSCreate): Observable<CoberturaSaaSRead> {
    return this.http.post<CoberturaSaaSRead>(`${this.BASE}/coberturas`, payload);
  }

  updateCobertura(id: number, payload: CoberturaSaaSUpdate): Observable<CoberturaSaaSRead> {
    return this.http.put<CoberturaSaaSRead>(`${this.BASE}/coberturas/${id}`, payload);
  }

  deleteCobertura(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/coberturas/${id}`);
  }
}
