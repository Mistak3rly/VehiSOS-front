import {
  AnalisisIARead,
  AsignacionInteligenteRequest,
  AsignacionInteligenteResponse,
  AsignacionRead,
  AuthResponse,
  DashboardAnalisisResponse,
  DesempenoTallerRead,
  EstadoServicioRead,
  FeedbackAsignacion,
  HistorialRead,
  IncidenteCreate,
  IncidenteEstadoUpdate,
  IncidenteRead,
  LoginRequest,
  NotificacionRead,
  PagoRead,
  PermissionCreate,
  PermissionRead,
  PrioridadCreate,
  PrioridadRead,
  RoleCreate,
  RoleRead,
  SolicitudDisponibleRead,
  EspecialidadVehiculoRead,
  TallerCreate,
  TallerRead,
  TallerUpdate,
  TipoIncidenteRead,
  TranscripcionAudioResponse,
  ExtraccionInfoResponse,
  ClasificacionIncidenteResponse,
  AnalisisImagenesResponse,
  ResumenPriorizacionResponse,
  TrazabilidadCombinadaResponse,
  AdminUserCreate,
  UserCreate,
  UserReadDetail,
  UserUpdate,
  VehiculoCreate,
  VehiculoRead,
  VehiculoUpdate,
  WorkshopAssistantRequest,
  WorkshopAssistantResponse,
  WorkshopPerformanceMetrics,
  WorkshopSuggestionIn,
  AsignacionCreate,
  AsignacionRespuestaRequest,
  PersonalTallerCreate,
  PersonalTallerRead,
  PersonalTallerUpdate,
  PagoCreate,
  RegistrarCobroTecnicoRequest,
  ResumenFinancieroRead,
  EvidenciaCreate,
  EvidenciaRead,
  TallerCandidatoIn,
  AssignRoleRequest,
  AssignPermissionRequest,
  TrazabilidadCombinadaResponse as TrazabilidadResponse,
  TenantRead,
} from '../models/api.models';

type DemoRole = RoleRead & { permiso_ids?: number[] };
type DemoVehicle = VehiculoRead & { tipo_vehiculo: string; propietario: string };
type DemoWorkshop = TallerRead & { rating_promedio: number };

