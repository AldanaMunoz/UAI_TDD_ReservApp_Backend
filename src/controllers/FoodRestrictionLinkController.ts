// src/controllers/FoodRestrictionLinkController.ts
import type { Request, Response } from "express";
import FoodRestrictionLinkModel from "../models/FoodRestrictionLinkModel";
import type { IFoodRestrictionLink } from "../interfaces/FoodRestrictionLinkInterface";

export async function getAllFoodRestrictionLinks(_req: Request, res: Response) {
  try {
    const data = await FoodRestrictionLinkModel.find();
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener links de restricciones de comida", error });
  }
}

export async function getFoodRestrictionLinkById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const item = await FoodRestrictionLinkModel.findById(id);

    if (!item) {
      return res
        .status(404)
        .json({ message: "Link de restricción de comida no encontrado" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener link de restricción de comida", error });
  }
}

export async function getFoodRestrictionLinksByFoodId(
  req: Request,
  res: Response
) {
  try {
    const foodId = Number(req.params.foodId);
    const data = await FoodRestrictionLinkModel.findByFoodId(foodId);
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener restricciones para la comida", error });
  }
}

export async function createFoodRestrictionLink(req: Request, res: Response) {
  try {
    const body = req.body as IFoodRestrictionLink;

    const created = await FoodRestrictionLinkModel.create(body);
    return res.status(201).json(created);
  } catch (error: any) {
    // opcional: conflicto por unique (id_comida, id_comida_restriccion)
    const msg = error?.message || String(error);
    if (error?.code === "ER_DUP_ENTRY" || error?.errno === 1062) {
      return res
        .status(409)
        .json({ message: "Link ya existe", error: msg });
    }

    return res.status(500).json({
      message: "Error al crear link de restricción de comida",
      error: msg,
    });
  }
}

export async function updateFoodRestrictionLink(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const patch: Partial<IFoodRestrictionLink> = { ...req.body };

    const updated = await FoodRestrictionLinkModel.updatePartial(id, patch);

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Link de restricción de comida no encontrado o sin cambios" });
    }

    return res
      .status(200)
      .json({ message: "Link de restricción de comida actualizado", link: updated });
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (error?.code === "ER_DUP_ENTRY" || error?.errno === 1062) {
      return res.status(409).json({
        message: "Otro link con el mismo par ya existe",
        error: msg,
      });
    }

    return res.status(500).json({
      message: "Error al actualizar link de restricción de comida",
      error: msg,
    });
  }
}

export async function hardDeleteFoodRestrictionLink(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);
    const ok = await FoodRestrictionLinkModel.hardDelete(id);

    if (!ok) {
      return res
        .status(404)
        .json({ message: "Link de restricción de comida no encontrado" });
    }

    return res
      .status(200)
      .json({ message: "Link de restricción de comida eliminado permanentemente" });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar permanentemente link de restricción de comida",
      error,
    });
  }
}

export async function hardDeleteFoodRestrictionLinkByPair(
  req: Request,
  res: Response
) {
  try {
    const foodId = Number(req.params.foodId);
    const restrictionId = Number(req.params.restrictionId);

    const ok = await FoodRestrictionLinkModel.hardDeleteByPair(
      foodId,
      restrictionId
    );

    if (!ok) {
      return res
        .status(404)
        .json({ message: "Link de restricción de comida no encontrado" });
    }

    return res
      .status(200)
      .json({ message: "Link de restricción de comida eliminado permanentemente (por par)" });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar permanentemente link de restricción de comida",
      error,
    });
  }
}

export default {
  getAllFoodRestrictionLinks,
  getFoodRestrictionLinkById,
  getFoodRestrictionLinksByFoodId,
  createFoodRestrictionLink,
  updateFoodRestrictionLink,
  hardDeleteFoodRestrictionLink,
  hardDeleteFoodRestrictionLinkByPair,
};
