import { Component, OnInit, inject, computed, signal } from '@angular/core';
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

  private readonly demoPendingServices = [
    { id: 'INC-0142', vehicle: 'Toyota Corolla 2018', issue: 'Falla eléctrica', time: '08:15' },
    { id: 'INC-0143', vehicle: 'Suzuki Vitara 2020', issue: 'Pinchazo de llanta', time: '08:40' },
    { id: 'INC-0144', vehicle: 'Hyundai Tucson 2021', issue: 'Sobrecalentamiento', time: '09:10' },
    { id: 'INC-0145', vehicle: 'Nissan Frontier 2019', issue: 'Ruidos en frenos', time: '09:35' },
    { id: 'INC-0146', vehicle: 'Chevrolet Spark 2017', issue: 'Batería descargada', time: '10:05' },
    { id: 'INC-0147', vehicle: 'Kia Sportage 2022', issue: 'Golpe en carrocería', time: '10:30' },
  ];

  private readonly demoTechnicians = [
    { name: 'Ricardo Siles', status: 'Disponible', class: 'status-success' },
    { name: 'María Flores', status: 'En atención', class: 'status-warning' },
    { name: 'Jorge Pérez', status: 'Disponible', class: 'status-success' },
    { name: 'Ana López', status: 'Ocupado', class: 'status-warning' },
    { name: 'Carlos Mendoza', status: 'Disponible', class: 'status-success' },
    { name: 'Valeria Rojas', status: 'En ruta', class: 'status-warning' },
  ];

  stats = signal([
    { title: 'Atenciones Disponibles', value: '0', icon: 'build', color: 'blue' },
    { title: 'Técnicos', value: '0', icon: 'engineering', color: 'green' },
    { title: 'Ganancias del Mes', value: 'Bs. 0', icon: 'payments', color: 'orange' },
    { title: 'Valoración Clientes', value: '4.8', icon: 'star', color: 'red' },
  ]);

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
    this.stats.update(list => list.map(stat => stat.title === title ? { ...stat, value } : stat));
  }

  private setDemoDashboardData() {
    this.pendingServices = [...this.demoPendingServices];
    this.technicians = [...this.demoTechnicians];
    this.actualizarStat(this.esTecnico() ? 'Solicitudes Disponibles' : 'Atenciones Disponibles', String(this.pendingServices.length));
    this.actualizarStat('Técnicos', String(this.technicians.length));
    this.actualizarStat('Ganancias del Mes', 'Bs. 48,250');
  }

  cargarDatos() {
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
      error: () => {
        this.pendingServices = [];
        this.actualizarStat('Atenciones Disponibles', '0');
      }
    });

    if (!this.esTecnico()) {
      const tallerId = this.getTallerId();
      if (!tallerId) {
        this.actualizarStat('Técnicos', '0');
        this.actualizarStat('Ganancias del Mes', 'Bs. 0');
        return;
      }

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
        },
        error: () => {
          this.technicians = [];
          this.actualizarStat('Técnicos', '0');
        }
      });

      this.logisticaService.resumenFinanciero(tallerId).subscribe({
        next: (resumen) => {
          this.actualizarStat('Ganancias del Mes', `Bs. ${Number(resumen.total_neto_taller).toLocaleString()}`);
        },
        error: () => {
          this.actualizarStat('Ganancias del Mes', 'Bs. 0');
        }
      });
    }
  }
}
