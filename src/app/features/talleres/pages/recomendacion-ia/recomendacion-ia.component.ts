import { Component, OnInit, signal, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InteligenciaService } from '../../../../core/services/inteligencia.service';
import { TalleresService } from '../../../../core/services/talleres.service';
import {
  WorkshopAssistantRequest,
  WorkshopAssistantResponse,
  WorkshopSuggestionIn,
} from '../../../../core/models/api.models';

declare const google: any;

interface TallerRecomendadoUI {
  name: string;
  address: string;
  distanceKm: number;
  rating: number;
  priceTier: string;
  reasons: string[];
  latitude: number;
  longitude: number;
  isOpen: boolean;
}

@Component({
  selector: 'app-recomendacion-ia',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './recomendacion-ia.component.html',
  styleUrl: './recomendacion-ia.component.scss',
})
export class RecomendacionIAComponent implements OnInit {
  private inteligenciaService = inject(InteligenciaService);
  private talleresService = inject(TalleresService);

  // Inputs
  issue = signal<string>('Pinchazo de llanta');
  userLatitude = signal<number>(-17.7833); // La Paz por defecto
  userLongitude = signal<number>(-63.1833);

  // Estado
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  assistantText = signal<string>('');
  recommendations = signal<TallerRecomendadoUI[]>([]);
  provider = signal<string>('local');
  model = signal<string | null>(null);
  isFallback = signal<boolean>(false);

  // UI
  showDetail = signal<boolean>(false);
  selectedWorkshop = signal<TallerRecomendadoUI | null>(null);

  // Google Maps
  @ViewChild('googleMap', { static: false }) googleMap!: ElementRef;
  private map: any;
  private markers: any[] = [];

