import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
}

@Component({
  selector: 'app-vista-reportar-emergencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vista-reportar-emergencia.html',
  styleUrl: './vista-reportar-emergencia.scss'
})
export class VistaReportarEmergencia implements OnInit {
  emergencyForm: FormGroup;
  vehiculos: Vehiculo[] = [
    { id: 1, placa: 'ABC-123', marca: 'Tesla', modelo: 'Model 3' },
    { id: 2, placa: 'XYZ-789', marca: 'Toyota', modelo: 'Hilux' }
  ];

  incidentTypes = [
    'Falla mecánica',
    'Pinchazo de llanta',
    'Batería descargada',
    'Sobrecalentamiento',
    'Accidente leve',
    'Llaves dentro del vehículo',
    'Otro'
  ];

  isLocating = false;
  capturedLocation = { lat: 0, lng: 0, captured: false };
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  isAudioRecording = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
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

  ngOnInit(): void {}

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
      console.log('Enviando emergencia...', {
        ...this.emergencyForm.value,
        evidencias: this.selectedFiles.length,
        audio: this.isAudioRecording
      });

      // Simular guardado exitoso
      alert('Emergencia reportada correctamente. Tu solicitud fue creada con estado pendiente.');
      
      this.router.navigate(['/solicitudes']);
    }
  }

  cancelar() {
    this.router.navigate(['/dashboard']);
  }
}
