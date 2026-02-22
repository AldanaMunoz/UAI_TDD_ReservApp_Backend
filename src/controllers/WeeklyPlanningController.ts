import type { Request, Response } from "express";
import WeeklyPlanningModel from "../models/WeeklyPlanningModel";
import type { IWeeklyPlanning } from "../interfaces/WeeklyPlanningInterface";

function isDuplicate(e: any) {
  return e?.code === "ER_DUP_ENTRY" || e?.errno === 1062;
}
function isFkMissing(e: any) {
  return e?.code === "ER_NO_REFERENCED_ROW_2" || e?.errno === 1452;
}

export async function getAllWeeklyPlannings(_req: Request, res: Response) {
  try {
    const data = await WeeklyPlanningModel.find();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener planificaciones semanales", error });
  }
}

export async function getWeeklyPlanningById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const item = await WeeklyPlanningModel.findById(id);
    if (!item) return res.status(404).json({ message: "Planificación semanal no encontrada" });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener planificación semanal", error });
  }
}

export async function createWeeklyPlanning(req: Request, res: Response) {
  try {
    const body = req.body as IWeeklyPlanning;
    const created = await WeeklyPlanningModel.create(body);
    return res.status(201).json(created);
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({ message: "La planificación semanal ya existe (restricción única)", error: error?.message || error });
    }
    if (isFkMissing(error)) {
      return res.status(409).json({ message: "seasonId inválido (FK)", error: error?.message || error });
    }
    return res.status(500).json({ message: "Error al crear planificación semanal", error });
  }
}

export async function updateWeeklyPlanning(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const patch: Partial<IWeeklyPlanning> = { ...req.body };

    const updated = await WeeklyPlanningModel.updatePartial(id, patch);
    if (!updated) return res.status(404).json({ message: "Planificación semanal no encontrada" });

    return res.status(200).json({ message: "Planificación semanal actualizada", weeklyPlanning: updated });
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({ message: "La planificación semanal ya existe (restricción única)", error: error?.message || error });
    }
    if (isFkMissing(error)) {
      return res.status(409).json({ message: "seasonId inválido (FK)", error: error?.message || error });
    }
    return res.status(500).json({ message: "Error al actualizar planificación semanal", error });
  }
}

export async function hardDeleteWeeklyPlanning(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const ok = await WeeklyPlanningModel.hardDelete(id);
    if (!ok) return res.status(404).json({ message: "Planificación semanal no encontrada" });
    return res.status(200).json({ message: "Planificación semanal eliminada permanentemente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar permanentemente la planificación semanal", error });
  }
}

export default {
  getAllWeeklyPlannings,
  getWeeklyPlanningById,
  createWeeklyPlanning,
  updateWeeklyPlanning,
  hardDeleteWeeklyPlanning,
};
