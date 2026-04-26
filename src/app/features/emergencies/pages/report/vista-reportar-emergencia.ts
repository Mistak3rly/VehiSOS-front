import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmergenciasService } from '../../../../core/services/emergencias.service';
import { VehiculoRead, TipoIncidenteRead, IncidenteCreate, EvidenciaCreate } from '../../../../core/models/api.models';


@Component({
  selector: 'app-vista-reportar-emergencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  cargarDatos() {
    this.emergenciasService.listVehiculos().subscribe({
      next: (data) => this.vehiculos = data,
      error: (err) => console.error('Error al cargar vehículos', err)
    });

    this.emergenciasService.listTiposIncidente().subscribe({
      next: (data) => this.incidentTypes = data,
      error: (err) => console.error('Error al cargar tipos de incidente', err)
    });
  }

  obtenerUbicacionActual() {
    this.isLocating = true;
    if (navigator.geolocation) {
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
        (error) => {
          console.error('Error obteniendo ubicación', error);
          alert('No se pudo obtener la ubicación. Por favor, habilita el GPS.');
          this.isLocating = false;
        }
      );
    } else {
      alert('La geolocalización no es compatible con este navegador.');
      this.isLocating = false;
    }
  }

  adjuntarFotos(event: any) {
    const files = event.target.files;
    if (files.length + this.selectedFiles.length > 5) {
      alert('Máximo 5 imágenes permitidas.');
      return;
    }

    for (let file of files) {
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeFoto(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  adjuntarAudio() {
    this.isAudioRecording = !this.isAudioRecording;
    if (this.isAudioRecording) {
      console.log('Iniciando grabación simulada...');
    } else {
      console.log('Audio adjuntado correctamente.');
    }
  }

  enviarEmergencia() {
    if (this.emergencyForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      const formValue = this.emergencyForm.value;
      const evidencias: EvidenciaCreate[] = [];

      // Mapear fotos a EvidenciaCreate
      this.imagePreviews.forEach((preview, index) => {
        evidencias.push({
          tipo_evidencia: 'imagen',
          url_archivo: preview, // Enviamos el base64 como url para el mockup
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
        evidencias.push({
          tipo_evidencia: 'texto',
          contenido_texto: formValue.descripcion
        });
      }

      const payload: IncidenteCreate = {
        id_vehiculo: parseInt(formValue.vehiculoId, 10),
        id_tipo_incidente: parseInt(formValue.tipoIncidente, 10),
        titulo: 'Emergencia Reportada',
        descripcion_texto: formValue.descripcion,
        referencia_ubicacion: formValue.referenciaUbicacion,
        latitud: formValue.lat,
        longitud: formValue.lng,
        evidencias: evidencias
      };

      this.emergenciasService.createIncidente(payload).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          alert('Emergencia reportada correctamente. Tu solicitud fue creada con estado pendiente.');
          this.router.navigate(['/cliente/solicitudes/seguimiento']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.detail || 'Error al reportar la emergencia. Revisa los datos.';
        }
      });
    } else {
      this.emergencyForm.markAllAsTouched();
    }
  }

  cancelar() {
    this.router.navigate(['/dashboard']);
  }
}