interface DemoDb {
  roles: DemoRole[];
  permissions: PermissionRead[];
  users: UserReadDetail[];
  vehicles: DemoVehicle[];
  talleres: DemoWorkshop[];
  estados: EstadoServicioRead[];
  tiposIncidente: TipoIncidenteRead[];
  prioridades: PrioridadRead[];
  incidences: IncidenteRead[];
  analyses: AnalisisIARead[];
  asignaciones: AsignacionRead[];
  pagos: PagoRead[];
  notificaciones: NotificacionRead[];
  historialDesempeno: DesempenoTallerRead[];
  especialidades: EspecialidadVehiculoRead[];
  personal: PersonalTallerRead[];
  tenants: TenantRead[];
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const nowIso = () => new Date().toISOString();
const seedDate = new Date('2025-04-01T12:00:00.000Z');

const tenantsSeed: TenantRead[] = [
  {
    id: 1,
    nombre: 'Tenant Principal',
    descripcion: 'Tenant base de compatibilidad para VehiSOS',
    estado: 'activo',
    activo: true,
    plan: 'standard',
    configuracion: { tema: 'rojo' },
    color_tema: '#C40016',
    fecha_creacion: seedDate.toISOString(),
    fecha_actualizacion: seedDate.toISOString(),
  },
];

const rolesSeed = [
  { id: 1, nombre: 'administrador', descripcion: 'Administración general del sistema' },
  { id: 2, nombre: 'taller', descripcion: 'Operador del taller' },
  { id: 3, nombre: 'tecnico', descripcion: 'Personal técnico de campo' },
  { id: 4, nombre: 'cliente', descripcion: 'Cliente final' },
];

const permissionsSeed = [
  'usuarios.leer', 'usuarios.escribir', 'talleres.aprobar', 'emergencias.gestionar',
  'asignacion.analizar', 'finanzas.ver', 'auditoria.ver', 'notificaciones.enviar',
].map((nombre, index) => ({
  id: index + 1,
  nombre,
  descripcion: nombre.replaceAll('.', ' ').toUpperCase(),
  fecha_creacion: seedDate.toISOString(),
}));

const estadosSeed: EstadoServicioRead[] = [
  { id: 1, codigo: 'pendiente', nombre: 'Pendiente', descripcion: 'Caso registrado', orden: 1, es_final: false },
  { id: 2, codigo: 'asignado', nombre: 'Asignado', descripcion: 'Asignado a taller', orden: 2, es_final: false },
  { id: 3, codigo: 'en_proceso', nombre: 'En Proceso', descripcion: 'Atención activa', orden: 3, es_final: false },
  { id: 4, codigo: 'completado', nombre: 'Completado', descripcion: 'Caso resuelto', orden: 4, es_final: true },
  { id: 5, codigo: 'cancelado', nombre: 'Cancelado', descripcion: 'Caso cancelado', orden: 5, es_final: true },
];

const tiposSeed: TipoIncidenteRead[] = [
  { id: 1, codigo: 'mecanico', nombre: 'Mecánico', descripcion: 'Avería mecánica' },
  { id: 2, codigo: 'electrico', nombre: 'Eléctrico', descripcion: 'Falla eléctrica' },
  { id: 3, codigo: 'llanta', nombre: 'Llanta', descripcion: 'Problema en ruedas o neumáticos' },
  { id: 4, codigo: 'accidente', nombre: 'Accidente', descripcion: 'Siniestro vehicular' },
  { id: 5, codigo: 'carroceria', nombre: 'Carrocería', descripcion: 'Daño exterior' },
];

const prioridadesSeed: PrioridadRead[] = [
  { id: 1, codigo: 'critica', nombre: 'Crítica', descripcion: 'Atención inmediata', nivel: 4 },
  { id: 2, codigo: 'alta', nombre: 'Alta', descripcion: 'Alta prioridad', nivel: 3 },
  { id: 3, codigo: 'media', nombre: 'Media', descripcion: 'Prioridad estándar', nivel: 2 },
  { id: 4, codigo: 'baja', nombre: 'Baja', descripcion: 'Puede esperar', nivel: 1 },
];

const workshopNames = [
  'Motores del Oriente', 'Ruedas Express', 'ElectroCar', 'Taller Central',
  'Santa Cruz Service', 'AutoFix Plus', 'Mecánica 24/7', 'Carrocerías Bolivia',
  'TurboLab', 'Frenos y Más', 'DiagAuto', 'Premium Garage',
];

const workshopCities = ['Santa Cruz', 'La Paz', 'Cochabamba', 'Tarija', 'Sucre', 'Oruro'];
const vehicleTypes = ['Sedán', 'SUV', 'Pickup', 'Camioneta', 'Motocicleta', 'Hatchback'];
const brands = ['Toyota', 'Suzuki', 'Hyundai', 'Kia', 'Nissan', 'Chevrolet', 'Ford', 'Honda'];
const models = ['Corolla', 'Vitara', 'Tucson', 'Sportage', 'Frontier', 'Spark', 'Ranger', 'Civic'];
const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Sofía', 'Pedro', 'Valeria', 'Jorge', 'Camila'];
const lastNames = ['Pérez', 'Gutiérrez', 'Mendoza', 'López', 'Fernández', 'Rojas', 'Torrez', 'Flores'];
const incidentTitles = [
  'Falla de motor', 'Pinchazo de llanta', 'Sobrecalentamiento', 'Luces no encienden',
  'Golpe en carrocería', 'Ruidos en frenos', 'Batería descargada', 'Sensor defectuoso',
];

function minutesAgo(index: number): string {
  return new Date(seedDate.getTime() - index * 36 * 60 * 60 * 1000).toISOString();
}

function createUsers(): UserReadDetail[] {
  const users: UserReadDetail[] = [];
  const principalTenant = tenantsSeed[0];
  const workshopUsers = [
    { id: 1, nombre: 'Laura', apellidos: 'Mora', correo: 'admin@vehisos.com', role: 'administrador', taller_id: null },
    { id: 2, nombre: 'Taller', apellidos: 'Operario', correo: 'TallerOperario@gmail.com', role: 'taller', taller_id: 1 },
    { id: 3, nombre: 'Ricardo', apellidos: 'Siles', correo: 'tecnico1@vehisos.com', role: 'tecnico', taller_id: 1 },
    { id: 4, nombre: 'Elena', apellidos: 'Vargas', correo: 'cliente1@vehisos.com', role: 'cliente', taller_id: null },
  ];

  for (const item of workshopUsers) {
    const baseRole = rolesSeed.find(r => r.nombre === item.role) ?? rolesSeed[3];
    const role: RoleRead = {
      id: baseRole.id,
      nombre: baseRole.nombre,
      descripcion: baseRole.descripcion,
      fecha_creacion: seedDate.toISOString(),
      permisos: permissionsSeed.slice(0, 3),
    };
    users.push({
      id: item.id,
      nombre: item.nombre,
      apellidos: item.apellidos,
      correo: item.correo,
      telefono: '7000000' + item.id,
      documento_identidad: `CI-${100000 + item.id}`,
      activo: true,
      fecha_creacion: seedDate.toISOString(),
      fecha_actualizacion: seedDate.toISOString(),
      roles: [clone(role)],
      tenant_id: item.role === 'administrador' ? null : principalTenant.id,
      tenant: item.role === 'administrador' ? null : clone(principalTenant),
      nombre_dueno: item.role === 'taller' ? `${item.nombre} ${item.apellidos}` : null,
      ci_dueno: item.role === 'taller' ? `CI-${200000 + item.id}` : null,
      taller_id: item.taller_id,
    });
  }

  for (let index = 5; index <= 24; index++) {
    const baseRole = index % 6 === 0 ? rolesSeed[2] : rolesSeed[3];
    const role: RoleRead = {
      id: baseRole.id,
      nombre: baseRole.nombre,
      descripcion: baseRole.descripcion,
      fecha_creacion: seedDate.toISOString(),
      permisos: permissionsSeed.slice(0, 3),
    };
    users.push({
      id: index,
      nombre: firstNames[index % firstNames.length],
      apellidos: lastNames[index % lastNames.length],
      correo: `usuario${index}@vehisos.com`,
      telefono: `71${String(index).padStart(6, '0')}`,
      documento_identidad: `CI-${300000 + index}`,
      activo: true,
      fecha_creacion: seedDate.toISOString(),
      fecha_actualizacion: seedDate.toISOString(),
      roles: [clone(role)],
      tenant_id: principalTenant.id,
      tenant: clone(principalTenant),
      nombre_dueno: null,
      ci_dueno: null,
      taller_id: role.nombre === 'tecnico' ? 1 : null,
    });
  }

  return users;
}

function createTalleres(users: UserReadDetail[]): DemoWorkshop[] {
  return workshopNames.map((nombre, index) => {
    const id = index + 1;
    const owner = users.find(user => user.roles[0]?.nombre === 'taller' && user.taller_id === id)
      ?? users[1];
    return {
      id,
      id_propietario: owner.id,
      nombre,
      nit: `NIT-${5000 + id}`,
      correo: `${nombre.toLowerCase().replaceAll(' ', '')}@vehisos.com`,
      telefono: `760${String(100 + id).padStart(4, '0')}`,
      direccion: `Av. ${nombre} ${id * 3}, Zona ${String.fromCharCode(64 + ((index % 6) + 1))}`,
      ciudad: workshopCities[index % workshopCities.length],
      latitud: -17.78 + index * 0.03,
      longitud: -63.18 + index * 0.02,
      capacidad_maxima: 12 + (index % 5) * 4,
      porcentaje_comision: 8 + (index % 4) * 4,
      activo: index % 5 !== 4,
      fecha_creacion: new Date(seedDate.getTime() - index * 86400000).toISOString(),
      fecha_actualizacion: new Date(seedDate.getTime() - index * 3600000).toISOString(),
      rating_promedio: 4.1 + (index % 5) * 0.12,
    };
  });
}

function createVehicles(users: UserReadDetail[]): DemoVehicle[] {
  const clients = users.filter(user => user.roles[0]?.nombre === 'cliente');
  return Array.from({ length: 36 }, (_, index) => {
    const client = clients[index % clients.length];
    return {
      id: index + 1,
      id_usuario: client.id,
      placa: `VEH-${String(index + 1).padStart(3, '0')}`,
      marca: brands[index % brands.length],
      modelo: models[index % models.length],
      anio: 2014 + (index % 11),
      color: ['Rojo', 'Blanco', 'Negro', 'Plata', 'Azul'][index % 5],
      observaciones: index % 4 === 0 ? 'Vehículo para demo' : null,
      tipo_vehiculo: vehicleTypes[index % vehicleTypes.length],
      propietario: `${client.nombre} ${client.apellidos}`,
    };
  });
}

function createIncidents(vehicles: DemoVehicle[], talleres: DemoWorkshop[]): IncidenteRead[] {
  return Array.from({ length: 60 }, (_, index) => {
    const vehicle = vehicles[index % vehicles.length];
    const workshop = talleres[index % talleres.length];
    const tipo = tiposSeed[index % tiposSeed.length];
    const prioridad = prioridadesSeed[index % prioridadesSeed.length];
    const estado = estadosSeed[Math.min(index % estadosSeed.length, estadosSeed.length - 1)];
    const fecha = minutesAgo(index);
    const latitud = -17.78 + (index % 12) * 0.015;
    const longitud = -63.18 + (index % 12) * 0.012;

    const historial: HistorialRead[] = [
      {
        id: index * 3 + 1,
        id_incidente: index + 1,
        id_usuario_actor: vehicle.id_usuario,
        id_estado_anterior: null,
        id_estado_nuevo: 1,
        tipo_evento: 'Reporte creado',
        descripcion: 'El cliente registró el incidente',
        datos_evento: { origen: 'demo' },
        fecha_creacion: fecha,
      },
      {
        id: index * 3 + 2,
        id_incidente: index + 1,
        id_usuario_actor: workshop.id_propietario,
        id_estado_anterior: 1,
        id_estado_nuevo: 2,
        tipo_evento: 'Asignación sugerida',
        descripcion: 'El sistema sugirió un taller',
        datos_evento: { taller_id: workshop.id },
        fecha_creacion: new Date(new Date(fecha).getTime() + 3600000).toISOString(),
      },
      {
        id: index * 3 + 3,
        id_incidente: index + 1,
        id_usuario_actor: workshop.id_propietario,
        id_estado_anterior: 2,
        id_estado_nuevo: estado.id,
        tipo_evento: estado.nombre,
        descripcion: `Estado actualizado a ${estado.nombre}`,
        datos_evento: { prioridad: prioridad.nombre },
        fecha_creacion: new Date(new Date(fecha).getTime() + 7200000).toISOString(),
      },
    ];

    return {
      id: index + 1,
      id_cliente: vehicle.id_usuario,
      id_vehiculo: vehicle.id,
      id_estado_servicio: estado.id,
      id_tipo_incidente: tipo.id,
      id_prioridad: prioridad.id,
      codigo_incidente: `INC-${String(index + 1).padStart(4, '0')}`,
      titulo: `${incidentTitles[index % incidentTitles.length]} - ${vehicle.marca} ${vehicle.modelo}`,
      descripcion_texto: `Caso demo ${index + 1}: ${tipo.nombre.toLowerCase()} detectado para ${vehicle.placa}.`,
      referencia_ubicacion: `Av. Demo ${index + 1}, Zona ${workshop.ciudad}`,
      direccion_textual: `Av. Demo ${index + 1}, ${workshop.ciudad}`,
      latitud,
      longitud,
      requiere_grua: index % 6 === 0,
      tiempo_estimado_llegada: 20 + (index % 6) * 5,
      fecha_reporte: fecha,
      fecha_cierre: estado.es_final ? new Date(new Date(fecha).getTime() + 86400000).toISOString() : null,
      fecha_creacion: fecha,
      fecha_actualizacion: new Date(new Date(fecha).getTime() + 14400000).toISOString(),
      estado_servicio: clone(estado),
      tipo_incidente: clone(tipo),
      prioridad: clone(prioridad),
      vehiculo: clone(vehicle),
      evidencias: [
        {
          id: index * 2 + 1,
          id_incidente: index + 1,
          id_usuario: vehicle.id_usuario,
          tipo_evidencia: 'imagen',
          url_archivo: `https://placehold.co/640x360/png?text=Demo+${index + 1}`,
          nombre_archivo: `evidencia-${index + 1}.png`,
          tipo_mime: 'image/png',
          tamano_bytes: 1024 + index * 10,
          contenido_texto: null,
          texto_transcrito: null,
          texto_extraido: null,
          metadatos: { demo: true },
          fecha_creacion: fecha,
        },
      ],
      historial,
    };
  });
}

function createAnalyses(incidents: IncidenteRead[], talleres: DemoWorkshop[]): AnalisisIARead[] {
  const tipos = [
    'transcripcion_audio',
    'extraccion_informacion',
    'clasificacion_incidente',
    'analisis_imagen',
    'resumen_priorizacion',
    'asignacion_inteligente',
  ];

  return incidents.flatMap((incident, incidentIndex) => {
    const workshop = talleres[incidentIndex % talleres.length];
    return tipos.slice(0, 2 + (incidentIndex % 4)).map((tipo, tipoIndex) => ({
      id: incidentIndex * 4 + tipoIndex + 1,
      id_incidente: incident.id,
      id_evidencia: incident.evidencias[0]?.id ?? null,
      tipo_analisis: tipo,
      modelo_usado: tipoIndex % 2 === 0 ? 'vehisos-demo-v1' : 'vehisos-llm-lite',
      resultado: buildAnalysisResult(tipo, incident, workshop),
      nivel_confianza: Math.max(0.62, Math.min(0.98, 0.68 + ((incidentIndex % 6) * 0.05))),
      fecha_creacion: new Date(new Date(incident.fecha_creacion).getTime() + tipoIndex * 1800000).toISOString(),
    }));
  }).slice(0, 84);
}

function buildAnalysisResult(tipo: string, incident: IncidenteRead, workshop: DemoWorkshop): Record<string, unknown> {
  switch (tipo) {
    case 'transcripcion_audio':
      return {
        texto_transcrito: `Cliente reporta ${incident.titulo.toLowerCase()} en ${incident.referencia_ubicacion}.`,
        confianza: 0.93,
      };
    case 'extraccion_informacion':
      return {
        entidades: { vehiculo: incident.vehiculo.placa, prioridad: incident.prioridad?.nombre },
        palabras_clave: [incident.tipo_incidente?.nombre ?? 'General', 'demo', 'vehículo'],
      };
    case 'clasificacion_incidente':
      return {
        tipo_sugerido: incident.tipo_incidente?.nombre ?? 'General',
        confianza: 0.9,
      };
    case 'analisis_imagen':
      return {
        hallazgos: ['Rasguño visible', 'Alineación afectada'],
        confianza: 0.88,
      };
    case 'resumen_priorizacion':
      return {
        resumen: `Incidente ${incident.codigo_incidente} priorizado como ${incident.prioridad?.nombre}.`,
        prioridad_sugerida: incident.prioridad?.nombre ?? 'Media',
      };
    default:
      return {
        taller_recomendado: workshop.nombre,
        score: 0.91,
        razones: ['Cercanía', 'Capacidad disponible', 'Especialidad compatible'],
      };
  }
}

function createAsignaciones(incidents: IncidenteRead[], talleres: DemoWorkshop[]): AsignacionRead[] {
  return incidents.slice(0, 52).map((incident, index) => {
    const workshop = talleres[index % talleres.length];
    const personalId = index % 2 === 0 ? index + 1 : null;
    return {
      id: index + 1,
      id_incidente: incident.id,
      id_taller: workshop.id,
      id_personal_taller: personalId,
      estado_asignacion: index % 6 === 0 ? 'rechazada' : index % 5 === 0 ? 'aceptada' : 'enviada',
      puntaje_asignacion: 72 + (index % 20),
      distancia_km: 0.8 + (index % 9) * 0.7,
      tiempo_estimado_llegada: 12 + (index % 7) * 4,
      fecha_asignacion: new Date(new Date(incident.fecha_creacion).getTime() + 2700000).toISOString(),
      fecha_respuesta: index % 6 === 0 ? new Date(new Date(incident.fecha_creacion).getTime() + 5400000).toISOString() : null,
      observaciones: index % 4 === 0 ? 'Asignación demo con prioridad automática' : null,
    };
  });
}

function createPagos(incidents: IncidenteRead[], talleres: DemoWorkshop[]): PagoRead[] {
  return incidents.slice(0, 48).map((incident, index) => {
    const workshop = talleres[index % talleres.length];
    return {
      id: index + 1,
      id_incidente: incident.id,
      id_taller: workshop.id,
      monto_total: 180 + index * 12,
      monto_comision: 12 + (index % 6) * 4,
      estado_pago: index % 5 === 0 ? 'pendiente' : 'pagado',
      metodo_pago: ['efectivo', 'tarjeta', 'qr'][index % 3],
      fecha_pago: index % 5 === 0 ? null : new Date(new Date(incident.fecha_creacion).getTime() + 86400000).toISOString(),
      fecha_creacion: new Date(new Date(incident.fecha_creacion).getTime() + 86400000).toISOString(),
    };
  });
}

function createNotifications(users: UserReadDetail[], incidents: IncidenteRead[]): NotificacionRead[] {
  return Array.from({ length: 42 }, (_, index) => {
    const user = users[index % users.length];
    const incident = incidents[index % incidents.length];
    return {
      id: index + 1,
      id_usuario: user.id,
      id_incidente: incident.id,
      canal: 'in_app',
      titulo: `Actualización ${incident.codigo_incidente}`,
      mensaje: `El caso ${incident.codigo_incidente} cambió a ${incident.estado_servicio.nombre}.`,
      estado: index % 4 === 0 ? 'leida' : 'enviada',
      fecha_envio: new Date(new Date(incident.fecha_creacion).getTime() + index * 120000).toISOString(),
      fecha_lectura: index % 4 === 0 ? new Date(new Date(incident.fecha_creacion).getTime() + index * 140000).toISOString() : null,
      fecha_creacion: new Date(new Date(incident.fecha_creacion).getTime() + index * 120000).toISOString(),
    };
  });
}

function createPersonal(users: UserReadDetail[], talleres: DemoWorkshop[]): PersonalTallerRead[] {
  const technicians = users.filter(user => user.roles[0]?.nombre === 'tecnico');
  return Array.from({ length: 24 }, (_, index) => {
    const tech = technicians[index % technicians.length] ?? users[2];
    const workshop = talleres[index % talleres.length];
    return {
      id: index + 1,
      id_taller: workshop.id,
      id_usuario: tech.id,
      tipo_personal: index % 2 === 0 ? 'tecnico' : 'asistente',
      disponible: index % 3 !== 0,
      latitud_actual: workshop.latitud,
      longitud_actual: workshop.longitud,
      fecha_asignacion: new Date(new Date(seedDate).getTime() - index * 86400000).toISOString(),
      nombre_usuario: tech.nombre,
      apellidos_usuario: tech.apellidos,
      telefono_usuario: tech.telefono,
      correo_usuario: tech.correo,
    };
  });
}

function createSpecialties(talleres: DemoWorkshop[], incidents: IncidenteRead[]): EspecialidadVehiculoRead[] {
  const grouped = new Map<string, { count: number; ratings: number[]; lastDate: string; vehicle: DemoVehicle; taller: DemoWorkshop }>();

  incidents.forEach((incident, index) => {
    const workshop = talleres[index % talleres.length];
    const vehicle = incident.vehiculo as DemoVehicle;
    const key = `${workshop.id}-${vehicle.tipo_vehiculo}-${vehicle.marca}`;
    const rating = 3.8 + (index % 12) * 0.1;
    const current = grouped.get(key);
    if (!current) {
      grouped.set(key, { count: 1, ratings: [rating], lastDate: incident.fecha_creacion, vehicle, taller: workshop });
      return;
    }
    current.count += 1;
    current.ratings.push(rating);
    if (new Date(incident.fecha_creacion).getTime() > new Date(current.lastDate).getTime()) {
      current.lastDate = incident.fecha_creacion;
    }
  });

  return Array.from(grouped.values()).map((entry, index) => ({
    id: index + 1,
    id_taller: entry.taller.id,
    tipo_vehiculo: entry.vehicle.tipo_vehiculo,
    marca: entry.vehicle.marca,
    modelo: entry.vehicle.modelo,
    reparaciones_exitosas: entry.count,
    calificacion_promedio: Math.round((entry.ratings.reduce((s, value) => s + value, 0) / entry.ratings.length) * 10) / 10,
    dias_sin_falla: Math.max(2, Math.floor((Date.now() - new Date(entry.lastDate).getTime()) / 86400000)),
    fecha_creacion: entry.lastDate,
  }));
}

function buildMockDb(): DemoDb {
  const users = createUsers();
  const talleres = createTalleres(users);
  const vehicles = createVehicles(users);
  const incidences = createIncidents(vehicles, talleres);
  const analyses = createAnalyses(incidences, talleres);
  const asignaciones = createAsignaciones(incidences, talleres);
  const pagos = createPagos(incidences, talleres);
  const notificaciones = createNotifications(users, incidences);
  const personal = createPersonal(users, talleres);
  const especialidades = createSpecialties(talleres, incidences);

  const historialDesempeno = incidences.slice(0, 48).map((incident, index) => ({
    id: index + 1,
    id_taller: talleres[index % talleres.length].id,
    id_incidente: incident.id,
    tiempo_respuesta_minutos: 12 + (index % 8) * 3,
    tiempo_reparacion_minutos: 45 + (index % 9) * 14,
    tasa_exito: index % 7 !== 0,
    cliente_satisfecho: index % 6 !== 0,
    calificacion_cliente: 3.7 + (index % 10) * 0.12,
    comentarios_cliente: index % 5 === 0 ? 'Servicio demo con buena atención' : null,
    costo_servicio: 120 + index * 15,
    costo_repuestos: 40 + index * 6,
    fecha_creacion: new Date(new Date(incident.fecha_creacion).getTime() + 86400000).toISOString(),
    fecha_actualizacion: new Date(new Date(incident.fecha_creacion).getTime() + 90000000).toISOString(),
  }));

  return {
    roles: rolesSeed.map(role => ({ ...role, fecha_creacion: seedDate.toISOString(), permisos: permissionsSeed.filter((_, index) => index < 3), permiso_ids: [1, 2, 3] })),
    permissions: permissionsSeed,
    users,
    vehicles,
    talleres,
    estados: estadosSeed,
    tiposIncidente: tiposSeed,
    prioridades: prioridadesSeed,
    incidences,
    analyses,
    asignaciones,
    pagos,
    notificaciones,
    historialDesempeno,
    especialidades,
    personal,
    tenants: tenantsSeed.map(t => clone(t)),
  };
}

export const mockDb = buildMockDb();

export function currentStoredUser(): UserReadDetail | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) as UserReadDetail : null;
  } catch {
    return null;
  }
}

