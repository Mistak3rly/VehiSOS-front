import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-taller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './taller-dashboard.component.html',
  styleUrl: '../main/dashboard.component.scss', // Reusing base styles
})
export class TallerDashboardComponent implements OnInit {
  stats = [
    { title: 'Atenciones Disponibles', value: '0', icon: 'build', color: 'blue' },
    { title: 'Técnicos', value: '0', icon: 'engineering', color: 'green' },
    { title: 'Ganancias del Mes', value: '$0', icon: 'payments', color: 'orange' },
    { title: 'Valoración Clientes', value: '4.8', icon: 'star', color: 'red' },
  ];

  pendingServices: any[] = [];
  technicians: any[] = [];

  constructor(
    private logisticaService: LogisticaService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.cargarDatos();
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
        this.actualizarStat('Atenciones Disponibles', this.pendingServices.length.toString());
      }
    });

    const tallerId = 1; // ID temporal hasta obtener del auth
    this.logisticaService.listPersonal(tallerId).subscribe({
      next: (personal) => {
        this.technicians = personal.map(p => ({
          name: `Personal #${p.id_usuario}`,
          status: p.disponible ? 'Disponible' : 'Ocupado',
          class: p.disponible ? 'status-success' : 'status-warning'
        }));
        this.actualizarStat('Técnicos', this.technicians.length.toString());
      }
    });
    this.logisticaService.resumenFinanciero(tallerId).subscribe({
      next: (resumen) => {
        this.actualizarStat('Ganancias del Mes', `$${resumen.total_neto_taller.toLocaleString()}`);
      }
    });
  }

  actualizarStat(title: string, value: string) {
    const stat = this.stats.find(s => s.title === title);
    if (stat) stat.value = value;
  }
}
