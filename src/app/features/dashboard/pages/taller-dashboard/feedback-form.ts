import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FeedbackAsignacion } from '../../../../core/models/api.models';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  template: `
    <mat-card class="feedback-card">
      <mat-card-header>
        <mat-card-title>Evalúa tu Experiencia</mat-card-title>
        <mat-icon class="header-icon">feedback</mat-icon>
      </mat-card-header>

      <form [formGroup]="feedbackForm" (ngSubmit)="onSubmit()" class="feedback-form">
        <mat-card-content>
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Taller Asignado</mat-label>
            <input matInput formControlName="id_taller_asignado" [attr.readonly]="true" [disabled]="true" />
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Calificación de Satisfacción</mat-label>
            <mat-select formControlName="satisfaccion_cliente">
              <mat-option *ngFor="let rating of ratingOptions" [value]="rating">{{ rating }} ⭐</mat-option>
            </mat-select>
            <mat-error *ngIf="isFieldInvalid('satisfaccion_cliente')">La calificación es requerida (1-5)</mat-error>
          </mat-form-field>

          <div class="form-group toggle-group">
            <label class="form-label">¿Aceptaste la recomendación?</label>
            <mat-slide-toggle formControlName="recomendacion_aceptada" class="toggle">
              {{ feedbackForm.get('recomendacion_aceptada')?.value ? 'Sí' : 'No' }}
            </mat-slide-toggle>
          </div>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Comentarios (opcional)</mat-label>
            <textarea matInput formControlName="comentarios" rows="4" placeholder="Comparte tu experiencia con el taller..."></textarea>
            <mat-hint align="end">{{ feedbackForm.get('comentarios')?.value?.length || 0 }}/500</mat-hint>
          </mat-form-field>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-stroked-button type="button" (click)="onCancel()" [disabled]="isSubmitting">Cancelar</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="feedbackForm.invalid || isSubmitting">
            <mat-icon *ngIf="!isSubmitting">send</mat-icon>
            <span *ngIf="!isSubmitting">Enviar Feedback</span>
            <span *ngIf="isSubmitting">Enviando...</span>
          </button>
        </mat-card-actions>
      </form>
    </mat-card>
  `,
  styles: [``]
})
export class FeedbackFormComponent implements OnInit {
  @Output() feedbackSubmitted = new EventEmitter<FeedbackAsignacion>();
  @Output() cancelled = new EventEmitter<void>();

  feedbackForm!: FormGroup;
  isSubmitting = false;
  ratingOptions = [1, 2, 3, 4, 5];

  constructor(private fb: FormBuilder) {}

  ngOnInit() { this.initForm(); }

  private initForm() {
    this.feedbackForm = this.fb.group({
      id_taller_asignado: [0, Validators.required],
      satisfaccion_cliente: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      recomendacion_aceptada: [false],
      comentarios: ['', Validators.maxLength(500)],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.feedbackForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.feedbackForm.invalid) return;
    this.isSubmitting = true;
    const feedback: FeedbackAsignacion = this.feedbackForm.value;
    this.feedbackSubmitted.emit(feedback);
    setTimeout(() => { this.isSubmitting = false; this.feedbackForm.reset(); }, 1200);
  }

  onCancel() { this.feedbackForm.reset(); this.cancelled.emit(); }

  setTallerId(tallerId: number) { this.feedbackForm.patchValue({ id_taller_asignado: tallerId }); }
}
