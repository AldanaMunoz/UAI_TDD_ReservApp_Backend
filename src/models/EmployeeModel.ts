import db from "../db/db";
import type { IEmployee } from "../interfaces/EmployeeInterface";
import type { ResultSetHeader } from "mysql2";

const TABLE = "empleados";

const EmployeeModel = {
    /** Listar */
    async find(exec: any = db): Promise<IEmployee[]> {
        const [rows] = await exec.execute(
            `SELECT id, id_persona, turno, tipo
             FROM ${TABLE}
             ORDER BY id DESC`
        );
        return rows as unknown as IEmployee[];
    },

    /** Por ID */
    async findById(id: number | string, exec: any = db): Promise<IEmployee | undefined> {
        const [rows] = await exec.execute(
            `SELECT id, id_persona, turno, tipo
             FROM ${TABLE}
             WHERE id = :id`,
            { id: Number(id) }
        );
        return (rows as any[])[0] as IEmployee | undefined;
    },

    /** Por persona (FK) */
    async findByPersona(id_persona: number | string, exec: any = db): Promise<IEmployee[]> {
        const [rows] = await exec.execute(
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

        const insertId = (res as ResultSetHeader).insertId;

        const [rows] = await exec.execute(
            `SELECT id, id_persona, turno, tipo
             FROM empleados
             WHERE id = :id`,
            { id: insertId }
        );

        return (rows as any[])[0] as IEmployee | undefined;
    },

    /** Update */
    async updatePartial(
        id: number | string,
        patch: Partial<IEmployee>,
        exec: any = db
    ): Promise<IEmployee | undefined> {
        const allowed = ["id_persona", "turno", "tipo"];
        const entries = Object.entries(patch).filter(
            ([k, v]) => allowed.includes(k) && v !== undefined
        );

        if (!entries.length) return this.findById(id, exec);

        const setSql = entries.map(([k]) => `${k} = :${k}`).join(", ");
        const params = Object.fromEntries(entries);
        (params as any).id = Number(id);

        await exec.execute(
            `UPDATE ${TABLE} SET ${setSql} WHERE id = :id`,
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

export default EmployeeModel;
