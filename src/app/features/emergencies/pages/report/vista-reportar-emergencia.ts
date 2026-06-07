import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { EmergenciasService } from '../../../../core/services/emergencias.service';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { VehiculoRead, TipoIncidenteRead, TallerRead, IncidenteCreate, EvidenciaCreate } from '../../../../core/models/api.models';

const API_TIMEOUT_MS = 15_000;

@Component({
  selector: 'app-vista-reportar-emergencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vista-reportar-emergencia.html',
  styleUrl: './vista-reportar-emergencia.scss'
})
export class VistaReportarEmergencia implements OnInit {
  emergencyForm: FormGroup;
  vehiculos: VehiculoRead[] = [];
  incidentTypes: TipoIncidenteRead[] = [];
  talleres: TallerRead[] = [];
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  isLocating = false;
  isLoadingVehiculos = false;
  isLoadingTipos = false;
  isLoadingTalleres = false;
  errorVehiculos = '';
  errorTipos = '';
  errorTalleres = '';
  capturedLocation = { lat: 0, lng: 0, captured: false };
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private emergenciasService: EmergenciasService,
    private logisticaService: LogisticaService,
  ) {
    this.emergencyForm = this.fb.group({
      vehiculoId:          ['', [Validators.required]],
      tallerDestinoId:     ['', [Validators.required]],
      tipoIncidente:       ['', [Validators.required]],
      descripcion:         ['', [Validators.required]],
      referenciaUbicacion: [''],
      lat:  [null],
      lng:  [null],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.errorVehiculos = '';
    this.errorTipos = '';
    this.errorTalleres = '';
    this.cargarVehiculos();
    this.cargarTiposIncidente();
    this.cargarTalleres();
  }

  private cargarVehiculos(): void {
    this.isLoadingVehiculos = true;
    this.emergenciasService.listVehiculos().pipe(
      timeout(API_TIMEOUT_MS),
      catchError(err => {
        const isTimeout = err?.name === 'TimeoutError';
        this.errorVehiculos = isTimeout
          ? 'El servidor tardó demasiado. Verifica que el backend esté corriendo.'
          : (err?.error?.detail || err?.message || 'No se pudieron cargar los vehículos.');
        this.isLoadingVehiculos = false;
        return of([]);
      })
    ).subscribe(data => {
      this.vehiculos = data;
      this.isLoadingVehiculos = false;
    });
  }

  private cargarTiposIncidente(): void {
    this.isLoadingTipos = true;
    this.emergenciasService.listTiposIncidente().pipe(
      timeout(API_TIMEOUT_MS),
      catchError(err => {
        const isTimeout = err?.name === 'TimeoutError';
        this.errorTipos = isTimeout
          ? 'El servidor tardó demasiado. Verifica que el backend esté corriendo.'
          : (err?.error?.detail || err?.message || 'No se pudieron cargar los tipos de incidente.');
        this.isLoadingTipos = false;
        return of([]);
      })
    ).subscribe(data => {
      this.incidentTypes = data;
      this.isLoadingTipos = false;
      if (data.length === 0) {
        this.errorTipos = 'El catálogo está vacío. Reinicia el backend para poblar el seed.';
      }
    });
  }

  private cargarTalleres(): void {
    this.isLoadingTalleres = true;
    this.logisticaService.listTalleresActivos().pipe(
      timeout(API_TIMEOUT_MS),
      catchError(err => {
        this.errorTalleres = err?.error?.detail || 'No se pudieron cargar los talleres disponibles.';
        this.isLoadingTalleres = false;
        return of([]);
      })
    ).subscribe(data => {
      this.talleres = data;
      this.isLoadingTalleres = false;
      if (data.length === 0) {
        this.errorTalleres = 'No hay talleres activos disponibles en este momento.';
      }
    });
  }

  obtenerUbicacionActual(): void {
    this.isLocating = true;
    if (!navigator.geolocation) {
      alert('La geolocalización no es compatible con este navegador.');
      this.isLocating = false;
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.capturedLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          captured: true,
        };
        this.emergencyForm.patchValue({
          lat: this.capturedLocation.lat,
          lng: this.capturedLocation.lng,
        });
        this.isLocating = false;
      },
      () => {
        alert('No se pudo obtener la ubicación. Por favor, habilita el GPS.');
        this.isLocating = false;
      }
    );
  }

  adjuntarFotos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files) return;
    if (files.length + this.selectedFiles.length > 5) {
      alert('Máximo 5 imágenes permitidas.');
      return;
    }
    for (const file of Array.from(files)) {
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreviews.push((e.target as FileReader).result as string);
      reader.readAsDataURL(file);
    }
  }

  removeFoto(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  enviarEmergencia(): void {
    if (!this.emergencyForm.valid) {
      this.emergencyForm.markAllAsTouched();
      this.errorMessage = 'Por favor completa todos los campos obligatorios: vehículo, taller, tipo de incidente y descripción.';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.emergencyForm.value;
    const evidencias: EvidenciaCreate[] = [];

    this.imagePreviews.forEach((preview, index) => {
      evidencias.push({
        tipo_evidencia: 'imagen',
        url_archivo: preview,
        nombre_archivo: `foto_${index}.jpg`,
        tipo_mime: 'image/jpeg',
      });
    });

    if (formValue.descripcion) {
      evidencias.push({ tipo_evidencia: 'texto', contenido_texto: formValue.descripcion });
    }

    const payload: IncidenteCreate = {
      id_vehiculo:          parseInt(formValue.vehiculoId, 10),
      id_taller_destino:    parseInt(formValue.tallerDestinoId, 10),
      id_tipo_incidente:    parseInt(formValue.tipoIncidente, 10),
      titulo:               'Emergencia Reportada',
      descripcion_texto:    formValue.descripcion,
      referencia_ubicacion: formValue.referenciaUbicacion || '',
      latitud:              formValue.lat ?? 0,
      longitud:             formValue.lng ?? 0,
      evidencias,
    };

    this.emergenciasService.createIncidente(payload).pipe(
      timeout(API_TIMEOUT_MS),
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Emergencia enviada. El taller ha sido notificado y puede aceptar, revisar o rechazar tu solicitud.';
        setTimeout(() => this.router.navigate(['/cliente/solicitudes/seguimiento']), 2500);
      },
      error: (err) => {
        this.isSubmitting = false;
        const isTimeout = err?.name === 'TimeoutError';
        if (isTimeout) {
          this.errorMessage = 'El servidor tardó demasiado. Verifica tu conexión e inténtalo de nuevo.';
        } else {
          const detail = err?.error?.detail;
          this.errorMessage = typeof detail === 'string'
            ? detail
            : 'Error al reportar la emergencia. Verifica los datos e inténtalo de nuevo.';
        }
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }
}
