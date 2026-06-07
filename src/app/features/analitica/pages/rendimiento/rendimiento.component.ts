import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AnaliticaService } from '../../../../core/services/analitica.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-rendimiento',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './rendimiento.component.html',
  styleUrl: './rendimiento.component.scss',
})
export class RendimientoComponent implements OnInit {
  isLoading = signal(true);
  errorMessage = signal('');
  tecnicos = signal<any[]>([]);
  talleres = signal<any[]>([]);
  activeTab = signal<'tecnicos' | 'talleres'>('tecnicos');

  barChartTecnicos = {
    series: [{ name: 'Completadas', data: [] as number[] }, { name: 'Asignadas', data: [] as number[] }],
    chart: { type: 'bar' as const, height: 300, stacked: false },
    xaxis: { categories: [] as string[] },
    title: { text: 'Atenciones por técnico' },
    colors: ['#10b981', '#3b82f6'],
    plotOptions: { bar: { columnWidth: '60%' } },
    dataLabels: { enabled: false },
  };

  constructor(private svc: AnaliticaService, private authSvc: AuthService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.isLoading.set(true);
    this.svc.rendimientoTecnicos().subscribe({
      next: (data) => {
        this.tecnicos.set(data);
        this.barChartTecnicos = {
          ...this.barChartTecnicos,
          series: [
            { name: 'Completadas', data: data.map((t: any) => t.atenciones_completadas) },
            { name: 'Asignadas', data: data.map((t: any) => t.atenciones_asignadas) },
          ],
          xaxis: { categories: data.map((t: any) => t.nombre.split(' ')[0]) },
        };
      },
      error: (err) => this.errorMessage.set(err.error?.detail || 'Error'),
    });

    this.svc.rendimientoTalleres().subscribe({
      next: (data) => { this.talleres.set(data); this.isLoading.set(false); },
      error: (err) => { this.errorMessage.set(err.error?.detail || 'Error'); this.isLoading.set(false); },
    });
  }

  cumplimientoColor(pct: number): string {
    if (pct >= 80) return '#10b981';
    if (pct >= 50) return '#f59e0b';
    return '#ef4444';
  }

  stars(rating: number): string { return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating)); }
}
