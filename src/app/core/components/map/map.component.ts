import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../../environments/environment';
import { HeatmapPoint } from '../../services/dashboard-ia.service';

declare var google: any;

interface MarkerData extends HeatmapPoint {
  marker?: any;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  @Input() heatmapPoints: HeatmapPoint[] = [];
  @Input() center = { lat: -17.783, lng: -63.182 }; // Centro Bolivia/Cochabamba
  @Input() zoom = 13;

  isLoading = signal(true);
  hasError = signal(false);
  map!: any;
  markers: MarkerData[] = [];
  heatmapLayer!: any;
  infoWindow?: any;

  async ngOnInit() {
    await this.initializeMap();
    this.setupHeatmap();
    this.addMarkers();
  }

  private async initializeMap() {
    try {
      const loader = new Loader({
        apiKey: environment.googleMapsApiKey,
        version: 'weekly',
        libraries: ['maps', 'marker', 'visualization'],
      });

      const { Map } = await loader.importLibrary('maps');
      const { HeatmapLayer } = await loader.importLibrary('visualization');

      this.map = new Map(this.mapContainer.nativeElement, {
        zoom: this.zoom,
        center: this.center,
        mapTypeId: 'roadmap',
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.LEFT_CENTER,
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: google.maps.ControlPosition.TOP_LEFT,
        },
      });

      this.isLoading.set(false);
    } catch (error) {
      console.error('Error inicializando mapa:', error);
      this.hasError.set(true);
      this.isLoading.set(false);
    }
  }

  private setupHeatmap() {
    if (!this.map || this.heatmapPoints.length === 0) return;

    const { visualization } = google.maps;

    const heatmapData = this.heatmapPoints.map(p => 
      new google.maps.LatLng(p.lat, p.lng)
    );

    this.heatmapLayer = new visualization.HeatmapLayer({
      data: heatmapData,
      map: this.map,
      radius: 50,
      opacity: 0.6,
    });
  }

  private async addMarkers() {
    if (!this.map) return;

    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary(
      'marker'
    ) as any;

    this.infoWindow = new google.maps.InfoWindow();

    for (const point of this.heatmapPoints) {
      const pinColor = this.getPinColor(point.prioridad);
      const pinElement = new PinElement({
        background: pinColor,
        borderColor: '#000',
        glyphColor: '#fff',
      });

      const marker = new AdvancedMarkerElement({
        map: this.map,
        position: { lat: point.lat, lng: point.lng },
        title: point.titulo,
        content: pinElement.element,
      });

      marker.addEventListener('click', () => {
        this.showIncidentInfo(point, marker.position as any);
      });

      this.markers.push({ ...point, marker });
    }
  }

  private showIncidentInfo(
    point: HeatmapPoint,
    position: any
  ) {
    const contentHtml = `
      <div class="incident-info">
        <h3>${point.titulo}</h3>
        <p><strong>Prioridad:</strong> <span class="priority-badge priority-${point.prioridad.toLowerCase()}">${point.prioridad}</span></p>
        <p><strong>ID Incidente:</strong> ${point.incidenteId}</p>
        <p><strong>Ubicación:</strong> ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}</p>
      </div>
    `;

    this.infoWindow!.setContent(contentHtml);
    this.infoWindow!.setPosition(position);
    this.infoWindow!.open(this.map);
  }

  private getPinColor(prioridad: string): string {
    const colorMap: Record<string, string> = {
      crítica: '#dc2626',
      alta: '#ea580c',
      media: '#eab308',
      baja: '#22c55e',
    };
    return colorMap[prioridad.toLowerCase()] || '#6b7280';
  }

  // ── Métodos públicos para controlar el mapa ──

  centerOnPoint(point: HeatmapPoint) {
    this.map.setCenter({ lat: point.lat, lng: point.lng });
    this.map.setZoom(15);
  }

  toggleHeatmap() {
    this.heatmapLayer.setMap(this.heatmapLayer.getMap() ? null : this.map);
  }

  resetMap() {
    this.map.setCenter(this.center);
    this.map.setZoom(this.zoom);
  }
}
