import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TrackingPoint {
  id: number; id_incidente: number; id_tecnico: number | null;
  latitud: number; longitud: number; velocidad_kmh: number | null;
  precision_metros: number | null; timestamp: string;
}

export interface MensajeRead {
  id: number; id_incidente: number; id_autor: number;
  rol_autor: string; contenido: string; leido: boolean; fecha_creacion: string;
}

export interface CancelacionRead {
  id: number; id_incidente: number; id_usuario: number;
  tipo: string; motivo: string; observacion: string | null;
  estado_anterior: string | null; fecha_hora: string;
}

export interface CancelacionCreate {
  tipo: 'cancelacion' | 'excepcion';
  motivo: string;
  observacion?: string;
}

const MOTIVOS_CANCELACION = [
  { value: 'cliente_cancelo',    label: 'Cliente canceló' },
  { value: 'seguro_resolvio',    label: 'Seguro lo resolvió' },
  { value: 'problema_resuelto',  label: 'Problema resuelto por cuenta propia' },
];

const MOTIVOS_EXCEPCION = [
  { value: 'taller_no_disponible',  label: 'Taller no disponible' },
  { value: 'tecnico_no_disponible', label: 'Técnico no disponible' },
  { value: 'demora_excesiva',       label: 'Demora excesiva' },
  { value: 'vehiculo_inaccesible',  label: 'Vehículo inaccesible' },
  { value: 'error_operativo',       label: 'Error operativo' },
];

@Injectable({ providedIn: 'root' })
export class OperacionesService {
  private readonly BASE = `${environment.apiUrl}/api/v1/operaciones`;

  readonly motivosCancelacion = MOTIVOS_CANCELACION;
  readonly motivosExcepcion = MOTIVOS_EXCEPCION;

  constructor(private http: HttpClient) {}

  // ── Tracking (CU-021) ────────────────────────────────────
  getTracking(incidenteId: number): Observable<TrackingPoint[]> {
    return this.http.get<TrackingPoint[]>(`${this.BASE}/tracking/${incidenteId}`);
  }

  getUltimoTracking(incidenteId: number): Observable<TrackingPoint | null> {
    return this.http.get<TrackingPoint | null>(`${this.BASE}/tracking/${incidenteId}/ultimo`);
  }

  postTracking(incidenteId: number, lat: number, lng: number, vel?: number): Observable<TrackingPoint> {
    return this.http.post<TrackingPoint>(`${this.BASE}/tracking/${incidenteId}`, { latitud: lat, longitud: lng, velocidad_kmh: vel });
  }

  // ── Mensajería (CU-023) ──────────────────────────────────
  getMensajes(incidenteId: number): Observable<MensajeRead[]> {
    return this.http.get<MensajeRead[]>(`${this.BASE}/mensajes/${incidenteId}`);
  }

  sendMensaje(incidenteId: number, contenido: string): Observable<MensajeRead> {
    return this.http.post<MensajeRead>(`${this.BASE}/mensajes/${incidenteId}`, { contenido });
  }

  markLeidos(incidenteId: number): Observable<void> {
    return this.http.post<void>(`${this.BASE}/mensajes/${incidenteId}/leer`, {});
  }

  // ── Cancelaciones / Excepciones (CU-024) ─────────────────
  getCancelaciones(incidenteId: number): Observable<CancelacionRead[]> {
    return this.http.get<CancelacionRead[]>(`${this.BASE}/cancelaciones/${incidenteId}`);
  }

  registrarCancelacion(incidenteId: number, payload: CancelacionCreate): Observable<CancelacionRead> {
    return this.http.post<CancelacionRead>(`${this.BASE}/cancelaciones/${incidenteId}`, payload);
  }
}
