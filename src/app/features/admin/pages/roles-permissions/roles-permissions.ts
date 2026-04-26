import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { RoleRead, PermissionRead } from '../../../../core/models/api.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-roles-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <h1>Roles y Permisos</h1>
        <p>Defina los niveles de acceso y permisos específicos para cada tipo de usuario.</p>
      </header>

      <div class="grid-layout">
        <!-- Roles List -->
        <section class="roles-section">
          <div class="section-card card">
            <div class="section-header">
              <h2>Roles Definidos</h2>
              <button class="btn-primary" (click)="showCreateRole = true">Nuevo Rol</button>
            </div>
            <div class="roles-list">
              <div class="role-item" *ngFor="let role of roles()" [class.active]="selectedRole()?.id === role.id" (click)="selectedRole.set(role)">
                <div class="role-main">
                  <span class="role-name">{{ role.nombre }}</span>
                  <span class="role-desc">{{ role.descripcion }}</span>
                </div>
                <span class="perm-count">{{ role.permisos.length || 0 }} permisos</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Permissions Detail -->
        <section class="permissions-section">
          <div class="section-card card" *ngIf="selectedRole(); else noRoleTpl">
            <div class="section-header">
              <h3>Permisos de: {{ selectedRole()?.nombre }}</h3>
              <p>Habilite o deshabilite permisos para este rol.</p>
            </div>
            
            <div class="permissions-grid">
              <div class="perm-item" *ngFor="let perm of allPermissions()">
                <label class="checkbox-container">
                  <input type="checkbox" [checked]="hasPermission(perm.id)" (change)="togglePermission(perm.id)">
                  <div class="perm-content">
                    <span class="perm-name">{{ perm.nombre }}</span>
                    <span class="perm-desc">{{ perm.descripcion }}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <ng-template #noRoleTpl>
            <div class="empty-state card">
              <span class="material-icons-round">security</span>
              <p>Seleccione un rol de la lista para gestionar sus permisos.</p>
            </div>
          </ng-template>
        </section>
      </div>
    </div>

    <!-- Modal Crear Rol -->
    <div class="modal-overlay" *ngIf="showCreateRole">
      <div class="modal card">
        <h3>Crear Nuevo Rol</h3>
        <div class="form-group">
          <label>Nombre del Rol</label>
          <input type="text" [(ngModel)]="newRole.nombre" placeholder="ej: supervisor_ventas">
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea [(ngModel)]="newRole.descripcion" placeholder="Explique para qué sirve este rol..."></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" (click)="showCreateRole = false">Cancelar</button>
          <button class="btn-primary" (click)="saveRole()">Crear Rol</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; h1 { font-size: 2rem; font-weight: 800; } p { color: #718096; } }
    .card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #edf2f7; }
    
    .grid-layout { display: grid; grid-template-columns: 400px 1fr; gap: 2rem; @media (max-width: 900px) { grid-template-columns: 1fr; } }
    
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; h2, h3 { margin: 0; font-weight: 800; color: #2d3748; } }
    
    .roles-list { display: flex; flex-direction: column; gap: 0.8rem; }
    .role-item {
      padding: 1rem; border-radius: 10px; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s; display: flex; justify-content: space-between; align-items: center;
      &:hover { border-color: #3182ce; background: #f7fafc; }
      &.active { border-color: #3182ce; background: #ebf8ff; .role-name { color: #2b6cb0; } }
      .role-main { display: flex; flex-direction: column; .role-name { font-weight: 700; text-transform: capitalize; } .role-desc { font-size: 0.8rem; color: #718096; } }
      .perm-count { font-size: 0.75rem; font-weight: 600; color: #718096; background: #edf2f7; padding: 2px 8px; border-radius: 4px; }
    }

    .permissions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
    .perm-item {
      padding: 1rem; border-radius: 8px; border: 1px solid #edf2f7; transition: background 0.2s;
      &:hover { background: #f8fafc; }
      .checkbox-container { display: flex; gap: 1rem; cursor: pointer; input { width: 1.2rem; height: 1.2rem; margin-top: 0.2rem; } }
      .perm-name { display: block; font-weight: 700; color: #2d3748; font-size: 0.95rem; }
      .perm-desc { display: block; font-size: 0.8rem; color: #718096; margin-top: 0.2rem; }
    }

    .btn-primary { background: #3182ce; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
    .btn-secondary { background: #edf2f7; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
    
    .empty-state { text-align: center; padding: 6rem 2rem; color: #a0aec0; .material-icons-round { font-size: 4rem; margin-bottom: 1rem; opacity: 0.3; } }

    /* MODAL */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { width: 90%; max-width: 450px; .form-group { margin-bottom: 1.2rem; label { display: block; font-weight: 600; margin-bottom: 0.4rem; color: #4a5568; } input, textarea { width: 100%; padding: 0.8rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 1rem; } textarea { height: 100px; resize: none; } } .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; } }
  `]
})
export class RolesPermissions implements OnInit {
  roles = signal<RoleRead[]>([]);
  allPermissions = signal<PermissionRead[]>([]);
  selectedRole = signal<RoleRead | null>(null);
  showCreateRole = false;
  newRole = { nombre: '', descripcion: '' };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.adminService.listRoles().subscribe(data => this.roles.set(data));
    this.adminService.listPermissions().subscribe(data => this.allPermissions.set(data));
  }

  hasPermission(permId: number) {
    return this.selectedRole()?.permisos?.some(p => p.id === permId);
  }

  togglePermission(permId: number) {
    const role = this.selectedRole();
    if (!role) return;

    this.adminService.assignPermissionToRole(role.id, permId).subscribe(updatedRole => {
      this.roles.update(list => list.map(r => r.id === role.id ? updatedRole : r));
      this.selectedRole.set(updatedRole);
    });
  }

  saveRole() {
    if (!this.newRole.nombre) return;
    this.adminService.createRole(this.newRole).subscribe(role => {
      this.roles.update(list => [...list, role]);
      this.showCreateRole = false;
      this.newRole = { nombre: '', descripcion: '' };
    });
  }
}
