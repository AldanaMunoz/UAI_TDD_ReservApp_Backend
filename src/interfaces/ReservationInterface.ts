// src/interfaces/ReservationInterface.ts

export type ReservationStatus =
    | "confirmada"
    | "cancelada"
    | "asistio"
    | "noshow"
    | "liquidada";

export interface IReservation {
    id?: number;

    userId: number; // DB: id_usuario
    liquidationId?: number | null; // DB: id_liquidacion
    priceHistoryId?: number | null; // DB: id_historico_precio

    reservedAt: string | Date; // DB: fecha_reservada
    cancelledAt?: string | Date | null; // DB: fecha_cancelacion

    starterFoodId?: number | null; // DB: id_comida_entrada
    mainFoodId?: number | null; // DB: id_comida_principal
    dessertFoodId?: number | null; // DB: id_comida_postre
    drinkFoodId?: number | null; // DB: id_comida_bebida
    qrCode?: string | null; // DB: codigo_qr

    reservationStatus?: ReservationStatus; // DB: estado_reserva
    liquidationStatus?: number; // DB: estado_liquidacion
}
