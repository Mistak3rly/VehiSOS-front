import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { AuditLogRead } from '../../../../core/models/api.models';

const ACCION_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  LOGIN:             { label: 'LOGIN',             color: '#15803d', bg: '#dcfce7', icon: 'login' },
  LOGIN_FALLIDO:     { label: 'LOGIN FALLIDO',     color: '#dc2626', bg: '#fee2e2', icon: 'no_accounts' },
  REGISTRO_USUARIO:  { label: 'REGISTRO',          color: '#0369a1', bg: '#e0f2fe', icon: 'person_add' },
  CREATE_USER:       { label: 'CREAR USUARIO',     color: '#0369a1', bg: '#e0f2fe', icon: 'person_add' },
  UPDATE_USER:       { label: 'EDITAR USUARIO',    color: '#6366f1', bg: '#eef2ff', icon: 'edit' },
  ACTIVATE_USER:     { label: 'ACTIVAR USUARIO',   color: '#15803d', bg: '#dcfce7', icon: 'check_circle' },
  DEACTIVATE_USER:   { label: 'DESACTIVAR USUARIO',color: '#b45309', bg: '#fef3c7', icon: 'block' },
  ASSIGN_ROL:        { label: 'ASIGNAR ROL',       color: '#7c3aed', bg: '#f5f3ff', icon: 'manage_accounts' },
  CREATE_ROL:        { label: 'CREAR ROL',         color: '#7c3aed', bg: '#f5f3ff', icon: 'admin_panel_settings' },
  CREATE_PERMISO:    { label: 'CREAR PERMISO',     color: '#7c3aed', bg: '#f5f3ff', icon: 'key' },
  ASSIGN_PERMISO:    { label: 'ASIGNAR PERMISO',   color: '#7c3aed', bg: '#f5f3ff', icon: 'key' },
  CREATE_TENANT:     { label: 'CREAR TENANT',      color: '#b45309', bg: '#fef3c7', icon: 'business' },
  UPDATE_TENANT:     { label: 'EDITAR TENANT',     color: '#b45309', bg: '#fef3c7', icon: 'business' },
  ACTIVATE_TENANT:   { label: 'ACTIVAR TENANT',    color: '#15803d', bg: '#dcfce7', icon: 'business' },
  DEACTIVATE_TENANT: { label: 'DESACTIVAR TENANT', color: '#dc2626', bg: '#fee2e2', icon: 'business' },
  DELETE_TENANT:     { label: 'ELIMINAR TENANT',   color: '#dc2626', bg: '#fee2e2', icon: 'delete' },
  CREATE_TALLER:     { label: 'CREAR TALLER',      color: '#0891b2', bg: '#ecfeff', icon: 'store' },
  UPDATE_TALLER:     { label: 'EDITAR TALLER',     color: '#0891b2', bg: '#ecfeff', icon: 'store' },
  ACTIVATE_TALLER:   { label: 'ACTIVAR TALLER',    color: '#15803d', bg: '#dcfce7', icon: 'store' },
  DEACTIVATE_TALLER: { label: 'DESACTIVAR TALLER', color: '#b45309', bg: '#fef3c7', icon: 'store' },
  REGISTER_TECNICO:  { label: 'CREAR TÉCNICO',     color: '#0891b2', bg: '#ecfeff', icon: 'engineering' },
};

function meta(accion: string) {
  return ACCION_META[accion] ?? { label: accion, color: '#4a5568', bg: '#f7fafc', icon: 'info' };
}

