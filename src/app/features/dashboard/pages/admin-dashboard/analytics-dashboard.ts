import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { DashboardAnalisisResponse } from '../../../../core/models/api.models';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
  ],
  template: `
    <div class="analytics-container" *ngIf="analytics">
      <div class="kpi-grid">
        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-icon" [style.background-color]="'#1976d2'">
              <mat-icon>home</mat-icon>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Total Talleres</span>
              <span class="kpi-value">{{ analytics.total_talleres }}</span>
              <small class="kpi-active">{{ analytics.talleres_activos }} activos</small>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-icon" [style.background-color]="'#ff9800'">
              <mat-icon>star</mat-icon>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Rating Promedio Sistema</span>
              <span class="kpi-value">{{ analytics.rating_promedio_sistema.toFixed(1) }}/5.0</span>
              <mat-progress-bar mode="determinate" [value]="(analytics.rating_promedio_sistema || 0) * 20" class="rating-bar"></mat-progress-bar>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-icon" [style.background-color]="'#4caf50'">
              <mat-icon>build</mat-icon>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Total Servicios Registrados</span>
              <span class="kpi-value">{{ analytics.total_servicios_registrados }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="dashboard-row">
        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-card-title>Top 5 Talleres por Desempeño</mat-card-title>
            <mat-icon class="header-icon">trending_up</mat-icon>
          </mat-card-header>

          <div class="table-container">
            <table mat-table [dataSource]="analytics.talleres_top" class="workshops-table">
              <ng-container matColumnDef="id_taller">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let element">{{ element.id_taller }}</td>
              </ng-container>
              <ng-container matColumnDef="total_servicios">
                <th mat-header-cell *matHeaderCellDef>Servicios</th>
                <td mat-cell *matCellDef="let element"><mat-chip selected color="primary" class="service-chip">{{ element.total_servicios }}</mat-chip></td>
              </ng-container>
              <ng-container matColumnDef="calificacion_promedio">
                <th mat-header-cell *matHeaderCellDef>Calificación</th>
                <td mat-cell *matCellDef="let element">
                  <div class="rating-cell">
                    <span class="rating-value">{{ element.calificacion_promedio !== null ? element.calificacion_promedio.toFixed(1) : 'N/A' }} ⭐</span>
                    <mat-progress-bar mode="determinate" [value]="(element.calificacion_promedio || 0) * 20" class="rating-bar"></mat-progress-bar>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="tiempo_promedio_reparacion_minutos">
                <th mat-header-cell *matHeaderCellDef>Tiempo Prom.</th>
                <td mat-cell *matCellDef="let element">{{ element.tiempo_promedio_reparacion_minutos || 'N/A' }} min</td>
              </ng-container>
              <ng-container matColumnDef="gasto_total">
                <th mat-header-cell *matHeaderCellDef>Gasto Acumulado</th>
                <td mat-cell *matCellDef="let element"><span class="gasto-badge">\${{ element.gasto_total.toFixed(0) }}</span></td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="topDisplayedColumns; sticky: true"></tr>
              <tr mat-row *matRowDef="let row; columns: topDisplayedColumns;" class="data-row"></tr>
            </table>
          </div>
        </mat-card>

        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-card-title>Especialidades Más Demandadas</mat-card-title>
            <mat-icon class="header-icon">trending_up</mat-icon>
          </mat-card-header>

          <div class="specialties-list" *ngIf="analytics.especialidades_demandadas.length > 0">
            <div *ngFor="let specialty of analytics.especialidades_demandadas" class="specialty-item">
              <div class="specialty-header">
                <span class="vehicle-type">{{ specialty.tipo_vehiculo | titlecase }}</span>
                <mat-chip selected color="accent" class="demand-chip">{{ specialty.count }} servicios</mat-chip>
              </div>
              <div class="specialty-details">
                <span class="rating">Rating: {{ specialty.rating_promedio.toFixed(1) }}/5.0</span>
                <mat-progress-bar mode="determinate" [value]="(specialty.rating_promedio || 0) * 20" class="rating-bar"></mat-progress-bar>
              </div>
            </div>
          </div>

          <div *ngIf="analytics.especialidades_demandadas.length === 0" class="no-data">
            <p>No hay datos de especialidades</p>
          </div>
        </mat-card>
      </div>
    </div>

    <div *ngIf="!analytics" class="loading"><p>Cargando análiticas...</p></div>
  `,
  styles: [``]
})
export class AnalyticsDashboardComponent implements OnInit {
  @Input() analytics: DashboardAnalisisResponse | null = null;

  topDisplayedColumns: string[] = ['id_taller', 'total_servicios', 'calificacion_promedio', 'tiempo_promedio_reparacion_minutos', 'gasto_total'];

  ngOnInit() {}
}
