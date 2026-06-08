import { Component, OnInit, AfterViewInit, ElementRef, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AnaliticaService } from '../../../../core/services/analitica.service';
import { DatosMapa, PuntoMapa } from '../../../../core/models/api.models';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-mapa-incidentes',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, FormsModule],
  templateUrl: './mapa-incidentes.component.html',
  styleUrl: './mapa-incidentes.component.scss',
})
export class MapaIncidentesComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  datos = signal<DatosMapa | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  filtroTipo = signal<string>('todos');
  filtroDesde = '';
  filtroHasta = '';
  private map: any = null;
  private markers: any[] = [];

  tiposColores: Record<string, string> = {
    'Mecánico': '#ef4444', 'Eléctrico': '#f59e0b', 'Llanta': '#10b981',
    'Accidente': '#8b5cf6', 'Carrocería': '#3b82f6', 'Sin tipo': '#6b7280',
  };

  pieChart = {
    series: [] as number[],
    labels: [] as string[],
    chart: { type: 'pie' as const, height: 240 },
    title: { text: 'Distribución por tipo' },
    colors: ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#3b82f6', '#6b7280'],
  };

  constructor(private svc: AnaliticaService) {}

  ngOnInit(): void {
    this.cargarMapa();
  }

  cargarMapa(): void {
    this.isLoading.set(true);
    this.svc.datosMapa(undefined, this.filtroDesde || undefined, this.filtroHasta || undefined).subscribe({
      next: (data) => {
        this.datos.set(data);
        this.pieChart = {
          ...this.pieChart,
          series: Object.values(data.agrupacion_por_tipo),
          labels: Object.keys(data.agrupacion_por_tipo),
        };
        this.isLoading.set(false);
        this.initMap();
      },
      error: (err) => { this.errorMessage.set(err.error?.detail || 'Error al cargar mapa'); this.isLoading.set(false); },
    });
  }

  aplicarFiltroFecha(): void {
    this.cargarMapa();
  }

  limpiarFechas(): void {
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.cargarMapa();
  }

  ngAfterViewInit(): void {
    if (!this.isLoading() && this.datos()) this.initMap();
  }

  initMap(): void {
    if (!this.mapContainer?.nativeElement) return;
    if ((window as any).google?.maps) {
      this.createMap();
    } else {
      // Dynamically load Google Maps
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=visualization`;
      script.onload = () => this.createMap();
      document.head.appendChild(script);
    }
  }

  createMap(): void {
    if (!this.mapContainer?.nativeElement) return;
    const g = (window as any).google;
    if (!g) return;

    this.map = new g.maps.Map(this.mapContainer.nativeElement, {
      center: { lat: -17.78, lng: -63.18 },
      zoom: 10,
      mapTypeId: 'roadmap',
    });
    this.addMarkers(this.datos()?.puntos || []);
  }

  addMarkers(puntos: PuntoMapa[]): void {
    this.markers.forEach(m => m.setMap(null));
    this.markers = [];
    const g = (window as any).google;
    if (!this.map || !g) return;

    const filtro = this.filtroTipo();
    const filtrados = filtro === 'todos' ? puntos : puntos.filter(p => p.tipo === filtro);

    filtrados.forEach(p => {
      const color = this.tiposColores[p.tipo] || '#6b7280';
      const marker = new g.maps.Marker({
        position: { lat: p.latitud, lng: p.longitud },
        map: this.map,
        title: p.titulo,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#fff',
          strokeWeight: 2,
          scale: 10,
        },
      });

      const info = new g.maps.InfoWindow({
        content: `<div style="padding:8px;max-width:200px">
          <strong>${p.titulo}</strong><br>
          <span style="color:${color}">■ ${p.tipo}</span><br>
          Prioridad: ${p.prioridad}<br>
          <small>${new Date(p.fecha).toLocaleDateString()}</small>
        </div>`,
      });
      marker.addListener('click', () => info.open(this.map!, marker));
      this.markers.push(marker);
    });
  }

  aplicarFiltro(tipo: string): void {
    this.filtroTipo.set(tipo);
    this.addMarkers(this.datos()?.puntos || []);
  }

  get tiposDisponibles(): string[] {
    return ['todos', ...Object.keys(this.datos()?.agrupacion_por_tipo || {})];
  }

  get totalPuntos(): number { return this.datos()?.puntos.length || 0; }
}
