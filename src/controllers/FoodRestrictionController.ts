// src/controllers/FoodRestrictionController.ts
import type { Request, Response } from "express";
import FoodRestrictionModel from "../models/FoodRestrictionModel";
import type { IFoodRestriction } from "../interfaces/FoodRestrictionInterface";

/* ===========================================================
   CRUD + COMBO
   =========================================================== */

export async function getAllFoodRestrictions(_req: Request, res: Response) {
  try {
    const data = await FoodRestrictionModel.find();
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener restricciones", error });
  }
}

export async function getFoodRestrictionById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const item = await FoodRestrictionModel.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Restricción de comida no encontrada" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener restricción", error });
  }
}

export async function createFoodRestriction(req: Request, res: Response) {
  try {
    const body = req.body as IFoodRestriction;
    const created = await FoodRestrictionModel.create(body);
    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al crear restricción de comida",
      error: error?.message || error,
    });
  }
}

export async function updateFoodRestriction(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const patch: Partial<IFoodRestriction> = { ...req.body };

    const updated = await FoodRestrictionModel.updatePartial(id, patch);

    if (!updated) {
        return res
        .status(404)
        .json({ message: "Restricción de comida no encontrada o sin cambios" });
    }

    return res
        .status(200)
        .json({ message: "Restricción de comida actualizada", restriction: updated });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al actualizar restricción de comida",
      error: error?.message || error,
    });
  }
}

export async function hardDeleteFoodRestriction(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const ok = await FoodRestrictionModel.hardDelete(id);

    if (!ok) {
      return res.status(404).json({ message: "Restricción de comida no encontrada" });
    }

    return res.status(200).json({ message: "Restricción de comida eliminada permanentemente" });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar permanentemente restricción de comida",
      error,
    });
  }
}

export default {
  getAllFoodRestrictions,
  getFoodRestrictionById,
  createFoodRestriction,
  updateFoodRestriction,
  hardDeleteFoodRestriction,
};
