import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Solicitud {
  id: string;
  vehiculo: string;
  incidente: string;
  fecha: string;
  estado: 'Pendiente' | 'Asignada' | 'En camino' | 'En atención' | 'Finalizada' | 'Cancelada';
  descripcion?: string;
  ubicacion?: string;
  taller?: string;
  tecnico?: string;
  tiempoEstimado?: string;
  evidencias?: string[];
  trazabilidad?: { evento: string; fecha: string; completado: boolean }[];
}

@Component({
  selector: 'app-vista-seguimiento',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vista-seguimiento.component.html',
  styleUrl: './vista-seguimiento.component.scss'
})
export class VistaSeguimientoSolicitudes implements OnInit {
  solicitudes = signal<Solicitud[]>([]);
  solicitudSeleccionada = signal<Solicitud | null>(null);
  viewMode = signal<'list' | 'detail'>('list');

  constructor() {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    // Simulación de datos
    const mockData: Solicitud[] = [
      {
        id: 'SOS-2024-001',
        vehiculo: 'Tesla Model 3 (ABC-123)',
        incidente: 'Falla mecánica',
        fecha: '24/04/2024 10:30',
        estado: 'En camino',
        descripcion: 'El vehículo no enciende y muestra alerta de sistema térmico.',
        ubicacion: 'Av. Busch y 2do Anillo',
        taller: 'Taller Central VehiSOS',
        tecnico: 'Carlos Rodriguez',
        tiempoEstimado: '15 min',
        evidencias: ['assets/demo/evidencia1.jpg'],
        trazabilidad: [
          { evento: 'Solicitud creada', fecha: '10:30 AM', completado: true },
          { evento: 'Solicitud recibida', fecha: '10:32 AM', completado: true },
          { evento: 'Taller asignado', fecha: '10:35 AM', completado: true },
          { evento: 'Técnico en camino', fecha: '10:40 AM', completado: true },
          { evento: 'Atención iniciada', fecha: '--', completado: false },
          { evento: 'Atención finalizada', fecha: '--', completado: false },
        ]
      },
      {
        id: 'SOS-2024-002',
        vehiculo: 'Toyota Hilux (XYZ-789)',
        incidente: 'Pinchazo de llanta',
        fecha: '23/04/2024 15:20',
        estado: 'Finalizada',
        descripcion: 'Llanta trasera derecha pinchada por clavo.',
        ubicacion: 'Equipetrol Calle 7',
        taller: 'Taller El Rayo',
        tecnico: 'Mario Gomez',
        tiempoEstimado: 'Atendido',
        trazabilidad: [
          { evento: 'Solicitud creada', fecha: '03:20 PM', completado: true },
          { evento: 'Solicitud recibida', fecha: '03:25 PM', completado: true },
          { evento: 'Taller asignado', fecha: '03:30 PM', completado: true },
          { evento: 'Técnico en camino', fecha: '03:40 PM', completado: true },
          { evento: 'Atención iniciada', fecha: '04:00 PM', completado: true },
          { evento: 'Atención finalizada', fecha: '04:30 PM', completado: true },
        ]
      },
      {
        id: 'SOS-2024-003',
        vehiculo: 'Tesla Model 3 (ABC-123)',
        incidente: 'Batería descargada',
        fecha: '24/04/2024 14:00',
        estado: 'Pendiente',
        descripcion: 'Me quedé sin carga cerca de la plaza principal.',
        ubicacion: 'Plaza 24 de Septiembre',
        taller: undefined,
        tecnico: undefined,
        tiempoEstimado: undefined,
        trazabilidad: [
          { evento: 'Solicitud creada', fecha: '02:00 PM', completado: true },
          { evento: 'Solicitud recibida', fecha: '02:05 PM', completado: true },
          { evento: 'Taller asignado', fecha: '--', completado: false },
        ]
      }
    ];
    this.solicitudes.set(mockData);
  }

  verDetalleSolicitud(solicitud: Solicitud) {
    this.solicitudSeleccionada.set(solicitud);
    this.viewMode.set('detail');
  }

  volverALista() {
    this.solicitudSeleccionada.set(null);
    this.viewMode.set('list');
  }

  getEstadoClass(estado: string): string {
    return 'status-' + estado.toLowerCase().replace(' ', '-');
  }
}
