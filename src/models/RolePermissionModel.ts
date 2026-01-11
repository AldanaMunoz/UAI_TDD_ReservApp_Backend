import db from "../db/db";
import type { ResultSetHeader } from "mysql2";
import type {
  IRolePermission,
  IRolePermissionView,
} from "../interfaces/RolePermissionInterface";

const TABLE = "roles_permisos";

const RolePermissionModel = {
  async find(exec: any = db): Promise<IRolePermissionView[]> {
    const [rows] = await exec.execute(
      `SELECT
                rp.id,
                rp.id_rol     AS roleId,
                r.nombre      AS roleName,
                rp.id_permiso AS permissionId,
                p.nombre      AS permissionName,
                p.endpoint_path AS endpointPath
             FROM ${TABLE} rp
             INNER JOIN roles r ON r.id = rp.id_rol
             INNER JOIN permisos p ON p.id = rp.id_permiso
             ORDER BY r.nombre ASC, p.nombre ASC`
    );
    return rows as unknown as IRolePermissionView[];
  },

  async findById(
    id: number | string,
    exec: any = db
  ): Promise<IRolePermissionView | undefined> {
    const [rows] = await exec.execute(
      `SELECT
                rp.id,
                rp.id_rol     AS roleId,
                r.nombre      AS roleName,
                rp.id_permiso AS permissionId,
                p.nombre      AS permissionName,
                p.endpoint_path AS endpointPath
             FROM ${TABLE} rp
             INNER JOIN roles r ON r.id = rp.id_rol
             INNER JOIN permisos p ON p.id = rp.id_permiso
             WHERE rp.id = :id`,
      { id: Number(id) }
    );
    const list = rows as IRolePermissionView[];
    return list.length ? list[0] : undefined;
  },

  async findByRoleId(
    roleId: number | string,
    exec: any = db
  ): Promise<IRolePermissionView[]> {
    const [rows] = await exec.execute(
      `SELECT
                rp.id,
                rp.id_rol     AS roleId,
                r.nombre      AS roleName,
                rp.id_permiso AS permissionId,
                p.nombre      AS permissionName,
                p.endpoint_path AS endpointPath
             FROM ${TABLE} rp
             INNER JOIN roles r ON r.id = rp.id_rol
             INNER JOIN permisos p ON p.id = rp.id_permiso
             WHERE rp.id_rol = :roleId
             ORDER BY p.nombre ASC`,
      { roleId: Number(roleId) }
    );
    return rows as unknown as IRolePermissionView[];
  },

  async create(
    data: IRolePermission,
    exec: any = db
  ): Promise<IRolePermissionView | undefined> {
    const [res] = await exec.execute(
      `INSERT INTO ${TABLE} (id_rol, id_permiso)
             VALUES (:roleId, :permissionId)`,
      { roleId: data.roleId, permissionId: data.permissionId }
    );
    const insertId = (res as ResultSetHeader).insertId;
    return this.findById(insertId, exec);
  },

  async updatePartial(
    id: number | string,
    patch: Partial<IRolePermission>,
    exec: any = db
  ): Promise<IRolePermissionView | undefined> {
    const entries: Array<[string, any]> = [];
    if (patch.roleId !== undefined) entries.push(["id_rol", patch.roleId]);
    if (patch.permissionId !== undefined)
      entries.push(["id_permiso", patch.permissionId]);
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
    roleId: number | string,
    permissionId: number | string,
    exec: any = db
  ): Promise<boolean> {
    const [res] = await exec.execute(
      `DELETE FROM ${TABLE}
             WHERE id_rol = :roleId AND id_permiso = :permissionId`,
      { roleId: Number(roleId), permissionId: Number(permissionId) }
    );
    return (res as ResultSetHeader).affectedRows > 0;
  },
};

export default RolePermissionModel;
