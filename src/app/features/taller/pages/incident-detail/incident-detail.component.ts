import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InteligenciaService } from '../../../../core/services/inteligencia.service';
import { EmergenciasService } from '../../../../core/services/emergencias.service';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { TrazabilidadCombinadaResponse, PagoRead } from '../../../../core/models/api.models';

@Component({
  selector: 'app-incident-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incident-detail.component.html',
  styleUrls: ['./incident-detail.component.scss']
})
export class DetalleIncidenteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inteligenciaService = inject(InteligenciaService);
  private emergenciasService = inject(EmergenciasService);
  private logisticaService = inject(LogisticaService);

  incidenteId = signal<number | null>(null);
  data = signal<TrazabilidadCombinadaResponse | null>(null);
  loading = signal(true);
  isUpdating = signal(false);

  // Paneles colapsables
  showTranscription = signal(true);
  showGallery = signal(true);

  // Sección Registrar Cobro
  showCobroForm = signal(false);
  cobro = { diagnostico: '', observaciones: '', costo_servicio: 0 };
  isRegistrandoCobro = signal(false);
  pagoRegistrado = signal<PagoRead | null>(null);

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
  }

  getUrgencyClass() {
    const priority = this.data()?.incidente.prioridad?.codigo?.toLowerCase();
    if (priority === 'critica' || priority === 'urgente') return 'urgency-critical';
    if (priority === 'alta') return 'urgency-high';
    return 'urgency-normal';
  }

  getAIResumen() {
    // Buscamos el análisis de tipo 'resumen_priorizacion'
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
