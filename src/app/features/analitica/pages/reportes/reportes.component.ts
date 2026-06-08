import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AnaliticaService } from '../../../../core/services/analitica.service';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TallerRead } from '../../../../core/models/api.models';

interface ReporteReciente {
  nombre: string;
  tipo: string;
  formato: string;
  fecha: Date;
  estado: 'disponible' | 'archivado';
  incidentes?: number;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent implements OnInit {
  isGenerating = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  previewData = signal<any>(null);
  tipoReporte = signal<'operativo' | 'financiero'>('operativo');
  formatoSalida = signal<'pdf' | 'excel'>('pdf');

  isAdmin = false;
  rol = '';
  talleres: TallerRead[] = [];
  reportesRecientes = signal<ReporteReciente[]>([]);

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private svc: AnaliticaService,
    private logisticaSvc: LogisticaService,
    private authSvc: AuthService,
  ) {
    this.form = this.fb.group({
      fecha_inicio: [''],
      fecha_fin: [''],
      taller_id: [''],
    });
  }

  ngOnInit(): void {
    const role = (this.authSvc.getUserRole() || '').toLowerCase();
    this.isAdmin = role === 'admin' || role === 'administrador';
    this.rol = this.isAdmin ? 'Administrador / Taller' : 'Taller';

    if (this.isAdmin) {
      this.logisticaSvc.listTalleres().subscribe({
        next: (data) => this.talleres = data,
        error: () => {}
      });
    }
  }

  get filtros(): any {
    const val = this.form.value;
    const params: any = {};
    if (val.fecha_inicio) params.fecha_inicio = val.fecha_inicio;
    if (val.fecha_fin) params.fecha_fin = val.fecha_fin;
    if (val.taller_id) params.taller_id = val.taller_id;
    return params;
  }

  generarReporte(): void {
    this.isGenerating.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const tipo = this.tipoReporte();
    const formato = this.formatoSalida();

    if (formato === 'pdf') {
      const obs = tipo === 'operativo'
        ? this.svc.descargarPdfOperativo(this.filtros)
        : this.svc.descargarPdfFinanciero(this.filtros);

      obs.subscribe({
        next: (blob) => {
          this.triggerDownload(blob, `reporte_${tipo}_${this.fechaStr()}.pdf`);
          this.agregarAlHistorial(tipo, 'PDF');
          this.successMessage.set('PDF generado y descargado correctamente.');
          this.isGenerating.set(false);
        },
        error: () => { this.errorMessage.set('Error al generar el PDF.'); this.isGenerating.set(false); },
      });
    } else {
      const obs = tipo === 'operativo'
        ? this.svc.descargarExcelOperativo(this.filtros)
        : this.svc.descargarExcelFinanciero(this.filtros);

      obs.subscribe({
        next: (blob) => {
          this.triggerDownload(blob, `reporte_${tipo}_${this.fechaStr()}.xlsx`);
          this.agregarAlHistorial(tipo, 'Excel');
          this.successMessage.set('Excel generado y descargado correctamente.');
          this.isGenerating.set(false);
        },
        error: () => { this.errorMessage.set('Error al generar el Excel.'); this.isGenerating.set(false); },
      });
    }
  }

  previsualizarJson(): void {
    this.isGenerating.set(true);
    this.errorMessage.set('');
    const obs = this.tipoReporte() === 'operativo'
      ? this.svc.reporteOperativoJson(this.filtros)
      : this.svc.reporteFinancieroJson(this.filtros);

    obs.subscribe({
      next: (data) => { this.previewData.set(data); this.isGenerating.set(false); },
      error: (err) => { this.errorMessage.set(err.error?.detail || 'Error al previsualizar'); this.isGenerating.set(false); },
    });
  }

  limpiarFiltros(): void {
    this.form.reset({ fecha_inicio: '', fecha_fin: '', taller_id: '' });
    this.previewData.set(null);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  tiempoTranscurrido(fecha: Date): string {
    const diff = Date.now() - fecha.getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    const w = Math.floor(d / 7);
    if (w > 0) return `Hace ${w} sem`;
    if (d > 0) return `Hace ${d} día${d > 1 ? 's' : ''}`;
    return `Hace ${h}h`;
  }

  nombreReporte(tipo: string): string {
    const mes = new Date().toLocaleString('es', { month: 'long' });
    const anio = new Date().getFullYear();
    return tipo === 'operativo'
      ? `Reporte operativo — ${mes.charAt(0).toUpperCase() + mes.slice(1)} ${anio}`
      : `Auditoría financiera — ${anio}`;
  }

  private agregarAlHistorial(tipo: string, formato: string): void {
    const nuevo: ReporteReciente = {
      nombre: this.nombreReporte(tipo),
      tipo,
      formato,
      fecha: new Date(),
      estado: 'disponible',
    };
    this.reportesRecientes.update(lista => [nuevo, ...lista.slice(0, 4)]);
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  private fechaStr(): string {
    return new Date().toISOString().slice(0, 10);
  }

  get resumen(): any { return this.previewData()?.resumen; }
}
