export interface IPriceHistory {
  id?: number;
  price: number;        // precio
  startDate: string;    // fecha_inicio (YYYY-MM-DD)
  fromDate?: string | null; // fecha_desde (YYYY-MM-DD) nullable
}
