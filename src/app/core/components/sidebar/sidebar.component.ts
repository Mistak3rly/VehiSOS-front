import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

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
  isCollapsed = signal(false);
  isMobileOpen = signal(false);
  userRole = signal<string>('Cliente'); // Default for demo

  menuItems: MenuItem[] = [
    // Dashboard redirects based on role
    { title: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['Cliente'] },
    { title: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard', roles: ['Administrador'] },
    { title: 'Dashboard', icon: 'dashboard', route: '/taller/dashboard', roles: ['Taller'] },
    { title: 'Dashboard', icon: 'dashboard', route: '/tecnico/dashboard', roles: ['Técnico'] },

    // CLIENTE MODULES
    {
      title: 'Vehículos',
      icon: 'directions_car',
      roles: ['Cliente'],
      subItems: [
        { title: 'Mis vehículos', route: '/vehiculos' },
        { title: 'Registrar vehículo', route: '/vehiculos/registrar' },
        { title: 'Historial de vehículos', route: '/vehiculos/historial' },
      ],
    },
    {
      title: 'Reportar Emergencia',
      icon: 'emergency',
      roles: ['Cliente'],
      route: '/emergencias/reportar'
    },
    {
      title: 'Mis Solicitudes',
      icon: 'assignment',
      roles: ['Cliente'],
      subItems: [
        { title: 'Seguimiento de solicitudes', route: '/solicitudes/seguimiento' },
        { title: 'Historial', route: '/solicitudes/historial' },
      ],
    },

    // TALLER MODULES
    {
      title: 'Solicitudes',
      icon: 'assignment',
      roles: ['Taller'],
      subItems: [
        { title: 'Gestión de solicitudes', route: '/taller/solicitudes' },
        { title: 'Historial de atenciones', route: '/taller/historial' },
      ],
    },

    {
      title: 'Gestionar Técnicos',
      icon: 'engineering',
      roles: ['Taller'],
      subItems: [
        { title: 'Gestión de técnicos', route: '/tecnicos' },
        { title: 'Disponibilidad', route: '/tecnicos' },
      ],
    },

    // TÉCNICO MODULES
    {
      title: 'Atención',
      icon: 'build',
      roles: ['Técnico'],
      subItems: [
        { title: 'Casos Asignados', route: '/tecnico/casos' },
        { title: 'Análisis de Incidente', route: '/tecnico/analisis' },
        { title: 'Evidencias', route: '/tecnico/evidencias' },
        { title: 'Trazabilidad', route: '/tecnico/trazabilidad' },
      ],
    },

    // ADMINISTRADOR MODULES
    {
      title: 'Administración',
      icon: 'admin_panel_settings',
      roles: ['Administrador'],
      subItems: [
        { title: 'Usuarios', route: '/admin/usuarios' },
        { title: 'Talleres', route: '/admin/talleres' },
        { title: 'Roles y Permisos', route: '/admin/roles' },
        { title: 'Auditoría', route: '/admin/auditoria' },
      ],
    },
    {
      title: 'Reportes y Analítica',
      icon: 'analytics',
      roles: ['Administrador'],
      subItems: [
        { title: 'Trazabilidad Global', route: '/admin/trazabilidad' },
        { title: 'Reportes del Sistema', route: '/admin/reportes' },
      ],
    },

    // SHARED MODULES
    { title: 'Pagos y Comisiones', icon: 'payments', route: '/pagos', roles: ['Cliente', 'Taller', 'Administrador'] },
    { title: 'Notificaciones', icon: 'notifications', route: '/notificaciones', roles: ['Cliente', 'Taller', 'Técnico'] },
    { title: 'Mi Perfil', icon: 'person', route: '/perfil', roles: ['Cliente', 'Taller', 'Administrador', 'Técnico'] },
    { title: 'Cerrar sesión', icon: 'logout', route: '/login', roles: ['Cliente', 'Taller', 'Administrador', 'Técnico'] },
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
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      this.userRole.set(savedRole);
    }
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
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }
}
