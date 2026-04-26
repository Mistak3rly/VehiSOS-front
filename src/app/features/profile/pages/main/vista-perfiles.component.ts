import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { LogisticaService } from '../../../../core/services/logistica.service';

@Component({
  selector: 'app-vista-perfiles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vista-perfiles.component.html',
  styleUrl: './vista-perfiles.component.scss'
})
export class VistaPerfiles implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  userRole: string = 'Cargando...';
  userName: string = 'Cargando...';
  userId: number = 0;
  tallerId: number | null = null;
  tallerForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private logisticaService: LogisticaService
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      ci: ['', []]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.tallerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      nit: [''],
      direccion: [''],
      ciudad: [''],
      capacidad_maxima: [5, [Validators.required]],
      latitud: [0],
      longitud: [0]
    });
  }

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.userId = user.id;
        this.userName = `${user.nombre} ${user.apellidos}`;
        this.userRole = user.roles && user.roles.length > 0 ? user.roles[0].nombre : 'Cliente';
        
        this.profileForm.patchValue({
          nombre: user.nombre,
          apellidos: user.apellidos,
          email: user.correo,
          telefono: user.telefono || '',
          ci: user.documento_identidad || ''
        });

        if (this.userRole.toLowerCase().includes('taller')) {
          this.cargarDatosTaller();
        }
      },
      error: (err) => console.error('Error al cargar el perfil', err)
    });
  }

  cargarDatosTaller() {
    this.logisticaService.listTalleres().subscribe({
      next: (talleres) => {
        if (talleres.length > 0) {
          const t = talleres[0];
          this.tallerId = t.id;
          this.tallerForm.patchValue({
            nombre: t.nombre,
            nit: t.nit,
            direccion: t.direccion,
            ciudad: t.ciudad,
            capacidad_maxima: t.capacidad_maxima,
            latitud: t.latitud,
            longitud: t.longitud
          });
        }
      }
    });
  }

  guardarDatosTaller() {
    if (this.tallerForm.valid && this.tallerId) {
      this.logisticaService.updateTaller(this.tallerId, this.tallerForm.value).subscribe({
        next: () => alert('Datos del taller actualizados correctamente.'),
        error: (err) => alert(err.error?.detail || 'Error al actualizar taller')
      });
    }
  }

  passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  guardarPerfil() {
    if (this.profileForm.valid && this.userId) {
      const formValue = this.profileForm.value;
      this.authService.updateUser(this.userId, {
        nombre: formValue.nombre,
        apellidos: formValue.apellidos,
        correo: formValue.email,
        telefono: formValue.telefono,
        documento_identidad: formValue.ci
      }).subscribe({
        next: () => {
          alert('Perfil actualizado correctamente.');
          this.userName = `${formValue.nombre} ${formValue.apellidos}`;
        },
        error: (err) => alert(err.error?.detail || 'Error al actualizar perfil')
      });
    }
  }

  actualizarPassword() {
    if (this.passwordForm.valid && this.userId) {
      this.authService.updateUser(this.userId, {
        password: this.passwordForm.value.newPassword
      }).subscribe({
        next: () => {
          alert('Contraseña actualizada correctamente.');
          this.passwordForm.reset();
        },
        error: (err) => alert(err.error?.detail || 'Error al actualizar contraseña')
      });
    }
  }

  solicitarDesactivacion() {
    if (confirm('¿Estás seguro de que deseas solicitar la desactivación de tu cuenta? Esta acción será revisada por administración.')) {
      console.log('Solicitando desactivación...');
      alert('Solicitud enviada. Un administrador revisará tu caso.');
    }
  }

  getInitials(): string {
    return 'JP';
  }
}
