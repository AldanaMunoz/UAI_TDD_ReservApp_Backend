// src/controllers/LiquidationController.ts
import type { Request, Response } from "express";
import db from "../db/db";
import LiquidationModel from "../models/LiquidationModel";
import type { ILiquidation } from "../interfaces/LiquidationInterface";
import LiquidationService from "../services/LiquidationService";

function toInt(value: any): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  return n;
}

function toNumber(value: any): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

async function hasReservationsAssignedToLiquidation(liquidationId: number): Promise<boolean> {
  const [rows] = await (db as any).execute(
    `SELECT 1
     FROM reservas r
     WHERE r.id_liquidacion = :liquidationId
     LIMIT 1`,
    { liquidationId }
  );

  return Array.isArray(rows) && rows.length > 0;
}

/* ===========================================================
   CRUD
   =========================================================== */

export async function getAllLiquidations(_req: Request, res: Response) {
  try {
    const data = await LiquidationModel.find();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener liquidaciones", error });
  }
}

export async function getLiquidationById(req: Request, res: Response) {
  try {
    const id = toInt(req.params.id);
    if (id === null || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const liquidation = await LiquidationModel.findById(id);

    if (!liquidation) {
      return res.status(404).json({ message: "Liquidación no encontrada" });
    }

    return res.status(200).json(liquidation);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener liquidación", error });
  }
}

export async function createLiquidation(req: Request, res: Response) {
  try {
    const body = req.body as ILiquidation;
    const created = await LiquidationModel.create(body);
    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al crear liquidación",
      error: error?.message || error,
    });
  }
}

export async function updateLiquidation(req: Request, res: Response) {
  try {
    const id = toInt(req.params.id);
    if (id === null || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const patch: Partial<ILiquidation> = { ...req.body };

    // Validación: patch no vacío
    if (!patch || Object.keys(patch).length === 0) {
      return res.status(400).json({ message: "Debés enviar al menos un campo para actualizar" });
    }

    // NUEVA REGLA: si la liquidación ya tiene reservas asignadas,
    // no se puede modificar month/year/totalAmount
    const touchesSensitiveFields =
      (patch as any).month !== undefined ||
      (patch as any).year !== undefined ||
      (patch as any).totalAmount !== undefined;

    if (touchesSensitiveFields) {
      const assigned = await hasReservationsAssignedToLiquidation(id);

      if (assigned) {
        return res.status(409).json({
          message:
            "No se puede modificar mes/año/monto_total porque la liquidación ya tiene reservas asignadas.",
          code: "LIQUIDATION_LOCKED_BY_ASSIGNED_RESERVATIONS",
        });
      }
    }

    // Validación: si viene mes
    if ((patch as any).month !== undefined) {
      const month = toInt((patch as any).month);
      if (month === null || month < 1 || month > 12) {
        return res.status(400).json({ message: "mes inválido (1-12)" });
      }
      (patch as any).month = month;
    }

    // Validación: si viene año
    if ((patch as any).year !== undefined) {
      const year = toInt((patch as any).year);
      if (year === null || year < 1900 || year > 3000) {
        return res.status(400).json({ message: "año inválido (1900-3000)" });
      }
      (patch as any).year = year;
    }

    // Validación: si viene monto total
    if ((patch as any).totalAmount !== undefined) {
      const totalAmount = toNumber((patch as any).totalAmount);
      if (totalAmount === null || totalAmount < 0) {
        return res.status(400).json({ message: "monto total inválido (debe ser >= 0)" });
      }
      (patch as any).totalAmount = totalAmount;
    }

    const updated = await LiquidationModel.updatePartial(id, patch);

    if (!updated) {
      return res.status(404).json({ message: "Liquidación no encontrada o sin cambios" });
    }

    return res.status(200).json({
      message: "Liquidación actualizada",
      liquidation: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al actualizar liquidación",
      error: error?.message || error,
    });
  }
}

export async function hardDeleteLiquidation(req: Request, res: Response) {
  try {
    const id = toInt(req.params.id);
    if (id === null || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const ok = await LiquidationModel.hardDelete(id);

    if (!ok) {
      return res.status(404).json({ message: "Liquidación no encontrada" });
    }

    return res.status(200).json({ message: "Liquidación eliminada permanentemente" });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar permanentemente la liquidación",
      error,
    });
  }
}

/* ===========================================================
   NEGOCIO
   =========================================================== */

export async function generateLiquidation(req: Request, res: Response) {
  try {
    const month = toInt(req.body.month);
    const year = toInt(req.body.year);

    if (month === null || month < 1 || month > 12) {
      return res.status(400).json({ message: "month inválido (1-12)" });
    }
    if (year === null || year < 1900 || year > 3000) {
      return res.status(400).json({ message: "year inválido (1900-3000)" });
    }

    const result = await LiquidationService.generate(month, year);

    return res.status(201).json({
      message: "Liquidación generada y reservas asignadas",
      ...result,
    });
  } catch (error: any) {
    if (error?.status && error?.code) {
      return res.status(error.status).json({
        message: error.message,
        code: error.code,
        data: error.data,
      });
    }

    return res.status(500).json({
      message: "Error al generar liquidación",
      error: error?.message || error,
    });
  }
}

export default {
  getAllLiquidations,
  getLiquidationById,
  createLiquidation,
  updateLiquidation,
  hardDeleteLiquidation,
  generateLiquidation,
};