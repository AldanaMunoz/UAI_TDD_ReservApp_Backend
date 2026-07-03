// src/models/SeasonModel.ts
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "../db/db";
import type { ISeason } from "../interfaces/SeasonInterface";

const TABLE = "temporadas";

function mapRow(row: any): ISeason {
    return {
        id: row.id,
        stationId: row.stationId,
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
            t.id,
            t.id_estacion AS stationId,
            e.nombre      AS name,
            t.anio        AS year,
            t.fecha_inicio AS startDate,
            t.fecha_fin    AS endDate
        FROM ${TABLE} t
        INNER JOIN estaciones e ON e.id = t.id_estacion
        ORDER BY year DESC, startDate ASC
        `
    );
    return rows.map(mapRow);
}

export async function findById(id: number): Promise<ISeason | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `
        SELECT
            t.id,
            t.id_estacion AS stationId,
            e.nombre      AS name,
            t.anio        AS year,
            t.fecha_inicio AS startDate,
            t.fecha_fin    AS endDate
        FROM ${TABLE} t
        INNER JOIN estaciones e ON e.id = t.id_estacion
        WHERE t.id = ?
        `,
        [id]
    );
    if (rows.length === 0) return null;
    return mapRow(rows[0]);
}

export async function create(data: ISeason): Promise<ISeason> {
    const [result] = await pool.execute<ResultSetHeader>(
        `
        INSERT INTO ${TABLE} (id_estacion, anio, fecha_inicio, fecha_fin)
        VALUES (?, ?, ?, ?)
        `,
        [data.stationId, data.year, data.startDate, data.endDate]
    );

    const insertId = result.insertId;
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

    if (patch.stationId !== undefined) {
        fields.push("id_estacion = ?");
        values.push(patch.stationId);
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

    if (result.affectedRows === 0) {
        return null;
    }

    return await findById(id);
}

export async function hardDelete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
        `
        DELETE FROM ${TABLE}
        WHERE id = ?
        `,
        [id]
    );
    return result.affectedRows > 0;
}

export default {
    find,
    findById,
    create,
    updatePartial,
    hardDelete,
};