export function getCurrentUserId(): number {
  return currentStoredUser()?.id ?? 1;
}

export function getRoleById(roleId: number): DemoRole | undefined {
  return mockDb.roles.find(role => role.id === roleId);
}

export function getPermissionById(permissionId: number): PermissionRead | undefined {
  return mockDb.permissions.find(permission => permission.id === permissionId);
}

export function getWorkshopById(id: number): DemoWorkshop | undefined {
  return mockDb.talleres.find(workshop => workshop.id === id);
}

export function getVehicleById(id: number): DemoVehicle | undefined {
  return mockDb.vehicles.find(vehicle => vehicle.id === id);
}

export function getIncidentById(id: number): IncidenteRead | undefined {
  return mockDb.incidences.find(incident => incident.id === id);
}

export function getAnalysisByIncidentId(id: number): AnalisisIARead[] {
  return mockDb.analyses.filter(analysis => analysis.id_incidente === id);
}

export function getAssignmentsByWorkshopId(id: number): AsignacionRead[] {
  return mockDb.asignaciones.filter(asignacion => asignacion.id_taller === id);
}

export function getPaymentsByWorkshopId(id?: number): PagoRead[] {
  return typeof id === 'number' ? mockDb.pagos.filter(pago => pago.id_taller === id) : mockDb.pagos;
}

