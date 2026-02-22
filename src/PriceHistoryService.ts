// src/services/PriceHistoryService.ts
import db from "../db/db";
import PriceHistoryModel from "../models/PriceHistoryModel";
import type { IPriceHistory } from "../interfaces/PriceHistoryInterface";

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

function isValidYmd(dateStr: any): boolean {
  return typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

function ymdToComparable(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00.000Z`).getTime();
}

/**
 * Retorna true si existe al menos UNA reserva dentro del rango del histórico:
 * - Si toDate es null => rango abierto: fecha_reservada >= startDate
 * - Si toDate tiene valor => startDate <= fecha_reservada <= toDate
 */
async function hasReservationsInHistoryRange(
  startDateYmd: string,
  toDateYmd: string | null,
  exec: any = db
): Promise<boolean> {
  const startDate = `${startDateYmd} 00:00:00`;
  const endDate = toDateYmd ? `${toDateYmd} 23:59:59` : null;

  const [rows] = await exec.execute(
    `SELECT 1
     FROM reservas r
     WHERE r.fecha_cancelacion IS NULL
       AND r.fecha_reservada >= :startDate
       AND (:endDate IS NULL OR r.fecha_reservada <= :endDate)
     LIMIT 1`,
    { startDate, endDate }
  );

  return Array.isArray(rows) && rows.length > 0;
}

/**
 * Devuelve la mayor fecha "límite" existente en historicos_precios considerando:
 * - MAX(fecha_inicio)
 * - MAX(fecha_hasta) (ignorando null)
 */
async function getMaxBoundaryDate(exec: any = db): Promise<string | null> {
  const [rows] = await exec.execute(
    `SELECT
        MAX(fecha_inicio) AS maxStart,
        MAX(fecha_hasta)  AS maxEnd
     FROM historicos_precios`
  );

  const row = (rows as any[])[0] || null;
  if (!row) return null;

  const maxStart = row.maxStart ? String(row.maxStart) : null;
  const maxEnd = row.maxEnd ? String(row.maxEnd) : null;

  if (!maxStart && !maxEnd) return null;
  if (maxStart && !maxEnd) return maxStart;
  if (!maxStart && maxEnd) return maxEnd;

  return ymdToComparable(maxStart!) >= ymdToComparable(maxEnd!) ? maxStart! : maxEnd!;
}

const PriceHistoryService = {
  async update(id: number, patch: Partial<IPriceHistory>): Promise<IPriceHistory> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ServiceError("ID inválido", 400, "INVALID_ID");
    }

    const current = await PriceHistoryModel.findById(id);
    if (!current) {
      throw new ServiceError("Historial de precios no encontrado", 404, "NOT_FOUND");
    }

    // -----------------------------
    // Validaciones básicas de fechas
    // -----------------------------
    if (patch.startDate !== undefined && !isValidYmd(patch.startDate)) {
      throw new ServiceError("startDate inválida (YYYY-MM-DD)", 400, "INVALID_STARTDATE");
    }

    if (patch.toDate !== undefined && patch.toDate !== null && !isValidYmd(patch.toDate)) {
      throw new ServiceError("toDate inválida (YYYY-MM-DD o null)", 400, "INVALID_ENDDATE");
    }

    // Rango resultante (si patch toca fechas)
    const nextStart = patch.startDate ?? current.startDate;
    const nextEnd = patch.toDate !== undefined ? patch.toDate : (current.toDate ?? null);

    if (nextEnd !== null && ymdToComparable(nextEnd) < ymdToComparable(nextStart)) {
      throw new ServiceError("toDate no puede ser menor a startDate", 400, "END_BEFORE_START");
    }

    // -----------------------------
    // Regla A: bloquear cambio de price si hay reservas dentro del rango del historial
    // -----------------------------
    const wantsChangePrice =
      patch.price !== undefined && Number(patch.price) !== Number(current.price);

    if (wantsChangePrice) {
      const hasRes = await hasReservationsInHistoryRange(current.startDate, current.toDate ?? null);
      if (hasRes) {
        throw new ServiceError(
          "No se puede modificar el precio: existen reservas dentro del rango de este historial.",
          409,
          "PRICE_LOCKED_BY_RESERVATIONS"
        );
      }
    }

    // -----------------------------
    // Regla B: modificar toDate sólo si:
    // - current.toDate es null (cerrar el rango abierto), o
    // - el nuevo toDate es > maxBoundary de TODO historicos_precios
    // -----------------------------
    const wantsChangeEndDate = patch.toDate !== undefined;

    if (wantsChangeEndDate) {
      const currentEnd = current.toDate ?? null;
      const newEnd = patch.toDate ?? null;

      // Caso 1: el registro actual está abierto => permito cerrarlo (setear fecha_hasta)
      if (currentEnd === null) {
        // Si lo cierra, ya validamos toDate >= startDate
        // Si querés PROHIBIR dejarlo en null explícitamente:
        // if (newEnd === null) throw new ServiceError("No podés dejar toDate en null", 400, "ENDDATE_REQUIRED");
      } else {
        // Caso 2: ya estaba cerrado => solo permito extenderlo al final del tiempo (nuevo toDate > maxBoundary)
        if (newEnd === null) {
          throw new ServiceError(
            "No se puede volver a dejar toDate en null una vez cerrado.",
            409,
            "CANNOT_REOPEN_CLOSED_RANGE"
          );
        }

        const maxBoundary = await getMaxBoundaryDate();
        if (maxBoundary && ymdToComparable(newEnd) <= ymdToComparable(maxBoundary)) {
          throw new ServiceError(
            "No se puede modificar toDate: debe ser mayor a todas las fechas existentes en historicos_precios.",
            409,
            "ENDDATE_NOT_AFTER_MAX_BOUNDARY",
            { maxBoundary }
          );
        }
      }
    }

    const updated = await PriceHistoryModel.updatePartial(id, patch);
    if (!updated) {
      throw new ServiceError("Historial de precios no encontrado", 404, "NOT_FOUND");
    }

    return updated;
  },
};

export default PriceHistoryService;