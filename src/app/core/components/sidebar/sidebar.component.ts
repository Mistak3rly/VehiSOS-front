import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { LogisticaService } from '../../services/logistica.service';
import { environment } from '../../../../environments/environment';
import { TenantRead } from '../../models/api.models';

interface SubMenuItem {
  title: string;
  route: string;
}

interface MenuItem {
  title: string;
  icon: string;
  route?: string;
  subItems?: SubMenuItem[];
  roles?: string[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  private auth = inject(AuthService);
  private adminService = inject(AdminService);
  private logistica = inject(LogisticaService);
  isCollapsed = signal(false);
  isMobileOpen = signal(false);
  unreadCount = signal(0);
  activeTenants = signal<TenantRead[]>([]);
  
  // Rol derivado reactivamente del servicio de autenticación
  userRole = computed(() => {
    const user = this.auth.currentUser();
    if (user && user.roles && user.roles.length > 0) {
      return user.roles[0].nombre;
    }
    return localStorage.getItem('userRole') || 'Cliente';
  });

  menuItems: MenuItem[] = [
    // ── CLIENTE ──────────────────────────────────────────
    { title: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['cliente'] },
    {
      title: 'Vehículos', icon: 'directions_car', roles: ['cliente'],
      subItems: [
        { title: 'Mis vehículos',       route: '/vehiculos' },
        { title: 'Registrar vehículo',  route: '/cliente/vehiculos/registrar' },
        { title: 'Historial',           route: '/cliente/vehiculos/historial' },
      ],
    },
    {
      title: 'Emergencias', icon: 'emergency', roles: ['cliente'],
      subItems: [
        { title: 'Reportar Emergencia', route: '/cliente/emergencias/reportar' },
        { title: 'Seguimiento',         route: '/cliente/solicitudes/seguimiento' },
      ],
    },

    // ── TALLER ────────────────────────────────────────────
    { title: 'Dashboard', icon: 'dashboard', route: '/taller/dashboard', roles: ['taller'] },
    {
      title: 'Operaciones', icon: 'engineering', roles: ['taller'],
      subItems: [
        { title: 'Gestión de solicitudes', route: '/taller/solicitudes' },
        { title: 'Gestionar Técnicos',     route: '/tecnicos' },
        { title: 'Pagos',                  route: '/taller/pagos' },
      ],
    },
    { title: 'Servicios y Cobertura', icon: 'room_service', route: '/taller/servicios-cobertura', roles: ['taller'] },

    // ── TÉCNICO (mismo dashboard taller, sin gestionar técnicos) ──
    { title: 'Dashboard', icon: 'dashboard', route: '/taller/dashboard', roles: ['tecnico'] },
    {
      title: 'Operaciones', icon: 'engineering', roles: ['tecnico'],
      subItems: [
        { title: 'Gestión de solicitudes', route: '/taller/solicitudes' },
        { title: 'Pagos',                  route: '/taller/pagos' },
      ],
    },

    // ── ADMINISTRADOR ─────────────────────────────────────
    { title: 'Dashboard',              icon: 'dashboard',            route: '/admin/dashboard',          roles: ['admin', 'administrador'] },
    { title: 'Aprobación de Talleres', icon: 'verified',             route: '/admin/talleres/aprobacion', roles: ['admin', 'administrador'] },
    { title: 'Tenants',                icon: 'domain',               route: '/admin/tenants',             roles: ['admin', 'administrador'] },
    { title: 'Config. Algoritmo',      icon: 'tune',                 route: '/admin/configuracion',       roles: ['admin', 'administrador'] },
    { title: 'Finanzas Globales',      icon: 'account_balance',      route: '/admin/finanzas',            roles: ['admin', 'administrador'] },
    { title: 'Gestión de Usuarios',    icon: 'manage_accounts',      route: '/admin/usuarios',            roles: ['admin', 'administrador'] },
    { title: 'Roles y Permisos',       icon: 'security',             route: '/admin/roles',               roles: ['admin', 'administrador'] },
    { title: 'Auditoría',              icon: 'fact_check',           route: '/admin/auditoria',           roles: ['admin', 'administrador'] },

    // ── COMPARTIDOS ───────────────────────────────────────
    { title: 'Mi Perfil',       icon: 'person',        route: '/perfil',         roles: ['cliente', 'taller', 'admin', 'administrador', 'tecnico'] },
    { title: 'Notificaciones',  icon: 'notifications', route: '/notificaciones', roles: ['cliente', 'taller', 'admin', 'administrador', 'tecnico'] },
  ];

  constructor(private router: Router) {
    // Escuchar cambios de ruta para cerrar el menú móvil automáticamente
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isMobileOpen.set(false);
    });
  }

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.loadUnreadCount();
      if (this.isAdminRole()) {
        this.loadActiveTenants();
      }
      if (!environment.useMockData) {
        this.logistica.conectarNotificacionesWs(); // Iniciar conexión en tiempo real [CU-013]
      }
      this.logistica.notificacionesActualizadas$.subscribe(() => {
        this.loadUnreadCount();
      });
    }
  }

  isAdminRole(): boolean {
    const currentRole = this.userRole().toLowerCase();
    return currentRole === 'admin' || currentRole === 'administrador';
  }

  loadActiveTenants() {
    if (!this.isAdminRole()) return;
    this.adminService.listTenants().subscribe({
      next: (tenants) => this.activeTenants.set(tenants.filter(tenant => tenant.activo)),
      error: () => this.activeTenants.set([]),
    });
  }

  loadUnreadCount() {
    if (!this.auth.isAuthenticated()) return;
    this.logistica.listNotificaciones(true).subscribe({
      next: (data) => this.unreadCount.set(data.length),
      error: () => this.unreadCount.set(0)
    });
  }

  toggleSidebar() {
    this.isCollapsed.set(!this.isCollapsed());
  }

  toggleMobileMenu() {
    this.isMobileOpen.set(!this.isMobileOpen());
  }

  toggleSubmenu(item: MenuItem) {
    if (!this.isCollapsed()) {
      item.expanded = !item.expanded;
    }
  }

  isItemVisible(item: MenuItem): boolean {
    if (!item.roles) return true;
    const currentRole = this.userRole().toLowerCase();
    return item.roles.map(r => r.toLowerCase()).includes(currentRole);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
