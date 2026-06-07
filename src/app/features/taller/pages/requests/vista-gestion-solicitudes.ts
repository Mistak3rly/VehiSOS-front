import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { EmergenciasService } from '../../../../core/services/emergencias.service';
import { InteligenciaService } from '../../../../core/services/inteligencia.service';
import {
  PersonalTallerRead, IncidenteRead,
  TrazabilidadCombinadaResponse, NotificacionRead,
} from '../../../../core/models/api.models';

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
  asignacionId?: number;
}

// Mapa de estado backend → etiqueta UI
const ESTADO_LABEL: Record<string, string> = {
  pendiente:   'Pendiente (dirigida)',
  aceptada:    'Aceptada',
  rechazada:   'Rechazada',
  cancelada:   'Cancelada',
  completada:  'Finalizada',
};

@Component({
  selector: 'app-vista-gestion-solicitudes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vista-gestion-solicitudes.html',
  styleUrls: ['./vista-gestion-solicitudes.scss']
})
export class VistaGestionSolicitudes implements OnInit, OnDestroy {
  filterForm: FormGroup;
  statusForm: FormGroup;

  // Todas las solicitudes cargadas del backend
  todasLasSolicitudes = signal<Solicitud[]>([]);

  // Filtros reactivos
  filtroBusqueda = signal('');
  filtroEstado   = signal('');
  filtroPrioridad = signal('');

  // Lista filtrada calculada automáticamente
  solicitudes = computed(() => {
    let lista = this.todasLasSolicitudes();
    const q = this.filtroBusqueda().toLowerCase().trim();
    const est = this.filtroEstado().toLowerCase().trim();
    const pri = this.filtroPrioridad().toLowerCase().trim();

    if (q) {
      lista = lista.filter(s =>
        s.codigo.toLowerCase().includes(q) ||
        s.cliente.toLowerCase().includes(q) ||
        s.vehiculo.toLowerCase().includes(q) ||
        s.tipoIncidente.toLowerCase().includes(q)
      );
    }
    if (est) {
      lista = lista.filter(s => s.estado.toLowerCase().includes(est));
    }
    if (pri) {
      lista = lista.filter(s => s.prioridad.toLowerCase() === pri);
    }
    return lista;
  });

  solicitudSeleccionada = signal<Solicitud | null>(null);
  isLoading = signal(false);
  showDetail = signal(false);

  tecnicos: PersonalTallerRead[] = [];
  tallerId = 0;
  errorMessage = '';

