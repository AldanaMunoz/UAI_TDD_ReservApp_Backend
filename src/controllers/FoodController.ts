// src/controllers/FoodController.ts
import type { Request, Response } from "express";
import FoodModel from "../models/FoodModel";
import type { IFood } from "../interfaces/FoodInterface";

/* ===========================================================
   CRUD
   =========================================================== */

export async function getAllFoods(_req: Request, res: Response) {
    try {
        const data = await FoodModel.find();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener comidas", error });
    }
}

export async function getFoodById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const food = await FoodModel.findById(id);

        if (!food) {
            return res.status(404).json({ message: "Comida no encontrada" });
        }

        return res.status(200).json(food);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener comida", error });
    }
}

export async function createFood(req: Request, res: Response) {
    try {
        const body = req.body as IFood;

        const created = await FoodModel.create(body);

        return res.status(201).json(created);
    } catch (error: any) {
        return res.status(500).json({
            message: "Error al crear comida",
            error: error?.message || error,
        });
    }
}

export async function updateFood(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const patch: Partial<IFood> = { ...req.body };

        const updated = await FoodModel.updatePartial(id, patch);

        if (!updated) {
            return res
                .status(404)
                .json({ message: "Comida no encontrada o sin cambios" });
        }

        return res
            .status(200)
            .json({ message: "Comida actualizada", food: updated });
    } catch (error: any) {
        return res.status(500).json({
            message: "Error al actualizar comida",
            error: error?.message || error,
        });
    }
}

export async function hardDeleteFood(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const ok = await FoodModel.hardDelete(id);

        if (!ok) {
            return res.status(404).json({ message: "Comida no encontrada" });
        }

        return res.status(200).json({ message: "Comida eliminada permanentemente" });
    } catch (error) {
        return res.status(500).json({
            message: "Error al eliminar permanentemente comida",
            error,
        });
    }
}

export default {
    getAllFoods,
    getFoodById,
    createFood,
    updateFood,
    hardDeleteFood,
};
