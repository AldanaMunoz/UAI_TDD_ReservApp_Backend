import type { Request, Response } from "express";
import UserRoleModel from "../models/UserRoleModel";
import type { IUserRole } from "../interfaces/UserRoleInterface";

function isDuplicate(e: any) {
  return e?.code === "ER_DUP_ENTRY" || e?.errno === 1062;
}
function isFkMissing(e: any) {
  return e?.code === "ER_NO_REFERENCED_ROW_2" || e?.errno === 1452;
}

export async function getAllUserRoles(_req: Request, res: Response) {
  try {
    const data = await UserRoleModel.find();
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener usuarios_roles", error });
  }
}

export async function getUserRolesByUserId(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);
    const data = await UserRoleModel.findByUserId(userId);
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener roles del usuario", error });
  }
}

export async function getUserRoleById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const item = await UserRoleModel.findById(id);
    if (!item) return res.status(404).json({ message: "Rol de usuario no encontrado" });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener rol de usuario", error });
  }
}

export async function createUserRole(req: Request, res: Response) {
  try {
    const body = req.body as IUserRole;
    const created = await UserRoleModel.create(body);
    return res.status(201).json(created);
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({
        message: "El rol de usuario ya existe",
        error: error?.message || error,
      });
    }
    if (isFkMissing(error)) {
      return res.status(409).json({
        message: "userId o roleId inválido (FK)",
        error: error?.message || error,
      });
    }
    return res.status(500).json({
      message: "Error al crear rol de usuario",
      error: error?.message || error,
    });
  }
}

export async function updateUserRole(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const patch: Partial<IUserRole> = { ...req.body };

    const updated = await UserRoleModel.updatePartial(id, patch);
    if (!updated)
      return res.status(404).json({ message: "Rol de usuario no encontrado" });

    return res
      .status(200)
      .json({ message: "Rol de usuario actualizado", userRole: updated });
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({
        message: "El rol de usuario ya existe",
        error: error?.message || error,
      });
    }
    if (isFkMissing(error)) {
      return res.status(409).json({
        message: "userId o roleId inválido (FK)",
        error: error?.message || error,
      });
    }
    return res.status(500).json({
      message: "Error al actualizar rol de usuario",
      error: error?.message || error,
    });
  }
}

export async function hardDeleteUserRole(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const ok = await UserRoleModel.hardDelete(id);
    if (!ok) return res.status(404).json({ message: "Rol de usuario no encontrado" });
    return res.status(200).json({ message: "Rol de usuario eliminado permanentemente" });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al eliminar permanentemente rol de usuario",
      error: error?.message || error,
    });
  }
}

export async function hardDeleteUserRoleByPair(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);
    const roleId = Number(req.params.roleId);

    const ok = await UserRoleModel.hardDeleteByPair(userId, roleId);
    if (!ok) return res.status(404).json({ message: "Rol de usuario no encontrado" });

    return res.status(200).json({ message: "Rol de usuario eliminado permanentemente (por par)" });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al eliminar permanentemente rol de usuario (por par)",
      error: error?.message || error,
    });
  }
}

export default {
  getAllUserRoles,
  getUserRolesByUserId,
  getUserRoleById,
  createUserRole,
  updateUserRole,
  hardDeleteUserRole,
  hardDeleteUserRoleByPair,
};
