// src/models/SeasonModel.ts
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import pool from "../db/db";
import type { ISeason } from "../interfaces/SeasonInterface";

const TABLE = "temporadas";

function mapRow(row: any): ISeason {
    return {
        id: row.id,
        name: row.name,
        year: row.year,
        startDate: row.startDate,
        endDate: row.endDate,
    };
}

export async function find(): Promise<ISeason[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `
        SELECT
            id,
            nombre       AS name,
            anio         AS year,
            fecha_inicio AS startDate,
            fecha_fin    AS endDate
        FROM ${TABLE}
        ORDER BY year DESC, startDate ASC
        `
    );
    return rows.map(mapRow);
}

export async function findById(id: number): Promise<ISeason | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `
        SELECT
            id,
            nombre       AS name,
            anio         AS year,
            fecha_inicio AS startDate,
            fecha_fin    AS endDate
        FROM ${TABLE}
        WHERE id = ?
        `,
        [id]
    );
    if (rows.length === 0) return null;
    return mapRow(rows[0]);
}

export async function create(data: ISeason): Promise<ISeason> {
    const [result] = await pool.execute<ResultSetHeader>(
        `
        INSERT INTO ${TABLE} (nombre, anio, fecha_inicio, fecha_fin)
        VALUES (?, ?, ?, ?)
        `,
        [data.name, data.year, data.startDate, data.endDate]
    );

    const insertId = (result as ResultSetHeader).insertId;
    const created = await findById(insertId);
    if (!created) {
        throw new Error("Failed to fetch created season");
    }
    return created;
}

export async function updatePartial(
    id: number,
    patch: Partial<ISeason>
): Promise<ISeason | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (patch.name !== undefined) {
        fields.push("nombre = ?");
        values.push(patch.name);
    }
    if (patch.year !== undefined) {
        fields.push("anio = ?");
        values.push(patch.year);
    }
    if (patch.startDate !== undefined) {
        fields.push("fecha_inicio = ?");
        values.push(patch.startDate);
    }
    if (patch.endDate !== undefined) {
        fields.push("fecha_fin = ?");
        values.push(patch.endDate);
    }

    if (fields.length === 0) {
        // Nada para actualizar
        return null;
    }

    values.push(id);

    const [result] = await pool.execute<ResultSetHeader>(
        `
        UPDATE ${TABLE}
        SET ${fields.join(", ")}
        WHERE id = ?
        `,
        values
    );

    if ((result as ResultSetHeader).affectedRows === 0) {
        return null;
    }

    const updated = await findById(id);
    return updated;
}

export async function hardDelete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
        `
        DELETE FROM ${TABLE}
        WHERE id = ?
        `,
        [id]
    );
    return (result as ResultSetHeader).affectedRows > 0;
}

export default {
    find,
    findById,
    create,
    updatePartial,
    hardDelete,
};
