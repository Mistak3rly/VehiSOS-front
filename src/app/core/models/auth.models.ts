export interface UserReadDetail {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  documento_identidad: string;
  activo: boolean;
  roles: RoleRead[];
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
}

export interface LoginRequest {
  identificador: string;
  password: string;
}