const TODAS_LAS_ACCIONES = Object.keys(ACCION_META);

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="audit-container">

  <!-- Header -->
  <header class="page-header">
    <div>
      <h1>Auditoría de Sistema</h1>
      <p>Registro histórico de todas las acciones realizadas en la plataforma.</p>
    </div>
    <button class="btn-refresh" (click)="cargar()" [disabled]="cargando()">
      <span class="material-icons-round" [class.spinning]="cargando()">refresh</span>
      Actualizar
    </button>
  </header>

  <!-- Stats -->
  @if (!cargando() && todos().length > 0) {
    <div class="stats-row">
      <div class="stat-card">
        <span class="material-icons-round" style="color:#6366f1">history</span>
        <div>
          <span class="stat-num">{{ todos().length }}</span>
          <span class="stat-label">Eventos totales</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="material-icons-round" style="color:#16a34a">login</span>
        <div>
          <span class="stat-num">{{ countPor('LOGIN') }}</span>
          <span class="stat-label">Inicios de sesión</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="material-icons-round" style="color:#dc2626">no_accounts</span>
        <div>
          <span class="stat-num">{{ countPor('LOGIN_FALLIDO') }}</span>
          <span class="stat-label">Logins fallidos</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="material-icons-round" style="color:#0891b2">store</span>
        <div>
          <span class="stat-num">{{ countCategoria('TALLER') }}</span>
          <span class="stat-label">Eventos de talleres</span>
        </div>
      </div>
    </div>
  }

  <!-- Filtros -->
  <div class="filters-bar card">
    <input type="text" [(ngModel)]="busqueda" placeholder="Buscar por usuario..."
      class="search-input" (input)="aplicarFiltros()" />
    <select [(ngModel)]="filtroAccion" class="filter-select" (change)="aplicarFiltros()">
      <option value="">Todas las acciones</option>
      @for (a of acciones; track a) {
        <option [value]="a">{{ getMeta(a).label }}</option>
      }
    </select>
    <div class="date-filters">
      <input type="date" [(ngModel)]="filtroDesde" class="filter-date" (change)="aplicarFiltros()" />
      <span class="date-sep">—</span>
      <input type="date" [(ngModel)]="filtroHasta" class="filter-date" (change)="aplicarFiltros()" />
    </div>
    @if (hayFiltros()) {
      <button class="btn-clear" (click)="limpiarFiltros()">
        <span class="material-icons-round">clear</span>
        Limpiar
      </button>
    }
  </div>

  <!-- Loading -->
  @if (cargando()) {
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando registros...</p>
    </div>
  }

  <!-- Tabla -->
  @if (!cargando()) {
    @if (filtrados().length === 0) {
      <div class="empty-state card">
        <span class="material-icons-round">search_off</span>
        <h3>Sin resultados</h3>
        <p>No hay eventos que coincidan con los filtros aplicados.</p>
      </div>
    } @else {
      <div class="table-container card">
        <div class="table-info">
          <span>Mostrando <strong>{{ filtrados().length }}</strong> registros</span>
        </div>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Entidad</th>
                <th>Detalles</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (log of filtrados(); track log.id) {
                <tr [class.fila-error]="!log.exitoso">
                  <td class="date-cell">
                    <span class="date-main">{{ log.timestamp | date:'dd/MM/yyyy' }}</span>
                    <span class="date-time">{{ log.timestamp | date:'HH:mm:ss' }}</span>
                  </td>
                  <td class="user-cell">
                    <span class="material-icons-round">account_circle</span>
                    <span>{{ log.usuario_identificador }}</span>
                  </td>
                  <td>
                    <span class="action-badge"
                      [style.background]="getMeta(log.accion).bg"
                      [style.color]="getMeta(log.accion).color">
                      <span class="material-icons-round">{{ getMeta(log.accion).icon }}</span>
                      {{ getMeta(log.accion).label }}
                    </span>
                  </td>
                  <td class="entity-cell">
                    @if (log.entidad_tipo) {
                      <span class="entity-badge">{{ log.entidad_tipo }} #{{ log.entidad_id }}</span>
                    } @else {
                      <span class="entity-none">—</span>
                    }
                  </td>
                  <td class="details-cell">{{ log.detalles ?? '—' }}</td>
                  <td>
                    <span class="status-dot" [class.ok]="log.exitoso" [class.fail]="!log.exitoso">
                      <span class="material-icons-round">{{ log.exitoso ? 'check_circle' : 'cancel' }}</span>
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  }
</div>
  `,
  styles: [`
    .audit-container { padding: 2rem; max-width: 1300px; margin: 0 auto; }

    /* Header */
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .page-header h1 { font-size: 1.8rem; font-weight: 800; color: #1a1a1a; margin: 0 0 0.3rem; }
    .page-header p { color: #718096; margin: 0; font-size: 0.9rem; }
    .btn-refresh { display: flex; align-items: center; gap: 0.4rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.6rem 1.1rem; font-weight: 700; cursor: pointer; color: #374151; font-size: 0.88rem; }
    .btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
    .spinning { animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Stats */
    .stats-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .stat-card { flex: 1; min-width: 150px; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 0.85rem; }
    .stat-card .material-icons-round { font-size: 1.8rem; }
    .stat-num { display: block; font-size: 1.8rem; font-weight: 800; color: #1a1a1a; line-height: 1; }
    .stat-label { font-size: 0.75rem; color: #718096; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }

    /* Filtros */
    .filters-bar { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .search-input { flex: 1; min-width: 180px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.55rem 0.9rem; font-size: 0.88rem; font-family: inherit; }
    .search-input:focus { outline: none; border-color: #6366f1; }
    .filter-select { border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.55rem 0.9rem; font-size: 0.88rem; font-family: inherit; background: #fff; cursor: pointer; }
    .date-filters { display: flex; align-items: center; gap: 0.4rem; }
    .filter-date { border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.55rem 0.7rem; font-size: 0.85rem; font-family: inherit; }
    .date-sep { color: #a0aec0; font-size: 0.9rem; }
    .btn-clear { display: flex; align-items: center; gap: 0.3rem; background: #fee2e2; color: #dc2626; border: none; border-radius: 8px; padding: 0.55rem 0.9rem; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
    .btn-clear .material-icons-round { font-size: 1rem; }

    /* Loading / Empty */
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem; color: #718096; }
    .spinner { width: 36px; height: 36px; border: 4px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.7s linear infinite; }
    .empty-state { padding: 4rem 2rem; text-align: center; color: #a0aec0; }
    .empty-state .material-icons-round { font-size: 3rem; margin-bottom: 0.75rem; display: block; }
    .empty-state h3 { color: #4a5568; margin: 0 0 0.4rem; }

    /* Tabla */
    .card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; }
    .table-container { overflow: hidden; }
    .table-info { padding: 0.85rem 1.5rem; border-bottom: 1px solid #f1f5f9; color: #718096; font-size: 0.85rem; }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    thead th { padding: 0.9rem 1.25rem; background: #f8fafc; color: #64748b; font-weight: 700; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
    tbody td { padding: 0.85rem 1.25rem; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover td { background: #fafbfc; }
    tbody tr.fila-error td { background: #fff8f8; }

    /* Celdas */
    .date-cell { white-space: nowrap; }
    .date-main { display: block; font-weight: 600; color: #2d3748; }
    .date-time { display: block; font-size: 0.8rem; color: #a0aec0; font-family: monospace; }

    .user-cell { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; color: #2d3748; white-space: nowrap; }
    .user-cell .material-icons-round { color: #cbd5e0; font-size: 1.1rem; flex-shrink: 0; }

    .action-badge { display: inline-flex; align-items: center; gap: 0.3rem; padding: 4px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.04em; white-space: nowrap; }
    .action-badge .material-icons-round { font-size: 0.85rem; }

    .entity-badge { background: #f1f5f9; color: #475569; font-size: 0.78rem; font-weight: 600; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
    .entity-none { color: #cbd5e0; }

    .details-cell { color: #4a5568; max-width: 320px; }

    .status-dot { display: flex; align-items: center; }
    .status-dot .material-icons-round { font-size: 1.1rem; }
    .status-dot.ok .material-icons-round { color: #16a34a; }
    .status-dot.fail .material-icons-round { color: #dc2626; }
  `]
})
export class AuditLogs implements OnInit {
  todos = signal<AuditLogRead[]>([]);
  filtrados = signal<AuditLogRead[]>([]);
  cargando = signal(true);

  busqueda = '';
  filtroAccion = '';
  filtroDesde = '';
  filtroHasta = '';

  readonly acciones = TODAS_LAS_ACCIONES;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.adminService.getAuditLogs({ limit: 500 }).subscribe({
      next: (data) => {
        this.todos.set(data);
        this.aplicarFiltros();
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  aplicarFiltros() {
    let lista = this.todos();

    if (this.filtroAccion) lista = lista.filter(l => l.accion === this.filtroAccion);

    const q = this.busqueda.toLowerCase().trim();
    if (q) lista = lista.filter(l => l.usuario_identificador.toLowerCase().includes(q) || (l.detalles ?? '').toLowerCase().includes(q));

    if (this.filtroDesde) {
      const d = new Date(this.filtroDesde);
      lista = lista.filter(l => new Date(l.timestamp) >= d);
    }
    if (this.filtroHasta) {
      const h = new Date(this.filtroHasta);
      h.setHours(23, 59, 59, 999);
      lista = lista.filter(l => new Date(l.timestamp) <= h);
    }

    this.filtrados.set(lista);
  }

  limpiarFiltros() {
    this.busqueda = '';
    this.filtroAccion = '';
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.aplicarFiltros();
  }

  hayFiltros(): boolean {
    return !!(this.busqueda || this.filtroAccion || this.filtroDesde || this.filtroHasta);
  }

  getMeta(accion: string) {
    return meta(accion);
  }

  countPor(accion: string): number {
    return this.todos().filter(l => l.accion === accion).length;
  }

  countCategoria(palabra: string): number {
    return this.todos().filter(l => l.accion.includes(palabra)).length;
  }
}
