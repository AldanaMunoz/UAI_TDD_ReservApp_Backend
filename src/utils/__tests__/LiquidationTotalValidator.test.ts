const {
    calculateLiquidationReservationsTotal,
    liquidationTotalMatchesReservations
} = require("../LiquidationTotalValidator");

import type { ILiquidationReservationAmount } from "../LiquidationTotalValidator";

type LiquidationTestCase = {
    name: string;
    liquidationId: number;
    liquidationTotal: number;
    expectedCalculatedTotal: number;
    expectedMatch: boolean;
    reservations: ILiquidationReservationAmount[];
};

function printLine(text: string): void {
    process.stdout.write(text + "\n");
}

function padRight(value: string | number, length: number): string {
    return String(value).padEnd(length, " ");
}

function printReservationsTable(
    reservations: ILiquidationReservationAmount[]
): void {
    if (!reservations.length) {
        printLine("Reservas: (sin reservas)");
        return;
    }

    const headerReservationId = padRight("reservationId", 15);
    const headerLiquidationId = padRight("liquidationId", 15);
    const headerHistoricalPrice = padRight("historicalPrice", 18);

    printLine("Reservas:");
    printLine(
        headerReservationId +
        " | " +
        headerLiquidationId +
        " | " +
        headerHistoricalPrice
    );
    printLine(
        "-".repeat(15) +
        "-+-" +
        "-".repeat(15) +
        "-+-" +
        "-".repeat(18)
    );

    reservations.forEach(function (reservation) {
        printLine(
            padRight(reservation.reservationId, 15) +
            " | " +
            padRight(reservation.liquidationId, 15) +
            " | " +
            padRight(reservation.historicalPrice, 18)
        );
    });
}

function printLiquidationDebug(data: LiquidationTestCase): {
    calculatedTotal: number;
    matches: boolean;
} {
    const calculatedTotal = calculateLiquidationReservationsTotal(data.reservations);
    const matches = liquidationTotalMatchesReservations(
        data.liquidationTotal,
        data.reservations
    );

    printLine("");
    printLine("==================================================");
    printLine("Caso: " + data.name);
    printLine("Liquidación ID: " + data.liquidationId);
    printLine("");

    printReservationsTable(data.reservations);

    printLine("");
    printLine("Resumen del caso:");
    printLine("  Total esperado de la liquidación: " + data.liquidationTotal);
    printLine("  Total esperado calculado:        " + data.expectedCalculatedTotal);
    printLine("  Total calculado real:            " + calculatedTotal);
    printLine("  Coincidencia esperada:           " + data.expectedMatch);
    printLine("  Coincidencia real:               " + matches);
    printLine("==================================================");
    printLine("");

    return {
        calculatedTotal,
        matches
    };
}

describe("LiquidationTotalValidator", function () {
    const cases: LiquidationTestCase[] = [
        {
            name: "Debe calcular correctamente el total de las reservas de la liquidación 10",
            liquidationId: 10,
            liquidationTotal: 6000,
            expectedCalculatedTotal: 6000,
            expectedMatch: true,
            reservations: [
                {
                    reservationId: 1,
                    liquidationId: 10,
                    historicalPrice: 1500
                },
                {
                    reservationId: 2,
                    liquidationId: 10,
                    historicalPrice: 2000
                },
                {
                    reservationId: 3,
                    liquidationId: 10,
                    historicalPrice: 2500
                }
            ]
        },
        {
            name: "Debe devolver true cuando la suma coincide con el total de la liquidación 11",
            liquidationId: 11,
            liquidationTotal: 5000,
            expectedCalculatedTotal: 5000,
            expectedMatch: true,
            reservations: [
                {
                    reservationId: 1,
                    liquidationId: 11,
                    historicalPrice: 1000
                },
                {
                    reservationId: 2,
                    liquidationId: 11,
                    historicalPrice: 3500
                },
                {
                    reservationId: 3,
                    liquidationId: 11,
                    historicalPrice: 500
                }
            ]
        },
        {
            name: "Debe devolver false cuando la suma no coincide con el total de la liquidación 12",
            liquidationId: 12,
            liquidationTotal: 4000,
            expectedCalculatedTotal: 3000,
            expectedMatch: false,
            reservations: [
                {
                    reservationId: 1,
                    liquidationId: 12,
                    historicalPrice: 1000
                },
                {
                    reservationId: 2,
                    liquidationId: 12,
                    historicalPrice: 2000
                }
            ]
        },
        {
            name: "Debe manejar correctamente decimales en la liquidación 13",
            liquidationId: 13,
            liquidationTotal: 300.30,
            expectedCalculatedTotal: 300.3,
            expectedMatch: true,
            reservations: [
                {
                    reservationId: 1,
                    liquidationId: 13,
                    historicalPrice: 100.10
                },
                {
                    reservationId: 2,
                    liquidationId: 13,
                    historicalPrice: 200.20
                }
            ]
        },
        {
            name: "Debe devolver 0 si no hay reservas en la liquidación 14",
            liquidationId: 14,
            liquidationTotal: 0,
            expectedCalculatedTotal: 0,
            expectedMatch: true,
            reservations: []
        }
    ];

    test.each(cases)("$name", function (testCase) {
        const result = printLiquidationDebug(testCase);

        expect(result.calculatedTotal).toBe(testCase.expectedCalculatedTotal);
        expect(result.matches).toBe(testCase.expectedMatch);
    });
});