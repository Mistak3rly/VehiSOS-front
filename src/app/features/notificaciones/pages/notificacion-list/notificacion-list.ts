import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificacionRead } from '../../../../core/models/api.models';

@Component({
  selector: 'app-notificacion-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion-list.html',
  styleUrl: './notificacion-list.scss',
})
export class NotificacionList implements OnInit {
  notifications = signal<NotificacionRead[]>([]);
  isLoading = signal(false);
  userRole = signal<string>('cliente');

  constructor(
    private logisticaService: LogisticaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userRole.set(this.authService.getUserRole().toLowerCase());
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading.set(true);
    this.logisticaService.listNotificaciones().subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading notifications', err);
        this.isLoading.set(false);
      }
    });
  }

  markAsRead(id: number) {
    this.logisticaService.marcarLeida(id).subscribe(() => {
      this.notifications.update(list => 
        list.map(n => n.id === id ? { ...n, estado: 'leida' } : n)
      );
    });
  }

  getNotificationIcon(notif: NotificacionRead): string {
    const title = notif.titulo.toLowerCase();
    const role = this.userRole();

    // Adaptación según el rol del usuario (CU-013)
    if (role === 'operario' || role === 'tecnico') {
      if (title.includes('asignacion') || title.includes('nuevo')) return 'assignment_late';
      if (title.includes('urgente') || title.includes('prioridad')) return 'report_problem';
      if (title.includes('ruta')) return 'map';
      return 'notification_important';
    }

    // Adaptación para Clientes
    if (title.includes('aceptada')) return 'handshake';
    if (title.includes('camino')) return 'local_shipping';
    if (title.includes('llegada')) return 'location_on';
    if (title.includes('completada')) return 'task_alt';
    if (title.includes('pago')) return 'payments';
    
    return 'notifications';
  }

  getNotificationColor(notif: NotificacionRead): string {
    const title = notif.titulo.toLowerCase();
    const role = this.userRole();

    if (role === 'operario' || role === 'tecnico') {
      if (title.includes('urgente')) return 'color-danger';
      if (title.includes('nuevo')) return 'color-warning';
      return 'color-info';
    }

    if (title.includes('completada') || title.includes('aceptada')) return 'color-success';
    if (title.includes('pago')) return 'color-warning';
    
    return 'color-info';
  }
}
