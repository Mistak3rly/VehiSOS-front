// ─────────────────────────────────────────────
//  USUARIOS Y ACCESO
// ─────────────────────────────────────────────

export interface PermissionRead {
  id: number;
  nombre: string;
  descripcion: string | null;
  fecha_creacion: string;
}

export interface PermissionCreate {
  nombre: string;
  descripcion?: string;
}

export interface RoleRead {
  id: number;
  nombre: string;
  descripcion: string | null;
  fecha_creacion: string;
  permisos: PermissionRead[];
}

export interface RoleCreate {
  nombre: string;
  descripcion?: string;
  permission_ids?: number[];
}

export interface UserReadDetail {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  documento_identidad: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  roles: RoleRead[];
  nombre_dueno: string | null;
  ci_dueno: string | null;
  taller_id: number | null;
}

export interface UserCreate {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  documento_identidad: string;
  activo?: boolean;
  password: string;
  role_ids?: number[];
  rol?: 'cliente' | 'taller';
  nombre_dueno?: string;
  ci_dueno?: string;
}

export interface UserUpdate {
  nombre?: string;
  apellidos?: string;
  correo?: string;
  telefono?: string;
  documento_identidad?: string;
  password?: string;
  activo?: boolean;
}

export interface LoginRequest {
  identificador: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserReadDetail;
}

export interface AssignRoleRequest {
  role_id: number;
}

export interface AssignPermissionRequest {
  permission_id: number;
}


// ─────────────────────────────────────────────
//  VEHÍCULOS E INCIDENTES
// ─────────────────────────────────────────────

export interface VehiculoRead {
  id: number;
  id_usuario: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number | null;
  color: string | null;
  observaciones: string | null;
}

export interface VehiculoCreate {
  placa: string;
  marca: string;
  modelo: string;
  anio?: number;
  color?: string;
  observaciones?: string;
}

export interface VehiculoUpdate {
  placa?: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  color?: string;
  observaciones?: string;
}

export interface EstadoServicioRead {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  es_final: boolean;
}

export interface EstadoServicioCreate {
  codigo: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  es_final?: boolean;
}

export interface TipoIncidenteRead {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
}

