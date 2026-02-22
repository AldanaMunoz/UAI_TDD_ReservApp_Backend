// src/controllers/ReservationController.ts
import type { Request, Response } from "express";
import ReservationModel from "../models/ReservationModel";
import type { IReservation } from "../interfaces/ReservationInterface";

function toInt(value: any): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

export async function getReservationsByDates(req: Request, res: Response) {
  try {
    const month = toInt(req.query.month);
    const year = toInt(req.query.year);

    if (month === null || month < 1 || month > 12) {
      return res.status(400).json({ message: "month inválido (1-12)" });
    }

    if (year === null || year < 1900 || year > 3000) {
      return res.status(400).json({ message: "year inválido (1900-3000)" });
    }

    const includeCancelled = String(req.query.includeCancelled ?? "0") === "1";
    const onlyPendingLiquidation = String(req.query.onlyPendingLiquidation ?? "1") === "1";

    const rangeStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const rangeEnd = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0) - 1);

    const all = await ReservationModel.find();

    const filtered = (all as IReservation[]).filter((r) => {
      // reservedAt puede venir string/date
      const reservedAt = new Date(r.reservedAt as any);
      if (Number.isNaN(reservedAt.getTime())) return false;

      const inMonth = reservedAt >= rangeStart && reservedAt <= rangeEnd;
      if (!inMonth) return false;

      if (!includeCancelled) {
        if (r.cancelledAt) return false;
      }

      if (onlyPendingLiquidation) {
        const notAssigned =
          r.liquidationId === null || r.liquidationId === undefined || r.liquidationId === 0;

        const pendingState =
          r.liquidationStatus === null ||
          r.liquidationStatus === undefined ||
          r.liquidationStatus === 0;

        if (!(notAssigned && pendingState)) return false;
      }

      return true;
    });

    return res.status(200).json({
      month,
      year,
      rangeStart: rangeStart.toISOString(),
      rangeEnd: rangeEnd.toISOString(),
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener reservas por fechas",
      error,
    });
  }
}

export async function getAllReservations(_req: Request, res: Response) {
  try {
    const data = await ReservationModel.find();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener reservas", error });
  }
}

export async function getReservationById(req: Request, res: Response) {
  try {
    const id = toInt(req.params.id);
    if (id === null || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const reservation = await ReservationModel.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    return res.status(200).json(reservation);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener reserva", error });
  }
}

export async function createReservation(req: Request, res: Response) {
  try {
    const body = req.body as IReservation;
    const created = await ReservationModel.create(body);
    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al crear reserva",
      error: error?.message || error,
    });
  }
}

export async function updateReservation(req: Request, res: Response) {
  try {
    const id = toInt(req.params.id);
    if (id === null || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const patch: Partial<IReservation> = { ...req.body };

    const updated = await ReservationModel.updatePartial(id, patch);

    if (!updated) {
      return res.status(404).json({ message: "Reserva no encontrada o sin cambios" });
    }

    return res.status(200).json({ message: "Reserva actualizada", reservation: updated });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al actualizar reserva",
      error: error?.message || error,
    });
  }
}

export async function hardDeleteReservation(req: Request, res: Response) {
  try {
    const id = toInt(req.params.id);
    if (id === null || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const ok = await ReservationModel.hardDelete(id);

    if (!ok) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    return res.status(200).json({ message: "Reserva eliminada permanentemente" });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar permanentemente la reserva",
      error,
    });
  }
}

export default {
  getAllReservations,
  getReservationById,
  getReservationsByDates,
  createReservation,
  updateReservation,
  hardDeleteReservation,
};