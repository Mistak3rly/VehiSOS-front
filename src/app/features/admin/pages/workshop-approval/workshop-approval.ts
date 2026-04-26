import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticaService } from '../../../../core/services/logistica.service';
import { TallerRead } from '../../../../core/models/api.models';

@Component({
  selector: 'app-workshop-approval',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="approval-container">
      <header>
        <h1>Aprobación de Nuevos Talleres</h1>
        <p>Gestione el acceso de nuevos proveedores de servicios al ecosistema VehiSOS.</p>
      </header>

      <div class="pending-list" *ngIf="pendingWorkshops().length > 0; else noPending">
        <div class="workshop-card card" *ngFor="let taller of pendingWorkshops()">
          <div class="info">
            <h3>{{ taller.nombre }}</h3>
            <p class="owner"><span class="material-icons-round">badge</span> NIT: {{ taller.nit }}</p>
            <p class="location"><span class="material-icons-round">location_on</span> {{ taller.direccion }}</p>
            <span class="status-badge">Pendiente de activación</span>
          </div>
          <div class="actions">
            <button class="btn-approve" (click)="aprobar(taller.id)">Activar Taller</button>
            <button class="btn-reject" (click)="rechazar(taller.id)">Rechazar</button>
          </div>
        </div>
      </div>

      <ng-template #noPending>
        <div class="empty-state card">
          <span class="material-icons-round">check_circle_outline</span>
          <h3>Todo al día</h3>
          <p>No hay talleres pendientes de activación.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .approval-container { padding: 2rem; max-width: 1000px; margin: 0 auto; }
    h1 { font-size: 1.8rem; font-weight: 800; color: #1a1a1a; margin-bottom: 0.5rem; }
    header { margin-bottom: 2rem; }
    .pending-list { display: flex; flex-direction: column; gap: 1rem; }
    .workshop-card {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.5rem; background: white; border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #edf2f7;
    }
    .info h3 { margin: 0 0 0.5rem; font-size: 1.2rem; font-weight: 700; color: #2d3748; }
    .info p { margin: 0.2rem 0; color: #718096; display: flex; align-items: center; gap: 0.5rem; }
    .info .material-icons-round { font-size: 1.1rem; }
    .status-badge { 
      display: inline-block; margin-top: 0.8rem; padding: 0.3rem 0.8rem; 
      background: #feebc8; color: #744210; border-radius: 20px; font-size: 0.8rem; font-weight: 700;
    }
    .actions { display: flex; gap: 1rem; }
    .btn-approve { 
      background: #38a169; color: white; border: none; padding: 0.7rem 1.2rem; 
      border-radius: 8px; font-weight: 700; cursor: pointer; transition: background 0.2s;
      &:hover { background: #2f855a; }
    }
    .btn-reject { 
      background: #fff; color: #e53e3e; border: 1px solid #feb2b2; padding: 0.7rem 1.2rem; 
      border-radius: 8px; font-weight: 700; cursor: pointer;
      &:hover { background: #fff5f5; }
    }
    .empty-state {
      padding: 5rem 2rem; text-align: center; color: #a0aec0;
      .material-icons-round { font-size: 4rem; color: #38a169; margin-bottom: 1rem; }
    }
  `]
})
export class WorkshopApproval implements OnInit {
  pendingWorkshops = signal<TallerRead[]>([]);

  constructor(private logistica: LogisticaService) {}

  ngOnInit() {
    this.cargarPendientes();
  }

  cargarPendientes() {
    this.logistica.listAllTalleres().subscribe(data => {
      // Un taller está pendiente si no está activo (aprobación)
      this.pendingWorkshops.set(data.filter(t => t.activo === false));
    });
  }

  aprobar(id: number) {
    this.logistica.updateTallerActivo(id, true).subscribe({
      next: () => {
        alert('Taller aprobado satisfactoriamente.');
        this.cargarPendientes();
      },
      error: (err) => {
        console.error('Error al aprobar taller', err);
        alert('Ocurrió un error al aprobar el taller.');
      }
    });
  }

  rechazar(id: number) {
    if (confirm('¿Está seguro de rechazar esta solicitud? El taller no podrá acceder al sistema.')) {
      // Para este caso, podemos simplemente dejarlo inactivo o quizás en el futuro un estado "rechazado".
      // Por ahora, solo alertamos y ocultamos.
      alert('Solicitud rechazada (simulada por ahora en BD, el taller sigue inactivo).');
      this.cargarPendientes();
    }
  }
}