export function getNotificationsForUser(userId: number, unreadOnly = false): NotificacionRead[] {
  return mockDb.notificaciones.filter(notification => {
    if (notification.id_usuario !== userId) {
      return false;
    }
    if (unreadOnly) {
      return notification.estado !== 'leida';
    }
    return true;
  });
}

export function buildLoginResponse(payload: LoginRequest): AuthResponse {
  const identifier = payload.identificador.trim().toLowerCase();
  const fallbackUser = mockDb.users[0];
  const matchedUser = mockDb.users.find(user =>
    user.correo.toLowerCase() === identifier ||
    user.documento_identidad.toLowerCase() === identifier ||
    `${user.nombre} ${user.apellidos}`.toLowerCase() === identifier ||
    user.nombre.toLowerCase() === identifier
  ) ?? (identifier.includes('admin') ? mockDb.users[0]
    : identifier.includes('taller') ? mockDb.users[1]
    : identifier.includes('tecnico') ? mockDb.users[2]
    : fallbackUser);

  return {
    access_token: `demo-token-${matchedUser.id}`,
    token_type: 'bearer',
    user: clone(matchedUser),
    tenant: matchedUser.tenant ?? null,
    tenant_id: matchedUser.tenant_id ?? null,
    rol: matchedUser.roles[0]?.nombre ?? null,
    permisos: matchedUser.roles[0]?.permisos.map(permission => permission.nombre) ?? [],
    taller_id: matchedUser.taller_id ?? undefined,
  };
}

