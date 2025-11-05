import type { Request, Response } from "express";
import { createUserBundle } from "../services/UserBundleService";
import db from "../db/db";
import type { RowDataPacket } from "mysql2";

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

/**
 * Obtener todos los roles disponibles
 */
export async function getRoles(_req: Request, res: Response) {
    try {
        const [rows] = await db.execute<RowDataPacket[]>(`SELECT id, nombre FROM roles ORDER BY nombre`);
        return res.status(200).json(rows);
    } catch (error: any) {
        return res.status(500).json({
            message: "Error al obtener roles",
            error: error?.message || error,
        });
    }
}

/**
 * Obtener todos los usuarios con su información completa
 */
export async function getAllUsersWithInfo(_req: Request, res: Response) {
    try {
        const [rows] = await db.execute<RowDataPacket[]>(`
            SELECT
                u.id,
                u.email,
                u.activo,
                p.nombre,
                p.apellido,
                e.turno,
                e.tipo,
                GROUP_CONCAT(r.nombre ORDER BY r.nombre SEPARATOR ', ') as roles
            FROM usuarios u
            LEFT JOIN personas p ON u.id = p.id_usuario
            LEFT JOIN empleados e ON p.id = e.id_persona
            LEFT JOIN usuarios_roles ur ON u.id = ur.id_usuario
            LEFT JOIN roles r ON ur.id_rol = r.id
            GROUP BY u.id, u.email, u.activo, p.nombre, p.apellido, e.turno, e.tipo
            ORDER BY u.id DESC
        `);
        return res.status(200).json(rows);
    } catch (error: any) {
        return res.status(500).json({
            message: "Error al obtener usuarios",
            error: error?.message || error,
        });
    }
}

export default { createUserBundleController, getRoles, getAllUsersWithInfo };
