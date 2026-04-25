import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  userRole: string = 'Cliente'; // Simulated
  userName: string = 'Juan Perez'; // Simulated

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      nombre: ['Juan', [Validators.required]],
      apellidos: ['Perez', [Validators.required]],
      email: ['juan.perez@example.com', [Validators.required, Validators.email]],
      telefono: ['78012345', [Validators.required]],
      ci: ['1234567 LP', []]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Detect role from localStorage if needed
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) this.userRole = savedRole;
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  guardarPerfil() {
    if (this.profileForm.valid) {
      console.log('Guardando perfil...', this.profileForm.value);
      alert('Perfil actualizado correctamente.');
    }
  }

  actualizarPassword() {
    if (this.passwordForm.valid) {
      console.log('Actualizando contraseña...');
      alert('Contraseña actualizada correctamente.');
      this.passwordForm.reset();
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
