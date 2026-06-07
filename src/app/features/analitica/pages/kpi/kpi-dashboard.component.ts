import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AnaliticaService } from '../../../../core/services/analitica.service';
import { AuthService } from '../../../../core/services/auth.service';
import { KPIGlobal, KPITaller } from '../../../../core/models/api.models';
import type { ApexChart, ApexNonAxisChartSeries, ApexAxisChartSeries, ApexXAxis, ApexPlotOptions, ApexDataLabels, ApexTitleSubtitle } from 'ng-apexcharts';

@Component({
  selector: 'app-kpi-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './kpi-dashboard.component.html',
  styleUrl: './kpi-dashboard.component.scss',
})
export class KpiDashboardComponent implements OnInit {
  isAdmin = false;
  isLoading = signal(true);
  errorMessage = signal('');

  kpiGlobal = signal<KPIGlobal | null>(null);
  kpiTaller = signal<KPITaller | null>(null);

  // Chart options
  pieChartEstados: { series: ApexNonAxisChartSeries; labels: string[]; chart: ApexChart; title: ApexTitleSubtitle } = {
    series: [], labels: [], chart: { type: 'pie', height: 260 }, title: { text: 'Incidentes por estado' },
  };

  pieChartTenants: { series: ApexNonAxisChartSeries; labels: string[]; chart: ApexChart; title: ApexTitleSubtitle } = {
    series: [], labels: [], chart: { type: 'donut', height: 260 }, title: { text: 'Incidentes por tenant' },
  };

  barChartTalleres: { series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis; plotOptions: ApexPlotOptions; dataLabels: ApexDataLabels; title: ApexTitleSubtitle } = {
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

  buildCharts(data: KPIGlobal): void {
    const estados = data.incidentes_por_estado;
    this.pieChartEstados = {
      ...this.pieChartEstados,
      series: Object.values(estados),
      labels: Object.keys(estados),
    };

    const tenants = data.incidentes_por_tenant;
    this.pieChartTenants = {
      ...this.pieChartTenants,
      series: Object.values(tenants),
      labels: Object.keys(tenants),
    };

    const top = data.top_talleres;
    this.barChartTalleres = {
      ...this.barChartTalleres,
      series: [{ name: 'Rating', data: top.map(t => t.rating) }],
      xaxis: { categories: top.map(t => t.nombre) },
    };
  }

  pct(value: number): string { return `${value.toFixed(1)}%`; }
  money(value: number): string { return `Bs. ${value.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`; }
}
