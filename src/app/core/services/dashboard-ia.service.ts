import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IncidenteRead, AsignacionRead, PrioridadRead } from '../models/api.models';

// ─────────────────────────────────────────────
// Interfaces locales del servicio
// ─────────────────────────────────────────────
export interface AnalisisIARead {
  id: number;
  id_incidente: number;
  tipo_analisis: string;
  modelo_usado: string | null;
  resultado: Record<string, unknown>;
  nivel_confianza: number | null;
  fecha_creacion: string;
}

export interface PriorityDistribution {
  label: string;
  count: number;
  percentage: number;
  color: string;
  nivel: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  incidenteId: number;
  titulo: string;
  prioridad: string;
}

export interface IncidentTypeStat {
  tipo: string;
  count: number;
  percentage: number;
}

export interface IAKpis {
  avgConfidence: number;
  totalAnalyses: number;
  alertasReentrenamiento: number;  // análisis con confianza < 0.7
  tiempoRespuestaMs: number | null;
  analisisPorTipo: Record<string, number>;
}

export interface LogisticaStat {
  totalAsignaciones: number;
  aceptadas: number;
  rechazadas: number;
  tasaAceptacion: number;
  distanciaPromedioKm: number;
}

export interface DashboardIAData {
  priorityDistribution: PriorityDistribution[];
  heatmapPoints: HeatmapPoint[];
  incidentTypes: IncidentTypeStat[];
  recentAnalyses: AnalisisIARead[];
  logisticaStats: LogisticaStat;
  iaKpis: IAKpis;
  totalIncidentes: number;
  sinPrioridad: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardIAService {
  private readonly BASE_EMERGENCIAS = `${environment.apiUrl}/api/v1/emergencias`;
  private readonly BASE_LOGISTICA   = `${environment.apiUrl}/api/v1/logistica`;
  private readonly BASE_ASIGNACION  = `${environment.apiUrl}/api/v1/asignacion`;

  constructor(private http: HttpClient) {}

  // ── Llamadas al backend ──────────────────────
  private getIncidentes(): Observable<IncidenteRead[]> {
    return this.http.get<IncidenteRead[]>(`${this.BASE_EMERGENCIAS}/incidentes`);
  }

  private getAsignaciones(): Observable<AsignacionRead[]> {
    return this.http.get<AsignacionRead[]>(`${this.BASE_LOGISTICA}/asignaciones/historial`);
  }

  private getPrioridades(): Observable<PrioridadRead[]> {
    return this.http.get<PrioridadRead[]>(`${this.BASE_EMERGENCIAS}/catalogos/prioridades`);
  }

  /** Endpoint admin: todos los análisis IA del sistema (nuevo endpoint creado en backend) */
  getAllAnalyses(limit = 100): Observable<AnalisisIARead[]> {
    return this.http
      .get<AnalisisIARead[]>(`${this.BASE_ASIGNACION}/analisis?limit=${limit}`)
      .pipe(catchError(() => of([])));
  }

  // ── Construcción del dashboard ───────────────
  buildDashboardData(): Observable<DashboardIAData> {
    return forkJoin({
      incidentes:  this.getIncidentes(),
      asignaciones: this.getAsignaciones(),
      prioridades:  this.getPrioridades(),
      analises:     this.getAllAnalyses(),
    }).pipe(
      map(({ incidentes, asignaciones, prioridades, analises }) => {

        const total = incidentes.length;

        // 1. DISTRIBUCIÓN DE PRIORIDADES ────────────────────────
        const priorityColors: Record<string, string> = {
          alta:    '#e53e3e',
          media:   '#ed8936',
          baja:    '#38a169',
          critica: '#9b2c2c',
        };
        const priorityCount: Record<string, number> = {};
        let sinPrioridad = 0;
        for (const inc of incidentes) {
          if (inc.prioridad) {
            const key = inc.prioridad.nombre.toLowerCase();
            priorityCount[key] = (priorityCount[key] || 0) + 1;
          } else {
            sinPrioridad++;
          }
        }
        const priorityDistribution: PriorityDistribution[] = prioridades
          .sort((a, b) => b.nivel - a.nivel)
          .map(p => {
            const key   = p.nombre.toLowerCase();
            const count = priorityCount[key] || 0;
            return {
              label:      p.nombre,
              count,
              percentage: total > 0 ? Math.round((count / total) * 100) : 0,
              color:      priorityColors[key] || '#718096',
              nivel:      p.nivel,
            };
          });

        // 2. MAPA DE CALOR ──────────────────────────────────────
        const heatmapPoints: HeatmapPoint[] = incidentes
          .filter(i => i.latitud && i.longitud)
          .map(i => ({
            lat:        Number(i.latitud),
            lng:        Number(i.longitud),
            incidenteId: i.id,
            titulo:     i.titulo,
            prioridad:  i.prioridad?.nombre || 'Sin prioridad',
          }));

        // 3. TIPOLOGÍA (desde tipo_incidente del incidente) ─────
        const typeCount: Record<string, number> = {};
        for (const inc of incidentes) {
          const tipo = inc.tipo_incidente?.nombre || 'Sin clasificar';
          typeCount[tipo] = (typeCount[tipo] || 0) + 1;
        }
        const incidentTypes: IncidentTypeStat[] = Object.entries(typeCount)
          .map(([tipo, count]) => ({
            tipo,
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
          }))
          .sort((a, b) => b.count - a.count);

        // 4. KPIs DE IA (100% desde analisis_ia real) ──────────
        const confianzas = analises
          .filter(a => a.nivel_confianza !== null)
          .map(a => Number(a.nivel_confianza!));
        const avgConf = confianzas.length > 0
          ? confianzas.reduce((s, c) => s + c, 0) / confianzas.length
          : 0;
        const alertasReentrenamiento = confianzas.filter(c => c < 0.7).length;

        // Distribución de tipos de análisis IA
        const analisisPorTipo: Record<string, number> = {};
        for (const a of analises) {
          analisisPorTipo[a.tipo_analisis] = (analisisPorTipo[a.tipo_analisis] || 0) + 1;
        }

        const iaKpis: IAKpis = {
          avgConfidence:          Math.round(avgConf * 1000) / 1000,
          totalAnalyses:          analises.length,
          alertasReentrenamiento,
          tiempoRespuestaMs:      null, // requeriría tracing real
          analisisPorTipo,
        };

        // 5. ESTADÍSTICAS LOGÍSTICAS ────────────────────────────
        const aceptadas  = asignaciones.filter(a => a.estado_asignacion === 'aceptada').length;
        const rechazadas = asignaciones.filter(a => a.estado_asignacion === 'rechazada').length;
        const distancias = asignaciones
          .filter(a => a.distancia_km != null)
          .map(a => Number(a.distancia_km));
        const distProm = distancias.length > 0
          ? distancias.reduce((s, d) => s + d, 0) / distancias.length : 0;

        return {
          priorityDistribution,
          heatmapPoints,
          incidentTypes,
          recentAnalyses: analises.slice(0, 20),   // últimos 20 para caja negra
          logisticaStats: {
            totalAsignaciones: asignaciones.length,
            aceptadas,
            rechazadas,
            tasaAceptacion: asignaciones.length > 0
              ? Math.round((aceptadas / asignaciones.length) * 100) : 0,
            distanciaPromedioKm: Math.round(distProm * 10) / 10,
          },
          iaKpis,
          totalIncidentes: total,
          sinPrioridad,
        } satisfies DashboardIAData;
      })
    );
  }
}
