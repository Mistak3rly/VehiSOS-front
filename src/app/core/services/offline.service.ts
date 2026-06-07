/**
 * CU-020 – Servicio de soporte offline con IndexedDB y Background Sync.
 *
 * Flujo:
 *  1. Usuario crea solicitud sin conexión → se guarda en IndexedDB con uuid.
 *  2. Al recuperar conexión → se sincronizan pendientes contra el backend.
 *  3. El backend verifica idempotencia con request_uuid → no hay duplicados.
 */
import { Injectable, NgZone, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface SolicitudPendiente {
  uuid: string;
  payload: Record<string, unknown>;
  timestamp: number;
  syncStatus: 'pending' | 'synced' | 'error';
  errorMsg?: string;
}

const DB_NAME = 'vehisos-offline';
const STORE_NAME = 'solicitudes_pendientes';
const DB_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class OfflineService {
  isOnline = signal(navigator.onLine);
  pendingCount = signal(0);

  private db: IDBDatabase | null = null;

  constructor(private http: HttpClient, private ngZone: NgZone) {
    this.openDb().then(() => this.refreshCount());
    window.addEventListener('online', () => this.ngZone.run(() => {
      this.isOnline.set(true);
      this.syncPendientes();
    }));
    window.addEventListener('offline', () => this.ngZone.run(() => this.isOnline.set(false)));
  }

  // ── IndexedDB ────────────────────────────────────────────
  private openDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'uuid' });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      req.onsuccess = (e) => { this.db = (e.target as IDBOpenDBRequest).result; resolve(); };
      req.onerror = () => reject(req.error);
    });
  }

  guardarPendiente(payload: Record<string, unknown>): Promise<string> {
    const uuid = crypto.randomUUID();
    const item: SolicitudPendiente = { uuid, payload, timestamp: Date.now(), syncStatus: 'pending' };
    return new Promise((resolve, reject) => {
      if (!this.db) { reject('DB no disponible'); return; }
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const req = tx.objectStore(STORE_NAME).put(item);
      req.onsuccess = () => { this.refreshCount(); resolve(uuid); };
      req.onerror = () => reject(req.error);
    });
  }

  listPendientes(): Promise<SolicitudPendiente[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) { resolve([]); return; }
      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve((req.result as SolicitudPendiente[]).filter(s => s.syncStatus === 'pending'));
      req.onerror = () => reject(req.error);
    });
  }

  private updateSyncStatus(uuid: string, status: 'synced' | 'error', errorMsg?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) { resolve(); return; }
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(uuid);
      getReq.onsuccess = () => {
        const item: SolicitudPendiente = getReq.result;
        if (item) { item.syncStatus = status; item.errorMsg = errorMsg; store.put(item); }
        resolve();
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  private refreshCount(): void {
    this.listPendientes().then(list => this.ngZone.run(() => this.pendingCount.set(list.length)));
  }

  // ── Background Sync ──────────────────────────────────────
  async syncPendientes(): Promise<void> {
    const pendientes = await this.listPendientes();
    for (const item of pendientes) {
      try {
        await this.http.post(
          `${environment.apiUrl}/api/v1/emergencias/incidentes?request_uuid=${item.uuid}`,
          item.payload,
          { headers: { 'Content-Type': 'application/json' } }
        ).toPromise();
        await this.updateSyncStatus(item.uuid, 'synced');
      } catch (err: unknown) {
        const msg = (err as { message?: string })?.message ?? 'Error de sync';
        await this.updateSyncStatus(item.uuid, 'error', msg);
      }
    }
    this.refreshCount();
  }

  // ── API pública ──────────────────────────────────────────
  async crearSolicitudConSync(payload: Record<string, unknown>): Promise<{ offline: boolean; uuid?: string }> {
    if (this.isOnline()) {
      // Intentar directo al backend
      try {
        const uuid = crypto.randomUUID();
        await this.http.post(
          `${environment.apiUrl}/api/v1/emergencias/incidentes?request_uuid=${uuid}`,
          payload
        ).toPromise();
        return { offline: false, uuid };
      } catch {
        // Sin internet durante el intento → guardar offline
      }
    }
    const uuid = await this.guardarPendiente(payload);
    return { offline: true, uuid };
  }
}