export function buildUserCreate(payload: UserCreate, roleName: 'cliente' | 'taller' | 'tecnico' = payload.rol ?? 'cliente'): UserReadDetail {
  const role = mockDb.roles.find(item => item.nombre === roleName) ?? mockDb.roles[3];
  const nextId = Math.max(...mockDb.users.map(user => user.id)) + 1;
  const user: UserReadDetail = {
    id: nextId,
    nombre: payload.nombre,
    apellidos: payload.apellidos,
    correo: payload.correo,
    telefono: payload.telefono ?? null,
    documento_identidad: payload.documento_identidad,
    activo: payload.activo ?? true,
    fecha_creacion: nowIso(),
    fecha_actualizacion: nowIso(),
    roles: [clone(role)],
    tenant_id: 1,
    tenant: {
      id: 1,
      nombre: 'Tenant Principal',
      descripcion: 'Tenant base de compatibilidad para VehiSOS',
      estado: 'activo',
      activo: true,
      plan: 'standard',
      configuracion: { tema: 'rojo' },
      color_tema: '#C40016',
      fecha_creacion: nowIso(),
      fecha_actualizacion: nowIso(),
    },
    nombre_dueno: payload.nombre_dueno ?? null,
    ci_dueno: payload.ci_dueno ?? null,
    taller_id: role.nombre === 'taller' ? 1 : role.nombre === 'tecnico' ? 1 : null,
  };
  mockDb.users.unshift(user);
  return clone(user);
}

export function buildUserUpdate(id: number, payload: UserUpdate): UserReadDetail | undefined {
  const user = mockDb.users.find(item => item.id === id);
  if (!user) return undefined;
  Object.assign(user, {
    ...payload,
    telefono: payload.telefono ?? user.telefono,
    activo: payload.activo ?? user.activo,
    fecha_actualizacion: nowIso(),
  });
  return clone(user);
}

export function buildRoleCreate(payload: RoleCreate): RoleRead {
  const nextId = Math.max(...mockDb.roles.map(role => role.id)) + 1;
  const role: RoleRead = {
    id: nextId,
    nombre: payload.nombre,
    descripcion: payload.descripcion ?? null,
    fecha_creacion: nowIso(),
    permisos: (payload.permission_ids ?? []).map(permissionId => getPermissionById(permissionId)).filter(Boolean) as PermissionRead[],
  };
  mockDb.roles.unshift({ ...role });
  return clone(role);
}

export function buildPermissionCreate(payload: PermissionCreate): PermissionRead {
  const nextId = Math.max(...mockDb.permissions.map(permission => permission.id)) + 1;
  const permission: PermissionRead = {
    id: nextId,
    nombre: payload.nombre,
    descripcion: payload.descripcion ?? null,
    fecha_creacion: nowIso(),
  };
  mockDb.permissions.unshift(permission);
  return clone(permission);
}

export function buildVehicleCreate(payload: VehiculoCreate, userId?: number): DemoVehicle {
  const nextId = Math.max(...mockDb.vehicles.map(vehicle => vehicle.id)) + 1;
  const vehicle: DemoVehicle = {
    id: nextId,
    id_usuario: userId ?? getCurrentUserId(),
    placa: payload.placa,
    marca: payload.marca,
    modelo: payload.modelo,
    anio: payload.anio ?? null,
    color: payload.color ?? null,
    observaciones: payload.observaciones ?? null,
    tipo_vehiculo: vehicleTypes[nextId % vehicleTypes.length],
    propietario: 'Demo User',
  };
  mockDb.vehicles.unshift(vehicle);
  return clone(vehicle);
}

export function buildVehicleUpdate(id: number, payload: VehiculoUpdate): DemoVehicle | undefined {
  const vehicle = mockDb.vehicles.find(item => item.id === id);
  if (!vehicle) return undefined;
  Object.assign(vehicle, {
    ...payload,
    color: payload.color ?? vehicle.color,
    observaciones: payload.observaciones ?? vehicle.observaciones,
  });
  return clone(vehicle);
}

export function buildIncidentCreate(payload: IncidenteCreate): IncidenteRead {
  const vehicle = getVehicleById(payload.id_vehiculo) ?? mockDb.vehicles[0];
  const estado = mockDb.estados[0];
  const tipo = payload.id_tipo_incidente ? mockDb.tiposIncidente.find(item => item.id === payload.id_tipo_incidente) ?? null : mockDb.tiposIncidente[0];
  const prioridad = payload.id_prioridad ? mockDb.prioridades.find(item => item.id === payload.id_prioridad) ?? null : mockDb.prioridades[1];
  const nextId = Math.max(...mockDb.incidences.map(incident => incident.id)) + 1;
  const incident: IncidenteRead = {
    id: nextId,
    id_cliente: vehicle.id_usuario,
    id_vehiculo: vehicle.id,
    id_estado_servicio: estado.id,
    id_tipo_incidente: tipo?.id ?? null,
    id_prioridad: prioridad?.id ?? null,
    codigo_incidente: `INC-${String(nextId).padStart(4, '0')}`,
    titulo: payload.titulo,
    descripcion_texto: payload.descripcion_texto ?? null,
    referencia_ubicacion: payload.referencia_ubicacion ?? null,
    direccion_textual: payload.direccion_textual ?? null,
    latitud: payload.latitud,
    longitud: payload.longitud,
    requiere_grua: payload.requiere_grua ?? false,
    tiempo_estimado_llegada: payload.tiempo_estimado_llegada ?? null,
    fecha_reporte: nowIso(),
    fecha_cierre: null,
    fecha_creacion: nowIso(),
    fecha_actualizacion: nowIso(),
    estado_servicio: clone(estado),
    tipo_incidente: tipo ? clone(tipo) : null,
    prioridad: prioridad ? clone(prioridad) : null,
    vehiculo: clone(vehicle),
    evidencias: payload.evidencias?.map((evidence, index) => ({
      id: nextId * 10 + index + 1,
      id_incidente: nextId,
      id_usuario: vehicle.id_usuario,
      tipo_evidencia: evidence.tipo_evidencia,
      url_archivo: evidence.url_archivo ?? null,
      nombre_archivo: evidence.nombre_archivo ?? null,
      tipo_mime: evidence.tipo_mime ?? null,
      tamano_bytes: evidence.tamano_bytes ?? null,
      contenido_texto: evidence.contenido_texto ?? null,
      texto_transcrito: evidence.texto_transcrito ?? null,
      texto_extraido: evidence.texto_extraido ?? null,
      metadatos: evidence.metadatos ?? {},
      fecha_creacion: nowIso(),
    })) ?? [],
    historial: [],
  };
  mockDb.incidences.unshift(incident);
  return clone(incident);
}

