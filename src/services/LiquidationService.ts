// src/services/LiquidationService.ts
import db from "../db/db";
import LiquidationModel from "../models/LiquidationModel";
import PriceHistoryModel from "../models/PriceHistoryModel";
import type { ILiquidation } from "../interfaces/LiquidationInterface";
import type { IPriceHistory } from "../interfaces/PriceHistoryInterface";
import type { ResultSetHeader } from "mysql2";

type GenerateResult = {
  liquidation: ILiquidation;
  reservationsCount: number;
  reservationsUpdated: number;
  totalAmount: number;
};

class ServiceError extends Error {
  public status: number;
  public code: string;
  public data?: any;

  constructor(message: string, status: number, code: string, data?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

const LIQUIDATED_STATUS = "liquidada" as const;

// Parse seguro YYYY-MM-DD a Date UTC
function parseYmdToUtcStart(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function parseYmdToUtcEnd(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999Z`);
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart <= bEnd && aEnd >= bStart;
}

function getHistoryForDate(date: Date, histories: IPriceHistory[]): IPriceHistory | null {
  const ts = date.getTime();
  let candidate: IPriceHistory | null = null;

  // histories ordenado por startDate asc
  for (const h of histories) {
    const start = parseYmdToUtcStart(h.startDate).getTime();
    const end = h.toDate ? parseYmdToUtcEnd(h.toDate).getTime() : Number.POSITIVE_INFINITY;

    if (ts >= start && ts <= end) {
      candidate = h; // el último que matchee (más reciente)
    }
  }

  return candidate;
}

async function getConn(): Promise<any> {
  const anyDb = db as any;

  if (typeof anyDb.getConnection === "function") {
    return anyDb.getConnection();
  }

  return anyDb;
}

async function findLiquidationByMonthYear(
  month: number,
  year: number,
  conn: any
): Promise<ILiquidation | undefined> {
  if (typeof (LiquidationModel as any).findByMonthYear === "function") {
    return (LiquidationModel as any).findByMonthYear(month, year, conn);
  }

  const [rows] = await conn.execute(
    `SELECT
        id,
        mes AS month,
        anio AS year,
        monto_total AS totalAmount
     FROM liquidaciones
     WHERE mes = :month AND anio = :year
     ORDER BY id DESC
     LIMIT 1`,
    { month, year }
  );

  const list = rows as any[];

  if (!list.length) {
    return undefined;
  }

  return {
    id: Number(list[0].id),
    month: Number(list[0].month),
    year: Number(list[0].year),
    totalAmount: Number(list[0].totalAmount) || 0,
  } as ILiquidation;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }

  return out;
}

const LiquidationService = {
  async generate(month: number, year: number): Promise<GenerateResult> {
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new ServiceError("month inválido (1-12)", 400, "INVALID_MONTH");
    }

    if (!Number.isInteger(year) || year < 1900 || year > 3000) {
      throw new ServiceError("year inválido (1900-3000)", 400, "INVALID_YEAR");
    }

    let conn: any = null;
    let startedTx = false;

    try {
      conn = await getConn();

      if (typeof conn.beginTransaction === "function") {
        await conn.beginTransaction();
        startedTx = true;
      }

      // 1) Evitar duplicados
      const existing = await findLiquidationByMonthYear(month, year, conn);

      if (existing?.id) {
        throw new ServiceError(
          "Ya existe una liquidación para ese mes/año",
          409,
          "LIQUIDATION_EXISTS",
          { liquidationId: existing.id }
        );
      }

      // 2) Crear liquidación (total 0)
      const created = await LiquidationModel.create(
        { month, year, totalAmount: 0 },
        conn
      );

      if (!created?.id) {
        throw new ServiceError("No se pudo crear la liquidación", 500, "CREATE_FAILED");
      }

      const liquidationId = created.id;

      // Rango del mes
      const rangeStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const rangeEnd = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0) - 1);

      // 3) Traer reservas elegibles (bloqueo con FOR UPDATE si hay transacción)
      const [reservationRows] = await conn.execute(
        `SELECT
            r.id,
            r.fecha_reservada AS reservedAt
         FROM reservas r
         WHERE YEAR(r.fecha_reservada) = :year
           AND MONTH(r.fecha_reservada) = :month
           AND r.fecha_cancelacion IS NULL
           AND (r.id_liquidacion IS NULL OR r.id_liquidacion = 0)
           AND (r.estado_liquidacion IS NULL OR r.estado_liquidacion = 0)
         ORDER BY r.id ASC
         ${startedTx ? "FOR UPDATE" : ""}`,
        { month, year }
      );

      const reservations = (reservationRows as any[]).map((r) => ({
        id: Number(r.id),
        reservedAt: new Date(r.reservedAt),
      }));

      const reservationsCount = reservations.length;

      // 4) Históricos (filtrar por solapamiento con el mes)
      const allHistories = await PriceHistoryModel.find(conn);
      const farFuture = new Date(8640000000000000);

      const historiesForMonth = (allHistories as IPriceHistory[])
        .filter((h) => {
          const start = parseYmdToUtcStart(h.startDate);
          const end = h.toDate ? parseYmdToUtcEnd(h.toDate) : farFuture;

          return overlaps(start, end, rangeStart, rangeEnd);
        })
        .sort(
          (a, b) =>
            parseYmdToUtcStart(a.startDate).getTime() -
            parseYmdToUtcStart(b.startDate).getTime()
        );

      // 5) Calcular total + mapear id_historico_precio por reserva
      let totalAmount = 0;

      const details = reservations.map((r) => {
        const hist = getHistoryForDate(r.reservedAt, historiesForMonth);

        if (!hist || hist.id === undefined) {
          throw new ServiceError(
            `No hay precio histórico que cubra la fecha de la reserva: ${r.reservedAt.toISOString()}`,
            422,
            "MISSING_PRICE_FOR_DATE",
            {
              reservationId: r.id,
              reservedAt: r.reservedAt.toISOString(),
            }
          );
        }

        const priceApplied = Number(hist.price);
        totalAmount += priceApplied;

        return {
          reservationId: r.id,
          priceHistoryId: Number(hist.id),
        };
      });

      // 6) Update reservas con CASE (por chunks para evitar query gigante)
      let reservationsUpdated = 0;
      const chunks = chunkArray(details, 300);

      for (const chunk of chunks) {
        if (!chunk.length) {
          continue;
        }

        const caseSql = chunk
          .map((_, i) => `WHEN :rid${i} THEN :phid${i}`)
          .join(" ");

        const idsSql = chunk.map((_, i) => `:rid${i}`).join(", ");

        const params: any = {
          liquidationId,
          reservationStatus: LIQUIDATED_STATUS,
        };

        chunk.forEach((d, i) => {
          params[`rid${i}`] = d.reservationId;
          params[`phid${i}`] = d.priceHistoryId;
        });

        const [updRes] = await conn.execute(
          `UPDATE reservas
           SET id_liquidacion = :liquidationId,
               estado_liquidacion = 1,
               estado_reserva = :reservationStatus,
               id_historico_precio = CASE id ${caseSql} ELSE id_historico_precio END
           WHERE id IN (${idsSql})
             AND fecha_cancelacion IS NULL
             AND (id_liquidacion IS NULL OR id_liquidacion = 0)
             AND (estado_liquidacion IS NULL OR estado_liquidacion = 0)`,
          params
        );

        reservationsUpdated += (updRes as ResultSetHeader).affectedRows ?? 0;
      }

      // Validación estricta por concurrencia
      if (reservationsUpdated !== reservationsCount) {
        throw new ServiceError(
          "No se pudieron actualizar todas las reservas (posible cambio concurrente).",
          409,
          "RESERVATIONS_CHANGED",
          {
            expected: reservationsCount,
            updated: reservationsUpdated,
          }
        );
      }

      // 7) Actualizar monto_total
      const updatedLiquidation =
        (await LiquidationModel.updatePartial(liquidationId, { totalAmount }, conn)) ??
        ({ ...created, totalAmount } as ILiquidation);

      if (startedTx && typeof conn.commit === "function") {
        await conn.commit();
      }

      return {
        liquidation: updatedLiquidation,
        reservationsCount,
        reservationsUpdated,
        totalAmount,
      };
    } catch (error: any) {
      if (startedTx && conn && typeof conn.rollback === "function") {
        try {
          await conn.rollback();
        } catch (_e) {
          // ignore
        }
      }

      if (error instanceof ServiceError) {
        throw error;
      }

      throw new ServiceError(
        error?.message || "Error interno en LiquidationService.generate",
        500,
        "INTERNAL_ERROR",
        { raw: error }
      );
    } finally {
      if (conn && typeof conn.release === "function") {
        try {
          conn.release();
        } catch (_e) {
          // ignore
        }
      }
    }
  },
};

export default LiquidationService;