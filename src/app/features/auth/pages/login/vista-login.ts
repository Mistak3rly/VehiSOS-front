import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-vista-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vista-login.html',
  styleUrl: './vista-login.scss',
})
export class VistaLogin {
  loginForm: FormGroup;
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      identificador: ['', [Validators.required]],
      password: ['', [Validators.required]],
      remember: [false]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  submitLogin() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          const roleRaw = this.authService.getUserRole() || '';
          const role = roleRaw.toLowerCase();
          
          let redirectUrl = '/dashboard';

          if (role === 'administrador' || role === 'admin') redirectUrl = '/admin/dashboard';
          else if (role === 'taller') redirectUrl = '/taller/dashboard';
          else if (role === 'técnico' || role === 'tecnico') redirectUrl = '/tecnico/dashboard';

          this.router.navigate([redirectUrl]);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.status === 401) {
            this.errorMessage.set('Correo/documento o contraseña incorrectos.');
          } else if (err.status === 422) {
            this.errorMessage.set('La contraseña debe tener al menos 8 caracteres.');
          } else {
            this.errorMessage.set(err.error?.detail || 'Error al iniciar sesión. Verifica tus credenciales.');
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
