import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface VehiculoHistorial {
  placa: string;
  marca: string;
  modelo: string;
  year: number;
  color: string;
  fechaBaja: string;
  motivo: string;
}

@Component({
  selector: 'app-historial-vehiculos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './historial-vehiculos.component.html',
  styleUrl: './historial-vehiculos.component.scss'
})
export class HistorialVehiculos implements OnInit {
  historial: VehiculoHistorial[] = [
    {
      placa: 'LP-9988',
      marca: 'Nissan',
      modelo: 'Sentra',
      year: 2015,
      color: 'Azul',
      fechaBaja: '12/03/2024',
      motivo: 'Vendido'
    },
    {
      placa: 'SCZ-1122',
      marca: 'Suzuki',
      modelo: 'Grand Vitara',
      year: 2018,
      color: 'Plata',
      fechaBaja: '05/01/2024',
      motivo: 'Sustitución'
    },
    {
      placa: 'CBBA-4455',
      marca: 'Ford',
      modelo: 'F-150',
      year: 2010,
      color: 'Negro',
      fechaBaja: '20/11/2023',
      motivo: 'Pérdida total'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  recuperarVehiculo(placa: string) {
    alert(`Solicitud de recuperación para el vehículo ${placa} enviada a revisión.`);
  }
}
