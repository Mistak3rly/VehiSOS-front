import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AnaliticaService } from '../../../../core/services/analitica.service';
import { AuthService } from '../../../../core/services/auth.service';
import { KPIGlobal, KPITaller } from '../../../../core/models/api.models';
import type {
  ApexChart, ApexNonAxisChartSeries, ApexAxisChartSeries,
  ApexXAxis, ApexPlotOptions, ApexDataLabels, ApexTitleSubtitle, ApexStroke, ApexFill,
} from 'ng-apexcharts';

@Component({
  selector: 'app-kpi-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, FormsModule],
  templateUrl: './kpi-dashboard.component.html',
  styleUrl: './kpi-dashboard.component.scss',
})
export class KpiDashboardComponent implements OnInit {
  isAdmin = false;
  isLoading = signal(true);
  errorMessage = signal('');

  kpiGlobal = signal<KPIGlobal | null>(null);
  kpiTaller = signal<KPITaller | null>(null);

  // Tendencia
  tendenciaData: { dia: string; total: number }[] = [];
  diasFiltro = 30;

  // Gráfico tendencia (line chart)
  lineChartTendencia: {
    series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis;
    stroke: ApexStroke; fill: ApexFill; title: ApexTitleSubtitle;
  } = {
    series: [{ name: 'Incidentes', data: [] }],
    chart: { type: 'area', height: 220, toolbar: { show: false }, sparkline: { enabled: false } },
    xaxis: { categories: [], labels: { rotate: -45, style: { fontSize: '10px' } } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0 } },
    title: { text: 'Tendencia de incidentes (últimos 30 días)' },
  };

  // Gráficos existentes
  pieChartEstados: { series: ApexNonAxisChartSeries; labels: string[]; chart: ApexChart; title: ApexTitleSubtitle } = {
    series: [], labels: [], chart: { type: 'pie', height: 260 }, title: { text: 'Incidentes por estado' },
  };

  pieChartTenants: { series: ApexNonAxisChartSeries; labels: string[]; chart: ApexChart; title: ApexTitleSubtitle } = {
    series: [], labels: [], chart: { type: 'donut', height: 260 }, title: { text: 'Incidentes por tenant' },
  };

  barChartTalleres: {
    series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis;
    plotOptions: ApexPlotOptions; dataLabels: ApexDataLabels; title: ApexTitleSubtitle;
  } = {
    series: [{ name: 'Rating', data: [] }],
    chart: { type: 'bar', height: 260 },
    xaxis: { categories: [] },
    plotOptions: { bar: { horizontal: true } },
    dataLabels: { enabled: false },
    title: { text: 'Top Talleres' },
  };

  constructor(private analiticaSvc: AnaliticaService, private authSvc: AuthService) {}

  ngOnInit(): void {
    const role = (this.authSvc.getUserRole() || '').toLowerCase();
    this.isAdmin = role === 'admin' || role === 'administrador';
    if (this.isAdmin) {
      this.loadKpiGlobal();
    } else {
      this.loadKpiTaller();
    }
    this.loadTendencia();
  }

  loadKpiGlobal(): void {
    this.analiticaSvc.kpiGlobal().subscribe({
      next: (data) => {
        this.kpiGlobal.set(data);
        this.buildCharts(data);
        this.isLoading.set(false);
      },
      error: (err) => { this.errorMessage.set(err.error?.detail || 'Error al cargar KPIs'); this.isLoading.set(false); },
    });
  }

  loadKpiTaller(): void {
    this.analiticaSvc.kpiTaller().subscribe({
      next: (data) => { this.kpiTaller.set(data); this.isLoading.set(false); },
      error: (err) => { this.errorMessage.set(err.error?.detail || 'Error al cargar KPIs'); this.isLoading.set(false); },
    });
  }

  loadTendencia(): void {
    this.analiticaSvc.tendenciaIncidentes(this.diasFiltro).subscribe({
      next: (data) => {
        this.tendenciaData = data;
        this.lineChartTendencia = {
          ...this.lineChartTendencia,
          series: [{ name: 'Incidentes', data: data.map(d => d.total) }],
          xaxis: {
            categories: data.map(d => d.dia.substring(5)), // MM-DD
            labels: { rotate: -45, style: { fontSize: '10px' } },
          },
          title: { text: `Tendencia de incidentes (últimos ${this.diasFiltro} días)` },
        };
      },
    });
  }

  buildCharts(data: KPIGlobal): void {
    const estados = data.incidentes_por_estado;
    this.pieChartEstados = { ...this.pieChartEstados, series: Object.values(estados), labels: Object.keys(estados) };

    const tenants = data.incidentes_por_tenant;
    this.pieChartTenants = { ...this.pieChartTenants, series: Object.values(tenants), labels: Object.keys(tenants) };

    const top = data.top_talleres;
    this.barChartTalleres = {
      ...this.barChartTalleres,
      series: [{ name: 'Rating', data: top.map(t => t.rating) }],
      xaxis: { categories: top.map(t => t.nombre) },
    };
  }

  cambiarDias(dias: number): void {
    this.diasFiltro = dias;
    this.loadTendencia();
  }

  exportarKpiPdf(): void {
    window.open(`${(this.analiticaSvc as any).BASE}/reportes/operativo/pdf`, '_blank');
  }

  exportarKpiExcel(): void {
    this.analiticaSvc.descargarExcelOperativo().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'kpi_vehisos.xlsx'; a.click();
      URL.revokeObjectURL(url);
    });
  }

  pct(value: number): string { return `${value.toFixed(1)}%`; }
  money(value: number): string { return `Bs. ${value.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`; }
}
