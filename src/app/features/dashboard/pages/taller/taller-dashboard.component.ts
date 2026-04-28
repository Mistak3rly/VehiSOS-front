import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-taller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './taller-dashboard.component.html',
  styleUrl: '../main/dashboard.component.scss',
})
export class TallerDashboardComponent implements OnInit {
  private auth = inject(AuthService);

  // Computed: detectar si el usuario es técnico
  esTecnico = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return false;
    return user.roles?.some(r => r.nombre.toLowerCase() === 'tecnico') ?? false;
  });

  nombreUsuario = computed(() => {
    const user = this.auth.currentUser();
    return user ? `${user.nombre} ${user.apellidos}` : '';
  });

  nombreInicial = computed(() => {
    const user = this.auth.currentUser();
    return user?.nombre?.charAt(0).toUpperCase() ?? 'T';
  });

  stats = computed(() => {
    if (this.esTecnico()) {
      return [
        { title: 'Solicitudes Disponibles', value: '0', icon: 'build', color: 'blue' },
        { title: 'Atenciones Hoy', value: '0', icon: 'check_circle', color: 'green' },
        { title: 'Tiempo Promedio', value: '—', icon: 'timer', color: 'orange' },
        { title: 'Mi Calificación', value: '—', icon: 'star', color: 'red' },
      ];
    }
    return [
      { title: 'Atenciones Disponibles', value: '0', icon: 'build', color: 'blue' },
      { title: 'Técnicos', value: '0', icon: 'engineering', color: 'green' },
      { title: 'Ganancias del Mes', value: 'Bs. 0', icon: 'payments', color: 'orange' },
      { title: 'Valoración Clientes', value: '4.8', icon: 'star', color: 'red' },
    ];
  });

  pendingServices: any[] = [];
  technicians: any[] = [];

  constructor(
    private logisticaService: LogisticaService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  private getTallerId(): number | null {
    const user = this.auth.currentUser();
    if (user?.taller_id) return user.taller_id;
    try {
      const stored = localStorage.getItem('user');
      return stored ? (JSON.parse(stored).taller_id ?? null) : null;
    } catch { return null; }
  }

  private actualizarStat(title: string, value: string) {
    // Los stats son computed, actualizamos el array subyacente via referencia
    const list = this.stats();
    const stat = list.find(s => s.title === title);
    if (stat) stat.value = value;
  }

  cargarDatos() {
    // Solicitudes disponibles (funciona para taller y técnico)
    this.logisticaService.listSolicitudesDisponibles().subscribe({
      next: (solicitudes) => {
        this.pendingServices = solicitudes.map(s => ({
          id: s.codigo_incidente,
          vehicle: s.titulo || 'Sin Título',
          issue: s.tipo_codigo || 'General',
          time: this.datePipe.transform(s.fecha_reporte, 'shortTime') || ''
        }));
        const statTitle = this.esTecnico() ? 'Solicitudes Disponibles' : 'Atenciones Disponibles';
        this.actualizarStat(statTitle, this.pendingServices.length.toString());
      },
      error: () => { /* sin taller asociado aún */ }
    });

    // Solo para taller propietario: técnicos y finanzas
    if (!this.esTecnico()) {
      const tallerId = this.getTallerId();
      if (!tallerId) return;

      this.logisticaService.listPersonal(tallerId).subscribe({
        next: (personal) => {
          this.technicians = personal.map(p => ({
            name: p.nombre_usuario
              ? `${p.nombre_usuario} ${p.apellidos_usuario ?? ''}`.trim()
              : `Técnico #${p.id_usuario}`,
            status: p.disponible ? 'Disponible' : 'Ocupado',
            class: p.disponible ? 'status-success' : 'status-warning'
          }));
          this.actualizarStat('Técnicos', this.technicians.length.toString());
        }
      });

      this.logisticaService.resumenFinanciero(tallerId).subscribe({
        next: (resumen) => {
          this.actualizarStat('Ganancias del Mes', `Bs. ${Number(resumen.total_neto_taller).toLocaleString()}`);
        }
      });
    }
  }
}
