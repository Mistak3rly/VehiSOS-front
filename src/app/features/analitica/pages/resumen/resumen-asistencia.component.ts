import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AnaliticaService } from '../../../../core/services/analitica.service';
import { ResumenAsistenciaRead } from '../../../../core/models/api.models';

@Component({
  selector: 'app-resumen-asistencia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen-asistencia.component.html',
  styleUrl: './resumen-asistencia.component.scss',
})
export class ResumenAsistenciaComponent implements OnInit {
  incidenteId = signal<number | null>(null);
  resumen = signal<ResumenAsistenciaRead | null>(null);
  isLoading = signal(false);
  isGenerating = signal(false);
  errorMessage = signal('');

  constructor(private route: ActivatedRoute, private svc: AnaliticaService) {}

  ngOnInit(): void {
    const id = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    if (id > 0) {
      this.incidenteId.set(id);
      this.cargar(id);
    }
  }

  cargar(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.svc.getResumen(id).subscribe({
      next: (data) => { this.resumen.set(data); this.isLoading.set(false); },
      error: (err) => {
        if (err.status === 404) {
          this.errorMessage.set('El resumen aún no fue generado.');
        } else {
          this.errorMessage.set(err.error?.detail || 'Error al cargar resumen');
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
      next: (data) => { this.resumen.set(data); this.isGenerating.set(false); },
      error: (err) => { this.errorMessage.set(err.error?.detail || 'Error al generar'); this.isGenerating.set(false); },
    });
  }

  imprimirPagina(): void { window.print(); }

  get datosIncidente(): any { return this.resumen()?.resumen?.['incidente']; }
  get datosVehiculo(): any { return this.resumen()?.resumen?.['vehiculo']; }
  get evidencias(): any[] { return (this.resumen()?.resumen?.['evidencias'] as any[]) || []; }
  get historial(): any[] { return (this.resumen()?.resumen?.['historial'] as any[]) || []; }
  get cotizacion(): any { return this.resumen()?.resumen?.['cotizacion']; }
}
