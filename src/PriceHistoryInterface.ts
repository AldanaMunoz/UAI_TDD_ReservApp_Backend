export interface IPriceHistory {
  id?: number;
  price: number;           // precio
  startDate: string;       // fecha_inicio (YYYY-MM-DD)
  toDate?: string | null;  // fecha_hasta / fecha_fin (YYYY-MM-DD) nullable
}