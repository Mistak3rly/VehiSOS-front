import { Routes } from '@angular/router';
import { Register } from './features/auth/pages/register/register';
import { VistaLogin } from './features/auth/pages/login/vista-login';
import { ForgotPassword } from './features/auth/pages/forgot-password/forgot-password';
import { DashboardComponent } from './features/dashboard/pages/main/dashboard.component';
import { TallerDashboardComponent } from './features/dashboard/pages/taller/taller-dashboard.component';
import { VistaPerfiles } from './features/profile/pages/main/vista-perfiles.component';
import { VistaVehiculos } from './features/vehicles/pages/main/vista-vehiculos.component';
import { Formulario_Vehiculo } from './features/vehicles/pages/register/formulario-vehiculo';
import { HistorialVehiculos } from './features/vehicles/pages/history/historial-vehiculos.component';
import { VistaReportarEmergencia } from './features/emergencies/pages/report/vista-reportar-emergencia';
import { VistaSeguimientoSolicitudes } from './features/requests/pages/tracking/vista-seguimiento.component';
import { Vista_gestion_tecnicos } from './features/taller/pages/technicians/gestion-tecnicos.component';
import { VistaGestionSolicitudes } from './features/taller/pages/requests/vista-gestion-solicitudes';
import { DetalleIncidenteComponent } from './features/taller/pages/incident-detail/incident-detail.component';
import { PagoList } from './features/pagos/pages/pago-list/pago-list';
import { NotificacionList } from './features/notificaciones/pages/notificacion-list/notificacion-list';
import { AdminDashboard } from './features/dashboard/pages/admin-dashboard/admin-dashboard';
import { WorkshopApproval } from './features/admin/pages/workshop-approval/workshop-approval';
import { AlgorithmConfig } from './features/admin/pages/algorithm-config/algorithm-config';
import { GlobalFinances } from './features/admin/pages/global-finances/global-finances';
import { UserManagement } from './features/admin/pages/user-management/user-management';
import { RolesPermissions } from './features/admin/pages/roles-permissions/roles-permissions';
import { AuditLogs } from './features/admin/pages/audit-logs/audit-logs';
import { TenantManagement } from './features/admin/pages/tenant-management/tenant-management';
import { RecomendacionIAComponent } from './features/talleres/pages/recomendacion-ia/recomendacion-ia.component';
import { ServiciosCobertura } from './features/taller/pages/servicios-cobertura/servicios-cobertura.component';

// CU-025: Cotizaciones
import { GestionCotizacionesComponent } from './features/taller/pages/cotizaciones/gestion-cotizaciones.component';
import { VistaCotizacionesComponent } from './features/cliente/pages/cotizaciones/vista-cotizaciones.component';

// CU-026/027/028/029/030: Analítica
import { KpiDashboardComponent } from './features/analitica/pages/kpi/kpi-dashboard.component';
import { RendimientoComponent } from './features/analitica/pages/rendimiento/rendimiento.component';
import { MapaIncidentesComponent } from './features/analitica/pages/mapa/mapa-incidentes.component';
import { ReportesComponent } from './features/analitica/pages/reportes/reportes.component';
import { ResumenAsistenciaComponent } from './features/analitica/pages/resumen/resumen-asistencia.component';

export const routes: Routes = [
  { path: 'login', component: VistaLogin },
  { path: 'admin/login', component: VistaLogin, data: { adminLogin: true } },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },

  // ── ADMIN ──────────────────────────────────────────────────────────────────
  { path: 'admin/dashboard', component: AdminDashboard },
  { path: 'admin/talleres/aprobacion', component: WorkshopApproval },
  { path: 'admin/configuracion', component: AlgorithmConfig },
  { path: 'admin/finanzas', component: GlobalFinances },
  { path: 'admin/usuarios', component: UserManagement },
  { path: 'admin/tenants', component: TenantManagement },
  { path: 'admin/roles', component: RolesPermissions },
  { path: 'admin/auditoria', component: AuditLogs },
  // Analítica global (admin)
  { path: 'admin/kpi', component: KpiDashboardComponent },
  { path: 'admin/rendimiento', component: RendimientoComponent },
  { path: 'admin/mapa', component: MapaIncidentesComponent },
  { path: 'admin/reportes', component: ReportesComponent },

  // ── TALLER + TÉCNICO ───────────────────────────────────────────────────────
  { path: 'taller/dashboard', component: TallerDashboardComponent },
  { path: 'taller/solicitudes', component: VistaGestionSolicitudes },
  { path: 'taller/solicitudes/:id', component: DetalleIncidenteComponent },
  { path: 'taller/pagos', component: PagoList },
  { path: 'taller/servicios-cobertura', component: ServiciosCobertura },
  { path: 'taller/cotizaciones', component: GestionCotizacionesComponent },        // CU-025
  { path: 'taller/kpi', component: KpiDashboardComponent },                        // CU-026
  { path: 'taller/rendimiento', component: RendimientoComponent },                 // CU-027
  { path: 'taller/mapa', component: MapaIncidentesComponent },                     // CU-028
  { path: 'taller/reportes', component: ReportesComponent },                       // CU-029
  { path: 'tecnicos', component: Vista_gestion_tecnicos },

  // ── CLIENTE ────────────────────────────────────────────────────────────────
  { path: 'dashboard', component: DashboardComponent },
  { path: 'cliente/vehiculos/registrar', component: Formulario_Vehiculo },
  { path: 'cliente/vehiculos/historial', component: HistorialVehiculos },
  { path: 'cliente/emergencias/reportar', component: VistaReportarEmergencia },
  { path: 'cliente/solicitudes/seguimiento', component: VistaSeguimientoSolicitudes },
  { path: 'cliente/talleres/recomendacion-ia', component: RecomendacionIAComponent },
  { path: 'cliente/cotizaciones', component: VistaCotizacionesComponent },          // CU-025
  { path: 'cliente/resumen/:id', component: ResumenAsistenciaComponent },           // CU-030

  // ── SHARED ─────────────────────────────────────────────────────────────────
  { path: 'perfil', component: VistaPerfiles },
  { path: 'vehiculos', component: VistaVehiculos },
  { path: 'notificaciones', component: NotificacionList },
  { path: 'analitica/kpi', component: KpiDashboardComponent },
  { path: 'analitica/rendimiento', component: RendimientoComponent },
  { path: 'analitica/mapa', component: MapaIncidentesComponent },
  { path: 'analitica/reportes', component: ReportesComponent },
  { path: 'analitica/resumen/:id', component: ResumenAsistenciaComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
