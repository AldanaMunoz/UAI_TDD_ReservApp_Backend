// src/controllers/PriceHistoryController.ts
import type { Request, Response } from "express";
import PriceHistoryModel from "../models/PriceHistoryModel";
import type { IPriceHistory } from "../interfaces/PriceHistoryInterface";
import PriceHistoryService from "../services/PriceHistoryService";

function toInt(value: any): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

export async function getAllPriceHistory(_req: Request, res: Response) {
  try {
    const data = await PriceHistoryModel.find();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener historial de precios", error });
  }
}

export async function getPriceHistoryById(req: Request, res: Response) {
  try {
    const id = toInt(req.params.id);
    if (id === null || id <= 0) return res.status(400).json({ message: "ID inválido" });

    const item = await PriceHistoryModel.findById(id);
    if (!item) return res.status(404).json({ message: "Historial de precios no encontrado" });

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener historial de precios", error });
  }
}

/**
 * GET /price-history/by-dates?month=2&year=2026
 * Usa find() y filtra en memoria por solapamiento con el mes/año.
 */
export async function getAllPriceHistoryByDates(req: Request, res: Response) {
  try {
    const month = toInt(req.query.month);
    const year = toInt(req.query.year);

    if (month === null || month < 1 || month > 12) {
      return res.status(400).json({ message: "month inválido (1-12)" });
    }
    if (year === null || year < 1900 || year > 3000) {
      return res.status(400).json({ message: "year inválido (1900-3000)" });
    }

    const rangeStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const rangeEnd = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0) - 1);
    const farFuture = new Date(8640000000000000);

    const all = await PriceHistoryModel.find();

    const parseStart = (ymd: string) => new Date(`${ymd}T00:00:00.000Z`);
    const parseEnd = (ymd: string) => new Date(`${ymd}T23:59:59.999Z`);
    const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => aStart <= bEnd && aEnd >= bStart;

    const filtered = (all as IPriceHistory[])
      .filter((ph) => {
        const start = parseStart(ph.startDate);
        const end = ph.toDate ? parseEnd(ph.toDate) : farFuture;
        return overlaps(start, end, rangeStart, rangeEnd);
      })
      .sort((a, b) => parseStart(a.startDate).getTime() - parseStart(b.startDate).getTime());

    return res.status(200).json({
      month,
      year,
      rangeStart: rangeStart.toISOString(),
      rangeEnd: rangeEnd.toISOString(),
      data: filtered,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener historial de precios por fechas",
      error,
    });
  }
}

export async function createPriceHistory(req: Request, res: Response) {
  try {
    const body = req.body as IPriceHistory;
    const created = await PriceHistoryModel.create(body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear historial de precios", error });
  }
}

export async function updatePriceHistory(req: Request, res: Response) {
  try {
    const id = toInt(req.params.id);
    if (id === null || id <= 0) return res.status(400).json({ message: "ID inválido" });

    const patch: Partial<IPriceHistory> = { ...req.body };

    const updated = await PriceHistoryService.update(id, patch);

    return res.status(200).json({
      message: "Historial de precios actualizado",
      priceHistory: updated,
    });
  } catch (error: any) {
    if (error?.status && error?.code) {
      return res.status(error.status).json({
        message: error.message,
        code: error.code,
        data: error.data,
      });
    }

    return res.status(500).json({ message: "Error al actualizar historial de precios", error });
  }
}

export async function hardDeletePriceHistory(req: Request, res: Response) {
  try {
    const id = toInt(req.params.id);
    if (id === null || id <= 0) return res.status(400).json({ message: "ID inválido" });

    const ok = await PriceHistoryModel.hardDelete(id);
    if (!ok) return res.status(404).json({ message: "Historial de precios no encontrado" });

    return res.status(200).json({ message: "Historial de precios eliminado permanentemente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar permanentemente historial de precios", error });
  }
}

export default {
  getAllPriceHistory,
  getPriceHistoryById,
  getAllPriceHistoryByDates,
  createPriceHistory,
  updatePriceHistory,
  hardDeletePriceHistory,
};