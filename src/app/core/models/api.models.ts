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
  tenant_id: number | null;
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
  tenant?: TenantRead | null;
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

export interface TenantCreate {
  nombre: string;
  descripcion?: string;
  estado?: string;
  activo?: boolean;
  plan?: string;
  configuracion?: Record<string, unknown>;
  color_tema?: string;
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
  tenant_id?: number | null;
  nombre_dueno?: string;
  ci_dueno?: string;
}

export interface AdminUserCreate extends UserCreate {
  tenant_id: number;
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
  tenant_id?: number | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserReadDetail;
  tenant?: TenantRead | null;
  tenant_id?: number | null;
  rol?: string | null;
  permisos?: string[];
  taller_id?: number;
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
  id_taller_destino: number;
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
  tenant_id?: number | null;
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
  taller_nombre?: string | null;
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

// ─────────────────────────────────────────────
//  SISTEMA IA - DESEMPEÑO Y ESPECIALIDADES
// ─────────────────────────────────────────────

export interface DesempenoTallerRead {
  id: number;
  id_taller: number;
  id_incidente: number | null;
  tiempo_respuesta_minutos: number | null;
  tiempo_reparacion_minutos: number | null;
  tasa_exito: boolean | null;
  cliente_satisfecho: boolean | null;
  calificacion_cliente: number | null;
  comentarios_cliente: string | null;
  costo_servicio: number | null;
  costo_repuestos: number | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface DesempenoTallerCreate {
  id_taller: number;
  id_incidente?: number;
  tiempo_respuesta_minutos?: number;
  tiempo_reparacion_minutos?: number;
  tasa_exito?: boolean;
  cliente_satisfecho?: boolean;
  calificacion_cliente?: number;
  comentarios_cliente?: string;
  costo_servicio?: number;
  costo_repuestos?: number;
}

export interface EspecialidadVehiculoRead {
  id: number;
  id_taller: number;
  tipo_vehiculo: string;
  marca: string | null;
  modelo: string | null;
  reparaciones_exitosas: number;
  calificacion_promedio: number | null;
  dias_sin_falla: number | null;
  fecha_creacion: string;
}

export interface EspecialidadVehiculoCreate {
  id_taller: number;
  tipo_vehiculo: string;
  marca?: string;
  modelo?: string;
  reparaciones_exitosas?: number;
  calificacion_promedio?: number;
  dias_sin_falla?: number;
}

export interface FeedbackAsignacion {
  id_taller_asignado: number;
  satisfaccion_cliente: number;
  recomendacion_aceptada: boolean;
  comentarios?: string;
}

export interface WorkshopPerformanceMetrics {
  id_taller: number;
  total_servicios: number;
  calificacion_promedio: number | null;
  tiempo_promedio_reparacion_minutos: number | null;
  gasto_total: number;
}

export interface EspecialidadStats {
  tipo_vehiculo: string;
  marca: string | null;
  exitosas: number;
  rating: number | null;
  dias_sin_falla: number | null;
}

export interface DashboardAnalisisResponse {
  total_talleres: number;
  talleres_activos: number;
  rating_promedio_sistema: number;
  total_servicios_registrados: number;
  talleres_top: WorkshopPerformanceMetrics[];
  especialidades_demandadas: {
    tipo_vehiculo: string;
    count: number;
    rating_promedio: number;
  }[];
}

export interface AsignacionMultipleCandidatos {
  incidente_id: number;
  talleres: number[];
  max_intentos?: number;
  timeout_respuesta_minutos?: number;
}

// ─────────────────────────────────────────────
//  CU-019 SERVICIOS Y COBERTURA (SaaS)
// ─────────────────────────────────────────────

export interface ServicioSaaSCreate {
  nombre: string;
  categoria: string;
  descripcion?: string;
  activo?: boolean;
}

export interface ServicioSaaSUpdate {
  nombre?: string;
  categoria?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface ServicioSaaSRead {
  id: number;
  tenant_id: number;
  nombre: string;
  categoria: string;
  descripcion: string | null;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CoberturaSaaSCreate {
  zona: string;
  ciudad: string;
  radio_cobertura: number;
  disponible_24h?: boolean;
  descripcion?: string;
}

export interface CoberturaSaaSUpdate {
  zona?: string;
  ciudad?: string;
  radio_cobertura?: number;
  disponible_24h?: boolean;
  descripcion?: string;
}

export interface CoberturaSaaSRead {
  id: number;
  tenant_id: number;
  zona: string;
  ciudad: string;
  radio_cobertura: number;
  disponible_24h: boolean;
  descripcion: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// ─────────────────────────────────────────────
//  CU-025: COTIZACIONES
// ─────────────────────────────────────────────

export interface CotizacionCreate {
  id_incidente: number;
  descripcion_desperfecto: string;
  repuestos?: string;
  costo_repuestos?: number;
  costo_mano_obra: number;
  tiempo_estimado?: number;
  notas_adicionales?: string;
}

export interface CotizacionUpdate {
  descripcion_desperfecto?: string;
  repuestos?: string;
  costo_repuestos?: number;
  costo_mano_obra?: number;
  tiempo_estimado?: number;
  notas_adicionales?: string;
}

export interface CotizacionRespuesta {
  accion: 'aceptar' | 'rechazar';
  metodo_pago?: string;
  motivo_rechazo?: string;
}

export interface CotizacionRead {
  id: number;
  tenant_id: number;
  id_incidente: number;
  id_taller: number;
  id_cliente: number;
  descripcion_desperfecto: string;
  repuestos: string | null;
  costo_repuestos: number;
  costo_mano_obra: number;
  costo_total: number;
  comision_plataforma: number;
  tiempo_estimado: number | null;
  estado: 'pendiente' | 'enviada' | 'aceptada' | 'rechazada' | 'vencida' | 'pagada';
  metodo_pago: string | null;
  notas_adicionales: string | null;
  motivo_rechazo: string | null;
  fecha_creacion: string;
  fecha_respuesta: string | null;
  fecha_vencimiento: string | null;
}

// ─────────────────────────────────────────────
//  CU-026: KPI DASHBOARD
// ─────────────────────────────────────────────

export interface KPIGlobal {
  total_incidentes: number;
  total_cotizaciones: number;
  total_pagos: number;
  ingresos_totales: number;
  tiempo_respuesta_promedio_min: number;
  tasa_exito_global: number;
  incidentes_por_estado: Record<string, number>;
  incidentes_por_tenant: Record<string, number>;
  top_talleres: { id: number; nombre: string; servicios: number; rating: number }[];
  top_tecnicos: { id: number; nombre: string; atenciones: number; rating: number }[];
}

export interface KPITaller {
  taller_id: number;
  solicitudes_activas: number;
  solicitudes_finalizadas: number;
  solicitudes_canceladas: number;
  tiempo_promedio_respuesta_min: number;
  tiempo_promedio_llegada_min: number;
  tasa_exito: number;
  tasa_cancelacion: number;
  ingresos_generados: number;
  servicios_por_tipo: Record<string, number>;
  cotizaciones_aceptadas: number;
  cotizaciones_rechazadas: number;
}

// ─────────────────────────────────────────────
//  CU-027: RENDIMIENTO
// ─────────────────────────────────────────────

export interface RendimientoTecnico {
  tecnico_id: number;
  nombre: string;
  atenciones_asignadas: number;
  atenciones_completadas: number;
  atenciones_canceladas: number;
  tiempo_promedio_llegada_min: number;
  tiempo_promedio_resolucion_min: number;
  calificacion_promedio: number;
  nivel_cumplimiento: number;
}

export interface RendimientoTaller {
  taller_id: number;
  nombre: string;
  servicios_completados: number;
  tasa_exito: number;
  tiempo_promedio_respuesta_min: number;
  nivel_satisfaccion: number;
  ingresos_generados: number;
  sla_cumplido: number;
}

// ─────────────────────────────────────────────
//  CU-028: MAPA GEOGRÁFICO
// ─────────────────────────────────────────────

export interface PuntoMapa {
  id: number;
  latitud: number;
  longitud: number;
  tipo: string;
  prioridad: string;
  estado: string;
  titulo: string;
  fecha: string;
}

export interface DatosMapa {
  puntos: PuntoMapa[];
  agrupacion_por_tipo: Record<string, number>;
  agrupacion_por_estado: Record<string, number>;
}

// ─────────────────────────────────────────────
//  CU-029: REPORTES
// ─────────────────────────────────────────────

export interface ReporteOperativo {
  titulo: string;
  generado_en: string;
  filtros: Record<string, string>;
  datos: Record<string, unknown>;
  resumen: Record<string, unknown>;
}

// ─────────────────────────────────────────────
//  CU-030: RESUMEN FINAL
// ─────────────────────────────────────────────

export interface ResumenAsistenciaRead {
  id: number;
  tenant_id: number;
  id_incidente: number;
  id_cliente: number;
  id_taller: number | null;
  id_tecnico: number | null;
  diagnostico: string | null;
  resumen: Record<string, unknown>;
  codigo_auditoria: string;
  url_documento: string | null;
  fecha_generacion: string;
}

// ─────────────────────────────────────────────
//  AUDITORÍA
// ─────────────────────────────────────────────

export interface AuditLogRead {
  id: number;
  timestamp: string;
  usuario_id: number | null;
  usuario_identificador: string;
  accion: string;
  entidad_tipo: string | null;
  entidad_id: number | null;
  detalles: string | null;
  tenant_id: number | null;
  exitoso: boolean;
}

// ─────────────────────────────────────────────
//  CU-026: DASHBOARD KPI (NUEVO)
// ─────────────────────────────────────────────

export interface KPISummaryResponse {
  tiempo_promedio_asignacion_min: number;
  tiempo_promedio_llegada_min: number;
  total_incidentes: number;
  casos_cancelados: number;
  cumplimiento_sla_porcentaje: number;
}

export interface IncidentePorTipoResponse {
  tipo: string;
  cantidad: number;
}

export interface TallerEficienteResponse {
  taller_id: number;
  nombre_taller: string;
  tiempo_promedio_respuesta_min: number;
  servicios_finalizados: number;
}

export interface ZonaIncidenteResponse {
  zona: string;
  cantidad: number;
}

export interface CasosCanceladosDetalleResponse {
  motivo: string;
  cantidad: number;
}

export interface SLAResponse {
  servicios_dentro_sla: number;
  servicios_fuera_sla: number;
  porcentaje_cumplimiento: number;
}

export interface DashboardKPIResponse {
  resumen: KPISummaryResponse;
  incidentes_por_tipo: IncidentePorTipoResponse[];
  talleres_mas_eficientes: TallerEficienteResponse[];
  zonas_con_mas_incidentes: ZonaIncidenteResponse[];
  casos_cancelados_detalle: CasosCanceladosDetalleResponse[];
  sla: SLAResponse;
}

