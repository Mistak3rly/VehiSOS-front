import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { LogisticaService } from '../../services/logistica.service';

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
  private logistica = inject(LogisticaService);
  isCollapsed = signal(false);
  isMobileOpen = signal(false);
  unreadCount = signal(0);
  
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
    { title: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['Cliente'] },
    {
      title: 'Vehículos', icon: 'directions_car', roles: ['Cliente'],
      subItems: [
        { title: 'Mis vehículos',       route: '/vehiculos' },
        { title: 'Registrar vehículo',  route: '/cliente/vehiculos/registrar' },
        { title: 'Historial',           route: '/cliente/vehiculos/historial' },
      ],
    },
    {
      title: 'Emergencias', icon: 'emergency', roles: ['Cliente'],
      subItems: [
        { title: 'Reportar Emergencia', route: '/cliente/emergencias/reportar' },
        { title: 'Seguimiento',         route: '/cliente/solicitudes/seguimiento' },
      ],
    },

    // ── TALLER / OPERADOR ─────────────────────────────────
    { title: 'Dashboard', icon: 'dashboard', route: '/taller/dashboard', roles: ['Taller', 'Operador', 'Tecnico', 'Operario'] },
    {
      title: 'Operaciones', icon: 'engineering', roles: ['Taller', 'Operador', 'Tecnico', 'Operario'],
      subItems: [
        { title: 'Gestión de solicitudes', route: '/taller/solicitudes' },
        { title: 'Gestionar Técnicos',     route: '/tecnicos' },
        { title: 'Liquidaciones',          route: '/taller/pagos' },
      ],
    },

    // ── ADMINISTRADOR — ítems directos (sin agrupar) ──────
    { title: 'Dashboard',              icon: 'dashboard',            route: '/admin/dashboard',          roles: ['Administrador'] },
    { title: 'Aprobación de Talleres', icon: 'verified',             route: '/admin/talleres/aprobacion', roles: ['Administrador'] },
    { title: 'Config. Algoritmo',      icon: 'tune',                 route: '/admin/configuracion',       roles: ['Administrador'] },
    { title: 'Finanzas Globales',      icon: 'account_balance',      route: '/admin/finanzas',            roles: ['Administrador'] },
    { title: 'Gestión de Usuarios',    icon: 'manage_accounts',      route: '/admin/usuarios',            roles: ['Administrador'] },
    { title: 'Roles y Permisos',       icon: 'security',             route: '/admin/roles',               roles: ['Administrador'] },
    { title: 'Auditoría',              icon: 'fact_check',           route: '/admin/auditoria',           roles: ['Administrador'] },

    // ── COMPARTIDOS ───────────────────────────────────────
    { title: 'Mi Perfil',       icon: 'person',        route: '/perfil',          roles: ['Cliente', 'Taller', 'Operador', 'Administrador', 'Tecnico', 'Operario'] },
    { title: 'Notificaciones',  icon: 'notifications', route: '/notificaciones',  roles: ['Cliente', 'Taller', 'Operador', 'Administrador', 'Tecnico', 'Operario'] },
    { title: 'Cerrar sesión',   icon: 'logout',        route: '/login',           roles: ['Cliente', 'Taller', 'Operador', 'Administrador', 'Tecnico', 'Operario'] },
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
    this.loadUnreadCount();
    this.logistica.conectarNotificacionesWs(); // Iniciar conexión en tiempo real [CU-013]
    this.logistica.notificacion$.subscribe(() => {
      this.unreadCount.update(c => c + 1);
    });
  }

  loadUnreadCount() {
    this.logistica.listNotificaciones(true).subscribe(data => {
      this.unreadCount.set(data.length);
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
    
    // Normalizar el rol del usuario actual
    let currentUserRole = this.userRole().toLowerCase();
    if (currentUserRole === 'admin') {
      currentUserRole = 'administrador';
    }

    // Normalizar los roles requeridos para este ítem
    const requiredRoles = item.roles.map(r => {
      const lower = r.toLowerCase();
      return lower === 'admin' ? 'administrador' : lower;
    });

    return requiredRoles.includes(currentUserRole);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
