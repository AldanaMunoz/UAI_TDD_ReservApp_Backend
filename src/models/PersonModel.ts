import db from "../db/db";
import type { IPerson } from "../interfaces/PersonInterface";
import type { ResultSetHeader } from "mysql2";

const PersonModel = {
    /** Listar */
    async find(exec: any = db): Promise<IPerson[]> {
        const [rows] = await exec.execute(
            `SELECT id, id_usuario, nombre, apellido, activo
             FROM personas
             ORDER BY id DESC`
        );
        return rows as unknown as IPerson[];
    },

    /** Por ID */
    async findById(id: number | string, exec: any = db): Promise<IPerson | undefined> {
        const [rows] = await exec.execute(
            `SELECT id, id_usuario, nombre, apellido, activo
             FROM personas
             WHERE id = :id`,
            { id: Number(id) }
        );
        return (rows as any[])[0] as IPerson | undefined;
    },

    /** Buscar por usuario */
    async findByUserId(id_usuario: number | string, exec: any = db): Promise<IPerson[]> {
        const [rows] = await exec.execute(
            `SELECT id, id_usuario, nombre, apellido, activo
             FROM personas
             WHERE id_usuario = :id_usuario
             ORDER BY id DESC`,
            { id_usuario: Number(id_usuario) }
        );
        return rows as unknown as IPerson[];
    },

    /** Crear */
    async create(person: IPerson, exec: any = db): Promise<IPerson | undefined> {
        const [res] = await exec.execute(
            `INSERT INTO personas (id_usuario, nombre, apellido, activo)
             VALUES (:id_usuario, :nombre, :apellido, :activo)`,
            {
                id_usuario: person.id_usuario ?? null,
                nombre: person.nombre,
                apellido: person.apellido,
                activo: person.activo ?? 1,
            }
        );

        const insertId = (res as ResultSetHeader).insertId;

        const [rows] = await exec.execute(
            `SELECT id, id_usuario, nombre, apellido, activo
             FROM personas
             WHERE id = :id`,
            { id: insertId }
        );

        return (rows as any[])[0] as IPerson | undefined;
    },

    /** Update parcial */
    async updatePartial(
        id: number | string,
        patch: Partial<IPerson>,
        exec: any = db
    ): Promise<IPerson | undefined> {
        const allowed = ["id_usuario", "nombre", "apellido", "activo"];
        const entries = Object.entries(patch).filter(
            ([k, v]) => allowed.includes(k) && v !== undefined
        );

        if (!entries.length) return this.findById(id, exec);

        const setSql = entries.map(([k]) => `${k} = :${k}`).join(", ");
        const params = Object.fromEntries(entries);
        (params as any).id = Number(id);

        await exec.execute(
            `UPDATE personas SET ${setSql} WHERE id = :id`,
            params
        );

        return this.findById(id, exec);
    },

    /** Hard delete */
    async hardDelete(id: number | string, exec: any = db): Promise<boolean> {
        const [res] = await exec.execute(
            `DELETE FROM personas WHERE id = :id`,
            { id: Number(id) }
        );
        return (res as ResultSetHeader).affectedRows > 0;
    },
};

export default PersonModel;
