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
import { AdminDashboard } from './features/dashboard/pages/admin-dashboard/admin-dashboard';
import { WorkshopApproval } from './features/admin/pages/workshop-approval/workshop-approval';
import { AlgorithmConfig } from './features/admin/pages/algorithm-config/algorithm-config';
import { GlobalFinances } from './features/admin/pages/global-finances/global-finances';
import { UserManagement } from './features/admin/pages/user-management/user-management';
import { RolesPermissions } from './features/admin/pages/roles-permissions/roles-permissions';
import { AuditLogs } from './features/admin/pages/audit-logs/audit-logs';
import { RecomendacionIAComponent } from './features/talleres/pages/recomendacion-ia/recomendacion-ia.component';

export const routes: Routes = [
  { path: 'login', component: VistaLogin },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'dashboard', component: DashboardComponent },
  
  // ADMIN ROUTES
  { path: 'admin/dashboard', component: AdminDashboard },
  { path: 'admin/talleres/aprobacion', component: WorkshopApproval },
  { path: 'admin/configuracion', component: AlgorithmConfig },
  { path: 'admin/finanzas', component: GlobalFinances },
  { path: 'admin/usuarios', component: UserManagement },
  { path: 'admin/roles', component: RolesPermissions },
  { path: 'admin/auditoria', component: AuditLogs },
  
  //OPERARIO ROUTES
  { path: 'taller/dashboard', component: TallerDashboardComponent },
  { path: 'taller/solicitudes', component: VistaGestionSolicitudes },
  { path: 'taller/solicitudes/:id', component: DetalleIncidenteComponent },
  { path: 'taller/pagos', component: PagoList },
  { path: 'perfil', component: VistaPerfiles },
  { path: 'vehiculos', component: VistaVehiculos },

  //CLIENTE ROUTES
  { path: 'cliente/vehiculos/registrar', component: Formulario_Vehiculo },
  { path: 'cliente/vehiculos/historial', component: HistorialVehiculos },
  { path: 'cliente/emergencias/reportar', component: VistaReportarEmergencia },
  { path: 'cliente/solicitudes/seguimiento', component: VistaSeguimientoSolicitudes },
  { path: 'cliente/talleres/recomendacion-ia', component: RecomendacionIAComponent },
  { path: 'tecnicos', component: Vista_gestion_tecnicos },

  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
