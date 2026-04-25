import { Routes } from '@angular/router';
import { Register } from './features/auth/pages/register/register';
import { VistaLogin } from './features/auth/pages/login/vista-login';
import { ForgotPassword } from './features/auth/pages/forgot-password/forgot-password';
import { DashboardComponent } from './features/dashboard/pages/main/dashboard.component';
import { AdminDashboardComponent } from './features/dashboard/pages/admin/admin-dashboard.component';
import { TallerDashboardComponent } from './features/dashboard/pages/taller/taller-dashboard.component';
import { TecnicoDashboardComponent } from './features/dashboard/pages/tecnico/tecnico-dashboard.component';
import { VistaPerfiles } from './features/profile/pages/main/vista-perfiles.component';
import { VistaVehiculos } from './features/vehicles/pages/main/vista-vehiculos.component';
import { Formulario_Vehiculo } from './features/vehicles/pages/register/formulario-vehiculo';
import { HistorialVehiculos } from './features/vehicles/pages/history/historial-vehiculos.component';
import { VistaReportarEmergencia } from './features/emergencies/pages/report/vista-reportar-emergencia';
import { VistaSeguimientoSolicitudes } from './features/requests/pages/tracking/vista-seguimiento.component';
import { Vista_gestion_tecnicos } from './features/taller/pages/technicians/gestion-tecnicos.component';
import { VistaGestionSolicitudes } from './features/taller/pages/requests/vista-gestion-solicitudes';


export const routes: Routes = [
  { path: 'login', component: VistaLogin },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'taller/dashboard', component: TallerDashboardComponent },
  { path: 'tecnico/dashboard', component: TecnicoDashboardComponent },
  { path: 'perfil', component: VistaPerfiles },
  { path: 'vehiculos', component: VistaVehiculos },
  { path: 'cliente/vehiculos/registrar', component: Formulario_Vehiculo },
  { path: 'cliente/vehiculos/historial', component: HistorialVehiculos },
  { path: 'cliente/emergencias/reportar', component: VistaReportarEmergencia },
  { path: 'cliente/solicitudes/seguimiento', component: VistaSeguimientoSolicitudes },
  { path: 'tecnicos', component: Vista_gestion_tecnicos },
  { path: 'taller/solicitudes', component: VistaGestionSolicitudes },
  { path: '', redirectTo: 'login', pathMatch: 'full' }

];
