import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TallerRead } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class TalleresService {
  private readonly BASE = `${environment.apiUrl}/api/v1/talleres`;

  constructor(private http: HttpClient) {}

  /** Lista todos los talleres activos */
  listTalleres(): Observable<TallerRead[]> {
    return this.http.get<TallerRead[]>(`${this.BASE}/talleres`);
  }

  /** Obtiene un taller por ID */
  getTaller(id: number): Observable<TallerRead> {
    return this.http.get<TallerRead>(`${this.BASE}/talleres/${id}`);
  }

  /** Obtiene talleres disponibles para asignación */
  getTalleresDisponibles(): Observable<TallerRead[]> {
    return this.http.get<TallerRead[]>(`${this.BASE}/talleres?disponibles=true`);
  }
}
