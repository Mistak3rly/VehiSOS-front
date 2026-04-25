import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: '../main/dashboard.component.scss', // Reusing base styles
})
export class AdminDashboardComponent {
  stats = [
    { title: 'Usuarios Totales', value: '1,240', icon: 'people', color: 'blue' },
    { title: 'Talleres Afiliados', value: '85', icon: 'store', color: 'green' },
    { title: 'Emergencias Globales', value: '312', icon: 'emergency', color: 'red' },
    { title: 'Recaudación Total', value: '$12,450', icon: 'payments', color: 'orange' },
  ];

  pendingWorkshops = [
    { name: 'Taller El Rayo', owner: 'Carlos Perez', location: 'Centro', date: '2026-04-20' },
    { name: 'Mecánica Pro', owner: 'Ana Gomez', location: 'Norte', date: '2026-04-22' },
  ];

  auditLogs = [
    { action: 'Login Administrador', user: 'admin@vehisos.com', time: 'hace 5 min' },
    { action: 'Registro Taller', user: 'system', time: 'hace 2 horas' },
    { action: 'Cambio de Rol', user: 'admin@vehisos.com', time: 'hace 4 horas' },
  ];
}
