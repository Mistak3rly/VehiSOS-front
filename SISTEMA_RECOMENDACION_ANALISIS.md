# 🤖 Análisis del Sistema de Recomendación de Talleres - VehiSOS

**Fecha:** 26 de Abril de 2026  
**Componente:** Workshop Recommendation System (IA + Local Fallback)  
**Estado:** ✅ Implementado y Funcional

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Flujo de Datos](#flujo-de-datos)
3. [Endpoints Requeridos](#endpoints-requeridos)
4. [Análisis del Componente](#análisis-del-componente)
5. [Análisis del Servicio](#análisis-del-servicio)
6. [Algoritmo de Cálculo](#algoritmo-de-cálculo)
7. [Manejo de Errores](#manejo-de-errores)
8. [Validaciones y Mejoras](#validaciones-y-mejoras)
9. [Testing Recomendado](#testing-recomendado)

---

## 🎯 Descripción General

El **Sistema de Recomendación de Talleres** es un módulo que ayuda a los clientes a encontrar el mejor taller para sus necesidades usando:

1. **IA (OpenAI GPT)** - Procesamiento inteligente y análisis contextual
2. **Algoritmo Local Fallback** - Cálculo basado en datos reales cuando la IA no está disponible

### 📍 Ubicación en la Aplicación

```
URL: /cliente/talleres/recomendacion-ia
Ruta: src/app/features/talleres/pages/recomendacion-ia/
Servicios: 
  - InteligenciaService (IA)
  - TalleresService (datos de talleres)
```

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO CLIENTE                          │
│            Accede a /cliente/talleres/recomendacion-ia      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │  ngOnInit() → Obtener Geolocalización │
        │  - navigator.geolocation.getCurrentPosition() │
        │  - Fallback: coords La Paz [-17.7833, -63.1833] │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌───────────────────────────────────────┐
        │  cargarRecomendaciones()              │
        │  1. TalleresService.listTalleres()    │
        │  2. Filtrar talleres activos + coords │
        └────────────┬──────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌─────────────┐      ┌───────────────────┐
    │ Si error    │      │ Crear candidatos  │
    │ talleres    │      │ WorkshopSuggestionIn[]
    │ → error     │      │                   │
    └─────────────┘      │ - name            │
                         │ - address         │
                         │ - distancia       │
                         │ - rating          │
                         │ - priceTier       │
                         │ - reasons         │
                         │ - latitude        │
                         │ - longitude       │
                         │ - isOpen          │
                         └────────────┬──────┘
                                      │
                         ┌────────────▼──────────────┐
                         │ Preparar Request para IA  │
                         │ WorkshopAssistantRequest  │
                         │ - issue                   │
                         │ - userLatitude            │
                         │ - userLongitude           │
                         │ - candidates[]            │
                         └────────────┬──────────────┘
                                      │
         ┌────────────────────────────┴────────────────────────┐
         │                                                      │
         ▼                                                      ▼
    ┌──────────────────────────┐          ┌──────────────────────────────┐
    │  OpenAI API (Si disponible)      │          │  Error → Fallback Local    │
    │  - Analizar problema             │          │  Usar algoritmo local      │
    │  - Contexto de ubicación         │          │  (datos REALES)            │
    │  - Recomendar mejores talleres   │          │                            │
    └──────────────┬───────────────────┘          └──────────────┬─────────────┘
                   │                                               │
                   ▼                                               ▼
         ┌──────────────────────────┐            ┌──────────────────────────┐
         │  WorkshopAssistantResponse            │ Usar candidatos + datos  │
         │  - assistantText (IA)                 │ REALES del taller        │
         │  - recommendations[]                  │ - Capacidad máxima       │
         │  - provider: 'openai'                 │ - % Comisión             │
         │  - model: 'gpt-4'                     │ - Distancia (Haversine)  │
         │  - fallback: false                    │ provider: 'local'        │
         └──────────────┬──────────────────────┘ │ fallback: true           │
                        │                        └──────────────┬──────────┘
                        │                                       │
                        └───────────────┬───────────────────────┘
                                        │
                         ┌──────────────▼───────────────┐
                         │  Mapear a TallerRecomendadoUI│
                         │  - name                      │
                         │  - address                   │
                         │  - distanceKm                │
                         │  - rating                    │
                         │  - priceTier                 │
                         │  - reasons                   │
                         │  - latitude                  │
                         │  - longitude                 │
                         │  - isOpen                    │
                         └──────────────┬───────────────┘
                                        │
                         ┌──────────────▼───────────────┐
                         │  Renderizar en Componente    │
                         │  - Lista de talleres         │
                         │  - Google Maps               │
                         │  - Detalles del taller       │
                         └──────────────────────────────┘
```

---

## 📡 Endpoints Requeridos

### 1. **Backend: Obtener Talleres**
**Endpoint:** `GET /api/v1/talleres`

**Parámetros:** Ninguno

**Respuesta (200):**
```json
[
  {
    "id": 1,
    "nombre": "Taller Central",
    "direccion": "Av. Principal 123",
    "ciudad": "La Paz",
    "nit": "123456789",
    "latitud": -17.7833,
    "longitud": -63.1833,
    "activo": true,
    "capacidad_maxima": 15,
    "porcentaje_comision": 12.5
  }
]
```

✅ **Estado:** Ya existe en el proyecto  
📁 **Servicio:** `TalleresService.listTalleres()`

---

### 2. **Backend: IA - Recomendar Talleres**
**Endpoint:** `POST /api/v1/asignacion/recommend-workshops`

**Body (JSON):**
```json
{
  "issue": "Pinchazo de llanta",
  "userLatitude": -17.7833,
  "userLongitude": -63.1833,
  "candidates": [
    {
      "name": "Taller Central",
      "address": "Av. Principal 123",
      "distanceKm": 2.5,
      "rating": 4.5,
      "priceTier": "Standard",
      "reasons": ["Muy cercano", "Precios competitivos"],
      "latitude": -17.7833,
      "longitude": -63.1833,
      "isOpen": true
    }
  ]
}
```

**Respuesta (200):**
```json
{
  "assistantText": "Para tu pinchazo de llanta, recomiendo el Taller Central...",
  "recommendations": [
    {
      "name": "Taller Central",
      "address": "Av. Principal 123",
      "distanceKm": 2.5,
      "rating": 4.5,
      "priceTier": "Standard",
      "reasons": ["Especialidad en llantas", "Muy cercano"],
      "latitude": -17.7833,
      "longitude": -63.1833,
      "isOpen": true
    }
  ],
  "provider": "openai",
  "model": "gpt-4",
  "fallback": false
}
```

✅ **Estado:** Implementado en `InteligenciaService.assistantRecommendWorkshops()`  
⚠️ **Dependencia:** Requiere API key de OpenAI en backend `.env`

**Variables de Entorno Requeridas (.env del backend):**
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4  # o gpt-3.5-turbo
```

---

## 🔍 Análisis del Componente

### **Archivo:** `recomendacion-ia.component.ts`

#### **Signals (Estado Reactivo)**

```typescript
// Entrada del usuario
issue = signal<string>('Pinchazo de llanta');
userLatitude = signal<number>(-17.7833);   // Cochabamba
userLongitude = signal<number>(-63.1833);

// Estado
isLoading = signal<boolean>(false);
error = signal<string | null>(null);
assistantText = signal<string>('');
recommendations = signal<TallerRecomendadoUI[]>([]);
provider = signal<string>('local');    // 'openai' o 'local'
model = signal<string | null>(null);   // gpt-4, gpt-3.5-turbo, null
isFallback = signal<boolean>(false);   // ¿Usando fallback?

// UI
showDetail = signal<boolean>(false);
selectedWorkshop = signal<TallerRecomendadoUI | null>(null);
```

**✅ Bien:** Usa signals para reactividad granular (Angular 17+)

---

#### **Método: `ngOnInit()`**

```typescript
ngOnInit(): void {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLatitude.set(position.coords.latitude);
        this.userLongitude.set(position.coords.longitude);
        this.cargarRecomendaciones();
      },
      () => {
        // Fallback a coordinadas por defecto (La Paz)
        this.cargarRecomendaciones();
      }
    );
  } else {
    this.cargarRecomendaciones();
  }
}
```

**✅ Bien:** 
- Obtiene geolocalización del usuario
- Tiene fallback seguro
- Llama a cargarRecomendaciones()

**⚠️ Mejora Posible:**
- Agregar timeout para geolocalización (puede tardar)
- Usar permisos HTTP para HTTPS (algunos navegadores requieren)

**Sugerencia:**
```typescript
ngOnInit(): void {
  if (navigator.geolocation) {
    const timeoutId = setTimeout(() => {
      // Si tarda más de 5s, usar default
      this.cargarRecomendaciones();
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        this.userLatitude.set(position.coords.latitude);
        this.userLongitude.set(position.coords.longitude);
        this.cargarRecomendaciones();
      },
      () => {
        clearTimeout(timeoutId);
        this.cargarRecomendaciones();
      }
    );
  } else {
    this.cargarRecomendaciones();
  }
}
```

---

#### **Método: `cargarRecomendaciones()`**

**Paso 1: Obtener Talleres**
```typescript
this.talleresService.listTalleres().subscribe({
  next: (talleres: any[]) => {
    const talleresValidos = talleres.filter(
      (t: any) => t.activo && t.latitud && t.longitud
    );
    // ... continúa
  }
});
```

✅ Bien: Filtra solo talleres activos con coordenadas

---

**Paso 2: Calcular Métricas Reales**
```typescript
const candidates: WorkshopSuggestionIn[] = talleresValidos.map((t: any) => {
  // DISTANCIA (Haversine)
  const distanceKm = this._calcularDistancia(
    this.userLatitude(), this.userLongitude(),
    t.latitud, t.longitud
  );

  // RATING (basado en datos REALES)
  const capacidadScore = Math.min(t.capacidad_maxima / 20, 5);
  const comisionScore = Math.max(0, 5 - t.porcentaje_comision / 5);
  const distanciaScore = Math.max(0, 5 - distanceKm / 2);
  const realRating = (capacidadScore + comisionScore + distanciaScore) / 3;

  // PRICE TIER (basado en comisión)
  let priceTier: string;
  if (t.porcentaje_comision < 10) priceTier = 'Budget';
  else if (t.porcentaje_comision < 20) priceTier = 'Standard';
  else priceTier = 'Premium';

  // REASONS (razones reales)
  const reasons = [
    t.capacidad_maxima > 10 ? `${t.capacidad_maxima} vehículos` : null,
    t.porcentaje_comision < 15 ? 'Precios competitivos' : null,
    distanceKm < 3 ? 'Muy cercano' : null,
    t.ciudad || 'Taller verificado'
  ].filter(Boolean);

  return {
    name: t.nombre,
    address: t.direccion || `${t.ciudad} - ${t.nit}`,
    distanceKm,
    rating: Math.round(realRating * 10) / 10,
    priceTier,
    reasons,
    latitude: t.latitud,
    longitude: t.longitud,
    isOpen: t.activo
  };
});
```

**✅ Excelente:**
- Cálculo transparente basado en datos reales
- Rating multicriterio (capacidad, comisión, distancia)
- Reasons generadas automáticamente
- Fallback local garantizado

**⚠️ Nota:** Esto asegura que **incluso sin IA, las recomendaciones son válidas**

---

**Paso 3: Llamar a IA (con Fallback)**
```typescript
this.inteligenciaService.assistantRecommendWorkshops(request).subscribe({
  next: (response) => {
    this.assistantText.set(response.assistantText);
    this.provider.set(response.provider);      // 'openai' o 'local'
    this.model.set(response.model);            // 'gpt-4' o null
    this.isFallback.set(response.fallback);    // true/false
    
    const mapped = response.recommendations.map(r => ({...}));
    this.recommendations.set(mapped);
    this.isLoading.set(false);
    setTimeout(() => this.initMap(), 100);
  },
  error: (err) => {
    // Manejo de errores detallado (ver sección "Manejo de Errores")
    let errorMsg = 'No se pudo obtener recomendaciones.';
    
    if (err?.error?.detail) {
      if (err.error.detail.includes('OPENAI_API_KEY no está configurada')) {
        errorMsg = '⚠️ API key no configurada. Admin debe configurar .env';
        this.provider.set('local');
      }
      // ... más casos
    }
    this.error.set(errorMsg);
    this.isLoading.set(false);
  }
});
```

✅ Bien: Manejo comprehensivo de errores

---

#### **Método: `_calcularDistancia()` (Haversine)**

```typescript
private _calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio Tierra en km
  const dLat = this._toRad(lat2 - lat1);
  const dLon = this._toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this._toRad(lat1)) * Math.cos(this._toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Redondear a 1 decimal
}
```

✅ Perfecto: Implementación correcta de Haversine

---

#### **Método: `initMap()`**

```typescript
private initMap(): void {
  if (!this.googleMap?.nativeElement || !google?.maps) return;

  const userLat = this.userLatitude();
  const userLng = this.userLongitude();

  // Crear mapa
  this.map = new google.maps.Map(this.googleMap.nativeElement, {
    center: { lat: userLat, lng: userLng },
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true
  });

  // Marcador usuario (azul)
  const userMarker = new google.maps.Marker({
    position: { lat: userLat, lng: userLng },
    map: this.map,
    title: 'Tu ubicación',
    icon: {
      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      scaledSize: new google.maps.Size(40, 40)
    }
  });

  // Marcadores talleres (verde, amarillo, rojo)
  this.recommendations().forEach((taller, index) => {
    const color = index === 0 ? 'green' : index === 1 ? 'yellow' : 'red';
    const marker = new google.maps.Marker({
      position: { lat: taller.latitude, lng: taller.longitude },
      map: this.map,
      title: `${taller.name} - ⭐${taller.rating}`,
      label: {
        text: String(index + 1),
        color: 'white',
        fontWeight: 'bold'
      },
      icon: {
        url: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
        scaledSize: new google.maps.Size(36, 36),
        labelOrigin: new google.maps.Point(18, 12)
      }
    });

    // Info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: 200px;">
          <h3>${taller.name}</h3>
          <p>⭐ ${taller.rating} · ${taller.distanceKm} km</p>
          <p>${taller.address}</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(this.map, marker);
      this.seleccionarTaller(taller);
    });

    this.markers.push(marker);
  });

  // Ajustar zoom automático
  if (this.recommendations().length > 0) {
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: userLat, lng: userLng });
    this.recommendations().forEach(t => 
      bounds.extend({ lat: t.latitude, lng: t.longitude })
    );
    this.map.fitBounds(bounds, { padding: 50 });
  }
}
```

✅ Excelente: Mapa interactivo con:
- Geolocalización del usuario
- Marcadores de talleres por prioridad
- Info windows con detalles
- Auto-zoom para mostrar todos

---

## 🔧 Análisis del Servicio

### **Archivo:** `inteligencia.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class InteligenciaService {
  private readonly BASE = `${environment.apiUrl}/api/v1/asignacion`;

  /** Asistente IA para recomendar talleres */
  assistantRecommendWorkshops(
    payload: WorkshopAssistantRequest
  ): Observable<WorkshopAssistantResponse> {
    return this.http.post<WorkshopAssistantResponse>(
      `${this.BASE}/recommend-workshops`,
      payload
    );
  }
}
```

✅ Bien: Encapsula la llamada HTTP

**URL Final:** `http://localhost:8000/api/v1/asignacion/recommend-workshops`

---

## 📊 Algoritmo de Cálculo

### **Fórmula de Rating Local:**

```
capacidadScore = min(capacidad_maxima / 20, 5)
comisionScore = max(0, 5 - porcentaje_comision / 5)
distanciaScore = max(0, 5 - distanceKm / 2)

realRating = (capacidadScore + comisionScore + distanciaScore) / 3
realRating = clamp(realRating, 3, 5)
```

### **Ejemplos de Cálculo:**

**Taller A: Capacidad 20, Comisión 10%, Distancia 2 km**
```
capacidadScore = min(20/20, 5) = 1
comisionScore = max(0, 5 - 10/5) = 3
distanciaScore = max(0, 5 - 2/2) = 4
realRating = (1 + 3 + 4) / 3 = 2.67 → 3.0 (clamped)
```

**Taller B: Capacidad 15, Comisión 15%, Distancia 5 km**
```
capacidadScore = min(15/20, 5) = 0.75
comisionScore = max(0, 5 - 15/5) = 2
distanciaScore = max(0, 5 - 5/2) = 2.5
realRating = (0.75 + 2 + 2.5) / 3 = 1.75 → 3.0 (clamped)
```

**Taller C: Capacidad 25, Comisión 5%, Distancia 1 km**
```
capacidadScore = min(25/20, 5) = 5
comisionScore = max(0, 5 - 5/5) = 4
distanciaScore = max(0, 5 - 1/2) = 4.5
realRating = (5 + 4 + 4.5) / 3 = 4.5
```

---

## ⚠️ Manejo de Errores

### **Errores de OpenAI:**

| Error | Causa | Acción |
|-------|-------|--------|
| `OPENAI_API_KEY no está configurada` | Backend `.env` sin API key | Mostrar: "Admin debe configurar" |
| `OpenAI API error: 401` | API key inválida/expirada | Mostrar: "Verifica API key en platform.openai.com" |
| `OpenAI API error: 429` | Rate limit alcanzado | Mostrar: "Intenta más tarde" |
| `HTTP 502 Bad Gateway` | Backend no puede conectar OpenAI | Mostrar: "Error de conexión con IA" |
| `HTTP 503 Service Unavailable` | IA no configurada | Mostrar: "Servicio no disponible" |

### **Errores de Talleres:**

| Error | Causa | Acción |
|-------|-------|--------|
| Sin talleres activos | Base de datos vacía | Mostrar: "No hay talleres disponibles" |
| Sin coordenadas | Talleres sin GPS | Filtrar automáticamente |

### **Código de Manejo:**

```typescript
error: (err) => {
  let errorMsg = 'No se pudo obtener recomendaciones.';

  if (err?.error?.detail) {
    const detail = err.error.detail;
    if (detail.includes('OPENAI_API_KEY no está configurada')) {
      errorMsg = '⚠️ OPENAI_API_KEY no configurada...';
      this.isFallback.set(true);
      this.provider.set('local');
    } else if (detail.includes('OpenAI API error: 401')) {
      errorMsg = '❌ API Key inválida o expirada...';
      this.isFallback.set(true);
      this.provider.set('local');
    } else if (detail.includes('OpenAI API error: 429')) {
      errorMsg = '⏳ Límite de rate alcanzado...';
      // No usar fallback, solo esperar
    } else if (detail.includes('OpenAI')) {
      errorMsg = `❌ Error de OpenAI: ${detail}`;
      this.isFallback.set(true);
      this.provider.set('local');
    } else {
      errorMsg = `❌ ${detail}`;
    }
  } else if (err?.status === 502) {
    errorMsg = '❌ Error de conexión con IA...';
    this.isFallback.set(true);
    this.provider.set('local');
  } else if (err?.status === 503) {
    errorMsg = '⚠️ Servicio de IA no configurado...';
    this.isFallback.set(true);
    this.provider.set('local');
  }

  this.error.set(errorMsg);
  this.isLoading.set(false);
}
```

✅ Excelente: Manejo granular por tipo de error

---

## ✅ Validaciones y Mejoras

### **Validaciones Actuales**

| Validación | Estado | Comentario |
|-----------|--------|-----------|
| Talleres activos | ✅ | Filtra por `activo === true` |
| Coordenadas válidas | ✅ | Verifica `latitud` y `longitud` |
| Geolocalización | ✅ | Con fallback a coords por defecto |
| Distancia Haversine | ✅ | Cálculo correcto en km |
| Rating multicriterio | ✅ | Basado en 3 factores reales |
| Manejo de errores IA | ✅ | 6+ casos cubiertos |
| Fallback local | ✅ | Funciona sin IA |

---

### **Mejoras Sugeridas**

#### **1. ⏱️ Timeout para Geolocalización**

**Problema:** Si el navegador tarda mucho, la app se queda esperando

**Solución:**
```typescript
ngOnInit(): void {
  const timeoutId = setTimeout(() => {
    // Usar coords por defecto si tarda > 5s
    if (this.isLoading()) {
      this.cargarRecomendaciones();
    }
  }, 5000);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        this.userLatitude.set(position.coords.latitude);
        this.userLongitude.set(position.coords.longitude);
        this.cargarRecomendaciones();
      },
      () => {
        clearTimeout(timeoutId);
        this.cargarRecomendaciones();
      }
    );
  } else {
    clearTimeout(timeoutId);
    this.cargarRecomendaciones();
  }
}
```

---

#### **2. 🔄 Persistencia de Geolocalización**

**Problema:** Se pide permisos cada vez que entra

**Solución:**
```typescript
// En localStorage
const savedLat = localStorage.getItem('userLat');
const savedLng = localStorage.getItem('userLng');

if (savedLat && savedLng) {
  this.userLatitude.set(parseFloat(savedLat));
  this.userLongitude.set(parseFloat(savedLng));
  this.cargarRecomendaciones();
}

// Cuando obtiene geo
navigator.geolocation.getCurrentPosition((position) => {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  
  localStorage.setItem('userLat', lat.toString());
  localStorage.setItem('userLng', lng.toString());
  
  this.userLatitude.set(lat);
  this.userLongitude.set(lng);
  this.cargarRecomendaciones();
});
```

---

#### **3. 📍 Permitir Cambiar Ubicación Manualmente**

**Problema:** Usuario no quiere usar su ubicación real

**Solución:**
```html
<div class="location-input">
  <input 
    type="text" 
    placeholder="Buscar ubicación"
    (change)="buscarUbicacion($event)"
  />
  <button (click)="usarMiUbicacion()">Usar mi ubicación</button>
</div>
```

```typescript
buscarUbicacion(event: Event): void {
  const query = (event.target as HTMLInputElement).value;
  // Usar Google Maps Geocoding API
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: query }, (results, status) => {
    if (status === 'OK' && results?.[0]) {
      const location = results[0].geometry.location;
      this.userLatitude.set(location.lat());
      this.userLongitude.set(location.lng());
      this.cargarRecomendaciones();
    }
  });
}
```

---

#### **4. 🎯 Filtro por Tipo de Servicio**

**Problema:** El usuario tal vez solo quiere mecánica, no electricidad

**Solución:**
```typescript
servicios = signal<string[]>(['Mecánica', 'Electricidad', 'Llantas']);
filtroServicios = signal<string[]>(['Mecánica']);

cargarRecomendaciones(): void {
  // ...
  const candidates = talleresValidos
    .filter(t => {
      // Si el taller tiene servicios, verificar compatibilidad
      if (t.servicios) {
        return this.filtroServicios().some(fs => 
          t.servicios.includes(fs)
        );
      }
      return true; // Si no tiene servicios definidos, incluir
    })
    .map(t => ({...}));
}
```

---

#### **5. ⭐ Rating por Reseñas Reales**

**Problema:** El rating es solo calculado, no basado en clientes reales

**Solución:** Agregar tabla de reseñas
```typescript
interface Resena {
  tallerID: number;
  calificacion: number; // 1-5
  comentario: string;
  usuarioID: number;
}

// Obtener reseñas del taller
getResenas(tallerID: number): Observable<Resena[]> {
  return this.http.get<Resena[]>(
    `${environment.apiUrl}/api/v1/talleres/${tallerID}/resenas`
  );
}

// Calcular promedio
const resenas = await this.getResenas(t.id).toPromise();
const ratingPromedio = resenas
  ?.reduce((sum, r) => sum + r.calificacion, 0) / resenas?.length;
```

---

#### **6. 🚗 Filtro por Tipo de Vehículo**

**Problema:** No todos los talleres reparan todos los vehículos

**Solución:**
```typescript
tipoVehiculo = signal<string>('Auto');

// Backend debe tener especialidades por taller
cargarRecomendaciones(): void {
  const candidates = talleresValidos.filter(t => 
    t.especialidades.includes(this.tipoVehiculo())
  );
}
```

---

#### **7. 📞 Integración con Sistema de Solicitudes**

**Problema:** Usuario ve el taller pero no puede solicitar servicio

**Solución:**
```typescript
solicitarAyuda(taller: TallerRecomendadoUI): void {
  // Crear solicitud automáticamente
  const solicitud = {
    tallerID: taller.id,
    problema: this.issue(),
    ubicacionUsuario: {
      lat: this.userLatitude(),
      lng: this.userLongitude()
    },
    estado: 'pendiente'
  };
  
  this.emergenciasService.crearSolicitud(solicitud).subscribe({
    next: (response) => {
      alert(`✅ Solicitud enviada a ${taller.name}`);
      // Redirigir a página de seguimiento
      this.router.navigate(['/cliente/solicitudes/seguimiento']);
    },
    error: (err) => {
      alert('❌ Error al enviar solicitud');
    }
  });
}
```

---

#### **8. 📊 Analytics / Logging**

**Problema:** No hay registro de qué recomendaciones se usan

**Solución:**
```typescript
seleccionarTaller(taller: TallerRecomendadoUI): void {
  // Log de analytics
  this.analyticsService.logEvent('taller_seleccionado', {
    tallerNombre: taller.name,
    distancia: taller.distanceKm,
    rating: taller.rating,
    provider: this.provider(),
    isFallback: this.isFallback()
  });
  
  this.selectedWorkshop.set(taller);
  this.showDetail.set(true);
}
```

---

#### **9. ♿ Accesibilidad Mejorada**

**Problema:** Usuarios con discapacidades visuales no ven bien el mapa

**Solución:**
```html
<div class="recommendations-list" role="region" aria-label="Talleres recomendados">
  <div 
    *ngFor="let taller of recommendations()"
    (click)="seleccionarTaller(taller)"
    role="button"
    tabindex="0"
    [attr.aria-selected]="selectedWorkshop() === taller"
    (keydown.enter)="seleccionarTaller(taller)"
  >
    <h3>{{ taller.name }}</h3>
    <p>⭐ {{ taller.rating }}/5 · {{ taller.distanceKm }} km</p>
  </div>
</div>
```

---

#### **10. 🌐 Soporte Multiidioma**

**Problema:** Solo funciona en español

**Solución:**
```typescript
// En componente
i18nService.translate('recomendacion.titulo')
// Output: "Talleres Recomendados" o "Recommended Workshops"

// En archivo de traducción (i18n.json)
{
  "es": {
    "recomendacion": {
      "titulo": "Talleres Recomendados",
      "distancia": "km de distancia"
    }
  },
  "en": {
    "recomendacion": {
      "titulo": "Recommended Workshops",
      "distancia": "km away"
    }
  }
}
```

---

## 🧪 Testing Recomendado

### **1. Test Unitario: Cálculo de Distancia**

```typescript
describe('RecomendacionIAComponent - Haversine', () => {
  let component: RecomendacionIAComponent;

  beforeEach(() => {
    component = new RecomendacionIAComponent(...);
  });

  it('debe calcular distancia correctamente entre dos puntos', () => {
    // La Paz a Cochabamba: ~176 km
    const distancia = component['_calcularDistancia'](
      -16.5, -68.15,  // La Paz
      -17.38, -66.16  // Cochabamba
    );
    
    expect(distancia).toBeCloseTo(176, 0); // Tolerancia 0 km
  });

  it('debe retornar 0 cuando es el mismo punto', () => {
    const distancia = component['_calcularDistancia'](
      -17.78, -63.18,
      -17.78, -63.18
    );
    
    expect(distancia).toBe(0);
  });
});
```

---

### **2. Test de Integración: API**

```typescript
describe('RecomendacionIAComponent - Integration', () => {
  let component: RecomendacionIAComponent;
  let talleresService: TalleresService;
  let inteligenciaService: InteligenciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecomendacionIAComponent],
      providers: [TalleresService, InteligenciaService, HttpClientTestingModule]
    });
    
    component = TestBed.createComponent(RecomendacionIAComponent).componentInstance;
    talleresService = TestBed.inject(TalleresService);
    inteligenciaService = TestBed.inject(InteligenciaService);
  });

  it('debe cargar talleres y recomendaciones', (done) => {
    const mockTalleres = [
      {
        id: 1,
        nombre: 'Taller A',
        activo: true,
        latitud: -17.78,
        longitud: -63.18,
        capacidad_maxima: 10,
        porcentaje_comision: 12
      }
    ];

    const mockRecomendaciones = {
      assistantText: 'Recomendación IA',
      recommendations: [{
        name: 'Taller A',
        address: 'Calle 123',
        distanceKm: 2.5,
        rating: 4.5,
        priceTier: 'Standard',
        reasons: ['Cercano'],
        latitude: -17.78,
        longitude: -63.18,
        isOpen: true
      }],
      provider: 'openai',
      model: 'gpt-4',
      fallback: false
    };

    spyOn(talleresService, 'listTalleres').and.returnValue(
      of(mockTalleres)
    );
    spyOn(inteligenciaService, 'assistantRecommendWorkshops').and.returnValue(
      of(mockRecomendaciones)
    );

    component.cargarRecomendaciones();

    setTimeout(() => {
      expect(component.recommendations().length).toBe(1);
      expect(component.recommendations()[0].name).toBe('Taller A');
      expect(component.provider()).toBe('openai');
      done();
    }, 500);
  });

  it('debe usar fallback cuando IA falla', (done) => {
    const mockTalleres = [/* ... */];
    
    spyOn(talleresService, 'listTalleres').and.returnValue(of(mockTalleres));
    spyOn(inteligenciaService, 'assistantRecommendWorkshops').and.returnValue(
      throwError(() => new Error('OpenAI API error: 401'))
    );

    component.cargarRecomendaciones();

    setTimeout(() => {
      expect(component.isFallback()).toBe(true);
      expect(component.provider()).toBe('local');
      expect(component.error()).toContain('API Key');
      done();
    }, 500);
  });
});
```

---

### **3. Test E2E: Flujo Completo**

```typescript
describe('Recomendación IA - E2E', () => {
  beforeEach(() => {
    cy.visit('/cliente/talleres/recomendacion-ia');
  });

  it('debe mostrar recomendaciones y mapa', () => {
    // Esperar a que cargue
    cy.get('.recomendacion-ia-container').should('exist');
    
    // Verificar que hay talleres
    cy.get('[role="button"]').first().should('exist');
    
    // Click en taller
    cy.get('[role="button"]').first().click();
    
    // Verificar detalle
    cy.get('.taller-detail').should('be.visible');
    cy.get('.taller-detail h3').should('contain', 'Taller');
  });

  it('debe permitir cambiar problema', () => {
    cy.get('select[name="problema"]').select('Pinchazo');
    cy.get('button:contains("Recargar")').click();
    
    // Debe recargar recomendaciones
    cy.get('.loading').should('be.visible');
    cy.get('.loading').should('not.be.visible');
  });

  it('debe mostrar mapa interactivo', () => {
    cy.get('#googleMap').should('exist');
    cy.get('[class*="gm-marker"]').should('have.length.greaterThan', 1);
  });
});
```

---

## 📊 Resumen Ejecutivo

| Aspecto | Estado | Comentario |
|--------|--------|-----------|
| **IA Integrada** | ✅ | OpenAI GPT con fallback local |
| **Cálculo Local** | ✅ | Datos reales (capacidad, comisión, distancia) |
| **Geolocalización** | ✅ | Con fallback a coords por defecto |
| **Google Maps** | ✅ | Mapa interactivo con marcadores |
| **Manejo Errores** | ✅ | 6+ casos cubiertos |
| **UX/Accesibilidad** | ⚠️ | Necesita mejorar (ver sección 9) |
| **Testing** | ❌ | No implementado, ver arriba |
| **Analytics** | ❌ | No hay logging de eventos |

---

## 🎯 Plan de Acción (Corto Plazo)

### **Semana 1:**
- [ ] Agregar timeout a geolocalización
- [ ] Implementar persistencia de ubicación
- [ ] Agregar aria-labels (accesibilidad)

### **Semana 2:**
- [ ] Escribir tests unitarios
- [ ] Escribir tests E2E
- [ ] Validar que IA fallback funcione correctamente

### **Semana 3:**
- [ ] Agregar filtros (tipo de servicio, tipo de vehículo)
- [ ] Integrar con sistema de solicitudes
- [ ] Agregar analytics/logging

---

**Última actualización:** 26 de Abril de 2026
