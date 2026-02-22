import type { Request, Response } from "express";
import WeeklyPlanningFoodModel from "../models/WeeklyPlanningFoodsModel";
import type { IWeeklyPlanningFood } from "../interfaces/WeeklyPlanningFoodInterface";

function isDuplicate(e: any) {
  return e?.code === "ER_DUP_ENTRY" || e?.errno === 1062;
}
function isFkMissing(e: any) {
  return e?.code === "ER_NO_REFERENCED_ROW_2" || e?.errno === 1452;
}

export async function getAllWeeklyPlanningFoods(_req: Request, res: Response) {
  try {
    const data = await WeeklyPlanningFoodModel.find();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener comidas de planificación semanal", error });
  }
}

export async function getWeeklyPlanningFoodById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const item = await WeeklyPlanningFoodModel.findById(id);
    if (!item) return res.status(404).json({ message: "Comida de planificación semanal no encontrada" });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener comida de planificación semanal", error });
  }
}

export async function getWeeklyPlanningFoodByWeeklyPlanningId(req: Request, res: Response) {
  try {
    const weeklyPlanningId = Number(req.params.weeklyPlanningId);
    const item = await WeeklyPlanningFoodModel.findByWeeklyPlanningId(weeklyPlanningId);
    if (!item) return res.status(404).json({ message: "Comida de planificación semanal no encontrada para ese weeklyPlanningId" });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener comida de planificación semanal por weeklyPlanningId", error });
  }
}

export async function createWeeklyPlanningFood(req: Request, res: Response) {
  try {
    const body = req.body as IWeeklyPlanningFood;
    const created = await WeeklyPlanningFoodModel.create(body);
    return res.status(201).json(created);
    } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({ message: "Solo se permite un registro por weeklyPlanningId (restricción única)", error: error?.message || error });
    }
    if (isFkMissing(error)) {
      return res.status(409).json({ message: "weeklyPlanningId o foodId inválido (FK)", error: error?.message || error });
    }
    return res.status(500).json({ message: "Error al crear comida de planificación semanal", error });
  }
}

export async function updateWeeklyPlanningFood(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const patch: Partial<IWeeklyPlanningFood> = { ...req.body };

    const updated = await WeeklyPlanningFoodModel.updatePartial(id, patch);
    if (!updated) return res.status(404).json({ message: "Comida de planificación semanal no encontrada" });

    return res.status(200).json({ message: "Comida de planificación semanal actualizada", weeklyPlanningFood: updated });
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({ message: "Solo se permite un registro por weeklyPlanningId (restricción única)", error: error?.message || error });
    }
    if (isFkMissing(error)) {
      return res.status(409).json({ message: "weeklyPlanningId o foodId inválido (FK)", error: error?.message || error });
    }
    return res.status(500).json({ message: "Error al actualizar comida de planificación semanal", error });
  }
}

export async function hardDeleteWeeklyPlanningFood(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const ok = await WeeklyPlanningFoodModel.hardDelete(id);
    if (!ok) return res.status(404).json({ message: "Comida de planificación semanal no encontrada" });
    return res.status(200).json({ message: "Comida de planificación semanal eliminada permanentemente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar permanentemente la comida de planificación semanal", error });
  }
}

export default {
  getAllWeeklyPlanningFoods,
  getWeeklyPlanningFoodById,
  getWeeklyPlanningFoodByWeeklyPlanningId,
  createWeeklyPlanningFood,
  updateWeeklyPlanningFood,
  hardDeleteWeeklyPlanningFood,
};