export function buildIncidentStateUpdate(id: number, payload: IncidenteEstadoUpdate): IncidenteRead | undefined {
  const incident = mockDb.incidences.find(item => item.id === id);
  if (!incident) return undefined;
  const state = mockDb.estados.find(item => item.codigo === payload.estado_codigo) ?? incident.estado_servicio;
  incident.id_estado_servicio = state.id;
  incident.estado_servicio = clone(state);
  if (state.es_final) {
    incident.fecha_cierre = nowIso();
  }
  incident.fecha_actualizacion = nowIso();
  incident.historial.unshift({
    id: incident.historial.length + 1000,
    id_incidente: id,
    id_usuario_actor: getCurrentUserId(),
    id_estado_anterior: null,
    id_estado_nuevo: state.id,
    tipo_evento: `Estado ${state.nombre}`,
    descripcion: payload.descripcion ?? null,
    datos_evento: { tiempo_estimado_llegada: payload.tiempo_estimado_llegada ?? null },
    fecha_creacion: nowIso(),
  });
  return clone(incident);
}

export function buildEvidenceCreate(id: number, payload: EvidenciaCreate): EvidenciaRead {
  const incident = mockDb.incidences.find(item => item.id === id);
  const nextId = mockDb.incidences.reduce((count, item) => count + item.evidencias.length, 0) + 1;
  const evidence: EvidenciaRead = {
    id: nextId,
    id_incidente: id,
    id_usuario: incident?.id_cliente ?? getCurrentUserId(),
    tipo_evidencia: payload.tipo_evidencia,
    url_archivo: payload.url_archivo ?? null,
    nombre_archivo: payload.nombre_archivo ?? null,
    tipo_mime: payload.tipo_mime ?? null,
    tamano_bytes: payload.tamano_bytes ?? null,
    contenido_texto: payload.contenido_texto ?? null,
    texto_transcrito: payload.texto_transcrito ?? null,
    texto_extraido: payload.texto_extraido ?? null,
    metadatos: payload.metadatos ?? {},
    fecha_creacion: nowIso(),
  };
  incident?.evidencias.unshift(clone(evidence));
  return clone(evidence);
}

export function buildTallerCreate(payload: TallerCreate): TallerRead {
  const nextId = Math.max(...mockDb.talleres.map(workshop => workshop.id)) + 1;
  const workshop: DemoWorkshop = {
    id: nextId,
    id_propietario: getCurrentUserId(),
    nombre: payload.nombre,
    nit: payload.nit ?? `NIT-${7000 + nextId}`,
    correo: payload.correo ?? null,
    telefono: payload.telefono ?? null,
    direccion: payload.direccion ?? null,
    ciudad: payload.ciudad ?? null,
    latitud: payload.latitud ?? null,
    longitud: payload.longitud ?? null,
    capacidad_maxima: payload.capacidad_maxima ?? 10,
    porcentaje_comision: payload.porcentaje_comision ?? 12,
    activo: payload.activo ?? true,
    fecha_creacion: nowIso(),
    fecha_actualizacion: nowIso(),
    rating_promedio: 4,
  };
  mockDb.talleres.unshift(workshop);
  return clone(workshop);
}

export function buildTallerUpdate(id: number, payload: TallerUpdate): TallerRead | undefined {
  const workshop = mockDb.talleres.find(item => item.id === id);
  if (!workshop) return undefined;
  Object.assign(workshop, {
    ...payload,
    fecha_actualizacion: nowIso(),
  });
  return clone(workshop);
}

export function buildPersonalCreate(tallerId: number, payload: PersonalTallerCreate): PersonalTallerRead {
  const nextId = Math.max(...mockDb.personal.map(item => item.id)) + 1;
  const user = mockDb.users.find(item => item.id === payload.id_usuario) ?? mockDb.users[2];
  const record: PersonalTallerRead = {
    id: nextId,
    id_taller: tallerId,
    id_usuario: payload.id_usuario,
    tipo_personal: payload.tipo_personal,
    disponible: payload.disponible ?? true,
    latitud_actual: payload.latitud_actual ?? null,
    longitud_actual: payload.longitud_actual ?? null,
    fecha_asignacion: nowIso(),
    nombre_usuario: user.nombre,
    apellidos_usuario: user.apellidos,
    telefono_usuario: user.telefono,
    correo_usuario: user.correo,
  };
  mockDb.personal.unshift(record);
  return clone(record);
}

export function buildPersonalUpdate(tallerId: number, personalId: number, payload: PersonalTallerUpdate): PersonalTallerRead | undefined {
  const record = mockDb.personal.find(item => item.id === personalId && item.id_taller === tallerId);
  if (!record) return undefined;
  Object.assign(record, {
    ...payload,
    disponible: payload.disponible ?? record.disponible,
    fecha_asignacion: nowIso(),
  });
  return clone(record);
}

export function buildAsignacionCreate(payload: AsignacionCreate): AsignacionRead {
  const nextId = Math.max(...mockDb.asignaciones.map(item => item.id)) + 1;
  const record: AsignacionRead = {
    id: nextId,
    id_incidente: payload.id_incidente,
    id_taller: payload.id_taller,
    id_personal_taller: payload.id_personal_taller ?? null,
    estado_asignacion: 'enviada',
    puntaje_asignacion: payload.puntaje_asignacion ?? 75,
    distancia_km: payload.distancia_km ?? null,
    tiempo_estimado_llegada: payload.tiempo_estimado_llegada ?? null,
    fecha_asignacion: nowIso(),
    fecha_respuesta: null,
    observaciones: payload.observaciones ?? null,
  };
  mockDb.asignaciones.unshift(record);
  return clone(record);
}

