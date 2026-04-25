import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tecnico-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tecnico-dashboard.component.html',
  styleUrl: '../main/dashboard.component.scss', // Reusing base styles
})
export class TecnicoDashboardComponent {
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
}
