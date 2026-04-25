import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  forgotForm: FormGroup;
  showSuccess = signal(false);

  constructor(private fb: FormBuilder, private router: Router) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  submitForgot() {
    if (this.forgotForm.valid) {
      console.log('Solicitud de recuperación para:', this.forgotForm.value.email);
      // Simular envío de correo
      this.showSuccess.set(true);
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }

  goBack() {
    this.showSuccess.set(false);
    this.router.navigate(['/login']);
  }
}
