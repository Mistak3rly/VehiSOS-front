import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { PagoRead, ResumenFinancieroRead } from '../../../../core/models/api.models';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pago-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pago-list.html',
  styleUrl: './pago-list.scss',
})
export class PagoList implements OnInit {
  pagos = signal<PagoRead[]>([]);
  resumen = signal<ResumenFinancieroRead | null>(null);
  isLoading = signal(false);

  // [CU-014] Montos para el proceso de cobro
  montoServicio: number = 0;
  montoComision: number = 0; // [CU-014] Comisión de la plataforma (10%)

  constructor(private logisticaService: LogisticaService) {}

  ngOnInit(): void {
    this.cargarDatos();
    // [CU-014] Precondición: El cliente accede al detalle de la solicitud (simulado para demo)
    this.calcularTotales(150.00); // Precio base de ejemplo
  }

  // [CU-014] Flujo Principal: El sistema muestra el monto total y calcula comisión
  calcularTotales(precioBase: number) {
    this.montoServicio = precioBase;
    // Según doc: El taller paga un 10% de comisión (definido en backend o calculado aquí para visualización)
    this.montoComision = precioBase * 0.10; 
  }

  // [CU-014] Flujo Principal: El cliente selecciona el método de pago y procesa
  procesarPago() {
    this.isLoading.set(true);
    const datosPago = {
      id_incidente: 1, // ID de incidente de prueba
      id_taller: 1,    // ID de taller de prueba
      monto_total: this.montoServicio,
      metodo_pago: 'tarjeta_online',
      estado_pago: 'pagado' as any
    };

    this.logisticaService.registrarPago(datosPago).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        // [CU-014] Postcondición: El pago queda registrado y el estado se actualiza
        alert('Pago procesado con éxito. El taller ha sido notificado.');
        this.cargarDatos();
      },
      error: (err) => {
        this.isLoading.set(false);
        alert('Error al procesar el pago: ' + (err.error?.detail || 'Verifique la asignación activa.'));
      }
    });
  }

  cargarDatos() {
    this.isLoading.set(true);
    
    this.logisticaService.listTalleres().subscribe({
      next: (talleres) => {
        if (talleres.length > 0) {
          const tallerId = talleres[0].id;
          this.fetchFinancialData(tallerId);
        } else {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Error al cargar talleres', err);
        this.isLoading.set(false);
      }
    });
  }

  private fetchFinancialData(tallerId: number) {
    this.logisticaService.resumenFinanciero(tallerId).subscribe({
      next: (res) => this.resumen.set(res),
      error: (err) => console.error('Error resumen', err)
    });

    this.logisticaService.historialPagos(tallerId).subscribe({
      next: (data) => {
        this.pagos.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error pagos', err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusClass(estado: string): string {
    const e = estado.toLowerCase();
    if (e.includes('pagado')) return 'status-success';
    if (e.includes('pendiente')) return 'status-pending';
    if (e.includes('fallido')) return 'status-error';
    return 'status-info';
  }
}
