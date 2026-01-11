import db from "../db/db";
import type { ResultSetHeader } from "mysql2";
import type { IRole } from "../interfaces/RoleInterface";

const TABLE = "roles";

const RoleModel = {
  async find(exec: any = db): Promise<IRole[]> {
    const [rows] = await exec.execute(
      `SELECT id, nombre AS name
             FROM ${TABLE}
             ORDER BY nombre ASC`
    );
    return rows as unknown as IRole[];
  },

  async findById(
    id: number | string,
    exec: any = db
  ): Promise<IRole | undefined> {
    const [rows] = await exec.execute(
      `SELECT id, nombre AS name
             FROM ${TABLE}
             WHERE id = :id`,
      { id: Number(id) }
    );
    const list = rows as IRole[];
    return list.length ? list[0] : undefined;
  },

  async create(role: IRole, exec: any = db): Promise<IRole | undefined> {
    const [res] = await exec.execute(
      `INSERT INTO ${TABLE} (nombre)
             VALUES (:name)`,
      { name: role.name }
    );
    const insertId = (res as ResultSetHeader).insertId;
    return this.findById(insertId, exec);
  },

  async updatePartial(
    id: number | string,
    patch: Partial<IRole>,
    exec: any = db
  ): Promise<IRole | undefined> {
    if (patch.name === undefined) return this.findById(id, exec);

    await exec.execute(
      `UPDATE ${TABLE}
             SET nombre = :name
             WHERE id = :id`,
      { id: Number(id), name: patch.name }
    );

    return this.findById(id, exec);
  },

  async hardDelete(id: number | string, exec: any = db): Promise<boolean> {
    const [res] = await exec.execute(
      `DELETE FROM ${TABLE}
             WHERE id = :id`,
      { id: Number(id) }
    );
    return (res as ResultSetHeader).affectedRows > 0;
  },
};

export default RoleModel;
