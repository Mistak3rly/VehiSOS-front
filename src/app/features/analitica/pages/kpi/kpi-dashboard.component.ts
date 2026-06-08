import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardKpiService } from '../../../../core/services/dashboard-kpi.service';
import { AuthService } from '../../../../core/services/auth.service';
<<<<<<< Updated upstream
import { KPIGlobal, KPITaller } from '../../../../core/models/api.models';
import type {
  ApexChart, ApexNonAxisChartSeries, ApexAxisChartSeries,
  ApexXAxis, ApexPlotOptions, ApexDataLabels, ApexTitleSubtitle, ApexStroke, ApexFill,
=======
import { AdminService } from '../../../../core/services/admin.service';
import { DashboardKPIResponse, TenantRead } from '../../../../core/models/api.models';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexNonAxisChartSeries,
  ApexLegend,
  ApexGrid,
  ApexYAxis,
  ApexTooltip
>>>>>>> Stashed changes
} from 'ng-apexcharts';

@Component({
  selector: 'app-kpi-dashboard',
  standalone: true,
<<<<<<< Updated upstream
  imports: [CommonModule, NgApexchartsModule, FormsModule],
=======
  imports: [CommonModule, FormsModule, NgApexchartsModule],
>>>>>>> Stashed changes
  templateUrl: './kpi-dashboard.component.html',
  styleUrl: './kpi-dashboard.component.scss',
})
export class KpiDashboardComponent implements OnInit {
  isAdmin = false;
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal('');

  // Dashboard Data
  kpiData = signal<DashboardKPIResponse | null>(null);

<<<<<<< Updated upstream
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
=======
  // Filters
  fechaInicio = '';
  fechaFin = '';
  tipoIncidente = '';
  zonaId = '';
  tenantId: number | null = null;
>>>>>>> Stashed changes

  // Static options for filters
  incidentTypes = [
    { codigo: 'pinchazo', nombre: 'Pinchazo' },
    { codigo: 'bateria', nombre: 'Batería' },
    { codigo: 'motor', nombre: 'Motor' },
    { codigo: 'choque', nombre: 'Choque' }
  ];

<<<<<<< Updated upstream
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
=======
  zones = [
    { codigo: 'Norte', nombre: 'Zona Norte' },
    { codigo: 'Sur', nombre: 'Zona Sur' },
    { codigo: 'Este', nombre: 'Zona Este' },
    { codigo: 'Oeste', nombre: 'Zona Oeste' },
    { codigo: 'Central', nombre: 'Zona Central' }
  ];
>>>>>>> Stashed changes

  // Tenants list for admin dropdown
  tenants: TenantRead[] = [];

  // ApexCharts Configurations
  chartIncidentesSeries: ApexAxisChartSeries = [];
  chartIncidentesOptions: any = {};

  chartZonasSeries: ApexAxisChartSeries = [];
  chartZonasOptions: any = {};

  chartSlaSeries: ApexNonAxisChartSeries = [];
  chartSlaOptions: any = {};

  chartCancelacionesSeries: ApexNonAxisChartSeries = [];
  chartCancelacionesOptions: any = {};

  constructor(
    private kpiSvc: DashboardKpiService,
    private authSvc: AuthService,
    private adminSvc: AdminService
  ) {}

  ngOnInit(): void {
    const role = (this.authSvc.getUserRole() || '').toLowerCase();
    this.isAdmin = role === 'admin' || role === 'administrador' || role === 'superadmin';

    if (this.isAdmin) {
      this.loadTenants();
    }
<<<<<<< Updated upstream
    this.loadTendencia();
=======
    this.loadDashboardData();
>>>>>>> Stashed changes
  }

  loadTenants(): void {
    this.adminSvc.listTenants().subscribe({
      next: (data) => {
        this.tenants = data;
      },
      error: (err) => {
        console.error('Error al cargar tenants:', err);
      }
    });
  }

  loadDashboardData(isFilterChange = false): void {
    if (isFilterChange) {
      this.isSubmitting.set(true);
    } else {
      this.isLoading.set(true);
    }
    this.errorMessage.set('');

    const filters: any = {};
    if (this.fechaInicio) filters.fecha_inicio = new Date(this.fechaInicio).toISOString();
    if (this.fechaFin) filters.fecha_fin = new Date(this.fechaFin).toISOString();
    if (this.tipoIncidente) filters.tipo_incidente = this.tipoIncidente;
    if (this.zonaId) filters.zona_id = this.zonaId;
    
    // Only pass tenant_id if user is admin (Backend enforces this, but let's be clean)
    if (this.isAdmin && this.tenantId !== null && this.tenantId !== undefined) {
      filters.tenant_id = this.tenantId;
    }

    this.kpiSvc.getDashboardKPIs(filters).subscribe({
      next: (data) => {
        this.kpiData.set(data);
        this.buildCharts(data);
        this.isLoading.set(false);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.detail || 'Error al conectar con el servidor de KPIs.');
        this.isLoading.set(false);
        this.isSubmitting.set(false);
      }
    });
  }

  applyFilters(): void {
    this.loadDashboardData(true);
  }

