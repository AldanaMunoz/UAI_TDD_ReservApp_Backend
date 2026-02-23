import type { Request, Response } from "express";
import SessionLogModel from "../models/SessionLogModel";

function toInt(value: any): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

/**
 * GET /session-logs
 * Query opcional: userId
 */
export async function getAllSessionLogs(req: Request, res: Response) {
  try {
    const userId = req.query.userId ? toInt(req.query.userId) : null;

    const all = await SessionLogModel.find();

    const filtered = userId ? all.filter((l) => l.userId === userId) : all;

    return res.status(200).json(filtered);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener session logs", error });
  }
}

export async function getSessionLogById(req: Request, res: Response) {
  try {
    const id = toInt(req.params.id);
    if (id === null || id <= 0) return res.status(400).json({ message: "ID inválido" });

    const item = await SessionLogModel.findById(id);
    if (!item) return res.status(404).json({ message: "Session log no encontrado" });

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener session log", error });
  }
}

export default {
  getAllSessionLogs,
  getSessionLogById,
};