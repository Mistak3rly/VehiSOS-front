import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-taller-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './taller-dashboard.component.html',
  styleUrl: '../main/dashboard.component.scss', // Reusing base styles
})
export class TallerDashboardComponent {
  stats = [
    { title: 'Atenciones Asignadas', value: '8', icon: 'build', color: 'blue' },
    { title: 'Técnicos Disponibles', value: '4', icon: 'engineering', color: 'green' },
    { title: 'Ganancias del Mes', value: '$3,800', icon: 'payments', color: 'orange' },
    { title: 'Valoración Clientes', value: '4.8', icon: 'star', color: 'red' },
  ];

  pendingServices = [
    { id: 'S-101', vehicle: 'Toyota Hilux', issue: 'Falla eléctrica', time: '10:30 AM' },
    { id: 'S-102', vehicle: 'Nissan Frontier', issue: 'Cambio neumático', time: '11:15 AM' },
  ];

  technicians = [
    { name: 'Juan Mendez', status: 'Online', class: 'status-success' },
    { name: 'Pedro Salas', status: 'En Ruta', class: 'status-info' },
    { name: 'Luis Vera', status: 'Offline', class: 'status-warning' },
  ];
}
