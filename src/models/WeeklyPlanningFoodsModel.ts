import db from "../db/db";
import type { ResultSetHeader } from "mysql2";
import type { IWeeklyPlanningFood, IWeeklyPlanningFoodView } from "../interfaces/WeeklyPlanningFoodInterface";

const TABLE = "comidas_planificacion_semanal";

const WeeklyPlanningFoodModel = {
  async find(exec: any = db): Promise<IWeeklyPlanningFoodView[]> {
    const [rows] = await exec.execute(
      `SELECT
        cps.id,
        cps.id_planificacion_semanal AS weeklyPlanningId,
        cps.id_comida_entrada        AS entryFoodId,
        e.nombre                     AS entryFoodName,
        cps.id_comida_principal      AS mainFoodId,
        p.nombre                     AS mainFoodName,
        cps.id_comida_alternativo    AS altFoodId,
        a.nombre                     AS altFoodName,
        cps.id_comida_vegetariana    AS vegFoodId,
        v.nombre                     AS vegFoodName
      FROM ${TABLE} cps
      LEFT JOIN comidas e ON e.id = cps.id_comida_entrada
      LEFT JOIN comidas p ON p.id = cps.id_comida_principal
      LEFT JOIN comidas a ON a.id = cps.id_comida_alternativo
      LEFT JOIN comidas v ON v.id = cps.id_comida_vegetariana
      ORDER BY cps.id_planificacion_semanal ASC`
    );
    return rows as unknown as IWeeklyPlanningFoodView[];
  },

  async findById(id: number | string, exec: any = db): Promise<IWeeklyPlanningFoodView | undefined> {
    const [rows] = await exec.execute(
      `SELECT
        cps.id,
        cps.id_planificacion_semanal AS weeklyPlanningId,
        cps.id_comida_entrada        AS entryFoodId,
        e.nombre                     AS entryFoodName,
        cps.id_comida_principal      AS mainFoodId,
        p.nombre                     AS mainFoodName,
        cps.id_comida_alternativo    AS altFoodId,
        a.nombre                     AS altFoodName,
        cps.id_comida_vegetariana    AS vegFoodId,
        v.nombre                     AS vegFoodName
      FROM ${TABLE} cps
      LEFT JOIN comidas e ON e.id = cps.id_comida_entrada
      LEFT JOIN comidas p ON p.id = cps.id_comida_principal
      LEFT JOIN comidas a ON a.id = cps.id_comida_alternativo
      LEFT JOIN comidas v ON v.id = cps.id_comida_vegetariana
      WHERE cps.id = :id`,
      { id: Number(id) }
    );

    const list = rows as IWeeklyPlanningFoodView[];
    return list.length ? list[0] : undefined;
  },

  async findByWeeklyPlanningId(
    weeklyPlanningId: number | string,
    exec: any = db
  ): Promise<IWeeklyPlanningFoodView | undefined> {
    const [rows] = await exec.execute(
      `SELECT
        cps.id,
        cps.id_planificacion_semanal AS weeklyPlanningId,
        cps.id_comida_entrada        AS entryFoodId,
        e.nombre                     AS entryFoodName,
        cps.id_comida_principal      AS mainFoodId,
        p.nombre                     AS mainFoodName,
        cps.id_comida_alternativo    AS altFoodId,
        a.nombre                     AS altFoodName,
        cps.id_comida_vegetariana    AS vegFoodId,
        v.nombre                     AS vegFoodName
      FROM ${TABLE} cps
      LEFT JOIN comidas e ON e.id = cps.id_comida_entrada
      LEFT JOIN comidas p ON p.id = cps.id_comida_principal
      LEFT JOIN comidas a ON a.id = cps.id_comida_alternativo
      LEFT JOIN comidas v ON v.id = cps.id_comida_vegetariana
      WHERE cps.id_planificacion_semanal = :weeklyPlanningId`,
      { weeklyPlanningId: Number(weeklyPlanningId) }
    );

    const list = rows as IWeeklyPlanningFoodView[];
    return list.length ? list[0] : undefined;
  },

  async create(data: IWeeklyPlanningFood, exec: any = db): Promise<IWeeklyPlanningFoodView | undefined> {
    const [res] = await exec.execute(
      `INSERT INTO ${TABLE} (
        id_planificacion_semanal,
        id_comida_entrada,
        id_comida_principal,
        id_comida_alternativo,
        id_comida_vegetariana
      ) VALUES (
        :weeklyPlanningId,
        :entryFoodId,
        :mainFoodId,
        :altFoodId,
        :vegFoodId
      )`,
      {
        weeklyPlanningId: data.weeklyPlanningId,
        entryFoodId: data.entryFoodId ?? null,
        mainFoodId: data.mainFoodId ?? null,
        altFoodId: data.altFoodId ?? null,
        vegFoodId: data.vegFoodId ?? null,
      }
    );

    const insertId = (res as ResultSetHeader).insertId;
    return this.findById(insertId, exec);
  },

  async updatePartial(
    id: number | string,
    patch: Partial<IWeeklyPlanningFood>,
    exec: any = db
  ): Promise<IWeeklyPlanningFoodView | undefined> {
    const entries: Array<[string, any]> = [];
    if (patch.weeklyPlanningId !== undefined) entries.push(["id_planificacion_semanal", patch.weeklyPlanningId]);
    if (patch.entryFoodId !== undefined) entries.push(["id_comida_entrada", patch.entryFoodId ?? null]);
    if (patch.mainFoodId !== undefined) entries.push(["id_comida_principal", patch.mainFoodId ?? null]);
    if (patch.altFoodId !== undefined) entries.push(["id_comida_alternativo", patch.altFoodId ?? null]);
    if (patch.vegFoodId !== undefined) entries.push(["id_comida_vegetariana", patch.vegFoodId ?? null]);

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

export default WeeklyPlanningFoodModel;
