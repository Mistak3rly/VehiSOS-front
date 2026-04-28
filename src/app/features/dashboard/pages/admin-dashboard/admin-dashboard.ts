import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DashboardIAService,
  DashboardIAData,
  PriorityDistribution,
  AnalisisIARead,
} from '../../../../core/services/dashboard-ia.service';
import { MapComponent } from '../../../../core/components/map/map.component';
import { InteligenciaService } from '../../../../core/services/inteligencia.service';
import { AnalyticsDashboardComponent } from './analytics-dashboard';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DashboardAnalisisResponse } from '../../../../core/models/api.models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MapComponent,
    AnalyticsDashboardComponent,
    MatTabsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit, OnDestroy {
  isLoading = signal(true);
  hasError  = signal(false);
  data      = signal<DashboardIAData | null>(null);

  // IA Features
  workshopAnalytics = signal<DashboardAnalisisResponse | null>(null);
  analyticsLoading = signal(false);
  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardIAService,
    private inteligencia: InteligenciaService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.cargarDatos();
    this.loadWorkshopAnalytics();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDatos() {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.dashboardService.buildDashboardData().subscribe({
      next: (d) => { this.data.set(d); this.isLoading.set(false); },
      error: (err) => {
        console.error('Error dashboard IA', err);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  loadWorkshopAnalytics() {
    this.analyticsLoading.set(true);
    this.inteligencia
      .getDashboardAnalytics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.workshopAnalytics.set(data);
          this.analyticsLoading.set(false);
        },
        error: (err) => {
          console.error('Error cargando analytics:', err);
          this.snackBar.open('Error cargando análiticas de talleres', 'Cerrar', { duration: 5000 });
          this.analyticsLoading.set(false);
        },
      });
  }

  // ── Helpers de visualización ─────────────────

  barWidth(pct: number): string { return `${pct}%`; }

  donutDash(pct: number): string {
    const c = 2 * Math.PI * 45;
    return `${(pct / 100) * c} ${c}`;
  }

  donutOffset(index: number, distribution: PriorityDistribution[]): number {
    const c = 2 * Math.PI * 45;
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += (distribution[i].percentage / 100) * c;
    }
    return -offset;
  }

  mapX(lng: number): number {
    return Math.min(98, Math.max(2, ((lng - (-63.48)) / 0.6) * 100));
  }

  mapY(lat: number): number {
    return Math.min(98, Math.max(2, ((-17.48 - lat) / 0.6) * 100));
  }

  priorityDotColor(prioridad: string): string {
    const map: Record<string, string> = {
      alta: '#e53e3e', media: '#ed8936', baja: '#38a169', critica: '#9b2c2c',
    };
    return map[prioridad.toLowerCase()] || '#718096';
  }

  confidenceColor(conf: number): string {
    if (conf >= 0.85) return '#38a169';
    if (conf >= 0.70) return '#ed8936';
    return '#e53e3e';
  }

  confidencePct(conf: number): string { return `${Math.round(conf * 100)}%`; }

  tipoAnalisisLabel(tipo: string): string {
    const map: Record<string, string> = {
      transcripcion_audio:   '🎙 Transcripción Audio',
      extraccion_informacion: '📋 Extracción Info',
      clasificacion_incidente: '🏷 Clasificación',
      analisis_imagen:       '📷 Análisis Imagen',
      resumen_priorizacion:  '⚡ Priorización',
      asignacion_inteligente: '🗺 Asignación',
    };
    return map[tipo] || tipo;
  }

  resultadoResumen(analisis: AnalisisIARead): string {
    const r = analisis.resultado;
    if (r['texto_transcrito']) return String(r['texto_transcrito']).slice(0, 80) + '…';
    if (r['tipo_sugerido'])    return `Tipo: ${r['tipo_sugerido']}`;
    if (r['prioridad_sugerida']) return `Prioridad: ${r['prioridad_sugerida']}`;
    if (r['hallazgos'])        return `${(r['hallazgos'] as string[]).slice(0, 2).join(' / ')}`;
    if (r['resumen'])          return String(r['resumen']).slice(0, 80) + '…';
    return JSON.stringify(r).slice(0, 80);
  }

  analisisTipoEntries(tipos: Record<string, number>): {key: string; val: number}[] {
    return Object.entries(tipos).map(([key, val]) => ({ key, val }));
  }
}
