import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InteligenciaService } from '../../../../core/services/inteligencia.service';
import { EmergenciasService } from '../../../../core/services/emergencias.service';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { CotizacionService } from '../../../../core/services/cotizacion.service';
import { TrazabilidadCombinadaResponse, PagoRead, AsignacionRead, CotizacionRead } from '../../../../core/models/api.models';
import { PanelIncidenteComponent } from '../../../operaciones/pages/panel-incidente/panel-incidente.component';

@Component({
  selector: 'app-incident-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, PanelIncidenteComponent],
  templateUrl: './incident-detail.component.html',
  styleUrls: ['./incident-detail.component.scss']
})
export class DetalleIncidenteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inteligenciaService = inject(InteligenciaService);
  private emergenciasService = inject(EmergenciasService);
  private logisticaService = inject(LogisticaService);
  private cotizacionService = inject(CotizacionService);

  incidenteId = signal<number | null>(null);
  data = signal<TrazabilidadCombinadaResponse | null>(null);
  asignacion = signal<AsignacionRead | null>(null);
  loading = signal(true);
  isUpdating = signal(false);

  // Estado de la respuesta del taller
  respondiendo = signal(false);
  respuestaMsg = signal('');
  respuestaError = signal('');

  // Paneles colapsables
  showTranscription = signal(true);
  showGallery = signal(true);

  // Sección Registrar Cobro
  showCobroForm = signal(false);
  cobro = { diagnostico: '', observaciones: '', costo_servicio: 0 };
  isRegistrandoCobro = signal(false);
  pagoRegistrado = signal<PagoRead | null>(null);

  // ── Cotizaciones ────────────────────────────────────────────────────────────
  cotizaciones = signal<CotizacionRead[]>([]);
  showCotizacionForm = signal(false);
  nuevaCotizacion = {
    descripcion_desperfecto: '',
    repuestos: '',
    costo_repuestos: 0,
    costo_mano_obra: 0,
    tiempo_estimado: 0,
    notas_adicionales: '',
  };
  isSavingCotizacion = signal(false);
  cotizacionMsg = signal('');
  cotizacionError = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.incidenteId.set(+id);
      this.loadData(+id);
    }
  }

  loadData(id: number) {
    this.loading.set(true);
    this.inteligenciaService.getTrazabilidad(id).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading incident details:', err);
        this.loading.set(false);
      }
    });

    this.logisticaService.getAsignacionPorIncidente(id).subscribe({
      next: (asig) => this.asignacion.set(asig),
      error: () => this.asignacion.set(null)
    });

    this.loadCotizaciones(id);
  }

  loadCotizaciones(incidenteId: number) {
    this.cotizacionService.porIncidente(incidenteId).subscribe({
      next: (list) => this.cotizaciones.set(list),
      error: () => this.cotizaciones.set([])
    });
  }

  crearCotizacion() {
    const id = this.incidenteId();
    if (!id) return;
    if (!this.nuevaCotizacion.descripcion_desperfecto.trim() || this.nuevaCotizacion.costo_mano_obra <= 0) {
      this.cotizacionError.set('La descripción y el costo de mano de obra son obligatorios.');
      return;
    }
    this.isSavingCotizacion.set(true);
    this.cotizacionError.set('');
    this.cotizacionService.crear({
      id_incidente: id,
      descripcion_desperfecto: this.nuevaCotizacion.descripcion_desperfecto,
      repuestos: this.nuevaCotizacion.repuestos || undefined,
      costo_repuestos: this.nuevaCotizacion.costo_repuestos,
      costo_mano_obra: this.nuevaCotizacion.costo_mano_obra,
      tiempo_estimado: this.nuevaCotizacion.tiempo_estimado || undefined,
      notas_adicionales: this.nuevaCotizacion.notas_adicionales || undefined,
    }).subscribe({
      next: (c: CotizacionRead) => {
        this.cotizaciones.update(list => [c, ...list]);
        this.isSavingCotizacion.set(false);
        this.showCotizacionForm.set(false);
        this.cotizacionMsg.set('Cotización creada. Ahora puedes enviarla al cliente.');
        this.nuevaCotizacion = { descripcion_desperfecto: '', repuestos: '', costo_repuestos: 0, costo_mano_obra: 0, tiempo_estimado: 0, notas_adicionales: '' };
      },
      error: (err: { error?: { detail?: string } }) => {
        this.isSavingCotizacion.set(false);
        this.cotizacionError.set(err.error?.detail || 'Error al crear la cotización.');
      }
    });
  }

  enviarCotizacion(cotizacionId: number) {
    this.cotizacionService.enviar(cotizacionId).subscribe({
      next: (updated: CotizacionRead) => {
        this.cotizaciones.update(list => list.map(c => c.id === updated.id ? updated : c));
        this.cotizacionMsg.set('Cotización enviada al cliente correctamente.');
      },
      error: (err: { error?: { detail?: string } }) => {
        this.cotizacionError.set(err.error?.detail || 'Error al enviar la cotización.');
      }
    });
  }

  estadoCotizacionLabel(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'Borrador', enviada: 'Enviada', aceptada: 'Aceptada',
      rechazada: 'Rechazada', pagada: 'Pagada', vencida: 'Vencida',
    };
    return map[estado] ?? estado;
  }

  getUrgencyClass() {
    const priority = this.data()?.incidente.prioridad?.codigo?.toLowerCase();
    if (priority === 'critica' || priority === 'urgente') return 'urgency-critical';
    if (priority === 'alta') return 'urgency-high';
    return 'urgency-normal';
  }

  getAIResumen() {
    const resumenAnalisis = this.data()?.analisis.find(a => a.tipo_analisis === 'resumen_priorizacion');
    return resumenAnalisis?.resultado?.['resumen'] || 'No hay resumen disponible.';
  }

  getTranscription() {
    return this.data()?.incidente.evidencias.find(e => e.tipo_evidencia === 'audio')?.texto_transcrito || 'Sin transcripción.';
  }

  getImages() {
    return this.data()?.incidente.evidencias.filter(e => e.tipo_evidencia === 'imagen') || [];
  }

  getDamageTags() {
    const imageAnalisis = this.data()?.analisis.find(a => a.tipo_analisis === 'analisis_imagenes');
    return (imageAnalisis?.resultado?.['hallazgos'] as string[]) || [];
  }

  responderAsignacion(accion: 'aceptar' | 'rechazar'): void {
    const asig = this.asignacion();
    if (!asig) return;
    this.respondiendo.set(true);
    this.respuestaMsg.set('');
    this.respuestaError.set('');

    this.logisticaService.responderAsignacion(asig.id, { accion }).subscribe({
      next: (updated) => {
        this.asignacion.set(updated);
        this.respondiendo.set(false);
        if (accion === 'aceptar') {
          this.respuestaMsg.set('Solicitud aceptada. Ahora puedes comunicarte con el cliente desde el chat.');
        } else {
          this.respuestaMsg.set('Solicitud rechazada. El cliente ha sido notificado.');
          setTimeout(() => this.router.navigate(['/taller/solicitudes']), 2000);
        }
      },
      error: (err) => {
        this.respondiendo.set(false);
        this.respuestaError.set(err?.error?.detail || 'Error al responder la solicitud. Intenta de nuevo.');
      }
    });
  }

  iniciarAtencion() {
    if (!this.incidenteId()) return;
    this.isUpdating.set(true);
    this.emergenciasService.updateEstadoIncidente(this.incidenteId()!, {
      estado_codigo: 'en_camino',
      descripcion: 'El técnico ha iniciado el desplazamiento hacia el incidente.'
    }).subscribe({
      next: () => {
        this.isUpdating.set(false);
        this.router.navigate(['/taller/solicitudes']);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.isUpdating.set(false);
      }
    });
  }

  registrarCobro() {
    if (!this.incidenteId() || this.cobro.costo_servicio <= 0 || !this.cobro.diagnostico.trim()) return;
    this.isRegistrandoCobro.set(true);

    this.logisticaService.registrarCobroTecnico({
      id_incidente: this.incidenteId()!,
      diagnostico: this.cobro.diagnostico,
      observaciones: this.cobro.observaciones || undefined,
      costo_servicio: this.cobro.costo_servicio,
    }).subscribe({
      next: (pago) => {
        this.pagoRegistrado.set(pago);
        this.isRegistrandoCobro.set(false);
        this.showCobroForm.set(false);
      },
      error: (err) => {
        console.error('Error registrando cobro:', err);
        this.isRegistrandoCobro.set(false);
        alert('Error al registrar cobro: ' + (err.error?.detail || 'Intente nuevamente.'));
      }
    });
  }
}
