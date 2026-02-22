// src/controllers/FoodTypeController.ts
import type { Request, Response } from "express";
import FoodTypeModel from "../models/FoodTypeModel";
import type { IFoodType } from "../interfaces/FoodTypeInterface";

/* ===========================================================
   CRUD
   =========================================================== */

/** GET /food-types */
export async function getAllFoodTypes(_req: Request, res: Response) {
    try {
        const data = await FoodTypeModel.find();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener tipos de comida", error });
    }
}

/** GET /food-types/:id */
export async function getFoodTypeById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const foodType = await FoodTypeModel.findById(id);
        if (!foodType) {
            return res.status(404).json({ message: "Tipo de comida no encontrado" });
        }
        return res.status(200).json(foodType);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener tipo de comida", error });
    }
}

/** POST /food-types */
export async function createFoodType(req: Request, res: Response) {
    try {
        const { name, description } = req.body as Partial<IFoodType>;

        if (!name) {
            return res.status(400).json({ message: "name es obligatorio" });
        }

        const created = await FoodTypeModel.create({
            name,
            description: description ?? null,
        } as IFoodType);

        return res.status(201).json(created);
    } catch (error: any) {
        return res.status(500).json({
            message: "Error al crear tipo de comida",
            error: error?.message || error,
        });
    }
}

/** PATCH /food-types/:id */
export async function updateFoodType(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const patch: Partial<IFoodType> = { ...req.body };

        const updated = await FoodTypeModel.updatePartial(id, patch);
        if (!updated) {
            return res
                .status(404)
                .json({ message: "Tipo de comida no encontrado o sin cambios" });
        }

        return res
            .status(200)
            .json({ message: "Tipo de comida actualizado", foodType: updated });
    } catch (error: any) {
        return res.status(500).json({
            message: "Error al actualizar tipo de comida",
            error: error?.message || error,
        });
    }
}

/** DELETE /food-types/hard/:id */
export async function hardDeleteFoodType(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const ok = await FoodTypeModel.hardDelete(id);
        if (!ok) {
            return res.status(404).json({ message: "Tipo de comida no encontrado" });
        }
        return res.status(200).json({ message: "Tipo de comida eliminado permanentemente" });
    } catch (error) {
        return res.status(500).json({
            message: "Error al eliminar permanentemente tipo de comida",
            error,
        });
    }
}

/* ===========================================================
   Grouped export
   =========================================================== */
export default {
    getAllFoodTypes,
    getFoodTypeById,
    createFoodType,
    updateFoodType,
    hardDeleteFoodType,
};
