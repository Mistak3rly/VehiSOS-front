import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../../core/services/admin.service';
import {
  AdminUserCreate,
  RoleRead,
  TenantCreate,
  TenantRead,
  UserReadDetail,
} from '../../../../core/models/api.models';

@Component({
  selector: 'app-tenant-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tenant-page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Administración SaaS</p>
          <h1>Gestión de Tenants</h1>
          <p>Cree tenants, visualice los activos y administre sus usuarios y roles desde un solo lugar.</p>
        </div>
        <div class="header-action">
          <span class="material-icons-round">domain</span>
          <div>
            <strong>{{ activeTenants().length }}</strong>
            <small>tenant(s) activo(s)</small>
          </div>
        </div>
      </header>

      @if (!isLoading()) {
        <div class="layout-grid">
          <section class="panel card create-panel">
            <div class="panel-title">
              <div>
                <h2>Crear nuevo tenant</h2>
                <p>Defina el branding y la configuración base de la organización.</p>
              </div>
            </div>
            <div class="form-grid">
              <label class="form-group full">
                <span>Nombre</span>
                <input type="text" [(ngModel)]="tenantForm.nombre" placeholder="Ej: Talleres La Ruta" />
              </label>
              <label class="form-group full">
                <span>Descripción</span>
                <textarea [(ngModel)]="tenantForm.descripcion" placeholder="Breve descripción del tenant"></textarea>
              </label>
              <label class="form-group">
                <span>Plan</span>
                <select [(ngModel)]="tenantForm.plan">
                  <option value="starter">starter</option>
                  <option value="standard">standard</option>
                  <option value="pro">pro</option>
                  <option value="enterprise">enterprise</option>
                </select>
              </label>
              <label class="form-group">
                <span>Color tema</span>
                <input type="text" [(ngModel)]="tenantForm.color_tema" placeholder="#C40016" />
              </label>
              <label class="form-group">
                <span>Estado</span>
                <select [(ngModel)]="tenantForm.estado">
                  <option value="activo">activo</option>
                  <option value="suspendido">suspendido</option>
                  <option value="pendiente">pendiente</option>
                </select>
              </label>
              <label class="form-group switch-group">
                <span>Activo</span>
                <input type="checkbox" [(ngModel)]="tenantForm.activo" />
              </label>
            </div>
            <div class="panel-actions">
              @if (createTenantError()) { <span class="feedback-error">{{ createTenantError() }}</span> }
              @if (createTenantSuccess()) { <span class="feedback-ok">{{ createTenantSuccess() }}</span> }
              <button class="btn-primary" [disabled]="isSavingTenant() || !tenantForm.nombre.trim()" (click)="createTenant()">
                {{ isSavingTenant() ? 'Creando...' : 'Crear tenant' }}
              </button>
            </div>
          </section>

          <section class="panel card list-panel">
            <div class="panel-title">
              <div>
                <h2>Tenants registrados</h2>
                <p>Seleccione un tenant para administrar sus usuarios.</p>
              </div>
            </div>
            <div class="tenant-list">
              @for (tenant of tenants(); track tenant.id) {
                <button type="button" class="tenant-item"
                  [class.active]="selectedTenantId() === tenant.id"
                  (click)="selectTenant(tenant)">
                  <span class="dot" [style.backgroundColor]="tenant.color_tema"></span>
                  <div class="tenant-info">
                    <strong>{{ tenant.nombre }}</strong>
                    <small>{{ tenant.plan }} · {{ tenant.estado }} · {{ tenant.activo ? 'activo' : 'inactivo' }}</small>
                  </div>
                </button>
              }
            </div>
          </section>

          <section class="panel card user-panel">
            <div class="panel-title">
              <div><h2>Crear usuario del tenant</h2></div>
            </div>
            @if (selectedTenant()) {
              <div class="tenant-context-bar"
                [style.background]="selectedTenant()!.color_tema + '18'"
                [style.border-color]="selectedTenant()!.color_tema + '55'">
                <span class="tenant-context-dot" [style.background]="selectedTenant()!.color_tema"></span>
                <strong [style.color]="selectedTenant()!.color_tema">{{ selectedTenant()!.nombre }}</strong>
                <span class="tenant-context-hint">— selecciona otro tenant en la lista para cambiar</span>
              </div>
              <div class="form-grid">
                <label class="form-group">
                  <span>Nombre</span>
                  <input type="text" [(ngModel)]="userForm.nombre" placeholder="Nombre" />
                </label>
                <label class="form-group">
                  <span>Apellidos</span>
                  <input type="text" [(ngModel)]="userForm.apellidos" placeholder="Apellidos" />
                </label>
                <label class="form-group">
                  <span>Correo</span>
                  <input type="email" [(ngModel)]="userForm.correo" placeholder="correo@ejemplo.com" />
                </label>
                <label class="form-group">
                  <span>Documento</span>
                  <input type="text" [(ngModel)]="userForm.documento_identidad" placeholder="CI / NIT" />
                </label>
                <label class="form-group">
                  <span>Teléfono</span>
                  <input type="text" [(ngModel)]="userForm.telefono" placeholder="Opcional" />
                </label>
                <label class="form-group">
                  <span>Contraseña</span>
                  <input type="password" [(ngModel)]="userForm.password" placeholder="Mínimo 8 caracteres" />
                </label>
                <label class="form-group full">
                  <span>Roles</span>
                  <div class="roles-grid">
                    @for (role of roles(); track role.id) {
                      <label class="role-chip">
                        <input type="checkbox" [checked]="isRoleSelected(role.id)" (change)="toggleRole(role.id)" />
                        <span>
                          <strong>{{ role.nombre }}</strong>
                          <small>{{ role.descripcion || 'Sin descripción' }}</small>
                        </span>
                      </label>
                    }
                  </div>
                </label>
              </div>
              <div class="panel-actions">
                @if (createUserError()) { <span class="feedback-error">{{ createUserError() }}</span> }
                @if (createUserSuccess()) { <span class="feedback-ok">{{ createUserSuccess() }}</span> }
                <button class="btn-primary" [disabled]="isSavingUser() || !userForm.nombre.trim() || !userForm.correo.trim() || !userForm.password.trim()" (click)="createTenantUser()">
                  {{ isSavingUser() ? 'Guardando...' : 'Crear usuario' }}
                </button>
              </div>
            } @else {
              <div class="tenant-context-bar tenant-context-empty">
                <span class="material-icons-round">info</span>
                Selecciona un tenant en la lista de la derecha para crear usuarios.
              </div>
            }
          </section>

          @if (selectedTenant()) {
            <section class="panel card users-panel">
              <div class="panel-title">
                <div>
                  <h2>Usuarios del tenant</h2>
                  <p>Usuarios registrados para {{ selectedTenant()?.nombre }}</p>
                </div>
              </div>
              <div class="users-table">
                <div class="users-row users-head">
                  <span>Usuario</span>
                  <span>Documento</span>
                  <span>Roles</span>
                  <span>Estado</span>
                </div>
                @for (user of usersForSelectedTenant(); track user.id) {
                  <div class="users-row">
                    <span>{{ user.nombre }} {{ user.apellidos }}</span>
                    <span>{{ user.documento_identidad }}</span>
                    <span class="role-tags">
                      @for (role of user.roles; track role.id) {
                        <span class="tag">{{ role.nombre }}</span>
                      }
                    </span>
                    <span class="status" [class.active]="user.activo">{{ user.activo ? 'Activo' : 'Inactivo' }}</span>
                  </div>
                }
              </div>
            </section>
          }
        </div>
      } @else {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Cargando tenants...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .tenant-page { padding: 2rem; max-width: 1440px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
    .eyebrow { margin: 0 0 0.5rem; text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.75rem; color: var(--primary-red); font-weight: 800; }
    h1 { margin: 0; font-size: 2.2rem; color: var(--text-main); }
    .page-header p { margin: 0.5rem 0 0; color: var(--text-muted); }
    .header-action { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; border-radius: 18px; background: color-mix(in srgb, var(--surface-white) 90%, var(--primary-red) 10%); border: 1px solid var(--border-light); }
    .header-action .material-icons-round { color: var(--primary-red); font-size: 2rem; }
    .header-action strong { display: block; font-size: 1.4rem; color: var(--text-main); }
    .header-action small { color: var(--text-muted); }

    .layout-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
    .card { background: var(--surface-white); border-radius: 24px; padding: 1.5rem; border: 1px solid var(--border-light); box-shadow: 0 8px 24px rgba(0,0,0,0.04); }
    .create-panel, .user-panel { grid-column: 1 / 2; }
    .list-panel { grid-column: 2 / 3; }
    .users-panel { grid-column: 1 / -1; }
    .panel-title { margin-bottom: 1.25rem; }
    .panel-title h2 { margin: 0; font-size: 1.3rem; color: var(--text-main); }
    .panel-title p { margin: 0.35rem 0 0; color: var(--text-muted); }
    .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group span { font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
    .form-group input, .form-group textarea, .form-group select { border: 1px solid var(--border-light); border-radius: 14px; padding: 0.85rem 1rem; font: inherit; background: var(--surface-white); color: var(--text-main); }
    .form-group textarea { min-height: 110px; resize: vertical; }
    .full { grid-column: 1 / -1; }
    .switch-group { justify-content: flex-end; }
    .switch-group input { width: 20px; height: 20px; accent-color: var(--primary-red); }
    .panel-actions { display: flex; justify-content: flex-end; align-items: center; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap; }
    .feedback-error { font-size: 0.85rem; font-weight: 600; color: #c0392b; }
    .feedback-ok { font-size: 0.85rem; font-weight: 600; color: #2f855a; }
    .tenant-context-bar { display: flex; align-items: center; gap: 0.6rem; padding: 0.65rem 1rem; border-radius: 12px; border: 1.5px solid; margin-bottom: 1rem; font-size: 0.88rem; }
    .tenant-context-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .tenant-context-hint { color: var(--text-muted); font-size: 0.78rem; }
    .tenant-context-empty { background: #f5f5f5 !important; border-color: #ddd !important; color: var(--text-muted); gap: 0.4rem; }
    .btn-primary { border: none; background: var(--primary-red); color: #fff; padding: 0.9rem 1.4rem; border-radius: 14px; font-weight: 800; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
    .tenant-list { display: flex; flex-direction: column; gap: 0.8rem; }
    .tenant-item { display: flex; align-items: center; gap: 0.85rem; width: 100%; border: 1px solid var(--border-light); background: var(--surface-white); padding: 0.95rem 1rem; border-radius: 16px; cursor: pointer; text-align: left; transition: all 0.2s; }
    .tenant-item:hover, .tenant-item.active { border-color: var(--primary-red); transform: translateY(-1px); }
    .tenant-item .dot { width: 14px; height: 14px; border-radius: 999px; flex-shrink: 0; }
    .tenant-info { display: flex; flex-direction: column; min-width: 0; }
    .tenant-info strong { color: var(--text-main); }
    .tenant-info small { color: var(--text-muted); }
    .roles-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
    .role-chip { display: flex; gap: 0.75rem; align-items: flex-start; border: 1px solid var(--border-light); border-radius: 16px; padding: 0.85rem; background: color-mix(in srgb, var(--surface-white) 94%, var(--primary-red) 6%); cursor: pointer; }
    .role-chip input { margin-top: 0.2rem; accent-color: var(--primary-red); }
    .role-chip span { display: flex; flex-direction: column; min-width: 0; }
    .role-chip strong { color: var(--text-main); font-size: 0.92rem; }
    .role-chip small { color: var(--text-muted); font-size: 0.72rem; }
    .users-table { display: flex; flex-direction: column; gap: 0.7rem; }
    .users-row { display: grid; grid-template-columns: 1.6fr 1fr 1.2fr 0.6fr; gap: 0.75rem; align-items: center; padding: 0.85rem 1rem; border-radius: 14px; border: 1px solid var(--border-light); background: var(--surface-white); }
    .users-head { background: color-mix(in srgb, var(--surface-white) 88%, var(--primary-red) 12%); font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); }
    .role-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .tag { display: inline-flex; align-items: center; padding: 0.2rem 0.55rem; border-radius: 999px; background: color-mix(in srgb, var(--primary-red) 10%, transparent); color: var(--primary-red); font-size: 0.75rem; font-weight: 700; }
    .status { font-weight: 700; color: #a94442; }
    .status.active { color: #2f855a; }
    .loading-state { text-align: center; padding: 4rem 2rem; }
    .spinner { width: 42px; height: 42px; border: 4px solid #eee; border-top-color: var(--primary-red); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 1024px) {
      .layout-grid { grid-template-columns: 1fr; }
      .create-panel, .user-panel, .list-panel, .users-panel { grid-column: 1 / -1; }
    }

    @media (max-width: 720px) {
      .page-header { flex-direction: column; align-items: flex-start; }
      .form-grid, .roles-grid { grid-template-columns: 1fr; }
      .users-row { grid-template-columns: 1fr; }
      .users-head { display: none; }
    }
  `]
})
export class TenantManagement implements OnInit {
  tenants = signal<TenantRead[]>([]);
  roles = signal<RoleRead[]>([]);
  users = signal<UserReadDetail[]>([]);
  selectedTenantId = signal<number | null>(null);
  isLoading = signal(true);
  isSavingTenant = signal(false);
  isSavingUser = signal(false);
  createTenantError = signal('');
  createTenantSuccess = signal('');
  createUserError = signal('');
  createUserSuccess = signal('');

  tenantForm: TenantCreate = {
    nombre: '',
    descripcion: '',
    estado: 'activo',
    activo: true,
    plan: 'standard',
    color_tema: '#C40016',
  };

  userForm: AdminUserCreate = {
    tenant_id: 0,
    nombre: '',
    apellidos: '',
    correo: '',
    telefono: '',
    documento_identidad: '',
    password: '',
    rol: 'cliente',
    role_ids: [],
    activo: true,
  };

  activeTenants = computed(() => this.tenants().filter(tenant => tenant.activo));
  selectedTenant = computed(() => this.tenants().find(tenant => tenant.id === this.selectedTenantId()) || null);
  usersForSelectedTenant = computed(() => {
    const tenantId = this.selectedTenantId();
    if (!tenantId) return [];
    return this.users().filter(user => user.tenant_id === tenantId);
  });

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    forkJoin({
      tenants: this.adminService.listTenants(),
      roles: this.adminService.listRoles(),
      users: this.adminService.listUsers(),
    }).subscribe({
      next: ({ tenants, roles, users }) => {
        this.tenants.set(tenants);
        this.roles.set(roles);
        this.users.set(users);
        const initialTenant = tenants.find(tenant => tenant.activo) || tenants[0] || null;
        if (initialTenant) {
          this.selectTenant(initialTenant);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.tenants.set([]);
        this.roles.set([]);
        this.users.set([]);
        this.isLoading.set(false);
      },
    });
  }

  selectTenant(tenant: TenantRead): void {
    this.selectedTenantId.set(tenant.id);
    this.userForm.tenant_id = tenant.id;
  }

  createTenant(): void {
    if (this.isSavingTenant() || !this.tenantForm.nombre.trim()) return;
    this.isSavingTenant.set(true);
    this.createTenantError.set('');
    this.createTenantSuccess.set('');
    this.adminService.createTenant(this.tenantForm).subscribe({
      next: (tenant) => {
        this.tenants.update(list => [...list, tenant].sort((a, b) => a.id - b.id));
        this.selectTenant(tenant);
        this.tenantForm = {
          nombre: '',
          descripcion: '',
          estado: 'activo',
          activo: true,
          plan: 'standard',
          color_tema: '#C40016',
        };
        this.createTenantSuccess.set('Tenant creado exitosamente.');
        this.isSavingTenant.set(false);
      },
      error: (err) => {
        this.createTenantError.set(err?.error?.detail ?? 'Error al crear el tenant.');
        this.isSavingTenant.set(false);
      },
    });
  }

  isRoleSelected(roleId: number): boolean {
    return this.userForm.role_ids?.includes(roleId) ?? false;
  }

  toggleRole(roleId: number): void {
    const current = this.userForm.role_ids ?? [];
    this.userForm.role_ids = current.includes(roleId)
      ? current.filter(id => id !== roleId)
      : [...current, roleId];
  }

  createTenantUser(): void {
    if (this.isSavingUser() || !this.userForm.tenant_id || !this.userForm.nombre.trim() || !this.userForm.correo.trim() || !this.userForm.password.trim()) {
      return;
    }

    this.isSavingUser.set(true);
    this.createUserError.set('');
    this.createUserSuccess.set('');
    this.adminService.createUser(this.userForm).subscribe({
      next: (user) => {
        this.users.update(list => [user, ...list]);
        this.userForm = {
          tenant_id: this.userForm.tenant_id,
          nombre: '',
          apellidos: '',
          correo: '',
          telefono: '',
          documento_identidad: '',
          password: '',
          rol: 'cliente',
          role_ids: [],
          activo: true,
        };
        this.createUserSuccess.set('Usuario creado exitosamente.');
        this.isSavingUser.set(false);
      },
      error: (err) => {
        this.createUserError.set(err?.error?.detail ?? 'Error al crear el usuario.');
        this.isSavingUser.set(false);
      },
    });
  }
}
