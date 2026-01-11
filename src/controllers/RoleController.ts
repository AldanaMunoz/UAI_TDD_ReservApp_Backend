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
    return res.status(500).json({ message: "Error fetching roles", error });
  }
}

export async function getRoleById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const item = await RoleModel.findById(id);
    if (!item) return res.status(404).json({ message: "Role not found" });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching role", error });
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
        message: "Role name already exists",
        error: error?.message || error,
      });
    }
    return res
      .status(500)
      .json({ message: "Error creating role", error: error?.message || error });
  }
}

export async function updateRole(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const patch: Partial<IRole> = { ...req.body };

    const updated = await RoleModel.updatePartial(id, patch);
    if (!updated) return res.status(404).json({ message: "Role not found" });

    return res.status(200).json({ message: "Role updated", role: updated });
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({
        message: "Role name already exists",
        error: error?.message || error,
      });
    }
    return res
      .status(500)
      .json({ message: "Error updating role", error: error?.message || error });
  }
}

export async function hardDeleteRole(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const ok = await RoleModel.hardDelete(id);
    if (!ok) return res.status(404).json({ message: "Role not found" });
    return res.status(200).json({ message: "Role hard deleted" });
  } catch (error: any) {
    if (isFkConflict(error)) {
      return res.status(409).json({
        message:
          "Cannot delete role because it is referenced by usuarios_roles",
        error: error?.message || error,
      });
    }
    return res.status(500).json({
      message: "Error hard deleting role",
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
