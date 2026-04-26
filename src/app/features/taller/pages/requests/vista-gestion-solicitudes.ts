import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { EmergenciasService } from '../../../../core/services/emergencias.service';
import { InteligenciaService } from '../../../../core/services/inteligencia.service';
import { SolicitudDisponibleRead, PersonalTallerRead, IncidenteRead, TrazabilidadCombinadaResponse } from '../../../../core/models/api.models';

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
  incidenteDetalle?: IncidenteRead;
  trazabilidad?: TrazabilidadCombinadaResponse;
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

  tecnicos: PersonalTallerRead[] = [];
  tallerId: number = 0;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private logisticaService: LogisticaService,
    private emergenciasService: EmergenciasService,
    private inteligenciaService: InteligenciaService
  ) {
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
    this.errorMessage = '';

    // Primero obtenemos el taller del usuario
    this.logisticaService.listTalleres().subscribe({
      next: (talleres) => {
        if (talleres.length > 0) {
          this.tallerId = talleres[0].id;
          this.cargarPersonalTaller(this.tallerId);
          this.fetchSolicitudesDisponibles();
        } else {
          this.isLoading.set(false);
          this.errorMessage = 'Debes registrar un taller en el sistema para poder gestionar solicitudes.';
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage = 'No se pudo cargar la información de tu taller.';
        console.error('Error al cargar taller del usuario', err);
      }
    });
  }

  private fetchSolicitudesDisponibles() {
    this.logisticaService.listSolicitudesDisponibles().subscribe({
      next: (data) => {
        const mapeado = data.map(d => ({
          id: d.id_incidente,
          codigo: d.codigo_incidente,
          cliente: 'Cargando...',
          telefono: '...',
          vehiculo: '...',
          tipoIncidente: d.tipo_codigo || 'Desconocido',
          descripcion: d.titulo,
          ubicacion: { lat: 0, lng: 0, referencia: '' },
          prioridad: (d.prioridad_codigo === 'alta' || d.prioridad_codigo === 'urgente') ? 'Alta' : 'Media',
          estado: 'Disponible',
          fechaReporte: new Date(d.fecha_reporte),
          evidencias: []
        } as unknown as Solicitud));
        this.solicitudes.set(mapeado);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage = err.error?.detail || 'Error al cargar las solicitudes disponibles.';
      }
    });
  }

  cargarPersonalTaller(tallerId: number) {
    this.logisticaService.listPersonal(tallerId).subscribe({
      next: (data) => this.tecnicos = data,
      error: (err) => console.error('Error al cargar personal', err)
    });
  }

  verDetalleSolicitud(solicitud: Solicitud) {
    this.solicitudSeleccionada.set(solicitud);
    this.showDetail.set(true);

    // Obtener detalles completos del incidente
    this.emergenciasService.getIncidente(solicitud.id).subscribe({
      next: (inc) => {
        solicitud.incidenteDetalle = inc;
        solicitud.vehiculo = `${inc.vehiculo.marca} ${inc.vehiculo.modelo} (${inc.vehiculo.placa})`;
        solicitud.ubicacion = { lat: inc.latitud, lng: inc.longitud, referencia: inc.referencia_ubicacion || '' };
        solicitud.evidencias = inc.evidencias.map(e => ({ tipo: e.tipo_evidencia, url: e.url_archivo || '' }));
      }
    });

    // Obtener trazabilidad para clasificación IA
    this.inteligenciaService.getTrazabilidad(solicitud.id).subscribe({
      next: (traz) => {
        solicitud.trazabilidad = traz;
      }
    });

    this.statusForm.patchValue({
      estado: solicitud.estado,
      tecnicoId: ''
    });
  }

  setStatus(status: string) {
    this.statusForm.patchValue({ estado: status });
  }

  volverALista() {
    this.showDetail.set(false);
    this.solicitudSeleccionada.set(null);
  }

  aceptarSolicitud() {
    const solicitud = this.solicitudSeleccionada();
    if (solicitud && this.tallerId) {
      this.logisticaService.createAsignacion({
        id_incidente: solicitud.id,
        id_taller: this.tallerId,
        observaciones: 'Solicitud aceptada por el taller.'
      }).subscribe({
        next: () => {
          solicitud.estado = 'Aceptada';
          this.statusForm.patchValue({ estado: 'Aceptada' });
          alert('Solicitud aceptada correctamente.');
        },
        error: (err) => alert(err.error?.detail || 'Error al aceptar la solicitud.')
      });
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
      if (solicitud && this.tallerId) {
        const { estado, tecnicoId, observaciones } = this.statusForm.value;

        // El taller actualiza el estado del incidente a través de la asignación/trazabilidad
        this.logisticaService.createAsignacion({
          id_incidente: solicitud.id,
          id_taller: this.tallerId,
          id_personal_taller: tecnicoId ? parseInt(tecnicoId, 10) : undefined,
          observaciones: `Actualización de estado a: ${estado}. Obs: ${observaciones}`
        }).subscribe({
          next: () => {
            alert('Estado actualizado correctamente en el sistema.');
            solicitud.estado = estado;
            if (tecnicoId) {
              const tecnico = this.tecnicos.find(t => t.id === +tecnicoId);
              solicitud.tecnicoAsignado = tecnico ? `Personal #${tecnico.id_usuario}` : '';
            }
          },
          error: (err) => {
            alert(err.error?.detail || 'Error al actualizar el estado del servicio.');
          }
        });
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
