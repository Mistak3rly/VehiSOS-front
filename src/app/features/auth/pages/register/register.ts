import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { UserCreate } from '../../../../core/models/api.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerForm: FormGroup;
  showSuccess = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      nombreCompleto: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      documentoIdentidad: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  submitRegister() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      
      const formValue = this.registerForm.value;
      
      // Separar nombre y apellidos simplificado (primer palabra es nombre, resto apellidos)
      const partesNombre = formValue.nombreCompleto.trim().split(' ');
      const nombre = partesNombre[0];
      const apellidos = partesNombre.length > 1 ? partesNombre.slice(1).join(' ') : 'Sin apellido';

      const payload: UserCreate = {
        nombre: nombre,
        apellidos: apellidos,
        correo: formValue.email,
        telefono: formValue.telefono,
        documento_identidad: formValue.documentoIdentidad,
        password: formValue.password
      };

      this.authService.register(payload).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showSuccess.set(true);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.detail || 'Ocurrió un error al registrarse. Intenta de nuevo.');
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  closeSuccess() {
    this.showSuccess.set(false);
    this.router.navigate(['/login']);
  }
}
