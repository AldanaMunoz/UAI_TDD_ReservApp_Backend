// src/models/FoodRestrictionLinkModel.ts
import db from "../db/db";
import type { ResultSetHeader } from "mysql2";
import type {
  IFoodRestrictionLink,
  IFoodRestrictionLinkView,
} from "../interfaces/FoodRestrictionLinkInterface";

const TABLE = "comida_tiene_restriccion";

const FoodRestrictionLinkModel = {
  /** List all links (joined) */
  async find(exec: any = db): Promise<IFoodRestrictionLinkView[]> {
    const [rows] = await exec.execute(
      `SELECT
                ctr.id,
                ctr.id_comida             AS foodId,
                c.nombre                  AS foodName,
                ctr.id_comida_restriccion AS restrictionId,
                cr.nombre                 AS restrictionName
             FROM ${TABLE} ctr
             INNER JOIN comidas c
                ON c.id = ctr.id_comida
             INNER JOIN comidas_restricciones cr
                ON cr.id = ctr.id_comida_restriccion
             ORDER BY ctr.id DESC`
    );

    return rows as unknown as IFoodRestrictionLinkView[];
  },

  /** Find link by ID (joined) */
  async findById(
    id: number | string,
    exec: any = db
  ): Promise<IFoodRestrictionLinkView | undefined> {
    const [rows] = await exec.execute(
      `SELECT
                ctr.id,
                ctr.id_comida             AS foodId,
                c.nombre                  AS foodName,
                ctr.id_comida_restriccion AS restrictionId,
                cr.nombre                 AS restrictionName
             FROM ${TABLE} ctr
             INNER JOIN comidas c
                ON c.id = ctr.id_comida
             INNER JOIN comidas_restricciones cr
                ON cr.id = ctr.id_comida_restriccion
             WHERE ctr.id = :id`,
      { id: Number(id) }
    );

    const list = rows as IFoodRestrictionLinkView[];
    if (!list.length) return undefined;
    return list[0];
  },

  /** List restrictions by foodId (joined) */
  async findByFoodId(
    foodId: number | string,
    exec: any = db
  ): Promise<IFoodRestrictionLinkView[]> {
    const [rows] = await exec.execute(
      `SELECT
                ctr.id,
                ctr.id_comida             AS foodId,
                c.nombre                  AS foodName,
                ctr.id_comida_restriccion AS restrictionId,
                cr.nombre                 AS restrictionName
             FROM ${TABLE} ctr
             INNER JOIN comidas c
                ON c.id = ctr.id_comida
             INNER JOIN comidas_restricciones cr
                ON cr.id = ctr.id_comida_restriccion
             WHERE ctr.id_comida = :foodId
             ORDER BY cr.nombre ASC`,
      { foodId: Number(foodId) }
    );

    return rows as unknown as IFoodRestrictionLinkView[];
  },

  /** Create link */
  async create(
    link: IFoodRestrictionLink,
    exec: any = db
  ): Promise<IFoodRestrictionLinkView | undefined> {
    const [res] = await exec.execute(
      `INSERT INTO ${TABLE}
                (id_comida, id_comida_restriccion)
             VALUES
                (:foodId, :restrictionId)`,
      {
        foodId: link.foodId,
        restrictionId: link.restrictionId,
      }
    );

    const insertId = (res as ResultSetHeader).insertId;
    return this.findById(insertId, exec);
  },

  /** Partial update (PATCH) */
  async updatePartial(
    id: number | string,
    patch: Partial<IFoodRestrictionLink>,
    exec: any = db
  ): Promise<IFoodRestrictionLinkView | undefined> {
    const allowed: (keyof IFoodRestrictionLink)[] = ["foodId", "restrictionId"];

    const entries = Object.entries(patch).filter(
      ([key, value]) =>
        allowed.includes(key as keyof IFoodRestrictionLink) &&
        value !== undefined
    );

    if (!entries.length) {
      return this.findById(id, exec);
    }

    const columnMap: Record<string, string> = {
      foodId: "id_comida",
      restrictionId: "id_comida_restriccion",
    };

    const setSql = entries
      .map(([key]) => `${columnMap[key]} = :${key}`)
      .join(", ");

    const params = Object.fromEntries(entries) as any;
    params.id = Number(id);

    await exec.execute(
      `UPDATE ${TABLE}
             SET ${setSql}
             WHERE id = :id`,
      params
    );

    return this.findById(id, exec);
  },

  /** Hard delete by ID */
  async hardDelete(id: number | string, exec: any = db): Promise<boolean> {
    const [res] = await exec.execute(
      `DELETE FROM ${TABLE}
             WHERE id = :id`,
      { id: Number(id) }
    );

    return (res as ResultSetHeader).affectedRows > 0;
  },

  /** Hard delete by unique pair (foodId + restrictionId) */
  async hardDeleteByPair(
    foodId: number | string,
    restrictionId: number | string,
    exec: any = db
  ): Promise<boolean> {
    const [res] = await exec.execute(
      `DELETE FROM ${TABLE}
             WHERE id_comida = :foodId
               AND id_comida_restriccion = :restrictionId`,
      {
        foodId: Number(foodId),
        restrictionId: Number(restrictionId),
      }
    );

    return (res as ResultSetHeader).affectedRows > 0;
  },
};

export default FoodRestrictionLinkModel;
