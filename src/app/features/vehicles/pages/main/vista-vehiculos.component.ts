import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { VehiculoRead } from '../../../../core/models/vehicle.models';

@Component({
  selector: 'app-vista-vehiculos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vista-vehiculos.component.html',
  styleUrl: './vista-vehiculos.component.scss'
})
export class VistaVehiculos implements OnInit {
  vehicleForm: FormGroup;
  vehiculos = signal<VehiculoRead[]>([]);
  isLoading = signal(false);

  showForm = false;
  isEditing = false;
  editingId: number | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService
  ) {
    this.vehicleForm = this.fb.group({
      placa: ['', [Validators.required]],
      marca: ['', [Validators.required]],
      modelo: ['', [Validators.required]],
      anio: ['', [Validators.required, Validators.min(1900), Validators.max(this.currentYear)]],
      color: ['', [Validators.required]],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarVehiculos();
  }

  cargarVehiculos() {
    this.isLoading.set(true);
    this.vehicleService.getVehicles().subscribe({
      next: (data) => {
        this.vehiculos.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando vehículos', err);
        this.isLoading.set(false);
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.vehicleForm.reset();
    this.isEditing = false;
    this.editingId = null;
  }

  guardarVehiculo() {
    if (this.vehicleForm.invalid) return;

    const data = this.vehicleForm.value;

    if (this.isEditing && this.editingId !== null) {
      this.vehicleService.updateVehicle(this.editingId, data).subscribe({
        next: () => {
          this.cargarVehiculos();
          alert('Vehículo actualizado correctamente.');
          this.toggleForm();
        },
        error: (err) => alert(err.error?.detail || 'Error al actualizar vehículo')
      });
    } else {
      this.vehicleService.createVehicle(data).subscribe({
        next: () => {
          this.cargarVehiculos();
          alert('Vehículo registrado correctamente.');
          this.toggleForm();
        },
        error: (err) => alert(err.error?.detail || 'Error al registrar vehículo')
      });
    }
  }

  editarVehiculo(vehiculo: VehiculoRead) {
    this.isEditing = true;
    this.editingId = vehiculo.id;
    this.vehicleForm.patchValue({
      placa: vehiculo.placa,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      anio: vehiculo.anio,
      color: vehiculo.color,
      observaciones: vehiculo.observaciones
    });
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminarVehiculo(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este vehículo?')) {
      // Nota: El backend no parece tener un endpoint DELETE explícito en router.py, 
      // pero usualmente se implementa. Dejaré la lógica preparada o simulada si no existe.
      alert('Funcionalidad de eliminación pendiente en el servidor.');
    }
  }

  seleccionarVehiculoPrincipal(id: number) {
    alert('Funcionalidad de vehículo principal se manejará localmente hasta integrar endpoint específico.');
  }
}
