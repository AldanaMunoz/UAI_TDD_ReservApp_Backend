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
      .json({ message: "Error fetching usuarios_roles", error });
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
      .json({ message: "Error fetching roles for user", error });
  }
}

export async function getUserRoleById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const item = await UserRoleModel.findById(id);
    if (!item) return res.status(404).json({ message: "UserRole not found" });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching userRole", error });
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
        message: "UserRole already exists",
        error: error?.message || error,
      });
    }
    if (isFkMissing(error)) {
      return res.status(409).json({
        message: "Invalid userId or roleId (FK)",
        error: error?.message || error,
      });
    }
    return res.status(500).json({
      message: "Error creating userRole",
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
      return res.status(404).json({ message: "UserRole not found" });

    return res
      .status(200)
      .json({ message: "UserRole updated", userRole: updated });
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({
        message: "UserRole already exists",
        error: error?.message || error,
      });
    }
    if (isFkMissing(error)) {
      return res.status(409).json({
        message: "Invalid userId or roleId (FK)",
        error: error?.message || error,
      });
    }
    return res.status(500).json({
      message: "Error updating userRole",
      error: error?.message || error,
    });
  }
}

export async function hardDeleteUserRole(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const ok = await UserRoleModel.hardDelete(id);
    if (!ok) return res.status(404).json({ message: "UserRole not found" });
    return res.status(200).json({ message: "UserRole hard deleted" });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error hard deleting userRole",
      error: error?.message || error,
    });
  }
}

export async function hardDeleteUserRoleByPair(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);
    const roleId = Number(req.params.roleId);

    const ok = await UserRoleModel.hardDeleteByPair(userId, roleId);
    if (!ok) return res.status(404).json({ message: "UserRole not found" });

    return res.status(200).json({ message: "UserRole hard deleted (by pair)" });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error hard deleting userRole (by pair)",
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
