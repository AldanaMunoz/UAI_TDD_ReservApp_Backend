import db from "../db/db";
import type { ILiquidation } from "../interfaces/LiquidationInterface";
import type { ResultSetHeader } from "mysql2";

const TABLE = "liquidaciones";

const LiquidationModel = {
    /** List all liquidations */
    async find(exec: any = db): Promise<ILiquidation[]> {
        const [rows] = await exec.execute(
            `SELECT
                id,
                mes         AS month,
                anio        AS year,
                monto_total AS totalAmount
             FROM ${TABLE}
             ORDER BY anio DESC, mes DESC, id DESC`
        );

        return rows as unknown as ILiquidation[];
    },

    /** Find by ID */
    async findById(
        id: number | string,
        exec: any = db
    ): Promise<ILiquidation | undefined> {
        const [rows] = await exec.execute(
            `SELECT
                id,
                mes         AS month,
                anio        AS year,
                monto_total AS totalAmount
             FROM ${TABLE}
             WHERE id = :id`,
            { id: Number(id) }
        );

        const list = rows as ILiquidation[];
        if (!list.length) return undefined;
        return list[0];
    },

    /** Find by month/year */
    async findByMonthYear(
        month: number,
        year: number,
        exec: any = db
    ): Promise<ILiquidation | undefined> {
        const [rows] = await exec.execute(
            `SELECT
                id,
                mes         AS month,
                anio        AS year,
                monto_total AS totalAmount
             FROM ${TABLE}
             WHERE mes = :month AND anio = :year
             ORDER BY id DESC
             LIMIT 1`,
            { month: Number(month), year: Number(year) }
        );

        const list = rows as ILiquidation[];
        if (!list.length) return undefined;
        return list[0];
    },

    /** Create */
    async create(liquidation: ILiquidation, exec: any = db): Promise<ILiquidation | undefined> {
        const [res] = await exec.execute(
            `INSERT INTO ${TABLE}
                (mes, anio, monto_total)
             VALUES
                (:month, :year, :totalAmount)`,
            {
                month: liquidation.month,
                year: liquidation.year,
                totalAmount: liquidation.totalAmount ?? 0,
            }
        );

        const insertId = (res as ResultSetHeader).insertId;
        return this.findById(insertId, exec);
    },

    /** Partial update (PATCH) */
    async updatePartial(
        id: number | string,
        patch: Partial<ILiquidation>,
        exec: any = db
    ): Promise<ILiquidation | undefined> {
        const allowed: (keyof ILiquidation)[] = [
            "month",
            "year",
            "totalAmount",
        ];

        const entries = Object.entries(patch).filter(
            ([key, value]) =>
                allowed.includes(key as keyof ILiquidation) && value !== undefined
        );

        if (!entries.length) {
            return this.findById(id, exec);
        }

        const columnMap: Record<string, string> = {
            month: "mes",
            year: "anio",
            totalAmount: "monto_total",
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

export default LiquidationModel;
