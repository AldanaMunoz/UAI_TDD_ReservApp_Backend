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

async function hasReservationsAssignedToLiquidation(
  liquidationId: number
): Promise<boolean> {
  const [rows] = await (db as any).execute(
    `SELECT 1
     FROM reservas r
     WHERE r.id_liquidacion = :liquidationId
     LIMIT 1`,
    { liquidationId }
  );

  return Array.isArray(rows) && rows.length > 0;
}

async function findLiquidationByMonthYear(
  month: number,
  year: number
): Promise<ILiquidation | undefined> {
  if (typeof (LiquidationModel as any).findByMonthYear === "function") {
    return (LiquidationModel as any).findByMonthYear(month, year);
  }

  const [rows] = await (db as any).execute(
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

/* ===========================================================
   CRUD
   =========================================================== */

export async function getAllLiquidations(_req: Request, res: Response) {
  try {
    const data = await LiquidationModel.find();
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al obtener liquidaciones",
      error: error?.message || error,
    });
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
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al obtener liquidación",
      error: error?.message || error,
    });
  }
}

async function getLiquidationReservationDetails(id: number) {
  const [rows] = await db.execute(
    `SELECT
      r.id AS reservationId,
      DATE_FORMAT(r.fecha_reservada, '%Y-%m-%d') AS reservedDate,
      r.estado_reserva AS status,
      COALESCE(p.nombre, '') AS employeeName,
      COALESCE(p.apellido, '') AS employeeLastName,
      COALESCE(e.tipo, 'interno') AS employeeType,
      COALESCE(hp.precio, 0) AS basePrice,
      COALESCE(hp.precio, 0) AS appliedPrice
     FROM reservas r
     LEFT JOIN usuarios u ON u.id = r.id_usuario
     LEFT JOIN personas p ON p.id_usuario = u.id
     LEFT JOIN empleados e ON e.id_persona = p.id
     LEFT JOIN historicos_precios hp ON hp.id = r.id_historico_precio
     WHERE r.id_liquidacion = :id
     ORDER BY r.fecha_reservada, r.id`,
    { id }
  );
  return rows as any[];
}

export async function getLiquidationDetails(req: Request, res: Response) {
  const id = toInt(req.params.id);
  if (id === null || id <= 0) return res.status(400).json({ message: "ID invalido" });
  try {
    const liquidation = await LiquidationModel.findById(id);
    if (!liquidation) return res.status(404).json({ message: "Liquidacion no encontrada" });
    const reservations = await getLiquidationReservationDetails(id);
    return res.status(200).json({ liquidation, reservations });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el detalle", error });
  }
}

