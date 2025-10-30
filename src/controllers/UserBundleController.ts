import type { Request, Response } from "express";
import { createUserBundle } from "../services/UserBundleService";

/**
 * Controlador para el endpoint compuesto (user + person + employee).
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

export default { createUserBundleController };
