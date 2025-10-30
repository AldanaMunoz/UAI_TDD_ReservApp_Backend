import db from "../db/db";
import type { IEmployee } from "../interfaces/EmployeeInterface";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

const TABLE = "empleados";

const EmployeeModel = {
    /** Listar */
    async find(): Promise<IEmployee[]> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT id, id_persona, turno, tipo
       FROM ${TABLE}
       ORDER BY id DESC`
        );
        return rows as unknown as IEmployee[];
    },

    /** Por ID */
    async findById(id: string | number): Promise<IEmployee | undefined> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT id, id_persona, turno, tipo
       FROM ${TABLE}
       WHERE id = :id`,
            { id: Number(id) }
        );
        return (rows as any[])[0] as IEmployee | undefined;
    },

    /** Por persona (FK) */
    async findByPersona(id_persona: string | number): Promise<IEmployee[]> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT id, id_persona, turno, tipo
       FROM ${TABLE}
       WHERE id_persona = :id_persona
       ORDER BY id DESC`,
            { id_persona: Number(id_persona) }
        );
        return rows as unknown as IEmployee[];
    },

    /** Crear */
    async create(emp: IEmployee, exec: any = db): Promise<IEmployee | undefined> {
        const [res] = await exec.execute(
            `INSERT INTO empleados (id_persona, turno, tipo)
       VALUES (:id_persona, :turno, :tipo)`,
            {
                id_persona: emp.id_persona,
                turno: emp.turno,
                tipo: emp.tipo,
            }
        );

        // SELECT por insertId
        const [rows] = await exec.execute(
            `SELECT id, id_persona, turno, tipo
       FROM empleados
       WHERE id = :id`,
            { id: (res as ResultSetHeader).insertId }
        );

        return (rows as RowDataPacket[] as any[])[0] as IEmployee | undefined;
    },

    /** Update parcial */
    async updatePartial(id: string | number, patch: Partial<IEmployee>): Promise<IEmployee | undefined> {
        const allowed = ["id_persona", "turno", "tipo"] as const;

        const entries = Object.entries(patch).filter(([k, v]) => allowed.includes(k as any) && v !== undefined);
        if (!entries.length) return this.findById(id);

        const setSql = entries.map(([k]) => `${k} = :${k}`).join(", ");
        const params: any = Object.fromEntries(entries);
        params.id = Number(id);

        await db.execute<ResultSetHeader>(`UPDATE ${TABLE} SET ${setSql} WHERE id = :id`, params);

        return this.findById(id);
    },

    /** Hard delete */
    async hardDelete(id: string | number): Promise<boolean> {
        const [res] = await db.execute<ResultSetHeader>(`DELETE FROM ${TABLE} WHERE id = :id`, { id: Number(id) });
        return (res as ResultSetHeader).affectedRows > 0;
    },
};

export default EmployeeModel;