export function buildAsignacionResponse(id: number, payload: AsignacionRespuestaRequest): AsignacionRead | undefined {
  const record = mockDb.asignaciones.find(item => item.id === id);
  if (!record) return undefined;
  record.estado_asignacion = payload.accion === 'aceptar' ? 'aceptada' : payload.accion === 'rechazar' ? 'rechazada' : payload.accion;
  record.id_personal_taller = payload.id_personal_taller ?? record.id_personal_taller;
  record.tiempo_estimado_llegada = payload.tiempo_estimado_llegada ?? record.tiempo_estimado_llegada;
  record.fecha_respuesta = nowIso();
  record.observaciones = payload.observaciones ?? record.observaciones;
  return clone(record);
}

export function buildPagoCreate(payload: PagoCreate): PagoRead {
  const nextId = Math.max(...mockDb.pagos.map(item => item.id)) + 1;
  const record: PagoRead = {
    id: nextId,
    id_incidente: payload.id_incidente,
    id_taller: payload.id_taller,
    monto_total: payload.monto_total,
    monto_comision: Math.round(payload.monto_total * 0.12),
    estado_pago: payload.estado_pago ?? 'pendiente',
    metodo_pago: payload.metodo_pago ?? null,
    fecha_pago: payload.fecha_pago ?? null,
    fecha_creacion: nowIso(),
  };
  mockDb.pagos.unshift(record);
  return clone(record);
}

export function buildCobroTecnico(payload: RegistrarCobroTecnicoRequest): PagoRead {
  return buildPagoCreate({
    id_incidente: payload.id_incidente,
    id_taller: 1,
    monto_total: payload.costo_servicio + 80,
    metodo_pago: 'qr',
    estado_pago: 'pagado',
    fecha_pago: nowIso(),
  });
}

export function markNotificationRead(notificationId: number): NotificacionRead | undefined {
  const record = mockDb.notificaciones.find(item => item.id === notificationId);
  if (!record) return undefined;
  record.estado = 'leida';
  record.fecha_lectura = nowIso();
  return clone(record);
}

export function buildSeedCatalogsResponse(): Record<string, unknown> {
  return { status: 'ok', catalogos_creados: true, categorias: ['estados', 'tipos_incidente', 'prioridades'] };
}

export function buildWorkshopPerformance(tallerId: number): WorkshopPerformanceMetrics {
  const history = mockDb.historialDesempeno.filter(item => item.id_taller === tallerId);
  const total = history.length;
  const averageRating = total > 0 ? history.reduce((sum, item) => sum + (item.calificacion_cliente ?? 0), 0) / total : null;
  const averageTime = total > 0 ? history.reduce((sum, item) => sum + (item.tiempo_reparacion_minutos ?? 0), 0) / total : null;
  const totalCost = history.reduce((sum, item) => sum + (item.costo_servicio ?? 0) + (item.costo_repuestos ?? 0), 0);
  return {
    id_taller: tallerId,
    total_servicios: total,
    calificacion_promedio: averageRating !== null ? Math.round(averageRating * 10) / 10 : null,
    tiempo_promedio_reparacion_minutos: averageTime !== null ? Math.round(averageTime) : null,
    gasto_total: Math.round(totalCost * 100) / 100,
  };
}

export function buildWorkshopHistory(tallerId: number, skip = 0, limit = 50): DesempenoTallerRead[] {
  return mockDb.historialDesempeno.filter(item => item.id_taller === tallerId).slice(skip, skip + limit).map(clone);
}

export function buildWorkshopSpecialties(tallerId: number): EspecialidadVehiculoRead[] {
  return mockDb.especialidades.filter(item => item.id_taller === tallerId).map(clone);
}

export function buildDashboardAnalytics(): DashboardAnalisisResponse {
  const talleresTop = mockDb.talleres
    .map(workshop => buildWorkshopPerformance(workshop.id))
    .sort((a, b) => b.total_servicios - a.total_servicios)
    .slice(0, 5);

  const especialidadesDemandadas = Array.from(
    mockDb.especialidades.reduce((map, item) => {
      const entry = map.get(item.tipo_vehiculo) ?? { tipo_vehiculo: item.tipo_vehiculo, count: 0, ratings: [] as number[] };
      entry.count += item.reparaciones_exitosas;
      if (item.calificacion_promedio !== null) {
        entry.ratings.push(item.calificacion_promedio);
      }
      map.set(item.tipo_vehiculo, entry);
      return map;
    }, new Map<string, { tipo_vehiculo: string; count: number; ratings: number[] }>()
  ).values()).map(item => ({
    tipo_vehiculo: item.tipo_vehiculo,
    count: item.count,
    rating_promedio: item.ratings.length > 0 ? Math.round((item.ratings.reduce((sum, value) => sum + value, 0) / item.ratings.length) * 10) / 10 : 0,
  })).sort((a, b) => b.count - a.count).slice(0, 6);

  return {
    total_talleres: mockDb.talleres.length,
    talleres_activos: mockDb.talleres.filter(workshop => workshop.activo).length,
    rating_promedio_sistema: Math.round((mockDb.talleres.reduce((sum, workshop) => sum + workshop.rating_promedio, 0) / mockDb.talleres.length) * 10) / 10,
    total_servicios_registrados: mockDb.incidences.length,
    talleres_top: talleresTop,
    especialidades_demandadas: especialidadesDemandadas,
  };
}

export function buildIncidentTrazabilidad(incidentId: number): TrazabilidadResponse {
  const incident = mockDb.incidences.find(item => item.id === incidentId) ?? mockDb.incidences[0];
  return {
    incidente: clone(incident),
    analisis: getAnalysisByIncidentId(incidentId).map(clone),
    resumen: {
      estado_actual: incident.estado_servicio.nombre,
      prioridad: incident.prioridad?.nombre ?? 'Media',
      total_eventos: incident.historial.length,
    },
  };
}

export function buildTranscription(incidentId: number): TranscripcionAudioResponse {
  const incident = mockDb.incidences.find(item => item.id === incidentId) ?? mockDb.incidences[0];
  const analysis = getAnalysisByIncidentId(incidentId)[0] ?? mockDb.analyses[0];
  return {
    incidente_id: incidentId,
    texto_transcrito: `Reporte de ${incident.titulo.toLowerCase()} en ${incident.referencia_ubicacion}.`,
    confianza: 0.94,
    analisis: clone(analysis),
  };
}

export function buildExtraction(incidentId: number): ExtraccionInfoResponse {
  const incident = mockDb.incidences.find(item => item.id === incidentId) ?? mockDb.incidences[0];
  const analysis = getAnalysisByIncidentId(incidentId)[1] ?? mockDb.analyses[1];
  return {
    incidente_id: incidentId,
    entidades: {
      vehiculo: incident.vehiculo.placa,
      ubicacion: incident.referencia_ubicacion,
      prioridad: incident.prioridad?.nombre,
    },
    palabras_clave: [incident.tipo_incidente?.nombre ?? 'General', 'demo', 'vehisos'],
    analisis: clone(analysis),
  };
}

export function buildClassification(incidentId: number): ClasificacionIncidenteResponse {
  const incident = mockDb.incidences.find(item => item.id === incidentId) ?? mockDb.incidences[0];
  const analysis = getAnalysisByIncidentId(incidentId)[2] ?? mockDb.analyses[2];
  return {
    incidente_id: incidentId,
    tipo_sugerido: incident.tipo_incidente?.nombre ?? 'General',
    confianza: 0.91,
    analisis: clone(analysis),
  };
}

