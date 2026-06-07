import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminUserCreate,
  AuditLogRead,
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

  // AUDIT
  getAuditLogs(filters?: {
    accion?: string;
    desde?: string;
    hasta?: string;
    usuario?: string;
    limit?: number;
    offset?: number;
  }): Observable<AuditLogRead[]> {
    let params = new HttpParams();
    if (filters?.accion) params = params.set('accion', filters.accion);
    if (filters?.desde) params = params.set('desde', filters.desde);
    if (filters?.hasta) params = params.set('hasta', filters.hasta);
    if (filters?.usuario) params = params.set('usuario', filters.usuario);
    if (filters?.limit != null) params = params.set('limit', filters.limit);
    if (filters?.offset != null) params = params.set('offset', filters.offset);
    return this.http.get<AuditLogRead[]>(`${environment.apiUrl}/api/v1/auditoria/logs`, { params });
  }
}
