import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AnaliticaService } from '../../../../core/services/analitica.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent {
  isGenerating = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  previewData = signal<any>(null);
  tipoReporte = signal<'operativo' | 'financiero'>('operativo');

  form: FormGroup;

  constructor(private fb: FormBuilder, private svc: AnaliticaService) {
    this.form = this.fb.group({
      fecha_inicio: [''],
      fecha_fin: [''],
    });
  }

  get filtros(): any {
    const val = this.form.value;
    const params: any = {};
    if (val.fecha_inicio) params.fecha_inicio = val.fecha_inicio;
    if (val.fecha_fin) params.fecha_fin = val.fecha_fin;
    return params;
  }

  previsualizarJson(): void {
    this.isGenerating.set(true);
    this.errorMessage.set('');
    const obs = this.tipoReporte() === 'operativo'
      ? this.svc.reporteOperativoJson(this.filtros)
      : this.svc.reporteFinancieroJson(this.filtros);

    obs.subscribe({
      next: (data) => { this.previewData.set(data); this.isGenerating.set(false); },
      error: (err) => { this.errorMessage.set(err.error?.detail || 'Error al generar'); this.isGenerating.set(false); },
    });
  }

  descargarExcel(): void {
    this.isGenerating.set(true);
    const obs = this.tipoReporte() === 'operativo'
      ? this.svc.descargarExcelOperativo(this.filtros)
      : this.svc.descargarExcelFinanciero(this.filtros);

    obs.subscribe({
      next: (blob) => { this.triggerDownload(blob, `reporte_${this.tipoReporte()}.xlsx`); this.isGenerating.set(false); },
      error: (err) => { this.errorMessage.set('Error al descargar Excel'); this.isGenerating.set(false); },
    });
  }

  descargarPdf(): void {
    this.isGenerating.set(true);
    const obs = this.tipoReporte() === 'operativo'
      ? this.svc.descargarPdfOperativo(this.filtros)
      : this.svc.descargarPdfFinanciero(this.filtros);

    obs.subscribe({
      next: (blob) => { this.triggerDownload(blob, `reporte_${this.tipoReporte()}.pdf`); this.isGenerating.set(false); this.successMessage.set('PDF descargado correctamente'); },
      error: (err) => { this.errorMessage.set('Error al descargar PDF'); this.isGenerating.set(false); },
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  get resumen(): any { return this.previewData()?.resumen; }
  get totalIncidentes(): number { return this.resumen?.total_incidentes || 0; }
  get ingresos(): number { return this.resumen?.ingresos_totales || this.resumen?.ingresos_brutos || 0; }
}
