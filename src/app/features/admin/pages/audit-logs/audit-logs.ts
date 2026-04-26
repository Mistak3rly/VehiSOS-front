import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <h1>Auditoría de Sistema</h1>
        <p>Registro histórico de acciones críticas realizadas por los usuarios y administradores.</p>
      </header>

      <div class="table-container card">
        <table>
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of logs()">
              <td class="date-cell">{{ log.date | date:'medium' }}</td>
              <td class="user-cell">
                <span class="material-icons-round">account_circle</span>
                {{ log.user }}
              </td>
              <td>
                <span class="action-badge" [ngClass]="log.action.toLowerCase()">
                  {{ log.action }}
                </span>
              </td>
              <td class="details-cell">{{ log.details }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; h1 { font-size: 2rem; font-weight: 800; } p { color: #718096; } }
    .card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #edf2f7; }
    
    .table-container { padding: 0; }
    table { width: 100%; border-collapse: collapse; text-align: left;
      th { padding: 1.2rem 1.5rem; background: #f8fafc; color: #64748b; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; border-bottom: 1px solid #edf2f7; }
      td { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    }

    .date-cell { color: #718096; font-size: 0.9rem; font-family: monospace; }
    .user-cell { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: #2d3748; .material-icons-round { color: #cbd5e0; font-size: 1.2rem; } }
    
    .action-badge {
      padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
      background: #edf2f7; color: #4a5568;
      &.login { background: #c6f6d5; color: #22543d; }
      &.update_role { background: #bee3f8; color: #2c5282; }
      &.approve_workshop { background: #feebc8; color: #744210; }
    }

    .details-cell { color: #4a5568; font-size: 0.95rem; }
  `]
})
export class AuditLogs implements OnInit {
  logs = signal<any[]>([]);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getAuditLogs().subscribe(data => this.logs.set(data));
  }
}
