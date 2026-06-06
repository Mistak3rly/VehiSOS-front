export interface UserReadDetail {
  id: number;
  tenant_id: number | null;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  documento_identidad: string;
  activo: boolean;
  roles: RoleRead[];
  tenant?: TenantRead | null;
}

export interface RoleRead {
  id: number;
  nombre: string;
  descripcion: string | null;
  permisos: PermissionRead[];
}

export interface PermissionRead {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserReadDetail;
  tenant?: TenantRead | null;
  tenant_id?: number | null;
  rol?: string | null;
  permisos?: string[];
}

export interface TenantRead {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: string;
  activo: boolean;
  plan: string;
  configuracion: Record<string, unknown>;
  color_tema: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface LoginRequest {
  identificador: string;
  password: string;
}