export interface TipoIncidenteCreate {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface PrioridadRead {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  nivel: number;
}

export interface PrioridadCreate {
  codigo: string;
  nombre: string;
  descripcion?: string;
  nivel: number;
}

export interface EvidenciaCreate {
  tipo_evidencia: 'imagen' | 'audio' | 'texto';
  url_archivo?: string;
  nombre_archivo?: string;
  tipo_mime?: string;
  tamano_bytes?: number;
  contenido_texto?: string;
  texto_transcrito?: string;
  texto_extraido?: string;
  metadatos?: Record<string, unknown>;
}

export interface EvidenciaRead {
  id: number;
  id_incidente: number;
  id_usuario: number;
  tipo_evidencia: string;
  url_archivo: string | null;
  nombre_archivo: string | null;
  tipo_mime: string | null;
  tamano_bytes: number | null;
  contenido_texto: string | null;
  texto_transcrito: string | null;
  texto_extraido: string | null;
  metadatos: Record<string, unknown>;
  fecha_creacion: string;
}

export interface HistorialRead {
  id: number;
  id_incidente: number;
  id_usuario_actor: number | null;
  id_estado_anterior: number | null;
  id_estado_nuevo: number | null;
  tipo_evento: string;
  descripcion: string | null;
  datos_evento: Record<string, unknown>;
  fecha_creacion: string;
}

export interface IncidenteCreate {
  id_vehiculo: number;
  id_tipo_incidente?: number;
  id_prioridad?: number;
  titulo: string;
  descripcion_texto?: string;
  referencia_ubicacion?: string;
  direccion_textual?: string;
  latitud: number;
  longitud: number;
  requiere_grua?: boolean;
  tiempo_estimado_llegada?: number;
  evidencias?: EvidenciaCreate[];
}

export interface IncidenteEstadoUpdate {
  estado_codigo: string;
  descripcion?: string;
  tiempo_estimado_llegada?: number;
}

export interface IncidenteRead {
  id: number;
  id_cliente: number;
  id_vehiculo: number;
  id_estado_servicio: number;
  id_tipo_incidente: number | null;
  id_prioridad: number | null;
  codigo_incidente: string;
  titulo: string;
  descripcion_texto: string | null;
  referencia_ubicacion: string | null;
  direccion_textual: string | null;
  latitud: number;
  longitud: number;
  requiere_grua: boolean;
  tiempo_estimado_llegada: number | null;
  fecha_reporte: string;
  fecha_cierre: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado_servicio: EstadoServicioRead;
  tipo_incidente: TipoIncidenteRead | null;
  prioridad: PrioridadRead | null;
  vehiculo: VehiculoRead;
  evidencias: EvidenciaRead[];
  historial: HistorialRead[];
}


// ─────────────────────────────────────────────
//  INTELIGENCIA IA
// ─────────────────────────────────────────────

export interface AnalisisIARead {
  id: number;
  id_incidente: number;
  id_evidencia: number | null;
  tipo_analisis: string;
  modelo_usado: string | null;
  resultado: Record<string, unknown>;
  nivel_confianza: number | null;
  fecha_creacion: string;
}

export interface TranscripcionAudioResponse {
  incidente_id: number;
  texto_transcrito: string;
  confianza: number;
  analisis: AnalisisIARead;
}

export interface ExtraccionInfoResponse {
  incidente_id: number;
  entidades: Record<string, unknown>;
  palabras_clave: string[];
  analisis: AnalisisIARead;
}

export interface ClasificacionIncidenteResponse {
  incidente_id: number;
  tipo_sugerido: string;
  confianza: number;
  analisis: AnalisisIARead;
}

export interface AnalisisImagenesResponse {
  incidente_id: number;
  hallazgos: string[];
  confianza: number;
  analisis: AnalisisIARead;
}

export interface ResumenPriorizacionResponse {
  incidente_id: number;
  resumen: string;
  tipo_sugerido: string;
  prioridad_sugerida: string;
  confianza: number;
  analisis: AnalisisIARead;
}

export interface TallerCandidatoIn {
  id_taller: number;
  nombre: string;
  latitud: number;
  longitud: number;
  disponible?: boolean;
  capacidad_disponible?: number;
  especialidades?: string[];
}

export interface AsignacionInteligenteRequest {
  talleres: TallerCandidatoIn[];
}

export interface TallerRecomendadoOut {
  id_taller: number;
  nombre: string;
  distancia_km: number;
  puntaje: number;
  razones: string[];
}

export interface AsignacionInteligenteResponse {
  incidente_id: number;
  mejor_taller: TallerRecomendadoOut;
  ranking: TallerRecomendadoOut[];
  criterios: Record<string, unknown>;
  analisis: AnalisisIARead;
}

export interface WorkshopSuggestionIn {
  name: string;
  address?: string;
  distanceKm?: number;
  rating?: number;
  priceTier?: string;
  reasons?: string[];
  latitude: number;
  longitude: number;
  isOpen?: boolean;
}

export interface WorkshopAssistantRequest {
  issue: string;
  userLatitude: number;
  userLongitude: number;
  candidates: WorkshopSuggestionIn[];
}

export interface WorkshopAssistantResponse {
  assistantText: string;
  recommendations: WorkshopSuggestionIn[];
  provider: string;
  model: string | null;
  fallback: boolean;
}

export interface TrazabilidadCombinadaResponse {
  incidente: IncidenteRead;
  analisis: AnalisisIARead[];
  resumen: Record<string, unknown>;
}


// ─────────────────────────────────────────────
//  LOGÍSTICA, TALLERES Y FINANZAS
// ─────────────────────────────────────────────

export interface TallerRead {
  id: number;
  id_propietario: number;
  nombre: string;
  nit: string | null;
  correo: string | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  latitud: number | null;
  longitud: number | null;
  capacidad_maxima: number;
  porcentaje_comision: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface TallerCreate {
  nombre: string;
  nit?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  latitud?: number;
  longitud?: number;
  capacidad_maxima?: number;
  porcentaje_comision?: number;
  activo?: boolean;
}

export interface TallerUpdate {
  nombre?: string;
  nit?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  latitud?: number;
  longitud?: number;
  capacidad_maxima?: number;
  porcentaje_comision?: number;
  activo?: boolean;
}

export interface PersonalTallerRead {
  id: number;
  id_taller: number;
  id_usuario: number;
  tipo_personal: string;
  disponible: boolean;
  latitud_actual: number | null;
  longitud_actual: number | null;
  fecha_asignacion: string;
  nombre_usuario: string | null;
  apellidos_usuario: string | null;
  telefono_usuario: string | null;
  correo_usuario: string | null;
}

export interface PersonalTallerCreate {
  id_usuario: number;
  tipo_personal: string;
  disponible?: boolean;
  latitud_actual?: number;
  longitud_actual?: number;
}

export interface PersonalTallerUpdate {
  tipo_personal?: string;
  disponible?: boolean;
  latitud_actual?: number;
  longitud_actual?: number;
}

export interface SolicitudDisponibleRead {
  id_incidente: number;
  codigo_incidente: string;
  titulo: string;
  fecha_reporte: string;
  id_prioridad: number | null;
  prioridad_codigo: string | null;
  id_tipo_incidente: number | null;
  tipo_codigo: string | null;
}

export interface AsignacionCreate {
  id_incidente: number;
  id_taller: number;
  id_personal_taller?: number;
  puntaje_asignacion?: number;
  distancia_km?: number;
  tiempo_estimado_llegada?: number;
  observaciones?: string;
}

export interface AsignacionRespuestaRequest {
  accion: 'aceptar' | 'rechazar' | 'cancelar' | 'completar';
  id_personal_taller?: number;
  tiempo_estimado_llegada?: number;
  observaciones?: string;
}

export interface AsignacionRead {
  id: number;
  id_incidente: number;
  id_taller: number;
  id_personal_taller: number | null;
  estado_asignacion: string;
  puntaje_asignacion: number | null;
  distancia_km: number | null;
  tiempo_estimado_llegada: number | null;
  fecha_asignacion: string;
  fecha_respuesta: string | null;
  observaciones: string | null;
}

export interface PagoCreate {
  id_incidente: number;
  id_taller: number;
  monto_total: number;
  metodo_pago?: string;
  estado_pago?: 'pendiente' | 'pagado' | 'fallido' | 'reembolsado';
  fecha_pago?: string;
}

export interface PagoRead {
  id: number;
  id_incidente: number;
  id_taller: number;
  monto_total: number;
  monto_comision: number;
  estado_pago: string;
  metodo_pago: string | null;
  fecha_pago: string | null;
  fecha_creacion: string;
}

export interface RegistrarCobroTecnicoRequest {
  id_incidente: number;
  diagnostico: string;
  observaciones?: string;
  costo_servicio: number;
}

export interface ResumenFinancieroRead {
  total_transacciones: number;
  total_monto: number;
  total_comision: number;
  total_neto_taller: number;
  total_pagado: number;
  total_pendiente: number;
}

export interface NotificacionRead {
  id: number;
  id_usuario: number;
  id_incidente: number | null;
  canal: string;
  titulo: string;
  mensaje: string;
  estado: string;
  fecha_envio: string | null;
  fecha_lectura: string | null;
  fecha_creacion: string;
}

export interface NotificacionTestCreate {
  titulo: string;
  mensaje: string;
  canal?: 'in_app' | 'push' | 'email' | 'sms';
  id_incidente?: number;
  target_user_id?: number;
}
