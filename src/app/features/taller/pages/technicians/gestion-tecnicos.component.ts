import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PersonalTallerRead } from '../../../../core/models/api.models';

@Component({
  selector: 'app-gestion-tecnicos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './gestion-tecnicos.component.html',
  styleUrl: './gestion-tecnicos.component.scss'
})
export class Vista_gestion_tecnicos implements OnInit {
  tecnicos = signal<PersonalTallerRead[]>([]);
  tecnicoForm: FormGroup;
  isEditing = signal(false);
  isLoading = signal(false);
  editingId = signal<number | null>(null);
  tallerId = signal<number>(0);
  errorMsg = signal('');
  successMsg = signal('');

  tallerStatus = signal({ disponible: true, capacidad: 5, solicitudesActivas: 0 });

  especialidades = [
    'Mecánica general',
    'Electricidad automotriz',
    'Auxilio de batería',
    'Cambio de llantas',
    'Grúa',
    'Cerrajería vehicular'
  ];

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
      password: ['', [Validators.required, Validators.minLength(8)]],
      especialidad: ['', [Validators.required]],
      disponibilidad: ['true']
    });
  }

  ngOnInit(): void {
    this.cargarTaller();
  }

  cargarTaller() {
    // Primero intentar desde el usuario en sesión (más rápido, sin llamada extra)
    const user = this.authService.currentUser();
    if (user?.taller_id) {
      this.tallerId.set(user.taller_id);
      this.cargarTecnicos();
      return;
    }
    // Fallback: llamar al perfil actualizado
    this.authService.getMe().subscribe({
      next: (me) => {
        if (me.taller_id) {
          this.tallerId.set(me.taller_id);
          // Actualizar el usuario en sesión con el taller_id
          this.authService.currentUser.set(me);
          this.cargarTecnicos();
        }
        // Si no tiene taller, la UI muestra el estado vacío con botón crear
      },
      error: () => { /* sin taller */ }
    });
  }

  cargarTecnicos() {
    const id = this.tallerId();
    if (!id) return;
    this.logisticaService.listPersonal(id).subscribe({
      next: (data) => this.tecnicos.set(data)
    });
  }

  nombreCompleto(t: PersonalTallerRead): string {
    if (t.nombre_usuario) {
      return `${t.nombre_usuario} ${t.apellidos_usuario ?? ''}`.trim();
    }
    return `Técnico #${t.id_usuario}`;
  }

  inicial(t: PersonalTallerRead): string {
    return (t.nombre_usuario ?? 'T').charAt(0).toUpperCase();
  }

  guardarTecnico() {
    if (this.tecnicoForm.invalid) {
      this.tecnicoForm.markAllAsTouched();
      return;
    }
    if (!this.tallerId()) {
      this.errorMsg.set('No tienes un taller registrado. Crea uno primero.');
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');
    const v = this.tecnicoForm.value;

    if (this.isEditing()) {
      this.logisticaService.updatePersonal(this.tallerId(), this.editingId()!, {
        tipo_personal: v.especialidad,
        disponible: v.disponibilidad === 'true'
      }).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMsg.set('Técnico actualizado correctamente.');
          this.cargarTecnicos();
          this.cancelarEdicion();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMsg.set(err.error?.detail || 'Error al actualizar.');
        }
      });
    } else {
      this.authService.registerTecnico({
        nombre: v.nombre,
        apellidos: v.apellidos,
        correo: v.email,
        telefono: v.telefono,
        documento_identidad: v.documento_identidad,
        password: v.password,
        activo: true,
      }).subscribe({
        next: (newUser) => {
          this.logisticaService.addPersonal(this.tallerId(), {
            id_usuario: newUser.id,
            tipo_personal: v.especialidad,
            disponible: true
          }).subscribe({
            next: () => {
              this.isLoading.set(false);
              this.successMsg.set(`${newUser.nombre} ${newUser.apellidos} registrado exitosamente.`);
              this.cargarTecnicos();
              this.cancelarEdicion();
            },
            error: (err) => {
              this.isLoading.set(false);
              this.errorMsg.set('Usuario creado pero no se pudo asignar al taller: ' + (err.error?.detail || ''));
            }
          });
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMsg.set(err.error?.detail || 'El correo o documento ya existe.');
        }
      });
    }
  }

  editarTecnico(t: PersonalTallerRead) {
    this.isEditing.set(true);
    this.editingId.set(t.id);
    this.tecnicoForm.patchValue({
      nombre: t.nombre_usuario ?? '',
      apellidos: t.apellidos_usuario ?? '',
      especialidad: t.tipo_personal,
      disponibilidad: t.disponible ? 'true' : 'false'
    });
    this.tecnicoForm.get('documento_identidad')?.disable();
    this.tecnicoForm.get('email')?.disable();
    this.tecnicoForm.get('password')?.disable();
    this.tecnicoForm.get('telefono')?.disable();
    this.errorMsg.set('');
    this.successMsg.set('');
  }

  cancelarEdicion() {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.tecnicoForm.reset({ disponibilidad: 'true' });
    this.tecnicoForm.enable();
    this.errorMsg.set('');
    this.successMsg.set('');
  }

  cambiarDisponibilidad(t: PersonalTallerRead) {
    this.logisticaService.updatePersonal(this.tallerId(), t.id, {
      disponible: !t.disponible
    }).subscribe(() => this.cargarTecnicos());
  }

  desactivarTecnico(t: PersonalTallerRead) {
    if (confirm(`¿Eliminar a ${this.nombreCompleto(t)} del equipo?`)) {
      this.errorMsg.set('Funcionalidad de eliminación pendiente en backend.');
    }
  }

  crearTallerBase() {
    this.isLoading.set(true);
    this.logisticaService.createTaller({
      nombre: 'Mi Taller VehiSOS',
      capacidad_maxima: 5,
      activo: true,
      porcentaje_comision: 10
    }).subscribe({
      next: (t) => {
        this.tallerId.set(t.id);
        this.isLoading.set(false);
        this.successMsg.set('Taller creado. Ya puedes registrar técnicos.');
        // Actualizar usuario en sesión con el nuevo taller_id
        const user = this.authService.currentUser();
        if (user) {
          this.authService.currentUser.set({ ...user, taller_id: t.id });
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(err.error?.detail || 'Error al crear taller.');
      }
    });
  }
}
