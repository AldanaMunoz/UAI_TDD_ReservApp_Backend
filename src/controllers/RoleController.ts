import type { Request, Response } from "express";
import RoleModel from "../models/RoleModel";
import type { IRole } from "../interfaces/RoleInterface";

function isDuplicate(e: any) {
  return e?.code === "ER_DUP_ENTRY" || e?.errno === 1062;
}
function isFkConflict(e: any) {
  return e?.code === "ER_ROW_IS_REFERENCED_2" || e?.errno === 1451;
}

export async function getAllRoles(_req: Request, res: Response) {
  try {
    const data = await RoleModel.find();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener roles", error });
  }
}

export async function getRoleById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const item = await RoleModel.findById(id);
    if (!item) return res.status(404).json({ message: "Rol no encontrado" });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener rol", error });
  }
}

export async function createRole(req: Request, res: Response) {
  try {
    const body = req.body as IRole;
    const created = await RoleModel.create(body);
    return res.status(201).json(created);
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({
        message: "El nombre del rol ya existe",
        error: error?.message || error,
      });
    }
    return res
      .status(500)
      .json({ message: "Error al crear rol", error: error?.message || error });
  }
}

export async function updateRole(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const patch: Partial<IRole> = { ...req.body };

    const updated = await RoleModel.updatePartial(id, patch);
    if (!updated) return res.status(404).json({ message: "Rol no encontrado" });

    return res.status(200).json({ message: "Rol actualizado", role: updated });
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({
        message: "El nombre del rol ya existe",
        error: error?.message || error,
      });
    }
    return res
      .status(500)
      .json({ message: "Error al actualizar rol", error: error?.message || error });
  }
}

export async function hardDeleteRole(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const ok = await RoleModel.hardDelete(id);
    if (!ok) return res.status(404).json({ message: "Rol no encontrado" });
    return res.status(200).json({ message: "Rol eliminado permanentemente" });
  } catch (error: any) {
    if (isFkConflict(error)) {
      return res.status(409).json({
        message:
          "No se puede eliminar el rol porque está referenciado por usuarios_roles",
        error: error?.message || error,
      });
    }
    return res.status(500).json({
      message: "Error al eliminar permanentemente rol",
      error: error?.message || error,
    });
  }
}

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  hardDeleteRole,
};
