import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  UserCreate,
  UserReadDetail,
  UserUpdate,
  RoleCreate,
  RoleRead,
  PermissionCreate,
  PermissionRead,
  AssignRoleRequest,
  AssignPermissionRequest,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE = `${environment.apiUrl}/api/v1/usuarios`;

  currentUser = signal<UserReadDetail | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.checkSession();
  }

  // ── Auth ──────────────────────────────────
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE}/login`, payload).pipe(
      tap(res => this.setSession(res))
    );
  }

  register(payload: UserCreate): Observable<UserReadDetail> {
    return this.http.post<UserReadDetail>(`${this.BASE}/register`, payload);
  }

  registerTecnico(payload: UserCreate): Observable<UserReadDetail> {
    return this.http.post<UserReadDetail>(`${this.BASE}/tecnicos/register`, payload);
  }

  listTecnicos(): Observable<UserReadDetail[]> {
    return this.http.get<UserReadDetail[]>(`${this.BASE}/tecnicos`);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string {
    return localStorage.getItem('userRole') || 'cliente';
  }

  // ── Usuarios ──────────────────────────────
  getMe(): Observable<UserReadDetail> {
    return this.http.get<UserReadDetail>(`${this.BASE}/me`);
  }

  listUsers(): Observable<UserReadDetail[]> {
    return this.http.get<UserReadDetail[]>(`${this.BASE}`);
  }

  getUser(id: number): Observable<UserReadDetail> {
    return this.http.get<UserReadDetail>(`${this.BASE}/${id}`);
  }

  updateUser(id: number, payload: UserUpdate): Observable<UserReadDetail> {
    return this.http.put<UserReadDetail>(`${this.BASE}/${id}`, payload);
  }

  assignRoleToUser(userId: number, payload: AssignRoleRequest): Observable<UserReadDetail> {
    return this.http.post<UserReadDetail>(`${this.BASE}/${userId}/roles`, payload);
  }

  // ── Roles ─────────────────────────────────
  listRoles(): Observable<RoleRead[]> {
    return this.http.get<RoleRead[]>(`${this.BASE}/roles`);
  }

  createRole(payload: RoleCreate): Observable<RoleRead> {
    return this.http.post<RoleRead>(`${this.BASE}/roles`, payload);
  }

  addPermissionToRole(roleId: number, payload: AssignPermissionRequest): Observable<RoleRead> {
    return this.http.post<RoleRead>(`${this.BASE}/roles/${roleId}/permisos`, payload);
  }

  // ── Permisos ──────────────────────────────
  listPermissions(): Observable<PermissionRead[]> {
    return this.http.get<PermissionRead[]>(`${this.BASE}/permisos`);
  }

  createPermission(payload: PermissionCreate): Observable<PermissionRead> {
    return this.http.post<PermissionRead>(`${this.BASE}/permisos`, payload);
  }

  // ── Internos ──────────────────────────────
  private setSession(auth: AuthResponse): void {
    localStorage.setItem('token', auth.access_token);
    localStorage.setItem('user', JSON.stringify(auth.user));
    if (auth.user.roles?.length) {
      localStorage.setItem('userRole', auth.user.roles[0].nombre);
    }

    // Priorizar `taller_id` devuelto por el backend (campo de primer nivel)
    const backendTallerId = (auth as AuthResponse & { taller_id?: number }).taller_id;
    if (backendTallerId !== undefined && backendTallerId !== null) {
      localStorage.setItem('taller_id', String(backendTallerId));
    } else {
      // Fallback: buscar dentro del user o usar heurística por rol
      const sessionUser = auth.user as UserReadDetail & { taller_id?: number; id_taller?: number };
      const existingTallerId = localStorage.getItem('taller_id');
      const resolvedTallerId = sessionUser.taller_id ?? sessionUser.id_taller;
      if (resolvedTallerId !== undefined && resolvedTallerId !== null) {
        localStorage.setItem('taller_id', String(resolvedTallerId));
      } else if (!existingTallerId && auth.user.roles?.length) {
        const roleName = auth.user.roles[0].nombre.toLowerCase();
        if (roleName === 'operador' || roleName === 'tecnico' || roleName === 'taller') {
          localStorage.setItem('taller_id', '1');
        }
      }
    }

    this.currentUser.set(auth.user);
    this.isAuthenticated.set(true);
  }

  private checkSession(): void {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    if (token && userJson) {
      try {
        this.currentUser.set(JSON.parse(userJson));
        this.isAuthenticated.set(true);
      } catch { /* ignore */ }
    }
  }
}
