import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TallerRead, PersonalTallerRead } from '../../../../core/models/api.models';

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
  isLoading = signal(false);
  editingId = signal<number | null>(null);
  tallerId: number = 0;

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

  constructor(
    private fb: FormBuilder,
    private logisticaService: LogisticaService,
    private authService: AuthService
  ) {
    this.tecnicoForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      documento_identidad: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['vehisos123', [Validators.required]],
      especialidad: ['', [Validators.required]],
      disponibilidad: ['Disponible', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this.logisticaService.listTalleres().subscribe({
      next: (talleres: TallerRead[]) => {
        if (talleres.length > 0) {
          this.tallerId = talleres[0].id;
          console.log('Taller detectado:', this.tallerId);
          this.cargarTecnicos();
        } else {
          console.warn('No se encontraron talleres para este usuario.');
          // En lugar de un fallback hardcodeado, informamos al usuario
          // o podríamos ofrecer crear uno automáticamente si es necesario.
        }
      },
      error: (err) => {
        console.error('Error al cargar taller del usuario.', err);
        // Fallback preventivo para no bloquear la UI en desarrollo
        this.tallerId = 1; 
        this.cargarTecnicos();
      }
    });
  }

  crearTallerBase() {
    this.isLoading.set(true);
    this.logisticaService.createTaller({
      nombre: 'Mi Taller VehiSOS',
      capacidad_maxima: 5,
      activo: true,
      porcentaje_comision: 10
    }).subscribe({
      next: (nuevoTaller) => {
        this.tallerId = nuevoTaller.id;
        alert('¡Taller creado con éxito! Ahora puedes añadir técnicos.');
        this.cargarTecnicos();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        alert('No se pudo crear el taller: ' + (err.error?.detail || 'Error de conexión'));
      }
    });
  }

  cargarTecnicos() {
    if (!this.tallerId) return;
    this.logisticaService.listPersonal(this.tallerId).subscribe({
      next: (data: PersonalTallerRead[]) => {
        const mapeado: Tecnico[] = data.map(p => ({
          id: p.id,
          nombre: `Personal #${p.id_usuario}`,
          telefono: 'N/A',
          email: 'N/A',
          especialidad: p.tipo_personal,
          disponibilidad: p.disponible ? 'Disponible' : 'Ocupado',
          ultimaActualizacion: new Date(p.fecha_asignacion).toLocaleDateString()
        }));
        this.tecnicos.set(mapeado);
      }
    });
  }

  guardarTecnico() {
    console.log('Intentando guardar técnico...', this.tecnicoForm.value);
    if (this.tecnicoForm.valid) {
      if (!this.tallerId) {
        alert('Error: No se ha detectado un Taller ID válido. Por favor, asegúrate de estar logueado como dueño de taller.');
        this.isLoading.set(false);
        return;
      }
      this.isLoading.set(true);
      const formValue = this.tecnicoForm.value;
      
      if (this.isEditing()) {
        this.logisticaService.updatePersonal(this.tallerId, this.editingId()!, {
          tipo_personal: formValue.especialidad,
          disponible: formValue.disponibilidad === 'Disponible'
        }).subscribe({
          next: () => {
            this.cargarTecnicos();
            this.cancelarEdicion();
            this.isLoading.set(false);
          },
          error: (err) => {
            this.isLoading.set(false);
            alert(err.error?.detail || 'Error al actualizar el técnico.');
          }
        });
      } else {
        // FLUJO DE REGISTRO COMPLETO:
        // 1. Crear el usuario real
        this.authService.register({
          nombre: formValue.nombre,
          apellidos: formValue.apellidos,
          correo: formValue.email,
          telefono: formValue.telefono,
          documento_identidad: formValue.documento_identidad,
          password: formValue.password,
          activo: true
        }).subscribe({
          next: (newUser) => {
            // 2. Asignar como personal
            this.logisticaService.addPersonal(this.tallerId, {
              id_usuario: newUser.id,
              tipo_personal: formValue.especialidad,
              disponible: true
            }).subscribe({
              next: () => {
                this.isLoading.set(false);
                alert(`¡Éxito! El técnico ${newUser.nombre} ${newUser.apellidos} ha sido registrado y guardado en la base de datos.`);
                this.cargarTecnicos();
                this.cancelarEdicion();
              },
              error: (err) => {
                this.isLoading.set(false);
                alert('Usuario creado, pero no se pudo asignar al taller: ' + (err.error?.detail || 'Error desconocido'));
              }
            });
          },
          error: (err) => {
            this.isLoading.set(false);
            alert('Error al crear el usuario del técnico: ' + (err.error?.detail || 'El correo o documento ya existe.'));
          }
        });
      }
    }
  }

  editarTecnico(tecnico: Tecnico) {
    this.isEditing.set(true);
    this.editingId.set(tecnico.id);
    this.tecnicoForm.patchValue({
      nombre: tecnico.nombre,
      especialidad: tecnico.especialidad,
      disponibilidad: tecnico.disponibilidad
    });
    // Nota: Otros campos como password o documento no se editan aquí por simplicidad
  }

  cancelarEdicion() {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.tecnicoForm.reset({ disponibilidad: 'Disponible', password: 'vehisos123' });
  }

  cambiarDisponibilidad(tecnico: Tecnico) {
    const nextStatus: Record<string, 'Disponible' | 'Ocupado' | 'No disponible'> = {
      'Disponible': 'Ocupado',
      'Ocupado': 'No disponible',
      'No disponible': 'Disponible'
    };

    const nextDisp = nextStatus[tecnico.disponibilidad];
    
    this.logisticaService.updatePersonal(this.tallerId, tecnico.id, {
      disponible: nextDisp === 'Disponible'
    }).subscribe(() => {
      this.cargarTecnicos();
    });
  }

  actualizarDisponibilidadTaller() {
    this.tallerStatus.update(s => ({ ...s, disponible: !s.disponible }));
    alert('Estado general del taller actualizado.');
  }

  desactivarTecnico(tecnico: Tecnico) {
    if (confirm(`¿Estás seguro de desactivar a ${tecnico.nombre}?`)) {
      // Aquí se llamaría a un endpoint de eliminación si existiera
      alert('Funcionalidad de eliminación pendiente de implementación en backend.');
    }
  }

  getEstadoClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '-');
  }
}
