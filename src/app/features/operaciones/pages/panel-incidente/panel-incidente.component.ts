/**
 * Panel operacional integrado CU-021 / CU-022 / CU-023 / CU-024
 *
 * Uso:
 *   <app-panel-incidente [incidenteId]="id" [rol]="'cliente'" />
 *
 * Tabs:
 *  🗺  Tracking (CU-021) — mapa + posición en tiempo real
 *  📋  Trazabilidad (CU-022) — línea de tiempo de estados
 *  💬  Mensajes (CU-023) — chat entre cliente/taller/técnico
 *  ⚠️  Cancelar/Excepción (CU-024) — registrar cancelación o excepción
 */
import {
  Component, Input, OnInit, OnDestroy, OnChanges,
  SimpleChanges, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  OperacionesService,
  TrackingPoint,
  MensajeRead,
  CancelacionRead,
  CancelacionCreate,
} from '../../../../core/services/operaciones.service';
import { TrackingService } from '../../../../core/services/tracking.service';
import { AuthService } from '../../../../core/services/auth.service';

type Tab = 'tracking' | 'trazabilidad' | 'mensajes' | 'cancelar';

const ESTADO_ICONS: Record<string, string> = {
  pendiente: 'hourglass_empty', asignado: 'assignment_ind',
  en_camino: 'directions_car', llego_lugar: 'place',
  atencion_iniciada: 'build', atencion_finalizada: 'check_circle',
  cancelado: 'cancel', excepcion_registrada: 'warning',
  completado: 'done_all',
};

