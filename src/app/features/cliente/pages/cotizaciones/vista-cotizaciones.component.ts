import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CotizacionService } from '../../../../core/services/cotizacion.service';
import { CotizacionRead, CotizacionRespuesta } from '../../../../core/models/api.models';

@Component({
  selector: 'app-vista-cotizaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista-cotizaciones.component.html',
  styleUrl: './vista-cotizaciones.component.scss',
})
export class VistaCotizacionesComponent implements OnInit {
  cotizaciones = signal<CotizacionRead[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  respondiendo = signal<number | null>(null);

  constructor(private svc: CotizacionService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.isLoading.set(true);
    this.svc.misCotizaciones().subscribe({
      next: (data) => { this.cotizaciones.set(data); this.isLoading.set(false); },
      error: (err) => { this.errorMessage.set(err.error?.detail || 'Error al cargar cotizaciones'); this.isLoading.set(false); },
    });
  }

  aceptar(c: CotizacionRead): void {
    const metodo = prompt('Método de pago (efectivo / tarjeta / QR / transferencia):');
    if (!metodo) return;
    const payload: CotizacionRespuesta = { accion: 'aceptar', metodo_pago: metodo };
    this.respondiendo.set(c.id);
    this.svc.responder(c.id, payload).subscribe({
      next: () => { this.successMessage.set('Cotización aceptada. El taller comenzará la reparación.'); this.respondiendo.set(null); this.cargar(); },
      error: (err) => { this.errorMessage.set(err.error?.detail || 'Error'); this.respondiendo.set(null); },
    });
  }

  rechazar(c: CotizacionRead): void {
    const motivo = prompt('Motivo de rechazo (opcional):');
    const payload: CotizacionRespuesta = { accion: 'rechazar', motivo_rechazo: motivo || undefined };
    this.respondiendo.set(c.id);
    this.svc.responder(c.id, payload).subscribe({
      next: () => { this.successMessage.set('Cotización rechazada.'); this.respondiendo.set(null); this.cargar(); },
      error: (err) => { this.errorMessage.set(err.error?.detail || 'Error'); this.respondiendo.set(null); },
    });
  }

  confirmarPago(id: number): void {
    if (!confirm('¿Confirmar el pago de esta cotización?')) return;
    this.svc.confirmarPago(id).subscribe({
      next: () => { this.successMessage.set('Pago confirmado exitosamente.'); this.cargar(); },
      error: (err) => this.errorMessage.set(err.error?.detail || 'Error al confirmar pago'),
    });
  }

  descargarPdf(id: number): void {
    this.svc.descargarPdf(id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cotizacion_${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => this.errorMessage.set(err.error?.detail || 'Error al generar PDF'),
    });
  }

  estadoColor(estado: string): string {
    const map: Record<string, string> = {
      pendiente: '#f59e0b', enviada: '#3b82f6', aceptada: '#10b981',
      rechazada: '#ef4444', vencida: '#6b7280', pagada: '#8b5cf6',
    };
    return map[estado] || '#6b7280';
  }

  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente', enviada: 'Esperando respuesta', aceptada: 'Aceptada',
      rechazada: 'Rechazada', vencida: 'Vencida', pagada: 'Pagada',
    };
    return map[estado] || estado;
  }
}
