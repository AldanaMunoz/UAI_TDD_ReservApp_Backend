import db from "../db/db";
import type { ResultSetHeader } from "mysql2";
import type { IWeeklyPlanning } from "../interfaces/WeeklyPlanningInterface";

const TABLE = "planificaciones_semanales";

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
