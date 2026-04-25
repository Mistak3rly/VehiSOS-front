import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  VehiculoRead,
  VehiculoCreate,
  VehiculoUpdate,
  IncidenteRead,
  IncidenteCreate,
  IncidenteEstadoUpdate,
  EvidenciaCreate,
  EvidenciaRead,
  EstadoServicioRead,
  EstadoServicioCreate,
  TipoIncidenteRead,
  TipoIncidenteCreate,
  PrioridadRead,
  PrioridadCreate,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class EmergenciasService {
  private readonly BASE = `${environment.apiUrl}/api/v1/emergencias`;

  constructor(private http: HttpClient) {}

  // ── Vehículos ─────────────────────────────
  listVehiculos(): Observable<VehiculoRead[]> {
    return this.http.get<VehiculoRead[]>(`${this.BASE}/vehiculos`);
  }

  getVehiculo(id: number): Observable<VehiculoRead> {
    return this.http.get<VehiculoRead>(`${this.BASE}/vehiculos/${id}`);
  }

  createVehiculo(payload: VehiculoCreate): Observable<VehiculoRead> {
    return this.http.post<VehiculoRead>(`${this.BASE}/vehiculos`, payload);
  }

  updateVehiculo(id: number, payload: VehiculoUpdate): Observable<VehiculoRead> {
    return this.http.put<VehiculoRead>(`${this.BASE}/vehiculos/${id}`, payload);
  }

  // ── Incidentes ────────────────────────────
  listIncidentes(): Observable<IncidenteRead[]> {
    return this.http.get<IncidenteRead[]>(`${this.BASE}/incidentes`);
  }

  getIncidente(id: number): Observable<IncidenteRead> {
    return this.http.get<IncidenteRead>(`${this.BASE}/incidentes/${id}`);
  }

  createIncidente(payload: IncidenteCreate): Observable<IncidenteRead> {
    return this.http.post<IncidenteRead>(`${this.BASE}/incidentes`, payload);
  }

  addEvidencia(incidenteId: number, payload: EvidenciaCreate): Observable<EvidenciaRead> {
    return this.http.post<EvidenciaRead>(
      `${this.BASE}/incidentes/${incidenteId}/evidencias`,
      payload
    );
  }

  updateEstadoIncidente(
    incidenteId: number,
    payload: IncidenteEstadoUpdate
  ): Observable<IncidenteRead> {
    return this.http.patch<IncidenteRead>(
      `${this.BASE}/incidentes/${incidenteId}/estado`,
      payload
    );
  }

  // ── Catálogos ─────────────────────────────
  listEstados(): Observable<EstadoServicioRead[]> {
    return this.http.get<EstadoServicioRead[]>(`${this.BASE}/catalogos/estados`);
  }

  createEstado(payload: EstadoServicioCreate): Observable<EstadoServicioRead> {
    return this.http.post<EstadoServicioRead>(`${this.BASE}/catalogos/estados`, payload);
  }

  listTiposIncidente(): Observable<TipoIncidenteRead[]> {
    return this.http.get<TipoIncidenteRead[]>(`${this.BASE}/catalogos/tipos-incidente`);
  }

  createTipoIncidente(payload: TipoIncidenteCreate): Observable<TipoIncidenteRead> {
    return this.http.post<TipoIncidenteRead>(
      `${this.BASE}/catalogos/tipos-incidente`,
      payload
    );
  }

  listPrioridades(): Observable<PrioridadRead[]> {
    return this.http.get<PrioridadRead[]>(`${this.BASE}/catalogos/prioridades`);
  }

  createPrioridad(payload: PrioridadCreate): Observable<PrioridadRead> {
    return this.http.post<PrioridadRead>(`${this.BASE}/catalogos/prioridades`, payload);
  }

  seedCatalogosAdmin(): Observable<unknown> {
    return this.http.post(`${this.BASE}/admin/catalogos/seed-inteligentes`, {});
  }
}
