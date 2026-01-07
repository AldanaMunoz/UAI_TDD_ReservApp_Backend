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
        return res.status(500).json({ message: "Error fetching foods", error });
    }
}

export async function getFoodById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const food = await FoodModel.findById(id);

        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }

        return res.status(200).json(food);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching food", error });
    }
}

export async function createFood(req: Request, res: Response) {
    try {
        const body = req.body as IFood;

        const created = await FoodModel.create(body);

        return res.status(201).json(created);
    } catch (error: any) {
        return res.status(500).json({
            message: "Error creating food",
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
                .json({ message: "Food not found or no changes" });
        }

        return res
            .status(200)
            .json({ message: "Food updated", food: updated });
    } catch (error: any) {
        return res.status(500).json({
            message: "Error updating food",
            error: error?.message || error,
        });
    }
}

export async function hardDeleteFood(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const ok = await FoodModel.hardDelete(id);

        if (!ok) {
            return res.status(404).json({ message: "Food not found" });
        }

        return res.status(200).json({ message: "Food hard deleted" });
    } catch (error) {
        return res.status(500).json({
            message: "Error hard deleting food",
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