export function buildImageAnalysis(incidentId: number): AnalisisImagenesResponse {
  const analysis = getAnalysisByIncidentId(incidentId)[3] ?? mockDb.analyses[3];
  return {
    incidente_id: incidentId,
    hallazgos: ['Golpe frontal leve', 'Rasguño lateral'],
    confianza: 0.89,
    analisis: clone(analysis),
  };
}

export function buildPrioritySummary(incidentId: number): ResumenPriorizacionResponse {
  const incident = mockDb.incidences.find(item => item.id === incidentId) ?? mockDb.incidences[0];
  const analysis = getAnalysisByIncidentId(incidentId)[4] ?? mockDb.analyses[4];
  return {
    incidente_id: incidentId,
    resumen: `Caso ${incident.codigo_incidente} priorizado como ${incident.prioridad?.nombre ?? 'Media'}.`,
    tipo_sugerido: incident.tipo_incidente?.nombre ?? 'General',
    prioridad_sugerida: incident.prioridad?.nombre ?? 'Media',
    confianza: 0.86,
    analisis: clone(analysis),
  };
}

function toWorkshopRecommendation(candidate: WorkshopSuggestionIn, rank = 0): WorkshopSuggestionIn {
  return {
    ...candidate,
    reasons: candidate.reasons ?? [`Opción ${rank + 1}`, 'Disponibilidad demo'],
    rating: candidate.rating ?? 4.2,
    priceTier: candidate.priceTier ?? 'Standard',
    isOpen: candidate.isOpen ?? true,
  };
}

export function buildWorkshopAssistant(payload: WorkshopAssistantRequest): WorkshopAssistantResponse {
  const recommendations = [...payload.candidates]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
    .slice(0, 5)
    .map((candidate, index) => toWorkshopRecommendation(candidate, index));

  return {
    assistantText: `Se evaluaron ${payload.candidates.length} talleres para resolver: ${payload.issue}.`,
    recommendations,
    provider: 'demo-local',
    model: 'vehisos-recommendation-v1',
    fallback: false,
  };
}

export function buildAssignmentRecommendation(payload: AsignacionInteligenteRequest, incidenteId: number): AsignacionInteligenteResponse {
  const ranking = payload.talleres
    .map((taller, index) => ({
      id_taller: taller.id_taller,
      nombre: taller.nombre,
      distancia_km: Number(Math.max(0.5, (index + 1) * 0.8).toFixed(1)),
      puntaje: 95 - index * 4,
      razones: ['Disponibilidad demo', 'Capacidad suficiente', 'Cercanía estimada'],
    }))
    .sort((a, b) => b.puntaje - a.puntaje);

  return {
    incidente_id: incidenteId,
    mejor_taller: ranking[0],
    ranking,
    criterios: { modo: 'demo', ponderacion: 'distancia-capacidad-especialidad' },
    analisis: mockDb.analyses[0],
  };
}

export function buildSolicitudesDisponibles(): SolicitudDisponibleRead[] {
  return mockDb.incidences.slice(0, 20).map(incident => ({
    id_incidente: incident.id,
    codigo_incidente: incident.codigo_incidente,
    titulo: incident.titulo,
    fecha_reporte: incident.fecha_reporte,
    id_prioridad: incident.id_prioridad,
    prioridad_codigo: incident.prioridad?.codigo ?? null,
    id_tipo_incidente: incident.id_tipo_incidente,
    tipo_codigo: incident.tipo_incidente?.codigo ?? null,
  }));
}

export function buildFinancialSummary(tallerId?: number): ResumenFinancieroRead {
  const pagos = getPaymentsByWorkshopId(tallerId);
  const totalMonto = pagos.reduce((sum, pago) => sum + pago.monto_total, 0);
  const totalComision = pagos.reduce((sum, pago) => sum + pago.monto_comision, 0);
  const totalPagado = pagos.filter(pago => pago.estado_pago === 'pagado').reduce((sum, pago) => sum + pago.monto_total, 0);
  const totalPendiente = pagos.filter(pago => pago.estado_pago !== 'pagado').reduce((sum, pago) => sum + pago.monto_total, 0);
  return {
    total_transacciones: pagos.length,
    total_monto: Math.round(totalMonto * 100) / 100,
    total_comision: Math.round(totalComision * 100) / 100,
    total_neto_taller: Math.round((totalMonto - totalComision) * 100) / 100,
    total_pagado: Math.round(totalPagado * 100) / 100,
    total_pendiente: Math.round(totalPendiente * 100) / 100,
  };
}

export function buildAdminUserCreate(payload: AdminUserCreate): UserReadDetail {
  if (mockDb.users.find(u => u.correo === payload.correo)) {
    throw { status: 409, error: { detail: 'El correo ya está registrado.' } };
  }
  const roleFromIds = payload.role_ids?.length
    ? mockDb.roles.find(r => r.id === payload.role_ids![0])
    : undefined;
  const roleByName = payload.rol ? mockDb.roles.find(r => r.nombre === payload.rol) : undefined;
  const role = roleFromIds ?? roleByName ?? mockDb.roles[3];
  const tenant = mockDb.tenants.find(t => t.id === payload.tenant_id) ?? mockDb.tenants[0];
  const nextId = Math.max(...mockDb.users.map(u => u.id)) + 1;
  const user: UserReadDetail = {
    id: nextId,
    nombre: payload.nombre,
    apellidos: payload.apellidos,
    correo: payload.correo,
    telefono: payload.telefono ?? null,
    documento_identidad: payload.documento_identidad,
    activo: payload.activo ?? true,
    fecha_creacion: nowIso(),
    fecha_actualizacion: nowIso(),
    roles: [clone(role)],
    tenant_id: tenant?.id ?? null,
    tenant: tenant ? clone(tenant) : null,
    nombre_dueno: payload.nombre_dueno ?? null,
    ci_dueno: payload.ci_dueno ?? null,
    taller_id: role.nombre === 'taller' || role.nombre === 'tecnico' ? 1 : null,
  };
  mockDb.users.unshift(user);
  return clone(user);
}

export function buildTenantCreate(payload: { nombre: string; descripcion?: string; estado?: string; activo?: boolean; plan?: string; configuracion?: Record<string, unknown>; color_tema?: string }): TenantRead {
  const nextId = Math.max(...mockDb.tenants.map(t => t.id)) + 1;
  const existing = mockDb.tenants.find(t => t.nombre === payload.nombre);
  if (existing) {
    throw { status: 409, error: { detail: 'El tenant ya existe' } };
  }
  const tenant: TenantRead = {
    id: nextId,
    nombre: payload.nombre,
    descripcion: payload.descripcion ?? null,
    estado: payload.estado ?? 'activo',
    activo: payload.activo ?? true,
    plan: payload.plan ?? 'standard',
    configuracion: payload.configuracion ?? {},
    color_tema: payload.color_tema ?? '#C40016',
    fecha_creacion: nowIso(),
    fecha_actualizacion: nowIso(),
  };
  mockDb.tenants.unshift(tenant);
  return clone(tenant);
}
