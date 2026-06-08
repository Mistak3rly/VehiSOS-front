import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CotizacionCreate, CotizacionRead, CotizacionRespuesta, CotizacionUpdate,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CotizacionService {
  private readonly BASE = `${environment.apiUrl}/api/v1/cotizaciones`;

  constructor(private http: HttpClient) {}

  crear(payload: CotizacionCreate): Observable<CotizacionRead> {
    return this.http.post<CotizacionRead>(this.BASE, payload);
  }

  misCotizaciones(): Observable<CotizacionRead[]> {
    return this.http.get<CotizacionRead[]>(`${this.BASE}/mis-cotizaciones`);
  }

  porIncidente(incidenteId: number): Observable<CotizacionRead[]> {
    return this.http.get<CotizacionRead[]>(`${this.BASE}/incidente/${incidenteId}`);
  }

  get(id: number): Observable<CotizacionRead> {
    return this.http.get<CotizacionRead>(`${this.BASE}/${id}`);
  }

  actualizar(id: number, payload: CotizacionUpdate): Observable<CotizacionRead> {
    return this.http.put<CotizacionRead>(`${this.BASE}/${id}`, payload);
  }

  enviar(id: number): Observable<CotizacionRead> {
    return this.http.patch<CotizacionRead>(`${this.BASE}/${id}/enviar`, {});
  }

  responder(id: number, payload: CotizacionRespuesta): Observable<CotizacionRead> {
    return this.http.patch<CotizacionRead>(`${this.BASE}/${id}/respuesta`, payload);
  }

  confirmarPago(id: number): Observable<CotizacionRead> {
    return this.http.patch<CotizacionRead>(`${this.BASE}/${id}/pago`, {});
  }

  descargarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.BASE}/${id}/pdf`, { responseType: 'blob' });
  }
}
