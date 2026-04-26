import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EmergenciasService } from '../../../../core/services/emergencias.service';
import { InteligenciaService } from '../../../../core/services/inteligencia.service';

interface Solicitud {
  id: string;
  incidenteId: number;
  vehiculo: string;
  incidente: string;
  fecha: string;
  estado: string;
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
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './vista-seguimiento.component.html',
  styleUrl: './vista-seguimiento.component.scss'
})
export class VistaSeguimientoSolicitudes implements OnInit {
  solicitudes = signal<Solicitud[]>([]);
  solicitudSeleccionada = signal<Solicitud | null>(null);
  viewMode = signal<'list' | 'detail'>('list');
  isLoading = signal(false);
  
  // Variables modal calificación (CU15)
  showRatingModal = false;
  ratingValue = 0;
  ratingComment = '';

  constructor(
    private emergenciasService: EmergenciasService,
    private inteligenciaService: InteligenciaService
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.isLoading.set(true);
    this.emergenciasService.listIncidentes().subscribe({
      next: (incidentes) => {
        const mapeado = incidentes.map(inc => ({
          id: inc.codigo_incidente,
          incidenteId: inc.id,
          vehiculo: `${inc.vehiculo.marca} ${inc.vehiculo.modelo} (${inc.vehiculo.placa})`,
          incidente: inc.tipo_incidente?.nombre || 'General',
          fecha: new Date(inc.fecha_reporte).toLocaleString(),
          estado: inc.estado_servicio?.nombre || 'Pendiente',
          descripcion: inc.descripcion_texto || '',
          ubicacion: inc.referencia_ubicacion || 'Sin referencia',
          taller: 'En búsqueda...', // idealmente vendría en una relación en el backend
          evidencias: inc.evidencias?.map(e => e.url_archivo || '') || []
        }));
        this.solicitudes.set(mapeado);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando solicitudes', err);
        this.isLoading.set(false);
      }
    });
  }

  verDetalleSolicitud(solicitud: Solicitud) {
    this.solicitudSeleccionada.set(solicitud);
    this.viewMode.set('detail');
    
    // Cargar trazabilidad real
    this.inteligenciaService.getTrazabilidad(solicitud.incidenteId).subscribe({
      next: (traz) => {
        // Mapear historial a formato UI
        const historialUi = traz.incidente.historial?.map((h: any) => ({
          evento: h.tipo_evento,
          fecha: new Date(h.fecha_creacion).toLocaleTimeString(),
          completado: true
        })) || [];
        
        // Actualizar datos del detalle
        solicitud.trazabilidad = historialUi;
        this.solicitudSeleccionada.set({ ...solicitud });
      }
    });
  }

  volverALista() {
    this.solicitudSeleccionada.set(null);
    this.viewMode.set('list');
  }

  getEstadoClass(estado: string): string {
    return 'status-' + estado.toLowerCase().replace(' ', '-');
  }

  // CU15 Modal calificación
  abrirCalificacion() {
    this.showRatingModal = true;
    this.ratingValue = 0;
    this.ratingComment = '';
  }

  cerrarCalificacion() {
    this.showRatingModal = false;
  }

  setRating(val: number) {
    this.ratingValue = val;
  }

  enviarCalificacion() {
    alert(`Calificación enviada: ${this.ratingValue} estrellas. Gracias por tu feedback.`);
    this.showRatingModal = false;
  }
}
