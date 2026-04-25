export interface VehiculoRead {
  id: number;
  id_usuario: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number | null;
  color: string | null;
  observaciones: string | null;
}

export interface VehiculoCreate {
  placa: string;
  marca: string;
  modelo: string;
  anio?: number;
  color?: string;
  observaciones?: string;
}
