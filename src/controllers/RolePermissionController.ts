import type { Request, Response } from "express";
import RolePermissionModel from "../models/RolePermissionModel";
import type { IRolePermission } from "../interfaces/RolePermissionInterface";

function isDuplicate(e: any) {
  return e?.code === "ER_DUP_ENTRY" || e?.errno === 1062;
}
function isFkMissing(e: any) {
  return e?.code === "ER_NO_REFERENCED_ROW_2" || e?.errno === 1452;
}

export async function getAllRolePermissions(_req: Request, res: Response) {
  try {
    const data = await RolePermissionModel.find();
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching roles_permisos", error });
  }
}

export async function getRolePermissionsByRoleId(req: Request, res: Response) {
  try {
    const roleId = Number(req.params.roleId);
    const data = await RolePermissionModel.findByRoleId(roleId);
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching permissions for role", error });
  }
}

export async function getRolePermissionById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const item = await RolePermissionModel.findById(id);
    if (!item)
      return res.status(404).json({ message: "RolePermission not found" });
    return res.status(200).json(item);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching rolePermission", error });
  }
}

export async function createRolePermission(req: Request, res: Response) {
  try {
    const body = req.body as IRolePermission;
    const created = await RolePermissionModel.create(body);
    return res.status(201).json(created);
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({
        message: "RolePermission already exists",
        error: error?.message || error,
      });
    }
    if (isFkMissing(error)) {
      return res.status(409).json({
        message: "Invalid roleId or permissionId (FK)",
        error: error?.message || error,
      });
    }
    return res.status(500).json({
      message: "Error creating rolePermission",
      error: error?.message || error,
    });
  }
}

export async function updateRolePermission(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const patch: Partial<IRolePermission> = { ...req.body };

    const updated = await RolePermissionModel.updatePartial(id, patch);
    if (!updated)
      return res.status(404).json({ message: "RolePermission not found" });

    return res
      .status(200)
      .json({ message: "RolePermission updated", rolePermission: updated });
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({
        message: "RolePermission already exists",
        error: error?.message || error,
      });
    }
    if (isFkMissing(error)) {
      return res.status(409).json({
        message: "Invalid roleId or permissionId (FK)",
        error: error?.message || error,
      });
    }
    return res.status(500).json({
      message: "Error updating rolePermission",
      error: error?.message || error,
    });
  }
}

export async function hardDeleteRolePermission(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const ok = await RolePermissionModel.hardDelete(id);
    if (!ok)
      return res.status(404).json({ message: "RolePermission not found" });
    return res.status(200).json({ message: "RolePermission hard deleted" });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error hard deleting rolePermission",
      error: error?.message || error,
    });
  }
}

export async function hardDeleteRolePermissionByPair(
  req: Request,
  res: Response
) {
  try {
    const roleId = Number(req.params.roleId);
    const permissionId = Number(req.params.permissionId);

    const ok = await RolePermissionModel.hardDeleteByPair(roleId, permissionId);
    if (!ok)
      return res.status(404).json({ message: "RolePermission not found" });

    return res
      .status(200)
      .json({ message: "RolePermission hard deleted (by pair)" });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error hard deleting rolePermission (by pair)",
      error: error?.message || error,
    });
  }
}

export default {
  getAllRolePermissions,
  getRolePermissionsByRoleId,
  getRolePermissionById,
  createRolePermission,
  updateRolePermission,
  hardDeleteRolePermission,
  hardDeleteRolePermissionByPair,
};
