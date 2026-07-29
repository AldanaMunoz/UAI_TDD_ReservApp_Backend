import type { Request, Response } from "express";
import WeeklyPlanningModel from "../models/WeeklyPlanningModel";
import type { IWeeklyPlanning } from "../interfaces/WeeklyPlanningInterface";
import db from "../db/db";
import SeasonModel from "../models/SeasonModel";
import type { DayMealAssignments } from "../models/WeeklyPlanningModel";

function isDuplicate(e: any) {
  return e?.code === "ER_DUP_ENTRY" || e?.errno === 1062;
}
function isFkMissing(e: any) {
  return e?.code === "ER_NO_REFERENCED_ROW_2" || e?.errno === 1452;
}

export async function getAllWeeklyPlannings(_req: Request, res: Response) {
  try {
    const data = await WeeklyPlanningModel.find();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener planificaciones semanales", error });
  }
}

export async function getWeeklyPlanningById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const item = await WeeklyPlanningModel.findById(id);
    if (!item) return res.status(404).json({ message: "Planificación semanal no encontrada" });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener planificación semanal", error });
  }
}

export async function getWeeklyPlanningsBySeason(req: Request, res: Response) {
  try {
    const seasonId = Number(req.params.seasonId);
    if (!Number.isInteger(seasonId) || seasonId <= 0) {
      return res.status(400).json({ message: "ID de temporada invalido" });
    }
    return res.status(200).json(await WeeklyPlanningModel.findWeeksBySeason(seasonId));
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener semanas de la temporada", error });
  }
}

function toDateOnly(value: string | Date): Date {
  const raw = value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
  return new Date(`${raw}T00:00:00Z`);
}

function formatDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export async function generateWeeklyPlannings(req: Request, res: Response) {
  const seasonId = Number(req.body.seasonId);
  if (!Number.isInteger(seasonId) || seasonId <= 0) {
    return res.status(400).json({ message: "seasonId invalido" });
  }

  try {
    const season = await SeasonModel.findById(seasonId);
    if (!season) return res.status(404).json({ message: "Temporada no encontrada" });

    const start = toDateOnly(season.startDate);
    const end = toDateOnly(season.endDate);
    let weekNumber = 1;
    let generated = 0;
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();
      for (const date = new Date(start); date <= end; date.setUTCDate(date.getUTCDate() + 1)) {
        const jsDay = date.getUTCDay();
        if (jsDay === 0 || jsDay === 6) continue;
        const weekDay = jsDay;
        const [result] = await conn.execute(
          `INSERT INTO planificaciones_semanales (id_temporada, nro_semana, dia_semana, fecha)
           SELECT :seasonId, :weekNumber, :weekDay, :date
           WHERE NOT EXISTS (
             SELECT 1 FROM planificaciones_semanales
             WHERE id_temporada = :seasonId AND fecha = :date
           )`,
          { seasonId, weekNumber, weekDay, date: formatDateOnly(date) }
        );
        generated += (result as any).affectedRows;
        if (jsDay === 5) weekNumber += 1;
      }
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

    const plannings = await WeeklyPlanningModel.findWeeksBySeason(seasonId);
    return res.status(201).json({
      message: generated ? "Planificaciones generadas" : "La temporada ya estaba planificada",
      count: generated,
      plannings,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al generar planificaciones", error });
  }
}

export async function getMealAssignments(req: Request, res: Response) {
  try {
    const seasonId = Number(req.params.seasonId);
    const weekNumber = Number(req.params.weekNumber);
    if (![seasonId, weekNumber].every((value) => Number.isInteger(value) && value > 0)) {
      return res.status(400).json({ message: "Temporada o semana invalida" });
    }
    return res.status(200).json(await WeeklyPlanningModel.findMealAssignments(seasonId, weekNumber));
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener asignaciones", error });
  }
}

export async function saveMealAssignments(req: Request, res: Response) {
  const seasonId = Number(req.body.seasonId);
  const weekNumber = Number(req.body.weekNumber);
  const mealAssignments = req.body.mealAssignments as Record<number, DayMealAssignments>;
  if (![seasonId, weekNumber].every((value) => Number.isInteger(value) && value > 0) || !mealAssignments) {
    return res.status(400).json({ message: "Datos de asignacion invalidos" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const [dayKey, assignment] of Object.entries(mealAssignments)) {
      const weekDay = Number(dayKey);
      if (!Number.isInteger(weekDay) || weekDay < 1 || weekDay > 5) continue;

      const [planningRows] = await conn.execute(
        `SELECT id FROM planificaciones_semanales
         WHERE id_temporada = :seasonId AND nro_semana = :weekNumber AND dia_semana = :weekDay
         ORDER BY id DESC LIMIT 1`,
        { seasonId, weekNumber, weekDay }
      );
      const weeklyPlanningId = (planningRows as any[])[0]?.id;
      if (!weeklyPlanningId) {
        await conn.rollback();
        return res.status(404).json({ message: `No existe planificacion para el dia ${weekDay}` });
      }

      const params = {
        weeklyPlanningId,
        entradaId: assignment.entradaId ?? null,
        principalId: assignment.principalId ?? null,
        alternativoId: assignment.alternativoId ?? null,
        vegetarianoId: assignment.vegetarianoId ?? null,
      };
      const [existingRows] = await conn.execute(
        `SELECT id FROM comidas_planificacion_semanal
         WHERE id_planificacion_semanal = :weeklyPlanningId ORDER BY id DESC LIMIT 1`,
        { weeklyPlanningId }
      );
      const existingId = (existingRows as any[])[0]?.id;
      if (existingId) {
        await conn.execute(
          `UPDATE comidas_planificacion_semanal SET
            id_comida_entrada = :entradaId,
            id_comida_principal = :principalId,
            id_comida_alternativo = :alternativoId,
            id_comida_vegetariana = :vegetarianoId
           WHERE id = :existingId`,
          { ...params, existingId }
        );
      } else {
        await conn.execute(
          `INSERT INTO comidas_planificacion_semanal
            (id_planificacion_semanal, id_comida_entrada, id_comida_principal, id_comida_alternativo, id_comida_vegetariana)
           VALUES (:weeklyPlanningId, :entradaId, :principalId, :alternativoId, :vegetarianoId)`,
          params
        );
      }
    }
    await conn.commit();
    return res.status(200).json({ message: "Asignaciones guardadas correctamente" });
  } catch (error: any) {
    await conn.rollback();
    const status = isFkMissing(error) ? 409 : 500;
    return res.status(status).json({ message: "Error al guardar asignaciones", error: error?.message || error });
  } finally {
    conn.release();
  }
}

export async function createWeeklyPlanning(req: Request, res: Response) {
  try {
    const body = req.body as IWeeklyPlanning;
    const created = await WeeklyPlanningModel.create(body);
    return res.status(201).json(created);
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({ message: "La planificación semanal ya existe (restricción única)", error: error?.message || error });
    }
    if (isFkMissing(error)) {
      return res.status(409).json({ message: "seasonId inválido (FK)", error: error?.message || error });
    }
    return res.status(500).json({ message: "Error al crear planificación semanal", error });
  }
}

export async function updateWeeklyPlanning(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const patch: Partial<IWeeklyPlanning> = { ...req.body };

    const updated = await WeeklyPlanningModel.updatePartial(id, patch);
    if (!updated) return res.status(404).json({ message: "Planificación semanal no encontrada" });

    return res.status(200).json({ message: "Planificación semanal actualizada", weeklyPlanning: updated });
  } catch (error: any) {
    if (isDuplicate(error)) {
      return res.status(409).json({ message: "La planificación semanal ya existe (restricción única)", error: error?.message || error });
    }
    if (isFkMissing(error)) {
      return res.status(409).json({ message: "seasonId inválido (FK)", error: error?.message || error });
    }
    return res.status(500).json({ message: "Error al actualizar planificación semanal", error });
  }
}

export async function hardDeleteWeeklyPlanning(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const ok = await WeeklyPlanningModel.hardDelete(id);
    if (!ok) return res.status(404).json({ message: "Planificación semanal no encontrada" });
    return res.status(200).json({ message: "Planificación semanal eliminada permanentemente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar permanentemente la planificación semanal", error });
  }
}

export default {
  getAllWeeklyPlannings,
  getWeeklyPlanningById,
  getWeeklyPlanningsBySeason,
  generateWeeklyPlannings,
  getMealAssignments,
  saveMealAssignments,
  createWeeklyPlanning,
  updateWeeklyPlanning,
  hardDeleteWeeklyPlanning,
};
