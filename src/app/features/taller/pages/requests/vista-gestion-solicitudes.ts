import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Solicitud {
  id: number;
  codigo: string;
  cliente: string;
  telefono: string;
  vehiculo: string;
  tipoIncidente: string;
  descripcion: string;
  ubicacion: { lat: number; lng: number; referencia: string };
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  estado: string;
  fechaReporte: Date;
  tecnicoAsignado?: string;
  tiempoEstimado?: string;
  evidencias: { tipo: string; url: string }[];
}

@Component({
  selector: 'app-vista-gestion-solicitudes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vista-gestion-solicitudes.html',
  styleUrls: ['./vista-gestion-solicitudes.scss']
})
export class VistaGestionSolicitudes implements OnInit {
  filterForm: FormGroup;
  statusForm: FormGroup;
  solicitudes = signal<Solicitud[]>([]);
  solicitudSeleccionada = signal<Solicitud | null>(null);
  isLoading = signal(false);
  showDetail = signal(false);

  // Mocks para técnicos
  tecnicos = [
    { id: 1, nombre: 'Juan Pérez', especialidad: 'Mecánica General' },
    { id: 2, nombre: 'Carlos Ruiz', especialidad: 'Electricidad' },
    { id: 3, nombre: 'Roberto Gómez', especialidad: 'Grúa/Logística' }
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      priority: ['']
    });

    this.statusForm = this.fb.group({
      tecnicoId: [''],
      estado: ['', [Validators.required]],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.isLoading.set(true);
    // Simulación de carga
    setTimeout(() => {
      const mockData: Solicitud[] = [
        {
          id: 1,
          codigo: 'SOL-001',
          cliente: 'Ana Martínez',
          telefono: '+591 78945612',
          vehiculo: 'Toyota Hilux (ABC-123)',
          tipoIncidente: 'Falla de motor',
          descripcion: 'El vehículo se apagó de repente y no vuelve a encender.',
          ubicacion: { lat: -17.7833, lng: -63.1821, referencia: 'Av. Las Américas, frente al surtidor.' },
          prioridad: 'Alta',
          estado: 'Disponible',
          fechaReporte: new Date(),
          evidencias: [
            { tipo: 'Foto', url: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=400&auto=format&fit=crop' }
          ]
        },
        {
          id: 2,
          codigo: 'SOL-002',
          cliente: 'Pedro Rocha',
          telefono: '+591 71234567',
          vehiculo: 'Tesla Model 3 (XYZ-789)',
          tipoIncidente: 'Llanta pinchada',
          descripcion: 'Necesito cambio de llanta en carretera.',
          ubicacion: { lat: -17.8145, lng: -63.1567, referencia: 'Km 15 carretera al norte.' },
          prioridad: 'Media',
          estado: 'Asignada',
          fechaReporte: new Date(Date.now() - 3600000),
          tecnicoAsignado: 'Carlos Ruiz',
          tiempoEstimado: '25 min',
          evidencias: []
        }
      ];
      this.solicitudes.set(mockData);
      this.isLoading.set(false);
    }, 800);
  }

  verDetalleSolicitud(solicitud: Solicitud) {
    this.solicitudSeleccionada.set(solicitud);
    this.statusForm.patchValue({
      estado: solicitud.estado,
      tecnicoId: this.tecnicos.find(t => t.nombre === solicitud.tecnicoAsignado)?.id || ''
    });
    this.showDetail.set(true);
  }

  volverALista() {
    this.showDetail.set(false);
    this.solicitudSeleccionada.set(null);
  }

  aceptarSolicitud() {
    const solicitud = this.solicitudSeleccionada();
    if (solicitud) {
      solicitud.estado = 'Aceptada';
      this.statusForm.patchValue({ estado: 'Aceptada' });
      alert('Solicitud aceptada correctamente.');
    }
  }

  rechazarSolicitud() {
    const solicitud = this.solicitudSeleccionada();
    if (solicitud) {
      solicitud.estado = 'Rechazada';
      alert('Solicitud rechazada correctamente.');
      this.volverALista();
    }
  }

  actualizarEstadoServicio() {
    if (this.statusForm.valid) {
      const solicitud = this.solicitudSeleccionada();
      if (solicitud) {
        const { estado, tecnicoId } = this.statusForm.value;
        solicitud.estado = estado;
        if (tecnicoId) {
          const tecnico = this.tecnicos.find(t => t.id === +tecnicoId);
          solicitud.tecnicoAsignado = tecnico?.nombre;
        }
        alert('Estado del servicio actualizado correctamente.');
      }
    }
  }

  getPriorityClass(prioridad: string): string {
    switch (prioridad) {
      case 'Baja': return 'priority-low';
      case 'Media': return 'priority-medium';
      case 'Alta': return 'priority-high';
      case 'Urgente': return 'priority-urgent';
      default: return '';
    }
  }

  getStatusClass(estado: string): string {
    const e = estado.toLowerCase();
    if (e.includes('pendiente') || e.includes('disponible')) return 'status-pending';
    if (e.includes('aceptada') || e.includes('asignada')) return 'status-active';
    if (e.includes('camino') || e.includes('atención')) return 'status-progress';
    if (e.includes('finalizada')) return 'status-done';
    if (e.includes('rechazada') || e.includes('cancelada')) return 'status-error';
    return '';
  }
}
