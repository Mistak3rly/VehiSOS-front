import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VehicleService } from '../../../../core/services/vehicle.service';

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
    private router: Router,
    private vehicleService: VehicleService
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
      const data = this.vehicleForm.value;
      this.vehicleService.createVehicle({
        placa: data.placa,
        marca: data.marca,
        modelo: data.modelo,
        anio: data.year,
        color: data.color,
        observaciones: data.observaciones
      }).subscribe({
        next: () => {
          alert('Vehículo registrado correctamente.');
          this.router.navigate(['/vehiculos']);
        },
        error: (err) => {
          alert(err.error?.detail || 'Error al registrar vehículo');
        }
      });
    } else {
      this.vehicleForm.markAllAsTouched();
    }
  }

  cancelar() {
    this.router.navigate(['/vehiculos']);
  }
}
