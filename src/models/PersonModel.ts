import db from "../db/db";
import type { IPerson } from "../interfaces/PersonInterface";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

const PersonModel = {
    /**
     * Obtener todas las personas
     */
    async find(): Promise<IPerson[]> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT id, id_usuario, nombre, apellido, activo
       FROM personas
       ORDER BY id DESC`
        );
        return rows as unknown as IPerson[];
    },

    /**
     * Buscar una persona por su ID
     */
    async findById(id: string | number): Promise<IPerson | undefined> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT id, id_usuario, nombre, apellido, activo
       FROM personas
       WHERE id = :id`,
            { id: Number(id) }
        );
        return (rows as any[])[0] as IPerson | undefined;
    },

    /**
     * Buscar personas por usuario vinculado (opcional)
     */
    async findByUserId(id_usuario: string | number): Promise<IPerson[]> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT id, id_usuario, nombre, apellido, activo
       FROM personas
       WHERE id_usuario = :id_usuario
       ORDER BY id DESC`,
            { id_usuario: Number(id_usuario) }
        );
        return rows as unknown as IPerson[];
    },

    /**
     * Crear una nueva persona
     */
    async create(person: IPerson, exec: any = db): Promise<IPerson | undefined> {
        const [res] = await exec.execute(
            `INSERT INTO personas (id_usuario, nombre, apellido, activo)
   VALUES (:id_usuario, :nombre, :apellido, :activo)`,
            { id_usuario: person.id_usuario ?? null, nombre: person.nombre, apellido: person.apellido, activo: person.activo ?? 1 }
        );
        const insertId = (res as ResultSetHeader).insertId;

        const [rows] = await exec.execute(
            `SELECT id, id_usuario, nombre, apellido, activo
   FROM personas WHERE id = :id`,
            { id: insertId }
        );
        return (rows as RowDataPacket[] as any[])[0] as IPerson | undefined;
    },

    /**
     * Actualizar una persona parcialmente
     */
    async updatePartial(id: string | number, patch: Partial<IPerson>): Promise<IPerson | undefined> {
        const allowed = ["id_usuario", "nombre", "apellido", "activo"] as const;

        const entries = Object.entries(patch).filter(([k, v]) => allowed.includes(k as any) && v !== undefined);
        if (!entries.length) return this.findById(id);

        const setSql = entries.map(([k]) => `${k} = :${k}`).join(", ");
        const params: any = Object.fromEntries(entries);
        params.id = Number(id);

        await db.execute<ResultSetHeader>(`UPDATE personas SET ${setSql} WHERE id = :id`, params);

        return this.findById(id);
    },

    /**
     * Soft delete = cambia el campo activo (0 = inactivo, 1 = activo)
     */
    async setActivo(id: string | number, activo: 0 | 1): Promise<IPerson | undefined> {
        await db.execute<ResultSetHeader>(`UPDATE personas SET activo = :activo WHERE id = :id`, { id: Number(id), activo });
        return this.findById(id);
    },

    /**
     * Eliminar una persona físicamente de la DB
     */
    async hardDelete(id: string | number): Promise<boolean> {
        const [res] = await db.execute<ResultSetHeader>(`DELETE FROM personas WHERE id = :id`, { id: Number(id) });
        return (res as ResultSetHeader).affectedRows > 0;
    },
};

export default PersonModel;
