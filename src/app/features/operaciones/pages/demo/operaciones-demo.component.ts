import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PanelIncidenteComponent } from '../panel-incidente/panel-incidente.component';
import { OfflineService } from '../../../../core/services/offline.service';
import { AuthService } from '../../../../core/services/auth.service';

const CUS = [
  {
    id: 'CU-020',
    titulo: 'Registro y Sincronización Offline',
    icono: 'wifi_off',
    color: '#f39c12',
    descripcion: 'Detecta pérdida de conexión, guarda solicitudes en IndexedDB y sincroniza automáticamente al reconectarse.',
    features: ['Service Worker (PWA)', 'IndexedDB persistencia local', 'Background Sync automático', 'Idempotencia con request_uuid'],
  },
  {
    id: 'CU-021',
    titulo: 'Seguimiento en Tiempo Real',
    icono: 'location_on',
    color: '#2980b9',
    descripcion: 'El técnico transmite su posición GPS via WebSocket. El cliente ve el recorrido en tiempo real.',
    features: ['WebSocket por room de incidente', 'TrackingUbicacion en BD', 'Broadcast a todos los participantes', 'Historial de recorrido GPS'],
  },
  {
    id: 'CU-022',
    titulo: 'Trazabilidad de Atención',
    icono: 'timeline',
    color: '#8e44ad',
    descripcion: 'Historial completo de estados: asignado → en camino → llegó → atención iniciada → finalizada.',
    features: ['7 estados extendidos', 'Timeline visual con íconos', 'Auditoría por usuario/fecha', 'Estados finales marcados'],
  },
  {
    id: 'CU-023',
    titulo: 'Notificaciones y Mensajería',
    icono: 'chat',
    color: '#27ae60',
    descripcion: 'Chat interno entre cliente, taller y técnico asociado a cada incidente. Mensajes con estado de lectura.',
    features: ['Mensajería por incidente', 'Roles: cliente/taller/técnico', 'Estado leído/no leído', 'WebSocket notificaciones'],
  },
  {
    id: 'CU-024',
    titulo: 'Cancelaciones y Excepciones',
    icono: 'block',
    color: '#c0392b',
    descripcion: 'Registra cancelaciones del cliente o excepciones operativas del taller, con historial completo.',
    features: ['Tipos: cancelación / excepción', '8 motivos predefinidos', 'Actualiza estado del incidente', 'Historial de cancelaciones'],
  },
];

