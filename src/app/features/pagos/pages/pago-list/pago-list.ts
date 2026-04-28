import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { PagoRead, ResumenFinancieroRead } from '../../../../core/models/api.models';

@Component({
  selector: 'app-pago-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pago-list.html',
  styleUrl: './pago-list.scss',
})
export class PagoList implements OnInit {
  pagos = signal<PagoRead[]>([]);
  resumen = signal<ResumenFinancieroRead | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  pagosPendientes = computed(() => this.pagos().filter(p => p.estado_pago === 'pendiente'));
  pagosConfirmados = computed(() => this.pagos().filter(p => p.estado_pago === 'pagado'));

  constructor(private logisticaService: LogisticaService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.isLoading.set(true);
    this.error.set(null);

    this.logisticaService.listTalleres().subscribe({
      next: (talleres) => {
        if (talleres.length > 0) {
          this.fetchFinancialData(talleres[0].id);
        } else {
          this.isLoading.set(false);
          this.error.set('No tienes un taller registrado.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('Error al cargar los datos del taller.');
      }
    });
  }

  private fetchFinancialData(tallerId: number) {
    this.logisticaService.resumenFinanciero(tallerId).subscribe({
      next: (res) => this.resumen.set(res),
      error: () => {}
    });

    this.logisticaService.historialPagos(tallerId).subscribe({
      next: (data) => {
        this.pagos.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('Error al cargar el historial de pagos.');
      }
    });
  }

  getStatusClass(estado: string): string {
    const e = estado.toLowerCase();
    if (e === 'pagado') return 'status-success';
    if (e === 'pendiente') return 'status-pending';
    if (e === 'fallido') return 'status-error';
    if (e === 'reembolsado') return 'status-info';
    return 'status-info';
  }

  getStatusLabel(estado: string): string {
    const map: Record<string, string> = {
      pagado: 'Confirmado',
      pendiente: 'Pendiente',
      fallido: 'Fallido',
      reembolsado: 'Reembolsado',
    };
    return map[estado.toLowerCase()] ?? estado;
  }
}
