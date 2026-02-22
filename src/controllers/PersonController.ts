import type { Request, Response } from "express";
import PersonModel from "../models/PersonModel";
import type { IPerson } from "../interfaces/PersonInterface";

/* ===========================================================
   CRUD
   =========================================================== */

/** GET /personas */
export async function getAllPersons(_req: Request, res: Response) {
    try {
        const persons = await PersonModel.find();
        return res.status(200).json(persons);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener personas", error });
    }
}

/** GET /personas/:id */
export async function getPersonById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const person = await PersonModel.findById(id);
        if (!person) return res.status(404).json({ message: "Persona no encontrada" });
        return res.status(200).json(person);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener persona", error });
    }
}

/** POST /personas */
export async function createPerson(req: Request, res: Response) {
    try {
        // Si usás ValidatorMiddleware + Joi, ya llega validado
        const { id_usuario = null, nombre, apellido, activo = 1 } = req.body as Partial<IPerson>;

        // (Redundante si Joi valida) — lo dejo por seguridad
        if (!nombre || !apellido) {
            return res.status(400).json({ message: "nombre y apellido son obligatorios" });
        }

        const created = await PersonModel.create({
            id_usuario: id_usuario ?? null,
            nombre,
            apellido,
            activo: Number(activo) ? 1 : 0,
        } as IPerson);

        return res.status(201).json(created);
    } catch (error: any) {
        return res.status(500).json({
            message: "Error al crear persona",
            error: error?.message || error,
        });
    }
}

/** PATCH /personas/:id */
export async function updatePerson(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        // Normalizo activo si viene (true/false/"1"/"0" → 0/1)
        const patch: Partial<IPerson> = { ...req.body };
        if (patch.activo !== undefined) {
            (patch as any).activo = Number(patch.activo) ? 1 : 0;
        }

        const updated = await PersonModel.updatePartial(id, patch);
        if (!updated) return res.status(404).json({ message: "Persona no encontrada o sin cambios" });

        return res.status(200).json({ message: "Persona actualizada", person: updated });
    } catch (error: any) {
        return res.status(500).json({
            message: "Error al actualizar persona",
            error: error?.message || error,
        });
    }
}



/** DELETE /personas/hard/:id */
export async function hardDeletePerson(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const ok = await PersonModel.hardDelete(id);
        if (!ok) return res.status(404).json({ message: "Persona no encontrada" });
        return res.status(200).json({ message: "Persona eliminada permanentemente" });
    } catch (error) {
        return res.status(500).json({ message: "Error al eliminar permanentemente persona", error });
    }
}

/* ===========================================================
   Export agrupado (consistente con UserController)
   =========================================================== */
export default {
    getAllPersons,
    getPersonById,
    createPerson,
    updatePerson,
    hardDeletePerson,
};
