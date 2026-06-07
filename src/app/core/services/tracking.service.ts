/**
 * CU-021 – Servicio de tracking GPS en tiempo real via WebSocket.
 *
 * Cliente: se conecta al room del incidente y recibe actualizaciones de posición.
 * Técnico: envía sus coordenadas periódicamente.
 */
import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TrackingPoint {
  tecnico_id: number;
  lat: number;
  lng: number;
  vel?: number;
  ts?: string;
}

@Injectable({ providedIn: 'root' })
export class TrackingService {
  readonly location$ = new Subject<TrackingPoint>();
  isConnected = signal(false);

  private ws: WebSocket | null = null;
  private incidenteId: number | null = null;
  private watchId: number | null = null;

  // ── Conexión ─────────────────────────────────────────────
  connect(incidenteId: number, token: string): void {
    if (this.ws) this.disconnect();
    this.incidenteId = incidenteId;
    const wsBase = environment.wsUrl || environment.apiUrl.replace('http', 'ws');
    const url = `${wsBase}/api/v1/operaciones/ws/tracking/${incidenteId}?token=${token}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => this.isConnected.set(true);
    this.ws.onclose = () => this.isConnected.set(false);
    this.ws.onerror = () => this.isConnected.set(false);
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'location_update') {
          this.location$.next({
            tecnico_id: data.tecnico_id,
            lat: data.lat,
            lng: data.lng,
            vel: data.vel,
            ts: data.ts,
          });
        }
      } catch { /* ignore malformed */ }
    };
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.isConnected.set(false);
    this.stopSendingLocation();
  }

  // ── Envío de ubicación (técnico) ─────────────────────────
  startSendingLocation(intervalMs = 5000): void {
    if (!navigator.geolocation) return;
    this.watchId = window.setInterval(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        this.sendLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.speed ?? undefined);
      });
    }, intervalMs);
  }

  stopSendingLocation(): void {
    if (this.watchId !== null) {
      clearInterval(this.watchId);
      this.watchId = null;
    }
  }

  sendLocation(lat: number, lng: number, vel?: number | null): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ lat, lng, vel, ts: new Date().toISOString() }));
    }
  }
}
