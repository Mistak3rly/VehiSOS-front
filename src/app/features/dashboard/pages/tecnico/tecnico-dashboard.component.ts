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
} from '../../../../core/models/api.models';

import { PerformanceCardComponent } from '../taller-dashboard/performance-card';
import { SpecialtyTableComponent } from '../taller-dashboard/specialty-table';

/**
 * Dashboard para Técnico
 * Muestra: Mi desempeño personal, especialidades, casos activos
 */
@Component({
  selector: 'app-tecnico-dashboard',
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
  ],
  templateUrl: './tecnico-dashboard.component.html',
  styleUrl: './tecnico-dashboard.component.scss',
})
export class TecnicoDashboardComponent implements OnInit, OnDestroy {
  // Personal Performance
  personalMetrics: WorkshopPerformanceMetrics | null = null;
  specialties: EspecialidadVehiculoRead[] = [];

  // Case Management
  stats = [
    { title: 'Casos Asignados', value: '2', icon: 'priority_high', color: 'red' },
    { title: 'Atenciones Hoy', value: '5', icon: 'build', color: 'blue' },
    { title: 'Tiempo Promedio', value: '25 min', icon: 'timer', color: 'green' },
    { title: 'Mi Calificación', value: '4.9', icon: 'star', color: 'orange' },
  ];

  activeCases = [
    {
      id: 'CASE-001',
      cliente: 'Juan Perez',
      vehiculo: 'Tesla Model 3',
      ubicacion: 'Av. Busch y 2do Anillo',
      problema: 'Falla de Batería',
      status: 'En camino',
      class: 'status-info'
    }
  ];

  analysis = {
    prioridad: 'Alta',
    herramientas: ['Multímetro', 'Batería de repuesto', 'Scanner OBD-II'],
    sugerenciaIA: 'El modelo presenta alertas de sobrecalentamiento previo. Revisar conectores de alta tensión.'
  };

  timeline = [
    { action: 'Caso asignado por Taller Central', time: '10:00 AM' },
    { action: 'Desplazamiento iniciado', time: '10:05 AM' },
    { action: 'Llegada al sitio estimada', time: '10:20 AM' },
  ];

  isLoading = false;
  tecnicoId: number | null = null;
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
    const user = this.auth.currentUser();
    if (user?.id) {
      this.tecnicoId = user.id;
      this.loadPersonalMetrics();
      this.loadSpecialties();
    } else {
      this.snackBar.open('No se pudo identificar al técnico', 'Cerrar', { duration: 5000 });
    }
  }

  private loadPersonalMetrics() {
    // Obtener taller_id del usuario técnico
    const storedTallerId = localStorage.getItem('taller_id');
    if (storedTallerId) {
      this.isLoading = true;
      const tallerId = parseInt(storedTallerId, 10);

      this.inteligencia
        .getWorkshopPerformance(tallerId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.personalMetrics = data;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error cargando desempeño personal:', err);
            this.snackBar.open('Error cargando mis métricas', 'Cerrar', { duration: 5000 });
            this.isLoading = false;
          },
        });
    }
  }

  private loadSpecialties() {
    const storedTallerId = localStorage.getItem('taller_id');
    if (storedTallerId) {
      const tallerId = parseInt(storedTallerId, 10);

      this.inteligencia
        .getWorkshopSpecialties(tallerId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.specialties = data;
          },
          error: (err) => {
            console.error('Error cargando especialidades:', err);
          },
        });
    }
  }

  refreshData() {
    this.snackBar.open('Actualizando datos...', '', { duration: 2000 });
    this.loadData();
  }
}
