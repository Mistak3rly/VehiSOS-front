import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  AdminUserCreate,
  TenantCreate,
  TenantRead,
  UserReadDetail, UserUpdate, 
  RoleRead, RoleCreate, 
  PermissionRead, PermissionCreate,
  AssignRoleRequest, AssignPermissionRequest
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly BASE = `${environment.apiUrl}/api/v1/usuarios`;
  private readonly TENANTS_BASE = `${environment.apiUrl}/api/v1/tenants`;

  constructor(private http: HttpClient) {}

  // USERS
  listUsers(): Observable<UserReadDetail[]> {
    return this.http.get<UserReadDetail[]>(this.BASE);
  }

  createUser(payload: AdminUserCreate): Observable<UserReadDetail> {
    return this.http.post<UserReadDetail>(`${this.BASE}/admin`, payload);
  }

  updateUser(id: number, payload: UserUpdate): Observable<UserReadDetail> {
    return this.http.put<UserReadDetail>(`${this.BASE}/${id}`, payload);
  }

  assignRoleToUser(userId: number, roleId: number): Observable<UserReadDetail> {
    return this.http.post<UserReadDetail>(`${this.BASE}/${userId}/roles`, { role_id: roleId });
  }

  // ROLES
  listRoles(): Observable<RoleRead[]> {
    return this.http.get<RoleRead[]>(`${this.BASE}/roles`);
  }

  createRole(payload: RoleCreate): Observable<RoleRead> {
    return this.http.post<RoleRead>(`${this.BASE}/roles`, payload);
  }

  assignPermissionToRole(roleId: number, permissionId: number): Observable<RoleRead> {
    return this.http.post<RoleRead>(`${this.BASE}/roles/${roleId}/permisos`, { permission_id: permissionId });
  }

  // PERMISSIONS
  listPermissions(): Observable<PermissionRead[]> {
    return this.http.get<PermissionRead[]>(`${this.BASE}/permisos`);
  }

  createPermission(payload: PermissionCreate): Observable<PermissionRead> {
    return this.http.post<PermissionRead>(`${this.BASE}/permisos`, payload);
  }

  // TENANTS
  listTenants(): Observable<TenantRead[]> {
    return this.http.get<TenantRead[]>(this.TENANTS_BASE);
  }

  listTenantsPublic(): Observable<TenantRead[]> {
    return this.http.get<TenantRead[]>(`${this.TENANTS_BASE}/public`);
  }

  createTenant(payload: TenantCreate): Observable<TenantRead> {
    return this.http.post<TenantRead>(this.TENANTS_BASE, payload);
  }

  // AUDIT (Simulated for now as backend lacks it)
  getAuditLogs(): Observable<any[]> {
    // This is a placeholder since the backend doesn't have an audit table yet
    return new Observable(observer => {
      observer.next([
        { id: 1, action: 'LOGIN', user: 'admin@vehisos.com', details: 'Inicio de sesión exitoso', date: new Date().toISOString() },
        { id: 2, action: 'UPDATE_ROLE', user: 'admin@vehisos.com', details: 'Se asignó rol técnico a usuario #4', date: new Date().toISOString() },
        { id: 3, action: 'APPROVE_WORKSHOP', user: 'admin@vehisos.com', details: 'Taller "Motores Ya" aprobado', date: new Date().toISOString() },
      ]);
      observer.complete();
    });
  }
}
