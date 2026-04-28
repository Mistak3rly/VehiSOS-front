import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { InteligenciaService } from '../../../../core/services/inteligencia.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  WorkshopPerformanceMetrics,
  EspecialidadVehiculoRead,
  FeedbackAsignacion,
  DesempenoTallerRead,
} from '../../../../core/models/api.models';

import { PerformanceCardComponent } from './performance-card';
import { SpecialtyTableComponent } from './specialty-table';
import { FeedbackFormComponent } from './feedback-form';

/**
 * Dashboard para Taller Operario
 * Muestra: Desempeño, Especialidades, Historial, Feedback
 */
@Component({
  selector: 'app-taller-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PerformanceCardComponent,
    SpecialtyTableComponent,
    FeedbackFormComponent,
  ],
  templateUrl: './taller-dashboard.html',
  styleUrl: './taller-dashboard.scss',
})
export class TallerDashboard implements OnInit, OnDestroy {
  performance: WorkshopPerformanceMetrics | null = null;
  specialties: EspecialidadVehiculoRead[] = [];
  history: DesempenoTallerRead[] = [];

  isLoading = false;
  tallerId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private inteligencia: InteligenciaService,
    private auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    // Obtener ID del taller desde localStorage o usuario
    const storedTallerId = localStorage.getItem('taller_id');
    if (storedTallerId) {
      this.tallerId = parseInt(storedTallerId, 10);
      this.loadPerformanceMetrics();
      this.loadSpecialties();
      this.loadHistory();
    } else {
      this.snackBar.open('No se pudo identificar el taller. Inicia sesión nuevamente.', 'Cerrar', { duration: 5000 });
    }
  }

  private loadPerformanceMetrics() {
    if (!this.tallerId) return;

    this.isLoading = true;
    this.inteligencia
      .getWorkshopPerformance(this.tallerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.performance = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error cargando desempeño:', err);
          this.snackBar.open('Error cargando métricas de desempeño', 'Cerrar', { duration: 5000 });
          this.isLoading = false;
        },
      });
  }

  private loadSpecialties() {
    if (!this.tallerId) return;

    this.inteligencia
      .getWorkshopSpecialties(this.tallerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.specialties = data;
        },
        error: (err) => {
          console.error('Error cargando especialidades:', err);
          this.snackBar.open('Error cargando especialidades', 'Cerrar', { duration: 5000 });
        },
      });
  }

  private loadHistory() {
    if (!this.tallerId) return;

    this.inteligencia
      .getWorkshopHistory(this.tallerId, 0, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.history = data;
        },
        error: (err) => {
          console.error('Error cargando historial:', err);
        },
      });
  }

  onFeedbackSubmitted(feedback: FeedbackAsignacion) {
    // Este feedback se envía después de completar un incidente
    console.log('Feedback enviado:', feedback);
    this.snackBar.open('Feedback enviado exitosamente', 'Cerrar', { duration: 3000 });
    
    // Recargar métricas después de enviar feedback
    setTimeout(() => {
      this.loadPerformanceMetrics();
    }, 1000);
  }

  onFeedbackCancelled() {
    this.snackBar.open('Envío de feedback cancelado', 'Cerrar', { duration: 2000 });
  }

  refreshData() {
    this.snackBar.open('Actualizando datos...', '', { duration: 2000 });
    this.loadData();
  }
}
