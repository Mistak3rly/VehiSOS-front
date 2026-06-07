import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    const rolInicial = this.route.snapshot.queryParamMap.get('rol') || 'cliente';
    this.registerForm = this.fb.group({
      rol: [rolInicial, [Validators.required]],
      nombreCompleto: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      documentoIdentidad: ['', [Validators.required]],
      // Campos exclusivos para taller
      nombreDueno: [''],
      ciDueno: [''],
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

  get rolSeleccionado(): string {
    return this.registerForm.get('rol')?.value || 'cliente';
  }

  onRolChange(): void {
    this.registerForm.get('documentoIdentidad')?.reset();
    const esTaller = this.rolSeleccionado === 'taller';
    const nombreDueno = this.registerForm.get('nombreDueno');
    const ciDueno = this.registerForm.get('ciDueno');
    if (esTaller) {
      nombreDueno?.setValidators([Validators.required]);
      ciDueno?.setValidators([Validators.required]);
    } else {
      nombreDueno?.clearValidators();
      ciDueno?.clearValidators();
    }
    nombreDueno?.reset();
    ciDueno?.reset();
    nombreDueno?.updateValueAndValidity();
    ciDueno?.updateValueAndValidity();
  }

  submitRegister() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const formValue = this.registerForm.value;
      let nombre: string;
      let apellidos: string;

      if (formValue.rol === 'taller') {
        nombre = formValue.nombreCompleto.trim();
        apellidos = 'Taller';
      } else {
        const partesNombre = formValue.nombreCompleto.trim().split(' ');
        nombre = partesNombre[0];
        apellidos = partesNombre.length > 1 ? partesNombre.slice(1).join(' ') : 'Sin apellido';
      }

      const pendingTenantRaw = localStorage.getItem('pending_tenant');
      let tenantId: number | null = null;
      if (pendingTenantRaw) {
        try { tenantId = (JSON.parse(pendingTenantRaw) as { id: number }).id; } catch { /* ignore */ }
      }

      const payload: UserCreate = {
        nombre,
        apellidos,
        correo: formValue.email,
        telefono: formValue.telefono,
        documento_identidad: formValue.documentoIdentidad,
        password: formValue.password,
        rol: formValue.rol as 'cliente' | 'taller',
        tenant_id: tenantId,
        ...(formValue.rol === 'taller' && {
          nombre_dueno: formValue.nombreDueno,
          ci_dueno: formValue.ciDueno,
        }),
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
