import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formulario-vehiculo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-vehiculo.html',
  styleUrl: './formulario-vehiculo.scss'
})
export class Formulario_Vehiculo implements OnInit {
  vehicleForm: FormGroup;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.vehicleForm = this.fb.group({
      placa: ['', [Validators.required]],
      marca: ['', [Validators.required]],
      modelo: ['', [Validators.required]],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(this.currentYear)]],
      color: ['', [Validators.required]],
      observaciones: ['']
    });
  }

  ngOnInit(): void {}

  guardarVehiculo() {
    if (this.vehicleForm.valid) {
      console.log('Registrando vehículo...', this.vehicleForm.value);
      
      // Simular guardado exitoso
      alert('Vehículo registrado correctamente.');
      
      // En una implementación real, aquí se llamaría al servicio para guardar en el backend
      // y se manejaría la respuesta.
      
      this.router.navigate(['/vehiculos']);
    }
  }

  cancelar() {
    this.router.navigate(['/vehiculos']);
  }
}
