import db from "../db/db";
import type { IFood } from "../interfaces/FoodInterface";
import type { ResultSetHeader } from "mysql2";

const TABLE = "comidas";

const FoodModel = {
    /** List all foods */
    async find(exec: any = db): Promise<IFood[]> {
        const [rows] = await exec.execute(
            `SELECT 
                id,
                id_comida_tipo AS foodTypeId,
                nombre         AS name,
                es_especial    AS isSpecial,
                url_imagen     AS imageUrl,
                activa         AS isActive
             FROM ${TABLE}
             ORDER BY id DESC`
        );

        return rows as unknown as IFood[];
    },

    /** Find by ID */
    async findById(id: number | string, exec: any = db): Promise<IFood | undefined> {
        const [rows] = await exec.execute(
            `SELECT 
                id,
                id_comida_tipo AS foodTypeId,
                nombre         AS name,
                es_especial    AS isSpecial,
                url_imagen     AS imageUrl,
                activa         AS isActive
             FROM ${TABLE}
             WHERE id = :id`,
            { id: Number(id) }
        );

        const list = rows as IFood[];
        if (!list.length) return undefined;
        return list[0];
    },

    /** Create */
    async create(food: IFood, exec: any = db): Promise<IFood | undefined> {
        const [res] = await exec.execute(
            `INSERT INTO ${TABLE}
                (id_comida_tipo, nombre, es_especial, url_imagen, activa)
             VALUES
                (:foodTypeId, :name, :isSpecial, :imageUrl, :isActive)`,
            {
                foodTypeId: food.foodTypeId,
                name: food.name,
                isSpecial: food.isSpecial ?? false,
                imageUrl: food.imageUrl ?? null,
                isActive: food.isActive ?? true,
            }
        );

        const insertId = (res as ResultSetHeader).insertId;
        return this.findById(insertId, exec);
    },

    /** Partial update (PATCH) */
    async updatePartial(
        id: number | string,
        patch: Partial<IFood>,
        exec: any = db
    ): Promise<IFood | undefined> {

        const allowed: (keyof IFood)[] = [
            "foodTypeId",
            "name",
            "isSpecial",
            "imageUrl",
            "isActive",
        ];

        const entries = Object.entries(patch).filter(
            ([key, value]) =>
                allowed.includes(key as keyof IFood) && value !== undefined
        );

        if (!entries.length) {
            return this.findById(id, exec);
        }

        const columnMap: Record<string, string> = {
            foodTypeId: "id_comida_tipo",
            name: "nombre",
            isSpecial: "es_especial",
            imageUrl: "url_imagen",
            isActive: "activa",
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

export default FoodModel;