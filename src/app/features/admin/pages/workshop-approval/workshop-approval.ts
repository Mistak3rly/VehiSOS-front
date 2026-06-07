import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { TallerRead } from '../../../../core/models/api.models';

@Component({
  selector: 'app-workshop-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="approval-container">

  <!-- Header -->
  <header class="page-header">
    <div>
      <h1>Gestión Global de Talleres</h1>
      <p>Visualiza y administra todos los talleres de todos los tenants del sistema.</p>
    </div>
    <button class="btn-refresh" (click)="cargarTalleres()" [disabled]="cargando()">
      <span class="material-icons-round" [class.spinning]="cargando()">refresh</span>
      Actualizar
    </button>
  </header>

  <!-- Stats -->
  @if (!cargando()) {
    <div class="stats-row">
      <div class="stat-card">
        <span class="material-icons-round" style="color:#6366f1;">store</span>
        <div>
          <span class="stat-num">{{ todosTalleres().length }}</span>
          <span class="stat-label">Total talleres</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="material-icons-round" style="color:#16a34a;">check_circle</span>
        <div>
          <span class="stat-num">{{ activos().length }}</span>
          <span class="stat-label">Activos</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="material-icons-round" style="color:#dc2626;">block</span>
        <div>
          <span class="stat-num">{{ inactivos().length }}</span>
          <span class="stat-label">Inactivos</span>
        </div>
      </div>
    </div>
  }

  <!-- Filtros -->
  <div class="filters-bar card">
    <input type="text" [(ngModel)]="busqueda" placeholder="Buscar por nombre, NIT, ciudad..."
      class="search-input" />
    <select [(ngModel)]="filtroEstado" class="filter-select">
      <option value="todos">Todos los estados</option>
      <option value="activos">Solo activos</option>
      <option value="inactivos">Solo inactivos</option>
    </select>
  </div>

  <!-- Loading -->
  @if (cargando()) {
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando talleres...</p>
    </div>
  }

  <!-- Lista de talleres -->
  @if (!cargando()) {
    @if (talleresFiltered().length === 0) {
      <div class="empty-state card">
        <span class="material-icons-round">search_off</span>
        <h3>Sin resultados</h3>
        <p>No hay talleres que coincidan con los filtros aplicados.</p>
      </div>
    } @else {
      <div class="talleres-grid">
        @for (taller of talleresFiltered(); track taller.id) {
          <div class="taller-card card" [class.inactivo]="!taller.activo">

            <!-- Header de la card -->
            <div class="card-top">
              <div class="taller-avatar" [style.background]="taller.activo ? '#dcfce7' : '#fee2e2'">
                <span class="material-icons-round" [style.color]="taller.activo ? '#16a34a' : '#dc2626'">store</span>
              </div>
              <div class="card-title">
                <h3>{{ taller.nombre }}</h3>
                <span class="tenant-badge">Tenant {{ taller.tenant_id ?? 'Global' }}</span>
              </div>
              <span class="estado-badge" [class.activo]="taller.activo" [class.inactivo]="!taller.activo">
                <span class="material-icons-round">{{ taller.activo ? 'check_circle' : 'cancel' }}</span>
                {{ taller.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>

            <!-- Info del taller -->
            <div class="card-info">
              @if (taller.nit) {
                <div class="info-row">
                  <span class="material-icons-round">badge</span>
                  <span>NIT: <strong>{{ taller.nit }}</strong></span>
                </div>
              }
              @if (taller.correo) {
                <div class="info-row">
                  <span class="material-icons-round">email</span>
                  <span>{{ taller.correo }}</span>
                </div>
              }
              @if (taller.telefono) {
                <div class="info-row">
                  <span class="material-icons-round">phone</span>
                  <span>{{ taller.telefono }}</span>
                </div>
              }
              @if (taller.direccion || taller.ciudad) {
                <div class="info-row">
                  <span class="material-icons-round">location_on</span>
                  <span>{{ taller.ciudad ?? '' }}{{ taller.direccion ? ' — ' + taller.direccion : '' }}</span>
                </div>
              }
              <div class="info-row">
                <span class="material-icons-round">group</span>
                <span>Capacidad: <strong>{{ taller.capacidad_maxima ?? 1 }}</strong> técnicos</span>
              </div>
              <div class="info-row">
                <span class="material-icons-round">percent</span>
                <span>Comisión: <strong>{{ taller.porcentaje_comision ?? 10 }}%</strong></span>
              </div>
            </div>

            <!-- Acciones -->
            <div class="card-actions">
              @if (taller.activo) {
                <button class="btn-desactivar"
                  [disabled]="procesando() === taller.id"
                  (click)="toggleActivo(taller, false)">
                  <span class="material-icons-round">block</span>
                  {{ procesando() === taller.id ? 'Procesando...' : 'Desactivar' }}
                </button>
              } @else {
                <button class="btn-activar"
                  [disabled]="procesando() === taller.id"
                  (click)="toggleActivo(taller, true)">
                  <span class="material-icons-round">check_circle</span>
                  {{ procesando() === taller.id ? 'Procesando...' : 'Activar' }}
                </button>
              }
            </div>

            <!-- Toast de feedback -->
            @if (feedback() === taller.id) {
              <div class="feedback-ok">
                <span class="material-icons-round">done</span>
                Estado actualizado correctamente
              </div>
            }
          </div>
        }
      </div>
    }
  }
</div>
  `,
  styles: [`
    .approval-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }

    /* Header */
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .page-header h1 { font-size: 1.8rem; font-weight: 800; color: #1a1a1a; margin: 0 0 0.4rem; }
    .page-header p { color: #718096; margin: 0; }
    .btn-refresh { display: flex; align-items: center; gap: 0.4rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.6rem 1.1rem; font-weight: 700; cursor: pointer; color: #374151; font-size: 0.88rem; }
    .btn-refresh:hover { background: #f7fafc; }
    .btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
    .spinning { animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Stats */
    .stats-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .stat-card { flex: 1; min-width: 140px; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 0.85rem; }
    .stat-card .material-icons-round { font-size: 1.8rem; }
    .stat-num { display: block; font-size: 1.8rem; font-weight: 800; color: #1a1a1a; line-height: 1; }
    .stat-label { font-size: 0.78rem; color: #718096; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }

    /* Filtros */
    .filters-bar { display: flex; gap: 0.75rem; padding: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .search-input { flex: 1; min-width: 200px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.6rem 1rem; font-size: 0.88rem; font-family: inherit; }
    .search-input:focus { outline: none; border-color: #6366f1; }
    .filter-select { border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.6rem 1rem; font-size: 0.88rem; font-family: inherit; background: #fff; cursor: pointer; }

    /* Loading / Empty */
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 2rem; color: #718096; }
    .spinner { width: 36px; height: 36px; border: 4px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.7s linear infinite; }
    .empty-state { padding: 4rem 2rem; text-align: center; color: #a0aec0; }
    .empty-state .material-icons-round { font-size: 3.5rem; margin-bottom: 0.75rem; display: block; }
    .empty-state h3 { margin: 0 0 0.4rem; color: #4a5568; }

    /* Grid de talleres */
    .talleres-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem; }

    /* Taller card */
    .taller-card { padding: 1.25rem; border-radius: 14px; border: 1px solid #e2e8f0; background: #fff; display: flex; flex-direction: column; gap: 1rem; transition: box-shadow 0.2s; }
    .taller-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .taller-card.inactivo { background: #fafafa; border-color: #f3f4f6; opacity: 0.85; }

    /* Card top */
    .card-top { display: flex; align-items: flex-start; gap: 0.85rem; }
    .taller-avatar { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .taller-avatar .material-icons-round { font-size: 1.4rem; }
    .card-title { flex: 1; min-width: 0; }
    .card-title h3 { margin: 0 0 0.25rem; font-size: 1rem; font-weight: 700; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tenant-badge { font-size: 0.72rem; font-weight: 700; color: #6366f1; background: #eef2ff; padding: 0.15rem 0.5rem; border-radius: 999px; }

    /* Estado badge */
    .estado-badge { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.65rem; border-radius: 999px; white-space: nowrap; flex-shrink: 0; }
    .estado-badge .material-icons-round { font-size: 0.85rem; }
    .estado-badge.activo { background: #dcfce7; color: #15803d; }
    .estado-badge.inactivo { background: #fee2e2; color: #dc2626; }

    /* Info */
    .card-info { display: flex; flex-direction: column; gap: 0.4rem; }
    .info-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: #4a5568; }
    .info-row .material-icons-round { font-size: 0.95rem; color: #a0aec0; flex-shrink: 0; }
    .info-row strong { color: #1a1a1a; }

    /* Acciones */
    .card-actions { padding-top: 0.5rem; border-top: 1px solid #f3f4f6; }
    .btn-activar, .btn-desactivar {
      width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
      padding: 0.65rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer;
      border: none; transition: background 0.15s;
    }
    .btn-activar { background: #16a34a; color: #fff; }
    .btn-activar:hover:not(:disabled) { background: #15803d; }
    .btn-desactivar { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
    .btn-desactivar:hover:not(:disabled) { background: #fecaca; }
    .btn-activar:disabled, .btn-desactivar:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Feedback */
    .feedback-ok { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 8px 12px; font-size: 0.82rem; color: #15803d; font-weight: 600; display: flex; align-items: center; gap: 6px; }
    .feedback-ok .material-icons-round { font-size: 1rem; }

    /* Card base */
    .card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; }
  `]
})
export class WorkshopApproval implements OnInit {
  todosTalleres = signal<TallerRead[]>([]);
  cargando = signal(true);
  procesando = signal<number | null>(null);
  feedback = signal<number | null>(null);

  busqueda = '';
  filtroEstado = 'todos';

  activos = computed(() => this.todosTalleres().filter(t => t.activo));
  inactivos = computed(() => this.todosTalleres().filter(t => !t.activo));

  talleresFiltered = computed(() => {
    let lista = this.todosTalleres();

    if (this.filtroEstado === 'activos') lista = lista.filter(t => t.activo);
    if (this.filtroEstado === 'inactivos') lista = lista.filter(t => !t.activo);

    const q = this.busqueda.toLowerCase().trim();
    if (q) {
      lista = lista.filter(t =>
        t.nombre.toLowerCase().includes(q) ||
        (t.nit ?? '').toLowerCase().includes(q) ||
        (t.ciudad ?? '').toLowerCase().includes(q) ||
        (t.correo ?? '').toLowerCase().includes(q)
      );
    }
    return lista;
  });

  constructor(private logistica: LogisticaService) {}

  ngOnInit() {
    this.cargarTalleres();
  }

  cargarTalleres() {
    this.cargando.set(true);
    this.logistica.listAllTalleres().subscribe({
      next: (data) => {
        this.todosTalleres.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  toggleActivo(taller: TallerRead, nuevoEstado: boolean) {
    this.procesando.set(taller.id);
    this.feedback.set(null);
    this.logistica.updateTallerActivo(taller.id, nuevoEstado).subscribe({
      next: (actualizado) => {
        this.todosTalleres.update(lista =>
          lista.map(t => t.id === taller.id ? { ...t, activo: actualizado.activo } : t)
        );
        this.procesando.set(null);
        this.feedback.set(taller.id);
        setTimeout(() => this.feedback.set(null), 3000);
      },
      error: () => {
        this.procesando.set(null);
      }
    });
  }
}
