export interface ILiquidationReservationAmount {
    reservationId: number;
    liquidationId: number;
    historicalPrice: number;
}

function toCents(value: number): number {
    return Math.round(Number(value) * 100);
}

export function calculateLiquidationReservationsTotal(
    reservations: ILiquidationReservationAmount[]
): number {
    const totalInCents = reservations.reduce(function (acc, reservation) {
        return acc + toCents(reservation.historicalPrice);
    }, 0);

    return totalInCents / 100;
}

export function liquidationTotalMatchesReservations(
    liquidationTotal: number,
    reservations: ILiquidationReservationAmount[]
): boolean {
    return toCents(liquidationTotal) ===
        reservations.reduce(function (acc, reservation) {
            return acc + toCents(reservation.historicalPrice);
        }, 0);
}