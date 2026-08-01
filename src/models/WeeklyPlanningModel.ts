import db from "../db/db";
import type { ResultSetHeader } from "mysql2";
import type { IWeeklyPlanning } from "../interfaces/WeeklyPlanningInterface";

const TABLE = "planificaciones_semanales";

export interface WeeklyPlanningWeek {
  id: number;
  seasonId: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
}

export interface DayMealAssignments {
  entradaId: number | null;
  principalId: number | null;
  alternativoId: number | null;
  vegetarianoId: number | null;
  postreId: number | null;
  bebidaId: number | null;
}

const WeeklyPlanningModel = {
  async find(exec: any = db): Promise<IWeeklyPlanning[]> {
    const [rows] = await exec.execute(
      `SELECT
        id,
        id_temporada AS seasonId,
        nro_semana   AS weekNumber,
        dia_semana   AS weekDay,
        fecha        AS date
      FROM ${TABLE}
      ORDER BY fecha ASC`
    );
    return rows as unknown as IWeeklyPlanning[];
  },

  async findById(id: number | string, exec: any = db): Promise<IWeeklyPlanning | undefined> {
    const [rows] = await exec.execute(
      `SELECT
        id,
        id_temporada AS seasonId,
        nro_semana   AS weekNumber,
        dia_semana   AS weekDay,
        fecha        AS date
      FROM ${TABLE}
      WHERE id = :id`,
      { id: Number(id) }
    );

    const list = rows as IWeeklyPlanning[];
    return list.length ? list[0] : undefined;
  },

  async findWeeksBySeason(seasonId: number, exec: any = db): Promise<WeeklyPlanningWeek[]> {
    const [rows] = await exec.execute(
      `SELECT
        MIN(id) AS id,
        id_temporada AS seasonId,
        nro_semana AS weekNumber,
        DATE_FORMAT(MIN(fecha), '%Y-%m-%d') AS startDate,
        DATE_FORMAT(MAX(fecha), '%Y-%m-%d') AS endDate
      FROM ${TABLE}
      WHERE id_temporada = :seasonId
      GROUP BY id_temporada, nro_semana
      ORDER BY nro_semana ASC`,
      { seasonId }
    );
    return rows as WeeklyPlanningWeek[];
  },

  async findMealAssignments(
    seasonId: number,
    weekNumber: number,
    exec: any = db
  ): Promise<Record<number, DayMealAssignments>> {
    const [rows] = await exec.execute(
      `SELECT
        ps.dia_semana AS weekDay,
        cps.id_comida_entrada AS entradaId,
        cps.id_comida_principal AS principalId,
        cps.id_comida_alternativo AS alternativoId,
        cps.id_comida_vegetariana AS vegetarianoId,
        cps.id_comida_postre AS postreId,
        cps.id_comida_bebida AS bebidaId
      FROM ${TABLE} ps
      LEFT JOIN comidas_planificacion_semanal cps
        ON cps.id = (
          SELECT MAX(latest.id)
          FROM comidas_planificacion_semanal latest
          WHERE latest.id_planificacion_semanal = ps.id
        )
      WHERE ps.id_temporada = :seasonId
        AND ps.nro_semana = :weekNumber
      ORDER BY ps.dia_semana ASC, ps.id DESC`,
      { seasonId, weekNumber }
    );

    const result: Record<number, DayMealAssignments> = {};
    for (const row of rows as any[]) {
      if (result[row.weekDay]) continue;
      result[row.weekDay] = {
        entradaId: row.entradaId ?? null,
        principalId: row.principalId ?? null,
        alternativoId: row.alternativoId ?? null,
        vegetarianoId: row.vegetarianoId ?? null,
        postreId: row.postreId ?? null,
        bebidaId: row.bebidaId ?? null,
      };
    }
    return result;
  },

  async create(data: IWeeklyPlanning, exec: any = db): Promise<IWeeklyPlanning | undefined> {
    const [res] = await exec.execute(
      `INSERT INTO ${TABLE} (id_temporada, nro_semana, dia_semana, fecha)
       VALUES (:seasonId, :weekNumber, :weekDay, :date)`,
      {
        seasonId: data.seasonId,
        weekNumber: data.weekNumber,
        weekDay: data.weekDay,
        date: data.date,
      }
    );

    const insertId = (res as ResultSetHeader).insertId;
    return this.findById(insertId, exec);
  },

  async updatePartial(
    id: number | string,
    patch: Partial<IWeeklyPlanning>,
    exec: any = db
  ): Promise<IWeeklyPlanning | undefined> {
    const entries: Array<[string, any]> = [];
    if (patch.seasonId !== undefined) entries.push(["id_temporada", patch.seasonId]);
    if (patch.weekNumber !== undefined) entries.push(["nro_semana", patch.weekNumber]);
    if (patch.weekDay !== undefined) entries.push(["dia_semana", patch.weekDay]);
    if (patch.date !== undefined) entries.push(["fecha", patch.date]);

    if (!entries.length) return this.findById(id, exec);

    const setSql = entries.map(([col], idx) => `${col} = :v${idx}`).join(", ");
    const params: any = { id: Number(id) };
    entries.forEach(([, val], idx) => (params[`v${idx}`] = val));

    await exec.execute(
      `UPDATE ${TABLE}
       SET ${setSql}
       WHERE id = :id`,
      params
    );

    return this.findById(id, exec);
  },

  async hardDelete(id: number | string, exec: any = db): Promise<boolean> {
    const [res] = await exec.execute(
      `DELETE FROM ${TABLE}
       WHERE id = :id`,
      { id: Number(id) }
    );

    return (res as ResultSetHeader).affectedRows > 0;
  },
};

export default WeeklyPlanningModel;
