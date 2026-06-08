import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EmergenciasService } from '../../../../core/services/emergencias.service';
import { InteligenciaService } from '../../../../core/services/inteligencia.service';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AsignacionRead, PagoRead } from '../../../../core/models/api.models';
import { PanelIncidenteComponent } from '../../../operaciones/pages/panel-incidente/panel-incidente.component';

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
  imports: [CommonModule, RouterModule, FormsModule, PanelIncidenteComponent],
  templateUrl: './vista-seguimiento.component.html',
  styleUrl: './vista-seguimiento.component.scss'
})
export class VistaSeguimientoSolicitudes implements OnInit {
  solicitudes = signal<Solicitud[]>([]);
  solicitudSeleccionada = signal<Solicitud | null>(null);
  viewMode = signal<'list' | 'detail'>('list');
  isLoading = signal(false);
  
  // Pago del servicio
  pagoServicio = signal<PagoRead | null>(null);
  loadingPago = signal(false);

  // Variables modal calificación (CU15)
  showRatingModal = false;
  ratingValue = 0;
  ratingComment = '';

  userRole = computed(() => {
    const u = this.auth.currentUser();
    return u?.roles?.[0]?.nombre ?? localStorage.getItem('userRole') ?? 'cliente';
  });

  constructor(
    private emergenciasService: EmergenciasService,
    private inteligenciaService: InteligenciaService,
    private logisticaService: LogisticaService,
    private auth: AuthService,
  ) {}

  trazabilidadParaPanel(s: Solicitud): Array<{ id: number; tipo_evento: string; descripcion?: string; fecha_creacion: string }> {
    return (s.trazabilidad ?? []).map((t, i) => ({
      id: i,
      tipo_evento: t.evento,
      descripcion: undefined,
      fecha_creacion: t.fecha,
    }));
  }

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.isLoading.set(true);

    forkJoin({
      incidentes: this.emergenciasService.listIncidentes(),
      asignaciones: this.logisticaService.misAsignacionesComoCliente().pipe(catchError(() => of([] as AsignacionRead[])))
    }).subscribe({
      next: ({ incidentes, asignaciones }) => {
        // Mapa incidente_id → asignación más reciente
        const asigMap = new Map<number, AsignacionRead>();
        for (const a of asignaciones) {
          if (!asigMap.has(a.id_incidente)) asigMap.set(a.id_incidente, a);
        }

        const mapeado = incidentes.map(inc => {
          const asig = asigMap.get(inc.id);
          const tallerNombre = asig?.taller_nombre
            ? asig.taller_nombre
            : asig
            ? `Taller #${asig.id_taller}`
            : 'Sin taller asignado';

          const estadoAsig = asig?.estado_asignacion ?? '';
          const estadoLabel =
            estadoAsig === 'pendiente'  ? 'Pendiente de confirmación' :
            estadoAsig === 'aceptada'   ? 'Aceptada' :
            estadoAsig === 'rechazada'  ? 'Rechazada' :
            estadoAsig === 'completada' ? 'Completada' :
            inc.estado_servicio?.nombre || 'Pendiente';

          const tiempoEst = asig?.tiempo_estimado_llegada
            ? `${asig.tiempo_estimado_llegada} min`
            : undefined;

          return {
            id: inc.codigo_incidente,
            incidenteId: inc.id,
            vehiculo: `${inc.vehiculo.marca} ${inc.vehiculo.modelo} (${inc.vehiculo.placa})`,
            incidente: inc.tipo_incidente?.nombre || 'General',
            fecha: new Date(inc.fecha_reporte).toLocaleString(),
            estado: estadoLabel,
            descripcion: inc.descripcion_texto || '',
            ubicacion: inc.referencia_ubicacion || 'Sin referencia',
            taller: tallerNombre,
            tiempoEstimado: tiempoEst,
            evidencias: inc.evidencias?.map(e => e.url_archivo || '') || []
          };
        });

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
    this.pagoServicio.set(null);
    
    // Cargar trazabilidad real
    this.inteligenciaService.getTrazabilidad(solicitud.incidenteId).subscribe({
      next: (traz) => {
        const historialUi = traz.incidente.historial?.map((h: any) => ({
          evento: h.tipo_evento,
          fecha: new Date(h.fecha_creacion).toLocaleTimeString(),
          completado: true
        })) || [];
        solicitud.trazabilidad = historialUi;
        this.solicitudSeleccionada.set({ ...solicitud });
      }
    });

    // Cargar pago del servicio
    this.loadingPago.set(true);
    this.logisticaService.pagosPorCliente().subscribe({
      next: (pagos) => {
        const pago = pagos.find(p => p.id_incidente === solicitud.incidenteId) ?? null;
        this.pagoServicio.set(pago);
        this.loadingPago.set(false);
      },
      error: () => this.loadingPago.set(false)
    });
  }

  volverALista() {
    this.solicitudSeleccionada.set(null);
    this.viewMode.set('list');
  }

  getEstadoClass(estado: string): string {
    return 'status-' + estado.toLowerCase().replace(' ', '-');
  }

  esAtendida(estado: string): boolean {
    const e = (estado ?? '').toLowerCase();
    return e.includes('finaliz') || e.includes('complet') || e.includes('atención finalizada');
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
