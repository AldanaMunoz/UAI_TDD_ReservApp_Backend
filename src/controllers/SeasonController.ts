// src/controllers/SeasonController.ts
import type { Request, Response } from "express";
import SeasonModel from "../models/SeasonModel";
import type { ISeason } from "../interfaces/SeasonInterface";

/* ===========================================================
   CRUD
   =========================================================== */

export async function getAllSeasons(_req: Request, res: Response) {
    try {
        const seasons = await SeasonModel.find();
        return res.status(200).json(seasons);
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener temporadas",
            error,
        });
    }
}

export async function getSeasonById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const season = await SeasonModel.findById(id);
        if (!season) {
            return res.status(404).json({ message: "Temporada no encontrada" });
        }
        return res.status(200).json(season);
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener temporada",
            error,
        });
    }
}

export async function createSeason(req: Request, res: Response) {
    try {
        const { name, year, startDate, endDate } = req.body as Partial<ISeason>;

        // Seguridad extra (además del Joi)
        if (!name || year === undefined || !startDate || !endDate) {
            return res.status(400).json({
                message: "name, year, startDate y endDate son obligatorios",
            });
        }

        const created = await SeasonModel.create({
            name,
            year,
            startDate,
            endDate,
        } as ISeason);

        return res.status(201).json(created);
    } catch (error: any) {
        return res.status(500).json({
            message: "Error al crear temporada",
            error: error?.message || error,
        });
    }
}

export async function updateSeason(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const patch: Partial<ISeason> = { ...req.body };

        const updated = await SeasonModel.updatePartial(id, patch);
        if (!updated) {
            return res
                .status(404)
                .json({ message: "Temporada no encontrada o sin cambios" });
        }

        return res.status(200).json({
            message: "Temporada actualizada",
            season: updated,
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Error al actualizar temporada",
            error: error?.message || error,
        });
    }
}

export async function hardDeleteSeason(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const ok = await SeasonModel.hardDelete(id);
        if (!ok) {
            return res.status(404).json({ message: "Temporada no encontrada" });
        }
        return res.status(200).json({ message: "Temporada eliminada permanentemente" });
    } catch (error) {
        return res.status(500).json({
            message: "Error al eliminar permanentemente temporada",
            error,
        });
    }
}

/* ===========================================================
   Export agrupado
   =========================================================== */
export default {
    getAllSeasons,
    getSeasonById,
    createSeason,
    updateSeason,
    hardDeleteSeason,
};
