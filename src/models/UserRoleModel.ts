import db from "../db/db";
import type { ResultSetHeader } from "mysql2";
import type { IUserRole, IUserRoleView } from "../interfaces/UserRoleInterface";

const TABLE = "usuarios_roles";

const UserRoleModel = {
  async find(exec: any = db): Promise<IUserRoleView[]> {
    const [rows] = await exec.execute(
      `SELECT
                ur.id,
                ur.id_usuario AS userId,
                u.email       AS email,
                ur.id_rol     AS roleId,
                r.nombre      AS roleName
             FROM ${TABLE} ur
             INNER JOIN usuarios u ON u.id = ur.id_usuario
             INNER JOIN roles r ON r.id = ur.id_rol
             ORDER BY u.email ASC, r.nombre ASC`
    );
    return rows as unknown as IUserRoleView[];
  },

  async findById(
    id: number | string,
    exec: any = db
  ): Promise<IUserRoleView | undefined> {
    const [rows] = await exec.execute(
      `SELECT
                ur.id,
                ur.id_usuario AS userId,
                u.email       AS email,
                ur.id_rol     AS roleId,
                r.nombre      AS roleName
             FROM ${TABLE} ur
             INNER JOIN usuarios u ON u.id = ur.id_usuario
             INNER JOIN roles r ON r.id = ur.id_rol
             WHERE ur.id = :id`,
      { id: Number(id) }
    );
    const list = rows as IUserRoleView[];
    return list.length ? list[0] : undefined;
  },

  async findByUserId(
    userId: number | string,
    exec: any = db
  ): Promise<IUserRoleView[]> {
    const [rows] = await exec.execute(
      `SELECT
                ur.id,
                ur.id_usuario AS userId,
                u.email       AS email,
                ur.id_rol     AS roleId,
                r.nombre      AS roleName
             FROM ${TABLE} ur
             INNER JOIN usuarios u ON u.id = ur.id_usuario
             INNER JOIN roles r ON r.id = ur.id_rol
             WHERE ur.id_usuario = :userId
             ORDER BY r.nombre ASC`,
      { userId: Number(userId) }
    );
    return rows as unknown as IUserRoleView[];
  },

  async create(
    data: IUserRole,
    exec: any = db
  ): Promise<IUserRoleView | undefined> {
    const [res] = await exec.execute(
      `INSERT INTO ${TABLE} (id_usuario, id_rol)
             VALUES (:userId, :roleId)`,
      { userId: data.userId, roleId: data.roleId }
    );
    const insertId = (res as ResultSetHeader).insertId;
    return this.findById(insertId, exec);
  },

  async updatePartial(
    id: number | string,
    patch: Partial<IUserRole>,
    exec: any = db
  ): Promise<IUserRoleView | undefined> {
    const entries: Array<[string, any]> = [];
    if (patch.userId !== undefined) entries.push(["id_usuario", patch.userId]);
    if (patch.roleId !== undefined) entries.push(["id_rol", patch.roleId]);
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

  async hardDeleteByPair(
    userId: number | string,
    roleId: number | string,
    exec: any = db
  ): Promise<boolean> {
    const [res] = await exec.execute(
      `DELETE FROM ${TABLE}
             WHERE id_usuario = :userId AND id_rol = :roleId`,
      { userId: Number(userId), roleId: Number(roleId) }
    );
    return (res as ResultSetHeader).affectedRows > 0;
  },
};

export default UserRoleModel;
