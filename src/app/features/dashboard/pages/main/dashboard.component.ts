import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { EmergenciasService } from '../../../../core/services/emergencias.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  userName = '...';
  currentDate = new Date();
  
  stats = [
    { title: 'Solicitudes activas', value: '0', icon: 'assignment', color: 'blue' },
    { title: 'Emergencias hoy', value: '0', icon: 'emergency', color: 'red' },
    { title: 'Vehículos registrados', value: '0', icon: 'directions_car', color: 'green' },
    { title: 'Pagos pendientes', value: '$0', icon: 'payments', color: 'orange' },
  ];

  recentActivity: any[] = [];
  myVehicles: any[] = [];

  constructor(
    private authService: AuthService,
    private emergenciasService: EmergenciasService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    const user = this.authService.currentUser();
    if (user) {
      this.userName = user.nombre;
    } else {
      // Intento por API si falla localStorage
      this.authService.getMe().subscribe({
        next: (u) => this.userName = u.nombre,
        error: () => this.userName = 'Usuario'
      });
    }

    this.emergenciasService.listVehiculos().subscribe({
      next: (vehiculos) => {
        this.myVehicles = vehiculos.map(v => ({
          brand: v.marca,
          model: v.modelo,
          plate: v.placa,
          image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=200&auto=format&fit=crop' // placeholder
        }));
        this.actualizarStat('Vehículos registrados', this.myVehicles.length.toString());
      }
    });

    this.emergenciasService.listIncidentes().subscribe({
      next: (incidentes) => {
        let activas = 0;
        let emergenciasHoy = 0;
        const hoy = new Date().toDateString();

        this.recentActivity = incidentes.map(inc => {
          const incDate = new Date(inc.fecha_reporte);
          if (incDate.toDateString() === hoy) emergenciasHoy++;
          
          const estado = inc.estado_servicio?.nombre || 'Pendiente';
          const estadoCod = inc.estado_servicio?.codigo || 'pendiente';
          
          let statusClass = 'status-warning';
          if (estadoCod.includes('finalizad')) statusClass = 'status-success';
          else if (estadoCod.includes('camino') || estadoCod.includes('asignad')) statusClass = 'status-info';

          if (!estadoCod.includes('finalizad') && !estadoCod.includes('cancelad')) {
            activas++;
          }

          return {
            id: inc.id,
            type: inc.tipo_incidente?.nombre || 'General',
            description: inc.descripcion_texto || inc.titulo,
            time: this.datePipe.transform(inc.fecha_reporte, 'shortTime') || '',
            status: estado,
            statusClass: statusClass
          };
        }).sort((a, b) => b.id - a.id).slice(0, 5); // top 5 recientes

        this.actualizarStat('Solicitudes activas', activas.toString());
        this.actualizarStat('Emergencias hoy', emergenciasHoy.toString());
      }
    });
  }

  actualizarStat(title: string, value: string) {
    const stat = this.stats.find(s => s.title === title);
    if (stat) stat.value = value;
  }
}