@Component({
  selector: 'app-operaciones-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PanelIncidenteComponent],
  template: `
<div class="demo-page">

  <header class="demo-header">
    <div>
      <p class="demo-eyebrow">VehiSOS · Demostración técnica</p>
      <h1>CU-020 al CU-024</h1>
      <p class="demo-sub">Módulos de operación en tiempo real sobre arquitectura SaaS Multi-Tenant</p>
    </div>
    <div class="demo-header-actions">
      <button class="demo-btn-outline" routerLink="/taller/servicios-cobertura">
        <span class="material-icons-round">room_service</span>
        Ver CU-019
      </button>
      <button class="demo-btn-outline" routerLink="/cliente/solicitudes/seguimiento">
        <span class="material-icons-round">manage_search</span>
        Ver en solicitudes
      </button>
    </div>
  </header>

  <!-- Tarjetas de los CUs -->
  <div class="cu-grid">
    @for (cu of cus; track cu.id) {
      <div class="cu-card" [style.--cu-color]="cu.color">
        <div class="cu-card-top">
          <div class="cu-icon-wrap">
            <span class="material-icons-round">{{ cu.icono }}</span>
          </div>
          <div>
            <span class="cu-id-badge">{{ cu.id }}</span>
            <h3>{{ cu.titulo }}</h3>
          </div>
        </div>
        <p class="cu-desc">{{ cu.descripcion }}</p>
        <ul class="cu-features">
          @for (f of cu.features; track f) {
            <li>
              <span class="material-icons-round">check_circle</span>
              {{ f }}
            </li>
          }
        </ul>
      </div>
    }
  </div>

  <!-- CU-020: Estado offline en vivo -->
  <section class="demo-section">
    <div class="demo-section-title">
      <span class="cu-tag cu-020">CU-020</span>
      <h2>Estado de conexión y sincronización</h2>
    </div>
    <div class="offline-status-panel">
      <div class="ost-item" [class.ok]="offlineService.isOnline()">
        <span class="material-icons-round">{{ offlineService.isOnline() ? 'wifi' : 'wifi_off' }}</span>
        <div>
          <strong>{{ offlineService.isOnline() ? 'Conectado' : 'Sin conexión' }}</strong>
          <small>{{ offlineService.isOnline() ? 'Las solicitudes se envían directamente al servidor' : 'Las solicitudes se guardan localmente' }}</small>
        </div>
      </div>
      <div class="ost-item" [class.warn]="offlineService.pendingCount() > 0">
        <span class="material-icons-round">sync</span>
        <div>
          <strong>{{ offlineService.pendingCount() }} solicitudes pendientes</strong>
          <small>{{ offlineService.pendingCount() === 0 ? 'Todo sincronizado' : 'Se sincronizarán al reconectarse' }}</small>
        </div>
      </div>
      <div class="ost-item">
        <span class="material-icons-round">storage</span>
        <div>
          <strong>IndexedDB activo</strong>
          <small>Base de datos local en el navegador</small>
        </div>
      </div>
      <div class="ost-item ok">
        <span class="material-icons-round">security</span>
        <div>
          <strong>Idempotencia activa</strong>
          <small>request_uuid previene duplicados</small>
        </div>
      </div>
    </div>
  </section>

  <!-- Panel CU-021/022/023/024 interactivo -->
  <section class="demo-section">
    <div class="demo-section-title">
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <span class="cu-tag cu-021">CU-021</span>
        <span class="cu-tag cu-022">CU-022</span>
        <span class="cu-tag cu-023">CU-023</span>
        <span class="cu-tag cu-024">CU-024</span>
      </div>
      <h2>Panel operacional interactivo</h2>
      <p class="demo-section-sub">Introduce el ID de un incidente real para ver tracking, trazabilidad, mensajería y cancelaciones en vivo.</p>
    </div>

    <div class="demo-id-picker">
      <label>
        <span class="material-icons-round">tag</span>
        ID del incidente
      </label>
      <input type="number" [(ngModel)]="inputId" placeholder="Ej: 1" min="1" (keydown.enter)="applyId()" />
      <button class="demo-btn-primary" (click)="applyId()" [disabled]="!inputId || inputId < 1">
        <span class="material-icons-round">play_arrow</span>
        Cargar panel
      </button>
    </div>

    @if (activeId()) {
      <div class="demo-panel-wrap">
        <div class="demo-panel-info">
          <span class="material-icons-round">info</span>
          Mostrando panel para incidente <strong>#{{ activeId() }}</strong> — rol: <strong>{{ currentRol() }}</strong>
        </div>
        <app-panel-incidente
          [incidenteId]="activeId()!"
          [rol]="currentRol()"
          [trazabilidadData]="[]">
        </app-panel-incidente>
      </div>
    } @else {
      <div class="demo-empty-panel">
        <span class="material-icons-round">hub</span>
        <p>Ingresa un ID de incidente para activar el panel operacional.</p>
        <small>Los datos se obtienen del backend en tiempo real.</small>
      </div>
    }
  </section>

  <!-- Arquitectura -->
  <section class="demo-section">
    <div class="demo-section-title">
      <h2>Arquitectura del flujo completo</h2>
    </div>
    <div class="arch-flow">
      @for (step of flowSteps; track step.label; let last = $last) {
        <div class="arch-step">
          <div class="arch-icon"><span class="material-icons-round">{{ step.icon }}</span></div>
          <span>{{ step.label }}</span>
          <small>{{ step.cu }}</small>
        </div>
        @if (!last) { <span class="arch-arrow material-icons-round">arrow_forward</span> }
      }
    </div>
  </section>

</div>
  `,
  styles: [`
    .demo-page { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .demo-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; margin-bottom: 2.5rem; flex-wrap: wrap; }
    .demo-eyebrow { margin: 0 0 0.4rem; text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.72rem; color: var(--primary-red); font-weight: 800; }
    h1 { margin: 0; font-size: 2.2rem; color: var(--text-dark); }
    .demo-sub { margin: 0.4rem 0 0; color: var(--text-muted); font-size: 0.9rem; }
    .demo-header-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: flex-start; padding-top: 0.5rem; }
    .demo-btn-outline { display: flex; align-items: center; gap: 0.4rem; padding: 0.65rem 1rem; border: 1.5px solid var(--border-light); background: none; border-radius: 12px; cursor: pointer; font-size: 0.85rem; font-weight: 700; color: var(--text-dark); text-decoration: none; transition: all 0.15s; }
    .demo-btn-outline:hover { border-color: var(--primary-red); color: var(--primary-red); }
    .demo-btn-outline .material-icons-round { font-size: 1rem; }

    /* CU Cards */
    .cu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem; }
    .cu-card { background: var(--surface); border-radius: 20px; border: 1px solid var(--border-light); padding: 1.25rem; box-shadow: 0 4px 16px rgba(0,0,0,0.04); transition: transform 0.15s, box-shadow 0.15s; }
    .cu-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .cu-card-top { display: flex; align-items: flex-start; gap: 0.85rem; margin-bottom: 0.75rem; }
    .cu-icon-wrap { width: 42px; height: 42px; border-radius: 12px; background: color-mix(in srgb, var(--cu-color) 12%, transparent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .cu-icon-wrap .material-icons-round { color: var(--cu-color); font-size: 1.3rem; }
    .cu-id-badge { display: inline-block; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--cu-color); background: color-mix(in srgb, var(--cu-color) 10%, transparent); padding: 0.15rem 0.5rem; border-radius: 999px; margin-bottom: 0.2rem; }
    .cu-card h3 { margin: 0; font-size: 0.95rem; color: var(--text-dark); font-weight: 700; }
    .cu-desc { font-size: 0.82rem; color: var(--text-muted); margin: 0 0 0.85rem; line-height: 1.5; }
    .cu-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.35rem; }
    .cu-features li { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: var(--text-dark); }
    .cu-features li .material-icons-round { font-size: 0.9rem; color: var(--cu-color); }

    /* Sections */
    .demo-section { background: var(--surface); border-radius: 24px; border: 1px solid var(--border-light); padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
    .demo-section-title { margin-bottom: 1.25rem; }
    .demo-section-title h2 { margin: 0.4rem 0 0.2rem; font-size: 1.2rem; color: var(--text-dark); }
    .demo-section-sub { margin: 0.3rem 0 0; font-size: 0.85rem; color: var(--text-muted); }
    .cu-tag { display: inline-flex; align-items: center; font-size: 0.7rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 999px; }
    .cu-020 { background: #fff3cd; color: #856404; }
    .cu-021 { background: #d1ecf1; color: #0c5460; }
    .cu-022 { background: #e2d9f3; color: #5a1e8e; }
    .cu-023 { background: #d4edda; color: #155724; }
    .cu-024 { background: #f8d7da; color: #721c24; }

    /* Offline status */
    .offline-status-panel { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .ost-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem; border-radius: 14px; border: 1px solid var(--border-light); background: #f9f9f9; }
    .ost-item.ok { background: #f0fdf4; border-color: #86efac; }
    .ost-item.warn { background: #fffbeb; border-color: #fbbf24; }
    .ost-item .material-icons-round { font-size: 1.3rem; color: var(--text-muted); }
    .ost-item.ok .material-icons-round { color: #16a34a; }
    .ost-item.warn .material-icons-round { color: #d97706; }
    .ost-item strong { display: block; font-size: 0.88rem; color: var(--text-dark); }
    .ost-item small { font-size: 0.75rem; color: var(--text-muted); }

    /* ID picker */
    .demo-id-picker { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .demo-id-picker label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.88rem; font-weight: 700; color: var(--text-dark); }
    .demo-id-picker label .material-icons-round { font-size: 1rem; color: var(--text-muted); }
    .demo-id-picker input { border: 1.5px solid var(--border-light); border-radius: 12px; padding: 0.65rem 1rem; font: inherit; font-size: 0.9rem; width: 140px; }
    .demo-id-picker input:focus { outline: none; border-color: var(--primary-red); }
    .demo-btn-primary { display: flex; align-items: center; gap: 0.4rem; background: var(--primary-red); color: #fff; border: none; border-radius: 12px; padding: 0.65rem 1.1rem; font-weight: 800; font-size: 0.88rem; cursor: pointer; }
    .demo-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .demo-panel-info { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.85rem; }
    .demo-panel-info .material-icons-round { font-size: 1rem; color: var(--primary-red); }
    .demo-empty-panel { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 3rem; color: var(--text-muted); text-align: center; border: 2px dashed var(--border-light); border-radius: 16px; }
    .demo-empty-panel .material-icons-round { font-size: 2.5rem; opacity: 0.3; }

    /* Flow */
    .arch-flow { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; overflow-x: auto; padding-bottom: 0.5rem; }
    .arch-step { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; min-width: 80px; text-align: center; }
    .arch-icon { width: 44px; height: 44px; border-radius: 12px; background: color-mix(in srgb, var(--primary-red) 10%, white); display: flex; align-items: center; justify-content: center; }
    .arch-icon .material-icons-round { color: var(--primary-red); font-size: 1.2rem; }
    .arch-step span { font-size: 0.75rem; font-weight: 700; color: var(--text-dark); }
    .arch-step small { font-size: 0.65rem; color: var(--text-muted); }
    .arch-arrow { color: var(--text-muted); font-size: 1.2rem; }

    @media (max-width: 768px) {
      .demo-header { flex-direction: column; }
      .arch-flow { justify-content: flex-start; }
    }
  `],
})
export class OperacionesDemoComponent {
  readonly cus = CUS;
  readonly offlineService: OfflineService;

