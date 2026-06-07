import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CotizacionService } from '../../../../core/services/cotizacion.service';
import { CotizacionCreate, CotizacionRead, CotizacionUpdate } from '../../../../core/models/api.models';

@Component({
  selector: 'app-gestion-cotizaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion-cotizaciones.component.html',
  styleUrl: './gestion-cotizaciones.component.scss',
})
export class GestionCotizacionesComponent implements OnInit {
  cotizaciones = signal<CotizacionRead[]>([]);
  isLoading = signal(false);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  selectedIncidenteId = signal<number | null>(null);
  errorMessage = signal('');
  successMessage = signal('');

  form: FormGroup;

  constructor(private fb: FormBuilder, private svc: CotizacionService) {
    this.form = this.fb.group({
      id_incidente: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      descripcion_desperfecto: ['', [Validators.required, Validators.minLength(10)]],
      repuestos: [''],
      costo_repuestos: [0, [Validators.min(0)]],
      costo_mano_obra: [0, [Validators.required, Validators.min(0)]],
      tiempo_estimado: [null],
      notas_adicionales: [''],
    });
  }

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.isLoading.set(true);
    this.svc.misCotizaciones().subscribe({
      next: (data) => { this.cotizaciones.set(data); this.isLoading.set(false); },
      error: (err) => { this.errorMessage.set(err.error?.detail || 'Error al cargar cotizaciones'); this.isLoading.set(false); },
    });
  }

  abrirFormNueva(): void { this.editingId.set(null); this.form.reset({ costo_repuestos: 0 }); this.showForm.set(true); }

  editarCotizacion(c: CotizacionRead): void {
    if (c.estado !== 'pendiente') return;
    this.editingId.set(c.id);
    this.form.patchValue(c);
    this.showForm.set(true);
  }

  cerrarForm(): void { this.showForm.set(false); this.editingId.set(null); this.form.reset(); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const val = this.form.value;
    const id = this.editingId();

    if (id) {
      const payload: CotizacionUpdate = {
        descripcion_desperfecto: val.descripcion_desperfecto,
        repuestos: val.repuestos,
        costo_repuestos: val.costo_repuestos,
        costo_mano_obra: val.costo_mano_obra,
        tiempo_estimado: val.tiempo_estimado || undefined,
        notas_adicionales: val.notas_adicionales,
      };
      this.svc.actualizar(id, payload).subscribe({
        next: () => { this.successMessage.set('Cotización actualizada'); this.cerrarForm(); this.cargar(); },
        error: (err) => this.errorMessage.set(err.error?.detail || 'Error al actualizar'),
      });
    } else {
      const payload: CotizacionCreate = {
        id_incidente: parseInt(val.id_incidente),
        descripcion_desperfecto: val.descripcion_desperfecto,
        repuestos: val.repuestos,
        costo_repuestos: val.costo_repuestos,
        costo_mano_obra: val.costo_mano_obra,
        tiempo_estimado: val.tiempo_estimado || undefined,
        notas_adicionales: val.notas_adicionales,
      };
      this.svc.crear(payload).subscribe({
        next: () => { this.successMessage.set('Cotización creada exitosamente'); this.cerrarForm(); this.cargar(); },
        error: (err) => this.errorMessage.set(err.error?.detail || 'Error al crear cotización'),
      });
    }
  }

  enviar(id: number): void {
    if (!confirm('¿Enviar esta cotización al cliente?')) return;
    this.svc.enviar(id).subscribe({
      next: () => { this.successMessage.set('Cotización enviada al cliente'); this.cargar(); },
      error: (err) => this.errorMessage.set(err.error?.detail || 'Error al enviar'),
    });
  }

  estadoColor(estado: string): string {
    const map: Record<string, string> = {
      pendiente: '#f59e0b', enviada: '#3b82f6', aceptada: '#10b981',
      rechazada: '#ef4444', vencida: '#6b7280', pagada: '#8b5cf6',
    };
    return map[estado] || '#6b7280';
  }

  get totalCosto(): number {
    return (this.form.get('costo_repuestos')?.value || 0) + (this.form.get('costo_mano_obra')?.value || 0);
  }
}
