import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EspecialidadVehiculoRead } from '../../../../core/models/api.models';

@Component({
  selector: 'app-specialty-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
  ],
  template: `
    <mat-card class="specialty-card">
      <mat-card-header>
        <mat-card-title>Especialidades por Tipo de Vehículo</mat-card-title>
        <mat-icon class="header-icon">directions_car</mat-icon>
      </mat-card-header>

      <div class="table-container">
        <table mat-table [dataSource]="specialties" class="specialty-table">
          <ng-container matColumnDef="tipo_vehiculo">
            <th mat-header-cell *matHeaderCellDef>Tipo de Vehículo</th>
            <td mat-cell *matCellDef="let element">
              <div class="vehicle-cell">
                <mat-icon class="vehicle-icon">directions_car</mat-icon>
                <span class="vehicle-type">{{ element.tipo_vehiculo | titlecase }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="marca">
            <th mat-header-cell *matHeaderCellDef>Marca / Modelo</th>
            <td mat-cell *matCellDef="let element">
              <div class="marca-cell">
                <strong>{{ element.marca || 'Todas' }}</strong>
                <small *ngIf="element.modelo">{{ element.modelo }}</small>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="reparaciones_exitosas">
            <th mat-header-cell *matHeaderCellDef>Exitosas</th>
            <td mat-cell *matCellDef="let element">
              <mat-chip selected color="primary" class="exitosas-chip">
                {{ element.reparaciones_exitosas }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="calificacion_promedio">
            <th mat-header-cell *matHeaderCellDef>Calificación</th>
            <td mat-cell *matCellDef="let element">
              <div class="rating-cell">
                <div class="rating-value">{{ element.calificacion_promedio !== null ? element.calificacion_promedio.toFixed(1) : 'N/A' }} ⭐</div>
                <mat-progress-bar mode="determinate" [value]="(element.calificacion_promedio || 0) * 20" class="rating-bar"></mat-progress-bar>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="dias_sin_falla">
            <th mat-header-cell *matHeaderCellDef>Días Sin Falla</th>
            <td mat-cell *matCellDef="let element">
              <span class="days-badge" [class.danger]="(element.dias_sin_falla || 0) < 7">{{ element.dias_sin_falla || '-' }}d</span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="data-row"></tr>

          <tr *ngIf="specialties.length === 0" class="no-data-row">
            <td [attr.colspan]="displayedColumns.length" class="no-data-cell">
              <p>No hay especialidades registradas</p>
            </td>
          </tr>
        </table>
      </div>

      <mat-card-footer *ngIf="specialties.length > 0" class="footer">
        <small>Total: {{ specialties.length }} especialidades</small>
      </mat-card-footer>
    </mat-card>
  `,
  styles: [``]
})
export class SpecialtyTableComponent implements OnInit {
  @Input() specialties: EspecialidadVehiculoRead[] = [];

  displayedColumns: string[] = ['tipo_vehiculo', 'marca', 'reparaciones_exitosas', 'calificacion_promedio', 'dias_sin_falla'];

  ngOnInit() {}
}