  inputId: number | null = null;
  activeId = signal<number | null>(null);

  currentRol = signal('cliente');

  readonly flowSteps = [
    { icon: 'wifi_off',       label: 'Solicitud Offline',   cu: 'CU-020' },
    { icon: 'sync',           label: 'Sincronización',      cu: 'CU-020' },
    { icon: 'assignment_ind', label: 'Asignación',          cu: 'CU-022' },
    { icon: 'location_on',    label: 'Tracking GPS',        cu: 'CU-021' },
    { icon: 'timeline',       label: 'Actualiz. Estados',   cu: 'CU-022' },
    { icon: 'notifications',  label: 'Notificaciones',      cu: 'CU-023' },
    { icon: 'chat',           label: 'Mensajería',          cu: 'CU-023' },
    { icon: 'block',          label: 'Cancelar/Excepción',  cu: 'CU-024' },
  ];

  constructor(private auth: AuthService, offline: OfflineService) {
    this.offlineService = offline;
    const rol = auth.currentUser()?.roles?.[0]?.nombre ?? localStorage.getItem('userRole') ?? 'cliente';
    this.currentRol.set(rol);
  }

  applyId(): void {
    if (this.inputId && this.inputId > 0) {
      this.activeId.set(this.inputId);
    }
  }
}
