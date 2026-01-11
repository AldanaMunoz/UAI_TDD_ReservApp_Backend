import db from "../db/db";
import type { ResultSetHeader } from "mysql2";
import type { IPermission } from "../interfaces/PermissionInterface";

const TABLE = "permisos";

const PermissionModel = {
  async find(exec: any = db): Promise<IPermission[]> {
    const [rows] = await exec.execute(
      `SELECT id, nombre AS name, endpoint_path AS endpointPath
             FROM ${TABLE}
             ORDER BY nombre ASC`
    );
    return rows as unknown as IPermission[];
  },

  async findById(
    id: number | string,
    exec: any = db
  ): Promise<IPermission | undefined> {
    const [rows] = await exec.execute(
      `SELECT id, nombre AS name, endpoint_path AS endpointPath
             FROM ${TABLE}
             WHERE id = :id`,
      { id: Number(id) }
    );
    const list = rows as IPermission[];
    return list.length ? list[0] : undefined;
  },

  async create(
    p: IPermission,
    exec: any = db
  ): Promise<IPermission | undefined> {
    const [res] = await exec.execute(
      `INSERT INTO ${TABLE} (nombre, endpoint_path)
             VALUES (:name, :endpointPath)`,
      { name: p.name, endpointPath: p.endpointPath }
    );
    const insertId = (res as ResultSetHeader).insertId;
    return this.findById(insertId, exec);
  },

  async updatePartial(
    id: number | string,
    patch: Partial<IPermission>,
    exec: any = db
  ): Promise<IPermission | undefined> {
    const entries: Array<[string, any]> = [];
    if (patch.name !== undefined) entries.push(["nombre", patch.name]);
    if (patch.endpointPath !== undefined)
      entries.push(["endpoint_path", patch.endpointPath]);

    if (!entries.length) return this.findById(id, exec);

    const setSql = entries.map(([col], idx) => `${col} = :v${idx}`).join(", ");
    const params: any = { id: Number(id) };
    entries.forEach(([, val], idx) => (params[`v${idx}`] = val));

    await exec.execute(
      `UPDATE ${TABLE}
             SET ${setSql}
             WHERE id = :id`,
      params
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

export default PermissionModel;