function xmlCell(value: unknown, numeric = false) {
  const escaped = String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<Cell><Data ss:Type="${numeric ? "Number" : "String"}">${escaped}</Data></Cell>`;
}

export async function exportLiquidationExcel(req: Request, res: Response) {
  const id = toInt(req.params.id);
  if (id === null || id <= 0) return res.status(400).json({ message: "ID invalido" });
  try {
    const liquidation = await LiquidationModel.findById(id);
    if (!liquidation) return res.status(404).json({ message: "Liquidacion no encontrada" });
    const reservations = await getLiquidationReservationDetails(id);
    const header = ["Reserva", "Fecha", "Nombre", "Apellido", "Tipo", "Estado", "Precio aplicado"];
    const rows = reservations.map((item) => `<Row>${[
      xmlCell(item.reservationId, true), xmlCell(item.reservedDate), xmlCell(item.employeeName),
      xmlCell(item.employeeLastName), xmlCell(item.employeeType), xmlCell(item.status),
      xmlCell(Number(item.appliedPrice), true),
    ].join("")}</Row>`).join("");
    const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Liquidacion"><Table><Row>${header.map((value) => xmlCell(value)).join("")}</Row>${rows}</Table></Worksheet></Workbook>`;
    res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="liquidacion-${liquidation.year}-${String(liquidation.month).padStart(2, "0")}.xls"`);
    return res.status(200).send(workbook);
  } catch (error) {
    return res.status(500).json({ message: "Error al exportar la liquidacion", error });
  }
}

export async function createLiquidation(req: Request, res: Response) {
  try {
    const month = toInt(req.body?.month);
    const year = toInt(req.body?.year);
    const totalAmountRaw = req.body?.totalAmount;
    const totalAmount =
      totalAmountRaw === undefined ? 0 : toNumber(totalAmountRaw);

    if (month === null || month < 1 || month > 12) {
      return res.status(400).json({ message: "mes inválido (1-12)" });
    }

    if (year === null || year < 1900 || year > 3000) {
      return res.status(400).json({ message: "año inválido" });
    }

    if (totalAmount === null || totalAmount < 0) {
      return res.status(400).json({
        message: "totalAmount inválido (debe ser >= 0)",
      });
    }

    const existing = await findLiquidationByMonthYear(month, year);

    if (existing?.id) {
      return res.status(409).json({
        message: "Ya existe una liquidación para ese mes/año",
        code: "LIQUIDATION_EXISTS",
        data: { liquidationId: existing.id },
      });
    }

    const payload: ILiquidation = {
      month,
      year,
      totalAmount,
    };

    const created = await LiquidationModel.create(payload);

    return res.status(201).json({
      message: "Liquidación creada",
      liquidation: created,
    });
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

    const current = await LiquidationModel.findById(id);

    if (!current) {
      return res.status(404).json({ message: "Liquidación no encontrada" });
    }

    // Sanitizar: solo permitir campos válidos
    const patch: Partial<ILiquidation> = {};

    if (req.body?.month !== undefined) {
      const month = toInt(req.body.month);
      if (month === null || month < 1 || month > 12) {
        return res.status(400).json({ message: "month inválido (1-12)" });
      }
      patch.month = month;
    }

    if (req.body?.year !== undefined) {
      const year = toInt(req.body.year);
      if (year === null || year < 1900 || year > 3000) {
        return res.status(400).json({ message: "año inválido" });
      }
      patch.year = year;
    }

    if (req.body?.totalAmount !== undefined) {
      const totalAmount = toNumber(req.body.totalAmount);
      if (totalAmount === null || totalAmount < 0) {
        return res.status(400).json({
          message: "totalAmount inválido (debe ser >= 0)",
        });
      }
      patch.totalAmount = totalAmount;
    }

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({
        message:
          "Debés enviar al menos uno de estos campos para actualizar: month, year, totalAmount",
      });
    }

    // Si ya tiene reservas asignadas, bloquear edición de campos sensibles
    const touchesSensitiveFields =
      patch.month !== undefined ||
      patch.year !== undefined ||
      patch.totalAmount !== undefined;

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

    // Validar duplicado month/year si cambia alguno de esos campos
    const nextMonth = patch.month ?? current.month;
    const nextYear = patch.year ?? current.year;

    if (nextMonth !== undefined && nextYear !== undefined) {
      const existing = await findLiquidationByMonthYear(nextMonth, nextYear);

      if (existing?.id && existing.id !== id) {
        return res.status(409).json({
          message: "Ya existe otra liquidación para ese mes/año",
          code: "LIQUIDATION_EXISTS",
          data: { liquidationId: existing.id },
        });
      }
    }

    const updated = await LiquidationModel.updatePartial(id, patch);

    if (!updated) {
      return res.status(404).json({
        message: "Liquidación no encontrada o sin cambios",
      });
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

    const existing = await LiquidationModel.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Liquidación no encontrada" });
    }

    const assigned = await hasReservationsAssignedToLiquidation(id);

    if (assigned) {
      return res.status(409).json({
        message:
          "No se puede eliminar la liquidación porque tiene reservas asignadas.",
        code: "LIQUIDATION_LOCKED_BY_ASSIGNED_RESERVATIONS",
      });
    }

    const ok = await LiquidationModel.hardDelete(id);

    if (!ok) {
      return res.status(404).json({ message: "Liquidación no encontrada" });
    }

    return res.status(200).json({
      message: "Liquidación eliminada permanentemente",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al eliminar permanentemente la liquidación",
      error: error?.message || error,
    });
  }
}

/* ===========================================================
   NEGOCIO
   =========================================================== */

export async function generateLiquidation(req: Request, res: Response) {
  try {
    const month = toInt(req.body?.month);
    const year = toInt(req.body?.year);

    if (month === null || month < 1 || month > 12) {
      return res.status(400).json({ message: "mes inválido (1-12)" });
    }

    if (year === null || year < 1900 || year > 3000) {
      return res.status(400).json({ message: "año inválido" });
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
  getLiquidationDetails,
  exportLiquidationExcel,
  createLiquidation,
  updateLiquidation,
  hardDeleteLiquidation,
  generateLiquidation,
};
