import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  buildAssignmentRecommendation,
  buildClassification,
  buildCobroTecnico,
  buildDashboardAnalytics,
  buildEvidenceCreate,
  buildImageAnalysis,
  buildExtraction,
  buildFinancialSummary,
  buildIncidentCreate,
  buildIncidentStateUpdate,
  buildIncidentTrazabilidad,
  buildLoginResponse,
  buildPagoCreate,
  buildPermissionCreate,
  buildPrioritySummary,
  buildRoleCreate,
  buildSeedCatalogsResponse,
  buildSolicitudesDisponibles,
  buildTallerCreate,
  buildTallerUpdate,
  buildTranscription,
  buildUserCreate,
  buildUserUpdate,
  buildVehicleCreate,
  buildVehicleUpdate,
  buildWorkshopAssistant,
  buildWorkshopHistory,
  buildWorkshopPerformance,
  buildWorkshopSpecialties,
  currentStoredUser,
  getAnalysisByIncidentId,
  getCurrentUserId,
  getIncidentById,
  getNotificationsForUser,
  getRoleById,
  getWorkshopById,
  markNotificationRead,
  mockDb,
  buildAsignacionCreate,
  buildAsignacionResponse,
  buildPersonalCreate,
  buildPersonalUpdate,
  buildIncidentTrazabilidad as buildTrazabilidad,
} from '../mock/mock-api-data';

const apiPrefix = `${environment.apiUrl}/api/v1`;

function ok(body: unknown, status = 200): Observable<HttpEvent<unknown>> {
  return of(new HttpResponse({ status, body })).pipe(delay(140));
}

function fail(message: string, status = 404): Observable<HttpEvent<never>> {
  return throwError(() => new HttpErrorResponse({ status, error: { detail: message } }));
}

function parseId(pathname: string, pattern: RegExp): number | null {
  const match = pathname.match(pattern);
  return match ? Number(match[1]) : null;
}

function readJsonBody<T>(request: Parameters<HttpInterceptorFn>[0]['body']): T {
  return request as T;
}

