import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { EmergenciasService } from '../../../../core/services/emergencias.service';
import { VehiculoRead, TipoIncidenteRead, IncidenteCreate, EvidenciaCreate } from '../../../../core/models/api.models';

const API_TIMEOUT_MS = 10_000;

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
  errorMessage = '';
  isSubmitting = false;

  isLocating = false;
  isLoadingVehiculos = false;
  isLoadingTipos = false;
  errorVehiculos = '';
  errorTipos = '';
  capturedLocation = { lat: 0, lng: 0, captured: false };
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  isAudioRecording = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private emergenciasService: EmergenciasService
  ) {
    this.emergencyForm = this.fb.group({
      vehiculoId: ['', [Validators.required]],
      tipoIncidente: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      referenciaUbicacion: [''],
      lat: [null, [Validators.required]],
      lng: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.errorVehiculos = '';
    this.errorTipos = '';
    this.cargarVehiculos();
    this.cargarTiposIncidente();
  }

  private cargarVehiculos(): void {
    this.isLoadingVehiculos = true;

    this.emergenciasService.listVehiculos().pipe(
      timeout(API_TIMEOUT_MS),
      catchError(err => {
        const isTimeout = err?.name === 'TimeoutError';
        this.errorVehiculos = isTimeout
          ? 'El servidor tardó demasiado en responder. Verifica que el backend esté corriendo.'
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
          ? 'El servidor tardó demasiado en responder. Verifica que el backend esté corriendo.'
          : (err?.error?.detail || err?.message || 'No se pudieron cargar los tipos de incidente.');
        this.isLoadingTipos = false;
        return of([]);
      })
    ).subscribe(data => {
      this.incidentTypes = data;
      this.isLoadingTipos = false;
      if (data.length === 0) {
        this.errorTipos = 'El catálogo de tipos de incidente está vacío. Reinicia el backend para que el seed lo pueble automáticamente.';
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
          captured: true
        };
        this.emergencyForm.patchValue({
          lat: this.capturedLocation.lat,
          lng: this.capturedLocation.lng
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

  adjuntarAudio(): void {
    this.isAudioRecording = !this.isAudioRecording;
  }

  enviarEmergencia(): void {
    if (!this.emergencyForm.valid) {
      this.emergencyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.emergencyForm.value;
    const evidencias: EvidenciaCreate[] = [];

    this.imagePreviews.forEach((preview, index) => {
      evidencias.push({
        tipo_evidencia: 'imagen',
        url_archivo: preview,
        nombre_archivo: `foto_${index}.jpg`,
        tipo_mime: 'image/jpeg'
      });
    });

    if (this.isAudioRecording) {
      evidencias.push({
        tipo_evidencia: 'audio',
        url_archivo: 'data:audio/mp3;base64,...',
        nombre_archivo: 'grabacion.mp3',
        tipo_mime: 'audio/mpeg'
      });
    }

    if (formValue.descripcion) {
      evidencias.push({ tipo_evidencia: 'texto', contenido_texto: formValue.descripcion });
    }

    const payload: IncidenteCreate = {
      id_vehiculo: parseInt(formValue.vehiculoId, 10),
      id_tipo_incidente: parseInt(formValue.tipoIncidente, 10),
      titulo: 'Emergencia Reportada',
      descripcion_texto: formValue.descripcion,
      referencia_ubicacion: formValue.referenciaUbicacion,
      latitud: formValue.lat,
      longitud: formValue.lng,
      evidencias
    };

    this.emergenciasService.createIncidente(payload).subscribe({
      next: (_) => {
        this.isSubmitting = false;
        alert('Emergencia reportada correctamente. Tu solicitud fue creada con estado pendiente.');
        this.router.navigate(['/cliente/solicitudes/seguimiento']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.detail || 'Error al reportar la emergencia. Revisa los datos.';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }
}
