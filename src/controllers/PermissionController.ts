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
      .json({ message: "Error fetching permissions", error });
  }
}

export async function getPermissionById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const item = await PermissionModel.findById(id);
    if (!item) return res.status(404).json({ message: "Permission not found" });
    return res.status(200).json(item);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching permission", error });
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
        message: "Permission name already exists",
        error: error?.message || error,
      });
    }
    return res.status(500).json({
      message: "Error creating permission",
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
      return res.status(404).json({ message: "Permission not found" });

    return res
      .status(200)
      .json({ message: "Permission updated", permission: updated });
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({
        message: "Permission name already exists",
        error: error?.message || error,
      });
    }
    return res.status(500).json({
      message: "Error updating permission",
      error: error?.message || error,
    });
  }
}

export async function hardDeletePermission(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const ok = await PermissionModel.hardDelete(id);
    if (!ok) return res.status(404).json({ message: "Permission not found" });
    return res.status(200).json({ message: "Permission hard deleted" });
  } catch (error: any) {
    if (isFkConflict(error)) {
      return res.status(409).json({
        message:
          "Cannot delete permission because it is referenced by roles_permisos",
        error: error?.message || error,
      });
    }
    return res.status(500).json({
      message: "Error hard deleting permission",
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
