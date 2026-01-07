// src/models/FoodTypeModel.ts
import db from "../db/db";
import type { IFoodType } from "../interfaces/FoodTypeInterface";
import type { ResultSetHeader } from "mysql2";

const TABLE = "comidas_tipos";

const FoodTypeModel = {
    /** List all food types */
    async find(exec: any = db): Promise<IFoodType[]> {
        const [rows] = await exec.execute(
            `SELECT id,
                    nombre      AS name,
                    descripcion AS description
             FROM ${TABLE}
             ORDER BY id DESC`
        );
        return rows as unknown as IFoodType[];
    },

    /** Find by ID */
    async findById(id: number | string, exec: any = db): Promise<IFoodType | undefined> {
        const [rows] = await exec.execute(
            `SELECT id,
                    nombre      AS name,
                    descripcion AS description
             FROM ${TABLE}
             WHERE id = :id`,
            { id: Number(id) }
        );

        // Devuelvo explícitamente el primer registro o undefined
        const list = rows as IFoodType[];
        if (!list.length) return undefined;
        return list[0];
    },

    /** Create */
    async create(foodType: IFoodType, exec: any = db): Promise<IFoodType | undefined> {
        const [res] = await exec.execute(
            `INSERT INTO ${TABLE} (nombre, descripcion)
             VALUES (:name, :description)`,
            {
                name: foodType.name,
                description: foodType.description ?? null,
            }
        );

        const insertId = (res as ResultSetHeader).insertId;

        const [rows] = await exec.execute(
            `SELECT id,
                    nombre      AS name,
                    descripcion AS description
             FROM ${TABLE}
             WHERE id = :id`,
            { id: insertId }
        );

        const list = rows as IFoodType[];
        if (!list.length) return undefined;
        return list[0];
    },

    /** Partial update (PATCH) */
    async updatePartial(
        id: number | string,
        patch: Partial<IFoodType>,
        exec: any = db
    ): Promise<IFoodType | undefined> {
        // Campos permitidos a actualizar (del modelo)
        const allowed: (keyof IFoodType)[] = ["name", "description"];

        const entries = Object.entries(patch).filter(
            ([key, value]) => allowed.includes(key as keyof IFoodType) && value !== undefined
        );

        if (!entries.length) {
            // Si no hay cambios válidos, devuelvo el registro actual
            return this.findById(id, exec);
        }

        // Mapeo campos del modelo → columnas reales en BD
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

export default FoodTypeModel;
