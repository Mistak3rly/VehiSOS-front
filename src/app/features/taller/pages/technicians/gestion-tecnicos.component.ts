import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Tecnico {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  especialidad: string;
  disponibilidad: 'Disponible' | 'Ocupado' | 'No disponible';
  ultimaActualizacion: string;
}

@Component({
  selector: 'app-gestion-tecnicos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './gestion-tecnicos.component.html',
  styleUrl: './gestion-tecnicos.component.scss'
})
export class Vista_gestion_tecnicos implements OnInit {
  tecnicos = signal<Tecnico[]>([]);
  tecnicoForm: FormGroup;
  isEditing = signal(false);
  editingId = signal<number | null>(null);
  
  tallerStatus = signal({
    disponible: true,
    capacidad: 5,
    solicitudesActivas: 2
  });

  especialidades = [
    'Mecánica general',
    'Electricidad automotriz',
    'Auxilio de batería',
    'Cambio de llantas',
    'Grúa',
    'Cerrajería vehicular'
  ];

  disponibilidades = ['Disponible', 'Ocupado', 'No disponible'];

  constructor(private fb: FormBuilder) {
    this.tecnicoForm = this.fb.group({
      nombre: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      especialidad: ['', [Validators.required]],
      disponibilidad: ['Disponible', [Validators.required]],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarTecnicos();
  }

  cargarTecnicos() {
    // Simulación de datos
    const mockData: Tecnico[] = [
      {
        id: 1,
        nombre: 'Carlos Rodriguez',
        telefono: '77889900',
        email: 'carlos.r@vehisos.com',
        especialidad: 'Mecánica general',
        disponibilidad: 'Ocupado',
        ultimaActualizacion: 'Hace 5 min'
      },
      {
        id: 2,
        nombre: 'Mario Gomez',
        telefono: '66554433',
        email: 'mario.g@vehisos.com',
        especialidad: 'Electricidad automotriz',
        disponibilidad: 'Disponible',
        ultimaActualizacion: 'Hace 1 hora'
      }
    ];
    this.tecnicos.set(mockData);
  }

  guardarTecnico() {
    if (this.tecnicoForm.valid) {
      const formValue = this.tecnicoForm.value;
      
      if (this.isEditing()) {
        this.tecnicos.update(list => list.map(t => 
          t.id === this.editingId() ? { ...t, ...formValue, ultimaActualizacion: 'Ahora' } : t
        ));
        alert('Técnico actualizado correctamente.');
      } else {
        const newTecnico: Tecnico = {
          id: Date.now(),
          ...formValue,
          ultimaActualizacion: 'Recién registrado'
        };
        this.tecnicos.update(list => [...list, newTecnico]);
        alert('Técnico registrado correctamente.');
      }
      
      this.cancelarEdicion();
    }
  }

  editarTecnico(tecnico: Tecnico) {
    this.isEditing.set(true);
    this.editingId.set(tecnico.id);
    this.tecnicoForm.patchValue({
      nombre: tecnico.nombre,
      telefono: tecnico.telefono,
      email: tecnico.email,
      especialidad: tecnico.especialidad,
      disponibilidad: tecnico.disponibilidad
    });
  }

  cancelarEdicion() {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.tecnicoForm.reset({ disponibilidad: 'Disponible' });
  }

  cambiarDisponibilidad(tecnico: Tecnico) {
    const nextStatus: Record<string, 'Disponible' | 'Ocupado' | 'No disponible'> = {
      'Disponible': 'Ocupado',
      'Ocupado': 'No disponible',
      'No disponible': 'Disponible'
    };
    
    this.tecnicos.update(list => list.map(t => 
      t.id === tecnico.id ? { ...t, disponibilidad: nextStatus[t.disponibilidad], ultimaActualizacion: 'Ahora' } : t
    ));
    alert('Disponibilidad del técnico actualizada.');
  }

  actualizarDisponibilidadTaller() {
    this.tallerStatus.update(s => ({ ...s, disponible: !s.disponible }));
    alert('Estado general del taller actualizado.');
  }

  desactivarTecnico(tecnico: Tecnico) {
    if (confirm(`¿Estás seguro de desactivar a ${tecnico.nombre}?`)) {
      this.tecnicos.update(list => list.filter(t => t.id !== tecnico.id));
      alert('Técnico desactivado correctamente.');
    }
  }

  getEstadoClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '-');
  }
}
