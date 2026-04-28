import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { WorkshopPerformanceMetrics } from '../../../../core/models/api.models';

@Component({
  selector: 'app-performance-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  template: `
    <mat-card class="performance-card">
      <mat-card-header>
        <mat-card-title>Desempeño del Taller</mat-card-title>
        <mat-icon class="header-icon">trending_up</mat-icon>
      </mat-card-header>

      <mat-card-content *ngIf="metrics">
        <div class="metrics-grid">
          <div class="metric-item">
            <div class="metric-icon" [style.background-color]="'#1976d2'">
              <mat-icon>build</mat-icon>
            </div>
            <div class="metric-info">
              <span class="metric-label">Total Servicios</span>
              <span class="metric-value">{{ metrics.total_servicios }}</span>
            </div>
          </div>

          <div class="metric-item">
            <div class="metric-icon" [style.background-color]="'#ff9800'">
              <mat-icon>star</mat-icon>
            </div>
            <div class="metric-info">
              <span class="metric-label">Calificación Promedio</span>
              <span class="metric-value">
                {{ metrics.calificacion_promedio !== null ? metrics.calificacion_promedio.toFixed(1) : 'N/A' }}/5.0
              </span>
              <mat-progress-bar
                mode="determinate"
                [value]="(metrics.calificacion_promedio || 0) * 20"
                class="rating-bar"
              ></mat-progress-bar>
            </div>
          </div>

          <div class="metric-item">
            <div class="metric-icon" [style.background-color]="'#4caf50'">
              <mat-icon>schedule</mat-icon>
            </div>
            <div class="metric-info">
              <span class="metric-label">Tiempo Promedio Reparación</span>
              <span class="metric-value">
                {{ metrics.tiempo_promedio_reparacion_minutos || 'N/A' }} min
              </span>
            </div>
          </div>

          <div class="metric-item">
            <div class="metric-icon" [style.background-color]="'#f44336'">
              <mat-icon>payments</mat-icon>
            </div>
            <div class="metric-info">
              <span class="metric-label">Gasto Total Acumulado</span>
              <span class="metric-value">
                {{ metrics.gasto_total.toFixed(2) }}
              </span>
            </div>
          </div>
        </div>
      </mat-card-content>

      <mat-card-content *ngIf="!metrics" class="loading">
        <p>Cargando métricas...</p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [``]
})
export class PerformanceCardComponent implements OnInit {
  @Input() metrics: WorkshopPerformanceMetrics | null = null;

  ngOnInit() {}
}