<<<<<<< Updated upstream
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
=======
  clearFilters(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.tipoIncidente = '';
    this.zonaId = '';
    this.tenantId = null;
    this.loadDashboardData(true);
  }

  buildCharts(data: DashboardKPIResponse): void {
    // 1. Incidentes por Tipo
    const tipoLabels = data.incidentes_por_tipo.map(item => item.tipo);
    const tipoValues = data.incidentes_por_tipo.map(item => item.cantidad);
    
    this.chartIncidentesSeries = [{
      name: 'Incidentes',
      data: tipoValues
    }];
    this.chartIncidentesOptions = {
      chart: {
        type: 'bar',
        height: 280,
        toolbar: { show: false },
        fontFamily: 'Manrope, sans-serif'
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          horizontal: false,
          columnWidth: '50%',
          distributed: true
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#fff']
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 1,
          opacity: 0.2
        }
      },
      colors: ['#c40016', '#3b82f6', '#10b981', '#f59e0b', '#6b7280'],
      xaxis: {
        categories: tipoLabels,
        labels: {
          style: {
            colors: '#5d3f3c',
            fontWeight: '600'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#5d3f3c'
          }
        }
      },
      grid: {
        borderColor: 'rgba(196, 0, 22, 0.08)',
        strokeDashArray: 4
      },
      legend: {
        show: false
      },
      tooltip: {
        theme: 'light'
      }
    };

    // 2. Zonas críticas
    const zonaLabels = data.zonas_con_mas_incidentes.map(item => item.zona);
    const zonaValues = data.zonas_con_mas_incidentes.map(item => item.cantidad);
    
    this.chartZonasSeries = [{
      name: 'Incidentes',
      data: zonaValues
    }];
    this.chartZonasOptions = {
      chart: {
        type: 'bar',
        height: 280,
        toolbar: { show: false },
        fontFamily: 'Manrope, sans-serif'
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          horizontal: true,
          barHeight: '55%',
          distributed: false
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          colors: ['#fff']
        }
      },
      colors: ['#1d1b1b'],
      xaxis: {
        categories: zonaLabels,
        labels: {
          style: {
            colors: '#5d3f3c'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#5d3f3c',
            fontWeight: '600'
          }
        }
      },
      grid: {
        borderColor: 'rgba(0, 0, 0, 0.05)',
        strokeDashArray: 4
      },
      tooltip: {
        theme: 'light'
      }
    };
>>>>>>> Stashed changes

    // 3. Cumplimiento SLA
    this.chartSlaSeries = [data.sla.porcentaje_cumplimiento];
    this.chartSlaOptions = {
      chart: {
        type: 'radialBar',
        height: 280,
        fontFamily: 'Manrope, sans-serif'
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: '70%',
            background: 'transparent'
          },
          track: {
            background: 'rgba(196, 0, 22, 0.05)',
            strokeWidth: '95%'
          },
          dataLabels: {
            name: {
              show: true,
              fontSize: '14px',
              color: '#5d3f3c',
              offsetY: -10,
              fontWeight: '600'
            },
            value: {
              show: true,
              fontSize: '32px',
              fontWeight: '800',
              color: '#c40016',
              offsetY: 8,
              formatter: (val: number) => `${val.toFixed(1)}%`
            }
          }
        }
      },
      colors: [data.sla.porcentaje_cumplimiento >= 85 ? '#10b981' : (data.sla.porcentaje_cumplimiento >= 70 ? '#f59e0b' : '#ef4444')],
      labels: ['Cumplimiento SLA']
    };

    // 4. Motivos de cancelación
    const cancelLabels = data.casos_cancelados_detalle.map(item => item.motivo);
    const cancelValues = data.casos_cancelados_detalle.map(item => item.cantidad);
    
    this.chartCancelacionesSeries = cancelValues;
    this.chartCancelacionesOptions = {
      chart: {
        type: 'donut',
        height: 280,
        fontFamily: 'Manrope, sans-serif'
      },
      labels: cancelLabels,
      colors: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#6b7280'],
      legend: {
        position: 'bottom',
        fontFamily: 'Manrope, sans-serif',
        labels: {
          colors: '#5d3f3c'
        },
        markers: {
          radius: 12
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number, opts: any) => {
          return opts.w.config.series[opts.seriesIndex];
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: { show: true, color: '#5d3f3c', fontSize: '14px', fontWeight: '600' },
              value: {
                show: true,
                color: '#1d1b1b',
                fontSize: '20px',
                fontWeight: '800',
                formatter: (val: string) => val
              },
              total: {
                show: true,
                label: 'Cancelados',
                color: '#5d3f3c',
                formatter: (w: any) => {
                  return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                }
              }
            }
          }
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val} incidentes`
        }
      }
    };
  }

<<<<<<< Updated upstream
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
=======
  // Format Helpers
  pct(value: number): string {
    return `${value.toFixed(1)}%`;
  }
>>>>>>> Stashed changes
}
