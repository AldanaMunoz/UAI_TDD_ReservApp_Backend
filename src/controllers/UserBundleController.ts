import type { Request, Response } from "express";
import {
    createUserBundle,
    updateUserBundle,
    deleteUserBundle,
} from "../services/UserBundleService";

/**
 * POST /user-bundle
 */
export async function createUserBundleController(req: Request, res: Response) {
    try {
        const result = await createUserBundle(req.body);
        return res.status(201).json({
            message: "Usuario, persona y empleado creados correctamente",
            result,
        });
    } catch (error: any) {
        const code = error?.code || error?.errorInfo?.code;
        if (code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "El email ya está registrado" });
        }
        return res.status(500).json({
            message: "Error al crear el registro compuesto",
            error: error?.message || error,
        });
    }
}

/**
 * PUT /user-bundle/:id
 * Actualiza el “paquete” completo.
 */
export async function updateUserBundleController(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const result = await updateUserBundle(id, req.body);

        return res.status(200).json({
            message: "Registro compuesto actualizado correctamente",
            result,
        });
    } catch (error: any) {
        const code = error?.code || error?.errorInfo?.code;
        if (code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Email o firebaseUID ya existe" });
        }
        return res.status(500).json({
            message: "Error al actualizar el registro compuesto",
            error: error?.message || error,
        });
    }
}

/**
 * DELETE /user-bundle/:id
 */
export async function deleteUserBundleController(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const result = await deleteUserBundle(id);

        return res.status(200).json({
            message: "Registro compuesto eliminado correctamente",
            result,
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Error al eliminar el registro compuesto",
            error: error?.message || error,
        });
    }
}

export default {
    createUserBundleController,
    updateUserBundleController,
    deleteUserBundleController,
};
