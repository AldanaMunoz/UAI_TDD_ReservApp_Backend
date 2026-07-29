// src/controllers/FoodController.ts
import type { Request, Response } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import FoodModel from "../models/FoodModel";
import type { IFood } from "../interfaces/FoodInterface";

const UPLOADS_ROOT = path.resolve(process.env.UPLOADS_DIR || "uploads");
const FOOD_UPLOADS_FOLDER = "foods";

function getPublicFoodImageUrl(foodId: number, fileName: string) {
    return `/uploads/${FOOD_UPLOADS_FOLDER}/${foodId}/${fileName}`;
}

function getLocalPathFromImageUrl(imageUrl?: string | null) {
    if (!imageUrl?.startsWith("/uploads/")) return undefined;

    const relativePath = imageUrl.replace(/^\/uploads\//, "");
    const fullPath = path.resolve(UPLOADS_ROOT, relativePath);

    const relativeToRoot = path.relative(UPLOADS_ROOT, fullPath);
    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) return undefined;
    return fullPath;
}

function parseFoodId(rawId: string): number | undefined {
    const id = Number(rawId);
    return Number.isInteger(id) && id > 0 ? id : undefined;
}

async function deleteLocalImage(imageUrl?: string | null) {
    const filePath = getLocalPathFromImageUrl(imageUrl);
    if (!filePath) return;

    await fs.unlink(filePath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
    });
}

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

export async function getFoodsByType(req: Request, res: Response) {
    try {
        const data = await FoodModel.findByTypeName(req.params.type);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener comidas por tipo", error });
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

export async function updateFoodImage(req: Request, res: Response) {
    let newFilePath: string | undefined;
    try {
        const id = parseFoodId(req.params.id);
        if (!id) return res.status(400).json({ message: "ID de comida invalido" });
        const food = await FoodModel.findById(id);

        if (!food) {
            return res.status(404).json({ message: "Comida no encontrada" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Debes enviar una imagen JPG en el campo image" });
        }

        const foodFolder = path.join(UPLOADS_ROOT, FOOD_UPLOADS_FOLDER, String(id));
        await fs.mkdir(foodFolder, { recursive: true });

        const fileName = `food-${id}-${Date.now()}-${randomUUID()}.jpg`;
        const filePath = path.join(foodFolder, fileName);
        newFilePath = filePath;

        await fs.writeFile(filePath, req.file.buffer);

        const imageUrl = getPublicFoodImageUrl(id, fileName);
        const updated = await FoodModel.updatePartial(id, { imageUrl });
        if (!updated) throw new Error("No se pudo guardar la referencia de la imagen");

        try {
            await deleteLocalImage(food.imageUrl);
        } catch (cleanupError) {
            console.error("No se pudo eliminar la imagen anterior de la comida", id, cleanupError);
        }

        return res.status(200).json({
            message: "Imagen de comida actualizada",
            food: updated,
        });
    } catch (error: any) {
        if (newFilePath) {
            await fs.unlink(newFilePath).catch((cleanupError: NodeJS.ErrnoException) => {
                if (cleanupError.code !== "ENOENT") {
                    console.error("No se pudo limpiar la nueva imagen luego del error", cleanupError);
                }
            });
        }
        return res.status(500).json({
            message: "Error al actualizar imagen de comida",
            error: error?.message || error,
        });
    }
}

export async function deleteFoodImage(req: Request, res: Response) {
    try {
        const id = parseFoodId(req.params.id);
        if (!id) return res.status(400).json({ message: "ID de comida invalido" });
        const food = await FoodModel.findById(id);

        if (!food) {
            return res.status(404).json({ message: "Comida no encontrada" });
        }

        const updated = await FoodModel.updatePartial(id, { imageUrl: null });
        if (!updated) throw new Error("No se pudo quitar la referencia de la imagen");

        try {
            await deleteLocalImage(food.imageUrl);
        } catch (cleanupError) {
            console.error("No se pudo eliminar el archivo de imagen de la comida", id, cleanupError);
        }

        return res.status(200).json({
            message: "Imagen de comida eliminada",
            food: updated,
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Error al eliminar imagen de comida",
            error: error?.message || error,
        });
    }
}

export async function hardDeleteFood(req: Request, res: Response) {
    try {
        const id = parseFoodId(req.params.id);
        if (!id) return res.status(400).json({ message: "ID de comida invalido" });
        const food = await FoodModel.findById(id);
        const ok = await FoodModel.hardDelete(id);

        if (!ok) {
            return res.status(404).json({ message: "Comida no encontrada" });
        }

        try {
            await deleteLocalImage(food?.imageUrl);
        } catch (cleanupError) {
            console.error("No se pudo eliminar la imagen de la comida borrada", id, cleanupError);
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
    getFoodsByType,
    createFood,
    updateFood,
    updateFoodImage,
    deleteFoodImage,
    hardDeleteFood,
};
