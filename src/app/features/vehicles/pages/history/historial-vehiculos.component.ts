import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { VehiculoRead } from '../../../../core/models/api.models';

@Component({
  selector: 'app-historial-vehiculos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './historial-vehiculos.component.html',
  styleUrl: './historial-vehiculos.component.scss'
})
export class HistorialVehiculos implements OnInit {
  vehiculos = signal<VehiculoRead[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.cargarVehiculos();
  }

  cargarVehiculos(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.vehicleService.getVehicles().subscribe({
      next: (data) => {
        this.vehiculos.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.detail || 'No se pudieron cargar los vehículos. Verifica la conexión.');
        this.isLoading.set(false);
      }
    });
  }
}
