import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AnaliticaService } from '../../../../core/services/analitica.service';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { ResumenAsistenciaRead } from '../../../../core/models/api.models';

@Component({
  selector: 'app-resumen-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resumen-asistencia.component.html',
  styleUrl: './resumen-asistencia.component.scss',
})
export class ResumenAsistenciaComponent implements OnInit {
  incidenteId = signal<number | null>(null);
  resumen = signal<ResumenAsistenciaRead | null>(null);
  isLoading = signal(true);
  isGenerating = signal(false);
  errorMessage = signal('');
  descargandoPdf = false;
  showRatingModal = false;
  ratingValue = 0;
  ratingComment = '';

  // Datos enriquecidos
  tallerNombre = signal<string>('');
  tecnicoNombre = signal<string>('');
  duracionTotal = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: AnaliticaService,
    private logisticaSvc: LogisticaService,
  ) {}

  ngOnInit(): void {
    const id = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    if (id > 0) {
      this.incidenteId.set(id);
      this.cargar(id);
    } else {
      this.isLoading.set(false);
      this.errorMessage.set('ID de incidente inválido.');
    }
  }

  cargar(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.svc.getResumen(id).subscribe({
      next: (data) => {
        this.resumen.set(data);
        this.isLoading.set(false);
        this.enriquecerDatos(data);
      },
      error: (err) => {
        if (err.status === 404) {
          this.errorMessage.set('El resumen aún no fue generado para este incidente.');
        } else {
          this.errorMessage.set(err.error?.detail || 'Error al cargar el resumen.');
        }
        this.isLoading.set(false);
      },
    });
  }

  generar(): void {
    const id = this.incidenteId();
    if (!id) return;
    this.isGenerating.set(true);
    this.errorMessage.set('');
    this.svc.generarResumen(id).subscribe({
      next: (data) => {
        this.resumen.set(data);
        this.isGenerating.set(false);
        this.enriquecerDatos(data);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.detail || 'Error al generar el resumen.');
        this.isGenerating.set(false);
      },
    });
  }

  private enriquecerDatos(data: ResumenAsistenciaRead): void {
    // Calcular duración desde historial
    const historial = (data.resumen?.['historial'] as any[]) ?? [];
    if (historial.length >= 2) {
      const inicio = new Date(historial[0].fecha).getTime();
      const fin = new Date(historial[historial.length - 1].fecha).getTime();
      const mins = Math.round((fin - inicio) / 60000);
      if (mins > 0) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        this.duracionTotal.set(h > 0 ? `${h}h ${m}min` : `${m} min`);
      }
    }

    // Cargar nombre del taller
    if (data.id_taller) {
      this.logisticaSvc.listTalleresActivos().pipe(catchError(() => of([]))).subscribe(talleres => {
        const taller = talleres.find(t => t.id === data.id_taller);
        this.tallerNombre.set(taller?.nombre ?? `Taller #${data.id_taller}`);
      });
    }
  }

  descargarPdf(): void {
    const id = this.incidenteId();
    if (!id) return;
    this.descargandoPdf = true;
    this.svc.descargarPdfResumen(id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resumen_${this.resumen()?.codigo_auditoria ?? id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.descargandoPdf = false;
      },
      error: () => this.descargandoPdf = false,
    });
  }

  volver(): void { this.router.navigate(['/cliente/solicitudes/seguimiento']); }

  abrirCalificacion(): void { this.showRatingModal = true; this.ratingValue = 0; this.ratingComment = ''; }
  cerrarCalificacion(): void { this.showRatingModal = false; }
  setRating(val: number): void { this.ratingValue = val; }
  enviarCalificacion(): void {
    alert(`¡Gracias! Calificación de ${this.ratingValue} estrella${this.ratingValue !== 1 ? 's' : ''} enviada.`);
    this.showRatingModal = false;
  }

  get codigoBadge(): string {
    return this.resumen()?.codigo_auditoria ?? '';
  }

  get datosVehiculo(): any { return this.resumen()?.resumen?.['vehiculo']; }
  get datosIncidente(): any { return this.resumen()?.resumen?.['incidente']; }
  get evidencias(): any[] { return (this.resumen()?.resumen?.['evidencias'] as any[]) ?? []; }
  get historial(): any[] { return (this.resumen()?.resumen?.['historial'] as any[]) ?? []; }
  get cotizacion(): any { return this.resumen()?.resumen?.['cotizacion']; }
  get diagnostico(): string { return this.resumen()?.diagnostico ?? this.datosIncidente?.descripcion ?? ''; }
  get trabajosRealizados(): string {
    const cot = this.cotizacion;
    return cot?.descripcion ?? this.datosIncidente?.descripcion ?? '';
  }
}
