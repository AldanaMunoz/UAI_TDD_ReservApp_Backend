import type { Request, Response } from "express";
import EmployeeModel from "../models/EmployeeModel";
import type { IEmployee } from "../interfaces/EmployeeInterface";

/* ===========================================================
   CRUD
   =========================================================== */

/** GET /empleados */
export async function getAllEmployees(_req: Request, res: Response) {
    try {
        const data = await EmployeeModel.find();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener empleados", error });
    }
}

/** GET /empleados/:id */
export async function getEmployeeById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const emp = await EmployeeModel.findById(id);
        if (!emp) return res.status(404).json({ message: "Empleado no encontrado" });
        return res.status(200).json(emp);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener empleado", error });
    }
}

/** GET /empleados/persona/:id_persona */
export async function getEmployeesByPersona(req: Request, res: Response) {
    try {
        const id_persona = Number(req.params.id_persona);
        const list = await EmployeeModel.findByPersona(id_persona);
        return res.status(200).json(list);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener empleados por persona", error });
    }
}

/** POST /empleados */
export async function createEmployee(req: Request, res: Response) {
    try {
        const { id_persona, turno, tipo } = req.body as Partial<IEmployee>;
        if (!id_persona || !turno || !tipo) {
            return res.status(400).json({ message: "id_persona, turno y tipo son requeridos" });
        }
        const created = await EmployeeModel.create({
            id_persona: Number(id_persona),
            turno: turno as IEmployee["turno"],
            tipo: tipo as IEmployee["tipo"],
        } as IEmployee);

        return res.status(201).json(created);
    } catch (error: any) {
        return res.status(500).json({ message: "Error al crear empleado", error: error?.message || error });
    }
}

/** PATCH /empleados/:id */
export async function updateEmployee(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const patch: Partial<IEmployee> = { ...req.body };

        if (patch.id_persona !== undefined) patch.id_persona = Number(patch.id_persona);

        const updated = await EmployeeModel.updatePartial(id, patch);
        if (!updated) return res.status(404).json({ message: "Empleado no encontrado o sin cambios" });

        return res.status(200).json({ message: "Empleado actualizado", employee: updated });
    } catch (error: any) {
        return res.status(500).json({ message: "Error al actualizar empleado", error: error?.message || error });
    }
}

/** DELETE /empleados/hard/:id */
export async function hardDeleteEmployee(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const ok = await EmployeeModel.hardDelete(id);
        if (!ok) return res.status(404).json({ message: "Empleado no encontrado" });
        return res.status(200).json({ message: "Empleado eliminado permanentemente" });
    } catch (error) {
        return res.status(500).json({ message: "Error al eliminar permanentemente empleado", error });
    }
}

/* ===========================================================
   Export agrupado
   =========================================================== */
export default {
    getAllEmployees,
    getEmployeeById,
    getEmployeesByPersona,
    createEmployee,
    updateEmployee,
    hardDeleteEmployee,
};
