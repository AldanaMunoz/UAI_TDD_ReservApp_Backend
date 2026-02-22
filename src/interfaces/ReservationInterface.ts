// src/interfaces/ReservationInterface.ts

/**
 * DB: reservas
 * - id
 * - id_empleado
 * - id_liquidacion
 * - fecha_reservada
 * - fecha_cancelacion
 * - id_comida_entrada
 * - id_comida_principal
 * - id_comida_postre
 * - id_comida_bebida
 * - codigo_qr
 * - estado_reserva
 * - estado_liquidacion
 * - id_historico_precio
 */

export interface IReservation {
    id?: number;

    employeeId: number;                // id_empleado
    liquidationId?: number | null;     // id_liquidacion
    priceHistoryId?: number | null;    // id_historico_precio

    reservedAt: string | Date;         // fecha_reservada
    cancelledAt?: string | Date | null; // fecha_cancelacion

    starterFoodId?: number | null;     // id_comida_entrada
    mainFoodId?: number | null;        // id_comida_principal
    dessertFoodId?: number | null;     // id_comida_postre
    drinkFoodId?: number | null;       // id_comida_bebida

    qrCode?: string | null;            // codigo_qr

    reservationStatus?: number;        // estado_reserva
    liquidationStatus?: number;        // estado_liquidacion
}
