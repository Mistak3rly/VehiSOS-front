/**
 * @deprecated Usar EmergenciasService en su lugar.
 * Este archivo se mantiene por compatibilidad con componentes existentes.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VehiculoRead, VehiculoCreate, VehiculoUpdate } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/emergencias/vehiculos`;

  constructor(private http: HttpClient) {}

  getVehicles(): Observable<VehiculoRead[]> {
    return this.http.get<VehiculoRead[]>(this.API_URL);
  }

  getVehicleById(id: number): Observable<VehiculoRead> {
    return this.http.get<VehiculoRead>(`${this.API_URL}/${id}`);
  }

  createVehicle(vehicle: VehiculoCreate): Observable<VehiculoRead> {
    return this.http.post<VehiculoRead>(this.API_URL, vehicle);
  }

  updateVehicle(id: number, vehicle: VehiculoUpdate): Observable<VehiculoRead> {
    return this.http.put<VehiculoRead>(`${this.API_URL}/${id}`, vehicle);
  }
}

