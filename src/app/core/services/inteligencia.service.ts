import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AnalisisIARead,
  TranscripcionAudioResponse,
  ExtraccionInfoResponse,
  ClasificacionIncidenteResponse,
  AnalisisImagenesResponse,
  ResumenPriorizacionResponse,
  AsignacionInteligenteRequest,
  AsignacionInteligenteResponse,
  WorkshopAssistantRequest,
  WorkshopAssistantResponse,
  TrazabilidadCombinadaResponse,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class InteligenciaService {
  private readonly BASE = `${environment.apiUrl}/api/v1/asignacion`;

  constructor(private http: HttpClient) {}

  /** Transcribe audios del incidente */
  transcribirAudio(incidenteId: number): Observable<TranscripcionAudioResponse> {
    return this.http.post<TranscripcionAudioResponse>(
      `${this.BASE}/incidentes/${incidenteId}/transcribir`,
      {}
    );
  }

  /** Extrae entidades y palabras clave del texto */
  extraerInformacion(incidenteId: number): Observable<ExtraccionInfoResponse> {
    return this.http.post<ExtraccionInfoResponse>(
      `${this.BASE}/incidentes/${incidenteId}/extraer-informacion`,
      {}
    );
  }

  /** Clasifica el tipo de incidente con IA */
  clasificarIncidente(incidenteId: number): Observable<ClasificacionIncidenteResponse> {
    return this.http.post<ClasificacionIncidenteResponse>(
      `${this.BASE}/incidentes/${incidenteId}/clasificar`,
      {}
    );
  }

  /** Analiza imágenes del incidente con IA */
  analizarImagenes(incidenteId: number): Observable<AnalisisImagenesResponse> {
    return this.http.post<AnalisisImagenesResponse>(
      `${this.BASE}/incidentes/${incidenteId}/analizar-imagenes`,
      {}
    );
  }

  /** Genera resumen y sugerencia de prioridad con IA */
  resumirYPriorizar(incidenteId: number): Observable<ResumenPriorizacionResponse> {
    return this.http.post<ResumenPriorizacionResponse>(
      `${this.BASE}/incidentes/${incidenteId}/resumir-priorizar`,
      {}
    );
  }

  /** Recomienda el mejor taller para el incidente */
  recomendarTaller(
    incidenteId: number,
    payload: AsignacionInteligenteRequest
  ): Observable<AsignacionInteligenteResponse> {
    return this.http.post<AsignacionInteligenteResponse>(
      `${this.BASE}/incidentes/${incidenteId}/recomendar-taller`,
      payload
    );
  }

  /** Asistente IA para recomendar talleres sin incidente previo */
  assistantRecommendWorkshops(
    payload: WorkshopAssistantRequest
  ): Observable<WorkshopAssistantResponse> {
    return this.http.post<WorkshopAssistantResponse>(
      `${this.BASE}/recommend-workshops`,
      payload
    );
  }

  /** Lista todos los análisis IA de un incidente */
  listAnalisis(incidenteId: number): Observable<AnalisisIARead[]> {
    return this.http.get<AnalisisIARead[]>(
      `${this.BASE}/incidentes/${incidenteId}/analisis`
    );
  }

  /** Retorna la trazabilidad completa del incidente */
  getTrazabilidad(incidenteId: number): Observable<TrazabilidadCombinadaResponse> {
    return this.http.get<TrazabilidadCombinadaResponse>(
      `${this.BASE}/incidentes/${incidenteId}/trazabilidad`
    );
  }
}
