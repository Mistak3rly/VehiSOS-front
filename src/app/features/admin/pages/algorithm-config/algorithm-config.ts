import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-algorithm-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="config-container">
      <header>
        <h1>Configuración del Algoritmo Inteligente</h1>
        <p>Ajuste los pesos de proximidad y especialización para la asignación de talleres.</p>
      </header>

      <div class="card config-card">
        <div class="slider-group">
          <div class="label-row">
            <label>Peso de Proximidad (Distancia)</label>
            <span class="value">{{ pesoProximidad() }}%</span>
          </div>
          <input type="range" min="0" max="100" [(ngModel)]="pesoProximidad" (input)="balancearPesos('proximidad')">
          <p class="desc">Prioriza talleres más cercanos al incidente.</p>
        </div>

        <div class="slider-group">
          <div class="label-row">
            <label>Peso de Especialización (Calificación/Tipo)</label>
            <span class="value">{{ pesoEspecialidad() }}%</span>
          </div>
          <input type="range" min="0" max="100" [(ngModel)]="pesoEspecialidad" (input)="balancearPesos('especialidad')">
          <p class="desc">Prioriza talleres con mejor reputación o especialidad requerida.</p>
        </div>

        <div class="actions">
          <button class="btn-primary" (click)="guardarConfiguracion()">Guardar Cambios</button>
          <button class="btn-secondary" (click)="restablecer()">Restablecer Valores</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .config-container { padding: 2rem; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 1.8rem; font-weight: 800; color: #1a1a1a; margin-bottom: 0.5rem; }
    header { margin-bottom: 2rem; }
    .config-card { padding: 2rem; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .slider-group { margin-bottom: 2.5rem; }
    .label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    label { font-weight: 700; color: #2d3748; }
    .value { font-weight: 800; color: #3182ce; font-size: 1.2rem; }
    input[type="range"] { width: 100%; height: 8px; border-radius: 5px; background: #edf2f7; outline: none; }
    .desc { font-size: 0.9rem; color: #718096; margin-top: 0.5rem; }
    .actions { display: flex; gap: 1rem; margin-top: 1rem; }
    .btn-primary { background: #3182ce; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
    .btn-secondary { background: #edf2f7; color: #4a5568; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
  `]
})
export class AlgorithmConfig {
  pesoProximidad = signal(70);
  pesoEspecialidad = signal(30);

  balancearPesos(cambio: 'proximidad' | 'especialidad') {
    if (cambio === 'proximidad') {
      this.pesoEspecialidad.set(100 - this.pesoProximidad());
    } else {
      this.pesoProximidad.set(100 - this.pesoEspecialidad());
    }
  }

  guardarConfiguracion() {
    alert(`Configuración guardada: Proximidad ${this.pesoProximidad()}%, Especialidad ${this.pesoEspecialidad()}%`);
  }

  restablecer() {
    this.pesoProximidad.set(70);
    this.pesoEspecialidad.set(30);
  }
}
