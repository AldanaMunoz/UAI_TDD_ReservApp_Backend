// src/interfaces/LiquidationInterface.ts

/**
 * DB: liquidaciones
 * - id
 * - mes
 * - anio
 * - monto_total
 */
export interface ILiquidation {
    id?: number;
    month: number;          // mes
    year: number;           // anio
    totalAmount?: number;   // monto_total
}