  ngOnInit(): void {
    // Intentar obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLatitude.set(position.coords.latitude);
          this.userLongitude.set(position.coords.longitude);
          this.cargarRecomendaciones();
        },
        () => {
          // Si falla, usar defaults y cargar igual
          this.cargarRecomendaciones();
        }
      );
    } else {
      this.cargarRecomendaciones();
    }
  }

  cargarRecomendaciones(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Primero obtener talleres disponibles
    this.talleresService.listTalleres().subscribe({
      next: (talleres: any[]) => {
        // Filtrar solo talleres activos con ubicación válida
        const talleresValidos = talleres.filter(
          (t: any) => t.activo && t.latitud && t.longitud
        );
        const talleresArray: any[] = talleresValidos;

        if (talleresValidos.length === 0) {
          this.error.set('No hay talleres activos disponibles en tu área.');
          this.isLoading.set(false);
          return;
        }

        // Convertir talleres a candidatos para IA usando datos REALES
        const candidates: WorkshopSuggestionIn[] = talleresValidos.map((t: any) => {
          const distanceKm = this._calcularDistancia(
            this.userLatitude(),
            this.userLongitude(),
            t.latitud!,
            t.longitud!
          );

          // Calcular rating basado en datos REALES del taller
          // Mayor capacidad = mejor rating base
          // Menor comisión = mejor rating (más económico para el cliente)
          const capacidadScore = Math.min(t.capacidad_maxima / 20, 5); // Max 5 puntos por capacidad
          const comisionScore = Math.max(0, 5 - t.porcentaje_comision / 5); // Menor comisión = mejor
          const distanciaScore = Math.max(0, 5 - distanceKm / 2); // Más cerca = mejor
          const realRating = Math.min(5, Math.max(3, (capacidadScore + comisionScore + distanciaScore) / 3));

          // Determinar tier basado en comisión real
          let priceTier: string;
          if (t.porcentaje_comision < 10) {
            priceTier = 'Budget';
          } else if (t.porcentaje_comision < 20) {
            priceTier = 'Standard';
          } else {
            priceTier = 'Premium';
          }

          // Generar reasons basadas en datos REALES
          const reasons: string[] = [];
          if (t.capacidad_maxima > 10) {
            reasons.push(`Alta capacidad: ${t.capacidad_maxima} vehículos`);
          }
          if (t.porcentaje_comision < 15) {
            reasons.push('Precios competitivos');
          }
          if (distanceKm < 3) {
            reasons.push('Muy cercano a tu ubicación');
          }
          reasons.push(t.ciudad ? `Ubicado en ${t.ciudad}` : 'Taller verificado');

          return {
            name: t.nombre,
            address: t.direccion || `${t.ciudad || 'Ubicación'} - ${t.nit || 'Sin NIT'}`,
            distanceKm: distanceKm,
            rating: Math.round(realRating * 10) / 10, // Rating REAL calculado
            priceTier: priceTier, // Tier REAL basado en comisión
            reasons: reasons, // Razones REALES basadas en datos
            latitude: t.latitud!,
            longitude: t.longitud!,
            isOpen: t.activo,
          };
        });

        // Ordenar por distancia (más cercanos primero) para enviar a la IA
        candidates.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

        // Preparar request para IA
        const request: WorkshopAssistantRequest = {
          issue: this.issue(),
          userLatitude: this.userLatitude(),
          userLongitude: this.userLongitude(),
          candidates: candidates,
        };

        // Llamar al servicio de IA
        this.inteligenciaService.assistantRecommendWorkshops(request).subscribe({
          next: (response: WorkshopAssistantResponse) => {
            this.assistantText.set(response.assistantText);
            this.provider.set(response.provider);
            this.model.set(response.model);
            this.isFallback.set(response.fallback ?? false);

            // Mapear recomendaciones
            const mapped: TallerRecomendadoUI[] = response.recommendations.map(
              (r) => ({
                name: r.name,
                address: r.address || 'Sin dirección',
                distanceKm: r.distanceKm ?? 0,
                rating: r.rating ?? 4.0,
                priceTier: r.priceTier || 'Standard',
                reasons: r.reasons || [],
                latitude: r.latitude,
                longitude: r.longitude,
                isOpen: r.isOpen ?? true,
              })
            );

            this.recommendations.set(mapped);
            this.isLoading.set(false);

            // Inicializar mapa después de renderizar
            setTimeout(() => this.initMap(), 100);
          },
          error: (err) => {
            console.error('Error en recomendación IA:', err);
            let errorMsg = 'No se pudo obtener recomendaciones.';

            // Analizar el error del backend
            if (err?.error?.detail) {
              const detail = err.error.detail;
              if (detail.includes('OPENAI_API_KEY no está configurada')) {
                errorMsg = '⚠️ OPENAI_API_KEY no configurada. El administrador debe configurar la API key de OpenAI en el archivo .env del backend.';
                this.isFallback.set(true);
                this.provider.set('local');
              } else if (detail.includes('OpenAI API error: 401')) {
                errorMsg = '❌ API Key de OpenAI inválida o expirada. Verifica tu API key en https://platform.openai.com/api-keys';
                this.isFallback.set(true);
                this.provider.set('local');
              } else if (detail.includes('OpenAI API error: 429')) {
                errorMsg = '⏳ Límite de rate de OpenAI alcanzado. Intenta nuevamente en unos segundos.';
              } else if (detail.includes('OpenAI')) {
                errorMsg = `❌ Error de OpenAI: ${detail}`;
                this.isFallback.set(true);
                this.provider.set('local');
              } else {
                errorMsg = `❌ ${detail}`;
              }
            } else if (err?.status === 502) {
              errorMsg = '❌ Error de conexión con el servicio de IA. El backend no puede conectar con OpenAI.';
              this.isFallback.set(true);
              this.provider.set('local');
            } else if (err?.status === 503) {
              errorMsg = '⚠️ Servicio de IA no configurado. Contacta al administrador.';
              this.isFallback.set(true);
              this.provider.set('local');
            }

            this.error.set(errorMsg);
            this.isLoading.set(false);
          },
        });
      },
      error: (err: any) => {
        console.error('Error cargando talleres:', err);
        this.error.set('Error al cargar talleres disponibles.');
        this.isLoading.set(false);
      },
    });
  }

  seleccionarTaller(taller: TallerRecomendadoUI): void {
    this.selectedWorkshop.set(taller);
    this.showDetail.set(true);
  }

  cerrarDetalle(): void {
    this.showDetail.set(false);
    this.selectedWorkshop.set(null);
  }

  solicitarAyuda(taller: TallerRecomendadoUI): void {
    alert(`Solicitud enviada a ${taller.name}. Pronto te contactarán.`);
  }

  recargar(): void {
    this.cargarRecomendaciones();
  }

  cambiarProblema(nuevoProblema: string): void {
    this.issue.set(nuevoProblema);
    this.cargarRecomendaciones();
  }

  private _calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this._toRad(lat2 - lat1);
    const dLon = this._toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this._toRad(lat1)) *
        Math.cos(this._toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private _toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  // Google Maps Methods
  private initMap(): void {
    if (!this.googleMap?.nativeElement || !google?.maps) {
      return;
    }

    const userLat = this.userLatitude();
    const userLng = this.userLongitude();

    // Crear mapa centrado en la ubicación del usuario
    this.map = new google.maps.Map(this.googleMap.nativeElement, {
      center: { lat: userLat, lng: userLng },
      zoom: 12,
      mapTypeId: 'roadmap',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    // Limpiar marcadores anteriores
    this.markers.forEach((marker) => marker.setMap(null));
    this.markers = [];

    // Marcador de la ubicación del usuario (azul)
    const userMarker = new google.maps.Marker({
      position: { lat: userLat, lng: userLng },
      map: this.map,
      title: 'Tu ubicación',
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        scaledSize: new google.maps.Size(40, 40),
      },
    });
    this.markers.push(userMarker);

    // Marcadores de los talleres recomendados
    this.recommendations().forEach((taller, index) => {
      const color = index === 0 ? 'green' : index === 1 ? 'yellow' : 'red';
      const marker = new google.maps.Marker({
        position: { lat: taller.latitude, lng: taller.longitude },
        map: this.map,
        title: `${taller.name} - ⭐${taller.rating}`,
        label: {
          text: String(index + 1),
          color: 'white',
          fontWeight: 'bold',
        },
        icon: {
          url: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
          scaledSize: new google.maps.Size(36, 36),
          labelOrigin: new google.maps.Point(18, 12),
        },
      });

      // Info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937;">${taller.name}</h3>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">⭐ ${taller.rating} · ${taller.distanceKm.toFixed(1)} km</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #9ca3af;">${taller.address}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
        this.seleccionarTaller(taller);
      });

      this.markers.push(marker);
    });

    // Ajustar zoom para mostrar todos los marcadores
    if (this.recommendations().length > 0) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: userLat, lng: userLng });
      this.recommendations().forEach((t) => bounds.extend({ lat: t.latitude, lng: t.longitude }));
      this.map.fitBounds(bounds, { padding: 50 });
    }
  }
}