  alertaEmergencia = signal<NotificacionRead | null>(null);
  private wsSub: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private logisticaService: LogisticaService,
    private emergenciasService: EmergenciasService,
    private inteligenciaService: InteligenciaService
  ) {
    this.filterForm = this.fb.group({ search: [''], status: [''], priority: [''] });
    this.statusForm = this.fb.group({
      tecnicoId: [''],
      estado: ['', [Validators.required]],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarSolicitudes();

    // Escuchar cambios en los filtros del formulario
    this.filterForm.get('search')!.valueChanges.subscribe(v => this.filtroBusqueda.set(v ?? ''));
    this.filterForm.get('status')!.valueChanges.subscribe(v => this.filtroEstado.set(v ?? ''));
    this.filterForm.get('priority')!.valueChanges.subscribe(v => this.filtroPrioridad.set(v ?? ''));

    this.logisticaService.conectarNotificacionesWs();
    this.wsSub = this.logisticaService.notificacion$.subscribe(notif => {
      if (notif.id_incidente) {
        this.alertaEmergencia.set(notif);
        this.cargarSolicitudes();
      }
    });
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    this.logisticaService.disconnectNotificacionesWs();
  }

  irAlDetalle(incidenteId: number): void {
    this.alertaEmergencia.set(null);
    this.router.navigate(['/taller/solicitudes', incidenteId]);
  }

  cerrarAlerta(): void {
    this.alertaEmergencia.set(null);
  }

  limpiarFiltros(): void {
    this.filterForm.reset({ search: '', status: '', priority: '' });
  }

  hayFiltros(): boolean {
    const v = this.filterForm.value;
    return !!(v.search || v.status || v.priority);
  }

  cargarSolicitudes(): void {
    this.isLoading.set(true);
    this.errorMessage = '';

    // Obtener taller para cargar personal
    this.logisticaService.listTalleres().subscribe({
      next: (talleres) => {
        if (talleres.length > 0) {
          this.tallerId = talleres[0].id;
          this.cargarPersonalTaller(this.tallerId);
        }
      },
      error: () => {}
    });

    // Todas las asignaciones del propietario (HISTORIAL COMPLETO)
    this.logisticaService.historialAsignaciones().subscribe({
      next: (asignaciones) => {
        if (asignaciones.length === 0) {
          this.todasLasSolicitudes.set([]);
          this.isLoading.set(false);
          return;
        }

        // Cargar detalle de cada incidente en paralelo
        const detalles$ = asignaciones.map(a =>
          this.emergenciasService.getIncidente(a.id_incidente).pipe(
            catchError(() => of(null))
          )
        );

        forkJoin(detalles$).subscribe({
          next: (incidentes) => {
            const lista: Solicitud[] = asignaciones.map((a, i) => {
              const inc = incidentes[i];
              return {
                id: a.id_incidente,
                codigo: inc?.codigo_incidente ?? `INC-${String(a.id_incidente).padStart(6, '0')}`,
                cliente: `Cliente #${inc?.id_cliente ?? '?'}`,
                telefono: '',
                vehiculo: inc?.vehiculo
                  ? `${inc.vehiculo.marca} ${inc.vehiculo.modelo} (${inc.vehiculo.placa})`
                  : 'Vehículo desconocido',
                tipoIncidente: inc?.tipo_incidente?.nombre ?? 'Emergencia',
                descripcion: inc?.descripcion_texto ?? 'Sin descripción',
                ubicacion: {
                  lat: inc?.latitud ?? 0,
                  lng: inc?.longitud ?? 0,
                  referencia: inc?.referencia_ubicacion ?? ''
                },
                prioridad: 'Alta',
                estado: ESTADO_LABEL[a.estado_asignacion] ?? a.estado_asignacion,
                fechaReporte: new Date(a.fecha_asignacion),
                evidencias: inc?.evidencias
                  ?.filter(e => e.tipo_evidencia === 'imagen')
                  .map(e => ({ tipo: e.tipo_evidencia, url: e.url_archivo ?? '' })) ?? [],
                incidenteDetalle: inc ?? undefined,
                asignacionId: a.id
              };
            });
            this.todasLasSolicitudes.set(lista);
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
            this.errorMessage = 'Error al cargar los detalles de las solicitudes.';
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage = err?.error?.detail || 'No se pudieron cargar las solicitudes.';
      }
    });
  }

  cargarPersonalTaller(tallerId: number): void {
    this.logisticaService.listPersonal(tallerId).subscribe({
      next: (data) => this.tecnicos = data,
      error: () => {}
    });
  }

  verDetalleSolicitud(solicitud: Solicitud): void {
    this.solicitudSeleccionada.set(solicitud);
    this.showDetail.set(true);

    if (!solicitud.trazabilidad) {
      this.inteligenciaService.getTrazabilidad(solicitud.id).subscribe({
        next: (traz) => { solicitud.trazabilidad = traz; },
        error: () => {}
      });
    }

    this.statusForm.patchValue({ estado: solicitud.estado, tecnicoId: '' });
  }

  setStatus(status: string): void {
    this.statusForm.patchValue({ estado: status });
  }

  volverALista(): void {
    this.showDetail.set(false);
    this.solicitudSeleccionada.set(null);
  }

  esPendiente(solicitud: Solicitud | null): boolean {
    const estado = (solicitud?.estado ?? '').toLowerCase();
    return estado.includes('pendiente');
  }

  aceptarSolicitud(): void {
    const solicitud = this.solicitudSeleccionada();
    if (!solicitud?.asignacionId) return;

    this.logisticaService.responderAsignacion(solicitud.asignacionId, { accion: 'aceptar' }).subscribe({
      next: () => {
        solicitud.estado = 'Aceptada';
        // Actualizar en la lista
        this.todasLasSolicitudes.update(lista =>
          lista.map(s => s.asignacionId === solicitud.asignacionId ? { ...s, estado: 'Aceptada' } : s)
        );
        this.solicitudSeleccionada.set({ ...solicitud });
        alert('Solicitud aceptada. El cliente ha sido notificado.');
      },
      error: (err) => alert(err?.error?.detail || 'Error al aceptar la solicitud.')
    });
  }

  rechazarSolicitud(): void {
    const solicitud = this.solicitudSeleccionada();
    if (!solicitud?.asignacionId) return;

    this.logisticaService.responderAsignacion(solicitud.asignacionId, { accion: 'rechazar' }).subscribe({
      next: () => {
        this.todasLasSolicitudes.update(lista =>
          lista.map(s => s.asignacionId === solicitud.asignacionId ? { ...s, estado: 'Rechazada' } : s)
        );
        alert('Solicitud rechazada.');
        this.volverALista();
      },
      error: (err) => alert(err?.error?.detail || 'Error al rechazar la solicitud.')
    });
  }

  actualizarEstadoServicio(): void {
    if (!this.statusForm.valid) return;
    const solicitud = this.solicitudSeleccionada();
    if (!solicitud?.asignacionId) return;

    const { estado, tecnicoId, observaciones } = this.statusForm.value;
    const accionMap: Record<string, 'aceptar' | 'rechazar' | 'cancelar' | 'completar'> = {
      'Aceptada': 'aceptar',
      'En camino': 'completar',
      'En atención': 'completar',
      'Finalizada': 'completar',
    };
    const accion = accionMap[estado] ?? 'aceptar';

    this.logisticaService.responderAsignacion(solicitud.asignacionId, {
      accion,
      id_personal_taller: tecnicoId ? parseInt(tecnicoId, 10) : undefined,
      observaciones: observaciones || undefined
    }).subscribe({
      next: () => {
        this.todasLasSolicitudes.update(lista =>
          lista.map(s => s.asignacionId === solicitud.asignacionId ? { ...s, estado } : s)
        );
        solicitud.estado = estado;
        if (tecnicoId) {
          const tec = this.tecnicos.find(t => t.id === +tecnicoId);
          solicitud.tecnicoAsignado = tec ? `Personal #${tec.id_usuario}` : '';
        }
        alert('Estado actualizado correctamente.');
      },
      error: (err) => alert(err?.error?.detail || 'Error al actualizar el estado.')
    });
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
    const e = (estado ?? '').toLowerCase();
    if (e.includes('pendiente')) return 'status-pending';
    if (e.includes('aceptada')) return 'status-active';
    if (e.includes('camino') || e.includes('atención')) return 'status-progress';
    if (e.includes('finalizada') || e.includes('completada')) return 'status-done';
    if (e.includes('rechazada') || e.includes('cancelada')) return 'status-error';
    return '';
  }
}
