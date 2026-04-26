import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { PagoRead } from '../../../../core/models/api.models';

@Component({
  selector: 'app-global-finances',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <header class="admin-header">
        <h1>Gestión Financiera Global</h1>
        <p>Recaudación total, deudas de talleres y reportes de comisiones.</p>
      </header>

      <div class="stats-grid">
        <div class="stat-card highlight">
          <span class="material-icons-round">payments</span>
          <div class="stat-content">
            <span class="stat-label">Recaudación Total</span>
            <span class="stat-value">{{ totalRecaudado() | currency }}</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="material-icons-round">account_balance_wallet</span>
          <div class="stat-content">
            <span class="stat-label">Comisiones Generadas (10%)</span>
            <span class="stat-value">{{ totalComisiones() | currency }}</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="material-icons-round">history</span>
          <div class="stat-content">
            <span class="stat-label">Transacciones Totales</span>
            <span class="stat-value">{{ pagos().length }}</span>
          </div>
        </div>
      </div>

      <section class="records-section">
        <div class="section-header">
          <h2>Reporte de Pagos por Taller</h2>
        </div>

        <div class="table-container card">
          <table *ngIf="pagos().length > 0; else noData">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Incidente</th>
                <th>Taller</th>
                <th>Monto Total</th>
                <th>Comisión</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let pago of pagos()">
                <td>{{ pago.fecha_pago | date:'short' }}</td>
                <td>#{{ pago.id_incidente }}</td>
                <td>Taller #{{ pago.id_taller }}</td>
                <td>{{ pago.monto_total | currency }}</td>
                <td class="commission-cell">{{ (pago.monto_total * 0.1) | currency }}</td>
                <td>
                  <span class="status-badge" [ngClass]="pago.estado_pago">
                    {{ pago.estado_pago }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noData>
          <div class="empty-state">
            <span class="material-icons-round">info</span>
            <p>No hay registros financieros para mostrar.</p>
          </div>
        </ng-template>
      </section>
    </div>
  `,
  styles: [`
    .admin-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .admin-header { margin-bottom: 2rem; h1 { font-size: 2rem; font-weight: 800; color: #1a202c; } p { color: #718096; } }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: white; border-radius: 12px; padding: 1.5rem; border: 1px solid #edf2f7; display: flex; gap: 1rem; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.04); .material-icons-round { font-size: 2rem; color: #a0aec0; } .stat-label { display: block; font-size: 0.8rem; color: #718096; text-transform: uppercase; font-weight: 600; } .stat-value { font-size: 1.8rem; font-weight: 800; color: #2d3748; } &.highlight { border-left: 4px solid #667eea; .material-icons-round { color: #667eea; } } }
    .records-section { margin-top: 2rem; .section-header { margin-bottom: 1rem; h2 { font-size: 1.4rem; font-weight: 700; color: #2d3748; } } }
    .card { background: white; border-radius: 12px; border: 1px solid #edf2f7; }
    .table-container { overflow: hidden; table { width: 100%; border-collapse: collapse; th { padding: 1rem 1.5rem; background: #f8fafc; color: #64748b; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #edf2f7; text-align: left; } td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; color: #4a5568; } .commission-cell { color: #059669; font-weight: 700; } .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; &.pagado { background: #dcfce7; color: #166534; } &.pendiente { background: #fef9c3; color: #854d0e; } &.fallido { background: #fee2e2; color: #991b1b; } } } }
    .empty-state { text-align: center; padding: 3rem; color: #a0aec0; .material-icons-round { font-size: 3rem; } }
  `]
})
export class GlobalFinances implements OnInit {
  pagos = signal<PagoRead[]>([]);
  totalRecaudado = signal(0);
  totalComisiones = signal(0);
  isLoading = signal(false);

  constructor(private logisticaService: LogisticaService) {}

  ngOnInit() {
    this.cargarPagosGlobales();
  }

  cargarPagosGlobales() {
    this.isLoading.set(true);
    this.logisticaService.listAllPagos().subscribe({
      next: (data) => {
        this.pagos.set(data);
        this.calcularTotales(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar pagos globales', err);
        this.isLoading.set(false);
      }
    });
  }

  private calcularTotales(pagos: PagoRead[]) {
    const recaudado = pagos.reduce((acc, p) => acc + Number(p.monto_total), 0);
    const comisiones = recaudado * 0.1;
    this.totalRecaudado.set(recaudado);
    this.totalComisiones.set(comisiones);
  }
}
