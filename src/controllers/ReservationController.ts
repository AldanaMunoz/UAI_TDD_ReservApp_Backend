// src/controllers/ReservationController.ts
import type { Request, Response } from "express";
import ReservationModel from "../models/ReservationModel";
import type { IReservation } from "../interfaces/ReservationInterface";

/* ===========================================================
   CRUD
   =========================================================== */

export async function getAllReservations(_req: Request, res: Response) {
    try {
        const data = await ReservationModel.find();
        return res.status(200).json(data);
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Error al obtener reservas", error });
    }
}

export async function getReservationById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const reservation = await ReservationModel.findById(id);

        if (!reservation) {
            return res.status(404).json({ message: "Reserva no encontrada" });
        }

        return res.status(200).json(reservation);
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Error al obtener reserva", error });
    }
}

export async function createReservation(req: Request, res: Response) {
    try {
        const body = req.body as IReservation;
        const created = await ReservationModel.create(body);
        return res.status(201).json(created);
    } catch (error: any) {
        return res.status(500).json({
            message: "Error al crear reserva",
            error: error?.message || error,
        });
    }
}

export async function updateReservation(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const patch: Partial<IReservation> = { ...req.body };

        const updated = await ReservationModel.updatePartial(id, patch);

        if (!updated) {
            return res
                .status(404)
                .json({ message: "Reserva no encontrada o sin cambios" });
        }

        return res
            .status(200)
            .json({ message: "Reserva actualizada", reservation: updated });
    } catch (error: any) {
        return res.status(500).json({
            message: "Error al actualizar reserva",
            error: error?.message || error,
        });
    }
}

export async function hardDeleteReservation(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const ok = await ReservationModel.hardDelete(id);

        if (!ok) {
            return res.status(404).json({ message: "Reserva no encontrada" });
        }

        return res.status(200).json({ message: "Reserva eliminada permanentemente" });
    } catch (error) {
        return res.status(500).json({
            message: "Error al eliminar permanentemente la reserva",
            error,
        });
    }
}

export default {
    getAllReservations,
    getReservationById,
    createReservation,
    updateReservation,
    hardDeleteReservation,
};
