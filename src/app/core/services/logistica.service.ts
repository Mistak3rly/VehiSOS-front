import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TallerRead,
  TallerCreate,
  TallerUpdate,
  PersonalTallerRead,
  PersonalTallerCreate,
  PersonalTallerUpdate,
  SolicitudDisponibleRead,
  AsignacionCreate,
  AsignacionRead,
  AsignacionRespuestaRequest,
  PagoCreate,
  PagoRead,
  RegistrarCobroTecnicoRequest,
  ResumenFinancieroRead,
  NotificacionRead,
  NotificacionTestCreate,
} from '../models/api.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LogisticaService {
  private readonly BASE = `${environment.apiUrl}/api/v1/logistica`;

  /** Emite cada vez que llega una notificación nueva por WebSocket */
  readonly notificacion$ = new Subject<NotificacionRead>();
  private ws: WebSocket | null = null;
  private wsRetryDelay = 1000;
  private wsRetryCount = 0;
  private readonly WS_MAX_RETRIES = 5;
  private readonly WS_MAX_DELAY = 30000;
  private wsRetryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // ── Talleres ──────────────────────────────
  listTalleres(): Observable<TallerRead[]> {
    return this.http.get<TallerRead[]>(`${this.BASE}/talleres`);
  }

  getTaller(id: number): Observable<TallerRead> {
    return this.http.get<TallerRead>(`${this.BASE}/talleres/${id}`);
  }

  createTaller(payload: TallerCreate): Observable<TallerRead> {
    return this.http.post<TallerRead>(`${this.BASE}/talleres`, payload);
  }

  updateTaller(id: number, payload: TallerUpdate): Observable<TallerRead> {
    return this.http.patch<TallerRead>(`${this.BASE}/talleres/${id}`, payload);
  }

  // ── Admin: Talleres ─────────────────────
  listAllTalleres(): Observable<TallerRead[]> {
    return this.http.get<TallerRead[]>(`${this.BASE}/admin/talleres`);
  }

  updateTallerActivo(id: number, activo: boolean): Observable<TallerRead> {
    return this.http.patch<TallerRead>(`${this.BASE}/admin/talleres/${id}/activo?activo=${activo}`, {});
  }

  // ── Personal ──────────────────────────────
  listPersonal(tallerId: number): Observable<PersonalTallerRead[]> {
    return this.http.get<PersonalTallerRead[]>(
      `${this.BASE}/talleres/${tallerId}/personal`
    );
  }

  addPersonal(tallerId: number, payload: PersonalTallerCreate): Observable<PersonalTallerRead> {
    return this.http.post<PersonalTallerRead>(
      `${this.BASE}/talleres/${tallerId}/personal`,
      payload
    );
  }

  updatePersonal(
    tallerId: number,
    personalId: number,
    payload: PersonalTallerUpdate
  ): Observable<PersonalTallerRead> {
    return this.http.patch<PersonalTallerRead>(
      `${this.BASE}/talleres/${tallerId}/personal/${personalId}`,
      payload
    );
  }

  // ── Solicitudes disponibles ───────────────
  listSolicitudesDisponibles(): Observable<SolicitudDisponibleRead[]> {
    return this.http.get<SolicitudDisponibleRead[]>(`${this.BASE}/solicitudes/disponibles`);
  }

  // ── Asignaciones ──────────────────────────
  createAsignacion(payload: AsignacionCreate): Observable<AsignacionRead> {
    return this.http.post<AsignacionRead>(`${this.BASE}/asignaciones`, payload);
  }

  responderAsignacion(
    asignacionId: number,
    payload: AsignacionRespuestaRequest
  ): Observable<AsignacionRead> {
    return this.http.patch<AsignacionRead>(
      `${this.BASE}/asignaciones/${asignacionId}/respuesta`,
      payload
    );
  }

  historialAsignaciones(tallerId?: number): Observable<AsignacionRead[]> {
    let params = new HttpParams();
    if (tallerId !== undefined) params = params.set('taller_id', tallerId);
    return this.http.get<AsignacionRead[]>(`${this.BASE}/asignaciones/historial`, { params });
  }

  // ── Pagos ─────────────────────────────────
  registrarPago(payload: PagoCreate): Observable<PagoRead> {
    return this.http.post<PagoRead>(`${this.BASE}/pagos`, payload);
  }

  registrarCobroTecnico(payload: RegistrarCobroTecnicoRequest): Observable<PagoRead> {
    return this.http.post<PagoRead>(`${this.BASE}/pagos/tecnico/cobro`, payload);
  }

  pagosPorCliente(): Observable<PagoRead[]> {
    return this.http.get<PagoRead[]>(`${this.BASE}/pagos/cliente`);
  }

  historialPagos(tallerId?: number): Observable<PagoRead[]> {
    let params = new HttpParams();
    if (tallerId !== undefined) params = params.set('taller_id', tallerId);
    return this.http.get<PagoRead[]>(`${this.BASE}/pagos/historial`, { params });
  }

  resumenFinanciero(tallerId?: number): Observable<ResumenFinancieroRead> {
    let params = new HttpParams();
    if (tallerId !== undefined) params = params.set('taller_id', tallerId);
    return this.http.get<ResumenFinancieroRead>(`${this.BASE}/pagos/resumen`, { params });
  }

  // ── Admin: Pagos ─────────────────────────
  listAllPagos(): Observable<PagoRead[]> {
    return this.http.get<PagoRead[]>(`${this.BASE}/admin/pagos`);
  }

  // ── Notificaciones ────────────────────────
  listNotificaciones(unreadOnly = false): Observable<NotificacionRead[]> {
    const params = new HttpParams().set('unread_only', unreadOnly);
    return this.http.get<NotificacionRead[]>(`${this.BASE}/notificaciones`, { params });
  }

  marcarLeida(notificationId: number): Observable<NotificacionRead> {
    return this.http.patch<NotificacionRead>(
      `${this.BASE}/notificaciones/${notificationId}/leer`,
      {}
    );
  }

  // [CU-013] Gestionar notificaciones y comunicación
  // Este método permite al sistema identificar eventos y notificar a los actores
  enviarNotificacionPush(idUsuario: number, mensaje: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/v1/logistica/notificaciones/test/manual`, {
      target_user_id: idUsuario,
      ...mensaje
    });
  }

  // ── WebSocket notificaciones ──────────────
  // [CU-013] Flujo Principal: El usuario recibe la notificación en tiempo real
  conectarNotificacionesWs() {
    const token = this.auth.getToken();
    if (!token || this.ws) return;

    const wsUrl = `${environment.apiUrl.replace(/^http/, 'ws')}/api/v1/logistica/ws/notificaciones?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.wsRetryDelay = 1000;
      this.wsRetryCount = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notificacion$.next(data);
      } catch (e) {
        console.error('Error al parsear notificación WS', e);
      }
    };

    this.ws.onerror = () => {
      // El evento close se dispara después del error — el reintento se maneja allí
    };

    this.ws.onclose = () => {
      this.ws = null;
      if (this.wsRetryCount >= this.WS_MAX_RETRIES) return;
      this.wsRetryCount++;
      this.wsRetryTimer = setTimeout(() => {
        this.wsRetryDelay = Math.min(this.wsRetryDelay * 2, this.WS_MAX_DELAY);
        this.conectarNotificacionesWs();
      }, this.wsRetryDelay);
    };
  }

  /** Cierra la conexión WebSocket y cancela reintentos pendientes */
  disconnectNotificacionesWs(): void {
    if (this.wsRetryTimer !== null) {
      clearTimeout(this.wsRetryTimer);
      this.wsRetryTimer = null;
    }
    this.wsRetryCount = this.WS_MAX_RETRIES; // evita que onclose reintente
    this.ws?.close();
    this.ws = null;
  }
}
