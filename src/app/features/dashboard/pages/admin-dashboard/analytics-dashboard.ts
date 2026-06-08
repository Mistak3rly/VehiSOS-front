import { Component, Input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { DashboardAnalisisResponse } from '../../../../core/models/api.models';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [TitleCasePipe],
  template: `
    @if (analytics) {
      <div class="analytics-wrap">

        <!-- KPI row -->
        <div class="an-kpi-row">
          <div class="an-kpi-card">
            <div class="an-kpi-icon blue">
              <span class="material-icons-round">home_repair_service</span>
            </div>
            <div class="an-kpi-body">
              <span class="an-kpi-label">Total Talleres</span>
              <span class="an-kpi-value">{{ analytics.total_talleres }}</span>
              <span class="an-kpi-sub">{{ analytics.talleres_activos }} activos</span>
            </div>
          </div>

          <div class="an-kpi-card">
            <div class="an-kpi-icon orange">
              <span class="material-icons-round">star</span>
            </div>
            <div class="an-kpi-body">
              <span class="an-kpi-label">Rating Promedio</span>
              <span class="an-kpi-value">{{ analytics.rating_promedio_sistema.toFixed(1) }}<small>/5.0</small></span>
              <div class="an-rating-bar">
                <div class="an-rating-fill" [style.width]="ratingPct(analytics.rating_promedio_sistema)"></div>
              </div>
            </div>
          </div>

          <div class="an-kpi-card">
            <div class="an-kpi-icon green">
              <span class="material-icons-round">build</span>
            </div>
            <div class="an-kpi-body">
              <span class="an-kpi-label">Servicios Registrados</span>
              <span class="an-kpi-value">{{ analytics.total_servicios_registrados }}</span>
              <span class="an-kpi-sub">total histórico</span>
            </div>
          </div>
        </div>

        <!-- Bottom row -->
        <div class="an-bottom-row">

          <!-- Top 5 talleres -->
          <div class="an-panel">
            <div class="an-panel-header">
              <span class="material-icons-round">trending_up</span>
              <h3>Top 5 Talleres por Desempeño</h3>
            </div>
            @if (analytics.talleres_top.length > 0) {
              <table class="an-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Servicios</th>
                    <th>Calificación</th>
                    <th>Tiempo Prom.</th>
                    <th>Gasto Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (t of analytics.talleres_top; track t.id_taller) {
                    <tr>
                      <td class="an-id">{{ t.id_taller }}</td>
                      <td><span class="an-chip blue">{{ t.total_servicios }}</span></td>
                      <td>
                        @if (t.calificacion_promedio !== null) {
                          <div class="an-rating-cell">
                            <span class="an-rating-txt">{{ t.calificacion_promedio!.toFixed(1) }} ⭐</span>
                            <div class="an-rating-bar sm">
                              <div class="an-rating-fill orange" [style.width]="ratingPct(t.calificacion_promedio!)"></div>
                            </div>
                          </div>
                        } @else {
                          <span class="an-na">N/A</span>
                        }
                      </td>
                      <td>{{ t.tiempo_promedio_reparacion_minutos !== null ? t.tiempo_promedio_reparacion_minutos + ' min' : 'N/A' }}</td>
                      <td><span class="an-chip green">\${{ t.gasto_total.toFixed(0) }}</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <div class="an-empty">
                <span class="material-icons-round">inbox</span>
                <p>Sin datos de talleres aún.</p>
              </div>
            }
          </div>

          <!-- Especialidades -->
          <div class="an-panel">
            <div class="an-panel-header">
              <span class="material-icons-round">category</span>
              <h3>Especialidades Más Demandadas</h3>
            </div>
            @if (analytics.especialidades_demandadas.length > 0) {
              @for (esp of analytics.especialidades_demandadas; track esp.tipo_vehiculo) {
                <div class="an-esp-item">
                  <div class="an-esp-header">
                    <span class="an-esp-name">{{ esp.tipo_vehiculo | titlecase }}</span>
                    <span class="an-chip purple">{{ esp.count }} servicios</span>
                  </div>
                  <div class="an-esp-bar-row">
                    <span class="an-esp-rating">{{ esp.rating_promedio.toFixed(1) }}/5.0</span>
                    <div class="an-rating-bar sm flex1">
                      <div class="an-rating-fill purple" [style.width]="ratingPct(esp.rating_promedio)"></div>
                    </div>
                  </div>
                </div>
              }
            } @else {
              <div class="an-empty">
                <span class="material-icons-round">category</span>
                <p>Sin datos de especialidades.</p>
              </div>
            }
          </div>

        </div>
      </div>
    } @else {
      <div class="an-empty">
        <span class="material-icons-round">hourglass_empty</span>
        <p>Cargando analíticas...</p>
      </div>
    }
  `,
  styles: [`
    .analytics-wrap { display: flex; flex-direction: column; gap: 1.25rem; }

    /* KPI row */
    .an-kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .an-kpi-card {
      display: flex; align-items: center; gap: 1rem;
      background: #f8fafc; border: 1px solid #edf2f7; border-radius: 12px;
      padding: 1rem 1.25rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }
    .an-kpi-icon {
      width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .an-kpi-icon .material-icons-round { font-size: 22px; color: #fff; }
    .an-kpi-icon.blue   { background: #3b82f6; }
    .an-kpi-icon.orange { background: #f59e0b; }
    .an-kpi-icon.green  { background: #10b981; }

    .an-kpi-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .an-kpi-label { font-size: 0.72rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
    .an-kpi-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; line-height: 1.2; }
    .an-kpi-value small { font-size: 0.9rem; font-weight: 500; color: #94a3b8; margin-left: 2px; }
    .an-kpi-sub { font-size: 0.75rem; color: #94a3b8; }

    /* Rating bar */
    .an-rating-bar { height: 4px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-top: 4px; }
    .an-rating-bar.sm { height: 4px; flex: 1; }
    .an-rating-bar.flex1 { flex: 1; }
    .an-rating-fill { height: 100%; background: #3b82f6; border-radius: 4px; transition: width 0.4s; }
    .an-rating-fill.orange { background: #f59e0b; }
    .an-rating-fill.purple { background: #8b5cf6; }

    /* Bottom row */
    .an-bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    /* Panel */
    .an-panel {
      background: #f8fafc; border: 1px solid #edf2f7; border-radius: 12px;
      padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }
    .an-panel-header { display: flex; align-items: center; gap: 0.5rem; }
    .an-panel-header .material-icons-round { font-size: 18px; color: #64748b; }
    .an-panel-header h3 { font-size: 0.9rem; font-weight: 700; color: #334155; margin: 0; }

    /* Table */
    .an-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    .an-table th {
      text-align: left; padding: 6px 8px;
      color: #94a3b8; font-weight: 600; font-size: 0.72rem; text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
    }
    .an-table td { padding: 8px 8px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
    .an-table tr:last-child td { border-bottom: none; }
    .an-id { font-weight: 700; color: #64748b; font-size: 0.78rem; }

    /* Chips */
    .an-chip {
      display: inline-block; padding: 2px 10px; border-radius: 20px;
      font-size: 0.75rem; font-weight: 600;
    }
    .an-chip.blue   { background: #dbeafe; color: #1d4ed8; }
    .an-chip.green  { background: #d1fae5; color: #065f46; }
    .an-chip.purple { background: #ede9fe; color: #6d28d9; }

    .an-na { color: #cbd5e1; font-size: 0.8rem; }

    /* Rating cell */
    .an-rating-cell { display: flex; flex-direction: column; gap: 3px; }
    .an-rating-txt  { font-size: 0.8rem; font-weight: 600; color: #334155; }

    /* Especialidades */
    .an-esp-item { padding: 0.6rem 0; border-bottom: 1px solid #f1f5f9; }
    .an-esp-item:last-child { border-bottom: none; }
    .an-esp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .an-esp-name { font-size: 0.85rem; font-weight: 600; color: #334155; }
    .an-esp-bar-row { display: flex; align-items: center; gap: 0.5rem; }
    .an-esp-rating { font-size: 0.75rem; color: #94a3b8; white-space: nowrap; }

    /* Empty */
    .an-empty { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2rem; color: #94a3b8; text-align: center; }
    .an-empty .material-icons-round { font-size: 32px; }
    .an-empty p { font-size: 0.85rem; margin: 0; }

    @media (max-width: 900px) {
      .an-kpi-row { grid-template-columns: 1fr; }
      .an-bottom-row { grid-template-columns: 1fr; }
    }
  `]
})
export class AnalyticsDashboardComponent {
  @Input() analytics: DashboardAnalisisResponse | null = null;

  ratingPct(rating: number): string {
    return `${Math.min(100, (rating / 5) * 100)}%`;
  }
}