export const mockApiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!environment.useMockData || !request.url.startsWith(apiPrefix)) {
    return next(request);
  }

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, '');
  const method = request.method.toUpperCase();

  if (pathname === '/api/v1/usuarios/login' && method === 'POST') {
    return ok(buildLoginResponse(readJsonBody(request.body)));
  }

  if (pathname === '/api/v1/usuarios/me' && method === 'GET') {
    const current = currentStoredUser() ?? mockDb.users[0];
    return ok(current);
  }

  if (pathname === '/api/v1/usuarios' && method === 'GET') {
    return ok(mockDb.users);
  }

  if (pathname === '/api/v1/usuarios/tecnicos' && method === 'GET') {
    return ok(mockDb.users.filter(user => user.roles[0]?.nombre === 'tecnico'));
  }

  if (pathname === '/api/v1/usuarios/register' && method === 'POST') {
    return ok(buildUserCreate(readJsonBody(request.body)));
  }

  if (pathname === '/api/v1/usuarios/tecnicos/register' && method === 'POST') {
    return ok(buildUserCreate(readJsonBody(request.body), 'tecnico'));
  }

  if (pathname === '/api/v1/usuarios/roles' && method === 'GET') {
    return ok(mockDb.roles.map(role => ({ ...role, permiso_ids: undefined })));
  }

  if (pathname === '/api/v1/usuarios/roles' && method === 'POST') {
    return ok(buildRoleCreate(readJsonBody(request.body)));
  }

  if (pathname === '/api/v1/usuarios/permisos' && method === 'GET') {
    return ok(mockDb.permissions);
  }

  if (pathname === '/api/v1/usuarios/permisos' && method === 'POST') {
    return ok(buildPermissionCreate(readJsonBody(request.body)));
  }

  const userId = parseId(pathname, /^\/api\/v1\/usuarios\/(\d+)$/);
  if (userId !== null && method === 'GET') {
    const user = mockDb.users.find(item => item.id === userId);
    return user ? ok(user) : fail(`Usuario ${userId} no encontrado`);
  }
  if (userId !== null && method === 'PUT') {
    const updated = buildUserUpdate(userId, readJsonBody(request.body));
    return updated ? ok(updated) : fail(`Usuario ${userId} no encontrado`);
  }
  if (userId !== null && method === 'POST' && pathname.endsWith('/roles')) {
    const roleId = Number(readJsonBody<{ role_id: number }>(request.body).role_id);
    const user = mockDb.users.find(item => item.id === userId);
    const role = getRoleById(roleId);
    if (!user || !role) return fail('Usuario o rol no encontrado');
    user.roles = [role];
    user.taller_id = role.nombre === 'taller' || role.nombre === 'tecnico' ? 1 : null;
    return ok(user);
  }

  if (pathname === '/api/v1/emergencias/vehiculos' && method === 'GET') {
    return ok(mockDb.vehicles);
  }
  const vehicleId = parseId(pathname, /^\/api\/v1\/emergencias\/vehiculos\/(\d+)$/);
  if (vehicleId !== null && method === 'GET') {
    const vehicle = mockDb.vehicles.find(item => item.id === vehicleId);
    return vehicle ? ok(vehicle) : fail(`Vehículo ${vehicleId} no encontrado`);
  }
  if (pathname === '/api/v1/emergencias/vehiculos' && method === 'POST') {
    return ok(buildVehicleCreate(readJsonBody(request.body)));
  }
  if (vehicleId !== null && method === 'PUT') {
    const updated = buildVehicleUpdate(vehicleId, readJsonBody(request.body));
    return updated ? ok(updated) : fail(`Vehículo ${vehicleId} no encontrado`);
  }

  if (pathname === '/api/v1/emergencias/incidentes' && method === 'GET') {
    return ok(mockDb.incidences);
  }
  if (pathname === '/api/v1/emergencias/incidentes' && method === 'POST') {
    return ok(buildIncidentCreate(readJsonBody(request.body)));
  }
  const incidentId = parseId(pathname, /^\/api\/v1\/emergencias\/incidentes\/(\d+)/);
  if (incidentId !== null && pathname.endsWith('/evidencias') && method === 'POST') {
    return ok(buildEvidenceCreate(incidentId, readJsonBody(request.body)));
  }
  if (incidentId !== null && pathname.endsWith('/estado') && method === 'PATCH') {
    return ok(buildIncidentStateUpdate(incidentId, readJsonBody(request.body)));
  }
  if (incidentId !== null && method === 'GET') {
    const incident = getIncidentById(incidentId);
    return incident ? ok(incident) : fail(`Incidente ${incidentId} no encontrado`);
  }

  if (pathname === '/api/v1/emergencias/catalogos/estados' && method === 'GET') {
    return ok(mockDb.estados);
  }
  if (pathname === '/api/v1/emergencias/catalogos/tipos-incidente' && method === 'GET') {
    return ok(mockDb.tiposIncidente);
  }
  if (pathname === '/api/v1/emergencias/catalogos/prioridades' && method === 'GET') {
    return ok(mockDb.prioridades);
  }
  if (pathname === '/api/v1/emergencias/admin/catalogos/seed-inteligentes' && method === 'POST') {
    return ok(buildSeedCatalogsResponse());
  }

  if (pathname === '/api/v1/logistica/talleres' && method === 'GET') {
    return ok(mockDb.talleres);
  }
  const tallerId = parseId(pathname, /^\/api\/v1\/logistica\/talleres\/(\d+)/);
  if (tallerId !== null && pathname.endsWith('/personal') && method === 'GET') {
    return ok(mockDb.personal.filter(item => item.id_taller === tallerId));
  }
  if (tallerId !== null && pathname.endsWith('/personal') && method === 'POST') {
    return ok(buildPersonalCreate(tallerId, readJsonBody(request.body)));
  }
  const personalId = parseId(pathname, /^\/api\/v1\/logistica\/talleres\/(\d+)\/personal\/(\d+)/);
  if (personalId !== null && method === 'PATCH') {
    const tallerMatch = pathname.match(/^\/api\/v1\/logistica\/talleres\/(\d+)\/personal\/(\d+)/);
    const currentTallerId = tallerMatch ? Number(tallerMatch[1]) : 0;
    const updated = buildPersonalUpdate(currentTallerId, personalId, readJsonBody(request.body));
    return updated ? ok(updated) : fail(`Personal ${personalId} no encontrado`);
  }
  if (tallerId !== null && method === 'GET' && pathname === `/api/v1/logistica/talleres/${tallerId}`) {
    const workshop = getWorkshopById(tallerId);
    return workshop ? ok(workshop) : fail(`Taller ${tallerId} no encontrado`);
  }
  if (pathname === '/api/v1/logistica/admin/talleres' && method === 'GET') {
    return ok(mockDb.talleres);
  }
  const adminTallerId = parseId(pathname, /^\/api\/v1\/logistica\/admin\/talleres\/(\d+)\/activo/);
  if (adminTallerId !== null && method === 'PATCH') {
    const active = url.searchParams.get('activo') === 'true';
    const workshop = mockDb.talleres.find(item => item.id === adminTallerId);
    if (!workshop) return fail(`Taller ${adminTallerId} no encontrado`);
    workshop.activo = active;
    return ok(workshop);
  }
  if (pathname === '/api/v1/logistica/solicitudes/disponibles' && method === 'GET') {
    return ok(buildSolicitudesDisponibles());
  }
  if (pathname === '/api/v1/logistica/asignaciones/historial' && method === 'GET') {
    const workshopFilter = url.searchParams.get('taller_id');
    const items = workshopFilter ? mockDb.asignaciones.filter(item => item.id_taller === Number(workshopFilter)) : mockDb.asignaciones;
    return ok(items);
  }
  if (pathname === '/api/v1/logistica/asignaciones' && method === 'POST') {
    return ok(buildAsignacionCreate(readJsonBody(request.body)));
  }
  const asignacionId = parseId(pathname, /^\/api\/v1\/logistica\/asignaciones\/(\d+)/);
  if (asignacionId !== null && pathname.endsWith('/respuesta') && method === 'PATCH') {
    const updated = buildAsignacionResponse(asignacionId, readJsonBody(request.body));
    return updated ? ok(updated) : fail(`Asignación ${asignacionId} no encontrada`);
  }

  if (pathname === '/api/v1/logistica/pagos' && method === 'POST') {
    return ok(buildPagoCreate(readJsonBody(request.body)));
  }
  if (pathname === '/api/v1/logistica/pagos/tecnico/cobro' && method === 'POST') {
    return ok(buildCobroTecnico(readJsonBody(request.body)));
  }
  if (pathname === '/api/v1/logistica/pagos/cliente' && method === 'GET') {
    return ok(mockDb.pagos);
  }
  if (pathname === '/api/v1/logistica/pagos/historial' && method === 'GET') {
    const workshopFilter = url.searchParams.get('taller_id');
    const items = workshopFilter ? mockDb.pagos.filter(item => item.id_taller === Number(workshopFilter)) : mockDb.pagos;
    return ok(items);
  }
  if (pathname === '/api/v1/logistica/pagos/resumen' && method === 'GET') {
    const workshopFilter = url.searchParams.get('taller_id');
    return ok(buildFinancialSummary(workshopFilter ? Number(workshopFilter) : undefined));
  }
  if (pathname === '/api/v1/logistica/admin/pagos' && method === 'GET') {
    return ok(mockDb.pagos);
  }

  if (pathname === '/api/v1/logistica/notificaciones' && method === 'GET') {
    const unreadOnly = url.searchParams.get('unread_only') === 'true';
    return ok(getNotificationsForUser(getCurrentUserId(), unreadOnly));
  }
  const notificationId = parseId(pathname, /^\/api\/v1\/logistica\/notificaciones\/(\d+)\/leer/);
  if (notificationId !== null && method === 'PATCH') {
    const updated = markNotificationRead(notificationId);
    return updated ? ok(updated) : fail(`Notificación ${notificationId} no encontrada`);
  }
  if (pathname === '/api/v1/logistica/notificaciones/test/manual' && method === 'POST') {
    return ok({ status: 'ok', message: 'Notificación demo enviada' });
  }

  if (pathname === '/api/v1/asignacion/analisis' && method === 'GET') {
    const limit = Number(url.searchParams.get('limit') ?? 100);
    return ok(mockDb.analyses.slice(0, limit));
  }
  const analisisIncidentId = parseId(pathname, /^\/api\/v1\/asignacion\/incidentes\/(\d+)/);
  if (analisisIncidentId !== null && pathname.endsWith('/transcribir') && method === 'POST') {
    return ok(buildTranscription(analisisIncidentId));
  }
  if (analisisIncidentId !== null && pathname.endsWith('/extraer-informacion') && method === 'POST') {
    return ok(buildExtraction(analisisIncidentId));
  }
  if (analisisIncidentId !== null && pathname.endsWith('/clasificar') && method === 'POST') {
    return ok(buildClassification(analisisIncidentId));
  }
  if (analisisIncidentId !== null && pathname.endsWith('/analizar-imagenes') && method === 'POST') {
    return ok(buildImageAnalysis(analisisIncidentId));
  }
  if (analisisIncidentId !== null && pathname.endsWith('/resumir-priorizar') && method === 'POST') {
    return ok(buildPrioritySummary(analisisIncidentId));
  }
  if (analisisIncidentId !== null && pathname.endsWith('/recomendar-taller') && method === 'POST') {
    return ok(buildAssignmentRecommendation(readJsonBody(request.body), analisisIncidentId));
  }
  if (analisisIncidentId !== null && pathname.endsWith('/analisis') && method === 'GET') {
    return ok(getAnalysisByIncidentId(analisisIncidentId));
  }
  if (analisisIncidentId !== null && pathname.endsWith('/trazabilidad') && method === 'GET') {
    return ok(buildTrazabilidad(analisisIncidentId));
  }
  if (analisisIncidentId !== null && pathname.endsWith('/feedback-asignacion') && method === 'POST') {
    return ok(buildCobroTecnico({ id_incidente: analisisIncidentId, diagnostico: 'Feedback demo', costo_servicio: 120 }));
  }

  const workshopAnalysisId = parseId(pathname, /^\/api\/v1\/asignacion\/talleres\/(\d+)/);
  if (workshopAnalysisId !== null && pathname.endsWith('/desempeno') && method === 'GET') {
    return ok(buildWorkshopPerformance(workshopAnalysisId));
  }
  if (workshopAnalysisId !== null && pathname.endsWith('/historial-desempeno') && method === 'GET') {
    const skip = Number(url.searchParams.get('skip') ?? 0);
    const limit = Number(url.searchParams.get('limit') ?? 50);
    return ok(buildWorkshopHistory(workshopAnalysisId, skip, limit));
  }
  if (workshopAnalysisId !== null && pathname.endsWith('/especialidades') && method === 'GET') {
    return ok(buildWorkshopSpecialties(workshopAnalysisId));
  }
  if (pathname === '/api/v1/asignacion/dashboard/analisis-talleres' && method === 'GET') {
    return ok(buildDashboardAnalytics());
  }
  if (pathname === '/api/v1/asignacion/recommend-workshops' && method === 'POST') {
    return ok(buildWorkshopAssistant(readJsonBody(request.body)));
  }

  if (pathname === '/api/v1/talleres/talleres' && method === 'GET') {
    const disponibles = url.searchParams.get('disponibles') === 'true';
    return ok(disponibles ? mockDb.talleres.filter(workshop => workshop.activo) : mockDb.talleres);
  }
  const talleresId = parseId(pathname, /^\/api\/v1\/talleres\/talleres\/(\d+)$/);
  if (talleresId !== null && method === 'GET') {
    const workshop = getWorkshopById(talleresId);
    return workshop ? ok(workshop) : fail(`Taller ${talleresId} no encontrado`);
  }

  if (pathname === '/api/v1/logistica/talleres' && method === 'POST') {
    return ok(buildTallerCreate(readJsonBody(request.body)));
  }
  const logisticaTallerId = parseId(pathname, /^\/api\/v1\/logistica\/talleres\/(\d+)$/);
  if (logisticaTallerId !== null && method === 'PATCH') {
    const workshop = buildTallerUpdate(logisticaTallerId, readJsonBody(request.body));
    return workshop ? ok(workshop) : fail(`Taller ${logisticaTallerId} no encontrado`);
  }
  if (logisticaTallerId !== null && method === 'GET') {
    const workshop = getWorkshopById(logisticaTallerId);
    return workshop ? ok(workshop) : fail(`Taller ${logisticaTallerId} no encontrado`);
  }

  if (pathname === '/api/v1/logistica/talleres' && method === 'GET') {
    return ok(mockDb.talleres);
  }

  return fail(`Ruta mock no implementada: ${request.method} ${pathname}`);
};