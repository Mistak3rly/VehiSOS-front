import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TallerSaasService } from '../../../../core/services/taller-saas.service';
import {
  ServicioSaaSCreate, ServicioSaaSRead,
  CoberturaSaaSCreate, CoberturaSaaSRead,
} from '../../../../core/models/api.models';

const CATEGORIAS = [
  { value: 'grua',             label: 'Grúa' },
  { value: 'cambio_llanta',    label: 'Cambio de llanta' },
  { value: 'bateria',          label: 'Batería' },
  { value: 'remolque',         label: 'Remolque' },
  { value: 'chaperia',         label: 'Chaperío' },
  { value: 'pintura',          label: 'Pintura' },
  { value: 'auxilio_mecanico', label: 'Auxilio mecánico' },
  { value: 'atencion_choque',  label: 'Atención por choque' },
];

@Component({
  selector: 'app-servicios-cobertura',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sc-page">
      <header class="sc-header">
        <div>
          <p class="sc-eyebrow">CU-019 · Operaciones</p>
          <h1>Servicios y Cobertura</h1>
          <p class="sc-sub">Administra el catálogo de servicios que ofrece tu taller y define tus zonas de cobertura.</p>
        </div>
        <div class="sc-stats">
          <div class="sc-stat">
            <strong>{{ serviciosActivos() }}</strong>
            <small>Servicios activos</small>
          </div>
          <div class="sc-stat">
            <strong>{{ coberturas().length }}</strong>
            <small>Zonas de cobertura</small>
          </div>
        </div>
      </header>

      <div class="sc-grid">

        <!-- ══ SERVICIOS ══════════════════════════════════════ -->
        <section class="sc-card">
          <div class="sc-card-header">
            <span class="material-icons-round">build</span>
            <h2>Servicios del Taller</h2>
          </div>

          <!-- Formulario agregar/editar servicio -->
          <div class="sc-form" [class.editing]="editingServicio()">
            <div class="sc-form-title">
              {{ editingServicio() ? 'Editar servicio' : 'Agregar servicio' }}
              @if (editingServicio()) {
                <button class="sc-btn-cancel" (click)="cancelEditServicio()">Cancelar</button>
              }
            </div>
            <div class="sc-form-row">
              <label class="sc-field">
                <span>Nombre</span>
                <input type="text" [(ngModel)]="servicioForm.nombre" placeholder="Ej: Grúa de emergencia" />
              </label>
              <label class="sc-field">
                <span>Categoría</span>
                <select [(ngModel)]="servicioForm.categoria">
                  <option value="">Seleccionar...</option>
                  @for (cat of categorias; track cat.value) {
                    <option [value]="cat.value">{{ cat.label }}</option>
                  }
                </select>
              </label>
            </div>
            <label class="sc-field">
              <span>Descripción</span>
              <textarea [(ngModel)]="servicioForm.descripcion" placeholder="Descripción del servicio (opcional)"></textarea>
            </label>
            <div class="sc-form-actions">
              @if (servicioError()) { <span class="sc-error">{{ servicioError() }}</span> }
              @if (servicioOk()) { <span class="sc-ok">{{ servicioOk() }}</span> }
              <button class="sc-btn-primary"
                [disabled]="savingServicio() || !servicioForm.nombre.trim() || !servicioForm.categoria"
                (click)="saveServicio()">
                <span class="material-icons-round">{{ editingServicio() ? 'save' : 'add' }}</span>
                {{ savingServicio() ? 'Guardando...' : (editingServicio() ? 'Guardar cambios' : 'Agregar servicio') }}
              </button>
            </div>
          </div>

          <!-- Lista de servicios -->
          <div class="sc-list">
            @if (loadingServicios()) {
              <div class="sc-loading"><div class="sc-spinner"></div><span>Cargando servicios...</span></div>
            } @else if (servicios().length === 0) {
              <div class="sc-empty">
                <span class="material-icons-round">build_circle</span>
                <p>No tienes servicios registrados aún.</p>
              </div>
            } @else {
              @for (s of servicios(); track s.id) {
                <div class="sc-item" [class.inactive]="!s.activo">
                  <div class="sc-item-icon">
                    <span class="material-icons-round">{{ iconForCategoria(s.categoria) }}</span>
                  </div>
                  <div class="sc-item-info">
                    <strong>{{ s.nombre }}</strong>
                    <span class="sc-cat-badge">{{ labelForCategoria(s.categoria) }}</span>
                    @if (s.descripcion) { <small>{{ s.descripcion }}</small> }
                  </div>
                  <div class="sc-item-actions">
                    <button class="sc-btn-toggle" [class.active]="s.activo" (click)="toggleServicio(s)" title="{{ s.activo ? 'Desactivar' : 'Activar' }}">
                      <span class="material-icons-round">{{ s.activo ? 'toggle_on' : 'toggle_off' }}</span>
                    </button>
                    <button class="sc-btn-icon" (click)="startEditServicio(s)" title="Editar">
                      <span class="material-icons-round">edit</span>
                    </button>
                    <button class="sc-btn-icon danger" (click)="confirmDeleteServicio(s)" title="Eliminar">
                      <span class="material-icons-round">delete</span>
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        </section>

        <!-- ══ COBERTURAS ═════════════════════════════════════ -->
        <section class="sc-card">
          <div class="sc-card-header">
            <span class="material-icons-round">location_on</span>
            <h2>Zonas de Cobertura</h2>
          </div>

          <!-- Formulario agregar/editar cobertura -->
          <div class="sc-form" [class.editing]="editingCobertura()">
            <div class="sc-form-title">
              {{ editingCobertura() ? 'Editar zona' : 'Agregar zona' }}
              @if (editingCobertura()) {
                <button class="sc-btn-cancel" (click)="cancelEditCobertura()">Cancelar</button>
              }
            </div>
            <div class="sc-form-row">
              <label class="sc-field">
                <span>Zona</span>
                <input type="text" [(ngModel)]="coberturaForm.zona" placeholder="Ej: Zona Norte" />
              </label>
              <label class="sc-field">
                <span>Ciudad</span>
                <input type="text" [(ngModel)]="coberturaForm.ciudad" placeholder="Ej: Santa Cruz" />
              </label>
            </div>
            <div class="sc-form-row">
              <label class="sc-field">
                <span>Radio de cobertura (km)</span>
                <input type="number" [(ngModel)]="coberturaForm.radio_cobertura" placeholder="Ej: 15" min="0.5" step="0.5" />
              </label>
              <label class="sc-field sc-field-check">
                <span>Disponible 24h</span>
                <input type="checkbox" [(ngModel)]="coberturaForm.disponible_24h" />
              </label>
            </div>
            <label class="sc-field">
              <span>Descripción</span>
              <textarea [(ngModel)]="coberturaForm.descripcion" placeholder="Detalle adicional de la zona (opcional)"></textarea>
            </label>
            <div class="sc-form-actions">
              @if (coberturaError()) { <span class="sc-error">{{ coberturaError() }}</span> }
              @if (coberturaOk()) { <span class="sc-ok">{{ coberturaOk() }}</span> }
              <button class="sc-btn-primary"
                [disabled]="savingCobertura() || !coberturaForm.zona.trim() || !coberturaForm.ciudad.trim() || !coberturaForm.radio_cobertura"
                (click)="saveCobertura()">
                <span class="material-icons-round">{{ editingCobertura() ? 'save' : 'add_location' }}</span>
                {{ savingCobertura() ? 'Guardando...' : (editingCobertura() ? 'Guardar cambios' : 'Agregar zona') }}
              </button>
            </div>
          </div>

          <!-- Lista de coberturas -->
          <div class="sc-list">
            @if (loadingCoberturas()) {
              <div class="sc-loading"><div class="sc-spinner"></div><span>Cargando coberturas...</span></div>
            } @else if (coberturas().length === 0) {
              <div class="sc-empty">
                <span class="material-icons-round">location_off</span>
                <p>No tienes zonas de cobertura definidas.</p>
              </div>
            } @else {
              @for (c of coberturas(); track c.id) {
                <div class="sc-item">
                  <div class="sc-item-icon">
                    <span class="material-icons-round">{{ c.disponible_24h ? 'schedule' : 'location_on' }}</span>
                  </div>
                  <div class="sc-item-info">
                    <strong>{{ c.zona }}</strong>
                    <span class="sc-cat-badge">{{ c.ciudad }}</span>
                    <small>Radio: {{ c.radio_cobertura }} km · {{ c.disponible_24h ? '24 horas' : 'Horario limitado' }}</small>
                    @if (c.descripcion) { <small>{{ c.descripcion }}</small> }
                  </div>
                  <div class="sc-item-actions">
                    <button class="sc-btn-icon" (click)="startEditCobertura(c)" title="Editar">
                      <span class="material-icons-round">edit</span>
                    </button>
                    <button class="sc-btn-icon danger" (click)="confirmDeleteCobertura(c)" title="Eliminar">
                      <span class="material-icons-round">delete</span>
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        </section>

      </div>
    </div>
  `,
  styles: [`
    .sc-page { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .sc-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .sc-eyebrow { margin: 0 0 0.4rem; text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.72rem; color: var(--primary-red); font-weight: 800; }
    h1 { margin: 0; font-size: 2rem; color: var(--text-dark); }
    .sc-sub { margin: 0.4rem 0 0; color: var(--text-muted); font-size: 0.9rem; }
    .sc-stats { display: flex; gap: 1rem; }
    .sc-stat { background: color-mix(in srgb, var(--primary-red) 8%, white); border: 1px solid var(--border-light); border-radius: 16px; padding: 0.85rem 1.25rem; text-align: center; }
    .sc-stat strong { display: block; font-size: 1.6rem; color: var(--primary-red); font-weight: 800; }
    .sc-stat small { font-size: 0.78rem; color: var(--text-muted); }

    .sc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    @media (max-width: 1024px) { .sc-grid { grid-template-columns: 1fr; } }

    .sc-card { background: var(--surface); border-radius: 24px; border: 1px solid var(--border-light); box-shadow: 0 6px 20px rgba(0,0,0,0.04); overflow: hidden; }
    .sc-card-header { display: flex; align-items: center; gap: 0.75rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); background: color-mix(in srgb, var(--primary-red) 5%, white); }
    .sc-card-header .material-icons-round { color: var(--primary-red); font-size: 1.4rem; }
    .sc-card-header h2 { margin: 0; font-size: 1.1rem; color: var(--text-dark); }

    .sc-form { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); background: var(--surface); }
    .sc-form.editing { background: color-mix(in srgb, var(--primary-red) 4%, white); }
    .sc-form-title { display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 0.88rem; color: var(--text-dark); margin-bottom: 0.9rem; text-transform: uppercase; letter-spacing: 0.06em; }
    .sc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 0.85rem; }
    .sc-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.85rem; }
    .sc-field span { font-size: 0.82rem; font-weight: 700; color: var(--text-dark); }
    .sc-field input, .sc-field select, .sc-field textarea { border: 1px solid var(--border-light); border-radius: 12px; padding: 0.7rem 0.9rem; font: inherit; background: var(--surface); color: var(--text-dark); font-size: 0.9rem; }
    .sc-field textarea { min-height: 70px; resize: vertical; }
    .sc-field input:focus, .sc-field select:focus, .sc-field textarea:focus { outline: none; border-color: var(--primary-red); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-red) 15%, transparent); }
    .sc-field-check { flex-direction: row; align-items: center; gap: 0.75rem; padding-top: 1.5rem; }
    .sc-field-check input { width: 20px; height: 20px; accent-color: var(--primary-red); }
    .sc-form-actions { display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; flex-wrap: wrap; }
    .sc-error { font-size: 0.82rem; font-weight: 600; color: #c0392b; }
    .sc-ok { font-size: 0.82rem; font-weight: 600; color: #2f855a; }
    .sc-btn-primary { display: flex; align-items: center; gap: 0.4rem; border: none; background: var(--primary-red); color: #fff; padding: 0.75rem 1.2rem; border-radius: 12px; font-weight: 800; font-size: 0.88rem; cursor: pointer; transition: opacity 0.2s; }
    .sc-btn-primary:hover:not(:disabled) { opacity: 0.88; }
    .sc-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .sc-btn-cancel { font-size: 0.78rem; font-weight: 700; color: var(--primary-red); background: none; border: 1px solid var(--border-light); border-radius: 8px; padding: 0.3rem 0.7rem; cursor: pointer; }
    .sc-btn-cancel:hover { background: color-mix(in srgb, var(--primary-red) 8%, white); }

    .sc-list { padding: 0.75rem 1.5rem 1.25rem; display: flex; flex-direction: column; gap: 0.65rem; max-height: 460px; overflow-y: auto; }
    .sc-loading, .sc-empty { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 2rem; color: var(--text-muted); font-size: 0.9rem; }
    .sc-empty { flex-direction: column; gap: 0.5rem; }
    .sc-empty .material-icons-round { font-size: 2.5rem; opacity: 0.3; }
    .sc-empty p { margin: 0; }
    .sc-spinner { width: 22px; height: 22px; border: 3px solid var(--border-light); border-top-color: var(--primary-red); border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .sc-item { display: flex; align-items: flex-start; gap: 0.85rem; padding: 0.85rem 1rem; border-radius: 14px; border: 1px solid var(--border-light); background: var(--surface); transition: border-color 0.15s; }
    .sc-item:hover { border-color: var(--primary-red); }
    .sc-item.inactive { opacity: 0.55; }
    .sc-item-icon { width: 36px; height: 36px; border-radius: 10px; background: color-mix(in srgb, var(--primary-red) 10%, white); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .sc-item-icon .material-icons-round { color: var(--primary-red); font-size: 1.1rem; }
    .sc-item-info { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
    .sc-item-info strong { font-size: 0.92rem; color: var(--text-dark); font-weight: 700; }
    .sc-item-info small { font-size: 0.76rem; color: var(--text-muted); }
    .sc-cat-badge { display: inline-flex; align-items: center; padding: 0.15rem 0.55rem; border-radius: 999px; background: color-mix(in srgb, var(--primary-red) 10%, white); color: var(--primary-red); font-size: 0.72rem; font-weight: 700; align-self: flex-start; }
    .sc-item-actions { display: flex; align-items: center; gap: 0.3rem; flex-shrink: 0; }
    .sc-btn-icon { background: none; border: 1px solid var(--border-light); border-radius: 8px; padding: 0.3rem; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; transition: all 0.15s; }
    .sc-btn-icon .material-icons-round { font-size: 1rem; }
    .sc-btn-icon:hover { background: var(--surface-low); border-color: var(--primary-red); color: var(--primary-red); }
    .sc-btn-icon.danger:hover { border-color: #c0392b; color: #c0392b; background: #fdf2f2; }
    .sc-btn-toggle { background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; padding: 0.3rem; }
    .sc-btn-toggle .material-icons-round { font-size: 1.5rem; }
    .sc-btn-toggle.active .material-icons-round { color: #2f855a; }
    .sc-btn-toggle:not(.active) .material-icons-round { color: #aaa; }
  `],
})
export class ServiciosCobertura implements OnInit {
  readonly categorias = CATEGORIAS;

  // ── Servicios state ──
  servicios = signal<ServicioSaaSRead[]>([]);
  loadingServicios = signal(true);
  savingServicio = signal(false);
  editingServicio = signal<ServicioSaaSRead | null>(null);
  servicioError = signal('');
  servicioOk = signal('');

  servicioForm: ServicioSaaSCreate = { nombre: '', categoria: '', descripcion: '', activo: true };

  // ── Coberturas state ──
  coberturas = signal<CoberturaSaaSRead[]>([]);
  loadingCoberturas = signal(true);
  savingCobertura = signal(false);
  editingCobertura = signal<CoberturaSaaSRead | null>(null);
  coberturaError = signal('');
  coberturaOk = signal('');

  coberturaForm: CoberturaSaaSCreate = { zona: '', ciudad: '', radio_cobertura: 0, disponible_24h: false, descripcion: '' };

  // ── Computed ──
  serviciosActivos = () => this.servicios().filter(s => s.activo).length;

  constructor(private svc: TallerSaasService) {}

  ngOnInit(): void {
    this.loadServicios();
    this.loadCoberturas();
  }

  // ══ SERVICIOS ═══════════════════════════════════════
  loadServicios(): void {
    this.loadingServicios.set(true);
    this.svc.listServicios().subscribe({
      next: (list) => { this.servicios.set(list); this.loadingServicios.set(false); },
      error: () => this.loadingServicios.set(false),
    });
  }

  saveServicio(): void {
    if (this.savingServicio()) return;
    this.savingServicio.set(true);
    this.servicioError.set('');
    this.servicioOk.set('');

    const editing = this.editingServicio();
    const obs = editing
      ? this.svc.updateServicio(editing.id, this.servicioForm)
      : this.svc.createServicio(this.servicioForm);

    obs.subscribe({
      next: (saved) => {
        if (editing) {
          this.servicios.update(list => list.map(s => s.id === saved.id ? saved : s));
          this.servicioOk.set('Servicio actualizado.');
        } else {
          this.servicios.update(list => [saved, ...list]);
          this.servicioOk.set('Servicio agregado.');
        }
        this.resetServicioForm();
        this.savingServicio.set(false);
      },
      error: (err) => {
        this.servicioError.set(err?.error?.detail ?? 'Error al guardar el servicio.');
        this.savingServicio.set(false);
      },
    });
  }

  toggleServicio(s: ServicioSaaSRead): void {
    this.svc.updateServicio(s.id, { activo: !s.activo }).subscribe({
      next: (updated) => this.servicios.update(list => list.map(x => x.id === updated.id ? updated : x)),
    });
  }

  startEditServicio(s: ServicioSaaSRead): void {
    this.editingServicio.set(s);
    this.servicioForm = { nombre: s.nombre, categoria: s.categoria, descripcion: s.descripcion ?? '', activo: s.activo };
    this.servicioError.set('');
    this.servicioOk.set('');
  }

  cancelEditServicio(): void { this.resetServicioForm(); }

  confirmDeleteServicio(s: ServicioSaaSRead): void {
    if (!confirm(`¿Eliminar el servicio "${s.nombre}"?`)) return;
    this.svc.deleteServicio(s.id).subscribe({
      next: () => this.servicios.update(list => list.filter(x => x.id !== s.id)),
    });
  }

  private resetServicioForm(): void {
    this.editingServicio.set(null);
    this.servicioForm = { nombre: '', categoria: '', descripcion: '', activo: true };
  }

  // ══ COBERTURAS ══════════════════════════════════════
  loadCoberturas(): void {
    this.loadingCoberturas.set(true);
    this.svc.listCoberturas().subscribe({
      next: (list) => { this.coberturas.set(list); this.loadingCoberturas.set(false); },
      error: () => this.loadingCoberturas.set(false),
    });
  }

  saveCobertura(): void {
    if (this.savingCobertura()) return;
    this.savingCobertura.set(true);
    this.coberturaError.set('');
    this.coberturaOk.set('');

    const editing = this.editingCobertura();
    const obs = editing
      ? this.svc.updateCobertura(editing.id, this.coberturaForm)
      : this.svc.createCobertura(this.coberturaForm);

    obs.subscribe({
      next: (saved) => {
        if (editing) {
          this.coberturas.update(list => list.map(c => c.id === saved.id ? saved : c));
          this.coberturaOk.set('Zona actualizada.');
        } else {
          this.coberturas.update(list => [saved, ...list]);
          this.coberturaOk.set('Zona agregada.');
        }
        this.resetCoberturaForm();
        this.savingCobertura.set(false);
      },
      error: (err) => {
        this.coberturaError.set(err?.error?.detail ?? 'Error al guardar la zona.');
        this.savingCobertura.set(false);
      },
    });
  }

  startEditCobertura(c: CoberturaSaaSRead): void {
    this.editingCobertura.set(c);
    this.coberturaForm = { zona: c.zona, ciudad: c.ciudad, radio_cobertura: c.radio_cobertura, disponible_24h: c.disponible_24h, descripcion: c.descripcion ?? '' };
    this.coberturaError.set('');
    this.coberturaOk.set('');
  }

  cancelEditCobertura(): void { this.resetCoberturaForm(); }

  confirmDeleteCobertura(c: CoberturaSaaSRead): void {
    if (!confirm(`¿Eliminar la zona "${c.zona}" en ${c.ciudad}?`)) return;
    this.svc.deleteCobertura(c.id).subscribe({
      next: () => this.coberturas.update(list => list.filter(x => x.id !== c.id)),
    });
  }

  private resetCoberturaForm(): void {
    this.editingCobertura.set(null);
    this.coberturaForm = { zona: '', ciudad: '', radio_cobertura: 0, disponible_24h: false, descripcion: '' };
  }

  // ══ HELPERS ═════════════════════════════════════════
  iconForCategoria(cat: string): string {
    const map: Record<string, string> = {
      grua: 'local_shipping', cambio_llanta: 'tire_repair', bateria: 'battery_charging_full',
      remolque: 'rv_hookup', chaperia: 'car_repair', pintura: 'format_paint',
      auxilio_mecanico: 'build', atencion_choque: 'car_crash',
    };
    return map[cat] ?? 'miscellaneous_services';
  }

  labelForCategoria(cat: string): string {
    return CATEGORIAS.find(c => c.value === cat)?.label ?? cat;
  }
}
