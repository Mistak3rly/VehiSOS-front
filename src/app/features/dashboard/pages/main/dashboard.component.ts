import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  stats = [
    { title: 'Solicitudes activas', value: '12', icon: 'assignment', color: 'blue' },
    { title: 'Emergencias hoy', value: '3', icon: 'emergency', color: 'red' },
    { title: 'Vehículos registrados', value: '45', icon: 'directions_car', color: 'green' },
    { title: 'Pagos pendientes', value: '$1,250', icon: 'payments', color: 'orange' },
  ];

  recentActivity = [
    { id: 1, type: 'Asistencia', description: 'Batería descargada - Av. Busch', time: 'hace 15 min', status: 'En camino', statusClass: 'status-info' },
    { id: 2, type: 'Emergencia', description: 'Colisión leve - 4to Anillo', time: 'hace 40 min', status: 'Completado', statusClass: 'status-success' },
    { id: 3, type: 'Mantenimiento', description: 'Cambio de aceite - Taller Central', time: 'hace 2 horas', status: 'Pendiente', statusClass: 'status-warning' },
    { id: 4, type: 'Pago', description: 'Suscripción Premium renovada', time: 'hace 5 horas', status: 'Completado', statusClass: 'status-success' },
  ];

  myVehicles = [
    { brand: 'Tesla', model: 'Model 3', plate: 'ABC-123', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=200&auto=format&fit=crop' },
    { brand: 'Toyota', model: 'Hilux', plate: 'XYZ-789', image: 'https://images.unsplash.com/photo-1618389519356-91b6567222f7?q=80&w=200&auto=format&fit=crop' },
  ];

  constructor() {}

  ngOnInit(): void {}
}
