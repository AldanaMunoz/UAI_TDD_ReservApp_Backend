// src/models/FoodRestrictionModel.ts
import db from "../db/db";
import type { ResultSetHeader } from "mysql2";
import type {
  IComboOption,
  IFoodRestriction,
} from "../interfaces/FoodRestrictionInterface";

const TABLE = "comidas_restricciones";

const FoodRestrictionModel = {
  /** List all restrictions */
  async find(exec: any = db): Promise<IFoodRestriction[]> {
    const [rows] = await exec.execute(
      `SELECT
                id,
                nombre      AS name,
                descripcion AS description
             FROM ${TABLE}
             ORDER BY nombre ASC`
    );

    return rows as unknown as IFoodRestriction[];
  },

  /** Find by ID */
  async findById(
    id: number | string,
    exec: any = db
  ): Promise<IFoodRestriction | undefined> {
    const [rows] = await exec.execute(
      `SELECT
                id,
                nombre      AS name,
                descripcion AS description
             FROM ${TABLE}
             WHERE id = :id`,
      { id: Number(id) }
    );

    const list = rows as IFoodRestriction[];
    if (!list.length) return undefined;
    return list[0];
  },

  /** Create */
  async create(
    restriction: IFoodRestriction,
    exec: any = db
  ): Promise<IFoodRestriction | undefined> {
    const [res] = await exec.execute(
      `INSERT INTO ${TABLE}
                (nombre, descripcion)
             VALUES
                (:name, :description)`,
      {
        name: restriction.name,
        description: restriction.description ?? null,
      }
    );

    const insertId = (res as ResultSetHeader).insertId;
    return this.findById(insertId, exec);
  },

  /** Partial update (PATCH) */
  async updatePartial(
    id: number | string,
    patch: Partial<IFoodRestriction>,
    exec: any = db
  ): Promise<IFoodRestriction | undefined> {
    const allowed: (keyof IFoodRestriction)[] = ["name", "description"];

    const entries = Object.entries(patch).filter(
      ([key, value]) =>
        allowed.includes(key as keyof IFoodRestriction) && value !== undefined
    );

    if (!entries.length) {
      return this.findById(id, exec);
    }

    const columnMap: Record<string, string> = {
      name: "nombre",
      description: "descripcion",
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

  /** Hard delete */
  async hardDelete(id: number | string, exec: any = db): Promise<boolean> {
    const [res] = await exec.execute(
      `DELETE FROM ${TABLE}
             WHERE id = :id`,
      { id: Number(id) }
    );

    return (res as ResultSetHeader).affectedRows > 0;
  },
};

export default FoodRestrictionModel;