@Component({
  selector: 'app-panel-incidente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="pi-panel">

  <!-- Tabs -->
  <div class="pi-tabs">
    <button class="pi-tab" [class.active]="activeTab() === 'tracking'"      (click)="setTab('tracking')">
      <span class="material-icons-round">location_on</span> Tracking
    </button>
    <button class="pi-tab" [class.active]="activeTab() === 'trazabilidad'"  (click)="setTab('trazabilidad')">
      <span class="material-icons-round">timeline</span> Trazabilidad
    </button>
    <button class="pi-tab" [class.active]="activeTab() === 'mensajes'"       (click)="setTab('mensajes')">
      <span class="material-icons-round">chat</span> Mensajes
      @if (unreadCount() > 0) { <span class="pi-badge">{{ unreadCount() }}</span> }
    </button>
    @if (canCancel()) {
      <button class="pi-tab pi-tab-danger" [class.active]="activeTab() === 'cancelar'" (click)="setTab('cancelar')">
        <span class="material-icons-round">block</span> Cancelar
      </button>
    }
  </div>

  <!-- ══ TAB: TRACKING (CU-021) ══════════════════════════════ -->
  @if (activeTab() === 'tracking') {
    <div class="pi-body">
      <div class="pi-ws-status">
        <span class="pi-dot" [class.connected]="wsConnected()"></span>
        {{ wsConnected() ? 'Conectado — actualizando en tiempo real' : 'Desconectado — mostrando último dato' }}
      </div>

      @if (lastLocation()) {
        <div class="pi-location-card">
          <div class="pi-location-row">
            <span class="material-icons-round">my_location</span>
            <div>
              <strong>Última ubicación del técnico</strong>
              <p>Lat: {{ lastLocation()!.lat | number:'1.4-6' }}  ·  Lng: {{ lastLocation()!.lng | number:'1.4-6' }}</p>
              @if (lastLocation()!.vel) {
                <small>Velocidad: {{ lastLocation()!.vel! | number:'1.0-1' }} km/h</small>
              }
            </div>
          </div>
          <a class="pi-maps-link"
             [href]="'https://www.google.com/maps?q=' + lastLocation()!.lat + ',' + lastLocation()!.lng"
             target="_blank" rel="noopener">
            <span class="material-icons-round">open_in_new</span> Ver en Google Maps
          </a>
        </div>
      } @else {
        <div class="pi-empty">
          <span class="material-icons-round">location_searching</span>
          <p>El técnico aún no ha compartido su ubicación.</p>
        </div>
      }

      <div class="pi-track-list">
        <p class="pi-section-title">Historial de recorrido ({{ trackingHistory().length }} puntos)</p>
        @for (pt of trackingHistory().slice(-10).reverse(); track pt.id) {
          <div class="pi-track-item">
            <span class="material-icons-round">radio_button_checked</span>
            <div>
              <span>{{ pt.latitud | number:'1.4-6' }}, {{ pt.longitud | number:'1.4-6' }}</span>
              <small>{{ pt.timestamp | date:'HH:mm:ss' }}</small>
            </div>
          </div>
        }
      </div>
    </div>
  }

  <!-- ══ TAB: TRAZABILIDAD (CU-022) ══════════════════════════ -->
  @if (activeTab() === 'trazabilidad') {
    <div class="pi-body">
      @if (loadingTrazabilidad()) {
        <div class="pi-loading"><div class="pi-spinner"></div><span>Cargando...</span></div>
      } @else if (trazabilidad().length === 0) {
        <div class="pi-empty">
          <span class="material-icons-round">timeline</span>
          <p>Sin eventos registrados aún.</p>
        </div>
      } @else {
        <div class="pi-timeline">
          @for (ev of trazabilidad(); track ev.id) {
            <div class="pi-tl-item">
              <div class="pi-tl-icon">
                <span class="material-icons-round">{{ estadoIcon(ev.tipo_evento) }}</span>
              </div>
              <div class="pi-tl-body">
                <strong>{{ ev.tipo_evento | titlecase }}</strong>
                @if (ev.descripcion) { <p>{{ ev.descripcion }}</p> }
                <small>{{ ev.fecha_creacion | date:'dd/MM/yyyy HH:mm' }}</small>
              </div>
            </div>
          }
        </div>
      }
    </div>
  }

  <!-- ══ TAB: MENSAJES (CU-023) ══════════════════════════════ -->
  @if (activeTab() === 'mensajes') {
    <div class="pi-body pi-mensajes">
      <div class="pi-chat">
        @if (mensajes().length === 0) {
          <div class="pi-empty">
            <span class="material-icons-round">chat_bubble_outline</span>
            <p>Sé el primero en enviar un mensaje.</p>
          </div>
        }
        @for (m of mensajes(); track m.id) {
          <div class="pi-msg" [class.mine]="m.id_autor === currentUserId()">
            <div class="pi-msg-bubble" [class.mine]="m.id_autor === currentUserId()">
              <span class="pi-msg-rol">{{ m.rol_autor | uppercase }}</span>
              <p>{{ m.contenido }}</p>
              <small>{{ m.fecha_creacion | date:'HH:mm' }} {{ m.leido ? '✓✓' : '✓' }}</small>
            </div>
          </div>
        }
      </div>
      <div class="pi-chat-input">
        <input type="text" [(ngModel)]="newMessage" placeholder="Escribe un mensaje..."
               (keydown.enter)="sendMensaje()" [disabled]="sendingMsg()" />
        <button class="pi-send-btn" (click)="sendMensaje()" [disabled]="!newMessage.trim() || sendingMsg()">
          <span class="material-icons-round">send</span>
        </button>
      </div>
    </div>
  }

  <!-- ══ TAB: CANCELAR / EXCEPCIÓN (CU-024) ══════════════════ -->
  @if (activeTab() === 'cancelar') {
    <div class="pi-body">
      @if (cancelaciones().length > 0) {
        <div class="pi-cancel-history">
          <p class="pi-section-title">Historial de cancelaciones/excepciones</p>
          @for (c of cancelaciones(); track c.id) {
            <div class="pi-cancel-item" [class.excepcion]="c.tipo === 'excepcion'">
              <span class="material-icons-round">{{ c.tipo === 'cancelacion' ? 'cancel' : 'warning' }}</span>
              <div>
                <strong>{{ c.tipo | titlecase }} — {{ motivoLabel(c.motivo) }}</strong>
                @if (c.observacion) { <p>{{ c.observacion }}</p> }
                <small>{{ c.fecha_hora | date:'dd/MM/yyyy HH:mm' }}</small>
              </div>
            </div>
          }
        </div>
      }

      <div class="pi-cancel-form">
        <p class="pi-section-title">Registrar cancelación o excepción</p>

        <label class="pi-field">
          <span>Tipo</span>
          <select [(ngModel)]="cancelForm.tipo">
            <option value="cancelacion">Cancelación</option>
            <option value="excepcion">Excepción operativa</option>
          </select>
        </label>

        <label class="pi-field">
          <span>Motivo</span>
          <select [(ngModel)]="cancelForm.motivo">
            <option value="">Seleccionar motivo...</option>
            @if (cancelForm.tipo === 'cancelacion') {
              @for (m of motivosCancelacion; track m.value) {
                <option [value]="m.value">{{ m.label }}</option>
              }
            } @else {
              @for (m of motivosExcepcion; track m.value) {
                <option [value]="m.value">{{ m.label }}</option>
              }
            }
          </select>
        </label>

        <label class="pi-field">
          <span>Observación (opcional)</span>
          <textarea [(ngModel)]="cancelForm.observacion" placeholder="Detalle adicional..."></textarea>
        </label>

        <div class="pi-cancel-actions">
          @if (cancelError()) { <span class="pi-error">{{ cancelError() }}</span> }
          @if (cancelOk()) { <span class="pi-ok">{{ cancelOk() }}</span> }
          <button class="pi-btn-danger"
            [disabled]="savingCancel() || !cancelForm.motivo"
            (click)="submitCancelacion()">
            <span class="material-icons-round">{{ cancelForm.tipo === 'cancelacion' ? 'cancel' : 'warning' }}</span>
            {{ savingCancel() ? 'Registrando...' : (cancelForm.tipo === 'cancelacion' ? 'Cancelar servicio' : 'Registrar excepción') }}
          </button>
        </div>
      </div>
    </div>
  }

</div>
  `,
  styles: [`
    .pi-panel { border-radius: 18px; border: 1px solid var(--border-light); overflow: hidden; background: var(--surface); }
    .pi-tabs { display: flex; border-bottom: 1px solid var(--border-light); background: color-mix(in srgb, var(--primary-red) 4%, white); }
    .pi-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.75rem 0.5rem; background: none; border: none; border-bottom: 3px solid transparent; cursor: pointer; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); transition: all 0.15s; position: relative; }
    .pi-tab:hover { color: var(--primary-red); }
    .pi-tab.active { color: var(--primary-red); border-bottom-color: var(--primary-red); }
    .pi-tab-danger.active { color: #c0392b; border-bottom-color: #c0392b; }
    .pi-tab .material-icons-round { font-size: 1rem; }
    .pi-badge { position: absolute; top: 6px; right: 6px; background: var(--primary-red); color: #fff; border-radius: 999px; font-size: 0.65rem; font-weight: 800; min-width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
    .pi-body { padding: 1rem; min-height: 200px; }
    .pi-loading, .pi-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; padding: 2rem; color: var(--text-muted); text-align: center; }
    .pi-empty .material-icons-round, .pi-loading .material-icons-round { font-size: 2rem; opacity: 0.3; }
    .pi-spinner { width: 24px; height: 24px; border: 3px solid var(--border-light); border-top-color: var(--primary-red); border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Tracking */
    .pi-ws-status { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; margin-bottom: 0.85rem; color: var(--text-muted); }
    .pi-dot { width: 8px; height: 8px; border-radius: 50%; background: #ccc; }
    .pi-dot.connected { background: #2f855a; box-shadow: 0 0 0 3px rgba(47,133,90,0.2); }
    .pi-location-card { border: 1px solid var(--border-light); border-radius: 12px; padding: 0.85rem 1rem; margin-bottom: 0.85rem; }
    .pi-location-row { display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.65rem; }
    .pi-location-row .material-icons-round { color: var(--primary-red); font-size: 1.3rem; }
    .pi-location-row strong { font-size: 0.9rem; color: var(--text-dark); }
    .pi-location-row p, .pi-location-row small { margin: 0.15rem 0 0; font-size: 0.78rem; color: var(--text-muted); }
    .pi-maps-link { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.78rem; font-weight: 700; color: var(--primary-red); text-decoration: none; }
    .pi-maps-link:hover { text-decoration: underline; }
    .pi-section-title { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin: 0 0 0.65rem; }
    .pi-track-list { display: flex; flex-direction: column; gap: 0.4rem; max-height: 200px; overflow-y: auto; }
    .pi-track-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: var(--text-muted); }
    .pi-track-item .material-icons-round { font-size: 0.9rem; color: var(--primary-red); }

    /* Timeline */
    .pi-timeline { display: flex; flex-direction: column; gap: 0; }
    .pi-tl-item { display: flex; gap: 0.75rem; padding: 0.6rem 0; border-left: 2px solid var(--border-light); margin-left: 12px; padding-left: 1rem; position: relative; }
    .pi-tl-item:first-child { border-left-color: var(--primary-red); }
    .pi-tl-icon { position: absolute; left: -13px; width: 24px; height: 24px; border-radius: 50%; background: var(--primary-red); color: #fff; display: flex; align-items: center; justify-content: center; }
    .pi-tl-icon .material-icons-round { font-size: 0.9rem; }
    .pi-tl-body strong { font-size: 0.88rem; color: var(--text-dark); }
    .pi-tl-body p { margin: 0.2rem 0 0; font-size: 0.78rem; color: var(--text-muted); }
    .pi-tl-body small { font-size: 0.72rem; color: var(--text-muted); }

    /* Mensajes */
    .pi-mensajes { padding: 0; display: flex; flex-direction: column; }
    .pi-chat { flex: 1; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem; min-height: 220px; max-height: 320px; overflow-y: auto; }
    .pi-msg { display: flex; }
    .pi-msg.mine { justify-content: flex-end; }
    .pi-msg-bubble { max-width: 75%; padding: 0.6rem 0.85rem; border-radius: 16px; background: color-mix(in srgb, var(--primary-red) 8%, white); border: 1px solid var(--border-light); }
    .pi-msg-bubble.mine { background: var(--primary-red); color: #fff; border-color: var(--primary-red); }
    .pi-msg-bubble.mine small { color: rgba(255,255,255,0.7); }
    .pi-msg-rol { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.7; }
    .pi-msg-bubble p { margin: 0.15rem 0; font-size: 0.85rem; }
    .pi-msg-bubble small { font-size: 0.68rem; }
    .pi-chat-input { display: flex; gap: 0.5rem; padding: 0.75rem; border-top: 1px solid var(--border-light); }
    .pi-chat-input input { flex: 1; border: 1px solid var(--border-light); border-radius: 999px; padding: 0.6rem 1rem; font: inherit; font-size: 0.88rem; }
    .pi-chat-input input:focus { outline: none; border-color: var(--primary-red); }
    .pi-send-btn { background: var(--primary-red); color: #fff; border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
    .pi-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Cancelar */
    .pi-cancel-history { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .pi-cancel-item { display: flex; gap: 0.65rem; padding: 0.7rem 0.9rem; border-radius: 12px; border: 1px solid var(--border-light); background: color-mix(in srgb, #c0392b 6%, white); }
    .pi-cancel-item.excepcion { background: color-mix(in srgb, #f39c12 8%, white); }
    .pi-cancel-item .material-icons-round { color: #c0392b; font-size: 1.1rem; }
    .pi-cancel-item.excepcion .material-icons-round { color: #e67e22; }
    .pi-cancel-item strong { font-size: 0.85rem; color: var(--text-dark); }
    .pi-cancel-item p { margin: 0.15rem 0 0; font-size: 0.78rem; color: var(--text-muted); }
    .pi-cancel-item small { font-size: 0.72rem; color: var(--text-muted); }
    .pi-cancel-form { border-top: 1px solid var(--border-light); padding-top: 1rem; }
    .pi-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.75rem; }
    .pi-field span { font-size: 0.82rem; font-weight: 700; color: var(--text-dark); }
    .pi-field select, .pi-field textarea { border: 1px solid var(--border-light); border-radius: 10px; padding: 0.6rem 0.8rem; font: inherit; font-size: 0.88rem; }
    .pi-field textarea { min-height: 70px; resize: vertical; }
    .pi-cancel-actions { display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; flex-wrap: wrap; }
    .pi-error { font-size: 0.82rem; font-weight: 600; color: #c0392b; }
    .pi-ok { font-size: 0.82rem; font-weight: 600; color: #2f855a; }
    .pi-btn-danger { display: flex; align-items: center; gap: 0.4rem; background: #c0392b; color: #fff; border: none; border-radius: 10px; padding: 0.7rem 1.1rem; font-weight: 800; font-size: 0.85rem; cursor: pointer; }
    .pi-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class PanelIncidenteComponent implements OnInit, OnDestroy, OnChanges {
  @Input({ required: true }) incidenteId!: number;
  @Input() rol: string = 'cliente';
  @Input() trazabilidadData: Array<{ id: number; tipo_evento: string; descripcion?: string; fecha_creacion: string }> = [];

  activeTab = signal<Tab>('tracking');
  wsConnected = computed(() => this.trackingService.isConnected());

  // CU-021
  trackingHistory = signal<TrackingPoint[]>([]);
  lastLocation = signal<{ lat: number; lng: number; vel?: number } | null>(null);

  // CU-022
  trazabilidad = signal<typeof this.trazabilidadData>([]);
  loadingTrazabilidad = signal(false);

  // CU-023
  mensajes = signal<MensajeRead[]>([]);
  newMessage = '';
  sendingMsg = signal(false);
  unreadCount = computed(() => this.mensajes().filter(m => !m.leido && m.id_autor !== this.currentUserId()).length);

  // CU-024
  cancelaciones = signal<CancelacionRead[]>([]);
  cancelForm: CancelacionCreate = { tipo: 'cancelacion', motivo: '', observacion: '' };
  savingCancel = signal(false);
  cancelError = signal('');
  cancelOk = signal('');

  currentUserId = computed(() => this.auth.currentUser()?.id ?? 0);
  canCancel = computed(() => ['cliente', 'taller', 'administrador'].includes(this.rol));

  get motivosCancelacion() { return this.ops.motivosCancelacion; }
  get motivosExcepcion() { return this.ops.motivosExcepcion; }

  private subs: Subscription[] = [];

  constructor(
    private ops: OperacionesService,
    private trackingService: TrackingService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadAll();
    const token = localStorage.getItem('token') || '';
    this.trackingService.connect(this.incidenteId, token);
    const sub = this.trackingService.location$.subscribe(pt => {
      this.lastLocation.set(pt);
    });
    this.subs.push(sub);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trazabilidadData']) {
      this.trazabilidad.set(this.trazabilidadData);
    }
    if (changes['incidenteId'] && !changes['incidenteId'].firstChange) {
      this.loadAll();
      const token = localStorage.getItem('token') || '';
      this.trackingService.connect(this.incidenteId, token);
    }
  }

  ngOnDestroy(): void {
    this.trackingService.disconnect();
    this.subs.forEach(s => s.unsubscribe());
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    if (tab === 'mensajes') { this.ops.markLeidos(this.incidenteId).subscribe(); }
  }

  private loadAll(): void {
    this.trazabilidad.set(this.trazabilidadData);
    this.ops.getTracking(this.incidenteId).subscribe({
      next: (list) => {
        this.trackingHistory.set(list);
        if (list.length > 0) {
          const last = list[list.length - 1];
          this.lastLocation.set({ lat: last.latitud, lng: last.longitud, vel: last.velocidad_kmh ?? undefined });
        }
      },
    });
    this.ops.getMensajes(this.incidenteId).subscribe({ next: (m) => this.mensajes.set(m) });
    this.ops.getCancelaciones(this.incidenteId).subscribe({ next: (c) => this.cancelaciones.set(c) });
  }

  estadoIcon(evento: string): string {
    return ESTADO_ICONS[evento.toLowerCase().replace(' ', '_')] ?? 'circle';
  }

  motivoLabel(motivo: string): string {
    const all = [...this.ops.motivosCancelacion, ...this.ops.motivosExcepcion];
    return all.find(m => m.value === motivo)?.label ?? motivo;
  }

  sendMensaje(): void {
    if (!this.newMessage.trim() || this.sendingMsg()) return;
    this.sendingMsg.set(true);
    this.ops.sendMensaje(this.incidenteId, this.newMessage.trim()).subscribe({
      next: (m) => {
        this.mensajes.update(list => [...list, m]);
        this.newMessage = '';
        this.sendingMsg.set(false);
      },
      error: () => this.sendingMsg.set(false),
    });
  }

  submitCancelacion(): void {
    if (this.savingCancel() || !this.cancelForm.motivo) return;
    this.savingCancel.set(true);
    this.cancelError.set('');
    this.cancelOk.set('');
    this.ops.registrarCancelacion(this.incidenteId, this.cancelForm).subscribe({
      next: (c) => {
        this.cancelaciones.update(list => [...list, c]);
        this.cancelOk.set(`${c.tipo === 'cancelacion' ? 'Cancelación' : 'Excepción'} registrada.`);
        this.cancelForm = { tipo: 'cancelacion', motivo: '', observacion: '' };
        this.savingCancel.set(false);
      },
      error: (err) => {
        this.cancelError.set(err?.error?.detail ?? 'Error al registrar.');
        this.savingCancel.set(false);
      },
    });
  }
}
