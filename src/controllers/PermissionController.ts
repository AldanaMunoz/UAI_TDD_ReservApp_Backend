import type { Request, Response } from "express";
import PermissionModel from "../models/PermissionModel";
import type { IPermission } from "../interfaces/PermissionInterface";

function isDuplicate(e: any) {
  return e?.code === "ER_DUP_ENTRY" || e?.errno === 1062;
}
function isFkConflict(e: any) {
  return e?.code === "ER_ROW_IS_REFERENCED_2" || e?.errno === 1451;
}

export async function getAllPermissions(_req: Request, res: Response) {
  try {
    const data = await PermissionModel.find();
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener permisos", error });
  }
}

export async function getPermissionById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const item = await PermissionModel.findById(id);
    if (!item) return res.status(404).json({ message: "Permiso no encontrado" });
    return res.status(200).json(item);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener permiso", error });
  }
}

export async function createPermission(req: Request, res: Response) {
  try {
    const body = req.body as IPermission;
    const created = await PermissionModel.create(body);
    return res.status(201).json(created);
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({
        message: "El nombre del permiso ya existe",
        error: error?.message || error,
      });
    }
    return res.status(500).json({
      message: "Error al crear permiso",
      error: error?.message || error,
    });
  }
}

export async function updatePermission(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const patch: Partial<IPermission> = { ...req.body };

    const updated = await PermissionModel.updatePartial(id, patch);
    if (!updated)
      return res.status(404).json({ message: "Permiso no encontrado" });

    return res
      .status(200)
      .json({ message: "Permiso actualizado", permission: updated });
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({
        message: "El nombre del permiso ya existe",
        error: error?.message || error,
      });
    }
    return res.status(500).json({
      message: "Error al actualizar permiso",
      error: error?.message || error,
    });
  }
}

export async function hardDeletePermission(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const ok = await PermissionModel.hardDelete(id);
    if (!ok) return res.status(404).json({ message: "Permiso no encontrado" });
    return res.status(200).json({ message: "Permiso eliminado permanentemente" });
  } catch (error: any) {
    if (isFkConflict(error)) {
      return res.status(409).json({
        message:
          "No se puede eliminar el permiso porque está referenciado por roles_permisos",
        error: error?.message || error,
      });
    }
    return res.status(500).json({
      message: "Error al eliminar permanentemente permiso",
      error: error?.message || error,
    });
  }
}

export default {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  hardDeletePermission,
};
