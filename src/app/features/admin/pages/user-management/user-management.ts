import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { UserReadDetail, RoleRead } from '../../../../core/models/api.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <h1>Gestión de Usuarios</h1>
        <p>Administre las cuentas de clientes, talleres y operadores del sistema.</p>
      </header>

      <div class="filters card">
        <div class="search-box">
          <span class="material-icons-round">search</span>
          <input type="text" placeholder="Buscar por nombre, correo o documento..." [(ngModel)]="searchTerm">
        </div>
      </div>

      <div class="table-container card">
        <table *ngIf="!isLoading(); else loadingTpl">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Documento</th>
              <th>Roles</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of filteredUsers()">
              <td>
                <div class="user-info">
                  <span class="name">{{ user.nombre }} {{ user.apellidos }}</span>
                  <span class="email">{{ user.correo }}</span>
                </div>
              </td>
              <td>{{ user.documento_identidad }}</td>
              <td>
                <div class="roles-list">
                  <span class="role-badge" *ngFor="let role of user.roles">{{ role.nombre }}</span>
                </div>
              </td>
              <td>
                <span class="status-badge" [class.active]="user.activo">
                  {{ user.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-icon" (click)="toggleStatus(user)" [title]="user.activo ? 'Desactivar' : 'Activar'">
                  <span class="material-icons-round">{{ user.activo ? 'block' : 'check_circle' }}</span>
                </button>
                <button class="btn-icon" (click)="editRoles(user)" title="Gestionar Roles">
                  <span class="material-icons-round">manage_accounts</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para Roles -->
    <div class="modal-overlay" *ngIf="selectedUser()">
      <div class="modal card">
        <h3>Gestionar Roles: {{ selectedUser()?.nombre }}</h3>
        <p>Seleccione los roles que desea asignar a este usuario.</p>
        
        <div class="roles-grid">
          <div class="role-option" *ngFor="let role of allRoles()">
            <label>
              <input type="checkbox" [checked]="hasRole(selectedUser()!, role.id)" (change)="toggleRole(selectedUser()!, role.id)">
              {{ role.nombre }}
            </label>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" (click)="selectedUser.set(null)">Cerrar</button>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .admin-page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; h1 { font-size: 2rem; font-weight: 800; color: #1a202c; } p { color: #718096; } }
    .card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #edf2f7; margin-bottom: 1.5rem; }
    
    .filters .search-box {
      display: flex; align-items: center; gap: 0.8rem; background: #f7fafc; padding: 0.8rem 1.2rem; border-radius: 8px; border: 1px solid #e2e8f0;
      input { border: none; background: transparent; width: 100%; font-size: 1rem; outline: none; }
      .material-icons-round { color: #a0aec0; }
    }

    .table-container { overflow-x: auto; padding: 0; }
    table { width: 100%; border-collapse: collapse; text-align: left;
      th { padding: 1.2rem 1.5rem; background: #f8fafc; color: #64748b; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; border-bottom: 1px solid #edf2f7; }
      td { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    }

    .user-info { display: flex; flex-direction: column; .name { font-weight: 700; color: #2d3748; } .email { font-size: 0.85rem; color: #718096; } }
    .roles-list { display: flex; flex-wrap: wrap; gap: 0.4rem; .role-badge { padding: 2px 8px; background: #ebf8ff; color: #2b6cb0; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; } }
    
    .status-badge {
      padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: #feb2b2; color: #9b2c2c;
      &.active { background: #c6f6d5; color: #22543d; }
    }

    .btn-icon { background: none; border: none; color: #718096; cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s; &:hover { background: #edf2f7; color: #3182ce; } }
    .actions { display: flex; gap: 0.5rem; }

    /* MODAL */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { width: 90%; max-width: 500px; .roles-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0; } label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; } }
    .modal-actions { display: flex; justify-content: flex-end; }
    .btn-secondary { background: #edf2f7; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; }

    .loading-state { text-align: center; padding: 4rem; .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3182ce; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem; } }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class UserManagement implements OnInit {
  users = signal<UserReadDetail[]>([]);
  allRoles = signal<RoleRead[]>([]);
  isLoading = signal(true);
  searchTerm = '';
  selectedUser = signal<UserReadDetail | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.adminService.listUsers().subscribe(users => {
      this.users.set(users);
      this.isLoading.set(false);
    });
    this.adminService.listRoles().subscribe(roles => this.allRoles.set(roles));
  }

  filteredUsers() {
    if (!this.searchTerm) return this.users();
    const term = this.searchTerm.toLowerCase();
    return this.users().filter(u => 
      u.nombre.toLowerCase().includes(term) || 
      u.apellidos.toLowerCase().includes(term) || 
      u.correo.toLowerCase().includes(term) || 
      u.documento_identidad.includes(term)
    );
  }

  toggleStatus(user: UserReadDetail) {
    const newStatus = !user.activo;
    this.adminService.updateUser(user.id, { activo: newStatus }).subscribe(() => {
      this.users.update(list => list.map(u => u.id === user.id ? { ...u, activo: newStatus } : u));
    });
  }

  editRoles(user: UserReadDetail) {
    this.selectedUser.set(user);
  }

  hasRole(user: UserReadDetail, roleId: number) {
    return user.roles.some(r => r.id === roleId);
  }

  toggleRole(user: UserReadDetail, roleId: number) {
    // In a real app, this would call assignRoleToUser or a removeRole endpoint
    this.adminService.assignRoleToUser(user.id, roleId).subscribe(updatedUser => {
      this.users.update(list => list.map(u => u.id === user.id ? updatedUser : u));
      this.selectedUser.set(updatedUser);
    });
  }
}
